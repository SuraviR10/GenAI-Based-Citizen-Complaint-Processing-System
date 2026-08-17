// ====================================================================
// CIVICCONNECT AI - COMPREHENSIVE MULTILINGUAL DICTIONARY (EN / KN / HI)
// ====================================================================

export type LanguageCode = 'English' | 'Kannada' | 'Hindi';

export interface Translations {
  // Navigation & Layout
  appTitle: string;
  citizenPortal: string;
  enterCitizenPortal: string;
  reportProblem: string;
  exploreProblems: string;
  myReports: string;
  supportedIssues: string;
  tracking: string;
  helpCenter: string;
  profile: string;
  login: string;
  signIn: string;
  register: string;
  registerCitizen: string;
  logout: string;
  dashboard: string;
  notifications: string;
  noNotifications: string;
  markAllRead: string;
  activeSession: string;
  previewMode: string;
  liveDatabase: string;
  databaseStatus: string;
  setupLiveDatabase: string;
  connected: string;
  offline: string;
  menu: string;
  close: string;
  footerDescription: string;
  quickLinks: string;
  officialPortals: string;
  copyright: string;
  shareIssue: string;
  copyTrackingId: string;

  // Greetings & Dashboard
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  dashboardHeroTitle: string;
  dashboardHeroSubtitle: string;
  heroReportNow: string;
  heroExploreNow: string;
  statMyReports: string;
  statSupported: string;
  statInProgress: string;
  statResolved: string;
  activeRepairs: string;
  completedFixes: string;
  nearbyIssuesTitle: string;
  nearbyIssuesSubtitle: string;
  problemsNearYou: string;
  viewAllCommunityIssues: string;
  recentUpdatesTitle: string;
  recentUpdatesSubtitle: string;
  recentUpdatesEmpty: string;
  quickActionsTitle: string;
  quickCivicActions: string;
  openAction: string;
  viewDetailsAction: string;
  trackProgressAction: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;

  // Report Wizard Stepper
  stepDescribe: string;
  stepLocation: string;
  stepEvidence: string;
  stepAIReview: string;
  stepSubmit: string;

  // Step 1: Describe
  step1Title: string;
  step1Subtitle: string;
  step1Placeholder: string;
  step1WritingIn: string;
  step1TipsTitle: string;
  step1Tip1: string;
  step1Tip2: string;
  step1Tip3: string;
  step1ErrorMinChars: string;

  // Step 2: Location
  step2Title: string;
  step2Subtitle: string;
  step2AreaLabel: string;
  step2AreaPlaceholder: string;
  step2LandmarkLabel: string;
  step2LandmarkPlaceholder: string;
  step2AddressLabel: string;
  step2AddressPlaceholder: string;
  step2GpsButton: string;
  step2GpsDetecting: string;
  step2GpsDetected: string;
  step2GpsPrompt: string;
  locationPermissionPrompt: string;

  // Step 3: Evidence & Safety
  step3Title: string;
  step3Subtitle: string;
  step3UploadLabel: string;
  step3UploadHint: string;
  step3DurationLabel: string;
  accidentQuestion: string;
  accidentDisclaimer: string;
  step3AccidentYes: string;
  step3AccidentNo: string;
  step3AccidentDescLabel: string;
  step3AccidentDescPlaceholder: string;

  // Step 4: AI Review & Rejection State
  step4Title: string;
  step4Subtitle: string;
  step4AnalyzingTitle: string;
  step4AnimReading: string;
  step4AnimCategory: string;
  step4AnimSafety: string;
  step4AnimScanning: string;
  structuredExtractions: string;
  editDetails: string;
  doneEditing: string;
  categoryLabel: string;
  identifiedProblem: string;
  areaLocality: string;
  safetyUrgency: string;
  hazardReported: string;
  standardMaintenance: string;
  aiDisclaimer: string;
  similarFoundTitle: string;
  similarFoundDesc: string;
  viewSimilarButton: string;

  // Non-civic Rejection UI
  rejectionTitle: string;
  rejectionSubtitle: string;
  rejectionWhatCanReport: string;
  rejectionTopicRoads: string;
  rejectionTopicWater: string;
  rejectionTopicLights: string;
  rejectionTopicGarbage: string;
  rejectionTopicHazards: string;
  rejectionEditButton: string;

  // Step 5: Final Review & Submit
  step5Title: string;
  step5Subtitle: string;
  step5ReviewHeader: string;
  step5LocationDetails: string;
  step5Duration: string;
  step5EvidenceFiles: string;
  step5WhatHappensNextTitle: string;
  step5WhatHappensNextDesc: string;
  submitReport: string;
  submittingReport: string;
  backButton: string;
  continueButton: string;
  analyzeAIButton: string;

  // Similar Issues Modal
  similarModalTitle: string;
  similarModalSubtitle: string;
  sameProblemButton: string;
  differentProblemButton: string;
  supporters: string;
  similarMatchScore: string;

  // Submission Success
  successTitle: string;
  successSubtitle: string;
  viewDetails: string;
  trackProblem: string;
  goToDashboardButton: string;

  // Community Issues Page & Filters
  exploreTitle: string;
  exploreSubtitle: string;
  communityIssues: string;
  searchPlaceholder: string;
  allCategoriesFilter: string;
  allPrioritiesFilter: string;
  allStatusesFilter: string;
  sortNewest: string;
  sortPriority: string;
  sortOldest: string;
  noProblemsFound: string;
  noIssuesDescription: string;
  exploreMoreIssues: string;

  // Issue Tracking Page
  reportedStatus: string;
  reviewedStatus: string;
  assignedStatus: string;
  inProgressStatus: string;
  resolvedStatus: string;
  trackingReferenceLabel: string;
  realTimeProgressTitle: string;
  currentStatusBanner: string;
  detailedWorkTimeline: string;
  officialProgressTimeline: string;
  trackingStep1Desc: string;
  trackingStep2Desc: string;
  trackingStep3Desc: string;
  trackingStep4Desc: string;
  trackingStep5Desc: string;

  // My Complaints & Supported Issues
  myComplaintsTitle: string;
  myComplaintsSubtitle: string;
  noComplaintsTitle: string;
  noComplaintsDescription: string;
  connectedToCommunityIssue: string;
  supportedIssuesTitle: string;
  supportedIssuesSubtitle: string;
  noSupportedIssuesTitle: string;
  noSupportedIssuesDesc: string;

  // Profile & Auth
  profileTitle: string;
  profileSubtitle: string;
  fullNameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  preferredLanguageLabel: string;
  saveChangesButton: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  forgotPasswordLink: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  sendResetLinkButton: string;
  returnToSignIn: string;
  quickDemoLogin: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  invalidCredentials: string;
  langEnglish: string;
  langKannada: string;
  langHindi: string;

  // Help Center FAQ
  helpCenterTitle: string;
  helpCenterSubtitle: string;
  faq1Category: string;
  faq1Question: string;
  faq1Answer: string;
  faq2Category: string;
  faq2Question: string;
  faq2Answer: string;
  faq3Category: string;
  faq3Question: string;
  faq3Answer: string;
  faq4Category: string;
  faq4Question: string;
  faq4Answer: string;
  faq5Category: string;
  faq5Question: string;
  faq5Answer: string;
}

export const translations: Record<LanguageCode, Translations> = {
  English: {
    appTitle: 'CivicConnect AI',
    citizenPortal: 'Citizen Portal',
    enterCitizenPortal: 'Enter Citizen Portal',
    reportProblem: 'Report a Problem',
    exploreProblems: 'Explore Issues',
    myReports: 'My Reports',
    supportedIssues: 'Supported Issues',
    tracking: 'Track Progress',
    helpCenter: 'Help Center',
    profile: 'Profile Settings',
    login: 'Sign In',
    signIn: 'Sign In',
    register: 'Register',
    registerCitizen: 'Register as Citizen',
    logout: 'Sign Out',
    dashboard: 'Dashboard',
    notifications: 'Notifications',
    noNotifications: 'No notifications yet',
    markAllRead: 'Mark all as read',
    activeSession: 'Citizen Session Active',
    previewMode: 'Local Preview Mode',
    liveDatabase: 'Supabase Live Connected',
    databaseStatus: 'Database & Cloud Status',
    setupLiveDatabase: 'Setup Live Supabase',
    connected: 'Connected',
    offline: 'Offline / Cached',
    menu: 'Menu',
    close: 'Close',
    footerDescription: 'Empowering citizens with AI-assisted municipal triage, similarity deduplication, and verified tracking.',
    quickLinks: 'Quick Links',
    officialPortals: 'Municipal Portals',
    copyright: '© 2026 CivicConnect AI. Built for Transparent Municipal Governance.',
    shareIssue: 'Share Issue',
    copyTrackingId: 'Copy reference ID',

    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    heroTagline: 'Empowering Citizens. Accelerating Municipal Action.',
    heroTitle: 'Empowering Citizens. Accelerating Municipal Action.',
    heroSubtitle: 'Report potholes, water leaks, streetlights, or waste in your natural language. Our AI connects matching reports into a single community cause.',
    dashboardHeroTitle: 'Empowering Citizens. Accelerating Municipal Action.',
    dashboardHeroSubtitle: 'Report problems, support community issues in your ward, and follow official repair progress.',
    heroReportNow: 'Report a Civic Problem',
    heroExploreNow: 'Explore Community Issues',
    statMyReports: 'My Reports',
    statSupported: 'Supported',
    statInProgress: 'In Progress',
    statResolved: 'Resolved',
    activeRepairs: 'Active municipal repairs',
    completedFixes: 'Completed fixes in ward',
    nearbyIssuesTitle: 'Problems Near You',
    nearbyIssuesSubtitle: 'Active community issues reported in your locality',
    problemsNearYou: 'Problems Near You',
    viewAllCommunityIssues: 'View all community issues',
    recentUpdatesTitle: 'Recent Municipal Updates',
    recentUpdatesSubtitle: 'Real-time inspection and repair timeline from municipal field workers',
    recentUpdatesEmpty: 'No recent updates in your area yet. Once reports are reviewed or workers are dispatched, live progress will appear here.',
    quickActionsTitle: 'Quick Civic Actions',
    quickCivicActions: 'Quick Civic Actions',
    openAction: 'Open',
    viewDetailsAction: 'View Details',
    trackProgressAction: 'Track Progress',
    feature1Title: 'Natural Language AI',
    feature1Desc: 'Write informal complaints in English, Kannada, or Hindi. AI automatically extracts location, severity, and civic categories.',
    feature2Title: 'Similarity Deduplication',
    feature2Desc: 'Prevents duplicate tickets by uniting matching complaints in the same locality into a single high-priority civic cause.',
    feature3Title: 'Transparent Tracking',
    feature3Desc: 'Follow every step from municipal review to worker dispatch. Complex bureaucratic statements are simplified into plain words.',

    stepDescribe: 'Describe',
    stepLocation: 'Location',
    stepEvidence: 'Evidence & Safety',
    stepAIReview: 'AI Review',
    stepSubmit: 'Submit',

    step1Title: 'Describe What is Happening',
    step1Subtitle: 'Write naturally in your everyday language. No technical terms or category selection needed.',
    step1Placeholder: 'e.g. There is a large pothole near the bus stop on 100 Feet Road that caused a bike to slip during rain yesterday...',
    step1WritingIn: 'Writing in:',
    step1TipsTitle: 'Helpful Details to Include:',
    step1Tip1: 'What the problem is (e.g. pothole, broken streetlight, sewage overflow)',
    step1Tip2: 'Approximate duration (how long it has been broken)',
    step1Tip3: 'Any safety hazards or accidents that occurred',
    step1ErrorMinChars: 'Please provide at least 10 characters describing the issue.',

    step2Title: 'Where is this Problem Located?',
    step2Subtitle: 'Helps us match with existing neighborhood reports and dispatch municipal teams accurately.',
    step2AreaLabel: 'Area / Ward / Neighborhood',
    step2AreaPlaceholder: 'e.g. Indiranagar, Koramangala, Sector 4 HSR',
    step2LandmarkLabel: 'Prominent Landmark (Optional)',
    step2LandmarkPlaceholder: 'e.g. Opposite National High School, Near Metro Pillar 104',
    step2AddressLabel: 'Street Address / Cross Road (Optional)',
    step2AddressPlaceholder: 'e.g. 12th Main Road, 4th Cross',
    step2GpsButton: 'Use GPS Location',
    step2GpsDetecting: 'Capturing GPS...',
    step2GpsDetected: 'Location Captured',
    step2GpsPrompt: 'Auto-detect location from device GPS',
    locationPermissionPrompt: 'Location permission denied. Please enter your area manually.',

    step3Title: 'Evidence Photos & Safety Assessment',
    step3Subtitle: 'Photos help municipal workers bring the right materials on the first trip.',
    step3UploadLabel: 'Upload Photos / Evidence (Optional but recommended)',
    step3UploadHint: 'JPEG, PNG or WebP images up to 10MB each',
    step3DurationLabel: 'How long has this problem existed?',
    accidentQuestion: 'Has an accident or near-miss occurred because of this problem?',
    accidentDisclaimer: 'Safety information is citizen-reported and used to expedite urgent repairs.',
    step3AccidentYes: 'Yes, someone had an accident',
    step3AccidentNo: 'No / Not sure',
    step3AccidentDescLabel: 'Please describe the incident briefly',
    step3AccidentDescPlaceholder: 'e.g. A two-wheeler skidded on the wet trench yesterday evening...',

    step4Title: 'AI Analysis & Safety Verification',
    step4Subtitle: 'CivicConnect AI has analyzed your report and organized the key details.',
    step4AnalyzingTitle: 'Understanding your report...',
    step4AnimReading: 'Reading your description & language',
    step4AnimCategory: 'Identifying civic category & severity',
    step4AnimSafety: 'Evaluating safety factors & duration',
    step4AnimScanning: 'Scanning for existing community issues',
    structuredExtractions: 'Structured AI Extractions',
    editDetails: 'Edit Details',
    doneEditing: 'Done Editing',
    categoryLabel: 'Civic Category',
    identifiedProblem: 'Identified Problem',
    areaLocality: 'Area / Locality',
    safetyUrgency: 'Safety & Urgency',
    hazardReported: 'Hazard Reported (Citizen Data)',
    standardMaintenance: 'Standard Civic Maintenance',
    aiDisclaimer: 'AI-assisted classification. You can edit any field before submitting.',
    similarFoundTitle: 'Similar Community Issues Found',
    similarFoundDesc: 'Connecting your complaint with an existing issue boosts community support and avoids duplicate tickets.',
    viewSimilarButton: 'View Similar Issues',

    rejectionTitle: 'This is not the right place to complain about this',
    rejectionSubtitle: 'CivicConnect AI is dedicated solely to public municipal infrastructure and civic problems.',
    rejectionWhatCanReport: 'What you CAN report on CivicConnect AI:',
    rejectionTopicRoads: 'Damaged roads, potholes, broken footpaths & missing manhole covers',
    rejectionTopicWater: 'Water pipe leaks, drainage blockages & sewage overflow',
    rejectionTopicLights: 'Non-functioning streetlights, exposed wires & dark road stretches',
    rejectionTopicGarbage: 'Garbage accumulation, overflowing dumpsters & improper waste dumping',
    rejectionTopicHazards: 'Fallen trees, dangerous roadside hazards & public health risks',
    rejectionEditButton: 'Edit Complaint Description',

    step5Title: 'Final Review & Confirmation',
    step5Subtitle: 'Verify your report details before submitting to the municipal database.',
    step5ReviewHeader: 'Submission Summary',
    step5LocationDetails: 'Location Details',
    step5Duration: 'Duration',
    step5EvidenceFiles: 'Attached Photos',
    step5WhatHappensNextTitle: 'What happens after submission?',
    step5WhatHappensNextDesc: 'Your complaint is consolidated with community reports and prioritized for municipal engineers.',
    submitReport: 'Submit Civic Report',
    submittingReport: 'Submitting to database...',
    backButton: 'Back',
    continueButton: 'Continue',
    analyzeAIButton: 'Analyze with AI',

    similarModalTitle: 'We found a problem that may be related',
    similarModalSubtitle: 'Connecting your report to an existing community issue gives it more support and avoids duplicate public tickets.',
    sameProblemButton: 'This is the Same Problem (+1 Support)',
    differentProblemButton: 'No, this is a Different Problem',
    supporters: 'supporters',
    similarMatchScore: 'Why it matches',

    successTitle: 'Your report has been submitted!',
    successSubtitle: 'A consolidated community issue has been prioritized for municipal review.',
    viewDetails: 'View Issue Details',
    trackProblem: 'Track Live Progress',
    goToDashboardButton: 'Go to Dashboard',

    exploreTitle: 'Explore Community Issues',
    exploreSubtitle: 'Browse and support verified public problems across municipal wards.',
    communityIssues: 'Community Issues',
    searchPlaceholder: 'Search civic issues by description, street name, or landmark...',
    allCategoriesFilter: 'All Categories',
    allPrioritiesFilter: 'All Priorities',
    allStatusesFilter: 'All Statuses',
    sortNewest: 'Newest First',
    sortPriority: 'Highest Priority',
    sortOldest: 'Oldest First',
    noProblemsFound: 'No civic problems found',
    noIssuesDescription: 'No matching issues found for the selected filters. Try broadening your search or report a new problem.',
    exploreMoreIssues: 'Explore More Issues',

    reportedStatus: 'Reported',
    reviewedStatus: 'Reviewed',
    assignedStatus: 'Worker Assigned',
    inProgressStatus: 'In Progress',
    resolvedStatus: 'Resolved',
    trackingReferenceLabel: 'Complaint Reference ID',
    realTimeProgressTitle: 'Real-Time Resolution Progress',
    currentStatusBanner: 'Current Municipal Status',
    detailedWorkTimeline: 'Detailed Work Timeline',
    officialProgressTimeline: 'Official Progress & Inspection Timeline',
    trackingStep1Desc: 'Complaint received and prioritized',
    trackingStep2Desc: 'Inspected by Municipal Division',
    trackingStep3Desc: 'Field crew dispatched with work order',
    trackingStep4Desc: 'Remediation and repair underway',
    trackingStep5Desc: 'Site verified and resolved',

    myComplaintsTitle: 'My Reported Problems',
    myComplaintsSubtitle: 'Track the status of individual complaints you have submitted.',
    noComplaintsTitle: "You haven't reported a problem yet",
    noComplaintsDescription: 'Have you noticed potholes, garbage dumping, or broken streetlights in your ward? Submit a report in your own words.',
    connectedToCommunityIssue: 'Connected to Community Issue',
    supportedIssuesTitle: 'Supported Community Issues',
    supportedIssuesSubtitle: 'Issues you have backed to help prioritize municipal action in your locality.',
    noSupportedIssuesTitle: 'No supported issues yet',
    noSupportedIssuesDesc: 'Support community reports in your neighborhood to elevate their priority and receive automatic repair updates.',

    profileTitle: 'Citizen Profile & Preferences',
    profileSubtitle: 'Manage your contact information, registered locality, and preferred interface language.',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    preferredLanguageLabel: 'Preferred Application Language',
    saveChangesButton: 'Save Changes',
    loginTitle: 'Citizen Portal Sign In',
    loginSubtitle: 'Report problems, upvote neighborhood issues, and track municipal repairs.',
    registerTitle: 'Create Citizen Account',
    registerSubtitle: 'Join your locality to report civic issues and track municipal resolutions.',
    forgotPasswordTitle: 'Reset Password',
    forgotPasswordSubtitle: "We'll send you a password recovery link to your registered email.",
    forgotPasswordLink: 'Forgot password?',
    resetPasswordTitle: 'Reset Password',
    resetPasswordSubtitle: "We'll send you a password recovery link to your registered email.",
    sendResetLinkButton: 'Send Reset Link',
    returnToSignIn: 'Return to Sign In',
    quickDemoLogin: '1-Click Instant Citizen Login',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    invalidCredentials: 'Please provide valid credentials.',
    langEnglish: 'English',
    langKannada: 'ಕನ್ನಡ (Kannada)',
    langHindi: 'हिन्दी (Hindi)',

    helpCenterTitle: 'Citizen Help Center & FAQ',
    helpCenterSubtitle: 'Everything you need to know about reporting civic problems, community deduplication, and tracking municipal repairs.',
    faq1Category: 'Reporting & AI',
    faq1Question: 'How do I report a problem?',
    faq1Answer: 'Simply click "Report a Problem" and describe what happened in your own words. You can write in English, Kannada, or Hindi. You do not need to know official municipal department names—our AI analyzes your description and categorizes the problem automatically.',
    faq2Category: 'Deduplication',
    faq2Question: 'Why did my report get added to an existing issue?',
    faq2Answer: 'When multiple citizens report the same pothole, water leak, or broken streetlight in the same neighborhood, CivicConnect AI connects them into one consolidated public issue. This prevents duplicate tickets from scattering municipal resources, pools community support, and ensures field workers receive a unified report.',
    faq3Category: 'Support & Community',
    faq3Question: 'What does supporting a problem mean?',
    faq3Answer: 'Supporting an issue is like an official upvote. It signals to the municipal corporation that a problem affects multiple residents in the area. Each citizen can support an issue once, and higher support counts increase the urgency score of the issue.',
    faq4Category: 'Priority & Triage',
    faq4Question: 'How is priority determined?',
    faq4Answer: 'CivicConnect AI computes a priority score based on: (1) active safety hazards or reported collisions, (2) duration of the problem, (3) community support volume, and (4) proximity to schools, hospitals, or transit nodes.',
    faq5Category: 'Tracking & Updates',
    faq5Question: 'How do I track progress?',
    faq5Answer: 'You can track real-time progress on the "Track Progress" page for any issue. The municipal corporation records updates whenever a report is reviewed, an inspection is carried out, or a field maintenance crew is dispatched.'
  },

  Kannada: {
    appTitle: 'ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI',
    citizenPortal: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್',
    enterCitizenPortal: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ',
    reportProblem: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
    exploreProblems: 'ಸಮಸ್ಯೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    myReports: 'ನನ್ನ ವರದಿಗಳು',
    supportedIssues: 'ಬೆಂಬಲಿಸಿದ ಸಮಸ್ಯೆಗಳು',
    tracking: 'ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    helpCenter: 'ಸಹಾಯ ಕೇಂದ್ರ',
    profile: 'ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್',
    login: 'ಸೈನ್ ಇನ್',
    signIn: 'ಸೈನ್ ಇನ್',
    register: 'ನೋಂದಣಿ',
    registerCitizen: 'ನಾಗರಿಕರಾಗಿ ನೋಂದಾಯಿಸಿ',
    logout: 'ಸೈನ್ ಔಟ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    noNotifications: 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ',
    markAllRead: 'ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    activeSession: 'ನಾಗರಿಕ ಸೆಷನ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    previewMode: 'ಸ್ಥಳೀಯ ಮುನ್ನೋಟ ಮೋಡ್',
    liveDatabase: 'ಸುಪಬೇಸ್ ಲೈವ್ ಡೇಟಾಬೇಸ್',
    databaseStatus: 'ಡೇಟಾಬೇಸ್ ಮತ್ತು ಕ್ಲೌಡ್ ಸ್ಥಿತಿ',
    setupLiveDatabase: 'ಲೈವ್ ಸುಪಬೇಸ್ ಕಾನ್ಫಿಗರ್ ಮಾಡಿ',
    connected: 'ಸಂಪರ್ಕಗೊಂಡಿದೆ',
    offline: 'ಆಫ್‌ಲೈನ್ / ಕ್ಯಾಶ್ ಮಾಡಲಾಗಿದೆ',
    menu: 'ಮೆನು',
    close: 'ಮುಚ್ಚಿ',
    footerDescription: 'AI ನೆರವಿನ ಪುರಸಭೆ ವಿಂಗಡಣೆ, ನಕಲು ನಿವಾರಣೆ ಮತ್ತು ಅಧಿಕೃತ ಟ್ರ್ಯಾಕಿಂಗ್ ಮೂಲಕ ನಾಗರಿಕರನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು.',
    quickLinks: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    officialPortals: 'ಪುರಸಭೆ ಪೋರ್ಟಲ್‌ಗಳು',
    copyright: '© 2026 ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI. ಪಾರದರ್ಶಕ ಪುರಸಭೆ ಆಡಳಿತಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.',
    shareIssue: 'ಸಮಸ್ಯೆ ಹಂಚಿಕೊಳ್ಳಿ',
    copyTrackingId: 'ರೆಫರೆನ್ಸ್ ಐಡಿ ನಕಲಿಸಿ',

    goodMorning: 'ಶುಭೋದಯ',
    goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
    goodEvening: 'ಶುಭ ಸಂಜೆ',
    heroTagline: 'ನಾಗರಿಕರ ಸಬಲೀಕರಣ. ಪುರಸಭೆಯ ತ್ವರಿತ ಕ್ರಮ.',
    heroTitle: 'ನಾಗರಿಕರ ಸಬಲೀಕರಣ. ಪುರಸಭೆಯ ತ್ವರಿತ ಕ್ರಮ.',
    heroSubtitle: 'ರಸ್ತೆ ಗುಂಡಿಗಳು, ನೀರಿನ ಸೋರಿಕೆ, ಬೀದಿದೀಪಗಳು ಅಥವಾ ಕಸದ ಸಮಸ್ಯೆಗಳನ್ನು ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ವರದಿ ಮಾಡಿ. AI ಒಂದೇ ಪ್ರದೇಶದ ಸಮಸ್ಯೆಗಳನ್ನು ಒಗ್ಗೂಡಿಸುತ್ತದೆ.',
    dashboardHeroTitle: 'ನಾಗರಿಕರ ಸಬಲೀಕರಣ. ಪುರಸಭೆಯ ತ್ವರಿತ ಕ್ರಮ.',
    dashboardHeroSubtitle: 'ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ಬೆಂಬಲಿಸಿ ಮತ್ತು ಅಧಿಕೃತ ದುರಸ್ತಿ ಪ್ರಗತಿಯನ್ನು ವೀಕ್ಷಿಸಿ.',
    heroReportNow: 'ನಾಗರಿಕ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
    heroExploreNow: 'ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    statMyReports: 'ನನ್ನ ವರದಿಗಳು',
    statSupported: 'ಬೆಂಬಲಿತ',
    statInProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    statResolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    activeRepairs: 'ಸಕ್ರಿಯ ಪುರಸಭೆ ದುರಸ್ತಿಗಳು',
    completedFixes: 'ವಾರ್ಡ್‌ನಲ್ಲಿ ಪೂರ್ಣಗೊಂಡ ದುರಸ್ತಿಗಳು',
    nearbyIssuesTitle: 'ನಿಮ್ಮ ಸಮೀಪದ ಸಮಸ್ಯೆಗಳು',
    nearbyIssuesSubtitle: 'ನಿಮ್ಮ ವಾರ್ಡ್ ಪ್ರದೇಶದಲ್ಲಿ ವರದಿಯಾದ ಸಕ್ರಿಯ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು',
    problemsNearYou: 'ನಿಮ್ಮ ಸಮೀಪದ ಸಮಸ್ಯೆಗಳು',
    viewAllCommunityIssues: 'ಎಲ್ಲಾ ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    recentUpdatesTitle: 'ಇತ್ತೀಚಿನ ಪುರಸಭೆಯ ನವೀಕರಣಗಳು',
    recentUpdatesSubtitle: 'ಪುರಸಭೆಯ ಫೀಲ್ಡ್ ಸಿಬ್ಬಂದಿಯಿಂದ ನೈಜ-ಸಮಯದ ತಪಾಸಣೆ ಮತ್ತು ದುರಸ್ತಿ ವಿವರಗಳು',
    recentUpdatesEmpty: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳಿಲ್ಲ. ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಲೈವ್ ಪ್ರಗತಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    quickActionsTitle: 'ತ್ವರಿತ ನಾಗರಿಕ ಕ್ರಮಗಳು',
    quickCivicActions: 'ತ್ವರಿತ ನಾಗರಿಕ ಕ್ರಮಗಳು',
    openAction: 'ತೆರೆಯಿರಿ',
    viewDetailsAction: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    trackProgressAction: 'ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    feature1Title: 'ನೈಸರ್ಗಿಕ ಭಾಷಾ AI',
    feature1Desc: 'ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ ದೂರು ಬರೆಯಿರಿ. AI ಸ್ಥಳ, ತೀವ್ರತೆ ಮತ್ತು ವರ್ಗವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗುರುತಿಸುತ್ತದೆ.',
    feature2Title: 'ನಕಲು ನಿವಾರಣೆ',
    feature2Desc: 'ಒಂದೇ ಸ್ಥಳದ ಹೊಂದಾಣಿಕೆಯಾಗುವ ದೂರುಗಳನ್ನು ಒಂದೇ ಉನ್ನತ ಆದ್ಯತೆಯ ಸಾರ್ವಜನಿಕ ಕಾರಣವಾಗಿ ಒಗ್ಗೂಡಿಸುತ್ತದೆ.',
    feature3Title: 'ಪಾರದರ್ಶಕ ಟ್ರ್ಯಾಕಿಂಗ್',
    feature3Desc: 'ಪುರಸಭೆ ಪರಿಶೀಲನೆಯಿಂದ ದುರಸ್ತಿಯವರೆಗೆ ಪ್ರತಿ ಹಂತವನ್ನು ಸರಳ ಮಾತುಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',

    stepDescribe: 'ವಿವರಣೆ',
    stepLocation: 'ಸ್ಥಳ',
    stepEvidence: 'ಸಾಕ್ಷ್ಯ ಮತ್ತು ಸುರಕ್ಷತೆ',
    stepAIReview: 'AI ಪರಿಶೀಲನೆ',
    stepSubmit: 'ಸಲ್ಲಿಸಿ',

    step1Title: 'ಏನು ಸಮಸ್ಯೆಯಾಗಿದೆ ಎಂಬುದನ್ನು ವಿವರಿಸಿ',
    step1Subtitle: 'ನಿಮ್ಮ ದೈನಂದಿನ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಬರೆಯಿರಿ. ಯಾವುದೇ ತಾಂತ್ರಿಕ ಪದಗಳ ಅಗತ್ಯವಿಲ್ಲ.',
    step1Placeholder: 'ಉದಾ: 100 ಅಡಿ ರಸ್ತೆಯ ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ದೊಡ್ಡ ಗುಂಡಿಯಿದ್ದು, ನಿನ್ನೆ ಮಳೆಯಿಂದ ದ್ವಿಚಕ್ರ ವಾಹನ ಜಾರಿ ಬಿದ್ದಿದೆ...',
    step1WritingIn: 'ಬರೆಯುತ್ತಿರುವ ಭಾಷೆ:',
    step1TipsTitle: 'ಸೇರಿಸಬೇಕಾದ ಪ್ರಮುಖ ವಿವರಗಳು:',
    step1Tip1: 'ಸಮಸ್ಯೆ ಏನು (ರಸ್ತೆ ಗುಂಡಿ, ಬೀದಿದೀಪ, ಒಳಚರಂಡಿ ಸೋರಿಕೆ ಇತ್ಯಾದಿ)',
    step1Tip2: 'ಅಂದಾಜು ಅವಧಿ (ಎಷ್ಟು ದಿನಗಳಿಂದ ಈ ಸಮಸ್ಯೆಯಿದೆ)',
    step1Tip3: 'ಸಂಭವಿಸಿದ ಯಾವುದೇ ಅಪಘಾತ ಅಥವಾ ಅಪಾಯದ ವಿವರ',
    step1ErrorMinChars: 'ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳನ್ನು ಬರೆಯಿರಿ.',

    step2Title: 'ಈ ಸಮಸ್ಯೆಯ ಸ್ಥಳ ಎಲ್ಲಿದೆ?',
    step2Subtitle: 'ಹತ್ತಿರದ ಸಮಸ್ಯೆಗಳೊಂದಿಗೆ ಹೋಲಿಸಲು ಮತ್ತು ಪುರಸಭೆ ತಂಡವನ್ನು ಸರಿಯಾದ ಸ್ಥಳಕ್ಕೆ ಕಳುಹಿಸಲು ಇದು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    step2AreaLabel: 'ಪ್ರದೇಶ / ವಾರ್ಡ್ / ಬಡಾವಣೆ',
    step2AreaPlaceholder: 'ಉದಾ: ಇಂದಿರಾನಗರ, ಕೋರಮಂಗಲ, ಎಚ್‌ಎಸ್‌ಆರ್ ಲೇಔಟ್',
    step2LandmarkLabel: 'ಪ್ರಮುಖ ಗುರುತು / ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್',
    step2LandmarkPlaceholder: 'ಉದಾ: ನ್ಯಾಷನಲ್ ಹೈಸ್ಕೂಲ್ ಎದುರು, ಮೆಟ್ರೋ ಪಿಲ್ಲರ್ 104 ಬಳಿ',
    step2AddressLabel: 'ರಸ್ತೆ ವಿಳಾಸ / ಕ್ರಾಸ್ ರಸ್ತೆ (ಐಚ್ಛಿಕ)',
    step2AddressPlaceholder: 'ಉದಾ: 12ನೇ ಮುಖ್ಯ ರಸ್ತೆ, 4ನೇ ಕ್ರಾಸ್',
    step2GpsButton: 'GPS ಸ್ಥಳ ಬಳಸಿ',
    step2GpsDetecting: 'ಸ್ಥಳ ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...',
    step2GpsDetected: 'ಸ್ಥಳ ಗುರುತಿಸಲಾಗಿದೆ',
    step2GpsPrompt: 'ಸಾಧನದ GPS ನಿಂದ ಸ್ಥಳವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಿ',
    locationPermissionPrompt: 'ಸ್ಥಳದ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಪ್ರದೇಶವನ್ನು ನೀವೇ ನಮೂದಿಸಿ.',

    step3Title: 'ಫೋಟೋ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಸುರಕ್ಷತಾ ವಿವರ',
    step3Subtitle: 'ಫೋಟೋಗಳು ಸಿಬ್ಬಂದಿಗೆ ಮೊದಲ ಬಾರಿಗೆ ಸರಿಯಾದ ದುರಸ್ತಿ ಸಾಮಗ್ರಿಗಳೊಂದಿಗೆ ಬರಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.',
    step3UploadLabel: 'ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ ಆದರೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)',
    step3UploadHint: 'JPEG, PNG ಅಥವಾ WebP ಚಿತ್ರಗಳು (ಗರಿಷ್ಠ 10MB)',
    step3DurationLabel: 'ಈ ಸಮಸ್ಯೆ ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?',
    accidentQuestion: 'ಈ ಸಮಸ್ಯೆಯಿಂದ ಯಾವುದೇ ಅಪಘಾತ ಅಥವಾ ಅಪಾಯ ಸಂಭವಿಸಿದೆಯೇ?',
    accidentDisclaimer: 'ತುರ್ತು ದುರಸ್ತಿಯನ್ನು ತ್ವರಿತಗೊಳಿಸಲು ಈ ಸುರಕ್ಷತಾ ಮಾಹಿತಿಯನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.',
    step3AccidentYes: 'ಹೌದು, ಅಪಘಾತ ಸಂಭವಿಸಿದೆ',
    step3AccidentNo: 'ಇಲ್ಲ / ಖಚಿತವಿಲ್ಲ',
    step3AccidentDescLabel: 'ದಯವಿಟ್ಟು ಘಟನೆಯನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸಿ',
    step3AccidentDescPlaceholder: 'ಉದಾ: ನಿನ್ನೆ ಸಂಜೆ ಮಳೆಯಲ್ಲಿ ದ್ವಿಚಕ್ರ ವಾಹನ ಸವಾರರು ಜಾರಿ ಬಿದ್ದಿದ್ದಾರೆ...',

    step4Title: 'AI ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪರಿಶೀಲನೆ',
    step4Subtitle: 'ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ನಿಮ್ಮ ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ವಿವರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿದೆ.',
    step4AnalyzingTitle: 'ನಿಮ್ಮ ವರದಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...',
    step4AnimReading: 'ನಿಮ್ಮ ವಿವರಣೆ ಮತ್ತು ಭಾಷೆಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ',
    step4AnimCategory: 'ನಾಗರಿಕ ವರ್ಗ ಮತ್ತು ತೀವ್ರತೆಯನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ',
    step4AnimSafety: 'ಸುರಕ್ಷತಾ ಅಂಶಗಳು ಮತ್ತು ಅವಧಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ',
    step4AnimScanning: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ',
    structuredExtractions: 'AI ಗುರುತಿಸಿದ ವಿವರಗಳು',
    editDetails: 'ವಿವರ ಬದಲಾಯಿಸಿ',
    doneEditing: 'ಬದಲಾವಣೆ ಮುಗಿದಿದೆ',
    categoryLabel: 'ನಾಗರಿಕ ವರ್ಗ',
    identifiedProblem: 'ಗುರುತಿಸಲಾದ ಸಮಸ್ಯೆ',
    areaLocality: 'ಪ್ರದೇಶ / ಬಡಾವಣೆ',
    safetyUrgency: 'ಸುರಕ್ಷತೆ ಮತ್ತು ತುರ್ತುಸ್ಥಿತಿ',
    hazardReported: 'ಅಪಾಯ ವರದಿಯಾಗಿದೆ (ನಾಗರಿಕ ಮಾಹಿತಿ)',
    standardMaintenance: 'ಸಾಮಾನ್ಯ ನಾಗರಿಕ ನಿರ್ವಹಣೆ',
    aiDisclaimer: 'AI-ನೆರವಿನ ವರ್ಗೀಕರಣ. ಸಲ್ಲಿಸುವ ಮುನ್ನ ನೀವು ಯಾವುದೇ ವಿವರವನ್ನು ಬದಲಾಯಿಸಬಹುದು.',
    similarFoundTitle: 'ಹೋಲುವ ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳು ಕಂಡುಬಂದಿವೆ',
    similarFoundDesc: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮಸ್ಯೆಗೆ ಸಂಪರ್ಕಿಸುವುದರಿಂದ ಸಮುದಾಯದ ಬೆಂಬಲ ಹೆಚ್ಚುತ್ತದೆ ಮತ್ತು ನಕಲು ತಪ್ಪುತ್ತದೆ.',
    viewSimilarButton: 'ಹೋಲುವ ಸಮಸ್ಯೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',

    rejectionTitle: 'ಇದು ಈ ಬಗ್ಗೆ ದೂರು ನೀಡಲು ಸರಿಯಾದ ಸ್ಥಳವಲ್ಲ',
    rejectionSubtitle: 'ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ಕೇವಲ ಸಾರ್ವಜನಿಕ ಪುರಸಭೆ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳಿಗಾಗಿ ಮಾತ್ರ ಮೀಸಲಾಗಿದೆ.',
    rejectionWhatCanReport: 'ಸಿವಿಕ್‌ಕನೆಕ್ಟ್ AI ನಲ್ಲಿ ನೀವು ವರದಿ ಮಾಡಬಹುದಾದ ಸಮಸ್ಯೆಗಳು:',
    rejectionTopicRoads: 'ಹಾಳಾದ ರಸ್ತೆಗಳು, ಗುಂಡಿಗಳು, ಒಡೆದ ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು ಮತ್ತು ತೆರೆದ ಮ್ಯಾನ್‌ಹೋಲ್‌ಗಳು',
    rejectionTopicWater: 'ಕುಡಿಯುವ ನೀರಿನ ಸೋರಿಕೆ, ಚರಂಡಿ ಕಟ್ಟಿಕೊಳ್ಳುವುದು ಮತ್ತು ಒಳಚರಂಡಿ ನೀರು ಹರಿಯುವುದು',
    rejectionTopicLights: 'ಕೆಲಸ ಮಾಡದ ಬೀದಿದೀಪಗಳು, ನೇತಾಡುವ ವಿದ್ಯುತ್ ತಂತಿಗಳು ಮತ್ತು ಕತ್ತಲೆಯ ರಸ್ತೆಗಳು',
    rejectionTopicGarbage: 'ಕಸದ ರಾಶಿ, ತುಂಬಿ ತುಳುಕುವ ಡಸ್ಟ್‌ಬಿನ್‌ಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸ್ವಚ್ಛತೆ',
    rejectionTopicHazards: 'ಬಿದ್ದ ಮರಗಳು, ಅಪಾಯಕಾರಿ ರಸ್ತೆ ಗುಂಡಿಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಅಪಾಯಗಳು',
    rejectionEditButton: 'ದೂರಿನ ವಿವರಣೆಯನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ',

    step5Title: 'ಅಂತಿಮ ಪರಿಶೀಲನೆ ಮತ್ತು ದೃಢೀಕರಣ',
    step5Subtitle: 'ಪುರಸಭೆಯ ಡೇಟಾಬೇಸ್‌ಗೆ ಸಲ್ಲಿಸುವ ಮೊದಲು ನಿಮ್ಮ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    step5ReviewHeader: 'ಸಲ್ಲಿಕೆ ಸಾರಾಂಶ',
    step5LocationDetails: 'ಸ್ಥಳದ ವಿವರಗಳು',
    step5Duration: 'ಅವಧಿ',
    step5EvidenceFiles: 'ಲಗತ್ತಿಸಲಾದ ಫೋಟೋಗಳು',
    step5WhatHappensNextTitle: 'ಸಲ್ಲಿಸಿದ ನಂತರ ಏನಾಗುತ್ತದೆ?',
    step5WhatHappensNextDesc: 'ನಿಮ್ಮ ದೂರನ್ನು ಸಮುದಾಯ ವರದಿಗಳೊಂದಿಗೆ ಒಗ್ಗೂಡಿಸಿ ಪುರಸಭೆಯ ಎಂಜಿನಿಯರ್‌ಗಳಿಗೆ ರವಾನಿಸಲಾಗುತ್ತದೆ.',
    submitReport: 'ನಾಗರಿಕ ವರದಿ ಸಲ್ಲಿಸಿ',
    submittingReport: 'ಡೇಟಾಬೇಸ್‌ಗೆ ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    backButton: 'ಹಿಂದಕ್ಕೆ',
    continueButton: 'ಮುಂದುವರಿಯಿರಿ',
    analyzeAIButton: 'AI ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ',

    similarModalTitle: 'ಇದಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಸಮಸ್ಯೆಯೊಂದು ಕಂಡುಬಂದಿದೆ',
    similarModalSubtitle: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮುದಾಯ ಸಮಸ್ಯೆಗೆ ನಿಮ್ಮ ವರದಿಯನ್ನು ಸಂಪರ್ಕಿಸುವುದರಿಂದ ಬೆಂಬಲ ಹೆಚ್ಚುತ್ತದೆ ಮತ್ತು ನಕಲು ತಪ್ಪುತ್ತದೆ.',
    sameProblemButton: 'ಇದು ಅದೇ ಸಮಸ್ಯೆ (+1 ಬೆಂಬಲ)',
    differentProblemButton: 'ಇಲ್ಲ, ಇದು ಬೇರೆ ಸಮಸ್ಯೆ',
    supporters: 'ಬೆಂಬಲಿಗರು',
    similarMatchScore: 'ಹೊಂದಾಣಿಕೆಯಾಗಲು ಕಾರಣ',

    successTitle: 'ನಿಮ್ಮ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ!',
    successSubtitle: 'ಪುರಸಭೆಯ ಪರಿಶೀಲನೆಗಾಗಿ ಸಮುದಾಯ ಸಮಸ್ಯೆಯನ್ನು ಆದ್ಯತೆಯ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.',
    viewDetails: 'ಸಮಸ್ಯೆಯ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    trackProblem: 'ಲೈವ್ ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    goToDashboardButton: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',

    exploreTitle: 'ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    exploreSubtitle: 'ವಿವಿಧ ವಾರ್ಡ್‌ಗಳ ಪರಿಶೀಲಿಸಿದ ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಬೆಂಬಲಿಸಿ.',
    communityIssues: 'ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳು',
    searchPlaceholder: 'ವಿವರಣೆ, ರಸ್ತೆ ಹೆಸರು ಅಥವಾ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ಮೂಲಕ ಹುಡುಕಿ...',
    allCategoriesFilter: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
    allPrioritiesFilter: 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು',
    allStatusesFilter: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    sortNewest: 'ಹೊಸದು ಮೊದಲು',
    sortPriority: 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆ',
    sortOldest: 'ಹಳೆಯದು ಮೊದಲು',
    noProblemsFound: 'ಯಾವುದೇ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    noIssuesDescription: 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಸಮಸ್ಯೆಗಳಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಾಟ ನಡೆಸಿ ಅಥವಾ ಹೊಸ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ.',
    exploreMoreIssues: 'ಇನ್ನಷ್ಟು ಸಮಸ್ಯೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',

    reportedStatus: 'ವರದಿಯಾಗಿದೆ',
    reviewedStatus: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    assignedStatus: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    inProgressStatus: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    resolvedStatus: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    trackingReferenceLabel: 'ದೂರು ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ',
    realTimeProgressTitle: 'ನೈಜ-ಸಮಯದ ದುರಸ್ತಿ ಪ್ರಗತಿ',
    currentStatusBanner: 'ಪ್ರಸ್ತುತ ಪುರಸಭೆಯ ಸ್ಥಿತಿ',
    detailedWorkTimeline: 'ವಿವರವಾದ ಕಾರ್ಯ ಟೈಮ್‌ಲೈನ್',
    officialProgressTimeline: 'ಅಧಿಕೃತ ಪ್ರಗತಿ ಮತ್ತು ತಪಾಸಣೆ ಟೈಮ್‌ಲೈನ್',
    trackingStep1Desc: 'ದೂರು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಆದ್ಯತೆ ನೀಡಲಾಗಿದೆ',
    trackingStep2Desc: 'ಪುರಸಭೆ ವಿಭಾಗದಿಂದ ಪರಿಶೀಲನೆ ನಡೆಸಲಾಗಿದೆ',
    trackingStep3Desc: 'ಕಾರ್ಯ ಆದೇಶದೊಂದಿಗೆ ಫೀಲ್ಡ್ ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    trackingStep4Desc: 'ದುರಸ್ತಿ ಕಾರ್ಯ ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    trackingStep5Desc: 'ಸ್ಥಳ ತಪಾಸಣೆ ಮುಗಿದು ಸಮಸ್ಯೆ ಪರಿಹರಿಸಲಾಗಿದೆ',

    myComplaintsTitle: 'ನನ್ನ ವರದಿ ಮಾಡಿದ ಸಮಸ್ಯೆಗಳು',
    myComplaintsSubtitle: 'ನೀವು ಸಲ್ಲಿಸಿದ ಪ್ರತ್ಯೇಕ ದೂರುಗಳ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
    noComplaintsTitle: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿಲ್ಲ',
    noComplaintsDescription: 'ನಿಮ್ಮ ವಾರ್ಡ್‌ನಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ, ಕಸದ ರಾಶಿ ಅಥವಾ ಹಾಳಾದ ಬೀದಿದೀಪಗಳನ್ನು ಗಮನಿಸಿದ್ದೀರಾ? ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ವರದಿ ಸಲ್ಲಿಸಿ.',
    connectedToCommunityIssue: 'ಸಮುದಾಯ ಸಮಸ್ಯೆಗೆ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ',
    supportedIssuesTitle: 'ಬೆಂಬಲಿತ ಸಮುದಾಯ ಸಮಸ್ಯೆಗಳು',
    supportedIssuesSubtitle: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಪುರಸಭೆಯ ಕ್ರಮವನ್ನು ತ್ವರಿತಗೊಳಿಸಲು ನೀವು ಬೆಂಬಲಿಸಿದ ಸಮಸ್ಯೆಗಳು.',
    noSupportedIssuesTitle: 'ಯಾವುದೇ ಬೆಂಬಲಿತ ಸಮಸ್ಯೆಗಳಿಲ್ಲ',
    noSupportedIssuesDesc: 'ನಿಮ್ಮ ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಬೆಂಬಲಿಸಿ ಅವುಗಳ ಆದ್ಯತೆಯನ್ನು ಹೆಚ್ಚಿಸಿ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಡೇಟ್ ಪಡೆಯಿರಿ.',

    profileTitle: 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳು',
    profileSubtitle: 'ನಿಮ್ಮ ಸಂಪರ್ಕ ಮಾಹಿತಿ, ನೋಂದಾಯಿತ ಪ್ರದೇಶ ಮತ್ತು ಭಾಷೆಯನ್ನು ನಿರ್ವಹಿಸಿ.',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
    passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
    confirmPasswordLabel: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
    preferredLanguageLabel: 'ಆದ್ಯತೆಯ ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
    saveChangesButton: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    loginTitle: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್ ಸೈನ್ ಇನ್',
    loginSubtitle: 'ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ಬಡಾವಣೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಬೆಂಬಲಿಸಿ ಮತ್ತು ದುರಸ್ತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
    registerTitle: 'ನಾಗರಿಕ ಖಾತೆ ರಚಿಸಿ',
    registerSubtitle: 'ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು ಮತ್ತು ಪುರಸಭೆಯ ಕ್ರಮಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸೇರಿಕೊಳ್ಳಿ.',
    forgotPasswordTitle: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ',
    forgotPasswordSubtitle: 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್‌ಗೆ ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.',
    forgotPasswordLink: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
    resetPasswordTitle: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ',
    resetPasswordSubtitle: 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್‌ಗೆ ಪಾಸ್‌ವರ್ಡ್ ಮರುಪಡೆಯುವಿಕೆ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇವೆ.',
    sendResetLinkButton: 'ರೀಸೆಟ್ ಲಿಂಕ್ ಕಳುಹಿಸಿ',
    returnToSignIn: 'ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    quickDemoLogin: '೧-ಕ್ಲಿಕ್ ತ್ವರಿತ ನಾಗರಿಕ ಲಾಗಿನ್',
    dontHaveAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    invalidCredentials: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    langEnglish: 'English (ಇಂಗ್ಲಿಷ್)',
    langKannada: 'ಕನ್ನಡ (Kannada)',
    langHindi: 'हिन्दी (ಹಿಂದಿ)',

    helpCenterTitle: 'ನಾಗರಿಕ ಸಹಾಯ ಕೇಂದ್ರ ಮತ್ತು FAQ',
    helpCenterSubtitle: 'ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡುವುದು, ಸಮುದಾಯ ನಕಲು ನಿವಾರಣೆ ಮತ್ತು ಪುರಸಭೆ ದುರಸ್ತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡುವ ಕುರಿತು ಸಂಪೂರ್ಣ ಮಾಹಿತಿ.',
    faq1Category: 'ವರದಿ ಮತ್ತು AI',
    faq1Question: 'ಸಮಸ್ಯೆಯನ್ನು ಹೇಗೆ ವರದಿ ಮಾಡುವುದು?',
    faq1Answer: 'ಕೇವಲ "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ" ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ವಿವರಿಸಿ. ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಬರೆಯಬಹುದು. ನಮ್ಮ AI ನಿಮ್ಮ ವಿವರಣೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವರ್ಗೀಕರಿಸುತ್ತದೆ.',
    faq2Category: 'ನಕಲು ನಿವಾರಣೆ',
    faq2Question: 'ನನ್ನ ವರದಿ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಸಮಸ್ಯೆಗೆ ಏಕೆ ಸೇರ್ಪಡೆಯಾಯಿತು?',
    faq2Answer: 'ಒಂದೇ ಪ್ರದೇಶದಲ್ಲಿ ಹಲವು ನಾಗರಿಕರು ಒಂದೇ ರಸ್ತೆ ಗುಂಡಿ ಅಥವಾ ನೀರಿನ ಸೋರಿಕೆಯನ್ನು ವರದಿ ಮಾಡಿದಾಗ, AI ಅವುಗಳನ್ನು ಒಂದೇ ಸಾರ್ವಜನಿಕ ಕಾರಣವಾಗಿ ಒಗ್ಗೂಡಿಸುತ್ತದೆ. ಇದು ನಕಲು ತಪ್ಪಿಸುತ್ತದೆ ಮತ್ತು ದುರಸ್ತಿಯನ್ನು ವೇಗಗೊಳಿಸುತ್ತದೆ.',
    faq3Category: 'ಬೆಂಬಲ ಮತ್ತು ಸಮುದಾಯ',
    faq3Question: 'ಸಮಸ್ಯೆಯನ್ನು ಬೆಂಬಲಿಸುವುದು ಎಂದರೆ ಏನು?',
    faq3Answer: 'ಸಮಸ್ಯೆಯನ್ನು ಬೆಂಬಲಿಸುವುದು ಅಧಿಕೃತ ಮತ ನೀಡಿದಂತೆ. ಇದು ಪುರಸಭೆಗೆ ಈ ಸಮಸ್ಯೆ ಅನೇಕ ಜನರಿಗೆ ತೊಂದರೆ ನೀಡುತ್ತಿದೆ ಎಂದು ತಿಳಿಸುತ್ತದೆ ಮತ್ತು ಆದ್ಯತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.',
    faq4Category: 'ಆದ್ಯತೆ ಮತ್ತು ತಪಾಸಣೆ',
    faq4Question: 'ಆದ್ಯತೆಯನ್ನು ಹೇಗೆ ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ?',
    faq4Answer: 'AI ತೀವ್ರತೆ, ಸುರಕ್ಷತಾ ಅಪಾಯಗಳು, ಸಮಸ್ಯೆಯ ಅವಧಿ ಮತ್ತು ಸಮುದಾಯ ಬೆಂಬಲದ ಆಧಾರದ ಮೇಲೆ 1 ರಿಂದ 5 ರವರೆಗೆ ಆದ್ಯತೆಯ ಅಂಕವನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.',
    faq5Category: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ನವೀಕರಣಗಳು',
    faq5Question: 'ಪ್ರಗತಿಯನ್ನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?',
    faq5Answer: 'ನೀವು "ಪ್ರಗತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" ಪುಟದಲ್ಲಿ ನೈಜ ಸಮಯದ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಬಹುದು. ಪುರಸಭೆ ಪರಿಶೀಲನೆ ನಡೆಸಿದಾಗ ಅಥವಾ ದುರಸ್ತಿ ಸಿಬ್ಬಂದಿಯನ್ನು ನಿಯೋಜಿಸಿದಾಗ ನವೀಕರಣಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.'
  },

  Hindi: {
    appTitle: 'सिविककनेक्ट AI',
    citizenPortal: 'नागरिक पोर्टल',
    enterCitizenPortal: 'नागरिक पोर्टल में प्रवेश करें',
    reportProblem: 'समस्या की रिपोर्ट करें',
    exploreProblems: 'समस्याएं देखें',
    myReports: 'मेरी रिपोर्ट्स',
    supportedIssues: 'समर्थित समस्याएं',
    tracking: 'प्रगति ट्रैक करें',
    helpCenter: 'सहायता केंद्र',
    profile: 'प्रोफाइल सेटिंग्स',
    login: 'साइन इन',
    signIn: 'साइन इन',
    register: 'पंजीकरण',
    registerCitizen: 'नागरिक के रूप में पंजीकरण करें',
    logout: 'साइन आउट',
    dashboard: 'डैशबोर्ड',
    notifications: 'सूचनाएं',
    noNotifications: 'कोई नई सूचना नहीं है',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    activeSession: 'नागरिक सत्र सक्रिय है',
    previewMode: 'स्थानीय पूर्वावलोकन मोड',
    liveDatabase: 'सुपाबेस लाइव डेटाबेस',
    databaseStatus: 'डेटाबेस और क्लाउड स्थिति',
    setupLiveDatabase: 'लाइव सुपाबेस कॉन्फ़िगर करें',
    connected: 'कनेक्टेड',
    offline: 'ऑफ़लाइन / कैश्ड',
    menu: 'मेनू',
    close: 'बंद करें',
    footerDescription: 'AI-सहायता प्राप्त नगरपालिका वर्गीकरण, डुप्लिकेशन निवारण और सत्यापित ट्रैकिंग के साथ नागरिकों का सशक्तिकरण।',
    quickLinks: 'त्वरित लिंक',
    officialPortals: 'नगर निगम पोर्टल',
    copyright: '© 2026 सिविककनेक्ट AI. पारदर्शी नगरपालिका शासन के लिए निर्मित।',
    shareIssue: 'समस्या साझा करें',
    copyTrackingId: 'संदर्भ आईडी कॉपी करें',

    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    heroTagline: 'नागरिक सशक्तिकरण। त्वरित नगरपालिका कार्रवाई।',
    heroTitle: 'नागरिक सशक्तिकरण। त्वरित नगरपालिका कार्रवाई।',
    heroSubtitle: 'सड़क के गड्ढे, पानी का रिसाव, स्ट्रीटलाइट या कचरे की समस्या अपनी भाषा में बताएं। AI एक ही इलाके की समस्याओं को एकजुट करता है।',
    dashboardHeroTitle: 'नागरिक सशक्तिकरण। त्वरित नगरपालिका कार्रवाई।',
    dashboardHeroSubtitle: 'अपने वार्ड की समस्याओं की रिपोर्ट करें, सामुदायिक मुद्दों का समर्थन करें और आधिकारिक मरम्मत प्रगति देखें।',
    heroReportNow: 'नागरिक समस्या रिपोर्ट करें',
    heroExploreNow: 'सामुदायिक समस्याएं देखें',
    statMyReports: 'मेरी रिपोर्ट्स',
    statSupported: 'समर्थित',
    statInProgress: 'प्रगति पर',
    statResolved: 'हल किया गया',
    activeRepairs: 'सक्रिय नगरपालिका मरम्मत',
    completedFixes: 'वार्ड में पूर्ण मरम्मत कार्य',
    nearbyIssuesTitle: 'आपके आस-पास की समस्याएं',
    nearbyIssuesSubtitle: 'आपके वार्ड क्षेत्र में दर्ज की गई सक्रिय नागरिक समस्याएं',
    problemsNearYou: 'आपके आस-पास की समस्याएं',
    viewAllCommunityIssues: 'सभी सामुदायिक समस्याएं देखें',
    recentUpdatesTitle: 'हालिया नगरपालिका अपडेट',
    recentUpdatesSubtitle: 'नगरपालिका फील्ड टीम से वास्तविक समय निरीक्षण और मरम्मत विवरण',
    recentUpdatesEmpty: 'आपके क्षेत्र में अभी कोई हालिया अपडेट नहीं है। रिपोर्ट की समीक्षा होने पर यहां लाइव प्रगति दिखाई देगी।',
    quickActionsTitle: 'त्वरित नागरिक कार्य',
    quickCivicActions: 'त्वरित नागरिक कार्य',
    openAction: 'खोलें',
    viewDetailsAction: 'विवरण देखें',
    trackProgressAction: 'प्रगति ट्रैक करें',
    feature1Title: 'प्राकृतिक भाषा AI',
    feature1Desc: 'हिंदी, अंग्रेजी या कन्नड़ में अपने शब्दों में शिकायत लिखें। AI स्थान, गंभीरता और श्रेणी को स्वचालित रूप से पहचानता है।',
    feature2Title: 'डुप्लिकेशन निवारण',
    feature2Desc: 'एक ही स्थान की मिलती-जुलती शिकायतों को एक उच्च-प्राथमिकता वाले सार्वजनिक कारण में एकजुट करता है।',
    feature3Title: 'पारदर्शी ट्रैकिंग',
    feature3Desc: 'नगरपालिका समीक्षा से लेकर मरम्मत तक हर कदम को सरल शब्दों में आसानी से ट्रैक करें।',

    stepDescribe: 'विवरण',
    stepLocation: 'स्थान',
    stepEvidence: 'साक्ष्य और सुरक्षा',
    stepAIReview: 'AI समीक्षा',
    stepSubmit: 'जमा करें',

    step1Title: 'बताएं कि क्या समस्या हो रही है',
    step1Subtitle: 'अपनी रोजमर्रा की सरल भाषा में लिखें। किसी तकनीकी शब्द की आवश्यकता नहीं है।',
    step1Placeholder: 'उदा: 100 फीट रोड पर बस स्टॉप के पास एक बड़ा गड्ढा है, जिससे कल बारिश में एक बाइक फिसल गई...',
    step1WritingIn: 'लिखने की भाषा:',
    step1TipsTitle: 'शामिल करने योग्य मुख्य विवरण:',
    step1Tip1: 'समस्या क्या है (सड़क का गड्ढा, स्ट्रीटलाइट, सीवेज का पानी आदि)',
    step1Tip2: 'अनुमानित समय (समस्या कितने समय से है)',
    step1Tip3: 'हुई कोई दुर्घटना या सुरक्षा जोखिम',
    step1ErrorMinChars: 'कृपया समस्या का विवरण देने के लिए कम से कम 10 अक्षर लिखें।',

    step2Title: 'यह समस्या कहां स्थित है?',
    step2Subtitle: 'आस-पास की रिपोर्टों से मिलान करने और नगरपालिका टीम को सटीक स्थान पर भेजने में मदद करता है।',
    step2AreaLabel: 'क्षेत्र / वार्ड / इलाका',
    step2AreaPlaceholder: 'उदा: इंदिरानगर, कोरमंगला, एचएसआर लेआउट',
    step2LandmarkLabel: 'प्रमुख लैंडमार्क / पहचान (वैकल्पिक)',
    step2LandmarkPlaceholder: 'उदा: नेशनल हाई स्कूल के सामने, मेट्रो पिलर 104 के पास',
    step2AddressLabel: 'सड़क का पता / क्रॉस रोड (वैकल्पिक)',
    step2AddressPlaceholder: 'उदा: 12वीं मेन रोड, 4था क्रॉस',
    step2GpsButton: 'GPS स्थान का उपयोग करें',
    step2GpsDetecting: 'स्थान पहचाना जा रहा है...',
    step2GpsDetected: 'स्थान दर्ज किया गया',
    step2GpsPrompt: 'डिवाइस GPS से स्थान का स्वतः पता लगाएं',
    locationPermissionPrompt: 'स्थान की अनुमति अस्वीकृत। कृपया अपना क्षेत्र स्वयं दर्ज करें।',

    step3Title: 'फोटो साक्ष्य और सुरक्षा विवरण',
    step3Subtitle: 'फोटो फील्ड टीम को पहली बार में सही मरम्मत सामग्री लाने में मदद करती हैं।',
    step3UploadLabel: 'फोटो अपलोड करें (वैकल्पिक लेकिन अनुशंसित)',
    step3UploadHint: 'JPEG, PNG या WebP चित्र (अधिकतम 10MB)',
    step3DurationLabel: 'यह समस्या कितने समय से है?',
    accidentQuestion: 'क्या इस समस्या के कारण कोई दुर्घटना या जोखिम हुआ है?',
    accidentDisclaimer: 'त्वरित मरम्मत के लिए यह सुरक्षा जानकारी नागरिकों द्वारा दर्ज की जाती है।',
    step3AccidentYes: 'हां, दुर्घटना हुई है',
    step3AccidentNo: 'नहीं / निश्चित नहीं',
    step3AccidentDescLabel: 'कृपया घटना का संक्षेप में विवरण दें',
    step3AccidentDescPlaceholder: 'उदा: कल शाम बारिश में एक दोपहिया वाहन चालक फिसल गया...',

    step4Title: 'AI विश्लेषण और सुरक्षा सत्यापन',
    step4Subtitle: 'सिविककनेक्ट AI ने आपकी रिपोर्ट का विश्लेषण कर मुख्य विवरण तैयार किए हैं।',
    step4AnalyzingTitle: 'आपकी रिपोर्ट को समझा जा रहा है...',
    step4AnimReading: 'आपका विवरण और भाषा पढ़ी जा रही है',
    step4AnimCategory: 'नागरिक श्रेणी और गंभीरता की पहचान की जा रही है',
    step4AnimSafety: 'सुरक्षा कारकों और अवधि का मूल्यांकन किया जा रहा है',
    step4AnimScanning: 'मौजूदा सामुदायिक समस्याओं की जांच की जा रही है',
    structuredExtractions: 'AI द्वारा निकाले गए मुख्य विवरण',
    editDetails: 'विवरण संपादित करें',
    doneEditing: 'संपादन पूर्ण',
    categoryLabel: 'नागरिक श्रेणी',
    identifiedProblem: 'पहचानी गई समस्या',
    areaLocality: 'क्षेत्र / इलाका',
    safetyUrgency: 'सुरक्षा और तात्कालिकता',
    hazardReported: 'जोखिम दर्ज किया गया (नागरिक डेटा)',
    standardMaintenance: 'मानक नागरिक रखरखाव',
    aiDisclaimer: 'AI-सहायता प्राप्त वर्गीकरण। जमा करने से पहले आप विवरण बदल सकते हैं।',
    similarFoundTitle: 'मिलती-जुलती सामुदायिक समस्याएं मिलीं',
    similarFoundDesc: 'मौजूदा समस्या से जोड़ने से सामुदायिक समर्थन बढ़ता है और डुप्लिकेट टिकट से बचा जा सकता है।',
    viewSimilarButton: 'मिलती-जुलती समस्याएं देखें',

    rejectionTitle: 'यह इस बारे में शिकायत करने के लिए सही जगह नहीं है',
    rejectionSubtitle: 'सिविककनेक्ट AI केवल सार्वजनिक नगरपालिका बुनियादी ढांचे और नागरिक समस्याओं के लिए समर्पित है।',
    rejectionWhatCanReport: 'आप सिविककनेक्ट AI पर क्या रिपोर्ट कर सकते हैं:',
    rejectionTopicRoads: 'टूटी सड़कें, गड्ढे, टूटे फुटपाथ और खुले मैनहोल',
    rejectionTopicWater: 'पानी का रिसाव, नाली जाम होना और सीवेज का ओवरफ्लो',
    rejectionTopicLights: 'खराब स्ट्रीटलाइट्स, खुले बिजली के तार और अंधेरे रास्ते',
    rejectionTopicGarbage: 'कचरे का ढेर, ओवरफ्लो डस्टबिन और सार्वजनिक अस्वच्छता',
    rejectionTopicHazards: 'गिरे हुए पेड़, खतरनाक सड़क गड्ढे और सार्वजनिक स्वास्थ्य जोखिम',
    rejectionEditButton: 'शिकायत का विवरण बदलें',

    step5Title: 'अंतिम समीक्षा और पुष्टि',
    step5Subtitle: 'नगरपालिका डेटाबेस में जमा करने से पहले अपनी रिपोर्ट की पुष्टि करें।',
    step5ReviewHeader: 'प्रस्तुति सारांश',
    step5LocationDetails: 'स्थान विवरण',
    step5Duration: 'अवधि',
    step5EvidenceFiles: 'संलग्न फोटो',
    step5WhatHappensNextTitle: 'जमा करने के बाद क्या होगा?',
    step5WhatHappensNextDesc: 'आपकी शिकायत को सामुदायिक रिपोर्टों के साथ जोड़कर नगरपालिका इंजीनियरों को भेजा जाता है।',
    submitReport: 'नागरिक रिपोर्ट जमा करें',
    submittingReport: 'डेटाबेस में सुरक्षित किया जा रहा है...',
    backButton: 'पीछे',
    continueButton: 'आगे बढ़ें',
    analyzeAIButton: 'AI से विश्लेषण करें',

    similarModalTitle: 'हमें इससे संबंधित एक समस्या मिली है',
    similarModalSubtitle: 'अपनी रिपोर्ट को मौजूदा समस्या से जोड़ने से समर्थन बढ़ता है और डुप्लीकेट टिकट से बचा जाता है।',
    sameProblemButton: 'यह वही समस्या है (+1 समर्थन)',
    differentProblemButton: 'नहीं, यह एक अलग समस्या है',
    supporters: 'समर्थक',
    similarMatchScore: 'मिलान का कारण',

    successTitle: 'आपकी रिपोर्ट सफलतापूर्वक जमा हो गई है!',
    successSubtitle: 'नगरपालिका समीक्षा के लिए प्राथमिकता के आधार पर सामुदायिक समस्या दर्ज की गई है।',
    viewDetails: 'समस्या का विवरण देखें',
    trackProblem: 'लाइव प्रगति ट्रैक करें',
    goToDashboardButton: 'डैशबोर्ड पर जाएं',

    exploreTitle: 'सामुदायिक समस्याएं देखें',
    exploreSubtitle: 'विभिन्न वार्डों की सत्यापित सार्वजनिक समस्याओं को देखें और उनका समर्थन करें।',
    communityIssues: 'सामुदायिक समस्याएं',
    searchPlaceholder: 'विवरण, सड़क के नाम या लैंडमार्क से खोजें...',
    allCategoriesFilter: 'सभी श्रेणियां',
    allPrioritiesFilter: 'सभी प्राथमिकताएं',
    allStatusesFilter: 'सभी स्थितियां',
    sortNewest: 'नवीनतम पहले',
    sortPriority: 'उच्चतम प्राथमिकता',
    sortOldest: 'पुरातन पहले',
    noProblemsFound: 'कोई नागरिक समस्या नहीं मिली',
    noIssuesDescription: 'चुने गए फ़िल्टर के लिए कोई समस्या नहीं मिली। अन्य खोज का प्रयास करें या नई समस्या दर्ज करें।',
    exploreMoreIssues: 'और समस्याएं देखें',

    reportedStatus: 'दर्ज किया गया',
    reviewedStatus: 'समीक्षित',
    assignedStatus: 'कार्यकर्ता नियुक्त',
    inProgressStatus: 'प्रगति पर',
    resolvedStatus: 'हल किया गया',
    trackingReferenceLabel: 'शिकायत संदर्भ संख्या',
    realTimeProgressTitle: 'वास्तविक समय मरम्मत प्रगति',
    currentStatusBanner: 'वर्तमान नगरपालिका स्थिति',
    detailedWorkTimeline: 'विस्तृत कार्य टाइमलाइन',
    officialProgressTimeline: 'आधिकारिक प्रगति और निरीक्षण टाइमलाइन',
    trackingStep1Desc: 'शिकायत प्राप्त और प्राथमिकता दी गई',
    trackingStep2Desc: 'नगरपालिका प्रभाग द्वारा निरीक्षण किया गया',
    trackingStep3Desc: 'कार्य आदेश के साथ फील्ड टीम भेजी गई',
    trackingStep4Desc: 'मरम्मत कार्य प्रगति पर है',
    trackingStep5Desc: 'स्थल सत्यापन पूर्ण और समस्या हल हुई',

    myComplaintsTitle: 'मेरी दर्ज की गई समस्याएं',
    myComplaintsSubtitle: 'आपके द्वारा जमा की गई व्यक्तिगत शिकायतों की स्थिति ट्रैक करें।',
    noComplaintsTitle: 'आपने अभी तक कोई समस्या दर्ज नहीं की है',
    noComplaintsDescription: 'क्या आपने अपने वार्ड में सड़क के गड्ढे, कचरे का ढेर या खराब स्ट्रीटलाइट देखी है? अपने शब्दों में रिपोर्ट दर्ज करें।',
    connectedToCommunityIssue: 'सामुदायिक समस्या से जुड़ा हुआ',
    supportedIssuesTitle: 'समर्थित सामुदायिक समस्याएं',
    supportedIssuesSubtitle: 'अपने इलाके में त्वरित कार्रवाई के लिए आपके द्वारा समर्थित समस्याएं।',
    noSupportedIssuesTitle: 'कोई समर्थित समस्या नहीं है',
    noSupportedIssuesDesc: 'अपने मोहल्ले की समस्याओं का समर्थन करें ताकि उनकी प्राथमिकता बढ़े और स्वचालित अपडेट प्राप्त हों।',

    profileTitle: 'नागरिक प्रोफाइल और प्राथमिकताएं',
    profileSubtitle: 'अपनी संपर्क जानकारी, पंजीकृत क्षेत्र और पसंदीदा भाषा का प्रबंधन करें।',
    fullNameLabel: 'पूरा नाम',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    preferredLanguageLabel: 'पसंदीदा एप्लिकेशन भाषा',
    saveChangesButton: 'परिवर्तन सहेजें',
    loginTitle: 'नागरिक पोर्टल साइन इन',
    loginSubtitle: 'समस्याओं की रिपोर्ट करें, मोहल्ले के मुद्दों का समर्थन करें और मरम्मत ट्रैक करें।',
    registerTitle: 'नागरिक खाता बनाएं',
    registerSubtitle: 'नागरिक समस्याओं की रिपोर्ट करने और समाधान ट्रैक करने के लिए शामिल हों।',
    forgotPasswordTitle: 'पासवर्ड रीसेट करें',
    forgotPasswordSubtitle: 'हम आपके पंजीकृत ईमेल पर पासवर्ड रिकवरी लिंक भेजेंगे।',
    forgotPasswordLink: 'पासवर्ड भूल गए?',
    resetPasswordTitle: 'पासवर्ड रीसेट करें',
    resetPasswordSubtitle: 'हम आपके पंजीकृत ईमेल पर पासवर्ड रिकवरी लिंक भेजेंगे।',
    sendResetLinkButton: 'रीसेट लिंक भेजें',
    returnToSignIn: 'साइन इन पर लौटें',
    quickDemoLogin: '1-क्लिक त्वरित नागरिक लॉगिन',
    dontHaveAccount: 'खाता नहीं है?',
    alreadyHaveAccount: 'पहले से खाता है?',
    invalidCredentials: 'कृपया वैध क्रेडेंशियल दर्ज करें।',
    langEnglish: 'English (अंग्रेजी)',
    langKannada: 'ಕನ್ನಡ (कन्नड़)',
    langHindi: 'हिन्दी (Hindi)',

    helpCenterTitle: 'नागरिक सहायता केंद्र और FAQ',
    helpCenterSubtitle: 'नागरिक समस्याओं की रिपोर्टिंग, सामुदायिक डुप्लिकेशन निवारण और मरम्मत ट्रैकिंग के बारे में संपूर्ण जानकारी।',
    faq1Category: 'रिपोर्टिंग और AI',
    faq1Question: 'समस्या की रिपोर्ट कैसे करें?',
    faq1Answer: 'बस "समस्या की रिपोर्ट करें" पर क्लिक करें और अपने शब्दों में विवरण दें। आप हिंदी, अंग्रेजी या कन्नड़ में लिख सकते हैं। हमारा AI आपके विवरण का विश्लेषण करके स्वचालित रूप से श्रेणी तय करता है।',
    faq2Category: 'डुप्लिकेशन निवारण',
    faq2Question: 'मेरी रिपोर्ट किसी मौजूदा समस्या से क्यों जोड़ी गई?',
    faq2Answer: 'जब एक ही इलाके में कई नागरिक एक ही गड्ढे या पानी के रिसाव की रिपोर्ट करते हैं, तो AI उन्हें एक सार्वजनिक कारण में एकजुट करता है। इससे डुप्लीकेट टिकट नहीं बनते और मरम्मत तेज होती है।',
    faq3Category: 'समर्थन और समुदाय',
    faq3Question: 'किसी समस्या का समर्थन करने का क्या अर्थ है?',
    faq3Answer: 'समस्या का समर्थन करना एक आधिकारिक वोट की तरह है। यह नगर निगम को सूचित करता है कि यह समस्या कई लोगों को प्रभावित कर रही है, जिससे इसकी प्राथमिकता बढ़ती है।',
    faq4Category: 'प्राथमिकता और निरीक्षण',
    faq4Question: 'प्राथमिकता कैसे तय की जाती है?',
    faq4Answer: 'AI गंभीरता, सुरक्षा जोखिमों, समस्या की अवधि और सामुदायिक समर्थन के आधार पर 1 से 5 तक प्राथमिकता स्कोर की गणना करता है।',
    faq5Category: 'ट्रैकिंग और अपडेट',
    faq5Question: 'प्रगति को कैसे ट्रैक करें?',
    faq5Answer: 'आप "प्रगति ट्रैक करें" पेज पर लाइव जानकारी देख सकते हैं। जब भी नगर निगम निरीक्षण करता है या टीम भेजता है, तो अपडेट यहां दिखाई देते हैं।'
  }
};

// ====================================================================
// CATEGORY, STATUS & PRIORITY LOCALIZATION HELPERS
// ====================================================================

export const getCategoryLabel = (category: string, lang: LanguageCode): string => {
  const catMap: Record<string, Record<LanguageCode, string>> = {
    'Roads & Footpaths': {
      English: 'Roads & Footpaths',
      Kannada: 'ರಸ್ತೆಗಳು ಮತ್ತು ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು',
      Hindi: 'सड़कें और फुटपाथ'
    },
    'Water & Sewage': {
      English: 'Water & Sewage',
      Kannada: 'ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ',
      Hindi: 'जल और सीवेज'
    },
    'Street Lighting': {
      English: 'Street Lighting',
      Kannada: 'ಬೀದಿದೀಪಗಳು',
      Hindi: 'स्ट्रीट लाइटिंग'
    },
    'Garbage & Sanitation': {
      English: 'Garbage & Sanitation',
      Kannada: 'ಕಸ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
      Hindi: 'कचरा और स्वच्छता'
    },
    'Public Safety & Hazards': {
      English: 'Public Safety & Hazards',
      Kannada: 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ ಮತ್ತು ಅಪಾಯಗಳು',
      Hindi: 'सार्वजनिक सुरक्षा और खतरे'
    },
    'Parks & Environment': {
      English: 'Parks & Environment',
      Kannada: 'ಉದ್ಯಾನವನಗಳು ಮತ್ತು ಪರಿಸರ',
      Hindi: 'पार्क और पर्यावरण'
    },
    'Other Civic Issue': {
      English: 'Other Civic Issue',
      Kannada: 'ಇತರ ನಾಗರಿಕ ಸಮಸ್ಯೆ',
      Hindi: 'अन्य नागरिक समस्या'
    }
  };

  return catMap[category]?.[lang] || category;
};

export const getStatusLabel = (status: string, lang: LanguageCode): string => {
  const statusMap: Record<string, Record<LanguageCode, string>> = {
    reported: {
      English: 'Reported',
      Kannada: 'ವರದಿಯಾಗಿದೆ',
      Hindi: 'दर्ज किया गया'
    },
    reviewed: {
      English: 'Reviewed',
      Kannada: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
      Hindi: 'समीक्षित'
    },
    assigned: {
      English: 'Worker Assigned',
      Kannada: 'ಸಿಬ್ಬಂದಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
      Hindi: 'कार्यकर्ता नियुक्त'
    },
    in_progress: {
      English: 'In Progress',
      Kannada: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
      Hindi: 'प्रगति पर'
    },
    completed: {
      English: 'Resolved',
      Kannada: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
      Hindi: 'हल किया गया'
    }
  };

  return statusMap[status]?.[lang] || status;
};

export const getPriorityLabel = (priority: string, lang: LanguageCode): string => {
  const prioMap: Record<string, Record<LanguageCode, string>> = {
    critical: {
      English: 'Critical',
      Kannada: 'ಅತ್ಯಂತ ತುರ್ತು (Critical)',
      Hindi: 'अत्यंत गंभीर (Critical)'
    },
    high: {
      English: 'High',
      Kannada: 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆ (High)',
      Hindi: 'उच्च प्राथमिकता (High)'
    },
    medium: {
      English: 'Medium',
      Kannada: 'ಮಧ್ಯಮ ಆದ್ಯತೆ (Medium)',
      Hindi: 'मध्यम प्राथमिकता (Medium)'
    },
    low: {
      English: 'Low',
      Kannada: 'ಕಡಿಮೆ ಆದ್ಯತೆ (Low)',
      Hindi: 'कम प्राथमिकता (Low)'
    }
  };

  return prioMap[priority]?.[lang] || priority;
};

export const getDurationLabel = (duration: string, lang: LanguageCode): string => {
  const durMap: Record<string, Record<LanguageCode, string>> = {
    not_sure: {
      English: 'Recently noticed / Not sure',
      Kannada: 'ಇತ್ತೀಚೆಗೆ ಗಮನಿಸಲಾಗಿದೆ / ಖಚಿತವಿಲ್ಲ',
      Hindi: 'हाल ही में देखा गया / निश्चित नहीं'
    },
    less_than_month: {
      English: 'Less than a month',
      Kannada: 'ಒಂದು ತಿಂಗಳಿಗಿಂತ ಕಡಿಮೆ',
      Hindi: 'एक महीने से कम'
    },
    '1_to_6_months': {
      English: '1 to 6 months',
      Kannada: '1 ರಿಂದ 6 ತಿಂಗಳು',
      Hindi: '1 से 6 महीने'
    },
    more_than_6_months: {
      English: 'More than 6 months',
      Kannada: '6 ತಿಂಗಳಿಗಿಂತ ಹೆಚ್ಚು',
      Hindi: '6 महीने से अधिक'
    }
  };

  return durMap[duration]?.[lang] || duration;
};
