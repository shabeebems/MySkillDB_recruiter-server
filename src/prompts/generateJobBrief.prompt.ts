/**
 * Prompt template for generating job brief readable modules
 * Creates a concise, high-impact e-book-style job brief for the MySkillDB platform
 */
export const buildJobBriefPrompt = (
  jobTitle: string,
  companyName: string | undefined,
  jobDescription: string | undefined,
  skills: string[] | undefined
): string => {
  const companyContext = companyName
    ? `**Company Context:** This job is at ${companyName}.`
    : "";

  const jobDescriptionContext = jobDescription
    ? `**Job Description:** ${jobDescription}`
    : "";

  const skillsList =
    skills && skills.length > 0
      ? `**Key Skills for this role:** ${skills.join(", ")}`
      : "";

  return `You are creating a concise, high-impact job brief for the MySkillDB platform.

**Job Title:** ${jobTitle}
${companyContext}
${jobDescriptionContext}
${skillsList}

**Goal:**
Explain the job "${jobTitle}" clearly in 1–2 pages so a student can quickly decide:
"Is this job for me and how do I get started?"

**Target length:** 700–1,000 words total (fits 1–2 pages).
**Tone:** practical, confident, friendly.
**Language:** simple English, no jargon.
**Audience:** students and fresh graduates (18–28).

**Output format:** Structured JSON (not raw markdown). Short paragraphs, bullet points, clear headers. Optimized for mobile reading.

**Structure to follow EXACTLY:**

1. **What This Job Is** (120–150 words)
   - What the job does in simple terms
   - Typical daily responsibilities
   - Where this role exists (companies / industries)

2. **Salary & Growth Snapshot** (100–150 words)
   - Entry-level salary (India-focused, provide realistic ranges in INR)
   - Career growth path (next roles)
   - Long-term potential

3. **Skills You Must Have** (200–250 words)
   - Core skills (must-have) — list each with a short description
   - Tools or software commonly used
   - Clearly mark skills that can be assessed on MySkillDB with a ✅ emoji

4. **How to Start This Career** (200–250 words)
   - What to learn first
   - Beginner-friendly roadmap
   - Certifications, projects, or practice ideas

5. **How MySkillDB Helps** (80–120 words)
   - Skill gap assessment
   - Personalized learning
   - Job readiness and visibility to recruiters
   - Keep it helpful, not salesy

6. **30-Day Starter Plan** (120–150 words)
   - Week 1–4 breakdown
   - Skills to focus on each week
   - Actionable tasks

**Return ONLY valid JSON in this exact format:**
{
  "title": "${jobTitle} – Skills, Salary & Starter Guide",
  "sections": [
    {
      "heading": "What This Job Is",
      "icon": "briefcase",
      "content": "Full markdown content for this section with paragraphs and bullet points"
    },
    {
      "heading": "Salary & Growth Snapshot",
      "icon": "chart-line",
      "content": "Full markdown content for this section"
    },
    {
      "heading": "Skills You Must Have",
      "icon": "tools",
      "content": "Full markdown content with bullet points. Use ✅ to mark MySkillDB-assessable skills"
    },
    {
      "heading": "How to Start This Career",
      "icon": "rocket",
      "content": "Full markdown content with roadmap and bullet points"
    },
    {
      "heading": "How MySkillDB Helps",
      "icon": "graduation-cap",
      "content": "Full markdown content"
    },
    {
      "heading": "30-Day Starter Plan",
      "icon": "calendar-alt",
      "content": "Full markdown content with week-by-week breakdown"
    }
  ],
  "metadata": {
    "wordCount": 850,
    "readingTimeMinutes": 4,
    "targetAudience": "students and fresh graduates"
  }
}

**Important guidelines:**
- Each section's "content" should be well-formatted markdown with **bold**, *italic*, bullet points (- ), and line breaks (\\n)
- Keep sentences short and punchy
- Use real-world examples and company names students would recognize
- Salary figures should be in INR (₹) with realistic ranges
- The "icon" field should be a Font Awesome icon name (without "fa-" prefix)
- Return ONLY the JSON object, no additional text or markdown formatting.`;
};
