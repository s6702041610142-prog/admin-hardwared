import React from 'react';
import { Player } from '../types';
import { Trophy, ArrowRight, Flame } from 'lucide-react';
import { sound } from '../utils/sound';

interface LeaderboardViewProps {
  players: Record<string, Player>;
  currentQuestionIndex: number;
  totalQuestions: number;
  isHost: boolean;
  onNextQuestion: () => void;
  isSolo?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  players,
  currentQuestionIndex,
  totalQuestions,
  isHost,
  onNextQuestion,
  isSolo = false,
}) => {
  const rankedPlayers = (Object.values(players) as Player[]).sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>กระดานคะแนนเรียลไทม์ • สรุปข้อที่ {currentQuestionIndex + 1}/{totalQuestions}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          อันดับคะแนนล่าสุด 🏆
        </h2>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
        {rankedPlayers.map((player, idx) => {
          const isTop3 = idx < 3;
          const rankColors = [
            'bg-amber-500/20 text-amber-300 border-amber-500/50',
            'bg-slate-400/20 text-slate-300 border-slate-400/50',
            'bg-amber-700/20 text-amber-500 border-amber-700/50',
          ];

          return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                idx === 0
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${
                  isTop3 ? rankColors[idx] : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {idx + 1}
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                  {player.avatar || '🎮'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Host
                      </span>
                    )}
                  </div>
                  {player.streak > 1 && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                      <Flame className="w-3 h-3 text-amber-500 fill-current" />
                      <span>{player.streak} ข้อติดกัน!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Display */}
              <div className="text-right shrink-0">
                <span className="text-base sm:text-xl font-black text-emerald-400 font-mono">
                  {player.score.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block">คะแนน</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance to next question */}
      <div className="pt-2">
        {isHost || isSolo ? (
          <button
            onClick={() => {
              sound.playClick();
              onNextQuestion();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>{currentQuestionIndex + 1 < totalQuestions ? `เริ่มข้อที่ ${currentQuestionIndex + 2}` : 'ดูผลการแข่งขันรอบสุดท้าย!'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
            กำลังรอ Host เริ่มคำถามข้อถัดไป...
          </div>
        )}
      </div>

    </div>
  );
};
