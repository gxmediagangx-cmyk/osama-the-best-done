'use client';

import React, { useState } from 'react';
import { X, Swords, User, Users, Trash2 } from 'lucide-react';
import { BoxingMode, BoxingWorkout } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface BoxingWorkoutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWorkout?: BoxingWorkout | null;
  onSaveWorkout: (workout: BoxingWorkout) => void;
  onDeleteWorkout?: (workoutId: string) => void;
}

export const BoxingWorkoutEditorModal: React.FC<BoxingWorkoutEditorModalProps> = ({
  isOpen,
  onClose,
  initialWorkout,
  onSaveWorkout,
  onDeleteWorkout,
}) => {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [description, setDescription] = useState(initialWorkout?.description || '');
  const [mode, setMode] = useState<BoxingMode>(initialWorkout?.mode || 'solo');
  const [defaultRoundSeconds, setDefaultRoundSeconds] = useState(
    initialWorkout?.defaultRoundSeconds || 180
  );
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(
    initialWorkout?.defaultRestSeconds || 60
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: BoxingWorkout = {
      id: initialWorkout?.id || `boxing-routine-${Date.now()}`,
      name: name.trim(),
      description:
        description.trim() ||
        (mode === 'partner'
          ? 'Custom partner boxing session with mitts, counter drills, and sparring.'
          : 'Custom solo boxing workout with shadowboxing, bag rounds, and conditioning.'),
      mode,
      defaultRoundSeconds,
      defaultRestSeconds,
      drills:
        initialWorkout?.drills || [
          {
            id: `bdrill-init-${Date.now()}`,
            name:
              mode === 'partner'
                ? 'Pad / Mitt Combinations (1-2-3-2)'
                : 'Shadowboxing & Footwork Warmup',
            category: mode === 'partner' ? 'padwork' : 'shadowboxing',
            mode,
            roundDurationSeconds: defaultRoundSeconds,
            restSeconds: defaultRestSeconds,
            intensity: 'technical',
            comboOrCues: '1-2-Slip-2-3-2 | Focus on crisp form and balance',
            rounds: [
              {
                id: `br-init-1-${Date.now()}`,
                roundNumber: 1,
                durationSeconds: defaultRoundSeconds,
                restSeconds: defaultRestSeconds,
                completed: false,
              },
              {
                id: `br-init-2-${Date.now()}`,
                roundNumber: 2,
                durationSeconds: defaultRoundSeconds,
                restSeconds: defaultRestSeconds,
                completed: false,
              },
              {
                id: `br-init-3-${Date.now()}`,
                roundNumber: 3,
                durationSeconds: defaultRoundSeconds,
                restSeconds: defaultRestSeconds,
                completed: false,
              },
            ],
          },
        ],
    };

    soundManager.playClickPop();
    onSaveWorkout(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <Swords className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {initialWorkout ? 'Edit Boxing Routine' : 'Create Custom Boxing Routine'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Routine Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Night Sparring & Pads or Solo Bag Burnout"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base font-medium text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Primary Session Mode</label>
            <div className="mt-1 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                  mode === 'solo'
                    ? 'border-[#d4b26f] bg-[#d4b26f]/15 text-[#eed891]'
                    : 'border-white/10 bg-zinc-950 text-zinc-400'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Solo (No Partner)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('partner')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                  mode === 'partner'
                    ? 'border-[#d4b26f] bg-[#d4b26f]/15 text-[#eed891]'
                    : 'border-white/10 bg-zinc-950 text-zinc-400'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>With Partner</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Description / Focus</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High-volume combinations, head movement, and footwork"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Default Round Duration</label>
              <select
                value={defaultRoundSeconds}
                onChange={(e) => setDefaultRoundSeconds(parseInt(e.target.value) || 180)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value={120}>2:00 Mins (Amateur)</option>
                <option value={180}>3:00 Mins (Pro Standard)</option>
                <option value={240}>4:00 Mins (Endurance)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Default Corner Rest</label>
              <select
                value={defaultRestSeconds}
                onChange={(e) => setDefaultRestSeconds(parseInt(e.target.value) || 60)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              >
                <option value={30}>30 Seconds</option>
                <option value={45}>45 Seconds</option>
                <option value={60}>60 Seconds (Pro)</option>
                <option value={90}>90 Seconds</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10">
            {initialWorkout && onDeleteWorkout ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteWorkout(initialWorkout.id);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#d4b26f] px-5 py-2.5 text-sm font-black uppercase text-black hover:bg-[#e2c487]"
              >
                Save Routine
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
