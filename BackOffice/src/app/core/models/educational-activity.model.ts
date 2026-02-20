export interface EducationalActivity {
    id: number;
    name: string;
    type: ActivityType;
    description: string;
    createdDate: Date;
    status: ActivityStatus;
    content: ActivityContent;
}

export type ActivityType = 'quiz' | 'cognitive_game' | 'video';
export type ActivityStatus = 'active' | 'inactive';

export interface ActivityContent {
    // For Quiz
    questions?: QuizQuestion[];

    // For Cognitive Game
    gameConfig?: GameConfig;

    // For Video
    videoUrl?: string;
    duration?: number; // in minutes
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
}

export interface GameConfig {
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // in seconds
    instructions: string;
}
