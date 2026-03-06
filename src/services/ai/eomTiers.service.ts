import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildEoMTiersPrompt } from "../../prompts/generateEoMTiers.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("EomTiersService");


/**
 * Service for generating difficulty tier adjustments for EoM profiles
 */
export class EomTiersService {
  /**
   * Generate difficulty tier adjustments
   * @param profileData - The original EoM profile data
   * @param jobTitle - The job title
   * @returns Generated tier adjustments
   */
  async generateTiers(
    profileData: any,
    jobTitle: string | undefined
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const systemPrompt = buildEoMTiersPrompt(jobTitle, profileData);

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(`[Vertex AI] Generating EoM Difficulty Tiers...`);

      const response = await generativeModel.generateContent({
        contents: contents,
        generationConfig: generationConfig,
      });

      const rawText =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsedData;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
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
        message: "Difficulty tiers generated successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Tier Generation Error:");
      return {
        success: false,
        error: `AI Tier Generation Error: ${errorMessage}`,
      };
    }
  }
}

