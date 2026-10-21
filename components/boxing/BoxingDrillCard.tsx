'use client';

import React, { useState } from 'react';
import {
  Check,
  Bell,
  Plus,
  Minus,
  MoreHorizontal,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Users,
  User,
  ArrowLeftRight,
  Flame,
  Play,
  Pause,
  SkipForward,
  X,
  Timer,
  Hash,
  Dumbbell,
  Scale,
  Clock,
  FileText,
  Pencil,
} from 'lucide-react';
import {
  BoxingDrill,
  BoxingRound,
  BoxingTrackingMode,
  WeightUnit,
} from '@/lib/types';
import { LiveBoxingTimerState } from './BoxingRoundTimer';
import { soundManager } from '@/lib/sound';

interface BoxingDrillCardProps {
  drill: BoxingDrill;
  drillIndex: number;
  totalDrills?: number;
  weightUnit?: WeightUnit;
  liveTimerState?: LiveBoxingTimerState | null;
  onUpdateDrill: (updated: BoxingDrill) => void;
  onDeleteDrill: (drillId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onStartDrillTimer: (
    drill: BoxingDrill,
    startRound: number,
    initialPhase?: 'work' | 'rest'
  ) => void;
  onTimerCommand?: (
    action: 'togglePlay' | 'skipPhase' | 'adjustSeconds' | 'stop' | 'reset' | 'updateDurations',
    delta?: number,
    extra?: {
      roundSeconds?: number;
      restSeconds?: number;
      changedField?: 'roundDurationSeconds' | 'restSeconds';
    }
  ) => void;
}

const CATEGORY_LABELS: Record<BoxingDrill['category'], string> = {
  warmup: 'Warmup / Jump Rope',
  shadowboxing: 'Shadowboxing',
  bagwork: 'Heavy / Speed Bag',
  padwork: 'Pad / Mitt Work',
  'partner-drill': 'Partner Counter Drill',
  sparring: 'Technical Sparring',
  footwork: 'Footwork & Angles',
  conditioning: 'Conditioning / Abs',
};

const TRACKING_MODE_TABS: {
  id: BoxingTrackingMode;
  label: string;
  shortLabel: string;
  tooltip: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'time',
    label: 'Time Only',
    shortLabel: 'Time',
    tooltip: 'Timed boxing rounds with work & rest timers',
    icon: Timer,
  },
  {
    id: 'reps',
    label: 'Reps Only',
    shortLabel: 'Reps',
    tooltip: 'Target repetitions per set (ideal for abs & bodyweight, no round timer)',
    icon: Hash,
  },
  {
    id: 'weight_reps',
    label: 'Weight & Reps',
    shortLabel: 'Wt + Reps',
    tooltip: 'Target weight load & repetitions (e.g. 10kg × 20 reps)',
    icon: Dumbbell,
  },
  {
    id: 'weight',
    label: 'Weight Only',
    shortLabel: 'Weight',
    tooltip: 'Target resistance load per set',
    icon: Scale,
  },
  {
    id: 'weight_time',
    label: 'Weight & Time',
    shortLabel: 'Wt + Time',
    tooltip: 'Weighted static hold with timer (e.g. 15kg for 45s)',
    icon: Clock,
  },
];

export const BoxingDrillCard: React.FC<BoxingDrillCardProps> = ({
  drill,
  drillIndex,
  totalDrills = 1,
  weightUnit = 'kg',
  liveTimerState,
  onUpdateDrill,
  onDeleteDrill,
  onMoveUp,
  onMoveDown,
  onStartDrillTimer,
  onTimerCommand,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(drill.name);
  const [editCategory, setEditCategory] = useState<BoxingDrill['category']>(drill.category);
  const [editTrackingMode, setEditTrackingMode] = useState<BoxingTrackingMode>(
    drill.trackingMode || 'time'
  );
  const [editDefaultReps, setEditDefaultReps] = useState(drill.defaultReps || 15);
  const [editDefaultWeight, setEditDefaultWeight] = useState(drill.defaultWeight || 10);
  const [editCombo, setEditCombo] = useState(drill.comboOrCues || '');
  const [editNotes, setEditNotes] = useState(drill.notes || '');
  const [editRoundSecs, setEditRoundSecs] = useState(drill.roundDurationSeconds || 60);
  const [editRestSecs, setEditRestSecs] = useState(drill.restSeconds || 60);

  // Dedicated Today's Session Note state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(drill.notes || '');

  const trackingMode: BoxingTrackingMode = drill.trackingMode || 'time';
  const hasReps = trackingMode === 'reps' || trackingMode === 'weight_reps';
  const hasWeight =
    trackingMode === 'weight' || trackingMode === 'weight_reps' || trackingMode === 'weight_time';
  const hasTime = trackingMode === 'time' || trackingMode === 'weight_time';

  const completedRoundsCount = drill.rounds.filter((r) => r.completed).length;
  const isAllDone = drill.rounds.length > 0 && completedRoundsCount === drill.rounds.length;
  const isThisDrillActive =
    liveTimerState?.drillId === drill.id &&
    (liveTimerState.isRunning || liveTimerState.secondsLeft > 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Instant 1-tap tracking mode switcher right from the card
  const handleSetTrackingMode = (newMode: BoxingTrackingMode) => {
    const isReps = newMode === 'reps' || newMode === 'weight_reps';
    const isWeight = newMode === 'weight' || newMode === 'weight_reps' || newMode === 'weight_time';

    const defReps =
      drill.defaultReps ??
      (isReps ? (drill.name.toLowerCase().includes('twist') ? 20 : 15) : undefined);
    const defWeight =
      drill.defaultWeight ??
      (isWeight ? (drill.name.toLowerCase().includes('twist') ? 10 : 10) : undefined);

    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      reps: isReps ? (r.reps ?? defReps ?? 15) : undefined,
      targetReps: isReps ? (r.targetReps ?? defReps ?? 15) : undefined,
      weight: isWeight ? (r.weight ?? defWeight ?? 10) : undefined,
      targetWeight: isWeight ? (r.targetWeight ?? defWeight ?? 10) : undefined,
    }));

    const updatedDrill: BoxingDrill = {
      ...drill,
      trackingMode: newMode,
      defaultReps: defReps,
      defaultWeight: defWeight,
      rounds: updatedRounds,
    };

    soundManager.playClickPop();
    onUpdateDrill(updatedDrill);
  };

  const handleToggleRound = (roundId: string) => {
    let toggledToCompleted = false;
    let toggledRoundNumber = 1;

    const updatedRounds = drill.rounds.map((r) => {
      if (r.id === roundId) {
        const next = !r.completed;
        toggledToCompleted = next;
        toggledRoundNumber = r.roundNumber;
        if (next) soundManager.playClickPop();
        return { ...r, completed: next };
      }
      return r;
    });

    onUpdateDrill({ ...drill, rounds: updatedRounds });

    // When you check a set/round Done, auto-start Corner Rest if more rounds remain!
    if (
      toggledToCompleted &&
      toggledRoundNumber < drill.rounds.length &&
      !(isThisDrillActive && liveTimerState?.phase === 'work' && liveTimerState?.isRunning)
    ) {
      onStartDrillTimer(drill, toggledRoundNumber, 'rest');
    }
  };

  const handleToggleAllRounds = () => {
    const nextState = !isAllDone;
    const updatedRounds = drill.rounds.map((r) => ({ ...r, completed: nextState }));
    soundManager.playClickPop();
    onUpdateDrill({ ...drill, rounds: updatedRounds });
  };

  // Adjust reps for a single round
  const handleAdjustRoundReps = (roundId: string, delta: number) => {
    const updatedRounds = drill.rounds.map((r) => {
      if (r.id === roundId) {
        const current = r.reps ?? drill.defaultReps ?? 15;
        const next = Math.max(1, current + delta);
        return { ...r, reps: next };
      }
      return r;
    });
    soundManager.playClickPop();
    onUpdateDrill({ ...drill, rounds: updatedRounds });
  };

  // Adjust weight for a single round
  const handleAdjustRoundWeight = (roundId: string, delta: number) => {
    const updatedRounds = drill.rounds.map((r) => {
      if (r.id === roundId) {
        const current = r.weight ?? drill.defaultWeight ?? 0;
        const next = Math.max(0, parseFloat((current + delta).toFixed(1)));
        return { ...r, weight: next };
      }
      return r;
    });
    soundManager.playClickPop();
    onUpdateDrill({ ...drill, rounds: updatedRounds });
  };

  // Adjust target reps globally for this drill
  const handleAdjustTargetReps = (delta: number) => {
    const current = drill.defaultReps ?? 15;
    const next = Math.max(1, current + delta);
    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      targetReps: next,
      reps: r.completed ? r.reps : next,
    }));
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      defaultReps: next,
      rounds: updatedRounds,
    });
  };

  // Adjust target weight globally for this drill
  const handleAdjustTargetWeight = (delta: number) => {
    const current = drill.defaultWeight ?? 10;
    const next = Math.max(0, parseFloat((current + delta).toFixed(1)));
    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      targetWeight: next,
      weight: r.completed ? r.weight : next,
    }));
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      defaultWeight: next,
      rounds: updatedRounds,
    });
  };

  const handleAdjustDuration = (field: 'roundDurationSeconds' | 'restSeconds', delta: number) => {
    const current = drill[field];
    const next = Math.max(15, current + delta);
    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      durationSeconds: field === 'roundDurationSeconds' ? next : r.durationSeconds,
      restSeconds: field === 'restSeconds' ? next : r.restSeconds,
    }));
    const updatedDrill: BoxingDrill = {
      ...drill,
      [field]: next,
      rounds: updatedRounds,
    };
    soundManager.playClickPop();
    onUpdateDrill(updatedDrill);

    if (isThisDrillActive) {
      onTimerCommand?.('updateDurations', delta, {
        roundSeconds: updatedDrill.roundDurationSeconds,
        restSeconds: updatedDrill.restSeconds,
        changedField: field,
      });
    }
  };

  const handleAddRound = () => {
    const newRound: BoxingRound = {
      id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roundNumber: drill.rounds.length + 1,
      durationSeconds: drill.roundDurationSeconds || 180,
      restSeconds: drill.restSeconds || 60,
      completed: false,
      reps: hasReps ? (drill.defaultReps ?? 15) : undefined,
      weight: hasWeight ? (drill.defaultWeight ?? 10) : undefined,
      targetReps: hasReps ? (drill.defaultReps ?? 15) : undefined,
      targetWeight: hasWeight ? (drill.defaultWeight ?? 10) : undefined,
    };
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      rounds: [...drill.rounds, newRound],
    });
  };

  const handleRemoveLastRound = () => {
    if (drill.rounds.length <= 1) return;
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      rounds: drill.rounds.slice(0, -1),
    });
  };

  const handleSwapSoloPartner = () => {
    const nextMode = drill.mode === 'solo' ? 'partner' : 'solo';
    const currentName = drill.name;
    const currentCues = drill.comboOrCues;

    const swappedName =
      drill.partnerAlternativeName ||
      (nextMode === 'partner'
        ? `Partner Pad / Counter: ${drill.name}`
        : `Solo Bag / Shadow: ${drill.name}`);

    const swappedCues =
      drill.partnerAlternativeCues ||
      (nextMode === 'partner'
        ? `${currentCues || '1-2-3-2'} (With partner catching on mitts/gloves & countering)`
        : `${currentCues || '1-2-3-2'} (Solo on heavy bag or shadowboxing with head movement)`);

    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      mode: nextMode,
      name: swappedName,
      comboOrCues: swappedCues,
      partnerAlternativeName: currentName,
      partnerAlternativeCues: currentCues,
    });
  };

  const handleSaveNotes = () => {
    const trimmed = notesText.trim();
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      notes: trimmed || undefined,
    });
    setIsEditingNotes(false);
  };

  const handleClearNotes = () => {
    soundManager.playClickPop();
    onUpdateDrill({
      ...drill,
      notes: undefined,
    });
    setNotesText('');
    setIsEditingNotes(false);
  };

  const handleSaveEditedDetails = () => {
    const isReps = editTrackingMode === 'reps' || editTrackingMode === 'weight_reps';
    const isWeight =
      editTrackingMode === 'weight' ||
      editTrackingMode === 'weight_reps' ||
      editTrackingMode === 'weight_time';

    const updatedRounds = drill.rounds.map((r) => ({
      ...r,
      durationSeconds: editRoundSecs,
      restSeconds: editRestSecs,
      reps: isReps ? (r.reps ?? editDefaultReps) : undefined,
      weight: isWeight ? (r.weight ?? editDefaultWeight) : undefined,
      targetReps: isReps ? editDefaultReps : undefined,
      targetWeight: isWeight ? editDefaultWeight : undefined,
    }));

    onUpdateDrill({
      ...drill,
      name: editName.trim() || drill.name,
      category: editCategory,
      trackingMode: editTrackingMode,
      defaultReps: isReps ? editDefaultReps : undefined,
      defaultWeight: isWeight ? editDefaultWeight : undefined,
      comboOrCues: editCombo.trim() || undefined,
      notes: editNotes.trim() || undefined,
      roundDurationSeconds: editRoundSecs,
      restSeconds: editRestSecs,
      rounds: updatedRounds,
    });
    setIsEditingDetails(false);
    soundManager.playClickPop();
  };

  const firstPendingRound = drill.rounds.find((r) => !r.completed)?.roundNumber || 1;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isAllDone
          ? 'border-[#d4b26f]/35 bg-[#121217]'
          : 'border-white/[0.08] bg-[#121217]'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 pb-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span className="font-mono text-xs font-bold text-zinc-400 bg-[#181822] border border-white/10 px-2 py-0.5 rounded-md shrink-0 mt-1">
              #{drillIndex + 1}
            </span>

            {/* Master All-Rounds Checkbox */}
            <button
              type="button"
              onClick={handleToggleAllRounds}
              className={`flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90 touch-manipulation cursor-pointer ${
                isAllDone
                  ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-md'
                  : 'border-zinc-500 bg-zinc-950 text-transparent hover:border-[#d4b26f]'
              }`}
              title={isAllDone ? 'Mark drill incomplete' : 'Check off all sets'}
            >
              <Check
                className={`h-5 w-5 stroke-[3.5] transition-transform ${
                  isAllDone ? 'scale-100' : 'scale-0'
                }`}
              />
            </button>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Mode Badge: Solo vs Partner */}
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                    drill.mode === 'partner'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {drill.mode === 'partner' ? (
                    <>
                      <Users className="w-3 h-3" />
                      <span>Partner</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      <span>Solo</span>
                    </>
                  )}
                </span>

                {/* Current Tracking Mode Badge */}
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-[#d4b26f]/15 text-[#eed891] border border-[#d4b26f]/30">
                  {trackingMode === 'reps' && <Hash className="w-3 h-3" />}
                  {trackingMode === 'weight_reps' && <Dumbbell className="w-3 h-3" />}
                  {trackingMode === 'weight' && <Scale className="w-3 h-3" />}
                  {trackingMode === 'weight_time' && <Clock className="w-3 h-3" />}
                  {trackingMode === 'time' && <Timer className="w-3 h-3" />}
                  <span>
                    {trackingMode === 'reps'
                      ? 'Reps'
                      : trackingMode === 'weight_reps'
                      ? 'Wt + Reps'
                      : trackingMode === 'weight'
                      ? 'Weight'
                      : trackingMode === 'weight_time'
                      ? 'Wt + Time'
                      : 'Time'}
                  </span>
                </span>

                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {CATEGORY_LABELS[drill.category]}
                </span>
              </div>

              <h3
                className={`mt-1 text-base sm:text-lg font-bold tracking-tight break-words leading-snug ${
                  isAllDone ? 'text-zinc-400 line-through decoration-[#d4b26f]/70' : 'text-white'
                }`}
              >
                {drill.name}
              </h3>
            </div>
          </div>

          {/* Right Expand & Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-2xl border border-white/10 bg-[#181820] p-1.5 shadow-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(drill.name);
                      setEditCategory(drill.category);
                      setEditTrackingMode(drill.trackingMode || 'time');
                      setEditDefaultReps(drill.defaultReps || 15);
                      setEditDefaultWeight(drill.defaultWeight || 10);
                      setEditCombo(drill.comboOrCues || '');
                      setEditNotes(drill.notes || '');
                      setEditRoundSecs(drill.roundDurationSeconds || 60);
                      setEditRestSecs(drill.restSeconds || 60);
                      setIsEditingDetails(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-zinc-200 hover:bg-zinc-800 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#d4b26f]" />
                    <span>Edit Exercise Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSwapSoloPartner();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-zinc-200 hover:bg-zinc-800 font-medium cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
                    <span>Swap to {drill.mode === 'solo' ? 'Partner' : 'Solo'} Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteDrill(drill.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-400 hover:bg-rose-500/10 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Exercise</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🌟 1-TAP TRACKING MODE SELECTOR (Choose what to put in this exercise card!) */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-white/[0.05] pt-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0">
            Track by:
          </span>
          {TRACKING_MODE_TABS.map((tab) => {
            const isSelected = trackingMode === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSetTrackingMode(tab.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition active:scale-95 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4b26f] text-black font-black shadow-sm'
                    : 'border border-white/10 bg-[#161622] text-zinc-300 hover:text-white hover:border-[#d4b26f]/40'
                }`}
                title={tab.tooltip}
              >
                <TabIcon className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-[#d4b26f]'}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Second Row: Summary & Reorder */}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 whitespace-nowrap min-w-0 flex-wrap">
            <span className="font-mono font-bold text-[#eed891]">
              {completedRoundsCount}/{drill.rounds.length}{' '}
              {hasReps || trackingMode === 'weight' ? 'Sets' : 'Rds'}
            </span>
            <span className="text-zinc-600">·</span>
            {trackingMode === 'reps' && (
              <span className="font-mono text-xs text-zinc-300">
                Target: {drill.defaultReps || drill.rounds[0]?.reps || 15} Reps · Rest {drill.restSeconds}s
              </span>
            )}
            {trackingMode === 'weight_reps' && (
              <span className="font-mono text-xs text-zinc-300">
                Target: {drill.defaultWeight || drill.rounds[0]?.weight || 10}{weightUnit} ×{' '}
                {drill.defaultReps || drill.rounds[0]?.reps || 20} Reps
              </span>
            )}
            {trackingMode === 'weight' && (
              <span className="font-mono text-xs text-zinc-300">
                Target: {drill.defaultWeight || drill.rounds[0]?.weight || 20}{weightUnit} · Rest {drill.restSeconds}s
              </span>
            )}
            {trackingMode === 'weight_time' && (
              <span className="font-mono text-xs text-zinc-300">
                {drill.defaultWeight || 10}{weightUnit} · {formatTime(drill.roundDurationSeconds)} Work
              </span>
            )}
            {trackingMode === 'time' && (
              <span className="font-mono text-xs">
                {formatTime(drill.roundDurationSeconds)} Work / {drill.restSeconds}s Rest
              </span>
            )}

            {/* Today's Session Note Pill (Resets upon saving workout) */}
            <span className="text-zinc-600 shrink-0">·</span>
            {drill.notes ? (
              <button
                type="button"
                onClick={() => {
                  setNotesText(drill.notes || '');
                  setIsEditingNotes(!isEditingNotes);
                  soundManager.playClickPop();
                }}
                className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 border border-sky-500/35 px-1.5 py-0.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/25 transition cursor-pointer"
                title="Today's Session Note (resets after saving workout)"
              >
                <FileText className="w-3 h-3 text-sky-400" />
                <span>Note</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNotesText('');
                  setIsEditingNotes(true);
                  soundManager.playClickPop();
                }}
                className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                title="Add today's session note"
              >
                <FileText className="w-3 h-3 text-sky-400/70" />
                <span>+ Note</span>
              </button>
            )}
          </div>

          {totalDrills > 1 && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#181822] p-0.5 shrink-0">
              <button
                type="button"
                disabled={drillIndex === 0}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveUp?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move exercise up"
                aria-label="Move exercise up"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                disabled={drillIndex === totalDrills - 1}
                onClick={() => {
                  soundManager.playClickPop();
                  onMoveDown?.();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none active:scale-90 transition touch-manipulation cursor-pointer"
                title="Move exercise down"
                aria-label="Move exercise down"
              >
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Third Row: Action Buttons */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {/* Solo <-> Partner Button */}
          <button
            type="button"
            onClick={handleSwapSoloPartner}
            className="flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-[#181822] px-3 text-xs font-bold text-zinc-200 hover:border-[#d4b26f]/40 hover:text-white active:scale-95 transition cursor-pointer"
            title="Switch between Solo and Partner version"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
            <span>Switch to {drill.mode === 'solo' ? 'Partner' : 'Solo'}</span>
          </button>

          {/* Action Button: Timer or Rest */}
          {hasTime ? (
            <button
              type="button"
              onClick={() => {
                if (isThisDrillActive) {
                  onTimerCommand?.('togglePlay');
                } else {
                  onStartDrillTimer(drill, firstPendingRound, 'work');
                }
              }}
              className={`flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-black uppercase active:scale-95 transition shadow-sm cursor-pointer ${
                isThisDrillActive
                  ? liveTimerState?.phase === 'rest'
                    ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                  : 'bg-[#d4b26f] text-black hover:bg-[#e2c487]'
              }`}
            >
              {isThisDrillActive ? (
                <>
                  {liveTimerState?.isRunning ? (
                    <Pause className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  )}
                  <span className="font-mono">{formatTime(liveTimerState?.secondsLeft || 0)}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black stroke-none shrink-0" />
                  <span>Start R{firstPendingRound}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isThisDrillActive) {
                  onTimerCommand?.('togglePlay');
                } else {
                  onStartDrillTimer(drill, firstPendingRound, 'rest');
                }
              }}
              className={`flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-black uppercase active:scale-95 transition shadow-sm cursor-pointer ${
                isThisDrillActive && liveTimerState?.phase === 'rest'
                  ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                  : 'border border-white/15 bg-[#181824] text-zinc-200 hover:border-[#d4b26f]/40 hover:text-[#eed891]'
              }`}
              title="Start optional corner rest timer between sets"
            >
              <Bell className="w-3.5 h-3.5 text-[#d4b26f] shrink-0" />
              {isThisDrillActive && liveTimerState?.phase === 'rest' ? (
                <span className="font-mono">Rest: {formatTime(liveTimerState.secondsLeft)}</span>
              ) : (
                <span>Rest Timer ({drill.restSeconds}s)</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* INLINE LIVE ROUND & CORNER REST TIMER */}
      {isThisDrillActive && liveTimerState && (
        <div
          className={`mx-3.5 mb-3 overflow-hidden rounded-2xl border p-3 space-y-2.5 transition-all ${
            liveTimerState.phase === 'work' &&
            liveTimerState.secondsLeft <= 10 &&
            liveTimerState.secondsLeft > 0
              ? 'border-amber-400 bg-[#1a1310] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : liveTimerState.phase === 'rest'
              ? 'border-emerald-500/50 bg-[#0f1915]'
              : 'border-[#d4b26f]/50 bg-[#15151f]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  liveTimerState.phase === 'rest'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#d4b26f] text-black'
                }`}
              >
                <Bell className="w-3 h-3 stroke-[2.5]" />
                {liveTimerState.phase === 'rest'
                  ? `CORNER REST · NEXT S${Math.min(drill.rounds.length, liveTimerState.currentRound + 1)}`
                  : `ROUND ${liveTimerState.currentRound} OF ${liveTimerState.totalRounds} · WORK`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onTimerCommand?.('stop')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
              title="Stop timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Centered Countdown Stepper Row */}
          <div className="flex items-center justify-center gap-3 py-1">
            <button
              type="button"
              onClick={() => onTimerCommand?.('adjustSeconds', -15)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
              title="-15 seconds"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div
              className={`min-w-[100px] text-center font-mono text-3xl font-black tracking-tight ${
                liveTimerState.phase === 'rest' ? 'text-emerald-300' : 'text-white'
              }`}
            >
              {formatTime(liveTimerState.secondsLeft)}
            </div>

            <button
              type="button"
              onClick={() => onTimerCommand?.('adjustSeconds', 15)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1c26] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
              title="+15 seconds"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 2-Column Pause/Resume & Skip Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTimerCommand?.('togglePlay')}
              className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-black uppercase transition active:scale-95 cursor-pointer ${
                liveTimerState.isRunning
                  ? 'border border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                  : 'bg-[#d4b26f] text-black'
              }`}
            >
              {liveTimerState.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTimerCommand?.('skipPhase')}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1c1c26] text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition cursor-pointer"
              title={
                liveTimerState.phase === 'work'
                  ? 'Finish round & start rest'
                  : 'Skip rest & start next set'
              }
            >
              <SkipForward className="w-3.5 h-3.5 text-[#d4b26f]" />
              <span>{liveTimerState.phase === 'work' ? 'Skip to Rest' : 'Next Set'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Today's Session Performance Note Banner */}
      {drill.notes && !isEditingNotes && (
        <div
          onClick={() => {
            setNotesText(drill.notes || '');
            setIsEditingNotes(true);
            soundManager.playClickPop();
          }}
          className="mx-3.5 mb-2.5 flex items-start justify-between gap-2 rounded-xl border border-sky-500/30 bg-[#0c1622] px-3 py-2 text-xs sm:text-sm text-zinc-200 hover:border-sky-500/50 transition cursor-pointer select-none group shadow-xs"
          title="Today's Session Note (Tap to edit — resets on workout save)"
        >
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                  Today&apos;s Exercise Note
                </span>
                <span className="text-[9px] font-bold text-sky-300 bg-sky-950/90 border border-sky-500/30 px-1 py-0.2 rounded">
                  Resets after saving
                </span>
              </div>
              <p className="leading-snug break-words text-zinc-200 font-medium">
                {drill.notes}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNotesText(drill.notes || '');
              setIsEditingNotes(true);
              soundManager.playClickPop();
            }}
            className="p-1 rounded text-zinc-500 hover:text-sky-300 transition shrink-0 opacity-70 group-hover:opacity-100"
            title="Edit today's note"
            aria-label="Edit today's note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Prominent + Add Today's Note Button (Shown directly on card when no note written yet) */}
      {!drill.notes && !isEditingNotes && (
        <div className="mx-3.5 mb-2.5">
          <button
            type="button"
            onClick={() => {
              setNotesText('');
              setIsEditingNotes(true);
              soundManager.playClickPop();
            }}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-sky-500/35 bg-[#0c1622]/70 hover:bg-[#0c1622] hover:border-sky-400 px-3.5 py-2.5 text-xs text-sky-300 transition active:scale-[0.99] cursor-pointer group shadow-sm"
          >
            <span className="flex items-center gap-2 font-bold">
              <FileText className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>+ Add Today&apos;s Exercise Note</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-black/40 border border-white/5 px-2 py-0.5 rounded-md">
              Resets after save
            </span>
          </button>
        </div>
      )}

      {/* Editable Session Notes Form */}
      {isEditingNotes && (
        <div className="mx-3.5 mb-3 rounded-xl border border-sky-500/40 bg-[#0c1622] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-300">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Today&apos;s Boxing Exercise Note</span>
            </span>
            {drill.notes && (
              <button
                type="button"
                onClick={handleClearNotes}
                className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Clear Note
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Performance feedback for today (e.g. guard dropped on right hook, slip counter was sharp, pace in 3rd round). Saved with report, then deleted when you complete the session.
          </p>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="e.g. Felt snappy on combinations, need to keep chin tucked during exit, right hand dropped in round 3..."
            className="w-full rounded-lg border border-sky-500/20 bg-zinc-950 p-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setIsEditingNotes(false)}
              className="px-2.5 py-1 text-xs sm:text-sm text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-black cursor-pointer shadow-sm"
            >
              Save Today&apos;s Note
            </button>
          </div>
        </div>
      )}

      {/* Combination / Technical Cues Box */}
      {!isEditingDetails && drill.comboOrCues && (
        <div
          onClick={() => {
            setEditName(drill.name);
            setEditCategory(drill.category);
            setEditTrackingMode(drill.trackingMode || 'time');
            setEditDefaultReps(drill.defaultReps || 15);
            setEditDefaultWeight(drill.defaultWeight || 10);
            setEditCombo(drill.comboOrCues || '');
            setEditNotes(drill.notes || '');
            setEditRoundSecs(drill.roundDurationSeconds || 60);
            setEditRestSecs(drill.restSeconds || 60);
            setIsEditingDetails(true);
          }}
          className="mx-3.5 mb-2.5 cursor-pointer rounded-xl border border-[#d4b26f]/20 bg-[#181822] px-3 py-2.5 text-xs sm:text-sm hover:border-[#d4b26f]/40 transition"
          title="Tap to customize cues and details"
        >
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#d4b26f] mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Focus & Form Cue
            </span>
            <span className="text-zinc-400 font-normal">Tap to edit</span>
          </div>
          <div className="font-mono text-xs sm:text-sm text-zinc-100 leading-relaxed">
            {drill.comboOrCues}
          </div>
        </div>
      )}

      {/* Inline Editor for Name, Tracking Mode, Target Reps/Weight, Combo, and Notes */}
      {isEditingDetails && (
        <div className="mx-3.5 mb-3 rounded-xl border border-[#d4b26f]/40 bg-[#181822] p-3 space-y-2.5">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Exercise Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#d4b26f]">
              Tracking & Counting Mode
            </label>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TRACKING_MODE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditTrackingMode(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-bold transition cursor-pointer ${
                    editTrackingMode === t.id
                      ? 'border-[#d4b26f] bg-[#d4b26f] text-black'
                      : 'border-white/10 bg-zinc-950 text-zinc-300'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {(editTrackingMode === 'reps' || editTrackingMode === 'weight_reps') && (
            <div>
              <label className="text-xs font-bold uppercase text-zinc-400">Target Reps</label>
              <input
                type="number"
                min={1}
                max={500}
                value={editDefaultReps}
                onChange={(e) => setEditDefaultReps(parseInt(e.target.value) || 15)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          )}

          {(editTrackingMode === 'weight' ||
            editTrackingMode === 'weight_reps' ||
            editTrackingMode === 'weight_time') && (
            <div>
              <label className="text-xs font-bold uppercase text-zinc-400">
                Target Weight ({weightUnit})
              </label>
              <input
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={editDefaultWeight}
                onChange={(e) => setEditDefaultWeight(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase text-[#d4b26f]">
              Combinations / Cues (e.g. 3 Sets · 15 Reps or 1-2-Slip-2)
            </label>
            <textarea
              value={editCombo}
              onChange={(e) => setEditCombo(e.target.value)}
              rows={2}
              placeholder="e.g. 3 Sets · 15 Reps or 1-2-3-2"
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 p-2.5 text-sm font-mono text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-400">Technical Notes</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Curl ribs toward pelvis slowly"
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingDetails(false)}
              className="px-3 py-1.5 text-xs sm:text-sm text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditedDetails}
              className="rounded-lg bg-[#d4b26f] px-4 py-1.5 text-xs sm:text-sm font-black uppercase text-black cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Expanded Sets/Rounds & Interactive Controls */}
      {isExpanded && (
        <div className="border-t border-white/[0.06] px-3.5 pt-2.5 pb-3 space-y-2.5">
          {/* Interactive Set / Round Rows */}
          <div className="space-y-1.5">
            {drill.rounds.map((r) => {
              const isRoundActive =
                isThisDrillActive && liveTimerState?.currentRound === r.roundNumber;

              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition ${
                    r.completed
                      ? 'border-[#d4b26f]/35 bg-[#d4b26f]/10'
                      : isRoundActive
                      ? 'border-[#d4b26f] bg-[#191924]'
                      : 'border-white/[0.07] bg-[#15151d]'
                  }`}
                >
                  {/* Left: Badge & Metric Steppers */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`flex h-7 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                        r.completed
                          ? 'bg-[#d4b26f] text-black'
                          : isRoundActive
                          ? 'bg-[#d4b26f]/25 text-[#eed891] border border-[#d4b26f]'
                          : 'bg-[#0e0e14] text-zinc-300 border border-white/10'
                      }`}
                    >
                      {hasReps || trackingMode === 'weight' ? `S${r.roundNumber}` : `R${r.roundNumber}`}
                    </span>

                    {/* Mode: REPS ONLY */}
                    {trackingMode === 'reps' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#0e0e14] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundReps(r.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="-1 Rep"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <div className="flex items-center px-2 font-mono text-xs sm:text-sm font-black text-white min-w-[60px] justify-center">
                            {r.reps ?? drill.defaultReps ?? 15}{' '}
                            <span className="text-[10px] font-bold text-zinc-400 ml-1">reps</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundReps(r.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="+1 Rep"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                          Rest {r.restSeconds}s
                        </span>
                      </div>
                    )}

                    {/* Mode: WEIGHT & REPS */}
                    {trackingMode === 'weight_reps' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Weight Stepper */}
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#0e0e14] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, -2.5)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="-2.5 kg"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <div className="flex items-center px-1.5 font-mono text-xs sm:text-sm font-black text-[#eed891] min-w-[48px] justify-center">
                            {r.weight ?? drill.defaultWeight ?? 10}
                            <span className="text-[9px] text-zinc-400 ml-0.5">{weightUnit}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, 2.5)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="+2.5 kg"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>

                        {/* Reps Stepper */}
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#0e0e14] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundReps(r.id, -1)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="-1 Rep"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <div className="flex items-center px-1.5 font-mono text-xs sm:text-sm font-black text-white min-w-[48px] justify-center">
                            {r.reps ?? drill.defaultReps ?? 20}
                            <span className="text-[9px] text-zinc-400 ml-0.5">reps</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundReps(r.id, 1)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="+1 Rep"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode: WEIGHT ONLY */}
                    {trackingMode === 'weight' && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#0e0e14] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, -2.5)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="-2.5 kg"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <div className="flex items-center px-2 font-mono text-xs sm:text-sm font-black text-[#eed891] min-w-[56px] justify-center">
                            {r.weight ?? drill.defaultWeight ?? 20}{' '}
                            <span className="text-[10px] text-zinc-400 ml-1">{weightUnit}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, 2.5)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                            title="+2.5 kg"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                          Rest {r.restSeconds}s
                        </span>
                      </div>
                    )}

                    {/* Mode: WEIGHT & TIME */}
                    {trackingMode === 'weight_time' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center rounded-xl border border-white/10 bg-[#0e0e14] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, -2.5)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <div className="flex items-center px-1.5 font-mono text-xs font-black text-[#eed891] min-w-[48px] justify-center">
                            {r.weight ?? drill.defaultWeight ?? 10}{' '}
                            <span className="text-[9px] text-zinc-400 ml-0.5">{weightUnit}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdjustRoundWeight(r.id, 2.5)}
                            className="flex h-7 w-6 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                        <div className="font-mono text-xs font-bold text-zinc-100">
                          {formatTime(r.durationSeconds)} Work
                        </div>
                      </div>
                    )}

                    {/* Mode: TIME ONLY */}
                    {trackingMode === 'time' && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-100 flex-wrap">
                          <span>
                            {formatTime(r.durationSeconds)} Work
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[#eed891]">{r.restSeconds}s Rest</span>
                        </div>
                        {r.focusCombo && (
                          <p className="text-xs text-zinc-300 mt-1 font-medium leading-relaxed">
                            {r.focusCombo}
                          </p>
                        )}
                        {isRoundActive && liveTimerState && (
                          <div
                            className={`font-mono text-[11px] font-black uppercase mt-1 ${
                              liveTimerState.phase === 'rest'
                                ? 'text-emerald-400'
                                : 'text-[#d4b26f]'
                            }`}
                          >
                            {liveTimerState.phase === 'rest' ? 'Corner Rest: ' : 'Live Round: '}
                            {formatTime(liveTimerState.secondsLeft)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Round Timer or Rest Button + Done Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasTime ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isRoundActive) {
                            onTimerCommand?.('togglePlay');
                          } else {
                            onStartDrillTimer(drill, r.roundNumber, 'work');
                          }
                        }}
                        className={`flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                          isRoundActive
                            ? 'border-[#d4b26f] bg-[#d4b26f]/20 text-[#eed891]'
                            : 'border-white/10 bg-[#0e0e14] text-zinc-300 hover:border-[#d4b26f]/40 hover:text-white'
                        }`}
                        title={`Start timer for Round ${r.roundNumber}`}
                      >
                        {isRoundActive && liveTimerState?.isRunning ? (
                          <>
                            <Pause className="w-3 h-3 text-[#d4b26f]" />
                            <span className="font-mono">
                              {formatTime(liveTimerState.secondsLeft)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-[#d4b26f] fill-[#d4b26f]" />
                            <span>Time</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartDrillTimer(drill, r.roundNumber, 'rest')}
                        className="flex h-8 items-center gap-1 rounded-xl border border-white/10 bg-[#0e0e14] px-2 text-xs font-bold text-zinc-300 hover:border-[#d4b26f]/40 hover:text-white active:scale-95 transition cursor-pointer"
                        title="Start optional corner rest timer"
                      >
                        <Bell className="w-3 h-3 text-[#d4b26f]" />
                        <span className="hidden xs:inline">Rest</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleRound(r.id)}
                      className={`flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-black uppercase transition active:scale-95 cursor-pointer ${
                        r.completed
                          ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-sm'
                          : 'border-white/10 bg-[#1c1c26] text-zinc-200 hover:border-[#d4b26f]/40 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Steppers for Targets (Capsule Steppers based on trackingMode) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Left Capsule Stepper: Reps or Weight or Round Time */}
            {hasReps && (
              <div className="min-w-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                  <span>TARGET REPS</span>
                  <span className="font-mono text-[10px] text-zinc-400 font-normal">±1</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleAdjustTargetReps(-1)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="font-mono text-sm sm:text-base font-black text-white text-center flex-1">
                    {drill.defaultReps ?? 15} reps
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustTargetReps(1)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {!hasReps && hasWeight && (
              <div className="min-w-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                  <span>TARGET WEIGHT</span>
                  <span className="font-mono text-[10px] text-zinc-400 font-normal">±2.5</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleAdjustTargetWeight(-2.5)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="font-mono text-sm sm:text-base font-black text-[#eed891] text-center flex-1">
                    {drill.defaultWeight ?? 20} {weightUnit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustTargetWeight(2.5)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {!hasReps && !hasWeight && (
              <div className="min-w-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                  <span>ROUND TIME</span>
                  <span className="font-mono text-[10px] text-zinc-400 font-normal">±30s</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration('roundDurationSeconds', -30)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="font-mono text-sm sm:text-base font-black text-white text-center flex-1">
                    {Math.floor(drill.roundDurationSeconds / 60)}:
                    {(drill.roundDurationSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration('roundDurationSeconds', 30)}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* Right Capsule Stepper: Rest Time */}
            <div className="min-w-0">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                <span>REST TIME</span>
                <span className="font-mono text-[10px] text-zinc-400 font-normal">±15s</span>
              </div>
              <div className="flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c12] p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('restSeconds', -15)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="font-mono text-sm sm:text-base font-black text-[#eed891] text-center flex-1">
                  {drill.restSeconds}s
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustDuration('restSeconds', 15)}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#242433] text-white hover:bg-zinc-700 active:scale-90 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Add/Remove Sets Row */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={handleAddRound}
              className="flex min-h-[38px] items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-[#eed891] hover:bg-white/5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4b26f]" />
              <span>Add {hasReps || trackingMode === 'weight' ? 'Set' : 'Round'}</span>
            </button>

            {drill.rounds.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveLastRound}
                className="flex min-h-[38px] items-center px-2.5 rounded-xl text-xs text-zinc-400 hover:text-rose-400 transition cursor-pointer"
              >
                Remove Last {hasReps || trackingMode === 'weight' ? 'Set' : 'Round'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
