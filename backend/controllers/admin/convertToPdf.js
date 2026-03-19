// backend/controllers/admin/convertToPdf.js

const { exec } = require('child_process');
const { promisify } = require('util');
const { writeFile, readFile, unlink, rmdir, mkdtemp } = require('fs/promises');
const { join } = require('path');
const { tmpdir, platform } = require('os');

const execAsync = promisify(exec);

/**
 * Finds the LibreOffice executable path.
 * On Windows it's not in PATH by default so we check common install locations.
 */
function getLibreOfficePath() {
  if (platform() === 'win32') {
    const candidates = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      'C:\\Users\\Akiro\\Downloads\\LibreOffice\\program\\soffice.exe',
    ];
    return candidates[0];
  }
  return 'libreoffice';
}

const LIBRE_OFFICE = getLibreOfficePath();

async function convertToPdf(req, res) {
  let tmpDir = null;
  let xlsxPath = null;
  let pdfPath = null;

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing url' });
    }

    // 1. Fetch the xlsx from the signed URL (Node 22 has built-in fetch)
    const fileRes = await fetch(url);
    if (!fileRes.ok) {
      return res.status(502).json({ error: `Failed to fetch file: ${fileRes.status}` });
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    console.log('[convertToPdf] fetched file, size:', buffer.length);

    // 2. Write to a unique temp directory
    tmpDir = await mkdtemp(join(tmpdir(), 'sf10-'));
    xlsxPath = join(tmpDir, 'input.xlsx');
    await writeFile(xlsxPath, buffer);
    console.log('[convertToPdf] wrote xlsx to:', xlsxPath);

    // 3. Convert with LibreOffice headless
    const cmd = `"${LIBRE_OFFICE}" --headless --convert-to pdf --outdir "${tmpDir}" "${xlsxPath}"`;
    console.log('[convertToPdf] running:', cmd);
    const { stdout, stderr } = await execAsync(cmd, { timeout: 60_000 });
    console.log('[convertToPdf] stdout:', stdout);
    if (stderr) console.log('[convertToPdf] stderr:', stderr);

    // 4. Read the output PDF
    pdfPath = join(tmpDir, 'input.pdf');
    const pdfBuffer = await readFile(pdfPath);
    console.log('[convertToPdf] pdf size:', pdfBuffer.length);

    // 5. Send PDF inline — no download prompt
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(pdfBuffer);

  } catch (err) {
    console.error('[convertToPdf] ERROR:', err?.message);
    console.error('[convertToPdf] STACK:', err?.stack);
    return res.status(500).json({ error: err?.message || 'Conversion failed' });
  } finally {
    if (xlsxPath) await unlink(xlsxPath).catch(() => {});
    if (pdfPath) await unlink(pdfPath).catch(() => {});
    if (tmpDir) await rmdir(tmpDir).catch(() => {});
  }
}

module.exports = { convertToPdf };