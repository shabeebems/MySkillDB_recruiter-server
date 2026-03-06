import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildEoMProfilePrompt } from "../../prompts/generateEoMProfile.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("EomProfileService");


/**
 * Service for generating Employee of the Month profiles
 */
export class EomProfileService {
  /**
   * Generate EoM profile from AI-guided responses
   * @param jobTitle - The job title
   * @param department - The department
   * @param companyName - The company name
   * @param jobDescription - The job description
   * @param aiResponses - Array of question-answer pairs
   * @returns Generated EoM profile data
   */
  async generateProfile(
    jobTitle: string,
    department: string | undefined,
    companyName: string | undefined,
    jobDescription: string | undefined,
    aiResponses: Array<{ question: string; answer: string }>
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const userResponsesText = aiResponses
        .map(
          (r: { question: string; answer: string }, i: number) =>
            `Q${i + 1}: ${r.question}\nA: ${r.answer}`
        )
        .join("\n\n");

      const systemPrompt = buildEoMProfilePrompt(
        jobTitle,
        department,
        companyName,
        jobDescription,
        userResponsesText
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(`[Vertex AI] Generating EoM Profile for ${jobTitle}...`);

      const response = await generativeModel.generateContent({
        contents: contents,
        generationConfig: generationConfig,
      });

      const rawText =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Clean and parse JSON
      let cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsedData;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
        // Try to extract JSON
        const firstBrace = cleanedJson.indexOf("{");
        const lastBrace = cleanedJson.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const extractedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
          parsedData = JSON.parse(extractedJson);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }

      return {
        success: true,
        data: parsedData,
        message: "Employee of the Month profile generated successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI EoM Generation Error:");
      return {
        success: false,
        error: `AI Profile Generation Error: ${errorMessage}`,
      };
    }
  }
}

