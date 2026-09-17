import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

// Initialize Gemini safely
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize Gemini client:', e);
    }
  }
  return genAIClient;
}

// Interfaces for Room Management
interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  lastAnswer?: string;
  lastAnswerCorrect?: boolean;
  lastAnswerScore?: number;
  hasAnswered?: boolean;
  isHost: boolean;
}

interface Question {
  id: string;
  question: string;
  options: { key: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty: string;
  category?: string;
}

interface Room {
  code: string;
  hostId: string;
  status: 'lobby' | 'countdown' | 'question' | 'reveal' | 'leaderboard' | 'finished';
  currentQuestionIndex: number;
  questions: Question[];
  players: Map<string, { player: Player; ws: WebSocket }>;
  timeRemaining: number;
  questionDuration: number;
  timerInterval?: NodeJS.Timeout;
  questionStartTime?: number;
}

const rooms = new Map<string, Room>();

// Helper to generate room code
function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// Broadcast room state to all players in the room
function broadcastRoomState(room: Room) {
  const playersRecord: Record<string, Player> = {};
  room.players.forEach(({ player }, id) => {
    playersRecord[id] = { ...player };
  });

  const statePayload = {
    code: room.code,
    status: room.status,
    currentQuestionIndex: room.currentQuestionIndex,
    questions: room.questions,
    players: playersRecord,
    timeRemaining: room.timeRemaining,
    questionDuration: room.questionDuration,
    hostId: room.hostId,
  };

  room.players.forEach(({ ws }, playerId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'room_state',
        state: statePayload,
        yourId: playerId
      }));
    }
  });
}

function broadcastEvent(room: Room, event: object) {
  const data = JSON.stringify(event);
  room.players.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

function clearRoomTimer(room: Room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }
}

function revealQuestionResult(room: Room) {
  clearRoomTimer(room);
  room.status = 'reveal';

  const currentQ = room.questions[room.currentQuestionIndex];
  if (!currentQ) return;

  // Calculate scores for players who answered
  const scores: Record<string, number> = {};
  room.players.forEach(({ player }) => {
    scores[player.id] = player.score;
  });

  broadcastEvent(room, {
    type: 'reveal',
    question: currentQ,
    scores
  });
  broadcastRoomState(room);
}

function startQuestion(room: Room, index: number) {
  clearRoomTimer(room);
  room.currentQuestionIndex = index;
  room.status = 'question';
  room.timeRemaining = room.questionDuration;
  room.questionStartTime = Date.now();

  // Reset answer states
  room.players.forEach(({ player }) => {
    player.hasAnswered = false;
    player.lastAnswer = undefined;
    player.lastAnswerCorrect = undefined;
    player.lastAnswerScore = 0;
  });

  broadcastEvent(room, {
    type: 'question_start',
    index,
    question: room.questions[index],
    duration: room.questionDuration
  });
  broadcastRoomState(room);

  // Start tick timer
  room.timerInterval = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      clearRoomTimer(room);
      revealQuestionResult(room);
    } else {
      broadcastEvent(room, {
        type: 'tick',
        timeRemaining: room.timeRemaining
      });
    }
  }, 1000);
}

function startCountdown(room: Room) {
  clearRoomTimer(room);
  room.status = 'countdown';
  let countdown = 3;

  broadcastEvent(room, {
    type: 'game_countdown',
    value: countdown
  });
  broadcastRoomState(room);

  room.timerInterval = setInterval(() => {
    countdown -= 1;
    if (countdown <= 0) {
      clearRoomTimer(room);
      startQuestion(room, 0);
    } else {
      broadcastEvent(room, {
        type: 'game_countdown',
        value: countdown
      });
    }
  }, 1000);
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// Endpoint to generate extra computer quiz questions with Gemini
app.post('/api/generate-question', async (req, res) => {
  try {
    const { topic, difficulty = 'ปานกลาง' } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback if no Gemini key
      const fallbackQuestions = [
        {
          id: `gen-${Date.now()}`,
          question: `พอร์ตเชื่อมต่อความเร็วสูงที่มักใช้สัญลักษณ์รูปสายฟ้า สำหรับส่งทั้งข้อมูลภาพและไฟเลี้ยงอุปกรณ์คือพอร์ตใด?`,
          options: [
            { key: 'ก', text: 'Thunderbolt / USB-C' },
            { key: 'ข', text: 'VGA Port' },
            { key: 'ค', text: 'Serial COM Port' },
            { key: 'ง', text: 'PS/2 Port' }
          ],
          answer: 'ก',
          explanation: 'Thunderbolt รวมมาตรฐาน PCIe และ DisplayPort เข้าด้วยกัน ส่งข้อมูลไวระดับ 40Gbps และชาร์จไฟได้ในเส้นเดียว!',
          difficulty: 'ปานกลาง',
          category: 'อุปกรณ์คอมพิวเตอร์'
        }
      ];
      return res.json({ question: fallbackQuestions[0] });
    }

    const prompt = `คุณคือผู้เชี่ยวชาญด้านอุปกรณ์คอมพิวเตอร์ (Computer Hardware)
สร้างคำถามสำหรับเกม Quiz ภาษาไทย 1 ข้อ เกี่ยวกับ "${topic || 'อุปกรณ์คอมพิวเตอร์'}"
ระดับความยาก: ${difficulty} (เหมาะสำหรับบุคคลทั่วไป ภาษาตื่นเต้น สนุกสนาน)
โครงสร้างผลลัพธ์ต้องเป็น JSON รูปแบบนี้เท่านั้น:
{
  "question": "คำถามสั้นกระชับเข้าใจง่าย",
  "options": [
    { "key": "ก", "text": "ตัวเลือกที่ 1" },
    { "key": "ข", "text": "ตัวเลือกที่ 2" },
    { "key": "ค", "text": "ตัวเลือกที่ 3" },
    { "key": "ง", "text": "ตัวเลือกที่ 4" }
  ],
  "answer": "ก",
  "explanation": "คำอธิบายสั้นๆ เหตุผลประกอบเฉลย เพื่อความรู้เพิ่มเติม",
  "difficulty": "${difficulty}",
  "category": "อุปกรณ์คอมพิวเตอร์"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    parsed.id = `gen-${Date.now()}`;
    return res.json({ question: parsed });
  } catch (error) {
    console.error('Gemini generation error:', error);
    return res.status(500).json({ error: 'Failed to generate question' });
  }
});

async function start() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'create_room': {
            const code = generateRoomCode();
            const playerId = `host_${Date.now()}`;
            const hostPlayer: Player = {
              id: playerId,
              name: data.name?.trim() || 'Host',
              avatar: data.avatar || '👑',
              score: 0,
              streak: 0,
              isHost: true,
            };

            const room: Room = {
              code,
              hostId: playerId,
              status: 'lobby',
              currentQuestionIndex: 0,
              questions: data.questions || [],
              players: new Map([[playerId, { player: hostPlayer, ws }]]),
              timeRemaining: data.questionDuration || 15,
              questionDuration: data.questionDuration || 15,
            };

            rooms.set(code, room);
            currentRoomCode = code;
            currentPlayerId = playerId;

            broadcastRoomState(room);
            break;
          }

          case 'join_room': {
            const code = data.code?.trim().toUpperCase();
            const room = rooms.get(code);

            if (!room) {
              ws.send(JSON.stringify({ type: 'error', message: 'ไม่พบห้องที่ระบุ กรุณาตรวจสอบรหัสห้องอีกครั้ง' }));
              return;
            }

            if (room.status !== 'lobby') {
              ws.send(JSON.stringify({ type: 'error', message: 'ห้องนี้กำลังเล่นเกมอยู่ ไม่สามารถเข้าร่วมได้ในขณะนี้' }));
              return;
            }

            const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const player: Player = {
              id: playerId,
              name: data.name?.trim() || `ผู้เล่น ${room.players.size + 1}`,
              avatar: data.avatar || '🎮',
              score: 0,
              streak: 0,
              isHost: false,
            };

            room.players.set(playerId, { player, ws });
            currentRoomCode = code;
            currentPlayerId = playerId;

            broadcastRoomState(room);
            broadcastEvent(room, { type: 'player_joined', player });
            break;
          }

          case 'start_game': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== currentPlayerId) return;
            if (room.questions.length === 0) {
              ws.send(JSON.stringify({ type: 'error', message: 'ไม่มีคำถามในห้อง กรุณาเพิ่มคำถามก่อนเริ่มเกม' }));
              return;
            }

            // Reset all players scores & streaks
            room.players.forEach(({ player }) => {
              player.score = 0;
              player.streak = 0;
              player.hasAnswered = false;
              player.lastAnswer = undefined;
              player.lastAnswerCorrect = undefined;
              player.lastAnswerScore = 0;
            });

            startCountdown(room);
            break;
          }

          case 'submit_answer': {
            if (!currentRoomCode || !currentPlayerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'question') return;

            const playerData = room.players.get(currentPlayerId);
            if (!playerData || playerData.player.hasAnswered) return;

            const player = playerData.player;
            const currentQ = room.questions[room.currentQuestionIndex];
            const isCorrect = data.answer === currentQ.answer;

            player.hasAnswered = true;
            player.lastAnswer = data.answer;
            player.lastAnswerCorrect = isCorrect;

            if (isCorrect) {
              // Points based on remaining time (max 1000)
              const timeRatio = Math.max(0, room.timeRemaining / room.questionDuration);
              const speedBonus = Math.round(500 * timeRatio);
              const streakBonus = Math.min(player.streak * 50, 250);
              const questionPoints = 500 + speedBonus + streakBonus;

              player.score += questionPoints;
              player.streak += 1;
              player.lastAnswerScore = questionPoints;
            } else {
              player.streak = 0;
              player.lastAnswerScore = 0;
            }

            broadcastRoomState(room);

            // Check if all players have answered
            let allAnswered = true;
            room.players.forEach(({ player: p }) => {
              if (!p.hasAnswered) allAnswered = false;
            });

            if (allAnswered) {
              clearRoomTimer(room);
              revealQuestionResult(room);
            }
            break;
          }

          case 'next_question': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== currentPlayerId) return;

            if (room.status === 'reveal') {
              // Show leaderboard
              room.status = 'leaderboard';
              broadcastRoomState(room);
            } else if (room.status === 'leaderboard') {
              // Next question or finish
              if (room.currentQuestionIndex + 1 < room.questions.length) {
                startQuestion(room, room.currentQuestionIndex + 1);
              } else {
                // Game Finished!
                room.status = 'finished';
                clearRoomTimer(room);

                const rankedPlayers = Array.from(room.players.values())
                  .map(p => p.player)
                  .sort((a, b) => b.score - a.score);

                broadcastEvent(room, {
                  type: 'game_finished',
                  finalRanking: rankedPlayers
                });
                broadcastRoomState(room);
              }
            }
            break;
          }

          case 'update_questions': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== currentPlayerId) return;

            if (Array.isArray(data.questions) && data.questions.length > 0) {
              room.questions = data.questions;
              broadcastRoomState(room);
            }
            break;
          }

          case 'restart_game': {
            if (!currentRoomCode) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== currentPlayerId) return;

            clearRoomTimer(room);
            room.status = 'lobby';
            room.currentQuestionIndex = 0;
            room.players.forEach(({ player }) => {
              player.score = 0;
              player.streak = 0;
              player.hasAnswered = false;
              player.lastAnswer = undefined;
              player.lastAnswerCorrect = undefined;
              player.lastAnswerScore = 0;
            });

            broadcastRoomState(room);
            break;
          }

          case 'leave_room': {
            if (currentRoomCode && currentPlayerId) {
              const room = rooms.get(currentRoomCode);
              if (room) {
                room.players.delete(currentPlayerId);
                if (room.players.size === 0) {
                  clearRoomTimer(room);
                  rooms.delete(currentRoomCode);
                } else {
                  // If host left, assign new host
                  if (room.hostId === currentPlayerId) {
                    const nextHost = room.players.keys().next().value;
                    if (nextHost) {
                      room.hostId = nextHost;
                      const nextPlayer = room.players.get(nextHost);
                      if (nextPlayer) nextPlayer.player.isHost = true;
                    }
                  }
                  broadcastRoomState(room);
                  broadcastEvent(room, { type: 'player_left', playerId: currentPlayerId });
                }
              }
            }
            currentRoomCode = null;
            currentPlayerId = null;
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomCode && currentPlayerId) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          room.players.delete(currentPlayerId);
          if (room.players.size === 0) {
            clearRoomTimer(room);
            rooms.delete(currentRoomCode);
          } else {
            if (room.hostId === currentPlayerId) {
              const nextHost = room.players.keys().next().value;
              if (nextHost) {
                room.hostId = nextHost;
                const nextPlayer = room.players.get(nextHost);
                if (nextPlayer) nextPlayer.player.isHost = true;
              }
            }
            broadcastRoomState(room);
            broadcastEvent(room, { type: 'player_left', playerId: currentPlayerId });
          }
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
