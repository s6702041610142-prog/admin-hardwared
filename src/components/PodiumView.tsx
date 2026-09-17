import React, { useEffect } from 'react';
import { Player } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Medal } from 'lucide-react';
import { sound } from '../utils/sound';

interface PodiumViewProps {
  players: Record<string, Player>;
  isHost: boolean;
  onRestart: () => void;
  onHome: () => void;
  isSolo?: boolean;
}

export const PodiumView: React.FC<PodiumViewProps> = ({
  players,
  isHost,
  onRestart,
  onHome,
  isSolo = false,
}) => {
  const ranked = (Object.values(players) as Player[]).sort((a, b) => b.score - a.score);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  useEffect(() => {
    sound.playVictory();

    // Confetti effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Victory Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/40 shadow-lg shadow-amber-500/10">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>การแข่งขันจบลงแล้ว • ยินดีด้วยกับผู้ชนะ!</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          บทสรุปแชมป์เปี้ยน 🏆
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          ตอบคำถามเกี่ยวกับอุปกรณ์คอมพิวเตอร์ครบทั้ง 10 ข้อเรียบร้อยแล้ว
        </p>
      </div>

      {/* Podium Display (1st, 2nd, 3rd) */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-12 pb-4">
        
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[150px] animate-slideUp">
            <div className="text-3xl mb-1">{second.avatar}</div>
            <span className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-full text-center">
              {second.name}
            </span>
            <span className="text-xs text-slate-400 font-mono mb-2">
              {second.score.toLocaleString()} pt
            </span>
            <div className="w-full h-32 sm:h-40 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-2 border-slate-400 flex flex-col items-center justify-center p-2 shadow-xl">
              <Medal className="w-6 h-6 text-slate-300 mb-1" />
              <span className="font-black text-2xl sm:text-3xl text-slate-300">2</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">รองชนะเลิศ</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {first && (
          <div className="flex flex-col items-center flex-1 max-w-[180px] -mt-6 animate-slideUp">
            <div className="relative mb-1">
              <Crown className="w-8 h-8 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="text-4xl sm:text-5xl">{first.avatar}</div>
            </div>
            <span className="font-extrabold text-sm sm:text-base text-amber-300 truncate max-w-full text-center">
              {first.name}
            </span>
            <span className="text-xs sm:text-sm text-emerald-400 font-bold font-mono mb-2">
              {first.score.toLocaleString()} pt
            </span>
            <div className="w-full h-44 sm:h-56 rounded-t-3xl bg-gradient-to-t from-amber-950 via-amber-900 to-amber-700 border-t-4 border-amber-400 flex flex-col items-center justify-center p-2 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none" />
              <Trophy className="w-8 h-8 text-amber-300 mb-1" />
              <span className="font-black text-3xl sm:text-4xl text-amber-200">1</span>
              <span className="text-[11px] text-amber-300 uppercase tracking-widest font-extrabold">ชนะเลิศ!</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[150px] animate-slideUp">
            <div className="text-3xl mb-1">{third.avatar}</div>
            <span className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-full text-center">
              {third.name}
            </span>
            <span className="text-xs text-slate-400 font-mono mb-2">
              {third.score.toLocaleString()} pt
            </span>
            <div className="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-t from-amber-950/70 to-amber-900/60 border-t-2 border-amber-700 flex flex-col items-center justify-center p-2 shadow-xl">
              <Medal className="w-6 h-6 text-amber-600 mb-1" />
              <span className="font-black text-2xl sm:text-3xl text-amber-600">3</span>
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">อันดับสาม</span>
            </div>
          </div>
        )}

      </div>

      {/* Full Rankings List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-3">
        <h3 className="text-sm font-bold text-slate-300 pb-2 border-b border-slate-800">
          ตารางคะแนนรวมทั้งหมด
        </h3>
        
        <div className="space-y-2">
          {ranked.map((player, idx) => (
            <div
              key={player.id}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-400 text-sm">
                  #{idx + 1}
                </span>
                <span className="text-xl">{player.avatar}</span>
                <span className="font-bold text-sm text-white">{player.name}</span>
              </div>

              <span className="font-mono font-bold text-base text-emerald-400">
                {player.score.toLocaleString()} คะแนน
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {(isHost || isSolo) && (
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>เล่นใหม่อีกครั้ง</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onHome();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-base border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>กลับหน้าแรก</span>
        </button>
      </div>

    </div>
  );
};
