'use client';

import React, { useEffect, useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';
import { useMounted } from '@/hooks/use-mounted';

interface RestTimerProps {
  initialSeconds?: number;
  restBetweenSetsSeconds?: number;
  restBetweenExercisesSeconds?: number;
  soundEnabled?: boolean;
  onTimerComplete?: () => void;
  triggerStart?: { id: string; seconds: number; label?: string } | null;
  forceOpenTrigger?: number; // timestamp to force open
  onSaveDefaultRestTimes?: (setsSec: number, exercisesSec: number) => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  restBetweenSetsSeconds = 90,
  restBetweenExercisesSeconds = 150,
  soundEnabled = true,
  onTimerComplete,
  triggerStart,
  forceOpenTrigger,
  onSaveDefaultRestTimes,
}) => {
  const mounted = useMounted();
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [timerLabel, setTimerLabel] = useState<string>('Rest Interval');
  const [hasCompletedRecently, setHasCompletedRecently] = useState(false);
  const [prevTriggerId, setPrevTriggerId] = useState<string | null>(null);
  const [prevForceOpen, setPrevForceOpen] = useState<number | undefined>(undefined);
  const [setsRestVal, setSetsRestVal] = useState(restBetweenSetsSeconds);
  const [exercisesRestVal, setExercisesRestVal] = useState(restBetweenExercisesSeconds);
  const [savedBanner, setSavedBanner] = useState(false);

  const [prevSetsRest, setPrevSetsRest] = useState(restBetweenSetsSeconds);
  const [prevExercisesRest, setPrevExercisesRest] = useState(restBetweenExercisesSeconds);

  // Keep local values synced if updated from Settings tab (React recommended pattern)
  if (prevSetsRest !== restBetweenSetsSeconds) {
    setPrevSetsRest(restBetweenSetsSeconds);
    setSetsRestVal(restBetweenSetsSeconds);
  }

  if (prevExercisesRest !== restBetweenExercisesSeconds) {
    setPrevExercisesRest(restBetweenExercisesSeconds);
    setExercisesRestVal(restBetweenExercisesSeconds);
  }

  // Handle auto-trigger from completing a set or exercise
  useEffect(() => {
    if (!triggerStart || triggerStart.id === prevTriggerId || triggerStart.seconds <= 0) return;
    const timer = setTimeout(() => {
      setPrevTriggerId(triggerStart.id);
      setTotalSeconds(triggerStart.seconds);
      setSecondsLeft(triggerStart.seconds);
      setTimerLabel(triggerStart.label || (triggerStart.seconds >= 120 ? 'Exercise Rest' : 'Set Rest'));
      setIsRunning(true);
      setIsMinimized(false);
      setHasCompletedRecently(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [triggerStart, prevTriggerId]);

  // Handle external force open from Navbar or Workout bar
  useEffect(() => {
    if (forceOpenTrigger && forceOpenTrigger !== prevForceOpen) {
      const timer = setTimeout(() => {
        setPrevForceOpen(forceOpenTrigger);
        setIsMinimized(false);
        if (!isRunning && secondsLeft === 0) {
          const target = restBetweenSetsSeconds || 90;
          setTotalSeconds(target);
          setSecondsLeft(target);
          setTimerLabel('Set Rest');
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [forceOpenTrigger, prevForceOpen, secondsLeft, isRunning, restBetweenSetsSeconds]);

  // Keep callbacks in refs so parent re-renders never reset the 1-second interval
  const onTimerCompleteRef = React.useRef(onTimerComplete);
  const soundEnabledRef = React.useRef(soundEnabled);

  useEffect(() => {
    onTimerCompleteRef.current = onTimerComplete;
  }, [onTimerComplete]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Countdown timer interval — depends ONLY on [isRunning] so re-renders never reset the 1s tick!
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompletedRecently(true);
          if (soundEnabledRef.current) {
            soundManager.playTimerDoneChime();
          }
          onTimerCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const selectSetRestDuration = (secs: number) => {
    const valid = Math.max(5, secs);
    setSetsRestVal(valid);
    setTotalSeconds(valid);
    setSecondsLeft(valid);
    setTimerLabel('Set Rest');
    setIsRunning(true);
    setHasCompletedRecently(false);
    onSaveDefaultRestTimes?.(valid, exercisesRestVal);
    soundManager.playClickPop();
  };

  const selectExerciseRestDuration = (secs: number) => {
    const valid = Math.max(5, secs);
    setExercisesRestVal(valid);
    setTotalSeconds(valid);
    setSecondsLeft(valid);
    setTimerLabel('Exercise Rest');
    setIsRunning(true);
    setHasCompletedRecently(false);
    onSaveDefaultRestTimes?.(setsRestVal, valid);
    soundManager.playClickPop();
  };

  const togglePause = () => {
    if (secondsLeft === 0) {
      const nextSecs = totalSeconds || setsRestVal || 90;
      setTotalSeconds(nextSecs);
      setSecondsLeft(nextSecs);
      setIsRunning(true);
      setHasCompletedRecently(false);
      soundManager.playClickPop();
    } else {
      setIsRunning(!isRunning);
      soundManager.playClickPop();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds || setsRestVal || 90);
    setHasCompletedRecently(false);
    soundManager.playClickPop();
  };

  const adjustSeconds = (delta: number) => {
    const next = Math.max(5, (secondsLeft > 0 ? secondsLeft : totalSeconds) + delta);
    setSecondsLeft(next);
    setTotalSeconds(next);
    soundManager.playClickPop();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  if (!mounted) {
    return null;
  }

  // MINIMIZED FLOATING PILL (Only shown when timer is actively running or just completed, so it never covers text when idle)
  if (isMinimized) {
    if (!isRunning && !hasCompletedRecently) {
      return null;
    }

    return (
      <div className="fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-0 right-0 z-40 pointer-events-none">
        <div className="mx-auto flex max-w-[430px] justify-end px-3.5">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className={`pointer-events-auto flex min-h-[46px] items-center gap-2 rounded-full border px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition-all active:scale-95 touch-manipulation cursor-pointer ${
              hasCompletedRecently
                ? 'border-[#d4b26f] bg-[#d4b26f]/25 text-[#eed891] animate-pulse ring-2 ring-[#d4b26f]/30'
                : 'border-[#d4b26f]/50 bg-[#14141a]/95 text-white ring-1 ring-[#d4b26f]/20'
            }`}
            title="Open rest timer console"
          >
            <div className="relative flex items-center justify-center">
              <Timer className="w-4 h-4 text-[#d4b26f]" />
              {isRunning && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4b26f] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4b26f]" />
                </span>
              )}
            </div>
            <span className="font-mono text-xs font-bold tracking-wider">
              {hasCompletedRecently ? 'READY!' : formatTime(secondsLeft)}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>
    );
  }

  // EXPANDED REST CONSOLE - Mobile Bottom Sheet with Backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md p-3 pb-[max(16px,env(safe-area-inset-bottom))] animate-in fade-in touch-manipulation">
      <div className="w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/15 bg-[#121217] shadow-2xl max-h-[88dvh] flex flex-col">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-900 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#d4b26f] to-[#eed891] transition-all duration-300"
            style={{ width: hasCompletedRecently ? '100%' : `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 overflow-y-auto no-scrollbar space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#d4b26f] block">
                  {hasCompletedRecently
                    ? 'Rest Complete · Ready!'
                    : isRunning
                    ? `${timerLabel} · Running`
                    : `${timerLabel} · Paused`}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Target: {totalSeconds}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition"
              title="Minimize timer"
            >
              <span>Hide</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unified Top Rest Intervals Menu */}
          <div className="rounded-2xl border border-[#d4b26f]/30 bg-[#161622] p-3.5 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#d4b26f]">
                Customize Rest Intervals
              </span>
              <span className="text-[11px] text-zinc-400">Tap to load & save</span>
            </div>

            {/* Between Sets */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-200 mb-1.5">
                <span className="font-semibold">Between Sets</span>
                <span className="font-mono font-bold text-[#eed891]">{setsRestVal}s</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[45, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSetRestDuration(s)}
                    className={`flex-1 rounded-xl py-2 font-mono text-xs font-bold transition active:scale-95 cursor-pointer ${
                      setsRestVal === s && timerLabel === 'Set Rest'
                        ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                        : setsRestVal === s
                        ? 'border border-[#d4b26f]/50 bg-[#d4b26f]/20 text-[#eed891] font-black'
                        : 'bg-[#20202d] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  value={setsRestVal}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 60;
                    setSetsRestVal(val);
                    setTotalSeconds(val);
                    setSecondsLeft(val);
                    setTimerLabel('Set Rest');
                  }}
                  className="w-16 rounded-xl border border-white/10 bg-zinc-950 px-1.5 py-2 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>
            </div>

            {/* Between Exercises */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-200 mb-1.5">
                <span className="font-semibold">Between Exercises</span>
                <span className="font-mono font-bold text-[#eed891]">{exercisesRestVal}s</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[90, 120, 150, 180].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectExerciseRestDuration(s)}
                    className={`flex-1 rounded-xl py-2 font-mono text-xs font-bold transition active:scale-95 cursor-pointer ${
                      exercisesRestVal === s && timerLabel === 'Exercise Rest'
                        ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                        : exercisesRestVal === s
                        ? 'border border-[#d4b26f]/50 bg-[#d4b26f]/20 text-[#eed891] font-black'
                        : 'bg-[#20202d] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  value={exercisesRestVal}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 120;
                    setExercisesRestVal(val);
                    setTotalSeconds(val);
                    setSecondsLeft(val);
                    setTimerLabel('Exercise Rest');
                  }}
                  className="w-16 rounded-xl border border-white/10 bg-zinc-950 px-1.5 py-2 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={() => {
                onSaveDefaultRestTimes?.(setsRestVal, exercisesRestVal);
                const targetToLoad =
                  timerLabel === 'Exercise Rest' ? exercisesRestVal : setsRestVal;
                setTotalSeconds(targetToLoad);
                setSecondsLeft(targetToLoad);
                setHasCompletedRecently(false);
                soundManager.playClickPop();
                setSavedBanner(true);
                setTimeout(() => setSavedBanner(false), 1800);
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{savedBanner ? 'Saved & Loaded!' : 'Save New Rest Times'}</span>
            </button>
          </div>

          {/* Large Countdown Stepper Row with Big Comfortable Buttons */}
          <div className="my-1 flex items-center justify-center gap-4 py-1">
            {/* BIG MINUS BUTTON */}
            <button
              type="button"
              onClick={() => adjustSeconds(-15)}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/15 bg-[#1e1e28] text-white hover:bg-zinc-700 active:scale-90 transition shadow-md cursor-pointer"
              title="Decrease 15 seconds"
              aria-label="Decrease 15 seconds"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Time Display */}
            <div className="flex flex-col items-center min-w-[130px]">
              <span className="font-mono text-5xl font-black tracking-tight text-white">
                {formatTime(secondsLeft > 0 ? secondsLeft : totalSeconds)}
              </span>
              <span className="text-xs font-mono text-zinc-400 mt-1">
                target: {totalSeconds}s
              </span>
            </div>

            {/* BIG PLUS BUTTON */}
            <button
              type="button"
              onClick={() => adjustSeconds(15)}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/15 bg-[#1e1e28] text-white hover:bg-zinc-700 active:scale-90 transition shadow-md cursor-pointer"
              title="Increase 15 seconds"
              aria-label="Increase 15 seconds"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Action Row: Start / Pause / Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <button
              type="button"
              onClick={resetTimer}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#181822] px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition"
              title="Reset timer to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={togglePause}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md ${
                isRunning
                  ? 'border border-[#d4b26f]/40 bg-[#d4b26f]/15 text-[#eed891] hover:bg-[#d4b26f]/25'
                  : 'bg-[#d4b26f] text-black hover:bg-[#e2c487]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 stroke-[3]" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black stroke-none" />
                  <span>{secondsLeft > 0 ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
