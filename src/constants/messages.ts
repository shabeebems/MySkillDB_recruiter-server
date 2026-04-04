export enum Messages {
  INTERNAL_SERVER_ERROR = "❌ Internal server error.",

  // Login Messages
  LOGIN_SUCCESS = "✅ Logged in successfully.",
  PASSWORD_INCORRECT = "❌ The password you entered is incorrect.",
  USER_BLOCKED = "❌ This account has been blocked. Please contact support.",
  USER_NOT_FOUND = "❌ No account found with the provided email address.",

  ACCESS_TOKEN_NOT_DEFINED = "❌ACCESS_TOKEN_SECRET is not defined in environment variables",
  REFRESH_TOKEN_NOT_DEFINED = "❌REFRESH_TOKEN_SECRET is not defined in environment variables",

  VALIDATION_FAILED = "❌ Validation failed",

  CREATABLE_ROLES_FETCHED = "✅ Creatable roles fetched successfully based on your role.",
  USER_CREATED_SUCCESS = "✅ New user created successfully.",

  // -------- Country --------
  COUNTRY_CREATED_SUCCESS = "Country created successfully",
  COUNTRY_FETCH_SUCCESS = "Countries fetched successfully",
  COUNTRY_UPDATED_SUCCESS = "Country updated successfully",
  COUNTRY_DELETED_SUCCESS = "Country deleted successfully",
  COUNTRY_NOT_FOUND = "Country not found",

  // -------- State --------
  STATE_CREATED_SUCCESS = "State created successfully",
  STATE_FETCH_SUCCESS = "States fetched successfully",
  STATE_UPDATED_SUCCESS = "State updated successfully",
  STATE_DELETED_SUCCESS = "State deleted successfully",
  STATE_NOT_FOUND = "State not found",

  // -------- District --------
  DISTRICT_CREATED_SUCCESS = "District created successfully",
  DISTRICT_FETCH_SUCCESS = "Districts fetched successfully",
  DISTRICT_UPDATED_SUCCESS = "District updated successfully",
  DISTRICT_DELETED_SUCCESS = "District deleted successfully",

  SYSTEM_SETTING_UPDATED_SUCCESS = "✅ Value added or updated successfully.",
  SYSTEM_SETTING_FETCH_SUCCESS = "✅ Values fetched successfully.",

  ORGANIZATION_CREATED_SUCCESS = "Organization created successfully.",
  ORGANIZATION_FETCH_SUCCESS = "Organizations fetched successfully.",
  ORGANIZATION_FETCH_SINGLE_SUCCESS = "Organization fetched successfully.",
  ORGANIZATION_UPDATED_SUCCESS = "Organization updated successfully.",
  ORGANIZATION_NOT_FOUND = "Organization not found.",
  ORGANIZATION_STATUS_UPDATED = "Organization status updated successfully.",
  ORGANIZATION_NOT_ACTIVE = "❌ Your organization is not active. Please contact support.",
  ADMIN_EMAIL_ALREADY_EXISTS = "Admin email already exists.",
  EMAIL_ALREADY_EXISTS = "Email already exists.",
  MOBILE_NUMBER_ALREADY_EXISTS = "Mobile number already exists.",
  HOD_ALREADY_EXISTS = "A Head of Department already exists for this department.",

  // -------- Department --------
  DEPARTMENT_CREATED_SUCCESS = "Department created successfully",
  DEPARTMENT_FETCH_SUCCESS = "Departments fetched successfully",
  DEPARTMENT_UPDATED_SUCCESS = "Department updated successfully",
  DEPARTMENT_DELETED_SUCCESS = "Department deleted successfully",
  DEPARTMENT_NOT_FOUND = "Department not found",
  DEPARTMENT_ALREADY_EXISTS = "Department with this name already exists in the organization",

  // -------- Class --------
  CLASS_CREATED_SUCCESS = "Class created successfully",
  CLASS_FETCH_SUCCESS = "Classes fetched successfully",
  CLASS_UPDATED_SUCCESS = "Class updated successfully",
  CLASS_DELETED_SUCCESS = "Class deleted successfully",
  CLASS_NOT_FOUND = "Class not found",
  CLASS_ALREADY_EXISTS = "Class with this name already exists in the organization",

  // -------- Section --------
  SECTION_CREATED_SUCCESS = "Section created successfully",
  SECTION_FETCH_SUCCESS = "Sections fetched successfully",
  SECTION_UPDATED_SUCCESS = "Section updated successfully",
  SECTION_DELETED_SUCCESS = "Section deleted successfully",
  SECTION_NOT_FOUND = "Section not found",
  SECTION_ALREADY_EXISTS = "Section with this name already exists in the organization",

  // -------- Subject --------
  SUBJECT_CREATED_SUCCESS = "Subject created successfully",
  SUBJECT_FETCH_SUCCESS = "Subjects fetched successfully",
  SUBJECT_UPDATED_SUCCESS = "Subject updated successfully",
  SUBJECT_DELETED_SUCCESS = "Subject deleted successfully",
  SUBJECT_NOT_FOUND = "Subject not found",
  SUBJECT_ALREADY_EXISTS = "Subject with this name or code already exists in the organization and department",

  // -------- Assignment --------
  ASSIGNMENT_CREATED_SUCCESS = "Assignment created successfully",
  ASSIGNMENT_FETCH_SUCCESS = "Assignments fetched successfully",
  ASSIGNMENT_UPDATED_SUCCESS = "Assignment updated successfully",
  ASSIGNMENT_DELETED_SUCCESS = "Assignment deleted successfully",
  ASSIGNMENT_NOT_FOUND = "Assignment not found",
  ASSIGNMENT_ALREADY_EXISTS = "Assignment already exists for one or more selected sections.",
  LOGOUT_SUCCESS = "You have been logged out successfully.",

  // -------- Teaching Assignment --------
  TEACHING_ASSIGNMENT_CREATED_SUCCESS = "Teaching assignment created successfully",
  TEACHING_ASSIGNMENTS_FETCHED_SUCCESS = "Teaching assignments fetched successfully",
  TEACHING_ASSIGNMENT_UPDATED_SUCCESS = "Teaching assignment updated successfully",

  // -------- Topic --------
  TOPIC_CREATED_SUCCESS = "Topic created successfully",
  TOPIC_BATCH_CREATED_SUCCESS = "Topics created successfully",
  TOPIC_FETCH_SUCCESS = "Topics fetched successfully",
  TOPIC_FETCH_SINGLE_SUCCESS = "Topic fetched successfully",
  TOPIC_UPDATED_SUCCESS = "Topic updated successfully",
  TOPIC_DELETED_SUCCESS = "Topic deleted successfully",
  TOPIC_NOT_FOUND = "Topic not found",
  TOPIC_ALREADY_EXISTS = "Topic with this name already exists for the subject",

  // -------- Skill --------
  SKILL_CREATED_SUCCESS = "Skill created successfully",
  SKILL_FETCH_SUCCESS = "Skills fetched successfully",
  SKILL_FETCH_SINGLE_SUCCESS = "Skill fetched successfully",
  SKILL_UPDATED_SUCCESS = "Skill updated successfully",
  SKILL_DELETED_SUCCESS = "Skill deleted successfully",
  SKILL_NOT_FOUND = "Skill not found",
  SKILL_ALREADY_EXISTS = "Skill with this name already exists for the job",

  // -------- Flip Card --------
  FLIP_CARD_CREATED_SUCCESS = "Flip card created successfully",
  FLIP_CARD_FETCH_SUCCESS = "Flip cards fetched successfully",
  FLIP_CARD_UPDATED_SUCCESS = "Flip card updated successfully",
  FLIP_CARD_DELETED_SUCCESS = "Flip card deleted successfully",
  FLIP_CARD_NOT_FOUND = "Flip card not found",

  // -------- Job --------
  JOB_CREATED_SUCCESS = "Job created successfully",
  JOB_UPDATED_SUCCESS = "Job updated successfully",
  JOB_FETCH_SUCCESS = "Jobs fetched successfully",
  JOB_NOT_FOUND = "Job not found",
  JOB_ACCESS_DENIED = "You do not have access to this job",
  ORGANIZATION_ACCESS_DENIED = "You do not have access to this organization.",

  // -------- Job Sprint --------
  JOB_SPRINT_CREATED_SUCCESS = "Job sprint created successfully",
  JOB_SPRINT_FETCH_SUCCESS = "Job sprints fetched successfully",
  JOB_SPRINT_NOT_FOUND = "Job sprint not found",

  // -------- Virtual Session --------
  VIRTUAL_SESSION_CREATED_SUCCESS = "Virtual session created successfully",
  VIRTUAL_SESSION_FETCH_SUCCESS = "Virtual sessions fetched successfully",
  VIRTUAL_SESSION_NOT_FOUND = "Virtual session not found",

  // -------- Test / Question / Answer --------
  TEST_CREATED_SUCCESS = "Test created successfully",
  TEST_UPDATED_SUCCESS = "Test updated successfully",
  TEST_FETCH_SUCCESS = "Tests fetched successfully",
  TEST_NOT_FOUND = "Test not found",
  TEST_DELETED_SUCCESS = "Test deleted successfully",
  JOB_LEVEL_TEST_ALREADY_EXISTS = "A job-level test already exists for this job. Only one job-level test is allowed per job.",
  SKILL_LEVEL_TEST_ALREADY_EXISTS = "A skill-level test already exists for this skill. Only one skill-level test is allowed per skill.",

  // -------- Recording --------
  RECORDING_CREATED_SUCCESS = "Recording created successfully",
  RECORDING_FETCH_SUCCESS = "Recordings fetched successfully",
  RECORDING_NOT_FOUND = "Recording not found",
  RECORDING_DELETED_SUCCESS = "Recording deleted successfully",

  // -------- Interview Planner --------
  INTERVIEW_PLANNER_ADDED_SUCCESS = "Job added to interview planner successfully",
  INTERVIEW_PLANNER_FETCH_SUCCESS = "Interview planner jobs fetched successfully",
  INTERVIEW_PLANNER_DELETED_SUCCESS = "Job removed from interview planner successfully",

  // -------- Reading Module --------
  READING_MODULE_CREATED_SUCCESS = "Reading module created successfully",
  READING_MODULE_FETCH_SUCCESS = "Reading module fetched successfully",

  // -------- Video Script --------
  VIDEO_SCRIPT_CREATED_SUCCESS = "Video script created successfully",
  VIDEO_SCRIPT_FETCH_SUCCESS = "Video scripts fetched successfully",
  VIDEO_SCRIPT_SECTIONS_FETCH_SUCCESS = "Video script sections fetched successfully",

  INTERVIEW_BUDDY_CHAT_FETCH_SUCCESS = "Interview Buddy chat fetched successfully",
  INTERVIEW_BUDDY_CHAT_SAVED_SUCCESS = "Interview Buddy chat saved successfully",

  // -------- Contact --------
  CONTACT_CREATED_SUCCESS = "Contact created successfully",
  CONTACT_FETCH_SUCCESS = "Contacts fetched successfully",
  CONTACT_NOT_FOUND = "Contact not found",
  CONTACT_DELETED_SUCCESS = "Contact deleted successfully",
  CONTACT_UPDATED_SUCCESS = "Contact updated successfully",
  // -------- Certificate --------
  CERTIFICATE_CREATED_SUCCESS = "Certificate created successfully",
  CERTIFICATE_FETCH_SUCCESS = "Certificates fetched successfully",

  // -------- Testimonial --------
  TESTIMONIAL_CREATED_SUCCESS = "Testimonial created successfully",
  TESTIMONIAL_FETCH_SUCCESS = "Testimonials fetched successfully",

  // -------- LinkedIn Post --------
  LINKEDIN_POST_CREATED_SUCCESS = "LinkedIn post created successfully",
  LINKEDIN_POST_FETCH_SUCCESS = "LinkedIn posts fetched successfully",

  // -------- Student Video --------
  STUDENT_VIDEO_CREATED_SUCCESS = "Student video created successfully",
  STUDENT_VIDEO_FETCH_SUCCESS = "Student videos fetched successfully",

  // -------- CV Profile --------
  CV_PROFILE_CREATED_SUCCESS = "CV profile created successfully",
  CV_PROFILE_UPDATED_SUCCESS = "CV profile updated successfully",
  CV_PROFILE_FETCH_SUCCESS = "CV profile fetched successfully",
  CV_PROFILE_NOT_FOUND = "CV profile not found",

  // -------- CV Education --------
  CV_EDUCATION_CREATED_SUCCESS = "CV education created successfully",
  CV_EDUCATION_UPDATED_SUCCESS = "CV education updated successfully",
  CV_EDUCATION_DELETED_SUCCESS = "CV education deleted successfully",
  CV_EDUCATION_FETCH_SUCCESS = "CV education fetched successfully",
  CV_EDUCATION_NOT_FOUND = "CV education not found",

  // -------- CV Experience --------
  CV_EXPERIENCE_CREATED_SUCCESS = "CV experience created successfully",
  CV_EXPERIENCE_UPDATED_SUCCESS = "CV experience updated successfully",
  CV_EXPERIENCE_DELETED_SUCCESS = "CV experience deleted successfully",
  CV_EXPERIENCE_FETCH_SUCCESS = "CV experience fetched successfully",
  CV_EXPERIENCE_NOT_FOUND = "CV experience not found",

  // -------- CV Project --------
  CV_PROJECT_CREATED_SUCCESS = "CV project created successfully",
  CV_PROJECT_UPDATED_SUCCESS = "CV project updated successfully",
  CV_PROJECT_DELETED_SUCCESS = "CV project deleted successfully",
  CV_PROJECT_FETCH_SUCCESS = "CV projects fetched successfully",
  CV_PROJECT_NOT_FOUND = "CV project not found",

  // -------- CV Certificate --------
  CV_CERTIFICATE_CREATED_SUCCESS = "CV certificate created successfully",
  CV_CERTIFICATE_UPDATED_SUCCESS = "CV certificate updated successfully",
  CV_CERTIFICATE_DELETED_SUCCESS = "CV certificate deleted successfully",
  CV_CERTIFICATE_FETCH_SUCCESS = "CV certificates fetched successfully",
  CV_CERTIFICATE_NOT_FOUND = "CV certificate not found",

  CV_STYLE_FETCH_SUCCESS = "CV style preferences fetched successfully",
  CV_STYLE_SAVED_SUCCESS = "CV font and color preferences saved successfully",
  CV_STYLE_NOT_FOUND = "CV style preferences not found",

  // -------- Password Change --------
  PASSWORD_CHANGE_SUCCESS = "Password changed successfully",
  PASSWORD_CHANGE_FAILED = "Failed to change password",
  PASSWORD_INVALID_FORMAT = "Password must be at least 8 characters long and contain at least 1 digit",
  PASSWORD_MISMATCH = "New password and confirm password do not match",
  OLD_PASSWORD_INCORRECT = "Old password is incorrect",
  OLD_PASSWORD_REQUIRED = "Old password is required",
}

export enum LogMessages {
  HANDLE_REQUEST_ERROR = "handleRequest error:",
}
