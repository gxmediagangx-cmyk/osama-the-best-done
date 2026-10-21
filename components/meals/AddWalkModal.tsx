'use client';

import React, { useState } from 'react';
import { X, Footprints, Plus } from 'lucide-react';
import { WalkingSession } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface AddWalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWalk: (walk: WalkingSession) => void;
}

export const AddWalkModal: React.FC<AddWalkModalProps> = ({
  isOpen,
  onClose,
  onAddWalk,
}) => {
  const [label, setLabel] = useState('Morning Fasted Walk');
  const [time, setTime] = useState('08:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [steps, setSteps] = useState(3000);
  const [distanceKm, setDistanceKm] = useState(2.2);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Auto calculate estimated distance if steps change
  const handleStepsChange = (s: number) => {
    setSteps(s);
    setDistanceKm(Number(((s * 0.75) / 1000).toFixed(1)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newWalk: WalkingSession = {
      id: `walk-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time,
      label: label.trim() || 'Outdoor Walk',
      durationMinutes,
      steps,
      distanceKm,
      notes: notes.trim() || undefined,
    };

    soundManager.playClickPop();
    onAddWalk(newWalk);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3.5 pb-16 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white max-h-[88vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <Footprints className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">Log Walk / Cardio</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Morning Fasted Walk', 'Post-Lunch Digestion Walk', 'Evening Stroll', 'Treadmill Incline Walk'].map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setLabel(lbl)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                label === lbl
                  ? 'bg-[#d4b26f] text-black font-black'
                  : 'border border-white/10 bg-[#181822] text-zinc-300'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Session Name</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm sm:text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-zinc-300">Time of Day</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 07:45 AM"
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-zinc-300">Duration (Min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 20)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-zinc-300">Steps Count</label>
              <input
                type="number"
                step="100"
                value={steps}
                onChange={(e) => handleStepsChange(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-semibold text-zinc-300">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4b26f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sunny morning, felt refreshed."
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 py-3 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#d4b26f] py-3 text-xs sm:text-sm font-black uppercase text-black hover:bg-[#e2c487] shadow-md"
            >
              Save Walk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
