const { supabaseAdmin } = require('../../utils/supabaseAdmin');

async function updateSection(req, res) {
  const { sectionId } = req.params;
  const { section_name, adviser_id, forceReplaceAdviser = false } = req.body;

  const normalizedSectionId = String(sectionId || '').trim();
  const normalizedSectionName = String(section_name || '').trim();
  const normalizedAdviserId = String(adviser_id || '').trim();

  if (!normalizedSectionId || !normalizedSectionName || !normalizedAdviserId) {
    return res.status(400).json({
      error: 'sectionId, section_name, and adviser_id are required.',
    });
  }

  const { data: existingSection, error: existingSectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name, adviser_id, adviser_name')
    .eq('id', normalizedSectionId)
    .single();

  if (existingSectionError || !existingSection) {
    return res.status(404).json({ error: 'Section was not found.' });
  }

  const { data: duplicateSection, error: duplicateSectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name')
    .eq('grade_level', existingSection.grade_level)
    .ilike('section_name', normalizedSectionName)
    .neq('id', normalizedSectionId)
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

  const adviserName = [adviserProfile.first_name, adviserProfile.middle_name, adviserProfile.last_name]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const { data: assignedSection, error: assignedSectionError } = await supabaseAdmin
    .from('sections')
    .select('id, grade_level, section_name, adviser_id, adviser_name')
    .eq('adviser_id', normalizedAdviserId)
    .neq('id', normalizedSectionId)
    .maybeSingle();

  if (assignedSectionError) {
    return res.status(500).json({ error: assignedSectionError.message });
  }

  let replacedSection = null;
  if (assignedSection) {
    if (!forceReplaceAdviser) {
      return res.status(409).json({
        code: 'ADVISER_ALREADY_ASSIGNED',
        error: 'Selected adviser is already assigned to another section.',
        section: assignedSection,
      });
    }

    if (!existingSection.adviser_id || !existingSection.adviser_name) {
      return res.status(409).json({
        code: 'EDIT_SECTION_REPLACE_REQUIRES_CURRENT_ADVISER',
        error: 'Current section adviser is required before replacing another adviser assignment.',
      });
    }

    const { data: swappedSection, error: swapError } = await supabaseAdmin
      .from('sections')
      .update({
        adviser_id: existingSection.adviser_id,
        adviser_name: existingSection.adviser_name,
      })
      .eq('id', assignedSection.id)
      .select('id, grade_level, section_name, adviser_id, adviser_name')
      .single();

    if (swapError) {
      return res.status(500).json({ error: swapError.message });
    }

    replacedSection = swappedSection;
  }

  const { data: updatedSection, error: updateError } = await supabaseAdmin
    .from('sections')
    .update({
      grade_level: existingSection.grade_level,
      section_name: normalizedSectionName,
      adviser_id: normalizedAdviserId,
      adviser_name: adviserName,
    })
    .eq('id', normalizedSectionId)
    .select('*')
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ section: updatedSection, replacedSection });
}

module.exports = updateSection;
