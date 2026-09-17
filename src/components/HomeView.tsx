import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Play, Users, Edit3, Sparkles, Trophy, HelpCircle, ChevronRight, Copy, Check } from 'lucide-react';
import { sound } from '../utils/sound';

interface HomeViewProps {
  questions: QuizQuestion[];
  onStartSolo: (duration: number) => void;
  onCreateRoom: (name: string, avatar: string, duration: number) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  onOpenEditor: () => void;
  isLoading?: boolean;
}

const AVATARS = ['💻', '🚀', '⚡', '🎮', '🤖', '🧠', '🕹️', '👾', '🔥', '👑'];

export const HomeView: React.FC<HomeViewProps> = ({
  questions,
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
  onOpenEditor,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'solo'>('join');
  const [nickname, setNickname] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('💻');
  const [questionDuration, setQuestionDuration] = useState<number>(15);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onCreateRoom(nickname.trim() || 'Host', selectedAvatar, questionDuration);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      alert('กรุณากรอกรหัสห้อง (Room Code)');
      return;
    }
    sound.playClick();
    onJoinRoom(roomCode.trim(), nickname.trim() || 'ผู้เล่น', selectedAvatar);
  };

  const handleSolo = () => {
    sound.playStart();
    onStartSolo(questionDuration);
  };

  const copyQuestionsSummary = () => {
    sound.playClick();
    const formatted = questions.map((q, i) => {
      const opts = q.options.map(o => `${o.key}. ${o.text}`).join('\n');
      return `ข้อที่ ${i + 1}: ${q.question}\n${opts}\nเฉลย: ${q.answer}\nคำอธิบาย: ${q.explanation}\n`;
    }).join('\n---\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      
      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/40">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ชุดคำถามออนไลน์ • 10 ข้อ เจาะลึกอุปกรณ์คอมพิวเตอร์</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              เกมตอบคำถามออนไลน์ <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400">
                อุปกรณ์คอมพิวเตอร์ (Hardware Quiz)
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              วัดความรู้เรื่อง CPU, RAM, GPU, SSD, Power Supply, Mainboard และอื่นๆ! 
              ท้าทายเพื่อนด้วยห้องเล่นออนไลน์แบบเรียลไทม์ หรือฝึกซ้อมเดี่ยว พร้อมระบบแก้ไขโจทย์ได้ดั่งใจ
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">✓ 4 ตัวเลือก ก. ข. ค. ง.</span>
              <span className="flex items-center gap-1">✓ เฉลย & เกร็ดความรู้ประกอบ</span>
              <span className="flex items-center gap-1">✓ ห้องเล่น Multiplayer สด</span>
              <span className="flex items-center gap-1">✓ ปรับแต่งแก้ไขคำถามได้</span>
            </div>
          </div>

          {/* Quick Actions Panel on Right */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenEditor}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 shadow-md transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>แก้ไข / จัดการโจทย์ ({questions.length} ข้อ)</span>
            </button>

            <button
              onClick={copyQuestionsSummary}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition-colors"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'คัดลอกโจทย์ทั้ง 10 ข้อแล้ว!' : 'คัดลอกรูปแบบโจทย์ทั้งหมด'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Selector & Action Forms */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Play Options (8 Cols) */}
        <div className="md:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('join');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'join'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>เข้าร่วมห้อง (Join)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('create');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างห้องใหม่ (Host)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('solo');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'solo'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>เล่นคนเดียว (Solo)</span>
            </button>
          </div>

          {/* Nickname & Avatar Picker (Common for multiplayer) */}
          {activeTab !== 'solo' && (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                เลือกตัวตนของคุณ
              </label>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform active:scale-95 ${
                      selectedAvatar === av
                        ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="ใส่ชื่อเล่นของคุณ (เช่น ก้องเกียรติ, GamerX)"
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Tab Form: JOIN ROOM */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  รหัสห้อง (Room Code 4 หลัก)
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="เช่น 7A8B"
                  maxLength={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'กำลังเชื่อมต่อห้อง...' : 'เข้าร่วมห้องแข่งขัน'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Tab Form: CREATE ROOM */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  เวลาในการตอบแต่ละข้อ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setQuestionDuration(sec);
                      }}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${
                        questionDuration === sec
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {sec} วินาที
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>จำนวนโจทย์ที่จะใช้เล่น:</span>
                <span className="font-bold text-indigo-300">{questions.length} ข้อ (ปรับแต่งได้ในคลังโจทย์)</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'กำลังสร้างห้อง...' : 'สร้างห้องแข่งขันใหม่ (เปิดห้องรอเพื่อน)'}</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Tab Form: SOLO PLAY */}
          {activeTab === 'solo' && (
            <div className="space-y-5 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span>โหมดฝึกซ้อมเดี่ยว (Solo Practice)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  เริ่มเล่นตอบคำถามทันทีคนเดียวโดยไม่ต้องรอเพื่อน มีตัวจับเวลา คะแนนความเร็ว และแสดงคำอธิบายเกร็ดความรู้ครบทุกข้อ!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  เวลาในการตอบแต่ละข้อ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setQuestionDuration(sec);
                      }}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${
                        questionDuration === sec
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {sec} วินาที
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSolo}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>เริ่มเล่นคนเดียวทันที (10 ข้อ)</span>
              </button>
            </div>
          )}

        </div>

        {/* Question Bank Preview List (4 Cols) */}
        <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>ชุดโจทย์ในระบบ ({questions.length} ข้อ)</span>
              </h3>
              <button
                onClick={onOpenEditor}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                แก้ไข
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.slice(0, 10).map((q, idx) => (
                <div
                  key={q.id || idx}
                  onClick={onOpenEditor}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
                    <span className="font-bold text-indigo-300">ข้อ {idx + 1}</span>
                    <span className="text-emerald-400 font-semibold">เฉลย: {q.answer}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2 mt-1">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 text-center">
            <button
              onClick={onOpenEditor}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>คลิกเพื่อดูตัวเลือก ก. ข. ค. ง. และคำอธิบายทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
