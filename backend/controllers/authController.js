const { supabase } = require('../utils/supabaseClient');
const { supabaseAdmin } = require('../utils/supabaseAdmin');

// POST /api/auth/register
async function register(req, res) {
  const { email, password, firstName, middleName, lastName, suffix } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix,
      },
    },
  });

  if (error) {
    console.error('Supabase signUp error:', error);

    if (error.code === 'over_email_send_rate_limit') {
      return res.status(429).json({
        error: 'Too many email requests. Please wait before requesting another verification code.',
        code: error.code,
        retryAfterSeconds: 60,
      });
    }

    return res.status(error.status || 400).json({
      error: error.message,
      code: error.code || 'registration_failed',
    });
  }

  return res.status(200).json({ success: true });
}

// POST /api/auth/login
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

// POST /api/auth/verify-otp
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

module.exports = { register, login, verifyOtp };
