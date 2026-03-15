const { supabaseAdmin } = require('../../utils/supabaseAdmin');

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

module.exports = approveUser;