import { Router } from 'express';
import { authenticateToken } from '../middlewares/tokenValidation';
import { parseJobRateLimiter } from '../middlewares/parseJobRateLimit';
import { parseJobData, jobInterviewBuddyChat, generateEoMProfile, generateEoMTiers, generateEoMAnswerSuggestions, generateFlipCard, generateBatchFlipCards, generateLinkedInPost, generateVideoCv, generateAdminScript, rewriteCvSection, suggestSkillsForProfile, generateJobBrief } from '../controller/ai.controller';

const router = Router();

// POST /api/ai/parse-job
// Handles the request for extracting structured data using Vertex AI.
router.post(
  '/parse-job',
  authenticateToken(['master_admin', 'org_admin', 'student', 'hod']),
  parseJobRateLimiter,
  parseJobData
);

// POST /api/ai/job-interview-buddy-chat
// Handles AI-powered Job Interview Buddy chat conversations
router.post('/job-interview-buddy-chat', jobInterviewBuddyChat);

// POST /api/ai/generate-eom-profile
// Generates Employee of the Month profile from AI-guided responses
router.post('/generate-eom-profile', generateEoMProfile);

// POST /api/ai/generate-eom-tiers
// Generates difficulty tier adjustments for an EoM profile
router.post('/generate-eom-tiers', generateEoMTiers);

// POST /api/ai/generate-eom-suggestions
// Generates AI-powered answer suggestions for EoM discovery questions
router.post('/generate-eom-suggestions', generateEoMAnswerSuggestions);

// POST /api/ai/generate-linkedin-post
// Generates a professional LinkedIn post using AI
router.post('/generate-linkedin-post', generateLinkedInPost);


// POST /api/ai/generate-flip-card
// Generates AI-powered flip card for a skill
router.post('/generate-flip-card', generateFlipCard);

// POST /api/ai/generate-batch-flip-cards
// Generates multiple AI-powered flip cards in batch
router.post('/generate-batch-flip-cards', generateBatchFlipCards);

// POST /api/ai/generate-video-cv
// Generates AI-powered video CV script based on user's CV data and job requirements
router.post('/generate-video-cv', generateVideoCv);

// POST /api/ai/generate-admin-script (org_admin / master_admin only)
router.post('/generate-admin-script', authenticateToken(['org_admin', 'master_admin']), generateAdminScript);

// POST /api/ai/rewrite-cv-section – rewrite a CV section for ATS alignment (student or org_admin editing a student's CV)
router.post('/rewrite-cv-section', authenticateToken(['student', 'org_admin']), rewriteCvSection);

// POST /api/ai/suggest-skills-for-profile – suggest skills from job/assessment for CV (student = self; org_admin pass userId in body for target student)
router.post('/suggest-skills-for-profile', authenticateToken(['student', 'org_admin']), suggestSkillsForProfile);
// POST /api/ai/generate-job-brief – generate and save job brief readable module (org_admin / master_admin)
router.post('/generate-job-brief', authenticateToken(['org_admin', 'master_admin']), generateJobBrief);

export default router;