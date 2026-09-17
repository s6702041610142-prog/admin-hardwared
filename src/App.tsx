import { useState, useEffect, useRef } from 'react';
import { QuizQuestion, ChoiceKey, RoomState, Player } from './types';
import { DEFAULT_HARDWARE_QUESTIONS } from './data/defaultQuestions';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LobbyView } from './components/LobbyView';
import { QuestionView } from './components/QuestionView';
import { RevealView } from './components/RevealView';
import { LeaderboardView } from './components/LeaderboardView';
import { PodiumView } from './components/PodiumView';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { sound } from './utils/sound';

export default function App() {
  // Local Question Bank (persisted in localStorage)
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_quiz_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HARDWARE_QUESTIONS;
  });

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isSolo, setIsSolo] = useState<boolean>(false);

  // Multiplayer State
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<ChoiceKey | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Solo Mode State
  const [soloStatus, setSoloStatus] = useState<'lobby' | 'question' | 'reveal' | 'leaderboard' | 'finished'>('lobby');
  const [soloQuestionIndex, setSoloQuestionIndex] = useState<number>(0);
  const [soloTimeRemaining, setSoloTimeRemaining] = useState<number>(15);
  const [soloDuration, setSoloDuration] = useState<number>(15);
  const [soloScore, setSoloScore] = useState<number>(0);
  const [soloStreak, setSoloStreak] = useState<number>(0);
  const [soloLastScoreEarned, setSoloLastScoreEarned] = useState<number>(0);
  const soloTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save questions to localStorage whenever updated
  const handleSaveQuestions = (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
    try {
      localStorage.setItem('hardware_quiz_questions', JSON.stringify(newQuestions));
    } catch {
      // ignore
    }
    // If we're host in a multiplayer room, broadcast update
    if (roomState && myPlayerId === roomState.hostId && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'update_questions',
        questions: newQuestions,
      }));
    }
  };

  // Setup WebSocket connection
  const getWebSocket = (): WebSocket => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'room_state': {
            setRoomState(msg.state);
            if (msg.yourId) {
              setMyPlayerId(msg.yourId);
            }
            // Check if player has answered in state
            const myPlayer = msg.state.players[msg.yourId || myPlayerId || ''];
            if (myPlayer?.lastAnswer) {
              setSelectedAnswer(myPlayer.lastAnswer as ChoiceKey);
            }
            break;
          }
          case 'error': {
            alert(msg.message);
            setIsConnecting(false);
            break;
          }
          case 'game_countdown': {
            setCountdownNum(msg.value);
            sound.playTick();
            break;
          }
          case 'question_start': {
            setCountdownNum(null);
            setSelectedAnswer(undefined);
            break;
          }
          case 'tick': {
            setRoomState((prev) => prev ? { ...prev, timeRemaining: msg.timeRemaining } : null);
            break;
          }
          case 'reveal': {
            setCountdownNum(null);
            break;
          }
          case 'game_finished': {
            setCountdownNum(null);
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnecting(false);
    };

    wsRef.current = ws;
    return ws;
  };

  // Host: Create Room
  const handleCreateRoom = (name: string, avatar: string, duration: number) => {
    setIsConnecting(true);
    setIsSolo(false);
    const ws = getWebSocket();
    const sendCreate = () => {
      ws.send(JSON.stringify({
        type: 'create_room',
        name,
        avatar,
        questions,
        questionDuration: duration,
      }));
      setIsConnecting(false);
    };

    if (ws.readyState === WebSocket.OPEN) {
      sendCreate();
    } else {
      ws.onopen = () => sendCreate();
    }
  };

  // Player: Join Room
  const handleJoinRoom = (code: string, name: string, avatar: string) => {
    setIsConnecting(true);
    setIsSolo(false);
    const ws = getWebSocket();
    const sendJoin = () => {
      ws.send(JSON.stringify({
        type: 'join_room',
        code,
        name,
        avatar,
      }));
      setIsConnecting(false);
    };

    if (ws.readyState === WebSocket.OPEN) {
      sendJoin();
    } else {
      ws.onopen = () => sendJoin();
    }
  };

  // Multiplayer: Start Game
  const handleStartGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_game' }));
    }
  };

  // Multiplayer: Submit Answer
  const handleSelectAnswer = (choice: ChoiceKey) => {
    if (selectedAnswer) return;
    setSelectedAnswer(choice);

    if (isSolo) {
      // Solo mode answer processing
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
      const currentQ = questions[soloQuestionIndex];
      const isCorrect = choice === currentQ.answer;

      if (isCorrect) {
        const timeRatio = Math.max(0, soloTimeRemaining / soloDuration);
        const speedBonus = Math.round(500 * timeRatio);
        const streakBonus = Math.min(soloStreak * 50, 250);
        const earned = 500 + speedBonus + streakBonus;

        setSoloScore((s) => s + earned);
        setSoloStreak((st) => st + 1);
        setSoloLastScoreEarned(earned);
      } else {
        setSoloStreak(0);
        setSoloLastScoreEarned(0);
      }

      setSoloStatus('reveal');
    } else {
      // Multiplayer WebSocket send
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'submit_answer',
          answer: choice,
        }));
      }
    }
  };

  // Multiplayer: Host Advances Question
  const handleNextMultiplayer = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'next_question' }));
    }
  };

  // Multiplayer: Restart
  const handleRestartMultiplayer = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'restart_game' }));
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomState(null);
    setMyPlayerId(null);
    setSelectedAnswer(undefined);
    setIsSolo(false);
  };

  // SOLO MODE LOGIC
  const startSoloQuestion = (index: number) => {
    if (soloTimerRef.current) clearInterval(soloTimerRef.current);
    setSoloQuestionIndex(index);
    setSelectedAnswer(undefined);
    setSoloTimeRemaining(soloDuration);
    setSoloStatus('question');

    soloTimerRef.current = setInterval(() => {
      setSoloTimeRemaining((prev) => {
        if (prev <= 1) {
          if (soloTimerRef.current) clearInterval(soloTimerRef.current);
          setSoloStreak(0);
          setSoloLastScoreEarned(0);
          setSoloStatus('reveal');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartSolo = (duration: number) => {
    setIsSolo(true);
    setRoomState(null);
    setSoloDuration(duration);
    setSoloScore(0);
    setSoloStreak(0);
    startSoloQuestion(0);
  };

  const handleNextSolo = () => {
    if (soloStatus === 'reveal') {
      setSoloStatus('leaderboard');
    } else if (soloStatus === 'leaderboard') {
      if (soloQuestionIndex + 1 < questions.length) {
        startSoloQuestion(soloQuestionIndex + 1);
      } else {
        setSoloStatus('finished');
      }
    }
  };

  const handleRestartSolo = () => {
    setSoloScore(0);
    setSoloStreak(0);
    startSoloQuestion(0);
  };

  const handleHome = () => {
    if (soloTimerRef.current) clearInterval(soloTimerRef.current);
    handleLeaveRoom();
    setIsSolo(false);
    setSoloStatus('lobby');
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Compute active player info
  const myPlayer: Player | undefined = roomState && myPlayerId ? roomState.players[myPlayerId] : undefined;
  const isHost = isSolo ? true : !!(myPlayer && myPlayer.isHost);
  const activeQuestions = roomState?.questions || questions;
  const activeQuestionIndex = isSolo ? soloQuestionIndex : (roomState?.currentQuestionIndex || 0);
  const currentQuestion = activeQuestions[activeQuestionIndex];

  // Solo mock player record for Leaderboard & Podium components
  const soloPlayersRecord: Record<string, Player> = {
    solo: {
      id: 'solo',
      name: 'ผู้เล่น (คุณ)',
      avatar: '💻',
      score: soloScore,
      streak: soloStreak,
      isHost: true,
      lastAnswer: selectedAnswer,
      lastAnswerCorrect: selectedAnswer === currentQuestion?.answer,
      lastAnswerScore: soloLastScoreEarned,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      
      {/* Header */}
      <Header
        roomCode={roomState?.code}
        isHost={isHost}
        playerCount={roomState ? Object.keys(roomState.players).length : undefined}
        onHomeClick={roomState || isSolo ? handleHome : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        
        {/* Fullscreen 3..2..1 Countdown Overlay */}
        {countdownNum !== null && countdownNum > 0 && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn">
            <span className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-4">
              เกมกำลังจะเริ่มใน...
            </span>
            <span className="font-mono font-black text-8xl sm:text-9xl text-amber-400 animate-ping">
              {countdownNum}
            </span>
          </div>
        )}

        {/* 1. HOME SCREEN */}
        {!roomState && !isSolo && (
          <HomeView
            questions={questions}
            onStartSolo={handleStartSolo}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenEditor={() => setIsEditorOpen(true)}
            isLoading={isConnecting}
          />
        )}

        {/* 2. MULTIPLAYER LOBBY */}
        {roomState && roomState.status === 'lobby' && (
          <LobbyView
            roomCode={roomState.code}
            players={roomState.players}
            isHost={isHost}
            questions={roomState.questions}
            onStartGame={handleStartGame}
            onOpenEditor={() => setIsEditorOpen(true)}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {/* 3. QUESTION SCREEN (Multiplayer or Solo) */}
        {((roomState && roomState.status === 'question') || (isSolo && soloStatus === 'question')) && currentQuestion && (
          <QuestionView
            question={currentQuestion}
            questionIndex={activeQuestionIndex}
            totalQuestions={activeQuestions.length}
            timeRemaining={isSolo ? soloTimeRemaining : roomState!.timeRemaining}
            totalDuration={isSolo ? soloDuration : roomState!.questionDuration}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
            playerStreak={isSolo ? soloStreak : myPlayer?.streak}
          />
        )}

        {/* 4. REVEAL & EXPLANATION SCREEN (Multiplayer or Solo) */}
        {((roomState && roomState.status === 'reveal') || (isSolo && soloStatus === 'reveal')) && currentQuestion && (
          <RevealView
            question={currentQuestion}
            questionIndex={activeQuestionIndex}
            totalQuestions={activeQuestions.length}
            selectedAnswer={selectedAnswer}
            isHost={isHost}
            scoreEarned={isSolo ? soloLastScoreEarned : myPlayer?.lastAnswerScore}
            streak={isSolo ? soloStreak : myPlayer?.streak}
            onNext={isSolo ? handleNextSolo : handleNextMultiplayer}
            isSolo={isSolo}
          />
        )}

        {/* 5. LEADERBOARD SCREEN (Multiplayer or Solo) */}
        {((roomState && roomState.status === 'leaderboard') || (isSolo && soloStatus === 'leaderboard')) && (
          <LeaderboardView
            players={isSolo ? soloPlayersRecord : roomState!.players}
            currentQuestionIndex={activeQuestionIndex}
            totalQuestions={activeQuestions.length}
            isHost={isHost}
            onNextQuestion={isSolo ? handleNextSolo : handleNextMultiplayer}
            isSolo={isSolo}
          />
        )}

        {/* 6. PODIUM & RESULTS SCREEN (Multiplayer or Solo) */}
        {((roomState && roomState.status === 'finished') || (isSolo && soloStatus === 'finished')) && (
          <PodiumView
            players={isSolo ? soloPlayersRecord : roomState!.players}
            isHost={isHost}
            onRestart={isSolo ? handleRestartSolo : handleRestartMultiplayer}
            onHome={handleHome}
            isSolo={isSolo}
          />
        )}

      </main>

      {/* Question Editor Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        questions={questions}
        onSave={handleSaveQuestions}
      />

    </div>
  );
}
