/**
 * Prompt template for generating Employee of the Month profile
 * Creates comprehensive profile from recruiter's discovery answers
 */
export const buildEoMProfilePrompt = (
  jobTitle: string,
  department: string | undefined,
  companyName: string | undefined,
  jobDescription: string | undefined,
  userResponsesText: string
): string => {
  return `You are an expert HR consultant helping define an Employee of the Month profile for the following role:

**Job Title:** ${jobTitle}
**Department:** ${department || "Not specified"}
**Company:** ${companyName || "Not specified"}
**Job Description:** ${jobDescription || "Not provided"}

The recruiter has answered the following questions about their ideal employee:

${userResponsesText}

Based on these responses, generate a comprehensive Employee of the Month profile. Return ONLY valid JSON in exactly this format:

{
  "skills": [
    {
      "name": "string (skill name)",
      "category": "technical" | "domain" | "tool",
      "proficiencyLevel": 1-5 (1=Basic, 5=Expert),
      "weight": 1-10 (importance),
      "description": "string (brief description)",
      "evidence": ["array of ways to demonstrate this skill"]
    }
  ],
  "behavioral": [
    {
      "trait": "string (trait name)",
      "category": "soft_skill" | "attitude" | "culture_fit",
      "importance": "critical" | "important" | "nice_to_have",
      "weight": 1-10,
      "description": "string (what this trait looks like in practice)",
      "indicators": ["observable behaviors"],
      "interviewQuestions": ["2-3 questions to assess this trait"]
    }
  ],
  "deliverables": [
    {
      "goal": "string (specific measurable goal)",
      "category": "performance" | "growth" | "collaboration" | "innovation",
      "timeframe": "30-days" | "90-days" | "6-months" | "yearly",
      "metrics": [
        {
          "name": "string (metric name)",
          "target": "string (target value)",
          "measurement": "string (how to measure)"
        }
      ],
      "weight": 1-10,
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Guidelines:
1. Generate 5-8 skills with a mix of technical, domain, and tool proficiencies
2. Generate 4-6 behavioral traits covering soft skills, attitude, and culture fit
3. Generate 4-6 deliverables with measurable metrics across different timeframes
4. All items should have appropriate weights based on the recruiter's responses
5. Skills should align with common requirements for a ${jobTitle} role
6. Behavioral traits should reflect the team dynamics mentioned
7. Deliverables should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
8. Interview questions should be behavioral/situational

Return ONLY the JSON object, no additional text.`;
};

