import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildFlipCardPrompt } from "../../prompts/generateFlipCard.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("FlipCardGenerationService");


/**
 * Service for generating flip cards using AI
 */
export class FlipCardGenerationService {
  /**
   * Generate a flip card for a skill
   * @param skillName - Name of the skill
   * @param skillDescription - Description of the skill
   * @param skillType - Type of skill (technical, domain, tool)
   * @param jobTitle - Job title context
   * @param companyName - Company name context
   * @param context - Additional context for generation
   * @returns Generated flip card data
   */
  async generateFlipCard(
    skillName: string,
    skillDescription: string | undefined,
    skillType: string | undefined,
    jobTitle: string | undefined,
    companyName: string | undefined,
    context: string | undefined
  ): Promise<{
    success: boolean;
    data?: {
      heading: string;
      content: string;
      keypoints: string[];
      question: string;
      options: string[];
      correctAnswer: string;
    };
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const systemPrompt = buildFlipCardPrompt(
        skillName,
        skillDescription,
        skillType,
        jobTitle,
        companyName,
        context
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(`[Vertex AI] Generating flip card for skill: ${skillName}...`);

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
          const extractedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
          parsedData = JSON.parse(extractedJson);
          log.info("[Vertex AI] Successfully parsed JSON on second attempt");
        } else {
          log.error({ err: rawText }, "[Vertex AI] Raw response:");
          throw new Error("Could not parse AI response as JSON");
        }
      }

      // Validate the response structure
      if (!parsedData.heading || !parsedData.content || !parsedData.question) {
        throw new Error("Invalid response structure - missing required fields");
      }

      if (!parsedData.options || !Array.isArray(parsedData.options) || parsedData.options.length !== 4) {
        throw new Error("Invalid response structure - must have exactly 4 options");
      }

      if (!parsedData.correctAnswer) {
        throw new Error("Invalid response structure - missing correctAnswer");
      }

      // Ensure correctAnswer matches one of the options
      if (!parsedData.options.includes(parsedData.correctAnswer)) {
        log.warn("[Vertex AI] correctAnswer doesn't match any option, using first option");
        parsedData.correctAnswer = parsedData.options[0];
      }

      // Randomize the position of the correct answer
      const correctAnswerText = parsedData.correctAnswer;
      const shuffledOptions = [...parsedData.options];
      
      // Fisher-Yates shuffle algorithm
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      // Find the new position of the correct answer after shuffling
      const correctAnswerIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
      if (correctAnswerIndex === -1) {
        // Fallback: if somehow the correct answer is lost, use the first option
        parsedData.correctAnswer = shuffledOptions[0];
      } else {
        // Update correctAnswer to match the shuffled position
        parsedData.correctAnswer = shuffledOptions[correctAnswerIndex];
      }
      
      parsedData.options = shuffledOptions;

      // Ensure keypoints is an array
      if (!parsedData.keypoints || !Array.isArray(parsedData.keypoints)) {
        parsedData.keypoints = parsedData.keypoints ? [parsedData.keypoints] : [];
      }

      log.info(
        `[Vertex AI] Successfully generated flip card for ${skillName}`
      );

      return {
        success: true,
        data: {
          heading: parsedData.heading,
          content: parsedData.content,
          keypoints: parsedData.keypoints,
          question: parsedData.question,
          options: parsedData.options,
          correctAnswer: parsedData.correctAnswer,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Flip Card Generation Error:");
      return {
        success: false,
        error: `AI Flip Card Generation Error: ${errorMessage}`,
      };
    }
  }

  /**
   * Generate multiple flip cards for multiple skills
   * @param requests - Array of flip card generation requests
   * @returns Array of generated flip cards
   */
  async generateBatchFlipCards(
    requests: Array<{
      skillName: string;
      skillDescription?: string;
      skillType?: string;
      jobTitle?: string;
      companyName?: string;
      context?: string;
    }>
  ): Promise<{
    success: boolean;
    data?: Array<{
      skillName: string;
      heading: string;
      content: string;
      keypoints: string[];
      question: string;
      options: string[];
      correctAnswer: string;
    }>;
    error?: string;
  }> {
    try {
      const results = [];
      
      // Generate cards sequentially to avoid rate limits
      for (const request of requests) {
        const result = await this.generateFlipCard(
          request.skillName,
          request.skillDescription,
          request.skillType,
          request.jobTitle,
          request.companyName,
          request.context
        );

        if (result.success && result.data) {
          results.push({
            skillName: request.skillName,
            ...result.data,
          });
        } else {
          // Continue with other cards even if one fails
          log.error({ err: result.error }, `Failed to generate card for ${request.skillName}:`);
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Batch Flip Card Generation Error:");
      return {
        success: false,
        error: `AI Batch Flip Card Generation Error: ${errorMessage}`,
      };
    }
  }
}

