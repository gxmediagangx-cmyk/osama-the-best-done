'use client';

import React, { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { Exercise, ExerciseSet } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (newExercise: Exercise) => void;
  defaultWeightUnit: string;
  hasVariations?: boolean;
  session1Label?: string;
  session2Label?: string;
  initialVariant?: 'both' | 'session1' | 'session2';
}

const POPULAR_EXERCISES: { name: string; category: Exercise['category']; defaultSets: number; defaultReps: number; defaultWeight: number }[] = [
  { name: 'Incline Dumbbell Press', category: 'chest', defaultSets: 3, defaultReps: 10, defaultWeight: 24 },
  { name: 'Flat Barbell Bench Press', category: 'chest', defaultSets: 3, defaultReps: 8, defaultWeight: 70 },
  { name: 'Chest Cable Flyes', category: 'chest', defaultSets: 3, defaultReps: 12, defaultWeight: 12.5 },
  { name: 'Lat Pulldown', category: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 55 },
  { name: 'Barbell Bent Over Row', category: 'back', defaultSets: 3, defaultReps: 8, defaultWeight: 60 },
  { name: 'Seated Cable Row', category: 'back', defaultSets: 3, defaultReps: 10, defaultWeight: 50 },
  { name: 'Overhead Dumbbell Shoulder Press', category: 'shoulders', defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
  { name: 'Cable Lateral Raise', category: 'shoulders', defaultSets: 4, defaultReps: 12, defaultWeight: 7.5 },
  { name: 'Romanian Deadlift (RDL)', category: 'legs', defaultSets: 3, defaultReps: 10, defaultWeight: 60 },
  { name: 'Leg Press / Hack Squat', category: 'legs', defaultSets: 3, defaultReps: 10, defaultWeight: 100 },
  { name: 'Lying / Seated Leg Curl', category: 'legs', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
  { name: 'Standing Calf Raise', category: 'legs', defaultSets: 4, defaultReps: 12, defaultWeight: 40 },
  { name: 'Incline Dumbbell Bicep Curl', category: 'arms', defaultSets: 3, defaultReps: 10, defaultWeight: 12.5 },
  { name: 'Tricep Rope Overhead Extension', category: 'arms', defaultSets: 3, defaultReps: 12, defaultWeight: 17.5 },
  { name: 'Hanging Leg Raise', category: 'core', defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercise,
  defaultWeightUnit,
  hasVariations = false,
  session1Label,
  session2Label,
  initialVariant = 'both',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exercise['category']>('chest');
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [defaultWeight, setDefaultWeight] = useState(25);
  const [cues, setCues] = useState('');
  const [notes, setNotes] = useState('');
  const [variant, setVariant] = useState<'both' | 'session1' | 'session2'>(initialVariant);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: typeof POPULAR_EXERCISES[0]) => {
    setName(template.name);
    setCategory(template.category);
    setTargetSets(template.defaultSets);
    setTargetReps(template.defaultReps);
    setDefaultWeight(template.defaultWeight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialSets: ExerciseSet[] = Array.from({ length: targetSets }, (_, i) => ({
      id: `set-${Date.now()}-${i}`,
      setNumber: i + 1,
      weight: defaultWeight,
      reps: targetReps,
      completed: false,
    }));

    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      targetSets,
      targetReps,
      defaultWeight,
      cues: cues.trim() || undefined,
      notes: notes.trim() || undefined,
      sets: initialSets,
      variant: hasVariations ? variant : 'both',
    };

    soundManager.playClickPop();
    onAddExercise(newEx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3.5 pb-20 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <Dumbbell className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">Add New Exercise</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-zinc-400">Quick Select from Popular Exercises:</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {POPULAR_EXERCISES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                  name === t.name
                    ? 'bg-[#d4b26f] text-black font-black'
                    : 'border border-white/10 bg-[#181822] text-zinc-300 hover:border-[#d4b26f]/40'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {hasVariations && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Session Assignment</label>
                <span className="text-[10px] text-[#eed891]">Weights carry over if Shared</span>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVariant('both')}
                  className={`rounded-xl py-2 px-1 text-xs font-bold transition flex flex-col items-center gap-0.5 touch-manipulation cursor-pointer ${
                    variant === 'both'
                      ? 'bg-[#d4b26f] text-black shadow-md font-black'
                      : 'border border-white/10 bg-[#181822] text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <span>Both Sessions</span>
                  <span className="text-[10px] opacity-75 font-normal">Shared</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('session1')}
                  className={`rounded-xl py-2 px-1 text-xs font-bold transition flex flex-col items-center gap-0.5 touch-manipulation cursor-pointer ${
                    variant === 'session1'
                      ? 'bg-[#d4b26f] text-black shadow-md font-black'
                      : 'border border-white/10 bg-[#181822] text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <span>Session 1</span>
                  <span className="text-[10px] opacity-75 font-normal truncate max-w-full">
                    {session1Label?.split(' ')[0] || 'Sun/Mon'} Only
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setVariant('session2')}
                  className={`rounded-xl py-2 px-1 text-xs font-bold transition flex flex-col items-center gap-0.5 touch-manipulation cursor-pointer ${
                    variant === 'session2'
                      ? 'bg-[#d4b26f] text-black shadow-md font-black'
                      : 'border border-white/10 bg-[#181822] text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <span>Session 2</span>
                  <span className="text-[10px] opacity-75 font-normal truncate max-w-full">
                    {session2Label?.split(' ')[0] || 'Wed/Thu'} Only
                  </span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-300">Exercise Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Bench Press"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-medium text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Target Muscle Group</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exercise['category'])}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-medium text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="legs">Legs</option>
                <option value="core">Core / Abs</option>
                <option value="cardio">Cardio / Calisthenics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Default Weight ({defaultWeightUnit})</label>
              <input
                type="number"
                step="0.5"
                value={defaultWeight}
                onChange={(e) => setDefaultWeight(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Sets Count</label>
              <input
                type="number"
                min="1"
                max="10"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value) || 3)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Target Reps</label>
              <input
                type="number"
                min="1"
                max="50"
                value={targetReps}
                onChange={(e) => setTargetReps(parseInt(e.target.value) || 10)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">
              Form &amp; Technique Cue (Permanent Across Workouts)
            </label>
            <input
              type="text"
              value={cues}
              onChange={(e) => setCues(e.target.value)}
              placeholder="e.g. Medium overhand grip, 2-sec eccentric tempo, full stretch"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">
              Today&apos;s Session Note (Optional — resets on workout save)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Did exercise badly, work on better control next time"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-[#1e1e28] py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] py-3 text-sm font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add to Workout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
