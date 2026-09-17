import React, { useState } from 'react';
import { Player, QuizQuestion } from '../types';
import { Users, Copy, Check, Play, Edit3, ArrowLeft, Crown } from 'lucide-react';
import { sound } from '../utils/sound';

interface LobbyViewProps {
  roomCode: string;
  players: Record<string, Player>;
  isHost: boolean;
  questions: QuizQuestion[];
  onStartGame: () => void;
  onOpenEditor: () => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  players,
  isHost,
  questions,
  onStartGame,
  onOpenEditor,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const playerList = Object.values(players) as Player[];

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    sound.playStart();
    onStartGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Navigation & Leave */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ออกจากห้อง</span>
        </button>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-semibold border border-indigo-500/30 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>ตรวจ/แก้ไขคำถาม ({questions.length} ข้อ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Room Code Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-2xl relative overflow-hidden">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-indigo-300">
          รหัสห้องสำหรับเข้าร่วม (ROOM PIN)
        </p>
        
        <div className="inline-flex items-center gap-3 bg-slate-950/80 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-indigo-500/50 shadow-inner">
          <span className="font-mono text-4xl sm:text-6xl font-black tracking-widest text-amber-400">
            {roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-all active:scale-95"
            title="คัดลอกรหัสห้อง"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          แชร์รหัสนี้ให้เพื่อนพิมพ์ในช่อง "เข้าร่วมห้อง" บนหน้าแรกเพื่อแข่งกันได้เลย!
        </p>
      </div>

      {/* Players in Lobby Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              ผู้เล่นในห้อง ({playerList.length} คน)
            </h2>
          </div>

          <div className="text-xs text-slate-400">
            {isHost ? 'คุณเป็น Host พร้อมเริ่มเมื่อไหร่กดได้ทันที' : 'กำลังรอ Host กดเริ่มเกม...'}
          </div>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {playerList.map((player) => (
            <div
              key={player.id}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 relative overflow-hidden group shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {player.avatar || '🎮'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white truncate">
                    {player.name}
                  </span>
                  {player.isHost && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {player.isHost ? 'หัวหน้าห้อง (Host)' : 'ผู้เข้าแข่งขัน'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Controls or Waiting Prompt */}
      <div className="pt-2">
        {isHost ? (
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>เริ่มเกมเลย! (Start Game)</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center flex items-center justify-center gap-3 text-slate-300 text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>เตรียมตัวให้พร้อม! กำลังรอหัวหน้าห้องกดเริ่มเกม...</span>
          </div>
        )}
      </div>

    </div>
  );
};
