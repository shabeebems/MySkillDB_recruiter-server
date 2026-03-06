import { getGenerativeModel, getVertexAiConfig } from "./vertexAiClient";
import { buildEoMAnswerSuggestionsPrompt } from "../../prompts/generateEoMAnswerSuggestions.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("EomAnswerSuggestionsService");


/**
 * Service for generating answer suggestions for EoM discovery questions
 */
export class EomAnswerSuggestionsService {
  /**
   * Generate AI-powered answer suggestions
   * @param jobTitle - The job title
   * @param department - The department
   * @param keyTasks - What the person does daily
   * @param companyOffering - What the company offers to customers
   * @param employeeValue - How employee contributes to that offering
   * @param questionIndex - Current question index
   * @param question - The question to answer
   * @param previousResponses - Previous question-answer pairs
   * @returns Generated answer suggestions
   */
  async generateSuggestions(
    jobTitle: string,
    department: string | undefined,
    keyTasks: string | undefined,
    companyOffering: string | undefined,
    employeeValue: string | undefined,
    questionIndex: number,
    question: string,
    previousResponses: Array<{ question: string; answer: string }> | undefined
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
  }> {
    const { modelId } = getVertexAiConfig();
    const generativeModel = getGenerativeModel();

    try {
      const hasRichContext = keyTasks && companyOffering && employeeValue;

      const systemPrompt = buildEoMAnswerSuggestionsPrompt(
        jobTitle,
        department,
        keyTasks,
        companyOffering,
        employeeValue,
        question,
        previousResponses
      );

      const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];

      const generationConfig = {
        responseMimeType: "application/json" as const,
      };

      log.info(
        `[Vertex AI] Generating suggestions for ${jobTitle} - Q${
          questionIndex + 1
        } (Rich context: ${hasRichContext ? "YES" : "NO"})`
      );
      if (hasRichContext) {
        log.info(`  → Tasks: ${keyTasks?.substring(0, 50)}...`);
        log.info(`  → Company: ${companyOffering?.substring(0, 50)}...`);
      }

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
      if (
        !parsedData.suggestions ||
        !Array.isArray(parsedData.suggestions) ||
        parsedData.suggestions.length === 0
      ) {
        throw new Error("Invalid response structure - missing suggestions array");
      }

      log.info(
        `[Vertex AI] Successfully generated ${parsedData.suggestions.length} suggestions for ${jobTitle}`
      );

      return {
        success: true,
        data: parsedData,
        message: "Answer suggestions generated successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      log.error({ err: errorMessage }, "Vertex AI Answer Suggestions Error:");
      return {
        success: false,
        error: `AI Suggestion Error: ${errorMessage}`,
      };
    }
  }
}

