const { supabaseAdmin } = require('../../utils/supabaseAdmin');

async function createSection(req, res) {
  const { grade_level, section_name, adviser_id } = req.body;
  const normalizedGrade = String(grade_level || '').trim();
  const normalizedSectionName = String(section_name || '').trim();
  const normalizedAdviserId = String(adviser_id || '').trim();

  if (!normalizedGrade || !normalizedSectionName || !normalizedAdviserId) {
    return res.status(400).json({
      error: 'grade_level, section_name, and adviser_id are required.',
    });
  }
  const gradeNumber = Number(normalizedGrade);

  const { data: duplicateSection, error: duplicateSectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name')
    .eq('grade_level', gradeNumber)
    .ilike('section_name', normalizedSectionName)
    .maybeSingle();

  if (duplicateSectionError) {
    return res.status(500).json({ error: duplicateSectionError.message });
  }

  if (duplicateSection) {
    return res.status(409).json({
      code: 'DUPLICATE_GRADE_SECTION',
      error: 'A section with this grade and section name already exists.',
      section: duplicateSection,
    });
  }

  const { data: adviserProfile, error: adviserProfileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, status, first_name, middle_name, last_name')
    .eq('id', normalizedAdviserId)
    .single();
  if (adviserProfileError || !adviserProfile) {
    return res.status(404).json({ error: 'Selected adviser was not found.' });
  }
  if (adviserProfile.role !== 'teacher' || adviserProfile.status !== 'approved') {
    return res.status(400).json({ error: 'Selected adviser must be an approved teacher.' });
  }

  const fullName = [adviserProfile.first_name, adviserProfile.middle_name, adviserProfile.last_name]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const { data: assignedSection, error: assignedSectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name, adviser_id, adviser_name')
    .eq('adviser_id', normalizedAdviserId)
    .maybeSingle();

  if (assignedSectionError) {
    return res.status(500).json({ error: assignedSectionError.message });
  }

  if (assignedSection) {
    return res.status(409).json({
      code: 'ADVISER_ALREADY_ASSIGNED',
      error: 'Selected adviser is already assigned to another section.',
      section: assignedSection,
    });
  }

  const payload = {
    grade_level: gradeNumber,
    section_name: normalizedSectionName,
    adviser_id: normalizedAdviserId,
    adviser_name: fullName,
  };
  const { data: createdSection, error: insertError } = await supabaseAdmin
    .from('sections')
    .insert(payload)
    .select('*')
    .single();
  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }
  return res.status(201).json({ section: createdSection });
}

module.exports = createSection;