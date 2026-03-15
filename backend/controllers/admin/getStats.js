const { supabaseAdmin } = require('../../utils/supabaseAdmin');
const getVerifiedAuthUserIds = require('./getVerifiedAuthUserIds');

async function getStats(req, res) {
  let verifiedAuthUserIds = [];
  try {
    verifiedAuthUserIds = await getVerifiedAuthUserIds();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  if (verifiedAuthUserIds.length === 0) {
    return res.status(200).json({ total: 0, pending: 0, approved: 0 });
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('status')
    .in('id', verifiedAuthUserIds);

  if (profilesError) {
    return res.status(500).json({ error: profilesError.message });
  }

  const total = profiles?.length || 0;
  const pending = (profiles || []).filter((profile) => profile.status === 'pending').length;
  const approved = (profiles || []).filter((profile) => profile.status === 'approved').length;

  return res.status(200).json({ total, pending, approved });
}

module.exports = getStats;