import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildVideoCvPrompt } from "../../prompts/generateVideoCv.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("VideoCvGenerationService");


/**
 * Service for generating video CV scripts using AI
 */
export class VideoCvGenerationService {
  /**
   * Generate a video CV script
   * @param studentName - Name of the student/candidate
   * @param jobTitle - Job title they're applying for
   * @param company - Company name
   * @param jobDescription - Job description
   * @param userReasons - User's reasons for being a good fit
   * @param videoDuration - Video duration ('2-3', '5-7', or '8-10')
   * @param profileData - Complete CV profile data (profile, education, experience, projects, certificates)
   * @returns Generated video CV script data
   */
  async generateVideoCvScript(
    studentName: string,
    jobTitle: string,
    company: string,
    jobDescription: string | undefined,
    userReasons: string | undefined,
    videoDuration: string,
    profileData: any
  ): Promise<{
    success: boolean;
    data?: {
      sections: Array<{
        timestamp: string;
        section: string;
        script: string;
      }>;
      tips?: string[];
    };
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const systemPrompt = buildVideoCvPrompt(
        studentName,
        jobTitle,
        company,
        jobDescription,
        userReasons,
        videoDuration,
        profileData
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(`[Vertex AI] Generating video CV script for ${studentName} applying to ${jobTitle} at ${company}...`);

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
      let parsedData;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
        // Try to extract JSON more aggressively
        const firstBrace = cleanedJson.indexOf("{");
        const lastBrace = cleanedJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
          parsedData = JSON.parse(cleanedJson);
        } else {
          throw new Error(
            `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
          );
        }
      }

      // Validate the structure
      if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
        throw new Error("AI response missing required 'sections' array");
      }

      // Ensure all sections have required fields
      const validatedSections = parsedData.sections.map((section: any, index: number) => {
        if (!section.timestamp) {
          throw new Error(`Section ${index + 1} missing 'timestamp'`);
        }
        if (!section.section) {
          throw new Error(`Section ${index + 1} missing 'section'`);
        }
        if (!section.script) {
          throw new Error(`Section ${index + 1} missing 'script'`);
        }
        return {
          timestamp: section.timestamp,
          section: section.section,
          script: section.script,
        };
      });

      return {
        success: true,
        data: {
          sections: validatedSections,
          tips: parsedData.tips || [],
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Video CV Generation Error:");
      return {
        success: false,
        error: `AI Video CV Service Error: ${errorMessage}`,
      };
    }
  }
}

