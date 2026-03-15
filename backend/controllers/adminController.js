const { supabaseAdmin } = require('../utils/supabaseAdmin');

async function getVerifiedAuthUserIds() {
  const verifiedIds = new Set();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    users.forEach((authUser) => {
      if (authUser.email_confirmed_at) {
        verifiedIds.add(authUser.id);
      }
    });

    if (users.length < perPage) break;
    page += 1;
  }

  return Array.from(verifiedIds);
}

async function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!callerProfile || !['admin', 'principal'].includes(callerProfile.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = user;
  req.callerProfile = callerProfile;
  next();
}

// GET /api/admin/users
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
    .select('id, email, first_name, last_name, role, status, created_at')
    .in('id', verifiedAuthUserIds)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ users });
}

// POST /api/admin/approve-user
async function approveUser(req, res) {
  const { userId, action } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const { data: authUserData, error: authUserError } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (authUserError || !authUserData?.user) {
    return res.status(404).json({ error: 'Target user not found in authentication records.' });
  }

  if (!authUserData.user.email_confirmed_at) {
    return res.status(400).json({ error: 'User email is not verified yet.' });
  }

  const newStatus = action === 'reject' ? 'rejected' : 'approved';

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ success: true, status: newStatus });
}

// GET /api/admin/stats
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
  const pending = (profiles || []).filter((p) => p.status === 'pending').length;
  const approved = (profiles || []).filter((p) => p.status === 'approved').length;

  return res.status(200).json({ total, pending, approved });
}


async function deleteUser(req, res) {
  const { userId, confirmationUserId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Self-deletion is not permitted.' });
  }

  if (req.callerProfile?.role === 'principal' && confirmationUserId !== userId) {
    return res.status(400).json({
      error: 'Principal confirmation failed. Enter the exact target user ID.',
    });
  }

  try {
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetProfileError || !targetProfile) {
      return res.status(404).json({ error: 'Target user profile not found.' });
    }

    if (['admin', 'principal'].includes(targetProfile.role)) {
      return res.status(403).json({ error: 'Protected account cannot be deleted.' });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) throw deleteError;

    return res.status(200).json({ 
      success: true, 
      message: 'User account and profile removed successfully.' 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { requireAdmin, getUsers, approveUser, getStats, deleteUser };
