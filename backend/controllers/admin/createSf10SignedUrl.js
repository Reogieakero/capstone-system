const { supabaseAdmin } = require('../../utils/supabaseAdmin');

const SF10_STORAGE_BUCKET = process.env.SF10_STORAGE_BUCKET || 'sf10-files';
const MAX_EXPIRES_SECONDS = 60 * 10;
const DEFAULT_EXPIRES_SECONDS = 60 * 2;

function isUnsafePath(path) {
  return path.includes('..') || path.startsWith('/') || path.startsWith('\\');
}

async function createSf10SignedUrl(req, res) {
  const { path, expiresIn } = req.body || {};

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Missing required field: path' });
  }

  const normalizedPath = path.trim();

  if (!normalizedPath || isUnsafePath(normalizedPath)) {
    return res.status(400).json({ error: 'Invalid storage path.' });
  }

  const expires = Number(expiresIn);
  const expiresInSeconds = Number.isFinite(expires)
    ? Math.max(30, Math.min(MAX_EXPIRES_SECONDS, Math.floor(expires)))
    : DEFAULT_EXPIRES_SECONDS;

  const { data, error } = await supabaseAdmin.storage
    .from(SF10_STORAGE_BUCKET)
    .createSignedUrl(normalizedPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return res.status(500).json({ error: error?.message || 'Failed to create signed URL.' });
  }

  return res.status(200).json({
    bucket: SF10_STORAGE_BUCKET,
    path: normalizedPath,
    expiresIn: expiresInSeconds,
    signedUrl: data.signedUrl,
  });
}

module.exports = createSf10SignedUrl;
