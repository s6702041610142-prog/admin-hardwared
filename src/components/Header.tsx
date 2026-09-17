import React, { useState } from 'react';
import { Volume2, VolumeX, Cpu, Users, Home } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  roomCode?: string;
  isHost?: boolean;
  onHomeClick?: () => void;
  playerCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isHost,
  onHomeClick,
  playerCount,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
    if (newState) {
      sound.playClick();
    }
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 text-white transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              Hardware Quiz
            </h1>
            <p className="text-[11px] text-indigo-300/70 hidden sm:block">
              เกมตอบคำถามอุปกรณ์คอมพิวเตอร์
            </p>
          </div>
        </div>

        {/* Room Info Badge */}
        {roomCode && (
          <div className="flex items-center gap-2 bg-slate-800/90 border border-indigo-500/30 px-3 py-1.5 rounded-full shadow-inner">
            <span className="text-xs text-indigo-300 font-medium">ห้อง:</span>
            <span className="font-mono font-bold tracking-wider text-amber-400 text-sm">
              {roomCode}
            </span>
            {playerCount !== undefined && (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-700 text-xs text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{playerCount}</span>
              </div>
            )}
            {isHost && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-semibold border border-amber-500/40">
                HOST
              </span>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              title="กลับหน้าหลัก"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
