/**
 * Prompt template for generating flip cards for skills
 * Creates educational flip cards with front content and back quiz questions
 */
export const buildFlipCardPrompt = (
  skillName: string,
  skillDescription: string | undefined,
  skillType: string | undefined,
  jobTitle: string | undefined,
  companyName: string | undefined,
  context: string | undefined
): string => {
  const skillInfo = skillDescription
    ? `**Skill Description:** ${skillDescription}`
    : "";

  const jobContext = jobTitle
    ? `**Job Context:** This skill is for a ${jobTitle} role${companyName ? ` at ${companyName}` : ""}`
    : "";

  const additionalContext = context
    ? `**Additional Context:** ${context}`
    : "";

  return `You are an expert educational content creator. Create a comprehensive flip card for teaching the skill "${skillName}".

${skillInfo}
${jobContext}
${additionalContext}

**Flip Card Structure:**
A flip card has two sides:
1. **FRONT SIDE** - Learning content (what students see first)
2. **BACK SIDE** - Quiz question to test understanding

**Requirements:**

**FRONT SIDE:**
- **Heading:** A clear, concise title (3-8 words) that captures the main concept
- **Content:** A brief explanation (2-4 sentences) that teaches the concept clearly
- **Key Point:** One main takeaway (1 sentence) that students should remember

**BACK SIDE:**
- **Question:** A multiple-choice question that tests understanding of the concept
- **Options:** Exactly 4 options (A, B, C, D) where:
  - One option is clearly correct
  - Other options are plausible but incorrect (common misconceptions or related concepts)
  - Options should be concise (1-2 sentences each)
- **Correct Answer:** The text of the correct option

**Guidelines:**
- Keep content beginner-friendly but accurate
- Use clear, simple language
- Make the question test actual understanding, not just memorization
- Ensure incorrect options are educational (teach what NOT to do or common mistakes)
- Focus on practical application when possible
- If the skill is technical, include code examples or technical details appropriately

**Return ONLY valid JSON in this exact format:**
{
  "heading": "Clear title for the flip card",
  "content": "Brief explanation of the concept (2-4 sentences)",
  "keypoints": ["One main takeaway point"],
  "question": "A question that tests understanding of the concept",
  "options": [
    "Option A (correct answer)",
    "Option B (plausible but incorrect)",
    "Option C (plausible but incorrect)",
    "Option D (plausible but incorrect)"
  ],
  "correctAnswer": "Option A (correct answer)"
}

Make sure the correctAnswer exactly matches one of the options. Return ONLY the JSON object, no additional text.`;
};

