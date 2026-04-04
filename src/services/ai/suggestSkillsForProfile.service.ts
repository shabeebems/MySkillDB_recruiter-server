import { getGenerativeModel } from "./vertexAiClient";
import { buildSuggestSkillsForProfilePrompt } from "../../prompts/suggestSkillsForProfile.prompt";
import { JobService, JobRequestUser } from "../job.service";
import { SkillService } from "../skill.service";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("suggestSkillsForProfileservice");


const jobService = new JobService();
const skillService = new SkillService();

export type SuggestSkillsResult =
  | { success: true; needAssessment: true; message: string; jobId: string; jobTitle: string }
  | { success: true; needAssessment: false; suggestedSkills: string[] }
  | { success: false; error: string };

/**
 * Fetches job and skills for the job, then uses AI to suggest skills the candidate
 * should add to their profile. No assessment required.
 */
export async function suggestSkillsForProfile(
  jobId: string,
  _userId: string,
  _organizationId: string,
  currentProfileSkills: string[] = [],
  viewer?: JobRequestUser
): Promise<SuggestSkillsResult> {
  try {
    const [jobRes, skillsRes] = await Promise.all([
      jobService.getJobById(jobId, viewer),
      skillService.getSkillsByJob(jobId),
    ]);

    if (!jobRes.success || !jobRes.data) {
      if ((jobRes as { statusCode?: number }).statusCode === 403) {
        return { success: false, error: "Access denied" };
      }
      return { success: false, error: "Job not found" };
    }

    const job = jobRes.data as { name?: string; companyName?: string; description?: string };
    const jobTitle = job.name || "the role";
    const companyName = job.companyName || "the company";
    const jobDescription = job.description || "";

    const skillsData = skillsRes.data as Array<{ _id: string; name?: string }> | undefined;
    const jobSkillNames = Array.isArray(skillsData)
      ? skillsData.filter((s) => s && s._id).map((s) => s.name || "").filter(Boolean)
      : [];

    const prompt = buildSuggestSkillsForProfilePrompt(
      jobTitle,
      companyName,
      jobDescription,
      jobSkillNames,
      currentProfileSkills || []
    );

    const generativeModel = getGenerativeModel();
    const response = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" as const },
    });

    const rawText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) {
      return { success: false, error: "Empty response from AI" };
    }

    let cleaned = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    let parsed: { suggestedSkills?: string[] };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        parsed = JSON.parse(cleaned.substring(first, last + 1));
      } else {
        return { success: false, error: "Failed to parse AI response as JSON" };
      }
    }

    const aiSuggested = Array.isArray(parsed.suggestedSkills)
      ? parsed.suggestedSkills.filter((s) => typeof s === "string" && s.trim())
      : [];

    const existingLower = new Set(
      (currentProfileSkills || []).map((s) => String(s).trim().toLowerCase())
    );
    const suggestedFiltered = aiSuggested.filter(
      (name) => !existingLower.has(String(name).trim().toLowerCase())
    );

    const seen = new Set<string>();
    const suggestedSkills = suggestedFiltered.filter((name) => {
      const k = String(name).trim().toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return {
      success: true,
      needAssessment: false,
      suggestedSkills,
    };
  } catch (err: any) {
    log.error({ err: err }, "[suggestSkillsForProfile]");
    return {
      success: false,
      error: err?.message || "Failed to suggest skills",
    };
  }
}
