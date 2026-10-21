'use client';

import React, { useState } from 'react';
import { X, Plus, UtensilsCrossed } from 'lucide-react';
import { FoodItem, Meal } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (newMeal: Meal) => void;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
}) => {
  const [mealName, setMealName] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [firstFoodName, setFirstFoodName] = useState('');
  const [portion, setPortion] = useState('150g');
  const [protein, setProtein] = useState(30);
  const [carbs, setCarbs] = useState(40);
  const [fats, setFats] = useState(10);
  const [calories, setCalories] = useState(370);

  if (!isOpen) return null;

  // Auto calculate calories if macros change
  const handleMacroChange = (p: number, c: number, f: number) => {
    setProtein(p);
    setCarbs(c);
    setFats(f);
    setCalories(p * 4 + c * 4 + f * 9);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const foods: FoodItem[] = [];
    if (firstFoodName.trim()) {
      foods.push({
        id: `food-${Date.now()}`,
        name: firstFoodName.trim(),
        portion: portion.trim() || '1 serving',
        protein,
        carbs,
        fats,
        calories: calories || (protein * 4 + carbs * 4 + fats * 9),
        consumed: false,
      });
    }

    const newMeal: Meal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: mealName.trim(),
      scheduledTime,
      order: 99,
      foods,
    };

    soundManager.playClickPop();
    onAddMeal(newMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-3.5 pb-16 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#14141a] p-5 shadow-2xl text-white max-h-[88vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">Add Meal Time</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Meal Name / Title *</label>
            <input
              type="text"
              required
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g. Pre-Workout Lunch or Post-Workout Dinner"
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm sm:text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-zinc-300">Scheduled Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm sm:text-base text-white focus:border-[#d4b26f] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/10">
            <span className="text-xs sm:text-sm font-bold text-[#d4b26f]">Initial Food Item (Optional)</span>

            <div className="mt-2.5 space-y-2.5">
              <div>
                <label className="text-xs text-zinc-400">Food Name</label>
                <input
                  type="text"
                  value={firstFoodName}
                  onChange={(e) => setFirstFoodName(e.target.value)}
                  placeholder="e.g. Grilled Chicken & White Rice"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Portion / Grams</label>
                <input
                  type="text"
                  value={portion}
                  onChange={(e) => setPortion(e.target.value)}
                  placeholder="e.g. 180g chicken + 1 cup rice"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-zinc-400">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => handleMacroChange(parseFloat(e.target.value) || 0, carbs, fats)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => handleMacroChange(protein, parseFloat(e.target.value) || 0, fats)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => handleMacroChange(protein, carbs, parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-center font-mono text-sm font-bold text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-center font-mono text-sm font-bold text-[#eed891] focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
              </div>
            </div>
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
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
