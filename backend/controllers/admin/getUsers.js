const { supabaseAdmin } = require('../../utils/supabaseAdmin');
const getVerifiedAuthUserIds = require('./getVerifiedAuthUserIds');

async function getUsers(req, res) {
  let verifiedAuthUserIds = [];
  try {
    verifiedAuthUserIds = await getVerifiedAuthUserIds();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  if (verifiedAuthUserIds.length === 0) {
    return res.status(200).json({ users: [] });
  }

  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, first_name, middle_name, last_name, role, status, created_at')
    .in('id', verifiedAuthUserIds)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ users });
}

module.exports = getUsers;