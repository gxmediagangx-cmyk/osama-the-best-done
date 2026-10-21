'use client';

import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Bell,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Check,
  Timer,
  Flame,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';
import { useMounted } from '@/hooks/use-mounted';

export interface ActiveBoxingTimerConfig {
  id: string;
  drillId?: string;
  drillName: string;
  comboOrCues?: string;
  totalRounds: number;
  startRound: number;
  roundSeconds: number;
  restSeconds: number;
  initialPhase?: 'work' | 'rest';
}

export interface LiveBoxingTimerState {
  isRunning: boolean;
  drillId?: string;
  drillName: string;
  currentRound: number;
  totalRounds: number;
  phase: 'work' | 'rest' | 'done';
  secondsLeft: number;
  roundDuration: number;
  restDuration: number;
}

interface BoxingRoundTimerProps {
  soundEnabled: boolean;
  activeConfig?: ActiveBoxingTimerConfig | null;
  forceOpenTrigger?: number;
  defaultRoundSeconds?: number;
  defaultRestSeconds?: number;
  onRoundComplete?: (drillId: string | undefined, roundNumber: number) => void;
  onSaveDefaults?: (roundSec: number, restSec: number) => void;
  onStateChange?: (state: LiveBoxingTimerState) => void;
  externalCommand?: {
    id: string;
    action: 'togglePlay' | 'skipPhase' | 'adjustSeconds' | 'stop' | 'reset' | 'updateDurations';
    delta?: number;
    roundSeconds?: number;
    restSeconds?: number;
    changedField?: 'roundDurationSeconds' | 'restSeconds';
  } | null;
}

const ROUND_PRESETS = [
  { label: '1:30', seconds: 90 },
  { label: '2:00', seconds: 120 },
  { label: '3:00', seconds: 180 },
  { label: '4:00', seconds: 240 },
  { label: '5:00', seconds: 300 },
];

const REST_PRESETS = [30, 45, 60, 90, 120];

export const BoxingRoundTimer: React.FC<BoxingRoundTimerProps> = ({
  soundEnabled,
  activeConfig,
  forceOpenTrigger,
  defaultRoundSeconds = 180,
  defaultRestSeconds = 60,
  onRoundComplete,
  onSaveDefaults,
  onStateChange,
  externalCommand,
}) => {
  const mounted = useMounted();
  const [roundDuration, setRoundDuration] = useState(defaultRoundSeconds);
  const [restDuration, setRestDuration] = useState(defaultRestSeconds);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeDrillId, setActiveDrillId] = useState<string | undefined>(undefined);
  const [activeLabel, setActiveLabel] = useState<string>('Boxing Round Timer');
  const [activeCombo, setActiveCombo] = useState<string | undefined>(undefined);
  const [prevConfigId, setPrevConfigId] = useState<string | null>(null);
  const [prevForceOpen, setPrevForceOpen] = useState<number | undefined>(undefined);
  const [prevCmdId, setPrevCmdId] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  // Keep latest values & callbacks in refs so the 1-second countdown interval is NEVER reset by parent re-renders
  const onRoundCompleteRef = React.useRef(onRoundComplete);
  const onStateChangeRef = React.useRef(onStateChange);
  const stateRef = React.useRef({
    phase,
    currentRound,
    totalRounds,
    roundDuration,
    restDuration,
    soundEnabled,
    activeDrillId,
  });

  useEffect(() => {
    onRoundCompleteRef.current = onRoundComplete;
  }, [onRoundComplete]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    stateRef.current = {
      phase,
      currentRound,
      totalRounds,
      roundDuration,
      restDuration,
      soundEnabled,
      activeDrillId,
    };
  }, [
    phase,
    currentRound,
    totalRounds,
    roundDuration,
    restDuration,
    soundEnabled,
    activeDrillId,
  ]);

  const [prevDefaultRoundSeconds, setPrevDefaultRoundSeconds] = useState(defaultRoundSeconds);
  const [prevDefaultRestSeconds, setPrevDefaultRestSeconds] = useState(defaultRestSeconds);

  // Sync defaults when workout changes (React recommended pattern)
  if (prevDefaultRoundSeconds !== defaultRoundSeconds) {
    setPrevDefaultRoundSeconds(defaultRoundSeconds);
    setRoundDuration(defaultRoundSeconds);
  }

  if (prevDefaultRestSeconds !== defaultRestSeconds) {
    setPrevDefaultRestSeconds(defaultRestSeconds);
    setRestDuration(defaultRestSeconds);
  }

  // Broadcast live timer state so the active BoxingDrillCard can render an inline live timer right on the card!
  useEffect(() => {
    onStateChangeRef.current?.({
      isRunning,
      drillId: activeDrillId,
      drillName: activeLabel,
      currentRound,
      totalRounds,
      phase,
      secondsLeft,
      roundDuration,
      restDuration,
    });
  }, [
    isRunning,
    activeDrillId,
    activeLabel,
    currentRound,
    totalRounds,
    phase,
    secondsLeft,
    roundDuration,
    restDuration,
  ]);

  // Sync when user starts a round or rest timer from a specific drill card
  useEffect(() => {
    if (!activeConfig || activeConfig.id === prevConfigId) return;
    const t = setTimeout(() => {
      const startPhase = activeConfig.initialPhase || 'work';
      const initialSecs =
        startPhase === 'rest' ? activeConfig.restSeconds : activeConfig.roundSeconds;

      setPrevConfigId(activeConfig.id);
      setActiveDrillId(activeConfig.drillId);
      setActiveLabel(activeConfig.drillName);
      setActiveCombo(activeConfig.comboOrCues);
      setTotalRounds(activeConfig.totalRounds);
      setCurrentRound(activeConfig.startRound);
      setRoundDuration(activeConfig.roundSeconds);
      setRestDuration(activeConfig.restSeconds);
      setPhase(startPhase);
      setSecondsLeft(initialSecs);
      setIsRunning(true);
      // Keep minimized if launched from a drill card (since the drill card shows the inline live clock + bottom bar shows HUD)
      setIsMinimized(true);

      if (soundEnabled) {
        if (startPhase === 'work') {
          soundManager.playBoxingBell();
        } else {
          soundManager.playClickPop();
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [activeConfig, prevConfigId, soundEnabled]);

  // Handle force open from the top sticky "Timer" button
  useEffect(() => {
    if (forceOpenTrigger && forceOpenTrigger !== prevForceOpen) {
      const t = setTimeout(() => {
        setPrevForceOpen(forceOpenTrigger);
        setIsMinimized(false);
        if (!isRunning && secondsLeft === 0) {
          setPhase('work');
          setSecondsLeft(roundDuration || 180);
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [forceOpenTrigger, prevForceOpen, isRunning, secondsLeft, roundDuration]);

  // Handle external commands from the inline drill card timer controls
  useEffect(() => {
    if (!externalCommand || externalCommand.id === prevCmdId) return;
    const t = setTimeout(() => {
      setPrevCmdId(externalCommand.id);
      const st = stateRef.current;
      if (externalCommand.action === 'togglePlay') {
        setIsRunning((r) => !r);
        soundManager.playClickPop();
      } else if (externalCommand.action === 'adjustSeconds') {
        const delta = externalCommand.delta || 0;
        setSecondsLeft((s) => Math.max(5, s + delta));
        soundManager.playClickPop();
      } else if (externalCommand.action === 'stop') {
        setIsRunning(false);
        setSecondsLeft(0);
        setActiveDrillId(undefined);
        soundManager.playClickPop();
      } else if (externalCommand.action === 'reset') {
        setIsRunning(false);
        setPhase('work');
        setSecondsLeft(st.roundDuration);
        soundManager.playClickPop();
      } else if (externalCommand.action === 'updateDurations') {
        const nextRound = externalCommand.roundSeconds ?? st.roundDuration;
        const nextRest = externalCommand.restSeconds ?? st.restDuration;
        setRoundDuration(nextRound);
        setRestDuration(nextRest);
        stateRef.current = {
          ...st,
          roundDuration: nextRound,
          restDuration: nextRest,
        };
        if (externalCommand.changedField === 'restSeconds' && st.phase === 'rest') {
          setSecondsLeft(nextRest);
        } else if (
          externalCommand.changedField === 'roundDurationSeconds' &&
          st.phase === 'work'
        ) {
          setSecondsLeft(nextRound);
        }
      } else if (externalCommand.action === 'skipPhase') {
        soundManager.playClickPop();
        if (st.phase === 'work') {
          onRoundCompleteRef.current?.(st.activeDrillId, st.currentRound);
          if (st.currentRound < st.totalRounds) {
            setPhase('rest');
            setSecondsLeft(st.restDuration);
          } else {
            setPhase('done');
            setSecondsLeft(0);
            setIsRunning(false);
          }
        } else if (st.phase === 'rest') {
          setCurrentRound((r) => Math.min(st.totalRounds, r + 1));
          setPhase('work');
          setSecondsLeft(st.roundDuration);
          if (st.soundEnabled) {
            soundManager.playBoxingBell();
          }
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [externalCommand, prevCmdId]);

  // Countdown tick engine — depends ONLY on [isRunning] so parent re-renders NEVER reset the 1-second interval!
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const st = stateRef.current;

        // 10-second clapper warning during work round
        if (st.phase === 'work' && prev === 11 && st.soundEnabled) {
          soundManager.playTenSecondClapper();
        }

        if (prev <= 1) {
          if (st.phase === 'work') {
            // Work round finished!
            if (st.soundEnabled) {
              soundManager.playBoxingBell();
            }
            onRoundCompleteRef.current?.(st.activeDrillId, st.currentRound);

            if (st.currentRound < st.totalRounds) {
              setPhase('rest');
              return st.restDuration;
            } else {
              setPhase('done');
              setIsRunning(false);
              return 0;
            }
          } else if (st.phase === 'rest') {
            // Rest finished -> Start next work round!
            if (st.soundEnabled) {
              soundManager.playBoxingBell();
            }
            setCurrentRound((r) => r + 1);
            setPhase('work');
            return st.roundDuration;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectRoundDuration = (secs: number) => {
    const valid = Math.max(15, secs);
    setRoundDuration(valid);
    setPhase('work');
    setSecondsLeft(valid);
    setIsRunning(true);
    onSaveDefaults?.(valid, restDuration);
    soundManager.playClickPop();
  };

  const selectRestDuration = (secs: number) => {
    const valid = Math.max(10, secs);
    setRestDuration(valid);
    setPhase('rest');
    setSecondsLeft(valid);
    setIsRunning(true);
    onSaveDefaults?.(roundDuration, valid);
    soundManager.playClickPop();
  };

  const handleTogglePlay = () => {
    if (phase === 'done' || secondsLeft === 0) {
      setCurrentRound(1);
      setPhase('work');
      setSecondsLeft(roundDuration);
      setIsRunning(true);
      if (soundEnabled) soundManager.playBoxingBell();
      return;
    }

    if (!isRunning && secondsLeft === roundDuration && phase === 'work') {
      if (soundEnabled) soundManager.playBoxingBell();
    } else {
      soundManager.playClickPop();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setCurrentRound(1);
    setSecondsLeft(roundDuration);
    soundManager.playClickPop();
  };

  const handleSkipPhase = () => {
    soundManager.playClickPop();
    if (phase === 'work') {
      onRoundComplete?.(activeDrillId, currentRound);
      if (currentRound < totalRounds) {
        setPhase('rest');
        setSecondsLeft(restDuration);
      } else {
        setPhase('done');
        setSecondsLeft(0);
        setIsRunning(false);
      }
    } else if (phase === 'rest') {
      setCurrentRound((r) => Math.min(totalRounds, r + 1));
      setPhase('work');
      setSecondsLeft(roundDuration);
      if (isRunning && soundEnabled) {
        soundManager.playBoxingBell();
      }
    }
  };

  const handleSaveSettingsButton = () => {
    onSaveDefaults?.(roundDuration, restDuration);
    if (phase === 'rest') {
      setSecondsLeft(restDuration);
    } else {
      setPhase('work');
      setSecondsLeft(roundDuration);
    }
    setSavedBanner(true);
    soundManager.playClickPop();
    setTimeout(() => setSavedBanner(false), 1800);
  };

  if (!mounted) return null;

  // Hide completely when idle & minimized so it never covers text or clutters the screen
  if (isMinimized && !isRunning && secondsLeft === 0) {
    return null;
  }

  const isFinalTenSeconds = phase === 'work' && secondsLeft <= 10 && secondsLeft > 0;
  const currentTarget = phase === 'work' ? roundDuration : restDuration;
  const progressPercent =
    currentTarget > 0 ? Math.min(100, ((currentTarget - secondsLeft) / currentTarget) * 100) : 0;

  return (
    <div className="fixed bottom-[82px] left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-3.5 sm:px-6 pointer-events-none">
      {isMinimized ? (
        /* Sleek Docked Fight Clock Bar (Only shown when active/paused so you can see the clock from anywhere on screen) */
        <div
          className={`pointer-events-auto flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all ${
            isFinalTenSeconds
              ? 'border-amber-400 bg-[#1a1310]/95 text-amber-200'
              : phase === 'rest'
              ? 'border-emerald-500/60 bg-[#101815]/95 text-emerald-200'
              : 'border-[#d4b26f]/60 bg-[#14141d]/95 text-white'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isFinalTenSeconds
                  ? 'bg-amber-500 text-black animate-pulse'
                  : phase === 'rest'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#d4b26f] text-black'
              }`}
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    phase === 'rest'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-[#d4b26f]/20 text-[#eed891]'
                  }`}
                >
                  {phase === 'rest' ? `REST` : `R${currentRound}/${totalRounds}`}
                </span>
                <span className="truncate text-xs font-bold text-zinc-200">{activeLabel}</span>
              </div>
              <div className="font-mono text-lg font-black tracking-tight leading-tight">
                {formatTime(secondsLeft)}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`flex h-9 px-3 items-center justify-center gap-1 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                isRunning
                  ? 'border border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                  : 'bg-[#d4b26f] text-black'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              type="button"
              onClick={handleSkipPhase}
              className="flex h-9 px-2.5 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-xs font-bold text-zinc-200 hover:text-white cursor-pointer"
              title="Skip to next phase"
            >
              <SkipForward className="w-3.5 h-3.5 text-[#d4b26f]" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="flex h-9 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-zinc-300 hover:text-white cursor-pointer"
              title="Expand timer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Floating Fight Timer HUD (Matches the unified Gym RestTimer style) */
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/15 bg-[#121218]/98 shadow-[0_24px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-white">
          {/* Top Progress Bar */}
          <div className="h-1.5 w-full bg-zinc-900 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFinalTenSeconds
                  ? 'bg-amber-400'
                  : phase === 'rest'
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-[#d4b26f] to-[#eed891]'
              }`}
              style={{ width: phase === 'done' ? '100%' : `${progressPercent}%` }}
            />
          </div>

          <div className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    phase === 'rest'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-[#d4b26f]/15 text-[#d4b26f]'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-black uppercase tracking-wider text-xs block ${
                      phase === 'rest' ? 'text-emerald-400' : 'text-[#d4b26f]'
                    }`}
                  >
                    {phase === 'done'
                      ? 'ALL ROUNDS COMPLETE'
                      : isFinalTenSeconds
                      ? 'FINAL 10 SECONDS · PUNCH OUT!'
                      : phase === 'rest'
                      ? `CORNER REST · NEXT: ROUND ${currentRound + 1}`
                      : `ROUND ${currentRound} OF ${totalRounds} · WORK`}
                  </span>
                  <span className="text-zinc-300 text-xs font-semibold truncate block">
                    {activeLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1a1a24] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition shrink-0 cursor-pointer"
              >
                <span>Hide</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Active Combo Banner if present */}
            {activeCombo && (
              <div className="rounded-xl border border-[#d4b26f]/25 bg-black/40 px-3 py-2 text-xs text-[#eed891]">
                <span className="font-black uppercase text-[11px] tracking-wider text-[#d4b26f] mr-1.5">
                  <Flame className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                  COMBO:
                </span>
                <span className="font-mono text-zinc-100">{activeCombo}</span>
              </div>
            )}

            {/* Main Countdown Display + Controls (Stacked cleanly so buttons never collide) */}
            <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setSecondsLeft((s) => Math.max(5, s - 15))}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#17171f] text-zinc-200 hover:text-white active:scale-90 transition cursor-pointer"
                  title="-15 seconds"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="min-w-[115px] text-center">
                  <div
                    className={`font-mono text-3xl sm:text-4xl font-black tracking-tight ${
                      isFinalTenSeconds
                        ? 'text-amber-300 animate-pulse'
                        : phase === 'rest'
                        ? 'text-emerald-300'
                        : 'text-white'
                    }`}
                  >
                    {formatTime(secondsLeft)}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {phase === 'rest' ? 'Corner Rest' : `Round ${currentRound}/${totalRounds}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSecondsLeft((s) => s + 15)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#17171f] text-zinc-200 hover:text-white active:scale-90 transition cursor-pointer"
                  title="+15 seconds"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#17171f] text-xs font-bold text-zinc-300 hover:text-white active:scale-95 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipPhase}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#17171f] text-xs font-bold text-[#eed891] hover:text-white active:scale-95 transition cursor-pointer"
                  title={phase === 'work' ? 'Switch to Corner Rest' : 'Start Next Round'}
                >
                  <SkipForward className="w-3.5 h-3.5 text-[#d4b26f]" />
                  <span>{phase === 'work' ? 'Rest' : 'Next'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer ${
                    isRunning
                      ? 'bg-[#1f1f2a] text-[#eed891] border border-[#d4b26f]/40'
                      : 'bg-[#d4b26f] text-black hover:bg-[#e2c487]'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instant Phase Switcher: Work Round vs Corner Rest */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhase('work');
                  setSecondsLeft(roundDuration);
                  soundManager.playClickPop();
                }}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  phase === 'work'
                    ? 'border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                    : 'border-white/10 bg-[#16161f] text-zinc-400 hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Round Clock ({formatTime(roundDuration)})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhase('rest');
                  setSecondsLeft(restDuration);
                  soundManager.playClickPop();
                }}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  phase === 'rest'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-[#16161f] text-zinc-400 hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Corner Rest ({restDuration}s)</span>
              </button>
            </div>

            {/* Unified Customize Boxing Intervals Menu (Same clean design as Gym RestTimer) */}
            <div className="rounded-xl border border-[#d4b26f]/30 bg-[#16161f] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-[#d4b26f]">
                  Customize Boxing Timer
                </div>
                {savedBanner && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    Updated!
                  </span>
                )}
              </div>

              {/* Round Duration Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">Round Duration</span>
                  <span className="font-mono font-bold text-[#eed891]">
                    {formatTime(roundDuration)}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {ROUND_PRESETS.map((preset) => (
                    <button
                      key={`round-${preset.seconds}`}
                      type="button"
                      onClick={() => selectRoundDuration(preset.seconds)}
                      className={`rounded-lg py-2 font-mono text-xs font-bold transition cursor-pointer ${
                        roundDuration === preset.seconds && phase === 'work'
                          ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                          : roundDuration === preset.seconds
                          ? 'border border-[#d4b26f]/60 bg-[#d4b26f]/15 text-[#eed891]'
                          : 'border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Rest Duration Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">Corner Rest (Between Rounds)</span>
                  <span className="font-mono font-bold text-emerald-300">{restDuration}s</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {REST_PRESETS.map((sec) => (
                    <button
                      key={`rest-${sec}`}
                      type="button"
                      onClick={() => selectRestDuration(sec)}
                      className={`rounded-lg py-2 font-mono text-xs font-bold transition cursor-pointer ${
                        restDuration === sec && phase === 'rest'
                          ? 'bg-emerald-400 text-black font-black shadow-sm'
                          : restDuration === sec
                          ? 'border border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                          : 'border border-white/10 bg-zinc-900 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettingsButton}
                className="w-full rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e2c487] active:scale-[0.99] transition shadow-md cursor-pointer"
              >
                Save Boxing Timer Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
