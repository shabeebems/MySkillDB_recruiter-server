import { getGenerativeModel } from "./vertexAiClient";
import { buildRewriteCvSectionPrompt } from "../../prompts/rewriteCvSection.prompt";
import { JobService, JobRequestUser } from "../job.service";
import { SkillService } from "../skill.service";
import { createChildLogger } from "../../utils/logger";

const log = createChildLogger("rewriteCvSectionservice");


const jobService = new JobService();
const skillService = new SkillService();

export type RewriteSectionType =
  | "about_me"
  | "experience"
  | "project"
  | "education";

/**
 * Fetches job and skills for the given jobId and rewrites the given CV section
 * to be ATS-aligned using AI.
 */
/** Check if Vertex AI credentials are configured (required for production). */
function isVertexAiConfigured(): boolean {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  return !!(email && key && key.trim().length > 0);
}

export async function rewriteCvSection(
  jobId: string,
  section: RewriteSectionType,
  content: string,
  viewer?: JobRequestUser
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    if (!isVertexAiConfigured()) {
      return {
        success: false,
        error:
          "Rewrite with AI is not configured on this server. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in the server environment.",
      };
    }
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
    const jobDescription = job.description || "No description provided.";
    const skillsData = skillsRes.data as Array<{ name?: string }> | undefined;
    const skills = Array.isArray(skillsData)
      ? skillsData.map((s) => s.name || "").filter(Boolean)
      : [];

    const sectionLabel =
      section === "about_me"
        ? "Professional Summary"
        : section === "experience"
        ? "Work Experience (role description)"
        : section === "project"
        ? "Project description"
        : "Education summary";

    const prompt = buildRewriteCvSectionPrompt(
      sectionLabel,
      content,
      jobTitle,
      companyName,
      jobDescription,
      skills
    );

    const generativeModel = getGenerativeModel();
    const response = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) {
      return { success: false, error: "Empty response from AI" };
    }

    return { success: true, data: rawText };
  } catch (err: any) {
    log.error({ err: err }, "[rewriteCvSection]");
    return {
      success: false,
      error: err?.message || "Failed to rewrite CV section",
    };
  }
}
