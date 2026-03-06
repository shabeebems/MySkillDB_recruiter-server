import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildJobBriefPrompt } from "../../prompts/generateJobBrief.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("JobBriefGenerationService");


interface JobBriefSection {
  heading: string;
  icon: string;
  content: string;
}

interface JobBriefMetadata {
  wordCount: number;
  readingTimeMinutes: number;
  targetAudience: string;
}

interface JobBriefResult {
  title: string;
  sections: JobBriefSection[];
  metadata: JobBriefMetadata;
}

/**
 * Service for generating job brief readable modules using Vertex AI
 */
export class JobBriefGenerationService {
  /**
   * Generate a job brief readable module
   * @param jobTitle - Title of the job
   * @param companyName - Company name (optional)
   * @param jobDescription - Job description (optional)
   * @param skills - Array of skill names (optional)
   * @returns Generated job brief data
   */
  async generateJobBrief(
    jobTitle: string,
    companyName: string | undefined,
    jobDescription: string | undefined,
    skills: string[] | undefined
  ): Promise<{
    success: boolean;
    data?: JobBriefResult;
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const systemPrompt = buildJobBriefPrompt(
        jobTitle,
        companyName,
        jobDescription,
        skills
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(
        `[Vertex AI] Generating job brief for: ${jobTitle}...`
      );

      const response = await generativeModel.generateContent({
        contents: contents,
        generationConfig: generationConfig,
      });

      const rawText =
        response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!rawText) {
        throw new Error("Empty response from AI model");
      }

      let cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsedData: JobBriefResult;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
        // Try to extract JSON more aggressively
        const firstBrace = cleanedJson.indexOf("{");
        const lastBrace = cleanedJson.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const extractedJson = cleanedJson.substring(
            firstBrace,
            lastBrace + 1
          );
          parsedData = JSON.parse(extractedJson);
          log.info(
            "[Vertex AI] Successfully parsed job brief JSON on second attempt"
          );
        } else {
          log.error({ err: rawText }, "[Vertex AI] Raw response:");
          throw new Error("Could not parse AI response as JSON");
        }
      }

      // Validate the response structure
      if (!parsedData.title) {
        throw new Error("Invalid response structure - missing title");
      }

      if (
        !parsedData.sections ||
        !Array.isArray(parsedData.sections) ||
        parsedData.sections.length === 0
      ) {
        throw new Error(
          "Invalid response structure - missing or empty sections"
        );
      }

      // Validate each section
      for (const section of parsedData.sections) {
        if (!section.heading || !section.content) {
          throw new Error(
            "Invalid section structure - each section must have heading and content"
          );
        }
        // Default icon if missing
        if (!section.icon) {
          section.icon = "book";
        }
      }

      // Ensure metadata exists
      if (!parsedData.metadata) {
        parsedData.metadata = {
          wordCount: 0,
          readingTimeMinutes: 4,
          targetAudience: "students and fresh graduates",
        };
      }

      log.info(
        `[Vertex AI] Successfully generated job brief for ${jobTitle} (${parsedData.sections.length} sections)`
      );

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Job Brief Generation Error:");
      return {
        success: false,
        error: `AI Job Brief Generation Error: ${errorMessage}`,
      };
    }
  }
}
