/**
 * Prompt template for rewriting a CV section to be ATS-aligned for a specific job.
 * Uses job title, company, description, and parsed skills as context.
 */
export const buildRewriteCvSectionPrompt = (
  section: string,
  currentContent: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  skills: string[]
): string => {
  const skillsBlock =
    skills.length > 0
      ? `**Skills parsed for this job (use relevant keywords where natural):** ${skills.join(", ")}`
      : "**Skills:** Not specified — use standard industry terms for the role.";

  return `You are an expert ATS (Applicant Tracking System) resume writer. Your task is to rewrite ONE section of a CV so it is optimized for the job below, while keeping the candidate's facts and meaning.

**Target job context:**
- **Job title:** ${jobTitle}
- **Company:** ${companyName}
- **Job description:** ${jobDescription}
${skillsBlock}

**CV section to rewrite:** ${section}
**Current content (candidate's text):**
---
${currentContent || "(empty or minimal — you may suggest a short, ATS-friendly version if appropriate)"}
---

**Instructions:**
1. Rewrite ONLY the content above. Do not add headers or labels.
2. Use clear, professional language and keywords from the job description and skills list where they fit naturally.
3. Keep the same factual meaning (same role, company, dates, outcomes) but phrase for ATS and recruiter appeal.
4. Prefer action verbs and quantifiable results where possible.
5. Keep a similar length unless the original is very short or vague — then you may expand slightly.
6. Output ONLY the rewritten text. No explanations, no "Here is the rewritten version:", no markdown. Plain text only.`;
};
