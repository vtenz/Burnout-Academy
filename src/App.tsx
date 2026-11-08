import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Award,
  Zap,
  Grid,
  Search,
  Filter,
  Flame,
  Star,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Pill,
  Stethoscope,
  ShoppingBasket,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ALL_PRESCRIPTIONS,
  CLINICAL_CATEGORIES,
  DOSAGE_FORMS,
  DRUG_BOX_ASSETS,
  SESSIONS_INFO,
} from './data/prescriptionsData';
import {
  ClinicalCategory,
  DosageForm,
  ExamHistoryEntry,
  MasteryStatus,
} from './types/prescription';
import {
  calculateDeckStats,
  filterAndSortPrescriptions,
  StudyFilters,
} from './utils/studyEngine';
import { PrescriptionStage } from './components/PrescriptionStage';
import { AnswerDeck } from './components/AnswerDeck';
import { ExamSimulator } from './components/ExamSimulator';
import { BlitzMode } from './components/BlitzMode';
import { ArchiveAndShelfView } from './components/ArchiveAndShelfView';
import { DrugsCatalogView } from './components/DrugsCatalogView';
import { DoctorsDirectoryView } from './components/DoctorsDirectoryView';
import { PharmacyShelvesSimulator } from './components/PharmacyShelvesSimulator';

const STORAGE_KEYS = {
  MASTERY: 'rx_exam_mastery_v1',
  BOOKMARKS: 'rx_exam_bookmarks_v1',
  EXAM_HISTORY: 'rx_exam_history_v1',
};

type ActiveMode =
  | 'workbench'
  | 'shelves'
  | 'drugs'
  | 'doctors'
  | 'exam'
  | 'blitz'
  | 'archive';

function getInitialRxFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const rxParam = params.get('rx')?.trim();
    if (!rxParam) return null;
    const found = ALL_PRESCRIPTIONS.find(
      (c) => c.id === rxParam || String(c.rxNumber) === rxParam
    );
    return found ? found.id : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [activeMode, setActiveMode] = useState<ActiveMode>(() =>
    getInitialRxFromUrl() ? 'workbench' : 'workbench'
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Persistent Mastery Map
  const [masteryMap, setMasteryMap] = useState<Record<string, MasteryStatus>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTERY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persistent Bookmarks
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persistent Exam History
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Study Filters
  const [filters, setFilters] = useState<StudyFilters>({
    sessionNumber: 'all',
    category: 'all',
    dosageForm: 'all',
    masteryFilter: 'all',
    searchQuery: '',
    sortByPriority: false,
  });

  const [selectedRxId, setSelectedRxId] = useState<string>(
    () => getInitialRxFromUrl() ?? ALL_PRESCRIPTIONS[0].id
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(masteryMap));
    } catch {
      // Ignore storage quota errors
    }
  }, [masteryMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(examHistory));
    } catch {
      // Ignore storage quota errors
    }
  }, [examHistory]);

  const filteredCards = useMemo(
    () => filterAndSortPrescriptions(ALL_PRESCRIPTIONS, filters, masteryMap, bookmarks),
    [filters, masteryMap, bookmarks]
  );

  const deckStats = useMemo(
    () => calculateDeckStats(ALL_PRESCRIPTIONS, masteryMap),
    [masteryMap]
  );

  // Ensure selectedRxId is valid in current filtered list
  const currentIndex = useMemo(() => {
    const idx = filteredCards.findIndex((c) => c.id === selectedRxId);
    return idx >= 0 ? idx : 0;
  }, [filteredCards, selectedRxId]);

  const currentCard = filteredCards[currentIndex] ?? ALL_PRESCRIPTIONS[0];

  const handlePrevCard = () => {
    if (filteredCards.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredCards.length) % filteredCards.length;
    setSelectedRxId(filteredCards[prevIdx].id);
  };

  const handleNextCard = () => {
    if (filteredCards.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredCards.length;
    setSelectedRxId(filteredCards[nextIdx].id);
  };

  // Global Left/Right arrow navigation in workbench mode
  useEffect(() => {
    if (activeMode !== 'workbench') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePrevCard();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleRateMastery = (
    rxId: string,
    status: MasteryStatus,
    advanceNext: boolean = false
  ) => {
    setMasteryMap((prev) => ({
      ...prev,
      [rxId]: status,
    }));

    if (advanceNext && filteredCards.length > 1) {
      const nextIdx = (currentIndex + 1) % filteredCards.length;
      const nextCard = filteredCards[nextIdx];
      if (nextCard) {
        setSelectedRxId(nextCard.id);
      }
    }
  };

  const handleToggleBookmark = (rxId: string) => {
    setBookmarks((prev) => ({
      ...prev,
      [rxId]: !prev[rxId],
    }));
  };

  const handleApplyExamMasteryUpdates = (
    updates: Record<string, MasteryStatus>,
    historyEntry: ExamHistoryEntry
  ) => {
    setMasteryMap((prev) => ({
      ...prev,
      ...updates,
    }));
    setExamHistory((prev) => [historyEntry, ...prev]);
  };

  const handleJumpToStudyCard = (rxId: string) => {
    setFilters({
      sessionNumber: 'all',
      category: 'all',
      dosageForm: 'all',
      masteryFilter: 'all',
      searchQuery: '',
      sortByPriority: false,
    });
    setSelectedRxId(rxId);
    setActiveMode('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      sessionNumber: 'all',
      category: 'all',
      dosageForm: 'all',
      masteryFilter: 'all',
      searchQuery: '',
      sortByPriority: false,
    });
  };

  const hasActiveFilters =
    filters.sessionNumber !== 'all' ||
    filters.category !== 'all' ||
    filters.dosageForm !== 'all' ||
    filters.masteryFilter !== 'all' ||
    filters.searchQuery !== '' ||
    filters.sortByPriority;

  const showFilterSection =
    activeMode === 'workbench' || activeMode === 'blitz' || activeMode === 'archive';

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 lg:pb-0 overflow-x-hidden"
      dir="rtl"
    >
      {/* Top Clinical Command Header:
          NON-sticky on mobile (relative) so it scrolls out of the way and never blocks the phone screen!
          Sticky only on large desktop screens (lg:sticky lg:top-0). */}
      <header className="relative lg:sticky lg:top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-[1600px] mx-auto space-y-2 lg:space-y-0 lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
          {/* Top Row on Mobile: Compact Brand + Mastery Counters */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-sm sm:text-lg shadow-lg shadow-teal-500/20 shrink-0">
                Rx
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight flex items-center gap-2 truncate">
                  <span className="truncate" dir="ltr">Burnout academy</span>
                  <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-800 shrink-0">
                    ۱۲۹ نسخه • ۱۲ جلسه
                  </span>
                </h1>
                <p className="hidden sm:block text-xs text-slate-400 truncate">
                  آمادگی ۱۰۰٪ امتحان عملی: تشخیص دست‌خط، دارونامه، پزشکان و شبیه‌ساز قفسه
                </p>
              </div>
            </div>

            {/* Compact Mastery Telemetry Counters */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    masteryFilter: f.masteryFilter === 'again' ? 'all' : 'again',
                  }));
                  setActiveMode('workbench');
                }}
                className={`px-2 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                  filters.masteryFilter === 'again'
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/70 hover:bg-rose-900/60'
                }`}
                title="نسخه‌هایی که بلد نبودید (تکرار فوری)"
              >
                <span>🔴</span>
                <span className="hidden md:inline">تکرار:</span>
                <span className="tabular-nums font-extrabold">{deckStats.againCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    masteryFilter: f.masteryFilter === 'hard' ? 'all' : 'hard',
                  }));
                  setActiveMode('workbench');
                }}
                className={`px-2 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                  filters.masteryFilter === 'hard'
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/70 hover:bg-amber-900/60'
                }`}
                title="نسخه‌هایی که شک داشتید"
              >
                <span>🟡</span>
                <span className="hidden md:inline">شک:</span>
                <span className="tabular-nums font-extrabold">{deckStats.hardCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilters((f) => ({
                    ...f,
                    masteryFilter: f.masteryFilter === 'good' ? 'all' : 'good',
                  }));
                  setActiveMode('workbench');
                }}
                className={`px-2 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                  filters.masteryFilter === 'good'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/60'
                }`}
                title="نسخه‌های تثبیت‌شده"
              >
                <span>🟢</span>
                <span className="hidden md:inline">مسلط:</span>
                <span className="tabular-nums font-extrabold">{deckStats.goodCount}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>{deckStats.masteryPercent}٪</span>
              </div>
            </div>
          </div>

          {/* 7 Mode Switcher Tabs: Single-line horizontal scroll on mobile, wrapped bar on desktop */}
          <nav
            aria-label="حالت‌های یادگیری و آزمون"
            className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar"
          >
            <button
              type="button"
              onClick={() => setActiveMode('workbench')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'workbench'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>میز کار نسخه‌خوانی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('shelves')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'shelves'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <ShoppingBasket className="w-3.5 h-3.5" />
              <span>قفسه‌های داروخانه</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('drugs')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'drugs'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-teal-300 hover:bg-slate-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>دارونامه جامع</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('doctors')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'doctors'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-indigo-300 hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>پزشکان و نسخه‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('exam')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'exam'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>شبیه‌ساز امتحان (۳ نسخه)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('blitz')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'blitz'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>مرور برق‌آسا</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('archive')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                activeMode === 'archive'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>بانک ۱۲۹ نسخه و قفسه‌یاب</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Filter & Quick-Jump Bar (shown in Workbench, Blitz, and Archive modes)
          On mobile: compact search + collapsible filter button so it never crowds the mobile viewport! */}
      {showFilterSection && (
        <section
          aria-label="فیلترها و جستجوی نسخه‌ها"
          className="bg-slate-900/70 border-b border-slate-800/80 px-3 sm:px-4 py-2"
        >
          <div className="max-w-[1600px] mx-auto space-y-2">
            {/* Compact Mobile Top Bar: Search + Filter Drawer Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="جستجوی دارو یا شماره نسخه..."
                  aria-label="جستجوی سریع دارو یا نسخه"
                  className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen((o) => !o)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                  mobileFiltersOpen || hasActiveFilters
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/60'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>فیلترها و جلسات ({filteredCards.length})</span>
                {mobileFiltersOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Full Filter Controls: Always visible on desktop (lg:block), collapsible on mobile */}
            <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block space-y-2`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {/* Desktop Search Input */}
                  <div className="hidden lg:block relative min-w-[240px] flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={filters.searchQuery}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                      }
                      placeholder="جستجوی دارو (پنتوپرازول، Wellban، سفتریاکسون، شماره نسخه...)"
                      aria-label="جستجوی دارو یا نسخه"
                      className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  {/* Clinical Shelf Category Filter */}
                  <div className="flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          category: e.target.value as ClinicalCategory | 'all',
                        }))
                      }
                      aria-label="فیلتر دسته دارویی"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-teal-500"
                    >
                      <option value="all">همه قفسه‌های دارویی (۱۰ دسته)</option>
                      {CLINICAL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          قفسه: {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dosage Form Filter */}
                  <select
                    value={filters.dosageForm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dosageForm: e.target.value as DosageForm | 'all',
                      }))
                    }
                    aria-label="فیلتر شکل دارویی"
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-teal-500"
                  >
                    <option value="all">همه اشکال دارویی</option>
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>
                        شکل دارویی: {form}
                      </option>
                    ))}
                  </select>

                  {/* Quick Filter Chips */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        masteryFilter: prev.masteryFilter === 'weak_only' ? 'all' : 'weak_only',
                      }))
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      filters.masteryFilter === 'weak_only'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>فقط نقطه‌ضعف‌ها ({deckStats.againCount + deckStats.hardCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        masteryFilter: prev.masteryFilter === 'starred' ? 'all' : 'starred',
                      }))
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      filters.masteryFilter === 'starred'
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>مهم‌های استاد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        masteryFilter:
                          prev.masteryFilter === 'completed_by_ai' ? 'all' : 'completed_by_ai',
                      }))
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      filters.masteryFilter === 'completed_by_ai'
                        ? 'bg-teal-500 text-slate-950 border-teal-300'
                        : 'bg-slate-950 text-teal-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تکمیل‌شده از دست‌خط ({deckStats.completedFromImageCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        sortByPriority: !prev.sortByPriority,
                      }))
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      filters.sortByPriority
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>اولویت هوشمند SRS</span>
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>حذف فیلترها ({filteredCards.length}/129)</span>
                  </button>
                )}
              </div>

              {/* Row 2: 12 Class Sessions Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, sessionNumber: 'all' }))}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filters.sessionNumber === 'all'
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  همه ۱۲ جلسه (۱۲۹ نسخه)
                </button>
                {SESSIONS_INFO.map((s) => (
                  <button
                    key={s.sessionNumber}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        sessionNumber:
                          prev.sessionNumber === s.sessionNumber ? 'all' : s.sessionNumber,
                      }))
                    }
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      filters.sessionNumber === s.sessionNumber
                        ? 'bg-teal-500 text-slate-950 font-extrabold shadow'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800/90'
                    }`}
                  >
                    {s.title} ({s.rxCount})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {activeMode === 'workbench' && (
          <>
            {filteredCards.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center space-y-3">
                <div className="text-base font-extrabold text-white">
                  هیچ نسخه‌ای با فیلتر انتخاب‌شده مطابقت ندارد.
                </div>
                <p className="text-xs text-slate-400">
                  می‌توانید فیلترها را بازنشانی کنید تا هر ۱۲۹ نسخه نمایش داده شوند.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-extrabold text-xs"
                >
                  نمایش همه ۱۲۹ نسخه
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  {/* Right in RTL: High-Clarity Prescription Optical Stage */}
                  <div className="lg:col-span-6">
                    <PrescriptionStage
                      card={currentCard}
                      mastery={masteryMap[currentCard.id] ?? 'unseen'}
                      isBookmarked={Boolean(bookmarks[currentCard.id])}
                      onToggleBookmark={handleToggleBookmark}
                      onPrevCard={handlePrevCard}
                      onNextCard={handleNextCard}
                      currentIndex={currentIndex}
                      totalFiltered={filteredCards.length}
                    />
                  </div>

                  {/* Left in RTL: Active Recall Answer Deck & Spaced Repetition Bar */}
                  <div className="lg:col-span-6">
                    <AnswerDeck
                      card={currentCard}
                      mastery={masteryMap[currentCard.id] ?? 'unseen'}
                      onRateMastery={handleRateMastery}
                    />
                  </div>
                </div>

                {/* Quick Prescription Number Strip for Fast Navigation */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 mb-2">
                    <span className="font-bold text-slate-300">
                      پرش سریع بین نسخه‌ها ({filteredCards.length} نسخه):
                    </span>
                    <span className="text-[11px]">
                      🔴 تکرار فوری | 🟡 شک داشتم | 🟢 مسلط
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                    {filteredCards.map((c) => {
                      const st = masteryMap[c.id] ?? 'unseen';
                      const isSelected = c.id === currentCard.id;
                      const colorClass =
                        st === 'again'
                          ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                          : st === 'hard'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                          : st === 'good'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800';

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedRxId(c.id)}
                          className={`shrink-0 min-w-[42px] h-8 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${colorClass} ${
                            isSelected
                              ? 'ring-2 ring-teal-400 scale-105 font-extrabold'
                              : 'hover:border-slate-600'
                          }`}
                          title={`نسخه #${c.rxNumber} — ${c.doctorOrTitle} (${c.items.length} قلم)`}
                        >
                          <span>#{c.rxNumber}</span>
                          {c.isStarredByTeacher && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeMode === 'shelves' && (
          <PharmacyShelvesSimulator
            allPrescriptions={ALL_PRESCRIPTIONS}
            onRateMastery={(rxId, status) => handleRateMastery(rxId, status, false)}
          />
        )}

        {activeMode === 'drugs' && (
          <DrugsCatalogView
            allPrescriptions={ALL_PRESCRIPTIONS}
            onSelectPrescription={handleJumpToStudyCard}
          />
        )}

        {activeMode === 'doctors' && (
          <DoctorsDirectoryView
            allPrescriptions={ALL_PRESCRIPTIONS}
            masteryMap={masteryMap}
            onSelectPrescription={handleJumpToStudyCard}
          />
        )}

        {activeMode === 'exam' && (
          <ExamSimulator
            allCards={ALL_PRESCRIPTIONS}
            masteryMap={masteryMap}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onApplyExamMasteryUpdates={handleApplyExamMasteryUpdates}
            examHistory={examHistory}
            onJumpToStudyCard={handleJumpToStudyCard}
          />
        )}

        {activeMode === 'blitz' && (
          <BlitzMode
            cards={filteredCards}
            masteryMap={masteryMap}
            onRateMastery={(rxId, status) => handleRateMastery(rxId, status, false)}
          />
        )}

        {activeMode === 'archive' && (
          <ArchiveAndShelfView
            cards={filteredCards}
            allCards={ALL_PRESCRIPTIONS}
            drugBoxes={DRUG_BOX_ASSETS}
            masteryMap={masteryMap}
            onSelectPrescription={handleJumpToStudyCard}
          />
        )}
      </main>

      {/* Mobile-Only Bottom Quick Navigation Bar (Thumb-friendly, slim 56px height) */}
      <nav
        aria-label="نوار پیمایش سریع موبایل"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 grid grid-cols-5 gap-1"
      >
        <button
          type="button"
          onClick={() => {
            setActiveMode('workbench');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-extrabold transition ${
            activeMode === 'workbench'
              ? 'text-teal-400 bg-teal-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>نسخه‌خوان</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('shelves');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-extrabold transition ${
            activeMode === 'shelves'
              ? 'text-emerald-400 bg-emerald-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBasket className="w-4 h-4 mb-0.5" />
          <span>قفسه دارو</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('drugs');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-extrabold transition ${
            activeMode === 'drugs'
              ? 'text-teal-400 bg-teal-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pill className="w-4 h-4 mb-0.5" />
          <span>دارونامه</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('doctors');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-extrabold transition ${
            activeMode === 'doctors'
              ? 'text-indigo-400 bg-indigo-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-4 h-4 mb-0.5" />
          <span>پزشکان</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('exam');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-extrabold transition ${
            activeMode === 'exam'
              ? 'text-amber-400 bg-amber-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span>آزمون عملی</span>
        </button>
      </nav>
    </div>
  );
}
