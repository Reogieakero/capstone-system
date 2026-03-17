const XLSX = require('xlsx');
const { supabaseAdmin } = require('../../utils/supabaseAdmin');

const SF10_STORAGE_BUCKET = process.env.SF10_STORAGE_BUCKET || 'sf10-files';
const INVALID_SECTION_TERMS = [
  'general average',
  'school year',
  'name of adviser',
  'name of adviser teacher',
  'signature',
  'district',
  'division',
  'region',
  'school id',
  'remarks',
  'quarterly rating',
  'learning areas',
  'final rating',
  'school',
  'citation',
  'address of school',
];

function logSf10Debug(stage, details) {
  console.log(`[SF10_UPLOAD] ${stage}`, details);
}

function extractCellText(cell) {
  if (!cell) {
    return '';
  }

  return String(cell.w ?? cell.v ?? '').trim();
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeKey(value) {
  return normalizeText(value).replace(/\s+/g, '');
}

function toCellStrings(workbook) {
  const values = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) {
      return;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      const rowValues = [];

      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[address];
        if (!cell) {
          continue;
        }

        const textValue = extractCellText(cell);
        if (textValue) {
          rowValues.push(textValue);
          values.push(textValue);
        }
      }

      if (rowValues.length > 1) {
        values.push(rowValues.join(' '));
      }
    }
  });

  return values;
}

function toCellEntries(workbook) {
  const entries = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) {
      return;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[address];
        const text = extractCellText(cell);

        if (!text) {
          continue;
        }

        entries.push({
          row,
          col,
          text,
          normalized: normalizeText(text),
        });
      }
    }
  });

  return entries;
}

function buildSheetMetadata(workbook) {
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const merges = Array.isArray(sheet?.['!merges']) ? sheet['!merges'] : [];

    return {
      sheetName,
      sheet,
      merges,
    };
  }).filter((entry) => entry.sheet);
}

function getCellDisplayText(sheet, row, col) {
  if (!sheet || row < 0 || col < 0) {
    return '';
  }

  const directCell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
  return extractCellText(directCell);
}

function getMergedCellDisplayText(sheet, merges, row, col) {
  for (const merge of merges) {
    if (row >= merge.s.r && row <= merge.e.r && col >= merge.s.c && col <= merge.e.c) {
      const mergedCell = sheet[XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c })];
      const mergedText = extractCellText(mergedCell);
      if (mergedText) {
        return mergedText;
      }
    }
  }

  return '';
}

function getDisplayTextFromGrid(sheet, merges, row, col) {
  return getCellDisplayText(sheet, row, col) || getMergedCellDisplayText(sheet, merges, row, col);
}

function toSheetRows(workbook) {
  const rows = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return;
    }

    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
    });

    matrix.forEach((row) => {
      const normalizedRow = (row || []).map((cell) => String(cell || '').trim());
      rows.push(normalizedRow);
    });
  });

  return rows;
}

function extractTextFromXml(content) {
  const xmlStr = Buffer.isBuffer(content)
    ? content.toString('utf8')
    : String(content || '');
  const texts = [];
  const tagRe = /<(?:[a-zA-Z]+:)?t(?:\s[^>]*)?>([^<]{1,400})<\/(?:[a-zA-Z]+:)?t>/g;
  let m;
  while ((m = tagRe.exec(xmlStr)) !== null) {
    const text = m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .trim();
    if (text) texts.push(text);
  }
  return texts;
}

function extractAdditionalWorkbookTexts(workbook) {
  const texts = [];

  if (Array.isArray(workbook.Strings)) {
    workbook.Strings.forEach((s) => {
      const str = String(s.v ?? s.t ?? '').trim();
      if (str) texts.push(str);
    });
  }

  const rawFiles = workbook.files || {};
  Object.keys(rawFiles).forEach((filename) => {
    if (/xl\/(drawings|comments)[^/]*\.xml$/i.test(filename)) {
      try {
        const extracted = extractTextFromXml(rawFiles[filename]);
        texts.push(...extracted);
      } catch (_) {
      }
    }
  });

  return texts;
}

function detectGradeLevel(cellStrings) {
  for (const sourceText of cellStrings) {
    const text = normalizeText(sourceText);
    const gradeMatch = text.match(/(?:^|\b)(?:grade|gr|g)\s*(7|8|9|10|11|12)(?:\b|$)/i);
    if (gradeMatch?.[1]) {
      return gradeMatch[1];
    }
  }

  return null;
}

// Short section-name capture: 1-3 words starting with a letter, stops before
// recognisable SF10 label words (School Year, School ID, Adviser, District …)
const SECTION_VALUE_RE =
  /([a-zA-Z][a-zA-Z0-9\-'\u00C0-\u024F]{0,30}(?:\s+[a-zA-Z][a-zA-Z0-9\-'\u00C0-\u024F]{0,30}){0,2})/;

function detectSectionName(cellStrings) {
  const sectionPatterns = [
    new RegExp(`(?:^|\\b)section\\s*[:\\-]?\\s*${SECTION_VALUE_RE.source}`, 'i'),
    new RegExp(`(?:^|\\b)advisory\\s*[:\\-]?\\s*${SECTION_VALUE_RE.source}`, 'i'),
  ];

  for (const sourceText of cellStrings) {
    const text = String(sourceText || '').trim();

    for (const pattern of sectionPatterns) {
      const match = text.match(pattern);
      const candidate = match?.[1]?.trim();
      if (candidate && isLikelySectionValue(candidate)) {
        return candidate;
      }
    }
  }

  for (const sourceText of cellStrings) {
    const text = String(sourceText || '').trim();
    const fallbackMatch = text.match(
      new RegExp(`grade\\s*(?:7|8|9|10|11|12)\\s*[-\u2013:]\\s*${SECTION_VALUE_RE.source}`, 'i'),
    );
    const candidate = fallbackMatch?.[1]?.trim();
    if (candidate && isLikelySectionValue(candidate)) {
      return candidate;
    }
  }

  return null;
}

function detectFromAdjacentCells(rows) {
  let detectedGrade = null;
  let detectedSectionName = null;

  const gradeLabels = ['classified as grade', 'grade level', 'grade'];
  const sectionLabels = ['section', 'advisory'];
  const stopWords = ['school year', 'name of adviser', 'signature', 'district', 'division', 'region'];

  const isStopWord = (text) => stopWords.some((word) => text.includes(word));

  rows.forEach((row) => {
    if (!row?.length) {
      return;
    }

    for (let i = 0; i < row.length; i += 1) {
      const rawCell = row[i];
      const cell = normalizeText(rawCell);

      if (!detectedGrade) {
        const directGrade = cell.match(/(?:grade|classified as grade|grade level)\s*[:\-]?\s*(7|8|9|10|11|12)\b/i);
        if (directGrade?.[1]) {
          detectedGrade = directGrade[1];
        } else if (gradeLabels.some((label) => cell.includes(label))) {
          for (let j = i + 1; j <= Math.min(i + 3, row.length - 1); j += 1) {
            const next = normalizeText(row[j]);
            const nextGrade = next.match(/^(7|8|9|10|11|12)$/);
            if (nextGrade?.[1]) {
              detectedGrade = nextGrade[1];
              break;
            }
          }
        }
      }

      if (!detectedSectionName) {
        const directSection = String(rawCell || '').match(
          new RegExp(`section\\s*[:\\-]?\\s*${SECTION_VALUE_RE.source}`, 'i'),
        );
        const dsCand = directSection?.[1]?.trim();
        if (dsCand && isLikelySectionValue(dsCand)) {
          detectedSectionName = dsCand;
        } else if (sectionLabels.some((label) => cell.includes(label))) {
          for (let j = i + 1; j <= Math.min(i + 4, row.length - 1); j += 1) {
            const nextRaw = String(row[j] || '').trim();
            const next = normalizeText(nextRaw);

            if (!next || isStopWord(next) || sectionLabels.some((label) => next.includes(label))) {
              continue;
            }

            detectedSectionName = nextRaw;
            break;
          }
        }
      }

      if (detectedGrade && detectedSectionName) {
        return;
      }
    }
  });

  return { detectedGrade, detectedSectionName };
}

function isLikelySectionValue(text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return false;
  }

  if (/^(school|district|division|region|signature|name|classified|grade|section|school year)\b/.test(normalized)) {
    return false;
  }

  if (INVALID_SECTION_TERMS.includes(normalized)) {
    return false;
  }

  return /^[a-z0-9][a-z0-9\s-]{0,40}$/i.test(text.trim());
}

function findMatchingSectionByName(sectionName, sections) {
  const normalizedDetectedSection = normalizeKey(sectionName);

  if (!normalizedDetectedSection) {
    return null;
  }

  return (sections || []).find((section) => {
    const sectionKey = normalizeKey(section.section_name || section.name || '');
    return sectionKey && (
      sectionKey === normalizedDetectedSection ||
      sectionKey.includes(normalizedDetectedSection) ||
      normalizedDetectedSection.includes(sectionKey)
    );
  }) || null;
}

function detectFromCellLayout(entries) {
  let detectedGrade = null;
  let detectedSectionName = null;
  const rowsMap = new Map();

  entries.forEach((entry) => {
    if (!rowsMap.has(entry.row)) {
      rowsMap.set(entry.row, []);
    }

    rowsMap.get(entry.row).push(entry);
  });

  Array.from(rowsMap.values()).forEach((rowEntries) => {
    rowEntries.sort((left, right) => left.col - right.col);
  });

  for (const rowEntries of rowsMap.values()) {
    const joinedText = rowEntries.map((entry) => entry.text).join(' | ');
    const normalizedJoinedText = normalizeText(joinedText);

    if (!detectedGrade) {
      const gradeInRow = normalizedJoinedText.match(/classified as grade\s*(7|8|9|10|11|12)\b|grade level\s*(7|8|9|10|11|12)\b|grade\s*(7|8|9|10|11|12)\b/i);
      const matchedGrade = gradeInRow?.[1] || gradeInRow?.[2] || gradeInRow?.[3];
      if (matchedGrade) {
        detectedGrade = matchedGrade;
      }
    }

    if (!detectedSectionName) {
      const directSection = joinedText.match(
        new RegExp(`section\\s*[:\\-]?\\s*${SECTION_VALUE_RE.source}`, 'i'),
      );
      const layoutCand = directSection?.[1]?.trim();
      if (layoutCand && isLikelySectionValue(layoutCand)) {
        detectedSectionName = layoutCand;
      }
    }

    for (let i = 0; i < rowEntries.length; i += 1) {
      const entry = rowEntries[i];

      if (!detectedGrade && /classified as grade|grade level|^grade$/i.test(entry.normalized)) {
        for (let j = i + 1; j < rowEntries.length; j += 1) {
          const candidate = rowEntries[j].normalized.match(/^(7|8|9|10|11|12)$/);
          if (candidate?.[1]) {
            detectedGrade = candidate[1];
            break;
          }
        }
      }

      if (!detectedSectionName && /(^section$)|(^section\s*:)|advisory/.test(entry.normalized)) {
        for (let j = i + 1; j < rowEntries.length; j += 1) {
          const candidateText = rowEntries[j].text.trim();
          if (isLikelySectionValue(candidateText)) {
            detectedSectionName = candidateText;
            break;
          }
        }
      }
    }

    if (detectedGrade && detectedSectionName) {
      break;
    }
  }

  return { detectedGrade, detectedSectionName };
}

function detectFromLabelNeighborhood(sheetMetadata) {
  let detectedGrade = null;
  let detectedSectionName = null;
  const neighborhoodLogs = [];

  for (const { sheetName, sheet, merges } of sheetMetadata) {
    if (!sheet?.['!ref']) {
      continue;
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const currentText = getDisplayTextFromGrid(sheet, merges, row, col);
        const normalizedCurrentText = normalizeText(currentText);

        if (!normalizedCurrentText) {
          continue;
        }

        if (!detectedGrade && /classified as grade|grade level|^grade$/.test(normalizedCurrentText)) {
          const candidates = [];

          for (let rowOffset = 0; rowOffset <= 2; rowOffset += 1) {
            for (let colOffset = 1; colOffset <= 12; colOffset += 1) {
              const candidateText = getDisplayTextFromGrid(sheet, merges, row + rowOffset, col + colOffset);
              const trimmedCandidate = candidateText.trim();
              if (!trimmedCandidate) {
                continue;
              }

              candidates.push({ row: row + rowOffset, col: col + colOffset, text: trimmedCandidate });
              const gradeMatch = normalizeText(trimmedCandidate).match(/^(7|8|9|10|11|12)$/);
              if (gradeMatch?.[1]) {
                detectedGrade = gradeMatch[1];
                break;
              }
            }

            if (detectedGrade) {
              break;
            }
          }

          neighborhoodLogs.push({
            sheetName,
            type: 'grade_label_scan',
            row,
            col,
            label: currentText,
            candidates,
          });
        }

        if (!detectedSectionName && /(^section$)|(^section\s*:)|advisory/.test(normalizedCurrentText)) {
          const candidates = [];

          for (let rowOffset = 0; rowOffset <= 2; rowOffset += 1) {
            for (let colOffset = 1; colOffset <= 12; colOffset += 1) {
              const candidateText = getDisplayTextFromGrid(sheet, merges, row + rowOffset, col + colOffset);
              const trimmedCandidate = candidateText.trim();
              if (!trimmedCandidate) {
                continue;
              }

              candidates.push({ row: row + rowOffset, col: col + colOffset, text: trimmedCandidate });
              if (isLikelySectionValue(trimmedCandidate)) {
                detectedSectionName = trimmedCandidate;
                break;
              }
            }

            if (detectedSectionName) {
              break;
            }
          }

          neighborhoodLogs.push({
            sheetName,
            type: 'section_label_scan',
            row,
            col,
            label: currentText,
            candidates,
          });
        }

        if (detectedGrade && detectedSectionName) {
          return { detectedGrade, detectedSectionName, neighborhoodLogs };
        }
      }
    }
  }

  return { detectedGrade, detectedSectionName, neighborhoodLogs };
}

function sanitizeFileName(fileName) {
  return String(fileName || 'sf10.xlsx').replace(/[^a-zA-Z0-9._-]/g, '_');
}


function sanitizeLearnerName(name) {
  return String(name || '')
    .replace(/,/g, '') 
    .replace(/\s+/g, '_') 
    .trim();
}

function extractLearnerInfo(rows) {
  let lastName = '';
  let firstName = '';
  let middleName = '';

  rows.forEach((row) => {
    if (!row || row.length < 2) {
      return;
    }

    const rowText = row.join('|').toLowerCase();

    if (rowText.includes('last name') && !lastName) {
      const labelIndex = row.findIndex((cell) => String(cell || '').toLowerCase().includes('last name'));
      if (labelIndex !== -1) {
        for (let i = labelIndex + 1; i < row.length; i += 1) {
          const cell = String(row[i] || '').trim();
          if (cell && !cell.match(/^\s*:?\s*$/)) {
            lastName = cell;
            break;
          }
        }
      }
    }

    if (rowText.includes('first name') && !firstName) {
      const labelIndex = row.findIndex((cell) => String(cell || '').toLowerCase().includes('first name'));
      if (labelIndex !== -1) {
        for (let i = labelIndex + 1; i < row.length; i += 1) {
          const cell = String(row[i] || '').trim();
          if (cell && !cell.match(/^\s*:?\s*$/)) {
            firstName = cell;
            break;
          }
        }
      }
    }

    if (rowText.includes('middle name') && !middleName) {
      const labelIndex = row.findIndex((cell) => String(cell || '').toLowerCase().includes('middle name'));
      if (labelIndex !== -1) {
        for (let i = labelIndex + 1; i < row.length; i += 1) {
          const cell = String(row[i] || '').trim();
          if (cell && !cell.match(/^\s*:?\s*$/)) {
            middleName = cell;
            break;
          }
        }
      }
    }
  });

  if (!lastName || !firstName) {
    return null;
  }

  const middleInitial = middleName ? middleName.charAt(0).toUpperCase() : '';
  const learnerFolder = middleInitial 
    ? `${lastName}, ${firstName} ${middleInitial}`
    : `${lastName}, ${firstName}`;

  return learnerFolder;
}

function buildWorkbookCorpus(cellStrings) {
  return normalizeKey((cellStrings || []).join(' '));
}

function detectSectionFromKnownSections(corpus, sections) {
  let bestMatch = null;

  (sections || []).forEach((section) => {
    const rawName = section.section_name || section.name || '';
    const key = normalizeKey(rawName);

    if (!key || key.length < 2) {
      return;
    }

    if (corpus.includes(key)) {
      if (!bestMatch || key.length > bestMatch.key.length) {
        bestMatch = { section, key };
      }
    }
  });

  return bestMatch?.section || null;
}


function detectFromKnownCells(workbook) {
  let detectedGrade = null;
  let detectedSectionName = null;

  
  const gradeCandidates = ['I22', 'J22', 'H22', 'I21', 'I23', 'K22', 'G22'];
  const sectionCandidates = ['N22', 'O22', 'M22', 'N21', 'N23', 'P22', 'L22'];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const merges = Array.isArray(sheet['!merges']) ? sheet['!merges'] : [];

    const diagLog = {};
    ['H21','I21','J21','K21','H22','I22','J22','K22','H23','I23','J23','K23',
     'L21','M21','N21','O21','P21','L22','M22','N22','O22','P22','L23','M23','N23','O23','P23',
    ].forEach((addr) => {
      const raw = sheet[addr];
      const direct = extractCellText(raw);
      const decoded = XLSX.utils.decode_cell(addr);
      const merged = getMergedCellDisplayText(sheet, merges, decoded.r, decoded.c);
      if (direct || merged) diagLog[addr] = { direct, merged };
    });
    logSf10Debug('known_cell_area_scan', { sheetName, cells: diagLog });

    if (!detectedGrade) {
      for (const addr of gradeCandidates) {
        const decoded = XLSX.utils.decode_cell(addr);
        const text = getDisplayTextFromGrid(sheet, merges, decoded.r, decoded.c);
        const normalized = String(text).trim();
        const gradeMatch = normalized.match(/^(7|8|9|10|11|12)$/) ||
                           normalized.match(/grade\s*(7|8|9|10|11|12)/i);
        const grade = gradeMatch?.[1];
        if (grade) {
          detectedGrade = grade;
          logSf10Debug('known_cell_grade_hit', { addr, text });
          break;
        }
      }
    }

    if (!detectedSectionName) {
      for (const addr of sectionCandidates) {
        const decoded = XLSX.utils.decode_cell(addr);
        const text = getDisplayTextFromGrid(sheet, merges, decoded.r, decoded.c);
        if (text && isLikelySectionValue(text)) {
          detectedSectionName = text;
          logSf10Debug('known_cell_section_hit', { addr, text });
          break;
        }
      }
    }

    if (detectedGrade && detectedSectionName) break;
  }

  return { detectedGrade, detectedSectionName };
}

async function uploadSf10(req, res) {
  const file = req.file;
  const manualSectionId = String(req.body?.sectionId || '').trim();

  logSf10Debug('request_received', {
    hasFile: Boolean(file),
    fileName: file?.originalname || null,
    mimeType: file?.mimetype || null,
    fileSize: file?.size || null,
    manualSectionId: manualSectionId || null,
  });

  if (!file) {
    logSf10Debug('request_rejected', { reason: 'Missing XLSX file.' });
    return res.status(400).json({ error: 'Missing XLSX file.' });
  }

  const isXlsxFile =
    /\.xlsx$/i.test(file.originalname || '') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (!isXlsxFile) {
    logSf10Debug('request_rejected', {
      reason: 'Invalid file type',
      fileName: file.originalname,
      mimeType: file.mimetype,
    });
    return res.status(400).json({ error: 'Invalid file type. Please upload an XLSX file.' });
  }

  try {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      bookFiles: true,
      cellHTML: true,
    });

    const sheetMetadata = buildSheetMetadata(workbook);
    const cellStrings = toCellStrings(workbook);
    const cellEntries = toCellEntries(workbook);
    const rows = toSheetRows(workbook);

    const additionalTexts = extractAdditionalWorkbookTexts(workbook);
    const allTextCorpus = Array.from(new Set([...cellStrings, ...additionalTexts]));
    const workbookCorpus = buildWorkbookCorpus(allTextCorpus);

    logSf10Debug('workbook_parsed', {
      fileName: file.originalname,
      sheetNames: workbook.SheetNames,
      cellStringCount: cellStrings.length,
      additionalTextCount: additionalTexts.length,
      rowCount: rows.length,
      sampleCellStrings: cellStrings.slice(0, 25),
      sampleAdditionalTexts: additionalTexts.slice(0, 25),
      sampleRows: rows.slice(0, 12),
    });

    const knownCellDetection = detectFromKnownCells(workbook);
    const adjacentDetection = detectFromAdjacentCells(rows);
    const layoutDetection = detectFromCellLayout(cellEntries);
    const neighborhoodDetection = detectFromLabelNeighborhood(sheetMetadata);
    let detectedGrade =
      knownCellDetection.detectedGrade ||
      adjacentDetection.detectedGrade ||
      layoutDetection.detectedGrade ||
      neighborhoodDetection.detectedGrade ||
      detectGradeLevel(allTextCorpus);
    let detectedSectionName =
      knownCellDetection.detectedSectionName ||
      adjacentDetection.detectedSectionName ||
      layoutDetection.detectedSectionName ||
      neighborhoodDetection.detectedSectionName ||
      detectSectionName(allTextCorpus);

    const { data: allSections, error: allSectionsError } = await supabaseAdmin
      .from('sections')
      .select('id, grade_level, section_name, name');

    if (allSectionsError) {
      logSf10Debug('sections_fetch_failed', { error: allSectionsError.message });
      return res.status(500).json({ error: allSectionsError.message });
    }

    logSf10Debug('detection_candidates', {
      knownCellDetection,
      adjacentDetection,
      layoutDetection,
      neighborhoodDetection: {
        detectedGrade: neighborhoodDetection.detectedGrade,
        detectedSectionName: neighborhoodDetection.detectedSectionName,
        neighborhoodLogs: neighborhoodDetection.neighborhoodLogs,
      },
      directGradeDetection: detectGradeLevel(allTextCorpus),
      directSectionDetection: detectSectionName(allTextCorpus),
      knownSections: (allSections || []).map((section) => ({
        id: section.id,
        grade_level: section.grade_level,
        section_name: section.section_name || section.name || null,
      })),
    });

    const manualSection = manualSectionId
      ? (allSections || []).find((section) => section.id === manualSectionId)
      : null;

    if (manualSectionId && !manualSection) {
      logSf10Debug('manual_section_not_found', {
        manualSectionId,
      });
      return res.status(404).json({ error: 'Selected section could not be found.' });
    }

    if (manualSection) {
      detectedSectionName = manualSection.section_name || manualSection.name || detectedSectionName;
      detectedGrade = String(manualSection.grade_level || detectedGrade || '');
      logSf10Debug('manual_section_override_applied', {
        manualSectionId,
        detectedGrade,
        detectedSectionName,
      });
    }

    const matchedByCorpus = detectSectionFromKnownSections(workbookCorpus, allSections || []);
    const matchedByDetectedName = detectedSectionName
      ? findMatchingSectionByName(detectedSectionName, allSections || [])
      : null;
    const hasInvalidDetectedSection = detectedSectionName && !isLikelySectionValue(detectedSectionName);

    if (hasInvalidDetectedSection) {
      logSf10Debug('discarding_invalid_section_candidate', {
        detectedSectionName,
        reason: 'Detected section value matches a known non-section label.',
      });
      detectedSectionName = null;
    }

    if (detectedSectionName && !matchedByDetectedName) {
      logSf10Debug('discarding_unmatched_section_candidate', {
        detectedSectionName,
        reason: 'Detected section does not match any known section in database.',
      });
      detectedSectionName = null;
    }

    if (!detectedSectionName && matchedByCorpus) {
      detectedSectionName = matchedByCorpus.section_name || matchedByCorpus.name;
    }

    if (!detectedGrade && matchedByCorpus?.grade_level) {
      detectedGrade = String(matchedByCorpus.grade_level);
    }

    if (detectedSectionName && !detectedGrade) {
      const matchedByName = findMatchingSectionByName(detectedSectionName, allSections || []);

      if (matchedByName?.grade_level) {
        detectedGrade = String(matchedByName.grade_level);
      }
    }

    logSf10Debug('detection_result', {
      detectedGrade,
      detectedSectionName,
      matchedByCorpus: matchedByCorpus
        ? {
            id: matchedByCorpus.id,
            grade_level: matchedByCorpus.grade_level,
            section_name: matchedByCorpus.section_name || matchedByCorpus.name || null,
          }
        : null,
    });

    if ((!detectedGrade || !detectedSectionName) && (allSections || []).length === 1) {
      const fallback = allSections[0];
      detectedGrade = detectedGrade || String(fallback.grade_level);
      detectedSectionName = detectedSectionName || fallback.section_name || fallback.name;
      logSf10Debug('single_section_fallback', {
        reason: 'Detection incomplete; only one section exists in database — auto-routing.',
        fallbackSection: {
          id: fallback.id,
          grade_level: fallback.grade_level,
          section_name: detectedSectionName,
        },
      });
    }

    if (!detectedGrade || !detectedSectionName) {
      logSf10Debug('detection_failed', {
        reason: 'Could not detect grade level or section name from workbook.',
        detectedGrade,
        detectedSectionName,
        neighborhoodLogs: neighborhoodDetection.neighborhoodLogs,
        sampleCellStrings: cellStrings.slice(0, 40),
        sampleRows: rows.slice(0, 20),
      });
      return res.status(422).json({
        error: 'Could not detect grade level or section name from the XLSX file.',
        code: 'SF10_DETECTION_FAILED',
      });
    }

    const { data: gradeSections, error: sectionFetchError } = await supabaseAdmin
      .from('sections')
      .select('id, grade_level, section_name, name')
      .eq('grade_level', Number(detectedGrade));

    if (sectionFetchError) {
      logSf10Debug('grade_sections_fetch_failed', {
        detectedGrade,
        error: sectionFetchError.message,
      });
      return res.status(500).json({ error: sectionFetchError.message });
    }

    const normalizedDetectedSection = normalizeKey(detectedSectionName);

    const matchedSection = manualSection || (gradeSections || []).find((section) => {
      const sectionName = normalizeKey(section.section_name || section.name || '');
      return sectionName === normalizedDetectedSection || sectionName.includes(normalizedDetectedSection);
    });

    logSf10Debug('section_matching', {
      detectedGrade,
      detectedSectionName,
      normalizedDetectedSection,
      gradeSections: (gradeSections || []).map((section) => ({
        id: section.id,
        grade_level: section.grade_level,
        section_name: section.section_name || section.name || null,
        normalized: normalizeKey(section.section_name || section.name || ''),
      })),
      matchedSection: matchedSection
        ? {
            id: matchedSection.id,
            grade_level: matchedSection.grade_level,
            section_name: matchedSection.section_name || matchedSection.name || null,
          }
        : null,
    });

    if (!matchedSection) {
      logSf10Debug('section_match_failed', {
        reason: 'No matching folder found for detected grade and section.',
        detectedGrade,
        detectedSectionName,
      });
      return res.status(404).json({
        error: `No matching folder found for Grade ${detectedGrade} - ${detectedSectionName}.`,
      });
    }

  const learnerFolder = extractLearnerInfo(rows);
  logSf10Debug('learner_extraction', {
    learnerFolder,
    reason: learnerFolder ? 'Learner info extracted successfully' : 'Could not extract learner info from SF10',
  });

  const sanitizedSection = sanitizeFileName(matchedSection.section_name || matchedSection.name || 'section');
  
  const storagePath = learnerFolder
    ? `grade_${detectedGrade}/${sanitizedSection}/${sanitizeLearnerName(learnerFolder)}/${Date.now()}_${sanitizeFileName(file.originalname)}`
    : `grade_${detectedGrade}/${sanitizedSection}/${Date.now()}_${sanitizeFileName(file.originalname)}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(SF10_STORAGE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: false,
    });

  if (uploadError) {
    logSf10Debug('storage_upload_failed', {
      bucket: SF10_STORAGE_BUCKET,
      storagePath,
      error: uploadError.message,
    });
    return res.status(500).json({ error: uploadError.message });
  }

  logSf10Debug('upload_success', {
      bucket: SF10_STORAGE_BUCKET,
      storagePath,
      detectedGrade,
      detectedSectionName,
      matchedSectionId: matchedSection.id,
    });

    return res.status(200).json({
      message: 'SF10 file uploaded and routed successfully.',
      detection: {
        gradeLevel: detectedGrade,
        sectionName: detectedSectionName,
      },
      section: matchedSection,
      storage: {
        bucket: SF10_STORAGE_BUCKET,
        path: storagePath,
      },
    });
  } catch (error) {
    logSf10Debug('unexpected_error', {
      fileName: file?.originalname || null,
      error: error.message || 'Failed to process SF10 file.',
      stack: error.stack,
    });
    return res.status(500).json({ error: error.message || 'Failed to process SF10 file.' });
  }
}

module.exports = uploadSf10;
