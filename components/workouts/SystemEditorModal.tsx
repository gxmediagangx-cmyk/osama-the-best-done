'use client';

import React, { useState } from 'react';
import { X, Plus, Layers, Trash2, ArrowUp, ArrowDown, Pencil, Check } from 'lucide-react';
import { WorkoutDay, WorkoutSystem } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface SystemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: WorkoutSystem;
  onSaveSystem: (updated: WorkoutSystem) => void;
  onDeleteSystem?: (systemId: string) => void;
}

export const SystemEditorModal: React.FC<SystemEditorModalProps> = ({
  isOpen,
  onClose,
  system,
  onSaveSystem,
  onDeleteSystem,
}) => {
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description);
  const [days, setDays] = useState<WorkoutDay[]>(system.days);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (day: WorkoutDay) => {
    setEditingDayId(day.id);
    setEditingDayTitle(day.title);
  };

  const handleSaveRenameDay = (dayId: string) => {
    if (!editingDayTitle.trim()) {
      setEditingDayId(null);
      return;
    }
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, title: editingDayTitle.trim() } : d))
    );
    setEditingDayId(null);
    soundManager.playClickPop();
  };

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;

    const newDay: WorkoutDay = {
      id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newDayTitle.trim(),
      order: days.length + 1,
      exercises: [],
    };

    setDays([...days, newDay]);
    setNewDayTitle('');
    soundManager.playClickPop();
  };

  const handleMoveDay = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= days.length) return;
    const next = [...days];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    setDays(next.map((d, i) => ({ ...d, order: i + 1 })));
    soundManager.playClickPop();
  };

  const handleDeleteDay = (dayId: string) => {
    if (days.length <= 1) return;
    setDays(days.filter((d) => d.id !== dayId));
    soundManager.playClickPop();
  };

  const handleToggleVariations = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const willEnable = !d.hasVariations;
        return {
          ...d,
          hasVariations: willEnable,
          session1Label: d.session1Label || 'Session 1 (Sunday)',
          session2Label: d.session2Label || 'Session 2 (Wednesday)',
        };
      })
    );
    soundManager.playClickPop();
  };

  const handleUpdateDayLabels = (dayId: string, s1: string, s2: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, session1Label: s1, session2Label: s2 } : d))
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSaveSystem({
      ...system,
      name: name.trim(),
      description: description.trim(),
      days,
    });
    soundManager.playClickPop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3.5 pb-16 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white max-h-[88vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">Edit Workout Split</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">System / Program Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm sm:text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Goal / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 4-day split for muscle aesthetics & clean hypertrophy"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          {/* Days In This System */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Days in this Split ({days.length})</label>
            <div className="mt-2 space-y-2">
              {days.map((d, idx) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-white/[0.08] bg-[#181822] p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    {editingDayId === d.id ? (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#121217] font-mono text-xs font-bold text-[#d4b26f]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={editingDayTitle}
                          onChange={(e) => setEditingDayTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveRenameDay(d.id);
                            } else if (e.key === 'Escape') {
                              setEditingDayId(null);
                            }
                          }}
                          autoFocus
                          placeholder="Day title..."
                          className="flex-1 rounded-lg border border-[#d4b26f] bg-zinc-950 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRenameDay(d.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4b26f] text-black hover:bg-[#e2c487] transition active:scale-95"
                          title="Save name"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDayId(null)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#121217] font-mono text-xs font-bold text-[#d4b26f]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-white truncate">{d.title}</h4>
                            {d.hasVariations && (
                              <span className="rounded bg-[#d4b26f]/15 border border-[#d4b26f]/30 px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#eed891]">
                                2x Split
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartRename(d)}
                              className="p-1 text-zinc-400 hover:text-[#eed891] hover:bg-white/5 rounded transition"
                              title="Rename day"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-400">{d.exercises.length} exercises configured</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      {editingDayId !== d.id && (
                        <button
                          type="button"
                          onClick={() => handleStartRename(d)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#eed891] hover:border-[#d4b26f]/40 transition"
                          title="Rename day"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {days.length > 1 && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveDay(idx, 'up')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none"
                            title="Move day up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === days.length - 1}
                            onClick={() => handleMoveDay(idx, 'down')}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#121217] text-zinc-300 hover:text-[#d4b26f] disabled:opacity-25 disabled:pointer-events-none"
                            title="Move day down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDay(d.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2x Weekly Variations Control */}
                  <div className="pt-2 border-t border-white/[0.05] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300 font-medium">
                        2x Weekly Variations (Swap Exercises)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleVariations(d.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer touch-manipulation ${
                          d.hasVariations
                            ? 'bg-[#d4b26f] text-black shadow-sm font-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d.hasVariations ? 'Enabled (2x Split)' : 'Disabled (1x)'}
                      </button>
                    </div>

                    {d.hasVariations && (
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                            Session 1 Label
                          </label>
                          <input
                            type="text"
                            value={d.session1Label || 'Session 1 (Sunday)'}
                            onChange={(e) =>
                              handleUpdateDayLabels(
                                d.id,
                                e.target.value,
                                d.session2Label || 'Session 2 (Wednesday)'
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                            Session 2 Label
                          </label>
                          <input
                            type="text"
                            value={d.session2Label || 'Session 2 (Wednesday)'}
                            onChange={(e) =>
                              handleUpdateDayLabels(
                                d.id,
                                d.session1Label || 'Session 1 (Sunday)',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Day Form */}
            <form onSubmit={handleAddDay} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newDayTitle}
                onChange={(e) => setNewDayTitle(e.target.value)}
                placeholder="e.g. Day 5: Weakpoints & Arms"
                className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-[#181822] border border-[#d4b26f]/40 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#eed891] hover:bg-zinc-800 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#d4b26f]" />
                <span>Add Day</span>
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-between pt-3 border-t border-white/10">
            {onDeleteSystem && (
              <button
                onClick={() => {
                  onDeleteSystem(system.id);
                  onClose();
                }}
                className="text-xs sm:text-sm font-medium text-rose-400 hover:underline"
              >
                Delete Split
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-[#d4b26f] px-5 py-2.5 text-xs sm:text-sm font-black uppercase text-black hover:bg-[#e2c487] shadow-md"
              >
                Save Split
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
