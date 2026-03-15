const { supabase } = require('../../utils/supabaseClient');
const { supabaseAdmin } = require('../../utils/supabaseAdmin');

async function login(req, res) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, first_name, last_name, role, status')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'Profile not found. Please contact the administrator.' });
  }

  if (profile.status === 'pending') {
    return res.status(403).json({ error: 'Your account is waiting for principal approval.' });
  }

  if (profile.status !== 'approved') {
    return res.status(403).json({
      error: 'Your account has been suspended. Please contact the administrator.',
    });
  }

  const redirectPath = ['admin', 'principal'].includes(profile.role) ? '/admin' : '/';

  return res.status(200).json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    user: {
      id: data.user.id,
      email: data.user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      status: profile.status,
    },
    redirectPath,
  });
}

module.exports = login;