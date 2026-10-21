'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  MealSystem,
  Meal,
  MealOption,
  FoodItem,
  SupplementItem,
  WalkingSession,
  AppSettings,
  CompletedNutritionLog,
} from '@/lib/types';
import { AddWalkModal } from './AddWalkModal';
import {
  UtensilsCrossed,
  Footprints,
  Plus,
  Check,
  Trash2,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Droplets,
  Egg,
  Soup,
  Drumstick,
  Beef,
  Fish,
  Apple,
  CupSoda,
  Salad,
  Sandwich,
  Calendar,
  Pencil,
  X,
  Trophy,
  Sparkles,
  Copy,
  RotateCcw,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { formatSafeNumber } from '@/lib/utils';
import { soundManager } from '@/lib/sound';
import { getTodayDateKey, formatReadableDateKey, generateNutritionReportText } from '@/lib/export-ai';
import { DEFAULT_MEAL_SYSTEMS } from '@/lib/default-meals';

interface MealSystemViewProps {
  mealSystems: MealSystem[];
  walkingSessions: WalkingSession[];
  nutritionLogs?: CompletedNutritionLog[];
  settings: AppSettings;
  onUpdateMealSystems: (updated: MealSystem[]) => void;
  onUpdateWalkingSessions: (updated: WalkingSession[]) => void;
  onSaveNutritionLog?: (log: CompletedNutritionLog) => void;
  onDeleteNutritionLog?: (logId: string) => void;
}

const FOOD_ICON_OPTIONS: {
  id: NonNullable<FoodItem['icon']>;
  label: string;
}[] = [
  { id: 'egg', label: 'Eggs' },
  { id: 'bowl', label: 'Bowl / Oats / Rice' },
  { id: 'chicken', label: 'Chicken / Poultry' },
  { id: 'meat', label: 'Steak / Beef' },
  { id: 'fish', label: 'Fish / Seafood' },
  { id: 'fruit', label: 'Fruit / Carbs' },
  { id: 'shake', label: 'Shake / Drink' },
  { id: 'salad', label: 'Greens / Veggies' },
  { id: 'bread', label: 'Bread / Wrap' },
];

function guessFoodIcon(name: string, explicitIcon?: FoodItem['icon']): NonNullable<FoodItem['icon']> {
  if (explicitIcon) return explicitIcon;
  const lower = name.toLowerCase();
  if (lower.includes('egg') || lower.includes('omelet')) return 'egg';
  if (lower.includes('chicken') || lower.includes('turkey')) return 'chicken';
  if (lower.includes('beef') || lower.includes('steak') || lower.includes('meat')) return 'meat';
  if (lower.includes('salmon') || lower.includes('tuna') || lower.includes('fish')) return 'fish';
  if (lower.includes('whey') || lower.includes('shake') || lower.includes('coffee') || lower.includes('milk')) return 'shake';
  if (lower.includes('banana') || lower.includes('berry') || lower.includes('apple') || lower.includes('fruit')) return 'fruit';
  if (lower.includes('salad') || lower.includes('veggie') || lower.includes('avocado') || lower.includes('potato')) return 'salad';
  if (lower.includes('bread') || lower.includes('toast') || lower.includes('cake')) return 'bread';
  return 'bowl';
}

function FoodCategoryIcon({
  iconType,
  className = 'w-4 h-4',
}: {
  iconType: NonNullable<FoodItem['icon']>;
  className?: string;
}) {
  switch (iconType) {
    case 'egg':
      return <Egg className={className} />;
    case 'chicken':
      return <Drumstick className={className} />;
    case 'meat':
      return <Beef className={className} />;
    case 'fish':
      return <Fish className={className} />;
    case 'fruit':
      return <Apple className={className} />;
    case 'shake':
      return <CupSoda className={className} />;
    case 'salad':
      return <Salad className={className} />;
    case 'bread':
      return <Sandwich className={className} />;
    case 'bowl':
    default:
      return <Soup className={className} />;
  }
}

function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '08:00 AM';
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    if (!isNaN(h)) {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${String(h12).padStart(2, '0')}:${m} ${suffix}`;
    }
  }
  return timeStr;
}

function toTimeInputValue(timeStr: string): string {
  if (!timeStr) return '08:00';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '08:00';
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

export const MealSystemView: React.FC<MealSystemViewProps> = ({
  mealSystems,
  walkingSessions,
  nutritionLogs = [],
  settings,
  onUpdateMealSystems,
  onUpdateWalkingSessions,
  onSaveNutritionLog,
  onDeleteNutritionLog,
}) => {
  const currentSystem = mealSystems.find((s) => s.isCurrent) || mealSystems[0] || null;

  // Top mode: Nutrition vs Walking
  const [sectionTab, setSectionTab] = useState<'nutrition' | 'walking'>('nutrition');
  // Sub-view inside Nutrition matching the screenshot: Today | Routine | History
  const [nutritionSubTab, setNutritionSubTab] = useState<'today' | 'routine' | 'history'>('today');
  const [savedToast, setSavedToast] = useState(false);
  const [copiedNutritionToast, setCopiedNutritionToast] = useState(false);

  // Full Meal Editor Sheet / Screen state (matches the 3rd & 4th phone screens in the user's screenshot)
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    mealId?: string;
    name: string;
    scheduledTime: string;
    foods: FoodItem[];
    notes: string;
  } | null>(null);

  // Inline new food row inside the editor or quick add
  const [isAddingFoodInEditor, setIsAddingFoodInEditor] = useState(false);
  const [draftFoodName, setDraftFoodName] = useState('');
  const [draftFoodPortion, setDraftFoodPortion] = useState('');
  const [draftFoodIcon, setDraftFoodIcon] = useState<NonNullable<FoodItem['icon']>>('egg');

  // Supplement adder state
  const [isAddingSupplement, setIsAddingSupplement] = useState(false);
  const [newSupplementName, setNewSupplementName] = useState('');

  // Custom Off-Menu Meal Modal state
  const [customMealModal, setCustomMealModal] = useState<{
    isOpen: boolean;
    mealId: string;
    mealName: string;
    optionTitle: string;
    foodName: string;
    portion: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  } | null>(null);

  // Full Meal Option Editor Modal State (Add brand-new option or edit an existing option)
  const [optionEditorModal, setOptionEditorModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    mealId: string;
    mealName: string;
    optionId?: string;
    title: string;
    foods: {
      id: string;
      name: string;
      portion: string;
      icon: NonNullable<FoodItem['icon']>;
      protein: number;
      carbs: number;
      fats: number;
      calories: number;
    }[];
  } | null>(null);

  // Draft food row inside Option Editor Modal
  const [optDraftFoodName, setOptDraftFoodName] = useState('');
  const [optDraftFoodPortion, setOptDraftFoodPortion] = useState('');
  const [optDraftFoodIcon, setOptDraftFoodIcon] = useState<NonNullable<FoodItem['icon']>>('bowl');
  const [optDraftProtein, setOptDraftProtein] = useState('');
  const [optDraftCarbs, setOptDraftCarbs] = useState('');
  const [optDraftFats, setOptDraftFats] = useState('');
  const [optDraftCalories, setOptDraftCalories] = useState('');

  // Delete Option Confirmation Modal State
  const [deleteOptionConfirm, setDeleteOptionConfirm] = useState<{
    mealId: string;
    optionId: string;
    optionTitle: string;
  } | null>(null);

  // Quick inline food adder for active option in a meal
  const [quickAddFoodMealId, setQuickAddFoodMealId] = useState<string | null>(null);
  const [quickFoodName, setQuickFoodName] = useState('');
  const [quickFoodPortion, setQuickFoodPortion] = useState('');
  const [quickFoodCalories, setQuickFoodCalories] = useState('');
  const [quickFoodProtein, setQuickFoodProtein] = useState('');

  // Accordion drawer state for alternative replacement options per meal
  const [expandedReplacements, setExpandedReplacements] = useState<Record<string, boolean>>({});

  // Quick inline manual note editor per meal
  const [editingMealNoteId, setEditingMealNoteId] = useState<string | null>(null);
  const [draftMealNoteText, setDraftMealNoteText] = useState('');

  // Walk modal state
  const [isAddWalkOpen, setIsAddWalkOpen] = useState(false);

  if (!currentSystem) {
    return <div className="p-8 text-center text-zinc-500">No nutrition routine found.</div>;
  }

  const waterTarget = currentSystem.waterTarget || 8;
  const waterCount = Math.min(waterTarget, Math.max(0, currentSystem.waterCount ?? 6));
  const supplements: SupplementItem[] = currentSystem.supplements || [
    { id: 'sup-1', name: 'Creatine 5g', taken: true },
    { id: 'sup-2', name: 'Multivitamin', taken: false },
  ];

  const updateCurrentSystem = (updater: (sys: MealSystem) => MealSystem) => {
    const updatedSystems = mealSystems.map((s) =>
      s.id === currentSystem.id ? updater(s) : s
    );
    onUpdateMealSystems(updatedSystems);
  };

  // Toggle drawer for replacements
  const toggleReplacementsDrawer = (mealId: string) => {
    soundManager.playClickPop();
    setExpandedReplacements((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  // Quick manual note editing for meals
  const handleStartEditMealNote = (mealId: string, currentNotes?: string) => {
    soundManager.playClickPop();
    setEditingMealNoteId(mealId);
    setDraftMealNoteText(currentNotes || '');
  };

  const handleSaveMealNote = (mealId: string, newNotes: string) => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) =>
        m.id === mealId ? { ...m, notes: newNotes.trim() || undefined } : m
      ),
    }));
    setEditingMealNoteId(null);
  };

  // Switch active eating routine (Morning Training vs Evening Training)
  const handleSwitchRoutine = (targetId: string) => {
    soundManager.playClickPop();
    const updated = mealSystems.map((s) => ({
      ...s,
      isCurrent: s.id === targetId,
    }));
    onUpdateMealSystems(updated);
  };

  // Select a replacement option for a meal
  const handleSelectOption = (mealId: string, optionId: string) => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) => {
        if (m.id !== mealId) return m;
        const opt = m.options?.find((o) => o.id === optionId);
        if (!opt) return m;
        const isMealConsumed = m.consumed || (m.foods.length > 0 && m.foods.every((f) => f.consumed));
        return {
          ...m,
          selectedOptionId: optionId,
          foods: opt.foods.map((f) => ({
            ...f,
            consumed: isMealConsumed,
          })),
        };
      }),
    }));
  };

  // Save custom off-menu meal option and immediately select it
  const handleSaveCustomMealOption = () => {
    if (!customMealModal || !customMealModal.foodName.trim()) return;
    soundManager.playOverloadLevelUp();

    const cal = parseInt(customMealModal.calories, 10) || 0;
    const pro = parseInt(customMealModal.protein, 10) || 0;
    const carb = parseInt(customMealModal.carbs, 10) || 0;
    const fat = parseInt(customMealModal.fats, 10) || 0;
    const foodName = customMealModal.foodName.trim();
    const portion = customMealModal.portion.trim() || '1 serving';
    const optTitle =
      customMealModal.optionTitle.trim() ||
      `Custom: ${foodName}${portion ? ` (${portion})` : ''}`;

    const newOptId = `opt-custom-${Date.now()}`;
    const customFood: FoodItem = {
      id: `f-custom-${Date.now()}`,
      name: foodName,
      portion,
      icon: guessFoodIcon(foodName),
      protein: pro,
      carbs: carb,
      fats: fat,
      calories: cal,
      consumed: true,
    };

    const newOption: MealOption = {
      id: newOptId,
      title: optTitle,
      foods: [customFood],
      isCustom: true,
    };

    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) => {
        if (m.id !== customMealModal.mealId) return m;
        const existing = m.options || [];
        return {
          ...m,
          consumed: true,
          selectedOptionId: newOptId,
          options: [...existing, newOption],
          foods: [customFood],
        };
      }),
    }));

    setCustomMealModal(null);
  };

  // Open modal to add a brand-new alternative option to a meal
  const handleOpenAddOption = (meal: Meal) => {
    soundManager.playClickPop();
    const existingOptions =
      meal.options && meal.options.length > 0
        ? meal.options
        : [
            {
              id: `opt-std-${meal.id}`,
              title: `Standard: ${meal.foods.map((f) => f.name).join(' + ') || meal.name}`,
              foods: meal.foods,
            },
          ];
    const nextIdx = existingOptions.length + 1;

    setOptionEditorModal({
      isOpen: true,
      mode: 'add',
      mealId: meal.id,
      mealName: meal.name,
      title: `Option ${nextIdx}: `,
      foods: [
        {
          id: `f-${Date.now()}-1`,
          name: '',
          portion: '',
          icon: 'egg',
          protein: 0,
          carbs: 0,
          fats: 0,
          calories: 0,
        },
      ],
    });
    setOptDraftFoodName('');
    setOptDraftFoodPortion('');
    setOptDraftProtein('');
    setOptDraftCarbs('');
    setOptDraftFats('');
    setOptDraftCalories('');
    setOptDraftFoodIcon('bowl');
  };

  // Open modal to edit an existing option of a meal
  const handleOpenEditOption = (meal: Meal, option: MealOption) => {
    soundManager.playClickPop();
    setOptionEditorModal({
      isOpen: true,
      mode: 'edit',
      mealId: meal.id,
      mealName: meal.name,
      optionId: option.id,
      title: option.title,
      foods: option.foods.map((f) => ({
        id: f.id,
        name: f.name,
        portion: f.portion,
        icon: f.icon || guessFoodIcon(f.name),
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fats: f.fats || 0,
        calories: f.calories || 0,
      })),
    });
    setOptDraftFoodName('');
    setOptDraftFoodPortion('');
    setOptDraftProtein('');
    setOptDraftCarbs('');
    setOptDraftFats('');
    setOptDraftCalories('');
    setOptDraftFoodIcon('bowl');
  };

  // Save the Option modal (either adding or editing an option)
  const handleSaveOptionModal = () => {
    if (!optionEditorModal || !optionEditorModal.title.trim()) return;

    // Filter valid foods
    const foodsList = optionEditorModal.foods.filter((f) => f.name.trim().length > 0);

    // If user has a pending draft food row typed in, include it
    if (optDraftFoodName.trim()) {
      const pro = parseInt(optDraftProtein, 10) || 0;
      const carb = parseInt(optDraftCarbs, 10) || 0;
      const fat = parseInt(optDraftFats, 10) || 0;
      const cal = parseInt(optDraftCalories, 10) || (pro * 4 + carb * 4 + fat * 9);
      foodsList.push({
        id: `f-${Date.now()}`,
        name: optDraftFoodName.trim(),
        portion: optDraftFoodPortion.trim() || '1 serving',
        icon: optDraftFoodIcon,
        protein: pro,
        carbs: carb,
        fats: fat,
        calories: cal,
      });
    }

    if (foodsList.length === 0) {
      foodsList.push({
        id: `f-${Date.now()}`,
        name: optionEditorModal.title.trim(),
        portion: '1 serving',
        icon: guessFoodIcon(optionEditorModal.title),
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      });
    }

    const title = optionEditorModal.title.trim();
    const targetMealId = optionEditorModal.mealId;

    if (optionEditorModal.mode === 'add') {
      soundManager.playOverloadLevelUp();
      const newOptionId = `opt-${Date.now()}`;
      const newOption: MealOption = {
        id: newOptionId,
        title,
        foods: foodsList.map((f) => ({
          ...f,
          consumed: false,
        })),
        isCustom: true,
      };

      updateCurrentSystem((sys) => ({
        ...sys,
        meals: sys.meals.map((m) => {
          if (m.id !== targetMealId) return m;
          const currentOptions =
            m.options && m.options.length > 0
              ? m.options
              : [
                  {
                    id: `opt-std-${m.id}`,
                    title: `Standard: ${m.foods.map((f) => f.name).join(' + ') || m.name}`,
                    foods: m.foods,
                  },
                ];
          return {
            ...m,
            selectedOptionId: newOptionId,
            options: [...currentOptions, newOption],
            foods: newOption.foods,
          };
        }),
      }));
    } else if (optionEditorModal.mode === 'edit' && optionEditorModal.optionId) {
      soundManager.playClickPop();
      const targetOptId = optionEditorModal.optionId;

      updateCurrentSystem((sys) => ({
        ...sys,
        meals: sys.meals.map((m) => {
          if (m.id !== targetMealId) return m;
          const currentOptions =
            m.options && m.options.length > 0
              ? m.options
              : [
                  {
                    id: `opt-std-${m.id}`,
                    title: `Standard: ${m.foods.map((f) => f.name).join(' + ') || m.name}`,
                    foods: m.foods,
                  },
                ];

          const updatedOptions = currentOptions.map((opt) => {
            if (opt.id !== targetOptId) return opt;
            return {
              ...opt,
              title,
              foods: foodsList.map((f, idx) => {
                const existingFood = opt.foods.find((ef) => ef.id === f.id) || opt.foods[idx];
                return {
                  ...f,
                  consumed: existingFood ? existingFood.consumed : false,
                };
              }),
            };
          });

          // If this option is currently active, update meal.foods
          const isActive = (m.selectedOptionId || currentOptions[0]?.id) === targetOptId;
          const updatedActiveOpt = updatedOptions.find((o) => o.id === targetOptId);

          return {
            ...m,
            options: updatedOptions,
            foods: isActive && updatedActiveOpt ? updatedActiveOpt.foods : m.foods,
          };
        }),
      }));
    }

    setOptionEditorModal(null);
  };

  // Open confirmation to delete an option
  const handlePromptDeleteOption = (mealId: string, optionId: string, optionTitle: string) => {
    soundManager.playClickPop();
    setDeleteOptionConfirm({
      mealId,
      optionId,
      optionTitle,
    });
  };

  // Execute deletion of an option
  const handleConfirmDeleteOption = () => {
    if (!deleteOptionConfirm) return;
    const { mealId, optionId } = deleteOptionConfirm;
    soundManager.playClickPop();

    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) => {
        if (m.id !== mealId) return m;
        const currentOptions =
          m.options && m.options.length > 0
            ? m.options
            : [
                {
                  id: `opt-std-${m.id}`,
                  title: `Standard: ${m.foods.map((f) => f.name).join(' + ') || m.name}`,
                  foods: m.foods,
                },
              ];

        // Safeguard: Do not delete if only 1 option exists
        if (currentOptions.length <= 1) {
          return m;
        }

        const remainingOptions = currentOptions.filter((o) => o.id !== optionId);
        let nextSelectedId = m.selectedOptionId;
        let nextFoods = m.foods;

        // If active option was deleted, switch to the first remaining option
        if (m.selectedOptionId === optionId || !remainingOptions.some((o) => o.id === m.selectedOptionId)) {
          nextSelectedId = remainingOptions[0].id;
          nextFoods = remainingOptions[0].foods.map((f) => ({ ...f, consumed: false }));
        }

        return {
          ...m,
          selectedOptionId: nextSelectedId,
          options: remainingOptions,
          foods: nextFoods,
        };
      }),
    }));

    setDeleteOptionConfirm(null);
  };

  // Delete a specific food item from the active option & meal
  const handleDeleteFoodFromActiveOption = (mealId: string, foodId: string) => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) => {
        if (m.id !== mealId) return m;
        const updatedFoods = m.foods.filter((f) => f.id !== foodId);

        // Also update the active option's foods array if options exist
        const activeOptId = m.selectedOptionId || (m.options && m.options[0]?.id);
        const updatedOptions = m.options?.map((opt) => {
          if (opt.id === activeOptId) {
            return {
              ...opt,
              foods: opt.foods.filter((f) => f.id !== foodId),
            };
          }
          return opt;
        });

        return {
          ...m,
          foods: updatedFoods,
          options: updatedOptions || m.options,
        };
      }),
    }));
  };

  // Quick add food item to the active option & meal
  const handleQuickAddFoodToActiveOption = (mealId: string) => {
    if (!quickFoodName.trim()) return;
    soundManager.playClickPop();

    const cal = parseInt(quickFoodCalories, 10) || 0;
    const pro = parseInt(quickFoodProtein, 10) || 0;
    const newFood: FoodItem = {
      id: `f-${Date.now()}`,
      name: quickFoodName.trim(),
      portion: quickFoodPortion.trim() || '1 serving',
      icon: guessFoodIcon(quickFoodName),
      protein: pro,
      carbs: 0,
      fats: 0,
      calories: cal || pro * 4,
      consumed: false,
    };

    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) => {
        if (m.id !== mealId) return m;
        const updatedFoods = [...m.foods, newFood];

        const activeOptId = m.selectedOptionId || (m.options && m.options[0]?.id);
        const updatedOptions =
          m.options && m.options.length > 0
            ? m.options.map((opt) => {
                if (opt.id === activeOptId) {
                  return {
                    ...opt,
                    foods: [...opt.foods, newFood],
                  };
                }
                return opt;
              })
            : [
                {
                  id: `opt-std-${m.id}`,
                  title: m.name,
                  foods: updatedFoods,
                },
              ];

        return {
          ...m,
          foods: updatedFoods,
          options: updatedOptions,
        };
      }),
    }));

    setQuickFoodName('');
    setQuickFoodPortion('');
    setQuickFoodCalories('');
    setQuickFoodProtein('');
    setQuickAddFoodMealId(null);
  };

  // Toggle single food item consumed
  const handleToggleFood = (mealId: string, foodId: string) => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) =>
        m.id === mealId
          ? {
              ...m,
              foods: m.foods.map((f) =>
                f.id === foodId ? { ...f, consumed: !f.consumed } : f
              ),
            }
          : m
      ),
    }));
  };

  // Toggle entire meal completed
  const handleToggleEntireMeal = (meal: Meal) => {
    soundManager.playClickPop();
    const isAllDone = meal.consumed || (meal.foods.length > 0 && meal.foods.every((f) => f.consumed));
    const nextState = !isAllDone;
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.map((m) =>
        m.id === meal.id
          ? {
              ...m,
              consumed: nextState,
              foods: m.foods.map((f) => ({ ...f, consumed: nextState })),
            }
          : m
      ),
    }));
  };

  // Open Meal Editor (for existing meal or new meal)
  const openEditMeal = (meal: Meal) => {
    soundManager.playClickPop();
    setIsAddingFoodInEditor(false);
    setDraftFoodName('');
    setDraftFoodPortion('');
    setEditorState({
      isOpen: true,
      mode: 'edit',
      mealId: meal.id,
      name: meal.name,
      scheduledTime: formatDisplayTime(meal.scheduledTime),
      foods: meal.foods.map((f) => ({ ...f })),
      notes: meal.notes || '',
    });
  };

  const openAddMeal = () => {
    soundManager.playClickPop();
    const nextNum = currentSystem.meals.length + 1;
    setIsAddingFoodInEditor(false);
    setDraftFoodName('');
    setDraftFoodPortion('');
    setEditorState({
      isOpen: true,
      mode: 'add',
      name: `Meal ${nextNum}: `,
      scheduledTime: '08:00 AM',
      foods: [
        {
          id: `f-${Date.now()}-1`,
          name: 'Eggs',
          portion: '4 large',
          icon: 'egg',
          protein: 24,
          carbs: 2,
          fats: 20,
          calories: 280,
          consumed: false,
        },
      ],
      notes: '',
    });
  };

  const handleSaveEditorMeal = () => {
    if (!editorState || !editorState.name.trim()) return;
    soundManager.playClickPop();

    // If user typed a food in the draft input and didn't click "+ Add Food" yet, include it automatically
    const finalFoods = [...editorState.foods];
    if (draftFoodName.trim()) {
      finalFoods.push({
        id: `f-${Date.now()}`,
        name: draftFoodName.trim(),
        portion: draftFoodPortion.trim() || '1 serving',
        icon: draftFoodIcon,
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
        consumed: false,
      });
    }

    if (editorState.mode === 'edit' && editorState.mealId) {
      updateCurrentSystem((sys) => ({
        ...sys,
        meals: sys.meals.map((m) =>
          m.id === editorState.mealId
            ? {
                ...m,
                name: editorState.name.trim(),
                scheduledTime: formatDisplayTime(editorState.scheduledTime),
                foods: finalFoods,
                notes: editorState.notes.trim() || undefined,
              }
            : m
        ),
      }));
    } else {
      const newMeal: Meal = {
        id: `meal-${Date.now()}`,
        name: editorState.name.trim(),
        scheduledTime: formatDisplayTime(editorState.scheduledTime),
        order: currentSystem.meals.length + 1,
        foods: finalFoods,
        notes: editorState.notes.trim() || undefined,
      };
      updateCurrentSystem((sys) => ({
        ...sys,
        meals: [...sys.meals, newMeal],
      }));
    }

    setEditorState(null);
    setIsAddingFoodInEditor(false);
    setDraftFoodName('');
    setDraftFoodPortion('');
  };

  const handleDeleteMealFromEditor = (mealId: string) => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      meals: sys.meals.filter((m) => m.id !== mealId),
    }));
    setEditorState(null);
  };

  // Water glass click handler
  const handleSelectWaterGlass = (glassIndex: number) => {
    soundManager.playClickPop();
    // Clicking the current last filled glass decrements by 1; otherwise sets to glassIndex + 1
    const nextWater = waterCount === glassIndex + 1 ? glassIndex : glassIndex + 1;
    updateCurrentSystem((sys) => ({
      ...sys,
      waterCount: nextWater,
      waterTarget,
    }));
  };

  // Supplements handlers
  const handleToggleSupplement = (supId: string) => {
    soundManager.playClickPop();
    const nextSups = supplements.map((s) =>
      s.id === supId ? { ...s, taken: !s.taken } : s
    );
    updateCurrentSystem((sys) => ({
      ...sys,
      supplements: nextSups,
    }));
  };

  const handleAddSupplement = () => {
    if (!newSupplementName.trim()) return;
    soundManager.playClickPop();
    const nextSups: SupplementItem[] = [
      ...supplements,
      {
        id: `sup-${Date.now()}`,
        name: newSupplementName.trim(),
        taken: false,
      },
    ];
    updateCurrentSystem((sys) => ({
      ...sys,
      supplements: nextSups,
    }));
    setNewSupplementName('');
    setIsAddingSupplement(false);
  };

  const handleDeleteSupplement = (supId: string) => {
    soundManager.playClickPop();
    const nextSups = supplements.filter((s) => s.id !== supId);
    updateCurrentSystem((sys) => ({
      ...sys,
      supplements: nextSups,
    }));
  };

  const handleResetDayChecks = () => {
    soundManager.playClickPop();
    updateCurrentSystem((sys) => ({
      ...sys,
      waterCount: 0,
      supplements: (sys.supplements || supplements).map((s) => ({ ...s, taken: false })),
      meals: sys.meals.map((m) => ({
        ...m,
        foods: m.foods.map((f) => ({ ...f, consumed: false })),
      })),
    }));
  };

  const handleResetToPlanDefaults = () => {
    onUpdateMealSystems(DEFAULT_MEAL_SYSTEMS);
    soundManager.playOverloadLevelUp();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d4b26f', '#eed891', '#ffffff'],
      });
    } catch {
      // Ignore
    }
  };

  // Walking handlers
  const handleAddWalk = (walk: WalkingSession) => {
    onUpdateWalkingSessions([walk, ...walkingSessions]);
  };

  const handleDeleteWalk = (walkId: string) => {
    onUpdateWalkingSessions(walkingSessions.filter((w) => w.id !== walkId));
    soundManager.playClickPop();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWalks = walkingSessions.filter((w) => w.date === todayStr);
  const todaySteps = todayWalks.reduce((acc, w) => acc + w.steps, 0);
  const todayDistance = todayWalks.reduce((acc, w) => acc + w.distanceKm, 0);
  const stepGoal = settings.dailyStepGoal || 10000;
  const stepPercent = Math.min(100, Math.round((todaySteps / stepGoal) * 100));

  // Formatted date like "Tuesday, Oct 24"
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Meal completion stats
  const totalMealsCount = currentSystem.meals.length;
  const completedMealsCount = currentSystem.meals.filter(
    (m) => m.consumed || (m.foods.length > 0 && m.foods.every((f) => f.consumed))
  ).length;

  const handleFinishNutritionDay = () => {
    const dateKey = getTodayDateKey();
    const log: CompletedNutritionLog = {
      id: `nutr-${dateKey}-${Date.now()}`,
      date: dateKey,
      completedAt: new Date().toISOString(),
      systemId: currentSystem.id,
      systemName: currentSystem.name,
      routineName: currentSystem.name,
      mealsCompletedCount: completedMealsCount,
      totalMealsCount,
      meals: currentSystem.meals.map((m) => {
        const activeOpt = m.options?.find((o) => o.id === m.selectedOptionId);
        const isDone = m.consumed || (m.foods.length > 0 && m.foods.every((f) => f.consumed));
        return {
          mealId: m.id,
          mealName: m.name,
          scheduledTime: formatDisplayTime(m.scheduledTime),
          completed: isDone,
          notes: m.notes,
          selectedOptionTitle: activeOpt?.title || (m.foods[0] ? m.foods[0].name : undefined),
          foods: m.foods.map((f) => ({
            foodId: f.id,
            name: f.name,
            portion: f.portion,
            consumed: Boolean(f.consumed || isDone),
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fats: f.fats,
          })),
        };
      }),
      waterGlasses: waterCount,
      waterTarget,
      supplements: supplements.map((s) => ({
        name: s.name,
        taken: s.taken,
      })),
    };

    try {
      confetti({
        particleCount: 65,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#d4b26f', '#eed891', '#70b8ff', '#ffffff'],
      });
    } catch {
      // Ignore
    }

    soundManager.playOverloadLevelUp();
    onSaveNutritionLog?.(log);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2600);
  };

  return (
    <div className="space-y-4 pb-32">
      {/* Top Mode Switcher: Nutrition vs Walking & Cardio */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#121217] p-1 border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setSectionTab('nutrition')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition min-h-[42px] cursor-pointer ${
            sectionTab === 'nutrition'
              ? 'bg-[#d4b26f] text-black shadow-sm font-extrabold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Nutrition</span>
        </button>

        <button
          type="button"
          onClick={() => setSectionTab('walking')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition min-h-[42px] cursor-pointer ${
            sectionTab === 'walking'
              ? 'bg-[#d4b26f] text-black shadow-sm font-extrabold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>Walking & Cardio</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* NUTRITION VIEW (EXACTLY AS IN SCREENSHOT — NO CALORIE COUNTING)       */}
      {/* ===================================================================== */}
      {sectionTab === 'nutrition' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Quick Routine Toggle Switch (Morning vs Evening) */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#121217] p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Active Eating Routine
              </span>
              <span className="font-mono text-xs font-bold text-[#eed891]">
                {currentSystem.meals.length} Scheduled Meals
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#0b0b0e] p-1.5 border border-white/[0.06]">
              {mealSystems.map((sys) => {
                const isDay =
                  sys.id.includes('day') ||
                  sys.id.includes('morning') ||
                  sys.name.includes('النهار') ||
                  sys.name.toLowerCase().includes('day');
                const isSelected = sys.id === currentSystem.id;
                return (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => handleSwitchRoutine(sys.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-black transition cursor-pointer min-h-[44px] touch-manipulation ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d4b26f] to-[#eed891] text-black shadow-md font-black'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-base">{isDay ? '☀️' : '🌙'}</span>
                    <span className="truncate">
                      {isDay ? 'روتين التمرين النهاري' : 'روتين التمرين الليلي'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center justify-between px-1 flex-wrap gap-1">
              <span className="text-[11px] text-zinc-400 font-medium">
                {currentSystem.id.includes('night') || currentSystem.name.includes('الليلي')
                  ? 'للتمرين من ١٠:٠٠ مساءً إلى ١٢:٠٠ صباحًا'
                  : 'للتمرين من ٣:٠٠ إلى ٥:٠٠ مساءً'}
              </span>
              <button
                type="button"
                onClick={handleResetToPlanDefaults}
                className="flex items-center gap-1 text-[11px] font-bold text-[#eed891] hover:text-white transition cursor-pointer"
                title="Restore original Egyptian home food plan meals"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Plan Meals</span>
              </button>
            </div>
          </div>

          {/* Header & Segmented Tabs: Today | Routine | History */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#121217] p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Nutrition
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  {currentSystem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={openAddMeal}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d4b26f]/40 bg-[#d4b26f]/15 text-[#eed891] hover:bg-[#d4b26f] hover:text-black transition cursor-pointer"
                title="Add Meal"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Today | Routine | History Pill Tabs */}
            <div className="mt-3.5 grid grid-cols-3 gap-1 rounded-xl bg-[#0b0b0e] p-1 border border-white/[0.06]">
              {(['today', 'routine', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    soundManager.playClickPop();
                    setNutritionSubTab(tab);
                  }}
                  className={`rounded-lg py-2 text-xs font-bold capitalize transition cursor-pointer ${
                    nutritionSubTab === tab
                      ? 'bg-gradient-to-b from-[#e3c482] to-[#c8a35c] text-black font-extrabold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Date Bar & Reset / Progress */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-zinc-100">
                <Calendar className="w-4 h-4 text-[#d4b26f]" />
                <span suppressHydrationWarning>{formattedTodayDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-white/[0.05] px-2.5 py-1 font-mono text-xs font-bold text-[#eed891]">
                  {completedMealsCount}/{totalMealsCount} Meals
                </span>
                {completedMealsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetDayChecks}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB 1: TODAY VIEW (Daily Meal Cards + Replacements Drawer)        */}
          {/* ----------------------------------------------------------------- */}
          {nutritionSubTab === 'today' && (
            <div className="space-y-3.5">
              {/* Meal Cards List */}
              {currentSystem.meals.map((meal) => {
                const isMealComplete =
                  meal.consumed || (meal.foods.length > 0 && meal.foods.every((f) => f.consumed));
                const isPartiallyConsumed =
                  !isMealComplete && meal.foods.some((f) => f.consumed);

                // Determine options available for this meal
                const mealOptions =
                  meal.options && meal.options.length > 0
                    ? meal.options
                    : [
                        {
                          id: `opt-std-${meal.id}`,
                          title: `Standard: ${meal.foods.map((f) => f.name).join(' + ') || meal.name}`,
                          foods: meal.foods,
                        },
                      ];

                const activeOptionId = meal.selectedOptionId || mealOptions[0]?.id;
                const activeOption =
                  mealOptions.find((o) => o.id === activeOptionId) || mealOptions[0];

                const optCalories =
                  activeOption?.foods.reduce((acc, f) => acc + (f.calories || 0), 0) || 0;
                const optProtein =
                  activeOption?.foods.reduce((acc, f) => acc + (f.protein || 0), 0) || 0;
                const optCarbs =
                  activeOption?.foods.reduce((acc, f) => acc + (f.carbs || 0), 0) || 0;
                const optFats =
                  activeOption?.foods.reduce((acc, f) => acc + (f.fats || 0), 0) || 0;

                const isExpanded = expandedReplacements[meal.id] ?? true;

                return (
                  <div
                    key={meal.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isMealComplete
                        ? 'border-[#d4b26f]/40 bg-[#14141a]'
                        : 'border-white/[0.08] bg-[#14141a]'
                    }`}
                  >
                    {/* Card Header Row: Checkbox + Meal Title + Time & Edit */}
                    <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2.5 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleEntireMeal(meal)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition cursor-pointer touch-manipulation ${
                            isMealComplete
                              ? 'border-[#d4b26f] bg-[#d4b26f] text-black shadow-[0_0_10px_rgba(212,178,111,0.3)]'
                              : isPartiallyConsumed
                              ? 'border-[#d4b26f]/60 bg-[#d4b26f]/20 text-[#eed891]'
                              : 'border-white/25 bg-transparent hover:border-[#d4b26f]/60'
                          }`}
                          aria-label={`Mark ${meal.name} complete`}
                        >
                          <Check
                            className={`w-4 h-4 stroke-[3] transition-transform ${
                              isMealComplete ? 'scale-100' : 'scale-0'
                            }`}
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] sm:text-base font-black text-white truncate">
                              {meal.name}
                            </h3>
                            {isMealComplete && (
                              <span className="rounded-md bg-[#d4b26f]/15 px-1.5 py-0.5 text-[10px] font-black text-[#eed891] uppercase">
                                ✓ Eaten
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                            <span className="font-mono text-zinc-300 font-semibold">
                              {formatDisplayTime(meal.scheduledTime)}
                            </span>
                            {activeOption && (
                              <>
                                <span className="text-zinc-600">·</span>
                                <span className="truncate text-[#eed891] text-[11px] font-semibold">
                                  {activeOption.title}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingMealNoteId === meal.id) {
                              setEditingMealNoteId(null);
                            } else {
                              handleStartEditMealNote(meal.id, meal.notes);
                            }
                          }}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer ${
                            meal.notes
                              ? 'bg-[#d4b26f]/20 text-[#eed891] border border-[#d4b26f]/40'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                          title={meal.notes ? 'View / Edit Meal Note' : 'Add Note to Meal'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditMeal(meal)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                          title="Edit Meal Template"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Macro Chips for Currently Selected Option */}
                    {(optCalories > 0 || optProtein > 0) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-black/25 text-[11px] font-mono text-zinc-300 border-b border-white/[0.04] overflow-x-auto no-scrollbar">
                        <span className="font-bold text-[#eed891]">{optCalories} kcal</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-emerald-400 font-semibold">{optProtein}g Protein</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-amber-400 font-semibold">{optCarbs}g Carbs</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-rose-400 font-semibold">{optFats}g Fats</span>
                      </div>
                    )}

                    {/* Foods Checklist in Selected Option */}
                    <div className="px-4 py-3 space-y-1.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                        <span>Active Food Items:</span>
                        <span className="text-[10px] font-normal text-zinc-500">Tap item to check off</span>
                      </div>
                      {meal.foods.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openEditMeal(meal)}
                          className="w-full rounded-xl border border-dashed border-white/10 py-2.5 text-center text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          + Tap to add foods to this meal
                        </button>
                      ) : (
                        meal.foods.map((food) => {
                          const iconKey = guessFoodIcon(food.name, food.icon);
                          return (
                            <div
                              key={food.id}
                              onClick={() => handleToggleFood(meal.id, food.id)}
                              className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-white/[0.03] transition cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
                                    food.consumed
                                      ? 'border-[#d4b26f] bg-[#d4b26f] text-black'
                                      : 'border-white/25 bg-[#1b1b22]'
                                  }`}
                                >
                                  <Check
                                    className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                                      food.consumed ? 'scale-100' : 'scale-0'
                                    }`}
                                  />
                                </div>

                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-[#d4b26f]">
                                  <FoodCategoryIcon iconType={iconKey} className="w-3.5 h-3.5" />
                                </div>

                                <div className="min-w-0 flex-1 flex items-baseline gap-1.5 flex-wrap">
                                  <span
                                    className={`text-xs sm:text-sm font-semibold transition ${
                                      food.consumed ? 'text-zinc-300 line-through opacity-70' : 'text-zinc-100'
                                    }`}
                                  >
                                    {food.name}
                                  </span>
                                  {food.portion && (
                                    <span className="text-xs text-zinc-400">
                                      ({food.portion})
                                    </span>
                                  )}
                                </div>
                              </div>

                              {(food.calories > 0 || food.protein > 0) && (
                                <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                                  {food.calories ? `${food.calories} kcal` : `${food.protein}g P`}
                                </span>
                              )}

                              {/* Delete food item from active option */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFoodFromActiveOption(meal.id, food.id);
                                }}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer opacity-70 hover:opacity-100 shrink-0"
                                title="Remove food from active option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}

                      {/* Inline Quick Add Food to Current Option */}
                      {quickAddFoodMealId === meal.id ? (
                        <div className="mt-2 rounded-xl border border-[#d4b26f]/30 bg-[#0b0b0e] p-3 space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#eed891] flex items-center justify-between">
                            <span>Add Food to Current Option</span>
                            <span className="text-zinc-500 font-normal">Active Choice</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={quickFoodName}
                              onChange={(e) => setQuickFoodName(e.target.value)}
                              placeholder="Food name (e.g. 1 Boiled Egg)"
                              className="rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1.5 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                            />
                            <input
                              type="text"
                              value={quickFoodPortion}
                              onChange={(e) => setQuickFoodPortion(e.target.value)}
                              placeholder="Portion (e.g. 50g / 1 egg)"
                              className="rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1.5 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="number"
                              value={quickFoodCalories}
                              onChange={(e) => setQuickFoodCalories(e.target.value)}
                              placeholder="Calories (kcal)"
                              className="rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1 text-xs text-white focus:border-[#d4b26f] focus:outline-none font-mono"
                            />
                            <input
                              type="number"
                              value={quickFoodProtein}
                              onChange={(e) => setQuickFoodProtein(e.target.value)}
                              placeholder="Protein (g)"
                              className="rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1 text-xs text-white focus:border-[#d4b26f] focus:outline-none font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setQuickAddFoodMealId(null)}
                              className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAddFoodToActiveOption(meal.id)}
                              className="rounded-lg bg-[#d4b26f] px-3 py-1 text-xs font-bold text-black hover:bg-[#e2c487]"
                            >
                              Add Item
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-wrap gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickAddFoodMealId(meal.id);
                              setQuickFoodName('');
                              setQuickFoodPortion('');
                              setQuickFoodCalories('');
                              setQuickFoodProtein('');
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#eed891] hover:text-[#fae5b5] px-2 py-1 rounded-md hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Food Item to Current Option</span>
                          </button>

                          {!meal.notes && editingMealNoteId !== meal.id && (
                            <button
                              type="button"
                              onClick={() => handleStartEditMealNote(meal.id, '')}
                              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-[#eed891] px-2 py-1 rounded-md hover:bg-white/[0.04] transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#d4b26f]" />
                              <span>+ Note</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Meal Note Display Banner */}
                      {meal.notes && editingMealNoteId !== meal.id && (
                        <div
                          onClick={() => handleStartEditMealNote(meal.id, meal.notes)}
                          className="mt-2.5 flex items-start justify-between gap-2 rounded-xl border border-[#d4b26f]/25 bg-[#101016] px-3 py-2 text-xs hover:border-[#d4b26f]/40 transition cursor-pointer select-none group"
                          title="Tap to edit note"
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <FileText className="w-3.5 h-3.5 text-[#d4b26f] shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#eed891]/80 block mb-0.5">
                                Meal Note / Instructions
                              </span>
                              <p className="leading-snug break-words text-zinc-300 font-medium">
                                {meal.notes}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditMealNote(meal.id, meal.notes);
                            }}
                            className="p-1 rounded text-zinc-500 hover:text-[#eed891] transition shrink-0 opacity-70 group-hover:opacity-100"
                            title="Edit note"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Inline Meal Note Editor */}
                      {editingMealNoteId === meal.id && (
                        <div className="mt-2.5 rounded-xl border border-[#d4b26f]/35 bg-[#0e0e14] p-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#eed891]">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#d4b26f]" />
                              <span>Meal Note / Cooking Instructions</span>
                            </span>
                            {meal.notes && (
                              <button
                                type="button"
                                onClick={() => handleSaveMealNote(meal.id, '')}
                                className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline"
                              >
                                Delete Note
                              </button>
                            )}
                          </div>
                          <textarea
                            value={draftMealNoteText}
                            onChange={(e) => setDraftMealNoteText(e.target.value)}
                            placeholder="e.g. Cook eggs in olive oil, drink whey 30 min before gym, take with plenty of water..."
                            rows={2}
                            autoFocus
                            className="w-full rounded-lg border border-white/10 bg-zinc-950 p-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4b26f] focus:outline-none"
                          />
                          <div className="flex justify-end gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setEditingMealNoteId(null)}
                              className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveMealNote(meal.id, draftMealNoteText)}
                              className="rounded-lg bg-[#d4b26f] px-3 py-1 text-xs font-bold text-black hover:bg-[#e2c487]"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Replacements Header & Expandable Radio List */}
                    <div className="border-t border-white/[0.06] bg-[#0f0f14]/80 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReplacementsDrawer(meal.id)}
                          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#eed891] hover:text-white transition cursor-pointer"
                        >
                          <span>Replacements &amp; Alternatives ({mealOptions.length})</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#d4b26f]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#d4b26f]" />
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenAddOption(meal)}
                            className="flex items-center gap-1 rounded-lg border border-[#d4b26f]/40 bg-[#d4b26f]/15 px-2.5 py-1 text-[11px] font-bold text-[#eed891] hover:bg-[#d4b26f] hover:text-black transition cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Option</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClickPop();
                              setCustomMealModal({
                                isOpen: true,
                                mealId: meal.id,
                                mealName: meal.name,
                                optionTitle: '',
                                foodName: '',
                                portion: '',
                                calories: '',
                                protein: '',
                                carbs: '',
                                fats: '',
                              });
                            }}
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition cursor-pointer shrink-0"
                          >
                            <span>Off-Menu</span>
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {mealOptions.map((opt) => {
                            const isSelected = opt.id === activeOptionId;
                            const optCal = opt.foods.reduce((acc, f) => acc + (f.calories || 0), 0);
                            const optPro = opt.foods.reduce((acc, f) => acc + (f.protein || 0), 0);
                            const optCarb = opt.foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
                            const optFat = opt.foods.reduce((acc, f) => acc + (f.fats || 0), 0);

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleSelectOption(meal.id, opt.id)}
                                className={`flex items-start gap-3 rounded-xl border p-2.5 transition cursor-pointer select-none ${
                                  isSelected
                                    ? 'border-[#d4b26f] bg-[#d4b26f]/10 shadow-[0_0_12px_rgba(212,178,111,0.12)]'
                                    : 'border-white/[0.06] bg-[#14141a] hover:border-white/20'
                                }`}
                              >
                                {/* Radio Indicator */}
                                <div
                                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                                    isSelected
                                      ? 'border-[#d4b26f] bg-[#d4b26f]'
                                      : 'border-white/30 bg-transparent'
                                  }`}
                                >
                                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`text-xs font-bold leading-snug ${
                                        isSelected ? 'text-[#eed891]' : 'text-zinc-200'
                                      }`}
                                    >
                                      {opt.title}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {opt.isCustom && (
                                        <span className="shrink-0 rounded bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-black uppercase text-zinc-400">
                                          Custom
                                        </span>
                                      )}
                                      {/* Edit Option Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditOption(meal, opt);
                                        }}
                                        className="p-1 rounded-md text-zinc-400 hover:text-[#eed891] hover:bg-white/[0.08] transition cursor-pointer"
                                        title="Edit this option"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      {/* Delete Option Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePromptDeleteOption(meal.id, opt.id, opt.title);
                                        }}
                                        className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                        title="Delete this option"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Food items breakdown */}
                                  <div className="mt-1 text-[11px] text-zinc-400 leading-tight">
                                    {opt.foods.map((f) => `${f.name} (${f.portion})`).join(' + ')}
                                  </div>

                                  {/* Macro breakdown chip */}
                                  {(optCal > 0 || optPro > 0) && (
                                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-zinc-400 flex-wrap">
                                      {optCal > 0 && <span className="font-semibold text-zinc-300">{optCal} kcal</span>}
                                      {optPro > 0 && <span>P: {optPro}g</span>}
                                      {optCarb > 0 && <span>C: {optCarb}g</span>}
                                      {optFat > 0 && <span>F: {optFat}g</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* + Add Option bottom button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddOption(meal)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d4b26f]/30 bg-[#14141a]/60 py-2.5 text-xs font-bold text-[#eed891] hover:bg-[#d4b26f]/10 transition cursor-pointer mt-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Option to {meal.name}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* + Add Meal Gold Outline Button */}
              <button
                type="button"
                onClick={openAddMeal}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d4b26f]/40 bg-[#14141a]/60 py-3.5 text-xs sm:text-sm font-bold text-[#eed891] hover:bg-[#d4b26f]/10 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Meal</span>
              </button>

              {/* WATER TRACKER CARD (8 Glasses) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-white">Water</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-zinc-400">
                      {waterCount}/{waterTarget} glasses
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6ab0ff]">
                    {waterCount * 250} ml
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                  {Array.from({ length: waterTarget }).map((_, idx) => {
                    const isFilled = idx < waterCount;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectWaterGlass(idx)}
                        className={`flex flex-col items-center justify-center h-11 rounded-xl border transition active:scale-90 cursor-pointer ${
                          isFilled
                            ? 'border-[#4a9eff]/50 bg-[#4a9eff]/20 text-[#70b8ff] shadow-[0_0_12px_rgba(74,158,255,0.2)]'
                            : 'border-white/10 bg-[#1b1b22] text-zinc-600 hover:border-white/20'
                        }`}
                        title={`Glass ${idx + 1}`}
                      >
                        <Droplets
                          className={`w-4 h-4 transition ${
                            isFilled ? 'fill-[#70b8ff]/40 text-[#70b8ff]' : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUPPLEMENTS CHECKLIST CARD */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    Supplements
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingSupplement(!isAddingSupplement)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#1b1b22] px-2.5 py-1 text-xs font-bold text-[#eed891] hover:border-[#d4b26f]/40 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {isAddingSupplement && (
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={newSupplementName}
                      onChange={(e) => setNewSupplementName(e.target.value)}
                      placeholder="e.g. Creatine 5g, Omega-3, Zinc"
                      className="flex-1 rounded-xl border border-white/15 bg-[#0b0b0e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSupplement}
                      className="rounded-xl bg-[#d4b26f] px-3.5 py-2 text-xs font-extrabold text-black cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {supplements.map((sup) => (
                    <div
                      key={sup.id}
                      className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2 transition cursor-pointer select-none ${
                        sup.taken
                          ? 'border-[#d4b26f]/40 bg-[#d4b26f]/10 text-white'
                          : 'border-white/10 bg-[#1b1b22] text-zinc-300'
                      }`}
                      onClick={() => handleToggleSupplement(sup.id)}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
                          sup.taken
                            ? 'border-[#d4b26f] bg-[#d4b26f] text-black'
                            : 'border-white/25 bg-transparent'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                            sup.taken ? 'scale-100' : 'scale-0'
                          }`}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{sup.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSupplement(sup.id);
                        }}
                        className="ml-1 text-zinc-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                        title="Remove supplement"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINISH & SAVE NUTRITION DAY BUTTON */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFinishNutritionDay}
                  className="flex h-12 w-full items-center justify-between gap-2 whitespace-nowrap rounded-2xl bg-[#d4b26f] px-3.5 text-xs font-black uppercase tracking-wide text-black shadow-xl hover:bg-[#e2c487] active:scale-[0.98] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/15 text-black">
                      {savedToast ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <Trophy className="h-4 w-4 stroke-[2.5]" />
                      )}
                    </div>
                    <span className="truncate">
                      {savedToast
                        ? 'Nutrition Day Saved!'
                        : 'Save Nutrition Day'}
                    </span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-lg bg-black/15 px-2.5 py-1 font-mono text-[11px] font-black text-black">
                    {completedMealsCount}/{totalMealsCount} Meals · {waterCount}/{waterTarget} Water
                  </span>
                </button>

                {/* Instant Copy Nutrition Report (Decoupled from gym) */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = generateNutritionReportText({
                        dateKey: getTodayDateKey(),
                        userName: settings.userName,
                        nutritionLogs,
                        currentMealSystem: currentSystem,
                        walkingSessions,
                      });
                      await navigator.clipboard.writeText(text);
                      setCopiedNutritionToast(true);
                      soundManager.playClickPop();
                      setTimeout(() => setCopiedNutritionToast(false), 2200);
                    } catch {
                      // Fallback
                    }
                  }}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#70b8ff]/40 bg-[#70b8ff]/15 px-3 text-xs font-black uppercase text-[#9ed0ff] hover:bg-[#70b8ff]/25 active:scale-[0.98] transition cursor-pointer"
                >
                  {copiedNutritionToast ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Nutrition Report Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 stroke-[2.5]" />
                      <span>Copy Nutrition Report (Text for Coach)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 2: ROUTINE VIEW (Manage & Reorder Daily Meal Template)        */}
          {/* ----------------------------------------------------------------- */}
          {nutritionSubTab === 'routine' && (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#d4b26f]">
                  Daily Meal Structure
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Tap any meal below to customize its scheduled time, whole foods, portions, or notes.
                </p>
              </div>

              {/* Timing Variations Guide */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#eed891]">
                  ملاحظات توقيت التمرين (Timing Variations)
                </div>
                <div className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <span className="font-bold text-white">للتمرين من ٦:٠٠ إلى ٨:٠٠ مساءً:</span> وجبة قبل التمرين الساعة ٤:٠٠ م، ووجبة بعد التمرين / العشاء الساعة ٨:١٥ م (مع استخدام وجبة الغداء العائلي متى توفرت أو كوجبة بعد التمرين).
                  </p>
                  <p>
                    <span className="font-bold text-white">للتمرين النادر من ١:٠٠ إلى ٣:٠٠ مساءً:</span> الفطار الساعة ٩:٠٠ ص، وجبة قبل التمرين ١١:٠٠ ص، وجبة الغداء العائلي / بعد التمرين ٣:٣٠ م، والوجبة الأخيرة بين ٨:٠٠ و ٩:٠٠ م.
                  </p>
                </div>
              </div>

              {currentSystem.meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => openEditMeal(meal)}
                  className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#14141a] p-4 hover:border-[#d4b26f]/40 transition cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#1b1b22] px-2.5 py-0.5 font-mono text-xs font-bold text-[#eed891] border border-white/10">
                        {formatDisplayTime(meal.scheduledTime)}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                        {meal.name}
                      </h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {meal.foods.map((f) => (
                        <span
                          key={f.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 border border-white/[0.05]"
                        >
                          <FoodCategoryIcon
                            iconType={guessFoodIcon(f.name, f.icon)}
                            className="w-3 h-3 text-[#d4b26f]"
                          />
                          <span>{f.name}</span>
                          <span className="text-zinc-500">({f.portion})</span>
                        </span>
                      ))}
                    </div>
                    {meal.notes && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                        <FileText className="w-3 h-3 text-[#d4b26f] shrink-0" />
                        <span className="truncate italic text-zinc-400">Note: {meal.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400">
                    <Pencil className="w-4 h-4" />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={openAddMeal}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4b26f] py-3.5 text-xs sm:text-sm font-black uppercase text-black shadow-md hover:bg-[#e2c487] transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Meal to Routine</span>
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB 3: HISTORY / SUMMARY VIEW                                     */}
          {/* ----------------------------------------------------------------- */}
          {nutritionSubTab === 'history' && (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#d4b26f]">
                      Today&apos;s Adherence
                    </div>
                    <div className="text-lg font-black text-white mt-0.5">
                      {completedMealsCount} of {totalMealsCount} Meals Completed
                    </div>
                  </div>
                  <div className="text-right font-mono text-2xl font-black text-[#eed891]">
                    {totalMealsCount > 0
                      ? Math.round((completedMealsCount / totalMealsCount) * 100)
                      : 0}
                    %
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-[#1b1b22] p-3.5">
                    <div className="text-xs text-zinc-400 font-semibold">Water Intake</div>
                    <div className="mt-1 font-mono text-lg font-black text-[#70b8ff]">
                      {waterCount} / {waterTarget} glasses
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#1b1b22] p-3.5">
                    <div className="text-xs text-zinc-400 font-semibold">Supplements</div>
                    <div className="mt-1 font-mono text-lg font-black text-[#eed891]">
                      {supplements.filter((s) => s.taken).length} / {supplements.length} taken
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Nutrition Days List */}
              <div className="space-y-2.5">
                <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
                  Saved Nutrition Days ({nutritionLogs.length})
                </div>

                {nutritionLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                    No saved nutrition days yet. Tap &quot;Finish &amp; Save Nutrition Day&quot; on the Today tab to log your day!
                  </div>
                ) : (
                  nutritionLogs.map((nLog) => {
                    const eaten = nLog.meals.filter((m) => m.completed);
                    const missed = nLog.meals.filter((m) => !m.completed);
                    return (
                      <div
                        key={nLog.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#14141a] p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-white">
                              {formatReadableDateKey(nLog.date)}
                            </div>
                            <div className="text-xs font-mono text-zinc-400 mt-0.5">
                              {nLog.mealsCompletedCount}/{nLog.totalMealsCount} Meals Eaten ·{' '}
                              <span className="text-[#70b8ff]">
                                {nLog.waterGlasses}/{nLog.waterTarget} Water
                              </span>
                            </div>
                          </div>

                          {onDeleteNutritionLog && (
                            <button
                              type="button"
                              onClick={() => onDeleteNutritionLog(nLog.id)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                              title="Delete nutrition day"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 text-xs pt-1 border-t border-white/[0.05]">
                          {eaten.length > 0 && (
                            <div className="text-emerald-300/90">
                              <strong className="text-emerald-400">Ate:</strong>{' '}
                              {eaten.map((m) => m.mealName).join(', ')}
                            </div>
                          )}
                          {missed.length > 0 && (
                            <div className="text-rose-300/90">
                              <strong className="text-rose-400">Forgot/Skipped:</strong>{' '}
                              {missed.map((m) => m.mealName).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* FULL MEAL EDITOR MODAL / SCREEN (3rd & 4th Screens in User Image)     */}
      {/* ===================================================================== */}
      {editorState && editorState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#121217] p-5 pb-10 sm:pb-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
            {/* Top Bar: < Cancel | Add Meal / Edit Meal | Save */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditorState(null)}
                className="flex items-center gap-1 text-sm font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <h3 className="text-base font-extrabold text-white">
                {editorState.mode === 'add' ? 'Add Meal' : 'Edit Meal'}
              </h3>

              <button
                type="button"
                onClick={handleSaveEditorMeal}
                className="rounded-xl bg-gradient-to-b from-[#e3c482] to-[#c8a35c] px-4 py-1.5 text-xs sm:text-sm font-extrabold text-black shadow-sm hover:brightness-105 transition cursor-pointer"
              >
                Save
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Meal Name Input Box */}
              <div className="rounded-2xl border border-white/10 bg-[#181820] px-4 py-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Meal Name
                </label>
                <input
                  type="text"
                  value={editorState.name}
                  onChange={(e) =>
                    setEditorState({ ...editorState, name: e.target.value })
                  }
                  placeholder="e.g. Meal 1: Breakfast"
                  className="w-full bg-transparent text-base font-extrabold text-white focus:outline-none"
                />
              </div>

              {/* Time Selector Row */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#181820] px-4 py-3.5">
                <span className="text-sm font-bold text-zinc-200">Time</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={toTimeInputValue(editorState.scheduledTime)}
                    onChange={(e) =>
                      setEditorState({
                        ...editorState,
                        scheduledTime: formatDisplayTime(e.target.value),
                      })
                    }
                    className="rounded-lg bg-[#0b0b0e] border border-white/10 px-2.5 py-1 font-mono text-sm font-bold text-[#eed891] focus:border-[#d4b26f] focus:outline-none"
                  />
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              {/* Foods Section Card */}
              <div className="rounded-2xl border border-white/10 bg-[#181820] p-4 space-y-3">
                <div className="text-sm font-extrabold text-white">Foods</div>

                {/* Existing Foods List inside Editor */}
                <div className="space-y-2">
                  {editorState.foods.map((food, idx) => {
                    const iconKey = guessFoodIcon(food.name, food.icon);
                    return (
                      <div
                        key={food.id}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#121217] p-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const currentIndex = FOOD_ICON_OPTIONS.findIndex(
                              (o) => o.id === iconKey
                            );
                            const nextIcon =
                              FOOD_ICON_OPTIONS[
                                (currentIndex + 1) % FOOD_ICON_OPTIONS.length
                              ].id;
                            const nextFoods = editorState.foods.map((item, i) =>
                              i === idx ? { ...item, icon: nextIcon } : item
                            );
                            setEditorState({ ...editorState, foods: nextFoods });
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#eed891] border border-[#d4b26f]/30 cursor-pointer"
                          title="Tap to cycle food icon"
                        >
                          <FoodCategoryIcon iconType={iconKey} className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => {
                              const nextFoods = editorState.foods.map((item, i) =>
                                i === idx ? { ...item, name: e.target.value } : item
                              );
                              setEditorState({ ...editorState, foods: nextFoods });
                            }}
                            placeholder="Food (e.g. Eggs)"
                            className="w-full rounded-lg bg-[#1b1b22] px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white border border-white/[0.06] focus:border-[#d4b26f] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={food.portion}
                            onChange={(e) => {
                              const nextFoods = editorState.foods.map((item, i) =>
                                i === idx ? { ...item, portion: e.target.value } : item
                              );
                              setEditorState({ ...editorState, foods: nextFoods });
                            }}
                            placeholder="Portion (e.g. 4 large)"
                            className="w-full rounded-lg bg-[#1b1b22] px-2.5 py-1.5 text-xs sm:text-sm text-zinc-300 border border-white/[0.06] focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const nextFoods = editorState.foods.filter(
                              (_, i) => i !== idx
                            );
                            setEditorState({ ...editorState, foods: nextFoods });
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition shrink-0 cursor-pointer"
                          title="Remove food"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* New Food Form (if open) */}
                {isAddingFoodInEditor && (
                  <div className="rounded-xl border border-[#d4b26f]/40 bg-[#121217] p-3 space-y-2.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {FOOD_ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDraftFoodIcon(opt.id)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition cursor-pointer ${
                            draftFoodIcon === opt.id
                              ? 'border-[#d4b26f] bg-[#d4b26f] text-black'
                              : 'border-white/10 bg-[#1b1b22] text-zinc-400'
                          }`}
                          title={opt.label}
                        >
                          <FoodCategoryIcon iconType={opt.id} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Food name (e.g. Eggs)"
                        value={draftFoodName}
                        onChange={(e) => setDraftFoodName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#1b1b22] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Portion (e.g. 4 large)"
                        value={draftFoodPortion}
                        onChange={(e) => setDraftFoodPortion(e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#1b1b22] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingFoodInEditor(false);
                          setDraftFoodName('');
                          setDraftFoodPortion('');
                        }}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!draftFoodName.trim()) return;
                          const newItem: FoodItem = {
                            id: `f-${Date.now()}`,
                            name: draftFoodName.trim(),
                            portion: draftFoodPortion.trim() || '1 serving',
                            icon: draftFoodIcon,
                            protein: 0,
                            carbs: 0,
                            fats: 0,
                            calories: 0,
                            consumed: false,
                          };
                          setEditorState({
                            ...editorState,
                            foods: [...editorState.foods, newItem],
                          });
                          setDraftFoodName('');
                          setDraftFoodPortion('');
                          setIsAddingFoodInEditor(false);
                        }}
                        className="rounded-xl bg-[#d4b26f] px-3.5 py-1.5 text-xs font-extrabold text-black cursor-pointer"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                )}

                {/* Gold Outlined "+ Add Food" Button matching Screenshot */}
                <button
                  type="button"
                  onClick={() => {
                    if (isAddingFoodInEditor && draftFoodName.trim()) {
                      const newItem: FoodItem = {
                        id: `f-${Date.now()}`,
                        name: draftFoodName.trim(),
                        portion: draftFoodPortion.trim() || '1 serving',
                        icon: draftFoodIcon,
                        protein: 0,
                        carbs: 0,
                        fats: 0,
                        calories: 0,
                        consumed: false,
                      };
                      setEditorState({
                        ...editorState,
                        foods: [...editorState.foods, newItem],
                      });
                      setDraftFoodName('');
                      setDraftFoodPortion('');
                    } else {
                      setIsAddingFoodInEditor(true);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#d4b26f]/50 bg-[#d4b26f]/10 py-3 text-xs sm:text-sm font-extrabold text-[#eed891] hover:bg-[#d4b26f]/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Food</span>
                </button>
              </div>

              {/* Notes Section matching Screenshot */}
              <div className="rounded-2xl border border-white/10 bg-[#181820] p-4 space-y-2">
                <label className="block text-sm font-extrabold text-white">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editorState.notes}
                  onChange={(e) =>
                    setEditorState({ ...editorState, notes: e.target.value })
                  }
                  placeholder="High protein breakfast..."
                  className="w-full rounded-xl border border-white/10 bg-[#121217] p-3 text-xs sm:text-sm text-zinc-200 focus:border-[#d4b26f] focus:outline-none resize-none"
                />
              </div>

              {/* Delete Meal button if editing */}
              {editorState.mode === 'edit' && editorState.mealId && (
                <button
                  type="button"
                  onClick={() => handleDeleteMealFromEditor(editorState.mealId!)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Meal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* WALKING & CARDIO TAB                                                  */}
      {/* ===================================================================== */}
      {sectionTab === 'walking' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-white/[0.07] bg-[#121217] p-5 shadow-sm text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#d4b26f]">
              Daily Step Goal
            </div>

            <div className="my-3">
              <span suppressHydrationWarning className="font-mono text-4xl font-black text-white">
                {formatSafeNumber(todaySteps)}
              </span>
              <span suppressHydrationWarning className="font-mono text-sm text-zinc-500 block mt-1">
                of {formatSafeNumber(stepGoal)} target steps
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4b26f] to-[#eed891] rounded-full transition-all duration-300"
                style={{ width: `${stepPercent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.05] pt-3 text-left">
              <div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Total Distance</div>
                <div className="font-mono text-base font-bold text-white mt-0.5">
                  {todayDistance.toFixed(1)} km
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Completion</div>
                <div className="font-mono text-base font-bold text-[#eed891] mt-0.5">
                  {stepPercent}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddWalkOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#d4b26f] py-3 text-xs font-black uppercase text-black hover:bg-[#e2c487] active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Walk or Cardio Session</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="px-1 text-xs font-black uppercase tracking-wider text-zinc-400">
              Today&apos;s Walk Logs ({todayWalks.length})
            </div>

            {todayWalks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs sm:text-sm text-zinc-500">
                No walks recorded today. Tap &quot;Log Walk&quot; above to track your daily steps!
              </div>
            ) : (
              todayWalks.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#121217] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181820] text-[#d4b26f] font-mono text-xs border border-[#d4b26f]/20">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white">{w.label}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        {w.time} · {w.durationMinutes} min · {w.distanceKm} km
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      suppressHydrationWarning
                      className="font-mono text-xs sm:text-sm font-bold text-[#eed891]"
                    >
                      +{formatSafeNumber(w.steps)} steps
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWalk(w.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Custom Off-Menu Meal Modal */}
      {customMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Custom Off-Menu Meal
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {customMealModal.mealName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomMealModal(null)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs text-zinc-400">
              Ate something off-menu? Enter your food details and portions below. It will automatically be selected for today.
            </p>

            <div className="mt-3.5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Option Title / Label
                </label>
                <input
                  type="text"
                  value={customMealModal.optionTitle}
                  onChange={(e) =>
                    setCustomMealModal({ ...customMealModal, optionTitle: e.target.value })
                  }
                  placeholder="e.g. Dining Out: Salmon & Sweet Potato"
                  className="w-full rounded-xl border border-white/15 bg-[#0b0b0e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    value={customMealModal.foodName}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, foodName: e.target.value })
                    }
                    placeholder="e.g. Grilled Salmon"
                    className="w-full rounded-xl border border-white/15 bg-[#0b0b0e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Portion / Serving
                  </label>
                  <input
                    type="text"
                    value={customMealModal.portion}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, portion: e.target.value })
                    }
                    placeholder="e.g. 250g fillet"
                    className="w-full rounded-xl border border-white/15 bg-[#0b0b0e] px-3 py-2 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={customMealModal.calories}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, calories: e.target.value })
                    }
                    placeholder="kcal"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0e] p-2 text-xs font-mono text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">
                    Protein
                  </label>
                  <input
                    type="number"
                    value={customMealModal.protein}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, protein: e.target.value })
                    }
                    placeholder="g"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0e] p-2 text-xs font-mono text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-400 mb-1">
                    Carbs
                  </label>
                  <input
                    type="number"
                    value={customMealModal.carbs}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, carbs: e.target.value })
                    }
                    placeholder="g"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0e] p-2 text-xs font-mono text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-rose-400 mb-1">
                    Fats
                  </label>
                  <input
                    type="number"
                    value={customMealModal.fats}
                    onChange={(e) =>
                      setCustomMealModal({ ...customMealModal, fats: e.target.value })
                    }
                    placeholder="g"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0b0e] p-2 text-xs font-mono text-white focus:border-[#d4b26f] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCustomMealModal(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomMealOption}
                className="flex-1 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase text-black hover:bg-[#e2c487] cursor-pointer"
              >
                Save &amp; Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option Editor Modal (Add new option or edit existing option) */}
      {optionEditorModal && optionEditorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3.5 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4b26f]/15 text-[#d4b26f]">
                  {optionEditorModal.mode === 'add' ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    {optionEditorModal.mode === 'add' ? 'Add Meal Option' : 'Edit Meal Option'}
                  </h3>
                  <p className="text-[11px] text-[#eed891] font-mono">
                    {optionEditorModal.mealName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOptionEditorModal(null)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Option Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Option Title / Label *
                </label>
                <input
                  type="text"
                  value={optionEditorModal.title}
                  onChange={(e) =>
                    setOptionEditorModal({
                      ...optionEditorModal,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Option 4: Ful Medames + Baladi Bread"
                  className="w-full rounded-xl border border-white/15 bg-[#0b0b0e] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#d4b26f] focus:outline-none"
                />
              </div>

              {/* Foods List inside this Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Food Items in this Option ({optionEditorModal.foods.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOptionEditorModal({
                        ...optionEditorModal,
                        foods: [
                          ...optionEditorModal.foods,
                          {
                            id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                            name: '',
                            portion: '',
                            icon: 'bowl',
                            protein: 0,
                            carbs: 0,
                            fats: 0,
                            calories: 0,
                          },
                        ],
                      });
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#eed891] hover:text-[#fae5b5] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {optionEditorModal.foods.map((food, fIdx) => (
                    <div
                      key={food.id || fIdx}
                      className="rounded-xl border border-white/10 bg-[#0b0b0e] p-3 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                          Item #{fIdx + 1}
                        </span>
                        {optionEditorModal.foods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = optionEditorModal.foods.filter((_, i) => i !== fIdx);
                              setOptionEditorModal({
                                ...optionEditorModal,
                                foods: filtered,
                              });
                            }}
                            className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                            title="Remove food item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-1">
                            Food Name *
                          </label>
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              updatedFoods[fIdx] = {
                                ...updatedFoods[fIdx],
                                name: e.target.value,
                                icon: guessFoodIcon(e.target.value, food.icon),
                              };
                              setOptionEditorModal({
                                ...optionEditorModal,
                                foods: updatedFoods,
                              });
                            }}
                            placeholder="e.g. Scrambled Eggs"
                            className="w-full rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1.5 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-zinc-400 mb-1">
                            Portion
                          </label>
                          <input
                            type="text"
                            value={food.portion}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              updatedFoods[fIdx] = {
                                ...updatedFoods[fIdx],
                                portion: e.target.value,
                              };
                              setOptionEditorModal({
                                ...optionEditorModal,
                                foods: updatedFoods,
                              });
                            }}
                            placeholder="e.g. 3 eggs / 150g"
                            className="w-full rounded-lg border border-white/10 bg-[#14141a] px-2.5 py-1.5 text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Macros row */}
                      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">
                            Calories
                          </label>
                          <input
                            type="number"
                            value={food.calories || ''}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              const cal = parseInt(e.target.value, 10) || 0;
                              updatedFoods[fIdx] = { ...updatedFoods[fIdx], calories: cal };
                              setOptionEditorModal({ ...optionEditorModal, foods: updatedFoods });
                            }}
                            placeholder="kcal"
                            className="w-full rounded border border-white/10 bg-[#14141a] p-1 text-center font-mono text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-emerald-400 mb-1">
                            Protein (g)
                          </label>
                          <input
                            type="number"
                            value={food.protein || ''}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              const pro = parseInt(e.target.value, 10) || 0;
                              updatedFoods[fIdx] = { ...updatedFoods[fIdx], protein: pro };
                              setOptionEditorModal({ ...optionEditorModal, foods: updatedFoods });
                            }}
                            placeholder="g"
                            className="w-full rounded border border-white/10 bg-[#14141a] p-1 text-center font-mono text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-amber-400 mb-1">
                            Carbs (g)
                          </label>
                          <input
                            type="number"
                            value={food.carbs || ''}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              const carb = parseInt(e.target.value, 10) || 0;
                              updatedFoods[fIdx] = { ...updatedFoods[fIdx], carbs: carb };
                              setOptionEditorModal({ ...optionEditorModal, foods: updatedFoods });
                            }}
                            placeholder="g"
                            className="w-full rounded border border-white/10 bg-[#14141a] p-1 text-center font-mono text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-rose-400 mb-1">
                            Fats (g)
                          </label>
                          <input
                            type="number"
                            value={food.fats || ''}
                            onChange={(e) => {
                              const updatedFoods = [...optionEditorModal.foods];
                              const fat = parseInt(e.target.value, 10) || 0;
                              updatedFoods[fIdx] = { ...updatedFoods[fIdx], fats: fat };
                              setOptionEditorModal({ ...optionEditorModal, foods: updatedFoods });
                            }}
                            placeholder="g"
                            className="w-full rounded border border-white/10 bg-[#14141a] p-1 text-center font-mono text-xs text-white focus:border-[#d4b26f] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Macros Summary Preview for this Option */}
              {(() => {
                const totalCal = optionEditorModal.foods.reduce((acc, f) => acc + (f.calories || 0), 0);
                const totalPro = optionEditorModal.foods.reduce((acc, f) => acc + (f.protein || 0), 0);
                const totalCarb = optionEditorModal.foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
                const totalFat = optionEditorModal.foods.reduce((acc, f) => acc + (f.fats || 0), 0);
                return (
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Calculated Option Totals:
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
                      <span className="font-bold text-[#eed891]">{totalCal} kcal</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-emerald-400 font-semibold">{totalPro}g Protein</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-amber-400 font-semibold">{totalCarb}g Carbs</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-rose-400 font-semibold">{totalFat}g Fats</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOptionEditorModal(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOptionModal}
                className="flex-1 rounded-xl bg-[#d4b26f] py-2.5 text-xs font-black uppercase text-black hover:bg-[#e2c487] cursor-pointer"
              >
                {optionEditorModal.mode === 'add' ? 'Save & Select Option' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Option Confirmation Modal */}
      {deleteOptionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-white">
            <div className="flex items-center gap-2.5 text-rose-400 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Delete Option?</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Are you sure you want to remove <span className="text-zinc-200 font-bold">&ldquo;{deleteOptionConfirm.optionTitle}&rdquo;</span>?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteOptionConfirm(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOption}
                className="flex-1 rounded-xl bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddWalkModal
        isOpen={isAddWalkOpen}
        onClose={() => setIsAddWalkOpen(false)}
        onAddWalk={handleAddWalk}
      />
    </div>
  );
};
