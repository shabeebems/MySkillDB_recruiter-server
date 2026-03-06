/**
 * Prompt for AI to suggest skills to add to a CV profile based on job requirements.
 * Suggests relevant skills for the job; no assessment check required.
 */
export function buildSuggestSkillsForProfilePrompt(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  jobSkillNames: string[],
  currentProfileSkills: string[]
): string {
  const skillsBlock =
    jobSkillNames.length > 0
      ? jobSkillNames.map((s) => `- ${s}`).join("\n")
      : "No skills listed for this job (suggest based on title and description only).";

  const currentSkills =
    currentProfileSkills.length > 0
      ? currentProfileSkills.join(", ")
      : "None listed yet.";

  return `You are an expert career coach helping a candidate tailor their CV to a specific job. Suggest skills relevant to this job that the candidate should add to their profile.

**Job:**
- Title: ${jobTitle}
- Company: ${companyName}
- Description:
${jobDescription || "No description provided."}

**Skills associated with this job (prefer these names when suggesting):**
${skillsBlock}

**Skills already on the candidate's profile (do NOT suggest these again):**
${currentSkills}

**Your task:**
Suggest skills the candidate should ADD to their profile. Important:
1. Suggest skills that are relevant to the job (from the job description and/or the job's skill list).
2. Use exact skill names from the job's skill list when possible; otherwise use clear, standard names (e.g. "React", "Python", "Project Management").
3. Do NOT suggest skills already in "Skills already on the candidate's profile".
4. Prefer a focused list (e.g. 3–10 skills) that would strengthen their CV for this role.

**Return ONLY valid JSON in this exact format, no other text:**
{"suggestedSkills": ["Skill One", "Skill Two", "Skill Three"]}`;
}
