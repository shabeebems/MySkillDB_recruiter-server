import { Request, Response } from "express";
import { JobParsingService } from "../services/ai/jobParsing.service";
import { JobInterviewBuddyService } from "../services/ai/jobInterviewBuddy.service";
import { EomProfileService } from "../services/ai/eomProfile.service";
import { EomAnswerSuggestionsService } from "../services/ai/eomAnswerSuggestions.service";
import { EomTiersService } from "../services/ai/eomTiers.service";
import { FlipCardGenerationService } from "../services/ai/flipCardGeneration.service";
import { VideoCvGenerationService } from "../services/ai/videoCvGeneration.service";
import { VideoCvScriptService } from "../services/videoCvScript.service";
import { AdminScriptService } from "../services/adminScript.service";
import { getGenerativeModel } from "../services/ai/vertexAiClient";
import { buildAdminScriptPrompt } from "../prompts/generateAdminScript.prompt";
import { suggestSkillsForProfile as suggestSkillsForProfileService } from "../services/ai/suggestSkillsForProfile.service";
import { rewriteCvSection as rewriteCvSectionService, RewriteSectionType } from "../services/ai/rewriteCvSection.service";
import { JobBriefGenerationService } from "../services/ai/jobBriefGeneration.service";
import { ReadingModuleService } from "../services/readingModule.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("aicontroller");


/**
 * Handles the secure request to parse job data using Vertex AI.
 */
export const parseJobData = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res
      .status(400)
      .json({ success: false, error: "Prompt is required." });
  }

  const jobParsingService = new JobParsingService();
  const result = await jobParsingService.parseJobData(prompt);

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    raw: result.raw || false,
  });
};

/**
 * Handles AI-powered Job Interview Buddy chat using Vertex AI.
 * Acts as an experienced employee in the specified role.
 */
export const jobInterviewBuddyChat = async (req: Request, res: Response) => {
  const { jobTitle, company, skills, conversationHistory, userMessage, selectedSkill, chatMode } =
    req.body;

  if (!jobTitle || !userMessage) {
    return res.status(400).json({
      success: false,
      error: "Job title and user message are required.",
    });
  }

  const jobInterviewBuddyService = new JobInterviewBuddyService();
  const result = await jobInterviewBuddyService.generateResponse(
    jobTitle,
    company,
    skills,
    conversationHistory,
    userMessage,
    selectedSkill ?? null,
    chatMode ?? null
  );

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
  });
};

/**
 * Generates Employee of the Month profile from AI-guided responses.
 * Uses the user's answers to goal discovery questions to build a comprehensive profile.
 */
export const generateEoMProfile = async (req: Request, res: Response) => {
  const { jobTitle, department, companyName, jobDescription, aiResponses } =
    req.body;

  if (!jobTitle || !aiResponses || aiResponses.length < 4) {
    return res.status(400).json({
      success: false,
      error: "Job title and at least 4 AI responses are required.",
    });
  }

  const eomProfileService = new EomProfileService();
  const result = await eomProfileService.generateProfile(
    jobTitle,
    department,
    companyName,
    jobDescription,
    aiResponses
  );

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: result.message,
  });
};

/**
 * Generates AI-powered answer suggestions for EoM discovery questions.
 * Uses rich context (job tasks, company offering, employee value) to generate
 * highly relevant and intuitive suggestions.
 */
export const generateEoMAnswerSuggestions = async (
  req: Request,
  res: Response
) => {
  const {
    jobTitle,
    department,
    keyTasks,
    companyOffering,
    employeeValue,
    questionIndex,
    question,
    previousResponses,
  } = req.body;

  if (!jobTitle || question === undefined) {
    return res.status(400).json({
      success: false,
      error: "Job title and question are required.",
    });
  }

  const eomAnswerSuggestionsService = new EomAnswerSuggestionsService();
  const result = await eomAnswerSuggestionsService.generateSuggestions(
    jobTitle,
    department,
    keyTasks,
    companyOffering,
    employeeValue,
    questionIndex || 0,
    question,
    previousResponses
  );

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: result.message,
  });
};

/**
 * Generates difficulty tier adjustments based on existing EoM profile.
 */
export const generateEoMTiers = async (req: Request, res: Response) => {
  const { profileData, jobTitle } = req.body;

  if (!profileData) {
    return res.status(400).json({
      success: false,
      error: "Profile data is required.",
    });
  }

  const eomTiersService = new EomTiersService();
  const result = await eomTiersService.generateTiers(profileData, jobTitle);

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: result.message,
  });
};

/**
 * Generates AI-powered flip card for a skill
 */
export const generateFlipCard = async (req: Request, res: Response) => {
  const {
    skillName,
    skillDescription,
    skillType,
    jobTitle,
    companyName,
    context,
  } = req.body;

  if (!skillName) {
    return res.status(400).json({
      success: false,
      error: "Skill name is required.",
    });
  }

  const flipCardGenerationService = new FlipCardGenerationService();
  const result = await flipCardGenerationService.generateFlipCard(
    skillName,
    skillDescription,
    skillType,
    jobTitle,
    companyName,
    context
  );

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: "Flip card generated successfully",
  });
};

/**
 * Generates multiple AI-powered flip cards in batch
 */
export const generateBatchFlipCards = async (req: Request, res: Response) => {
  const { requests } = req.body;

  if (!requests || !Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Requests array is required and must not be empty.",
    });
  }

  if (requests.length > 10) {
    return res.status(400).json({
      success: false,
      error: "Maximum 10 flip cards can be generated at once.",
    });
  }

  const flipCardGenerationService = new FlipCardGenerationService();
  const result = await flipCardGenerationService.generateBatchFlipCards(requests);

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: `${result.data?.length || 0} flip cards generated successfully`,
  });
};

/**
 * Generates AI-powered video CV script based on user's CV data and job requirements
 */
export const generateVideoCv = async (req: Request, res: Response) => {
  const {
    jobId,
    jobTitle,
    company,
    jobDescription,
    userReasons,
    videoDuration,
    studentName,
    profileData,
  } = req.body;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      error: "Job ID is required.",
    });
  }

  if (!jobTitle || !studentName) {
    return res.status(400).json({
      success: false,
      error: "Job title and student name are required.",
    });
  }

  if (!profileData) {
    return res.status(400).json({
      success: false,
      error: "Profile data is required.",
    });
  }

  const videoCvGenerationService = new VideoCvGenerationService();
  const result = await videoCvGenerationService.generateVideoCvScript(
    studentName,
    jobTitle,
    company || "",
    jobDescription,
    userReasons,
    videoDuration || "1-2",
    profileData
  );

  if (!result.success) {
    return res.status(503).json({
      success: false,
      error: result.error,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }

  // Save the generated script to database
  if (result.data && jobId) {
    const userId = (req as any).user?._id?.toString();
    if (userId) {
      const videoCvScriptService = new VideoCvScriptService();
      const saveResult = await videoCvScriptService.createVideoCvScript(userId, {
        jobId: jobId,
        userReasons: userReasons,
        videoDuration: videoDuration || "1-2",
        tips: result.data.tips || [],
        sections: result.data.sections.map((section) => ({
          timestamp: section.timestamp,
          section: section.section,
          script: section.script,
        })),
      });

      if (saveResult.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          scriptId: (saveResult.data as any)?._id || null,
          message: "Video CV script generated and saved successfully",
        });
      }
    }
  }

  return res.status(200).json({
    success: true,
    data: result.data,
    message: "Video CV script generated successfully",
  });
};

/**
 * Generates admin script (job overview or content from input). Protected for org_admin and master_admin.
 */
export const generateAdminScript = async (req: Request, res: Response) => {
  const role = (req as any).user?.role;
  if (role !== "org_admin" && role !== "master_admin") {
    return res.status(403).json({
      success: false,
      error: "Only organization or master admins can generate admin scripts.",
    });
  }
  const {
    scriptType,
    timeFrame,
    jobId,
    jobName,
    jobDescription,
    adminContent,
    organizationId,
  } = req.body || {};
  if (!scriptType || !timeFrame || !organizationId) {
    return res.status(400).json({
      success: false,
      error: "scriptType, timeFrame, and organizationId are required.",
    });
  }
  if (scriptType !== "job_overview" && scriptType !== "content") {
    return res.status(400).json({
      success: false,
      error: "scriptType must be job_overview or content.",
    });
  }
  if (scriptType === "job_overview" && !jobName) {
    return res.status(400).json({
      success: false,
      error: "jobName is required for job_overview scripts.",
    });
  }
  try {
    const prompt = buildAdminScriptPrompt(
      scriptType,
      timeFrame,
      jobName,
      jobDescription,
      adminContent
    );
    const contents = [{ role: "user" as const, parts: [{ text: prompt }] }];
    const generativeModel = getGenerativeModel();
    const response = await generativeModel.generateContent({
      contents,
      generationConfig: { responseMimeType: "application/json" as const },
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
    let parsedData: { title?: string; sections?: Array<{ timestamp?: string; section?: string; script?: string }> };
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
    if (!parsedData.title || !Array.isArray(parsedData.sections) || parsedData.sections.length === 0) {
      throw new Error("Invalid AI response: title and sections required");
    }
    const durationLabel =
      timeFrame === "1-2min"
        ? "1–2 min"
        : timeFrame === "2-3min"
          ? "2–3 min"
          : timeFrame === "3-4min"
            ? "3–4 min"
            : timeFrame === "4-5"
              ? "4–5 min"
              : timeFrame === "5-7"
                ? "5–7 min"
                : timeFrame === "8-10"
                  ? "8–10 min"
                  : scriptType === "job_overview"
                    ? "1–2 min"
                    : "4–5 min";
    const adminScriptService = new AdminScriptService();
    const saveResult = await adminScriptService.createFromGenerated({
      organizationId,
      createdBy: (req as any).user?._id?.toString?.(),
      scriptType,
      jobId,
      title: parsedData.title,
      selectedLength: durationLabel,
      userIdea: adminContent,
      sections: parsedData.sections,
    });
    if (!saveResult.success) {
      const msg = (saveResult as any).message || "Failed to save script";
      const isValidation = msg.includes("Only one admin script");
      return res.status(isValidation ? 400 : 500).json({
        success: false,
        error: msg,
      });
    }
    const scriptId = (saveResult.data as any)?._id?.toString?.() || null;
    return res.status(200).json({
      success: true,
      data: {
        title: parsedData.title,
        sections: parsedData.sections.map((s) => ({
          timestamp: s.timestamp,
          section: s.section,
          script: s.script,
        })),
      },
      scriptId,
      message: "Admin script generated and saved successfully",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.error({ err: msg }, "generateAdminScript error:");
    return res.status(503).json({
      success: false,
      error: msg,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }
};

/**
 * Rewrites a CV section for ATS alignment using AI. Student only.
 * Generate job brief readable module via AI and save to DB. org_admin / master_admin only.
 */
export const generateJobBrief = async (req: Request, res: Response) => {
  const { jobId, jobTitle, companyName, jobDescription, organizationId } = req.body || {};
  if (!jobId || !jobTitle || !organizationId) {
    return res.status(400).json({
      success: false,
      error: "jobId, jobTitle, and organizationId are required.",
    });
  }
  try {
    const jobBriefService = new JobBriefGenerationService();
    const genResult = await jobBriefService.generateJobBrief(
      jobTitle,
      companyName,
      jobDescription,
      undefined
    );
    if (!genResult.success || !genResult.data) {
      return res.status(503).json({
        success: false,
        error: genResult.error || "Failed to generate job brief",
        errorCode: "VERTEX_AI_FAILURE",
      });
    }
    const { title, sections, metadata } = genResult.data;
    const readingModuleService = new ReadingModuleService();
    const createResult = await readingModuleService.createJobBrief({
      jobId: String(jobId),
      organizationId: String(organizationId),
      title,
      sections,
      metadata,
    });
    if (!createResult.success || !createResult.data) {
      return res.status(500).json({
        success: false,
        error: (createResult as any).message || "Failed to save job brief",
      });
    }
    const moduleId = (createResult.data as any)?._id?.toString?.() || null;
    return res.status(200).json({
      success: true,
      data: { title, sections, metadata },
      moduleId,
      message: "Job brief generated and saved successfully",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.error({ err: msg }, "generateJobBrief error:");
    return res.status(503).json({
      success: false,
      error: msg,
      errorCode: "VERTEX_AI_FAILURE",
    });
  }
};

/**
 * Rewrite a CV section to be ATS-aligned for a specific job. Student only.
 */
export const rewriteCvSection = async (req: Request, res: Response) => {
  const { jobId, section, content } = req.body;
  if (!jobId || !section) {
    return res.status(400).json({
      success: false,
      error: "jobId and section are required.",
    });
  }
  const validSections = ["about_me", "experience", "project", "education"];
  if (!validSections.includes(section)) {
    return res.status(400).json({
      success: false,
      error: "section must be one of: about_me, experience, project, education.",
    });
  }
  try {
    const result = await rewriteCvSectionService(jobId, section, content ?? "");
    if (!result.success) {
      return res.status(result.error === "Job not found" ? 404 : 503).json({
        success: false,
        error: result.error,
      });
    }
    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.error({ err: msg }, "rewriteCvSection error:");
    return res.status(503).json({
      success: false,
      error: msg,
    });
  }
};

/**
 * Suggests skills for CV profile based on job and student's assessment. Student only.
 */
export const suggestSkillsForProfile = async (req: Request, res: Response) => {
  const { jobId, currentProfileSkills } = req.body;
  const userId = (req as any).user?._id?.toString();
  const organizationId = (req as any).user?.organizationId?.toString?.();

  if (!jobId) {
    return res.status(400).json({
      success: false,
      error: "jobId is required.",
    });
  }
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized.",
    });
  }

  try {
    const result = await suggestSkillsForProfileService(
      jobId,
      userId,
      organizationId ?? "",
      Array.isArray(currentProfileSkills) ? currentProfileSkills : []
    );

    if (!result.success) {
      return res.status(result.error === "Job not found" ? 404 : 503).json({
        success: false,
        error: result.error,
      });
    }

    if (result.needAssessment) {
      return res.status(200).json({
        success: true,
        needAssessment: true,
        message: result.message,
        jobId: result.jobId,
        jobTitle: result.jobTitle,
      });
    }

    return res.status(200).json({
      success: true,
      needAssessment: false,
      suggestedSkills: result.suggestedSkills,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.error({ err: msg }, "suggestSkillsForProfile error:");
    return res.status(503).json({
      success: false,
      error: msg,
    });
  }
};

export const generateLinkedInPost = async (req: Request, res: Response) => {
    const { 
        jobTitle, 
        companyName, 
        skillName, 
        userTopic, 
        userContext 
    } = req.body;

    if (!jobTitle || !skillName || !userTopic) {
        return res.status(400).json({ 
            success: false, 
            error: 'Job title, skill name, and user topic are required.' 
        });
    }

    try {
        const systemPrompt = `You are an expert LinkedIn content creator helping a student create a professional post about their learning journey.

**Context:**
- Job Goal: ${jobTitle}
- Company: ${companyName || 'Not specified'}
- Skill Being Learned: ${skillName}
- What the post is about: ${userTopic}
${userContext ? `- Additional context: ${userContext}` : ''}

**Your Task:**
Generate a professional, engaging LinkedIn post that:
1. Is authentic and personal (written from the student's perspective)
2. Highlights their learning journey and progress
3. Shows enthusiasm and growth mindset
4. Is professional but relatable
5. Includes relevant hashtags
6. Is between 200-400 words
7. Uses proper LinkedIn formatting (line breaks, emojis sparingly)

**Return ONLY valid JSON in this exact format:**
{
  "postText": "The complete LinkedIn post text with proper formatting, including line breaks (use \\n for new lines)",
  "hashtags": ["array", "of", "relevant", "hashtags", "without", "#", "symbols"],
  "summary": "A brief 1-2 sentence summary of what the post is about"
}

**Guidelines:**
- Start with an engaging hook (emoji optional)
- Include the user's topic naturally
- Mention the skill and job goal contextually
- Add a call-to-action or reflection
- Use 3-5 relevant hashtags
- Keep it professional but personal
- Use proper spacing and line breaks for readability

**Example structure:**
🚀 [Engaging opening about the topic]

[Main content about the learning journey, incorporating userTopic and skillName]

[Reflection or insight about growth]

[Closing thought or call-to-action]

#Hashtag1 #Hashtag2 #Hashtag3

Return ONLY the JSON object, no additional text or markdown formatting.`;

        const contents = [{ role: 'user', parts: [{ text: systemPrompt }] }];

        const generationConfig = {
            responseMimeType: 'application/json' as const,
        };

        log.info(`[Vertex AI] Generating LinkedIn post for ${jobTitle} - ${skillName}...`);
        
        const generativeModel = getGenerativeModel();
        const response = await generativeModel.generateContent({
            contents: contents,
            generationConfig: generationConfig,
        });

        // Get text from the response structure
        const rawText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (!rawText) {
            throw new Error('Empty response from AI model');
        }

        // Logic for cleaning and parsing the JSON response
        let cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        let parsedData;

        try {
            parsedData = JSON.parse(cleanedJson);
        } catch (parseError) {
            log.error('Failed to parse AI JSON output on first attempt. Trying alternative parsing...');
            
            // Try to extract JSON from the text more aggressively
            try {
                // Look for the first { and last } to extract just the JSON object
                const firstBrace = cleanedJson.indexOf('{');
                const lastBrace = cleanedJson.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const extractedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
                    parsedData = JSON.parse(extractedJson);
                    log.info('Successfully parsed JSON on second attempt');
                } else {
                    throw new Error('Could not find valid JSON structure');
                }
            } catch (secondError) {
                log.error('Failed to parse AI JSON output after all attempts.');
                log.error({ err: parseError }, 'Parse error:');
                log.error({ err: rawText }, 'Raw response:');
                return res.status(503).json({ 
                    success: false, 
                    error: 'Failed to parse AI response as JSON',
                    errorCode: 'JSON_PARSE_ERROR',
                    raw: rawText
                });
            }
        }

        // Validate the response structure
        if (!parsedData.postText || typeof parsedData.postText !== 'string') {
            throw new Error('Invalid response structure - missing or invalid postText');
        }

        // Ensure hashtags is an array
        if (!parsedData.hashtags || !Array.isArray(parsedData.hashtags)) {
            parsedData.hashtags = [];
        }

        log.info(`[Vertex AI] Successfully generated LinkedIn post (${parsedData.postText.length} characters)`);

        return res.status(200).json({ 
            success: true, 
            data: parsedData,
            message: 'LinkedIn post generated successfully'
        });

    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
        log.error({ err: errorMessage }, 'Vertex AI LinkedIn Post Generation Error:');
        return res.status(503).json({ 
            success: false, 
            error: `AI LinkedIn Post Generation Error: ${errorMessage}`,
            errorCode: 'VERTEX_AI_FAILURE'
        });
    }
};
