/**
 * Prompt template for generating video CV scripts
 * Creates personalized video CV scripts based on user's CV data and job requirements
 */
export const buildVideoCvPrompt = (
  studentName: string,
  jobTitle: string,
  company: string,
  jobDescription: string | undefined,
  userReasons: string | undefined,
  videoDuration: string,
  profileData: any
): string => {
  const durationMap: { [key: string]: string } = {
    '1-2': '1-2 minutes',
    '2-3': '2-3 minutes',
    '5-7': '5-7 minutes',
    '8-10': '8-10 minutes'
  };

  const duration = durationMap[videoDuration] || '1-2 minutes';

  // Build profile section
  const profileSection = profileData?.name
    ? `**Candidate Profile:**
- Name: ${profileData.name}
- Email: ${profileData.email || 'Not provided'}
- Location: ${profileData.address || 'Not provided'}
- About: ${profileData.aboutMe || 'Not provided'}
- LinkedIn: ${profileData.linkedIn || 'Not provided'}
- GitHub: ${profileData.github || 'Not provided'}
- Portfolio: ${profileData.portfolio || 'Not provided'}`
    : '**Candidate Profile:** Not available';

  // Build education section
  const educationSection =
    profileData?.education && profileData.education.length > 0
      ? `**Education:**
${profileData.education
  .map(
    (edu: any, idx: number) => `${idx + 1}. ${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}${edu.location ? `, ${edu.location}` : ''}${edu.startYear && edu.endYear ? ` (${edu.startYear}-${edu.endYear})` : ''}${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}`
  )
  .join('\n')}`
      : '**Education:** Not provided';

  // Build experience section
  const experienceSection =
    profileData?.experience && profileData.experience.length > 0
      ? `**Work Experience:**
${profileData.experience
  .map(
    (exp: any, idx: number) => `${idx + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'}${exp.location ? `, ${exp.location}` : ''}${exp.startDate && exp.endDate ? ` (${exp.startDate} - ${exp.endDate})` : ''}${exp.description ? `\n   ${exp.description}` : ''}`
  )
  .join('\n\n')}`
      : '**Work Experience:** Not provided';

  // Build projects section
  const projectsSection =
    profileData?.projects && profileData.projects.length > 0
      ? `**Projects:**
${profileData.projects
  .map(
    (proj: any, idx: number) => `${idx + 1}. ${proj.title || 'Project'}${proj.description ? `\n   ${proj.description}` : ''}${proj.technologies && proj.technologies.length > 0 ? `\n   Technologies: ${proj.technologies.join(', ')}` : ''}${proj.link ? `\n   Link: ${proj.link}` : ''}`
  )
  .join('\n\n')}`
      : '**Projects:** Not provided';

  // Build certificates section
  const certificatesSection =
    profileData?.certificates && profileData.certificates.length > 0
      ? `**Certificates:**
${profileData.certificates
  .map(
    (cert: any, idx: number) => `${idx + 1}. ${cert.name || 'Certificate'} from ${cert.issuer || 'Issuer'}${cert.date ? ` (${cert.date})` : ''}${cert.link ? ` - ${cert.link}` : ''}`
  )
  .join('\n')}`
      : '**Certificates:** Not provided';

  const userReasonsSection = userReasons
    ? `**Candidate's Reasons for Fit:**
${userReasons}`
    : '';

  const jobDescriptionSection = jobDescription
    ? `**Job Description:**
${jobDescription}`
    : '';

  return `You are an expert video script writer specializing in creating compelling video CV (video resume) scripts. Create a professional, engaging video CV script for ${studentName} applying for the position of ${jobTitle} at ${company}.

${profileSection}

${educationSection}

${experienceSection}

${projectsSection}

${certificatesSection}

${jobDescriptionSection}

${userReasonsSection}

**Requirements:**
- Duration: ${duration} (approximately ${duration === '1-2 minutes' ? '150-300' : duration === '2-3 minutes' ? '300-450' : duration === '5-7 minutes' ? '700-900' : '1000-1200'} words)
- Format: Professional video CV script with timestamps
- Style: Confident, authentic, and engaging
- Tone: Professional yet personable, enthusiastic but not over-the-top
- Structure: Should include introduction, main content (skills/experience), and strong closing

**Script Structure:**
1. **Introduction (0:00-0:30)**: Hook the viewer, introduce yourself, and state your interest in the position
2. **Main Content**: Highlight your relevant experience, skills, and achievements
3. **Why You're a Fit**: Connect your background to the job requirements
4. **Closing (last 30 seconds)**: Strong call-to-action, express enthusiasm, thank the viewer

**Guidelines:**
- Use natural, conversational language (as if speaking directly to the hiring manager)
- Be specific about achievements and experiences
- Connect your background to the job requirements
- Show enthusiasm and genuine interest
- Keep it authentic and avoid generic statements
- If certain sections (education, experience, etc.) are missing, focus on what's available
- Make it memorable and stand out from typical video CVs
- Include natural pauses and emphasis points

**Return ONLY valid JSON in this exact format:**
{
  "sections": [
    {
      "timestamp": "0:00-0:30",
      "section": "Introduction",
      "script": "Full script text for this section..."
    },
    {
      "timestamp": "0:30-1:30",
      "section": "Background & Experience",
      "script": "Full script text for this section..."
    },
    {
      "timestamp": "1:30-2:30",
      "section": "Skills & Achievements",
      "script": "Full script text for this section..."
    },
    {
      "timestamp": "2:30-3:00",
      "section": "Why I'm a Fit",
      "script": "Full script text for this section..."
    },
    {
      "timestamp": "3:00-3:30",
      "section": "Closing",
      "script": "Full script text for this section..."
    }
  ],
  "tips": [
    "Tip 1 for recording",
    "Tip 2 for recording",
    "Tip 3 for recording"
  ]
}

**Important:**
- Adjust the number of sections and timestamps based on the requested duration
- Ensure timestamps add up to the total duration
- Make each section flow naturally into the next
- The script should be ready to read aloud
- Return ONLY the JSON object, no additional text or markdown formatting`;
};

