const { supabase } = require('../../utils/supabaseClient');
const { supabaseAdmin } = require('../../utils/supabaseAdmin');

async function verifyOtp(req, res) {
  const { email, token } = req.body;

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data?.user?.id) {
    return res.status(500).json({ error: 'Verification succeeded but user data is missing.' });
  }

  if (!data.user.email_confirmed_at) {
    return res.status(400).json({ error: 'Email is not confirmed yet.' });
  }

  const metadata = data.user.user_metadata || {};
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
    {
      id: data.user.id,
      email: data.user.email,
      first_name: metadata.first_name || null,
      middle_name: metadata.middle_name || null,
      last_name: metadata.last_name || null,
      suffix: metadata.suffix || null,
      role: 'teacher',
      status: 'pending',
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  return res.status(200).json({ success: true });
}

module.exports = verifyOtp;