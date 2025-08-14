/**
 * Educational app templates and prompts for Edu-Bricks
 * Templates for generating educational learning applications
 */

export const EDUCATIONAL_APP_TEMPLATES = {
  // Quiz and Assessment Apps
  QUIZ_APP: {
    name: "Interactive Quiz App",
    description: "Create a quiz application with multiple choice, true/false, and open-ended questions",
    prompt: `Create an interactive quiz application with the following features:
    - Multiple question types (multiple choice, true/false, short answer)
    - Score tracking and progress indicators
    - Timer functionality for timed quizzes
    - Immediate feedback on answers
    - Results summary with correct/incorrect breakdown
    - Topic categorization for questions
    - Difficulty levels (easy, medium, hard)
    - Clean, student-friendly UI with accessible design`,
    technologies: ["React", "TypeScript", "Tailwind CSS", "Local Storage"],
    components: ["QuizCard", "QuestionDisplay", "AnswerInput", "ScoreBoard", "Timer", "ResultsPanel"]
  },

  FLASHCARD_APP: {
    name: "Digital Flashcard System",
    description: "Spaced repetition flashcard app for memorization and learning",
    prompt: `Build a digital flashcard application featuring:
    - Card creation with front/back content
    - Spaced repetition algorithm for optimal learning
    - Progress tracking per deck and card
    - Category organization for different subjects
    - Study session modes (review, new cards, missed cards)
    - Confidence rating system for cards
    - Statistics dashboard showing learning progress
    - Import/export functionality for sharing decks`,
    technologies: ["React", "TypeScript", "Tailwind CSS", "IndexedDB"],
    components: ["FlashCard", "DeckManager", "StudySession", "ProgressChart", "CardEditor", "StatsPanel"]
  },

  CODING_PRACTICE: {
    name: "Coding Practice Platform",
    description: "Interactive coding challenges with instant feedback",
    prompt: `Develop a coding practice platform with:
    - Code editor with syntax highlighting
    - Multiple programming languages support
    - Test case validation and instant feedback
    - Difficulty progression from beginner to advanced
    - Topic-based challenges (algorithms, data structures, etc.)
    - Solution hints and explanations
    - Progress tracking and achievement system
    - Code submission history and review`,
    technologies: ["React", "TypeScript", "Monaco Editor", "Code Mirror", "Tailwind CSS"],
    components: ["CodeEditor", "ChallengeCard", "TestRunner", "HintSystem", "ProgressTracker", "SolutionViewer"]
  },

  MATH_TUTOR: {
    name: "Interactive Math Tutor",
    description: "Step-by-step math problem solver with visual explanations",
    prompt: `Create an interactive math tutoring app with:
    - Problem generation for various math topics
    - Step-by-step solution breakdown
    - Visual representations (graphs, diagrams)
    - Interactive equation solver
    - Practice mode with increasing difficulty
    - Mistake identification and correction hints
    - Progress tracking by topic and skill level
    - Adaptive learning based on performance`,
    technologies: ["React", "TypeScript", "MathJax", "D3.js", "Tailwind CSS"],
    components: ["ProblemGenerator", "SolutionSteps", "MathRenderer", "GraphViewer", "ProgressDashboard", "HintProvider"]
  },

  LANGUAGE_LEARNING: {
    name: "Language Learning Companion",
    description: "Comprehensive language learning app with multiple learning modes",
    prompt: `Build a language learning application featuring:
    - Vocabulary building with spaced repetition
    - Grammar exercises with instant feedback
    - Pronunciation practice with audio recording
    - Reading comprehension exercises
    - Writing practice with AI feedback
    - Cultural context lessons
    - Progress tracking across all skills
    - Gamification with streaks and achievements`,
    technologies: ["React", "TypeScript", "Web Speech API", "Audio Recording", "Tailwind CSS"],
    components: ["VocabCard", "GrammarExercise", "PronunciationChecker", "ReadingPassage", "WritingEditor", "ProgressRing"]
  },

  ENGLISH_VOCABULARY_TRAINER: {
    name: "English Vocabulary Trainer",
    description: "Advanced English vocabulary building with spaced repetition and contextual learning",
    prompt: `Create a comprehensive English vocabulary training application with:
    - Advanced spaced repetition algorithm for optimal memory retention
    - Word difficulty levels from basic to advanced
    - Multiple definition formats and example sentences
    - Visual associations and memory techniques
    - Contextual learning with real-world usage examples
    - Etymology and word origin information
    - Pronunciation guides with audio playback
    - Progress tracking with detailed statistics
    - Adaptive learning based on retention rates
    - Export/import functionality for custom word lists`,
    technologies: ["React", "TypeScript", "Web Speech API", "Local Storage", "Tailwind CSS"],
    components: ["VocabCard", "SpacedRepetition", "ProgressChart", "WordDetails", "PronunciationPlayer", "StatsDashboard"]
  },

  ENGLISH_GRAMMAR_PRACTICE: {
    name: "Interactive English Grammar Practice",
    description: "Comprehensive grammar exercises covering all English language structures",
    prompt: `Build an interactive English grammar practice application featuring:
    - Complete coverage of English grammar topics (tenses, conditionals, passive voice, etc.)
    - Interactive exercises with drag-and-drop, fill-in-the-blank, and multiple choice
    - Immediate feedback with detailed explanations
    - Grammar rule explanations with examples
    - Difficulty progression from beginner to advanced
    - Common mistake identification and correction
    - Practice mode and test mode options
    - Detailed progress tracking by grammar topic
    - Personalized review sessions for weak areas
    - Achievement system for completed topics`,
    technologies: ["React", "TypeScript", "Drag and Drop API", "Tailwind CSS", "Local Storage"],
    components: ["GrammarExercise", "RuleExplanation", "FeedbackPanel", "ProgressTracker", "TestMode", "AchievementBadge"]
  },

  ENGLISH_READING_COMPREHENSION: {
    name: "English Reading Comprehension Builder",
    description: "Advanced reading comprehension with adaptive difficulty and analysis tools",
    prompt: `Create an English reading comprehension application with:
    - Graded reading passages from beginner to advanced levels
    - Interactive comprehension questions (multiple choice, short answer, essay)
    - Vocabulary highlighting with instant definitions
    - Reading speed tracking and improvement tools
    - Text analysis features (main idea, supporting details, inference)
    - Different text types (fiction, non-fiction, news articles, academic texts)
    - Adaptive difficulty based on comprehension scores
    - Reading strategies tutorials and tips
    - Progress tracking across different text types
    - Summary writing exercises with feedback`,
    technologies: ["React", "TypeScript", "Text Analysis", "Timer API", "Tailwind CSS"],
    components: ["ReadingPassage", "ComprehensionQuiz", "VocabHighlighter", "ReadingTimer", "AnalysisTools", "SummaryEditor"]
  },

  ENGLISH_CONVERSATION_PRACTICE: {
    name: "AI English Conversation Partner",
    description: "Interactive conversation practice with AI-powered dialogue and feedback",
    prompt: `Develop an AI-powered English conversation practice application featuring:
    - Realistic conversation scenarios (job interviews, social situations, business meetings)
    - AI chat partner with natural language responses
    - Speaking practice with voice recognition
    - Pronunciation feedback and correction
    - Common phrases and expressions library
    - Conversation flow guidance and suggestions
    - Grammar and vocabulary correction in real-time
    - Cultural context and etiquette tips
    - Progress tracking for conversation skills
    - Role-play scenarios with different difficulty levels`,
    technologies: ["React", "TypeScript", "Web Speech API", "Speech Recognition", "Tailwind CSS"],
    components: ["ConversationChat", "VoiceRecorder", "PronunciationFeedback", "ScenarioSelector", "PhraseSuggestions", "CulturalTips"]
  },

  KOREAN_ENGLISH_BRIDGE: {
    name: "Korean-English Bridge Learning",
    description: "Specialized app for Korean speakers learning English with cultural context",
    prompt: `Create a specialized English learning app for Korean speakers featuring:
    - Korean-English translation exercises with context
    - Common Korean-to-English language patterns and differences
    - Cultural context comparisons between Korean and English speaking countries
    - Pronunciation guide specifically for Korean speakers
    - Grammar comparison between Korean and English structures
    - Business English for Korean professionals
    - English expressions that don't directly translate from Korean
    - Interactive dialogue practice with Korean cultural scenarios
    - Progress tracking with Korean language interface options
    - Community features for Korean learners to practice together`,
    technologies: ["React", "TypeScript", "Web Speech API", "Korean Font Support", "Tailwind CSS"],
    components: ["TranslationExercise", "CulturalComparison", "PronunciationGuide", "GrammarComparison", "BusinessDialogue", "CommunityChat"]
  },

  SCIENCE_LAB: {
    name: "Virtual Science Laboratory",
    description: "Interactive science experiments and simulations",
    prompt: `Develop a virtual science lab with:
    - Interactive experiment simulations
    - Lab equipment and tools simulation
    - Data collection and analysis tools
    - Hypothesis testing framework
    - Safety protocols and procedures
    - Results documentation and sharing
    - Multiple science subjects (physics, chemistry, biology)
    - 3D visualizations and animations`,
    technologies: ["React", "TypeScript", "Three.js", "Chart.js", "Tailwind CSS"],
    components: ["ExperimentSimulator", "DataCollector", "ResultsAnalyzer", "SafetyChecker", "3DViewer", "ReportGenerator"]
  }
};

export const EDUCATIONAL_PROMPTS = {
  GENERATE_EDUCATIONAL_APP: `You are an expert educational technology developer specializing in interactive learning applications. Generate a complete, functional educational application based on the user's requirements with deep understanding of Korean educational contexts and needs.

## Korean Language Understanding
- Fully understand Korean input and educational terminology
- Examples: "영어 학습 앱" = English learning app, "단어 암기" = vocabulary memorization, "문법 연습" = grammar practice
- Respond appropriately to Korean educational goals and cultural context

Follow these pedagogical principles:
1. **Pedagogical Design**: Structure content to support effective learning with Korean learning preferences
2. **Progressive Difficulty**: Start simple and gradually increase complexity with proper scaffolding
3. **Immediate Feedback**: Provide instant, constructive feedback on student responses in appropriate language
4. **Cultural Context**: Consider Korean educational culture and learning styles
5. **Engagement**: Use interactive elements and appropriate gamification for Korean learners
6. **Accessibility**: Ensure the app is usable by students with different abilities and Korean language support

When creating educational apps:
- Include clear learning objectives in both Korean and English if applicable
- Provide multiple learning modalities (visual, auditory, kinesthetic)
- Implement progress tracking and analytics with Korean interface options
- Add help and hint systems with Korean language support
- Ensure mobile-responsive design for Korean devices and screen sizes
- Consider Korean educational standards and curriculum alignment`,

  ENGLISH_LEARNING_SPECIALIZED: `Create comprehensive English learning applications specifically designed for Korean speakers:

## Core English Learning Features
1. **Vocabulary Building**: Implement spaced repetition with Korean translations and cultural context
2. **Grammar Practice**: Focus on grammar points that are challenging for Korean speakers
3. **Pronunciation Training**: Address specific pronunciation challenges for Korean native speakers
4. **Reading Comprehension**: Use culturally relevant materials and progressive difficulty
5. **Speaking Practice**: Interactive conversation practice with realistic scenarios
6. **Writing Skills**: Guided writing exercises with grammar and vocabulary feedback

## Korean-Specific Adaptations
- Address common Korean-English translation challenges
- Include cultural context for English expressions that don't exist in Korean
- Provide pronunciation guides specific to Korean speakers (R/L sounds, TH sounds, etc.)
- Grammar explanations comparing Korean and English structures
- Business English relevant to Korean professionals
- Include Korean UI elements and instructions when helpful

## Technical Implementation
- Use localStorage for progress persistence
- Implement audio features for pronunciation practice
- Include interactive exercises with immediate feedback
- Responsive design for mobile-first Korean users
- Clean, distraction-free interface appropriate for serious study`,

  ADAPTIVE_LEARNING: `Implement adaptive learning features for Korean educational contexts:
1. **Skill Assessment**: Initial assessment considering Korean educational background
2. **Personalized Pathways**: Adjust content based on Korean learning patterns
3. **Difficulty Scaling**: Automatically adjust difficulty with Korean educational standards
4. **Learning Analytics**: Track learning patterns with Korean cultural considerations
5. **Intervention Triggers**: Identify when students need help with Korean context
6. **Recommendation Engine**: Suggest activities based on Korean learning preferences`,

  ASSESSMENT_DESIGN: `Create comprehensive assessment features for Korean learners:
1. **Formative Assessment**: Ongoing checks with Korean educational methods
2. **Summative Assessment**: End-of-unit evaluations aligned with Korean standards
3. **Authentic Assessment**: Real-world application relevant to Korean context
4. **Self-Assessment**: Reflection tools with Korean metacognitive approaches
5. **Progress Analytics**: Detailed insights considering Korean learning culture
6. **Cultural Sensitivity**: Assessments appropriate for Korean educational values`
};

export function getEducationalTemplate(templateKey: keyof typeof EDUCATIONAL_APP_TEMPLATES) {
  return EDUCATIONAL_APP_TEMPLATES[templateKey];
}

export function getAllEducationalTemplates() {
  return Object.entries(EDUCATIONAL_APP_TEMPLATES).map(([key, template]) => ({
    key,
    ...template
  }));
}

export function generateEducationalAppPrompt(
  appType: string,
  subject: string,
  targetAge: string,
  features: string[]
): string {
  return `${EDUCATIONAL_PROMPTS.GENERATE_EDUCATIONAL_APP}

Create a ${appType} application for ${subject} learning, targeted at ${targetAge} students.

Required Features:
${features.map(feature => `- ${feature}`).join('\n')}

Additional Requirements:
- Modern, intuitive user interface with Korean design sensibilities
- Responsive design for desktop and mobile (Korean screen preferences)
- Progress saving and tracking with localStorage
- Clear navigation and instructions (Korean language support when needed)
- Engaging visual design appropriate for the target age group and Korean culture
- Accessibility features (keyboard navigation, screen reader support)
- Performance optimized for smooth interactions on Korean devices

Generate complete, production-ready code with proper component structure, state management, and Tailwind CSS styling.`;
}

export function generateEnglishLearningAppPrompt(
  appType: 'vocabulary' | 'grammar' | 'reading' | 'conversation' | 'comprehensive',
  level: 'beginner' | 'intermediate' | 'advanced',
  features: string[]
): string {
  const basePrompt = EDUCATIONAL_PROMPTS.ENGLISH_LEARNING_SPECIALIZED;
  
  const levelGuidance = {
    beginner: "Focus on basic vocabulary, simple sentences, and foundational grammar. Use Korean explanations when helpful.",
    intermediate: "Include complex grammar structures, longer reading passages, and conversational practice. Balance Korean and English explanations.",
    advanced: "Advanced vocabulary, complex texts, business English, and nuanced grammar. Primarily English with Korean support when needed."
  };

  const typeSpecifics = {
    vocabulary: `
## Vocabulary App Specifics:
- Implement spaced repetition algorithm (SM-2 or similar)
- Include Korean translations and cultural context
- Word families and etymology information
- Visual memory aids and mnemonics
- Usage examples in context
- Pronunciation guides for Korean speakers`,
    
    grammar: `
## Grammar App Specifics:
- Focus on grammar points difficult for Korean speakers (articles, prepositions, verb tenses)
- Compare English and Korean grammar structures
- Interactive exercises (fill-in-blank, sentence construction, error correction)
- Immediate feedback with explanations
- Grammar pattern recognition exercises`,
    
    reading: `
## Reading App Specifics:
- Graded reading materials with Korean cultural relevance
- Vocabulary highlighting with instant definitions
- Reading comprehension questions with analysis
- Speed reading practice and improvement tracking
- Different text types (news, stories, academic, business)`,
    
    conversation: `
## Conversation App Specifics:
- Role-play scenarios relevant to Korean contexts
- Pronunciation practice with Korean-specific challenges
- Common conversation patterns and phrases
- Cultural context for different communication styles
- Speaking practice with feedback`,
    
    comprehensive: `
## Comprehensive App Specifics:
- Integrate vocabulary, grammar, reading, and conversation practice
- Balanced skill development across all areas
- Personalized learning paths based on assessment
- Progress tracking across different skill areas
- Adaptive content based on user performance`
  };

  return `${basePrompt}

${typeSpecifics[appType]}

## Level: ${level.toUpperCase()}
${levelGuidance[level]}

Required Features:
${features.map(feature => `- ${feature}`).join('\n')}

## Technical Requirements:
- React with TypeScript for type safety
- Tailwind CSS for styling (Korean-friendly responsive design)
- Local Storage for progress persistence
- Audio APIs for pronunciation features (if applicable)
- Clean component architecture with reusable educational components
- State management for learning progress and user data

Generate a complete, production-ready English learning application with proper educational design principles and Korean learner considerations.`;
}

export function getEnglishLearningTemplates() {
  return {
    ENGLISH_VOCABULARY_TRAINER: EDUCATIONAL_APP_TEMPLATES.ENGLISH_VOCABULARY_TRAINER,
    ENGLISH_GRAMMAR_PRACTICE: EDUCATIONAL_APP_TEMPLATES.ENGLISH_GRAMMAR_PRACTICE,
    ENGLISH_READING_COMPREHENSION: EDUCATIONAL_APP_TEMPLATES.ENGLISH_READING_COMPREHENSION,
    ENGLISH_CONVERSATION_PRACTICE: EDUCATIONAL_APP_TEMPLATES.ENGLISH_CONVERSATION_PRACTICE,
    KOREAN_ENGLISH_BRIDGE: EDUCATIONAL_APP_TEMPLATES.KOREAN_ENGLISH_BRIDGE
  };
}

export function generateKoreanContextPrompt(userInput: string): string {
  // Common Korean educational terms and their English equivalents
  const koreanTerms: { [key: string]: string } = {
    '영어 학습': 'English learning',
    '단어 암기': 'vocabulary memorization',
    '문법 연습': 'grammar practice',
    '독해 연습': 'reading comprehension practice',
    '회화 연습': 'conversation practice',
    '발음 연습': 'pronunciation practice',
    '듣기 연습': 'listening practice',
    '쓰기 연습': 'writing practice',
    '토익': 'TOEIC',
    '토플': 'TOEFL',
    '수능 영어': 'Korean SAT English',
    '초급': 'beginner level',
    '중급': 'intermediate level',
    '고급': 'advanced level',
    '퀴즈': 'quiz',
    '플래시카드': 'flashcard',
    '진도 추적': 'progress tracking'
  };

  let interpretedRequest = userInput;
  
  // Replace Korean terms with English explanations for better AI understanding
  Object.entries(koreanTerms).forEach(([korean, english]) => {
    if (userInput.includes(korean)) {
      interpretedRequest = interpretedRequest.replace(new RegExp(korean, 'g'), `${korean} (${english})`);
    }
  });

  return `
## Korean Context Understanding
User Input: "${userInput}"
Interpreted Request: "${interpretedRequest}"

Based on the Korean educational context, create an appropriate English learning application that considers:
- Korean learners' specific challenges with English
- Korean educational culture and learning preferences
- Mobile-first design for Korean users
- Integration with Korean study habits and patterns
- Appropriate difficulty progression for Korean learners

${EDUCATIONAL_PROMPTS.ENGLISH_LEARNING_SPECIALIZED}`;
}