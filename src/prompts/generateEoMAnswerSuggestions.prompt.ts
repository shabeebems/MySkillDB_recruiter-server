/**
 * Prompt template for generating answer suggestions for EoM discovery questions
 * Uses rich context to generate highly relevant suggestions
 */
export const buildEoMAnswerSuggestionsPrompt = (
  jobTitle: string,
  department: string | undefined,
  keyTasks: string | undefined,
  companyOffering: string | undefined,
  employeeValue: string | undefined,
  question: string,
  previousResponses: any[] | undefined
): string => {
  const hasRichContext = keyTasks && companyOffering && employeeValue;

  const jobContextSection = hasRichContext
    ? `
**RICH JOB CONTEXT (use this to make suggestions highly relevant):**

📋 **Key Daily Tasks:**
${keyTasks}

🏢 **What the Company Offers:**
${companyOffering}

💡 **How This Employee Adds Value:**
${employeeValue}
`
    : "";

  const previousContext =
    previousResponses && previousResponses.length > 0
      ? `\n**Previous Discovery Answers (build upon these):**\n${previousResponses
          .map(
            (r: { question: string; answer: string }, i: number) =>
              `Q: ${r.question}\nA: "${r.answer}"`
          )
          .join("\n\n")}`
      : "";

  return `You are an expert HR consultant helping define an "Employee of the Month" profile - the ideal top performer for a ${jobTitle} role.

**Role:** ${jobTitle}
**Department:** ${department || "Not specified"}
${jobContextSection}
${previousContext}

**Current Question to Answer:**
"${question}"

**Your Task:**
Generate 3 answer suggestions that are DIRECTLY RELEVANT to:
1. The specific tasks this person will do (${
    keyTasks ? "provided above" : "typical for " + jobTitle
  })
2. How they contribute to the company's offering
3. What "exceptional" looks like in THIS specific context

**CRITICAL Requirements:**
- Each suggestion MUST reference specific tasks, metrics, or outcomes from the context provided
- Include CONCRETE numbers (e.g., "complete 3 projects", "reduce time by 25%", "mentor 2 juniors")
- Make suggestions feel like they were written by someone who deeply understands THIS exact role
- Offer 3 DIFFERENT perspectives: (1) Individual Excellence, (2) Team Impact, (3) Business Value

**Return ONLY valid JSON:**
{
  "suggestions": [
    {
      "text": "2-4 sentence suggestion that directly ties to the job tasks and company value. Be specific and actionable.",
      "highlights": ["Specific outcome 1", "Specific outcome 2", "Specific outcome 3"]
    },
    {
      "text": "Second suggestion focusing on a different aspect...",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    },
    {
      "text": "Third suggestion with business impact focus...",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
  ]
}

Make each suggestion sound like it was crafted specifically for THIS ${jobTitle} at THIS company, not a generic template.`;
};

