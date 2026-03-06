import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildJobInterviewBuddyPrompt } from "../../prompts/jobInterviewBuddy.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("JobInterviewBuddyService");


/**
 * Service for AI-powered Job Interview Buddy chat
 */
export class JobInterviewBuddyService {
  /**
   * Generate Interview Buddy chat response
   * @param jobTitle - The job title
   * @param company - The company name
   * @param skills - Array of skills
   * @param conversationHistory - Previous conversation messages
   * @param userMessage - Current user message
   * @param selectedSkill - Optional skill for deep-dive mode { name: string }
   * @param chatMode - 'skill_deep_dive' | 'interview_prep'
   * @returns AI-generated Interview Buddy response
   */
  async generateResponse(
    jobTitle: string,
    company: string,
    skills: any[],
    conversationHistory: any[],
    userMessage: string,
    selectedSkill: { name: string } | null,
    chatMode: string | null
  ): Promise<{
    success: boolean;
    data?: {
      response: string;
      timestamp: string;
    };
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const systemPrompt = buildJobInterviewBuddyPrompt(
        jobTitle,
        company,
        skills,
        conversationHistory,
        userMessage,
        selectedSkill,
        chatMode
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      log.info(`[Vertex AI] Job Interview Buddy Chat for ${jobTitle} at ${company}...`);

      const response = await generativeModel.generateContent({
        contents: contents,
      });

      const aiResponse =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!aiResponse) {
        throw new Error("No response from AI model");
      }

      return {
        success: true,
        data: {
          response: aiResponse.trim(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Job Interview Buddy Chat Error:");
      return {
        success: false,
        error: `Interview Buddy Service Error: ${errorMessage}`,
      };
    }
  }
}
