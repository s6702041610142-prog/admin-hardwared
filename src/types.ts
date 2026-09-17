export type ChoiceKey = 'ก' | 'ข' | 'ค' | 'ง';

export interface QuizOption {
  key: ChoiceKey;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  answer: ChoiceKey;
  explanation: string;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ท้าทาย';
  category?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  lastAnswer?: ChoiceKey;
  lastAnswerCorrect?: boolean;
  lastAnswerScore?: number;
  hasAnswered?: boolean;
  isHost: boolean;
}

export type RoomStatus =
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'reveal'
  | 'leaderboard'
  | 'finished';

export interface RoomState {
  code: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  players: Record<string, Player>;
  timeRemaining: number;
  questionDuration: number;
  hostId: string;
  countdownValue?: number;
}

export type ClientMessage =
  | { type: 'create_room'; name: string; avatar: string; questions?: QuizQuestion[]; questionDuration?: number }
  | { type: 'join_room'; code: string; name: string; avatar: string }
  | { type: 'start_game' }
  | { type: 'submit_answer'; answer: ChoiceKey }
  | { type: 'next_question' }
  | { type: 'update_questions'; questions: QuizQuestion[] }
  | { type: 'restart_game' }
  | { type: 'leave_room' };

export type ServerMessage =
  | { type: 'room_state'; state: RoomState; yourId: string }
  | { type: 'error'; message: string }
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; playerId: string }
  | { type: 'tick'; timeRemaining: number }
  | { type: 'game_countdown'; value: number }
  | { type: 'question_start'; index: number; question: QuizQuestion; duration: number }
  | { type: 'reveal'; question: QuizQuestion; scores: Record<string, number> }
  | { type: 'game_finished'; finalRanking: Player[] };
