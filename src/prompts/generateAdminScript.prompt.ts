/**
 * Prompt template for generating admin scripts (job overview or content from input)
 * Tone: placement officer speaking to students
 */
export const buildAdminScriptPrompt = (
  scriptType: "job_overview" | "content",
  timeFrame: string,
  jobName?: string,
  jobDescription?: string,
  adminContent?: string
): string => {
  const durationMap: { [key: string]: string } = {
    "1-2min": "1 to 2 minutes",
    "2-3min": "2 to 3 minutes",
    "3-4min": "3 to 4 minutes",
    "4-5": "4 to 5 minutes",
    "5-7": "5 to 7 minutes",
    "8-10": "8 to 10 minutes",
  };
  const duration =
    durationMap[timeFrame] ||
    (scriptType === "job_overview" ? "1 to 2 minutes" : "4 to 5 minutes");

  if (scriptType === "job_overview" && jobName) {
    return `You are a college placement officer creating a video script to present ONE job opportunity to students. The script should be focused and substantive—fill the full duration with useful, concrete information so students get a clear picture of the role. Keep it factual; do not exaggerate or oversell.

**Job role:** ${jobName}
${jobDescription ? `**Job context/description:**\n${jobDescription}\n` : ""}

**Required output:** A JSON object with exactly this structure (no extra fields):
{
  "title": "A clear title for the video (e.g. 'Overview: Backend Developer at Company X')",
  "sections": [
    {
      "timestamp": "0:00 - 0:30",
      "section": "Section title (e.g. Introduction)",
      "script": "Full script text for this segment. Write in a natural, spoken style with enough detail to be useful—not just one sentence."
    }
  ]
}

**Guidelines for job overview:**
- Total duration: ${duration}. Use 2–4 sections with clear timestamps. Each section should have real content that fills its time—avoid very short or empty sections.
- Stick to facts about this job only. Do not exaggerate, oversell, or add generic fluff.
- Introduction: Who you are and which job you’re presenting (${jobName}). Set the context in a few sentences.
- The role: Cover key responsibilities, requirements, and what a typical day or project might look like, based on the description. Give students enough to decide if they’re interested.
- Optional: One or two sentences on why this role or company might be a good fit, if the description supports it.
- Closing: Where to find more info or how to apply. Keep it clear and actionable.
- Use simple, conversational language. No corporate jargon or hype—only useful information about this specific job.

Return only valid JSON.`;
  }

  // content from admin input
  return `You are a college placement or career officer creating a short video script for students based on the following points. The tone should be warm, clear, and encouraging—speaking directly to students.

**Main points / content from admin:**
${adminContent || "General career or placement tips."}

**Required output:** A JSON object with exactly this structure (no extra fields):
{
  "title": "A short, engaging title for the video",
  "sections": [
    {
      "timestamp": "0:00 - 0:30",
      "section": "Section title",
      "script": "Full script text for this segment. Write in a natural, spoken style."
    }
  ]
}

**Guidelines:**
- Total duration: ${duration}. Split the script into 2-4 sections with clear timestamps.
- Expand the admin's points into full, spoken paragraphs. Keep it student-friendly and actionable.
- Return only valid JSON.`;
};
