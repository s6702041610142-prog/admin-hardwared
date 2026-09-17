import React, { useState } from 'react';
import { QuizQuestion, ChoiceKey } from '../types';
import { DEFAULT_HARDWARE_QUESTIONS } from '../data/defaultQuestions';
import { X, Plus, Trash2, RotateCcw, Download, Upload, Sparkles, Check, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  onSave: (newQuestions: QuizQuestion[]) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  questions,
  onSave,
}) => {
  const [editedQuestions, setEditedQuestions] = useState<QuizQuestion[]>(questions);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = editedQuestions[selectedIndex] || editedQuestions[0];

  const handleUpdateCurrentQuestion = (field: keyof QuizQuestion, value: unknown) => {
    const updated = [...editedQuestions];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      [field]: value,
    };
    setEditedQuestions(updated);
  };

  const handleUpdateOption = (optionKey: ChoiceKey, text: string) => {
    const updated = [...editedQuestions];
    const targetQ = { ...updated[selectedIndex] };
    targetQ.options = targetQ.options.map((opt) =>
      opt.key === optionKey ? { ...opt, text } : opt
    );
    updated[selectedIndex] = targetQ;
    setEditedQuestions(updated);
  };

  const handleAddNewQuestion = () => {
    sound.playClick();
    const newQ: QuizQuestion = {
      id: `custom-${Date.now()}`,
      question: 'คำถามข้อใหม่: อุปกรณ์ใดทำหน้าที่... ?',
      options: [
        { key: 'ก', text: 'ตัวเลือก ก' },
        { key: 'ข', text: 'ตัวเลือก ข' },
        { key: 'ค', text: 'ตัวเลือก ค' },
        { key: 'ง', text: 'ตัวเลือก ง' },
      ],
      answer: 'ก',
      explanation: 'คำอธิบายสั้นๆ เพิ่มเติมสำหรับข้อนี้',
      difficulty: 'ปานกลาง',
      category: 'อุปกรณ์คอมพิวเตอร์',
    };
    const updated = [...editedQuestions, newQ];
    setEditedQuestions(updated);
    setSelectedIndex(updated.length - 1);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    if (editedQuestions.length <= 1) {
      alert('ต้องมีคำถามอย่างน้อย 1 ข้อในระบบ');
      return;
    }
    sound.playClick();
    const updated = editedQuestions.filter((_, idx) => idx !== indexToDelete);
    setEditedQuestions(updated);
    setSelectedIndex(Math.max(0, indexToDelete - 1));
  };

  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตคำถามกลับเป็นชุด 10 ข้อมาตรฐานหัวข้ออุปกรณ์คอมพิวเตอร์หรือไม่?')) {
      sound.playClick();
      setEditedQuestions(DEFAULT_HARDWARE_QUESTIONS);
      setSelectedIndex(0);
    }
  };

  const handleExportJSON = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editedQuestions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'computer_hardware_quiz.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEditedQuestions(parsed);
          setSelectedIndex(0);
          sound.playCorrect();
        } else {
          alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
        }
      } catch {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    sound.playClick();
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'อุปกรณ์คอมพิวเตอร์ (เช่น RAM, CPU, GPU, Mainboard, M.2 SSD, Cooling, Monitor, PSU)',
          difficulty: 'ปานกลาง',
        }),
      });
      const data = await res.json();
      if (data?.question) {
        const updated = [...editedQuestions, data.question];
        setEditedQuestions(updated);
        setSelectedIndex(updated.length - 1);
        sound.playCorrect();
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถสร้างโจทย์อัตโนมัติได้ในขณะนี้');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndClose = () => {
    sound.playClick();
    onSave(editedQuestions);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
              <span>🛠️ แก้ไขและจัดการชุดคำถาม (Quiz Editor)</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {editedQuestions.length} ข้อ
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              หัวข้อ: อุปกรณ์คอมพิวเตอร์ | ปรับแต่งโจทย์ ตัวเลือก ก-ง และเฉลยได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? 'บันทึกแล้ว!' : 'บันทึกการแก้ไข'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Ribbon */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAddNewQuestion}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มคำถาม</span>
            </button>
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'AI กำลังคิดโจทย์...' : 'AI ช่วยคิดโจทย์คอมเพิ่ม'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="รีเซ็ตเป็น 10 ข้อมาตรฐาน"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต 10 ข้อหลัก</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="ส่งออกชุดคำถามเป็นไฟล์ JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </label>
          </div>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Question Navigator */}
          <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>รายการคำถามทั้งหมด</span>
              <span>คลิกเพื่อแก้ไข</span>
            </div>

            {editedQuestions.map((q, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={q.id || idx}
                  onClick={() => {
                    sound.playClick();
                    setSelectedIndex(idx);
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all text-left group relative ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-300 border border-emerald-500/20">
                        เฉลย: {q.answer}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-opacity"
                      title="ลบคำถามข้อนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs line-clamp-2 mt-1.5 font-medium leading-relaxed">
                    {q.question || '(ยังไม่มีข้อความคำถาม)'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Question Details Editor */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900">
            {currentQ ? (
              <>
                {/* Question Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>คำถามข้อที่ {selectedIndex + 1}</span>
                      <span className="text-[11px] font-normal text-slate-400">(สั้นกระชับเข้าใจง่าย)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">ระดับความยาก:</span>
                      <select
                        value={currentQ.difficulty || 'ปานกลาง'}
                        onChange={(e) => handleUpdateCurrentQuestion('difficulty', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg text-xs px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ง่าย">ง่าย</option>
                        <option value="ปานกลาง">ปานกลาง</option>
                        <option value="ท้าทาย">ท้าทาย</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    value={currentQ.question}
                    onChange={(e) => handleUpdateCurrentQuestion('question', e.target.value)}
                    rows={3}
                    placeholder="พิมพ์คำถามเกี่ยวกับอุปกรณ์คอมพิวเตอร์ที่นี่..."
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* 4 Options: ก. ข. ค. ง. */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                    <span>ตัวเลือกทั้ง 4 ข้อ & เลือกว่าข้อใดคือ "เฉลย"</span>
                    <span className="text-[11px] font-normal text-emerald-400 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      คลิกวงกลมด้านซ้ายเพื่อตั้งเป็นเฉลย
                    </span>
                  </label>

                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQ.options.map((option) => {
                      const isCorrect = currentQ.answer === option.key;
                      return (
                        <div
                          key={option.key}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                              : 'bg-slate-950/50 border-slate-800 focus-within:border-slate-700'
                          }`}
                        >
                          {/* Radio for correct answer */}
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="radio"
                              name={`answer-${currentQ.id}`}
                              checked={isCorrect}
                              onChange={() => {
                                sound.playClick();
                                handleUpdateCurrentQuestion('answer', option.key);
                              }}
                              className="sr-only"
                            />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                              isCorrect
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}>
                              {option.key}
                            </div>
                          </label>

                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleUpdateOption(option.key, e.target.value)}
                            placeholder={`ข้อความตัวเลือก ${option.key}...`}
                            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
                          />

                          {isCorrect && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              คำตอบที่ถูกต้อง ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡 คำอธิบายสั้นๆ (เหตุผลประกอบเฉลย เพื่อความรู้เพิ่มเติม)</span>
                  </label>
                  <textarea
                    value={currentQ.explanation}
                    onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                    rows={3}
                    placeholder="เหตุผลประกอบเฉลยที่สนุกสนานและให้เกร็ดความรู้..."
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                เลือกคำถามด้านซ้ายเพื่อเริ่มแก้ไข
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
