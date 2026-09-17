import React, { useEffect } from 'react';
import { QuizQuestion, ChoiceKey } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Award, Zap } from 'lucide-react';
import { sound } from '../utils/sound';

interface RevealViewProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer?: ChoiceKey;
  isHost: boolean;
  scoreEarned?: number;
  streak?: number;
  onNext: () => void;
  isSolo?: boolean;
}

export const RevealView: React.FC<RevealViewProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isHost,
  scoreEarned = 0,
  streak = 0,
  onNext,
  isSolo = false,
}) => {
  const isCorrect = selectedAnswer === question.answer;

  useEffect(() => {
    if (selectedAnswer) {
      if (isCorrect) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
    }
  }, [selectedAnswer, isCorrect]);

  const correctOption = question.options.find(o => o.key === question.answer);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Result Status Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-center shadow-2xl space-y-3 relative overflow-hidden ${
        selectedAnswer
          ? isCorrect
            ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/60'
            : 'bg-gradient-to-b from-rose-950/80 to-slate-900 border-rose-500/60'
          : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700'
      }`}>
        <div className="inline-flex items-center justify-center">
          {selectedAnswer ? (
            isCorrect ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <XCircle className="w-10 h-10" />
              </div>
            )
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
              <Award className="w-10 h-10" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {selectedAnswer
              ? isCorrect
                ? 'ถูกต้อง! ยอดเยี่ยมมาก 🎉'
                : 'ยังไม่ถูกต้องนะข้อนี้ 😅'
              : 'หมดเวลาตอบคำถาม!'}
          </h2>
          
          {selectedAnswer && isCorrect && scoreEarned > 0 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-sm border border-emerald-500/30 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                +{scoreEarned} คะแนน
              </span>
              {streak > 1 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-sm border border-amber-500/30">
                  🔥 คอมโบ x{streak}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Answer & Explanation Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        
        {/* The Question */}
        <div>
          <span className="text-xs font-semibold text-slate-400">คำถามข้อที่ {questionIndex + 1}/{totalQuestions}</span>
          <p className="text-base sm:text-lg font-bold text-white mt-1">
            {question.question}
          </p>
        </div>

        {/* Correct Answer Highlight */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shrink-0">
            {question.answer}
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              คำตอบที่ถูกต้องคือ:
            </span>
            <span className="text-base font-bold text-white">
              {correctOption?.text || ''}
            </span>
          </div>
        </div>

        {/* Educational Explanation */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>เกร็ดความรู้เพิ่มเติม (คำอธิบายเฉลย)</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      </div>

      {/* Advance Action Button */}
      <div className="pt-2">
        {isHost || isSolo ? (
          <button
            onClick={() => {
              sound.playClick();
              onNext();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>{questionIndex + 1 < totalQuestions ? 'ดูตารางคะแนน / ข้อถัดไป' : 'ดูบทสรุปและผู้ชนะ!'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
            กำลังรอ Host ดำเนินการต่อ...
          </div>
        )}
      </div>

    </div>
  );
};
