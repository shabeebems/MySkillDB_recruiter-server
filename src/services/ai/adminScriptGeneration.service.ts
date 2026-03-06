import { getGenerativeModel } from "./vertexAiClient";
import { buildAdminScriptPrompt } from "../../prompts/generateAdminScript.prompt";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("AdminScriptGenerationService");


interface ScriptSection {
  timestamp: string;
  section: string;
  script: string;
}

interface ScriptResult {
  title: string;
  sections: ScriptSection[];
}

/**
 * Service for generating placement officer-style video scripts using Vertex AI
 */
export class AdminScriptGenerationService {
  async generateScript(
    scriptType: "job_overview" | "content",
    jobTitle: string,
    companyName: string | undefined,
    jobDescription: string | undefined,
    timeFrame: string,
    adminContent: string | undefined
  ): Promise<{ success: boolean; data?: ScriptResult; error?: string }> {
    const generativeModel = getGenerativeModel();

    try {
      const prompt = buildAdminScriptPrompt(
        scriptType,
        timeFrame,
        jobTitle,
        jobDescription,
        adminContent
      );

      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      const generationConfig = { responseMimeType: "application/json" as const };

      log.info(`[Vertex AI] Generating admin script for: ${jobTitle} (${timeFrame})...`);

      const response = await generativeModel.generateContent({
        contents,
        generationConfig,
      });

      const rawText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!rawText) {
        throw new Error("Empty response from AI model");
      }

      let cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      let parsedData: ScriptResult;

      try {
        parsedData = JSON.parse(cleanedJson);
      } catch {
        const firstBrace = cleanedJson.indexOf("{");
        const lastBrace = cleanedJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          parsedData = JSON.parse(cleanedJson.substring(firstBrace, lastBrace + 1));
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }

      if (!parsedData.title || !parsedData.sections || parsedData.sections.length === 0) {
        throw new Error("Invalid response structure");
      }

      // Normalize section fields
      parsedData.sections = parsedData.sections.map((s) => ({
        timestamp: s.timestamp || "",
        section: s.section || "",
        script: s.script || "",
      }));

      log.info(`[Vertex AI] Generated admin script: "${parsedData.title}" (${parsedData.sections.length} sections)`);

      return { success: true, data: parsedData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      log.error({ err: errorMessage }, "Admin Script Generation Error:");
      return { success: false, error: `Script Generation Error: ${errorMessage}` };
    }
  }
}
