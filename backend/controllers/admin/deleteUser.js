const { supabaseAdmin } = require('../../utils/supabaseAdmin');

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
      message: 'User account and profile removed successfully.',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = deleteUser;