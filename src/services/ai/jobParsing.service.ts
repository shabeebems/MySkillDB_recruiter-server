import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("JobParsingService");


/**
 * Service for parsing job data using Vertex AI
 */
export class JobParsingService {
  /**
   * Parse job data from a prompt using Vertex AI
   * @param prompt - The prompt containing job data to parse
   * @returns Parsed JSON data or raw text if parsing fails
   */
  async parseJobData(prompt: string): Promise<{
    success: boolean;
    data: any;
    raw?: boolean;
    error?: string;
  }> {
    const { modelId, projectId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    const generationConfig = {
      responseMimeType: "application/json" as const,
    };

    try {
      log.info(
        `[Vertex AI] Calling model ${modelId} for prompt (Project: ${projectId})...`
      );

      const response = await generativeModel.generateContent({
        contents: contents,
        generationConfig: generationConfig,
      });

      // Get text from the response structure
      const rawText =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Logic for cleaning and parsing the JSON response
      let cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsedData;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
        log.error(
          "Failed to parse AI JSON output on first attempt. Trying alternative parsing..."
        );

        // Try to extract JSON from the text more aggressively
        try {
          // Look for the first { and last } to extract just the JSON object
          const firstBrace = cleanedJson.indexOf("{");
          const lastBrace = cleanedJson.lastIndexOf("}");

          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extractedJson = cleanedJson.substring(
              firstBrace,
              lastBrace + 1
            );
            parsedData = JSON.parse(extractedJson);
            log.info("Successfully parsed JSON on second attempt");
          } else {
            throw new Error("Could not find valid JSON structure");
          }
        } catch (secondError) {
          log.error(
            "Failed to parse AI JSON output after all attempts. Sending raw text."
          );
          log.error({ err: parseError }, "Parse error:");
          return { success: true, data: rawText, raw: true };
        }
      }

      return { success: true, data: parsedData, raw: false };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI API Error:");
      return {
        success: false,
        data: null,
        error: `Vertex AI Service Error: ${errorMessage}`,
      };
    }
  }
}

