const { supabaseAdmin } = require('../../utils/supabaseAdmin');

async function getSections(req, res) {
  const { data: sections, error } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name, name, adviser_id, adviser_name, created_at, updated_at')
    .order('grade_level', { ascending: true })
    .order('section_name', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ sections: sections || [] });
}

module.exports = getSections;
