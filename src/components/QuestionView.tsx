import React, { useEffect } from 'react';
import { QuizQuestion, ChoiceKey } from '../types';
import { Clock, CheckCircle2, Award } from 'lucide-react';
import { sound } from '../utils/sound';

interface QuestionViewProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalDuration: number;
  selectedAnswer?: ChoiceKey;
  onSelectAnswer: (choice: ChoiceKey) => void;
  playerStreak?: number;
}

const OPTION_STYLES: Record<ChoiceKey, { bg: string; border: string; text: string; badge: string }> = {
  'ก': {
    bg: 'from-blue-900/40 to-slate-900/90 hover:from-blue-800/50 hover:to-slate-900',
    border: 'border-blue-500/40 hover:border-blue-400',
    text: 'text-blue-200',
    badge: 'bg-blue-600 text-white',
  },
  'ข': {
    bg: 'from-emerald-900/40 to-slate-900/90 hover:from-emerald-800/50 hover:to-slate-900',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    text: 'text-emerald-200',
    badge: 'bg-emerald-600 text-white',
  },
  'ค': {
    bg: 'from-amber-900/40 to-slate-900/90 hover:from-amber-800/50 hover:to-slate-900',
    border: 'border-amber-500/40 hover:border-amber-400',
    text: 'text-amber-200',
    badge: 'bg-amber-600 text-white',
  },
  'ง': {
    bg: 'from-purple-900/40 to-slate-900/90 hover:from-purple-800/50 hover:to-slate-900',
    border: 'border-purple-500/40 hover:border-purple-400',
    text: 'text-purple-200',
    badge: 'bg-purple-600 text-white',
  },
};

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  totalDuration,
  selectedAnswer,
  onSelectAnswer,
  playerStreak = 0,
}) => {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  const isUrgent = timeRemaining <= 5;

  useEffect(() => {
    if (timeRemaining > 0 && timeRemaining <= 5) {
      sound.playTick();
    }
  }, [timeRemaining]);

  const handleChoice = (key: ChoiceKey) => {
    if (selectedAnswer) return; // already answered
    sound.playClick();
    onSelectAnswer(key);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Header Status Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-bold">
            ข้อ {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            ระดับ: {question.difficulty || 'ปานกลาง'}
          </span>
          {playerStreak > 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
              🔥 Streak x{playerStreak}
            </span>
          )}
        </div>

        {/* Timer Countdown Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-bold text-sm sm:text-base transition-colors ${
          isUrgent
            ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
            : 'bg-slate-900 border-slate-700 text-slate-200'
        }`}>
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-indigo-400'}`} />
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Animated Timer Progress Bar */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[140px] sm:min-h-[180px] flex items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500" />
        <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-relaxed max-w-3xl">
          {question.question}
        </h2>
      </div>

      {/* 4 Choices Grid (2x2 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {question.options.map((option) => {
          const style = OPTION_STYLES[option.key];
          const isSelected = selectedAnswer === option.key;

          return (
            <button
              key={option.key}
              onClick={() => handleChoice(option.key)}
              disabled={!!selectedAnswer}
              className={`p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-3.5 transition-all active:scale-[0.98] shadow-md bg-gradient-to-br ${style.bg} ${
                isSelected
                  ? 'ring-2 ring-indigo-400 border-indigo-400 scale-[1.02] shadow-indigo-500/20'
                  : selectedAnswer
                  ? 'opacity-60 cursor-not-allowed border-slate-800'
                  : style.border
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${style.badge}`}>
                {option.key}
              </div>

              <div className="flex-1">
                <span className={`text-sm sm:text-base font-semibold leading-snug block ${style.text}`}>
                  {option.text}
                </span>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 animate-bounce" />
              )}
            </button>
          );
        })}
      </div>

      {/* Waiting Prompt After Submitting */}
      {selectedAnswer && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center animate-fadeIn flex items-center justify-center gap-3 text-indigo-200 text-sm">
          <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
          <span>บันทึกคำตอบแล้ว! กำลังรอหมดเวลาเพื่อเฉลยพร้อมกัน...</span>
        </div>
      )}

    </div>
  );
};
