const { supabaseAdmin } = require('../../utils/supabaseAdmin');

const SF10_STORAGE_BUCKET = process.env.SF10_STORAGE_BUCKET || 'sf10-files';

function sanitizeFileName(fileName) {
  return String(fileName || '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Recursively list all files from a storage path, including subdirectories
 */
async function listFilesRecursive(storagePath, maxLevels = 2, currentLevel = 0) {
  if (currentLevel >= maxLevels) {
    return [];
  }

  const { data: items, error: listError } = await supabaseAdmin.storage
    .from(SF10_STORAGE_BUCKET)
    .list(storagePath, {
      limit: 200,
      offset: 0,
    });

  if (listError) {
    console.error('[LIST_SF10_FILES] storage list error at level', currentLevel, { storagePath, error: listError.message });
    return [];
  }

  const files = [];

  // Process each item
  for (const item of items || []) {
    if (!item.name || item.name === '.emptyFolderPlaceholder') {
      continue;
    }

    if (item.id === null) {
      // It's a folder, recurse into it
      const subPath = `${storagePath}/${item.name}`;
      const subFiles = await listFilesRecursive(subPath, maxLevels, currentLevel + 1);
      files.push(...subFiles);
    } else {
      // It's a file
      // Extract learner folder name from path if it exists
      // Path format: grade_7/Luke/Mabawad_Reogie_Akero_P/timestamp_filename.xlsx
      const pathParts = storagePath.split('/');
      const learnerName = pathParts.length > 2 ? decodeURIComponent(pathParts[2]) : null;

      files.push({
        name: item.name,
        path: `${storagePath}/${item.name}`,
        learnerName: learnerName, // Include learner folder name
        size: item.metadata?.size ?? 0,
        createdAt: item.created_at ?? item.updated_at ?? null,
      });
    }
  }

  return files;
}

async function listSf10Files(req, res) {
  const { sectionId } = req.query;

  if (!sectionId || typeof sectionId !== 'string') {
    return res.status(400).json({ error: 'Missing required query parameter: sectionId' });
  }

  const { data: section, error: sectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name, name')
    .eq('id', sectionId.trim())
    .single();

  if (sectionError || !section) {
    return res.status(404).json({ error: 'Section not found.' });
  }

  const sectionName = sanitizeFileName(section.section_name || section.name || 'section');
  const storagePath = `grade_${section.grade_level}/${sectionName}`;

  // Recursively list all files, including those nested in learner folders
  const fileList = await listFilesRecursive(storagePath, 3);

  console.log('[LIST_SF10_FILES] raw list result', { storagePath, count: fileList.length });

  // Sort by date descending
  const sortedFiles = fileList.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return res.status(200).json({
    section: {
      id: section.id,
      grade_level: section.grade_level,
      section_name: section.section_name || section.name,
    },
    files: sortedFiles,
  });
}

module.exports = listSf10Files;
