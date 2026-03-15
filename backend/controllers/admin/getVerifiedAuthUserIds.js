const { supabaseAdmin } = require('../../utils/supabaseAdmin');

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

module.exports = getVerifiedAuthUserIds;