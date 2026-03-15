const { supabase } = require('../../utils/supabaseClient');

async function register(req, res) {
  const { email, password, firstName, middleName, lastName, suffix } = req.body;

  const { error } = await supabase.auth.signUp({
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

module.exports = register;