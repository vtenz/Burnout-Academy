import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  ChevronRight,
  ChevronLeft,
  Target,
  Layers,
  CheckCircle2,
  ExternalLink,
  ArrowUpLeft,
  Eye,
  ZoomIn,
  Flame,
  MapPin,
  PackageCheck,
} from 'lucide-react';
import { PrescriptionCard } from '../types/prescription';
import { getPhotoUrl, getRealShelfPhotoUrl } from '../utils/assetLoader';
import {
  REAL_EXAM_SHELVES,
  REAL_SHELF_HOTSPOTS,
  RankedExamPrescription,
  MatchedItemShelfAnnotation,
  rankPrescriptionsByShelfProbability,
} from '../utils/realShelfAnnotator';

interface RealExamShelvesViewProps {
  allPrescriptions: PrescriptionCard[];
  onSelectPrescription: (rxId: string) => void;
}

type TierFilter = 'all' | 'very-high' | 'high' | 'medium' | 'low';
type ViewSubMode = 'ranked-prescriptions' | 'shelf-atlas';

export const RealExamShelvesView: React.FC<RealExamShelvesViewProps> = ({
  allPrescriptions,
  onSelectPrescription,
}) => {
  const [viewSubMode, setViewSubMode] = useState<ViewSubMode>('ranked-prescriptions');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [selectedAtlasShelfId, setSelectedAtlasShelfId] = useState<number>(1);
  const [zoomedShelfPhoto, setZoomedShelfPhoto] = useState<{
    shelfPhotoId: number;
    title: string;
    annotations: MatchedItemShelfAnnotation[];
  } | null>(null);

  const rankedList = useMemo(
    () => rankPrescriptionsByShelfProbability(allPrescriptions),
    [allPrescriptions]
  );

  const tierCounts = useMemo(() => {
    return {
      all: rankedList.length,
      'very-high': rankedList.filter((r) => r.probabilityTier === 'very-high').length,
      high: rankedList.filter((r) => r.probabilityTier === 'high').length,
      medium: rankedList.filter((r) => r.probabilityTier === 'medium').length,
      low: rankedList.filter((r) => r.probabilityTier === 'low').length,
    };
  }, [rankedList]);

  const filteredRankedList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rankedList.filter((entry) => {
      if (tierFilter !== 'all' && entry.probabilityTier !== tierFilter) {
        return false;
      }
      if (!q) return true;
      const rx = entry.prescription;
      if (String(rx.rxNumber).includes(q)) return true;
      if (rx.doctorOrTitle.toLowerCase().includes(q)) return true;
      if (rx.sessionTitle.toLowerCase().includes(q)) return true;
      if (
        rx.items.some(
          (it) =>
            it.persianName.toLowerCase().includes(q) ||
            it.englishCue.toLowerCase().includes(q) ||
            (it.genericOrBrandNote ?? '').toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      if (
        entry.annotations.some(
          (a) =>
            a.shelfTitle.toLowerCase().includes(q) ||
            a.drugOnShelfTitle.toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      return false;
    });
  }, [rankedList, tierFilter, searchQuery]);

  const activeEntry: RankedExamPrescription = useMemo(() => {
    if (filteredRankedList.length === 0) return rankedList[0];
    if (selectedRxId) {
      const found = filteredRankedList.find((r) => r.prescription.id === selectedRxId);
      if (found) return found;
    }
    return filteredRankedList[0];
  }, [filteredRankedList, rankedList, selectedRxId]);

  const activeIndexInFiltered = useMemo(() => {
    const idx = filteredRankedList.findIndex(
      (r) => r.prescription.id === activeEntry.prescription.id
    );
    return idx >= 0 ? idx : 0;
  }, [filteredRankedList, activeEntry]);

  const handlePrevRx = () => {
    if (filteredRankedList.length === 0) return;
    const prevIdx =
      (activeIndexInFiltered - 1 + filteredRankedList.length) %
      filteredRankedList.length;
    setSelectedRxId(filteredRankedList[prevIdx].prescription.id);
    setFocusedItemIndex(null);
  };

  const handleNextRx = () => {
    if (filteredRankedList.length === 0) return;
    const nextIdx = (activeIndexInFiltered + 1) % filteredRankedList.length;
    setSelectedRxId(filteredRankedList[nextIdx].prescription.id);
    setFocusedItemIndex(null);
  };

  // Group the active prescription's item annotations by shelfPhotoId so we show each needed shelf photo
  // with all the prescription's drugs on that shelf circled and numbered!
  const shelfGroupsForActiveRx = useMemo(() => {
    const sourceAnnotations =
      focusedItemIndex !== null
        ? activeEntry.annotations.filter((a) => a.itemIndex === focusedItemIndex)
        : activeEntry.annotations;

    const byShelf = new Map<number, MatchedItemShelfAnnotation[]>();
    for (const ann of sourceAnnotations) {
      const existing = byShelf.get(ann.shelfPhotoId) ?? [];
      existing.push(ann);
      byShelf.set(ann.shelfPhotoId, existing);
    }

    return Array.from(byShelf.entries()).map(([shelfPhotoId, annotations]) => {
      const shelfInfo =
        REAL_EXAM_SHELVES.find((s) => s.id === shelfPhotoId) ?? REAL_EXAM_SHELVES[0];
      return {
        shelfPhotoId,
        shelfInfo,
        annotations,
      };
    });
  }, [activeEntry, focusedItemIndex]);

  const activeAtlasShelf = useMemo(
    () =>
      REAL_EXAM_SHELVES.find((s) => s.id === selectedAtlasShelfId) ??
      REAL_EXAM_SHELVES[0],
    [selectedAtlasShelfId]
  );

  const hotspotsOnAtlasShelf = useMemo(
    () => REAL_SHELF_HOTSPOTS.filter((h) => h.shelfPhotoId === selectedAtlasShelfId),
    [selectedAtlasShelfId]
  );

  return (
    <div className="space-y-4">
      {/* Top Command Banner */}
      <div className="bg-gradient-to-l from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-700/60 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                <Flame className="w-3.5 h-3.5" />
                <span>ویژه قفسه‌های واقعی محل آزمون</span>
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-black text-white">
                شکارچی نسخه‌های امتحان روی ۱۷ عکس واقعی قفسه‌های داروخانه آزمون
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تمام ۱۲۹ نسخه از{' '}
              <strong className="text-emerald-300 font-extrabold">
                بیشترین احتمال آمدن در امتحان (رتبه ۱)
              </strong>{' '}
              تا{' '}
              <strong className="text-amber-300 font-extrabold">
                کمترین احتمال (رتبه ۱۲۹)
              </strong>{' '}
              بر اساس داروهای موجود در همین ۱۷ عکس قفسه مرتب شده‌اند و برای هر نسخه،{' '}
              <strong className="text-white font-extrabold">
                دور تک‌تک داروهایش روی عکس واقعی قفسه خط کشیده شده است
              </strong>
              .
            </p>
          </div>

          {/* Sub-mode Toggle: Ranked Prescriptions vs 17-Photo Shelf Atlas */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewSubMode('ranked-prescriptions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                viewSubMode === 'ranked-prescriptions'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>نسخه‌ها به ترتیب شانس امتحان ({rankedList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewSubMode('shelf-atlas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                viewSubMode === 'shelf-atlas'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>اطلس ۱۷ عکس قفسه‌ها</span>
            </button>
          </div>
        </div>

        {viewSubMode === 'ranked-prescriptions' && (
          <>
            {/* Search & Probability Tier Filter Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-2 border-t border-slate-800/80">
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی دارو، شماره نسخه یا نام قفسه (مثلاً: نولپازا، متوهگزال، سفتریاکسون...)"
                  aria-label="جستجو در نسخه‌های قفسه آزمون"
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="lg:col-span-7 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  type="button"
                  onClick={() => setTierFilter('all')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    tierFilter === 'all'
                      ? 'bg-teal-500 text-slate-950 border-teal-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  همه به ترتیب شانس ({tierCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('very-high')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    tierFilter === 'very-high'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/50'
                  }`}
                >
                  🔥 احتمال بسیار بالا ۱۰۰٪ ({tierCounts['very-high']})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('high')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    tierFilter === 'high'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                      : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/70 hover:bg-cyan-900/50'
                  }`}
                >
                  ✅ شانس بالا ({tierCounts.high})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('medium')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    tierFilter === 'medium'
                      ? 'bg-amber-400 text-slate-950 border-amber-200'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/70 hover:bg-amber-900/50'
                  }`}
                >
                  🟡 شانس متوسط ({tierCounts.medium})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('low')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                    tierFilter === 'low'
                      ? 'bg-slate-300 text-slate-950 border-white'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  ⚪ شانس کمتر ({tierCounts.low})
                </button>
              </div>
            </div>

            {/* Horizontal Ranked Prescription Selector Strip */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  فهرست نسخه‌ها از <strong className="text-white">رتبه ۱ (بیشترین شانس امتحان)</strong> تا <strong className="text-white">رتبه آخر</strong> — روی هر نسخه بزنید تا جای دقیق داروهایش در قفسه‌ها خط کشیده شود:
                </span>
                <span className="text-emerald-300 font-bold">
                  نمایش {filteredRankedList.length} نسخه
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {filteredRankedList.map((entry) => {
                  const isSelected =
                    entry.prescription.id === activeEntry.prescription.id;
                  const tierBadgeColor =
                    entry.probabilityTier === 'very-high'
                      ? 'border-emerald-500/70 bg-emerald-950/70 text-emerald-200'
                      : entry.probabilityTier === 'high'
                      ? 'border-cyan-600/70 bg-cyan-950/60 text-cyan-200'
                      : entry.probabilityTier === 'medium'
                      ? 'border-amber-600/70 bg-amber-950/60 text-amber-200'
                      : 'border-slate-700 bg-slate-900 text-slate-400';

                  return (
                    <button
                      key={entry.prescription.id}
                      type="button"
                      onClick={() => {
                        setSelectedRxId(entry.prescription.id);
                        setFocusedItemIndex(null);
                      }}
                      className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-right transition flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-white font-black shadow-lg scale-[1.02]'
                          : `${tierBadgeColor} hover:bg-slate-800`
                      }`}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          isSelected
                            ? 'bg-slate-950 text-emerald-300'
                            : 'bg-slate-950/90 text-amber-300'
                        }`}
                      >
                        رتبه {entry.rank}
                      </span>
                      <span className="text-xs font-extrabold">
                        نسخه #{entry.prescription.rxNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? 'text-slate-900' : 'opacity-80'
                        }`}
                      >
                        ({entry.exactMatchCount}/{entry.totalItems} در قفسه)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= SUB-MODE 1: RANKED PRESCRIPTIONS + VISUAL SHELF ANNOTATIONS ================= */}
      {viewSubMode === 'ranked-prescriptions' && activeEntry && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* RIGHT/TOP COLUMN (5 cols on desktop): Active Prescription Image & Numbered Drug Items */}
          <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3.5 lg:sticky lg:top-16">
            {/* Rank & Navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevRx}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="نسخه قبلی در رتبه‌بندی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black">
                  رتبه شانس امتحان: {activeEntry.rank} از {rankedList.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextRx}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="نسخه بعدی در رتبه‌بندی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                  احتمال: {activeEntry.probabilityScore}٪
                </span>
                <a
                  href={`?rx=${encodeURIComponent(activeEntry.prescription.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/70 text-xs font-extrabold transition"
                  title="باز کردن این نسخه در تب جدید روی میز کار"
                >
                  <span>تب جدید</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Prescription Title & Probability Explanation */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  نسخه #{activeEntry.prescription.rxNumber} —{' '}
                  {activeEntry.prescription.doctorOrTitle}
                </h3>
                <span className="text-xs font-bold text-teal-300">
                  {activeEntry.prescription.sessionTitle}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-emerald-300 font-bold">
                  {activeEntry.probabilityLabel}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  {activeEntry.exactMatchCount} از {activeEntry.totalItems} قلم دارو مستقیماً در عکس قفسه‌ها رویت شد
                </span>
              </div>
            </div>

            {/* Prescription Photo Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={getPhotoUrl(activeEntry.prescription.photoIds[0])}
                alt={activeEntry.prescription.doctorOrTitle}
                className="w-full max-h-[260px] object-contain mx-auto"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectPrescription(activeEntry.prescription.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-teal-500 hover:text-slate-950 text-teal-300 border border-teal-500/50 text-[11px] font-extrabold transition flex items-center gap-1 shadow-lg"
                >
                  <span>باز کردن در میز کار</span>
                  <ArrowUpLeft className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Interactive List of Prescription Items with Color-Coded Shelf Pointers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-200">
                  اقلام دارویی نسخه (روی هر قلم بزنید تا فقط قفسه همان دارو زوم شود):
                </span>
                {focusedItemIndex !== null && (
                  <button
                    type="button"
                    onClick={() => setFocusedItemIndex(null)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-black transition"
                  >
                    نمایش همه {activeEntry.totalItems} قلم با هم
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                {activeEntry.annotations.map((ann) => {
                  const isFocused = focusedItemIndex === ann.itemIndex;
                  return (
                    <button
                      key={`${activeEntry.prescription.id}-item-${ann.itemIndex}`}
                      type="button"
                      onClick={() =>
                        setFocusedItemIndex((prev) =>
                          prev === ann.itemIndex ? null : ann.itemIndex
                        )
                      }
                      className={`w-full text-right p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                        isFocused
                          ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/40'
                          : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800'
                      }`}
                    >
                      {/* Numbered Color Badge matching the Circle on the Shelf Photo */}
                      <span
                        className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border ${ann.badgeBgClass}`}
                      >
                        {ann.itemIndex}
                      </span>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm font-extrabold text-white">
                            {ann.item.persianName}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300 font-mono text-[11px] font-bold"
                            dir="ltr"
                          >
                            {ann.item.englishCue}
                          </span>
                        </div>

                        {/* Exact Shelf & Row Instruction */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-bold">
                            <MapPin className="w-3 h-3" />
                            <span>{ann.shelfTitle}</span>
                          </span>
                          <span className="text-amber-300 font-bold">
                            • {ann.rowLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <span className="text-slate-300 font-bold">جعبه در قفسه: </span>
                          {ann.boxVisualCue}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LEFT/MAIN COLUMN (7 cols on desktop): Real Shelf Photos with Drawn Circles/Boxes Around Every Drug of This Prescription */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    مکان دقیق داروهای «نسخه #{activeEntry.prescription.rxNumber}» روی عکس قفسه‌های آزمون
                  </h3>
                  <p className="text-xs text-slate-400">
                    دور هر دارو با همان{' '}
                    <strong className="text-white font-bold">
                      شماره و رنگ قلم نسخه (۱ تا {activeEntry.totalItems})
                    </strong>{' '}
                    خط کشیده شده است تا در جلسه امتحان بلافاصله آن را از قفسه بردارید.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-extrabold text-teal-300">
                تعداد قفسه‌های مورد مراجعه: {shelfGroupsForActiveRx.length} قفسه
              </span>
            </div>

            {shelfGroupsForActiveRx.map((group) => (
              <div
                key={`rx-${activeEntry.prescription.id}-shelf-${group.shelfPhotoId}`}
                className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-3.5 sm:p-4"
              >
                {/* Shelf Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black">
                        عکس قفسه شماره {group.shelfPhotoId}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {group.shelfInfo.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تابلوی بالای قفسه در داروخانه:{' '}
                      <span className="text-amber-300 font-bold">
                        «{group.shelfInfo.signLabel}»
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setZoomedShelfPhoto({
                        shelfPhotoId: group.shelfPhotoId,
                        title: group.shelfInfo.title,
                        annotations: group.annotations,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-extrabold transition"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>بزرگ‌نمایی تمام‌صفحه قفسه</span>
                  </button>
                </div>

                {/* Annotated Real Shelf Photo Container */}
                <div className="relative w-full max-w-[640px] mx-auto rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 select-none">
                  <img
                    src={getRealShelfPhotoUrl(group.shelfPhotoId)}
                    alt={group.shelfInfo.title}
                    className="w-full h-auto block"
                  />

                  {/* SVG & HTML Overlay Drawing Glowing Circles / Boxes Around Each Matched Drug */}
                  {group.annotations.map((ann, idxOnShelf) => {
                    // Slight offset if two items in the same prescription point to the exact same hotspot
                    const duplicateOffset =
                      group.annotations
                        .slice(0, idxOnShelf)
                        .filter((prev) => prev.hotspotId === ann.hotspotId).length * 1.5;

                    const left = Math.max(1, Math.min(92, ann.rect.x + duplicateOffset));
                    const top = Math.max(1, Math.min(92, ann.rect.y + duplicateOffset));
                    const width = Math.max(6, Math.min(96 - left, ann.rect.w));
                    const height = Math.max(5, Math.min(96 - top, ann.rect.h));

                    return (
                      <div
                        key={`overlay-${ann.itemIndex}-${ann.hotspotId}`}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                          borderColor: ann.colorHex,
                        }}
                        className="absolute border-[3px] sm:border-4 rounded-xl pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.85)]"
                      >
                        {/* Pulsing Outer Ring */}
                        <div
                          style={{ borderColor: ann.colorHex }}
                          className="absolute -inset-1.5 rounded-2xl border-2 border-dashed animate-pulse opacity-90"
                        />

                        {/* Inner Semi-Transparent Highlight Tint */}
                        <div
                          style={{ backgroundColor: ann.colorHex }}
                          className="w-full h-full opacity-20 rounded-lg"
                        />

                        {/* Floating Callout Label Pill attached to the Box */}
                        <div
                          className={`absolute -top-7 right-0 z-10 px-2 py-0.5 rounded-lg border text-[10px] sm:text-xs font-black whitespace-nowrap shadow-xl flex items-center gap-1 ${ann.badgeBgClass}`}
                        >
                          <span>قلم {ann.itemIndex}:</span>
                          <span className="max-w-[150px] sm:max-w-[220px] truncate">
                            {ann.item.persianName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Step-by-Step Picking Guide Below the Shelf Photo */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-extrabold text-emerald-300">
                    راهنمای برداشتن از «{group.shelfInfo.title}»:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {group.annotations.map((ann) => (
                      <div
                        key={`guide-${ann.itemIndex}`}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border ${ann.badgeBgClass}`}
                          >
                            {ann.itemIndex}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-black text-white">
                                {ann.item.persianName}
                              </span>
                              <span className="text-[11px] text-teal-300 font-bold">
                                ← در قفسه: {ann.drugOnShelfTitle}
                              </span>
                            </div>
                            <div className="text-xs text-amber-300 font-bold">
                              📍 جای دقیق: {ann.rowLabel}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              📦 مشخصه جعبه: {ann.boxVisualCue}
                            </div>
                          </div>
                        </div>

                        <div
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300 font-mono text-xs font-bold self-start sm:self-center shrink-0"
                          dir="ltr"
                        >
                          {ann.item.englishCue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUB-MODE 2: 17-PHOTO INTERACTIVE SHELF ATLAS ================= */}
      {viewSubMode === 'shelf-atlas' && (
        <div className="space-y-4">
          {/* Shelf Selector Pills (1..17) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold text-slate-300">
              انتخاب قفسه از بین ۱۷ عکس واقعی داروخانه محل آزمون:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {REAL_EXAM_SHELVES.map((shelf) => {
                const isSelected = shelf.id === selectedAtlasShelfId;
                return (
                  <button
                    key={shelf.id}
                    type="button"
                    onClick={() => setSelectedAtlasShelfId(shelf.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {shelf.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Shelf Atlas View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-white">
                    {activeAtlasShelf.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeAtlasShelf.description}
                  </p>
                </div>
              </div>

              <div className="relative w-full max-w-[640px] mx-auto rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950">
                <img
                  src={getRealShelfPhotoUrl(activeAtlasShelf.id)}
                  alt={activeAtlasShelf.title}
                  className="w-full h-auto block"
                />
                {hotspotsOnAtlasShelf.map((hs, idx) => (
                  <div
                    key={hs.id}
                    style={{
                      left: `${hs.rect.x}%`,
                      top: `${hs.rect.y}%`,
                      width: `${hs.rect.w}%`,
                      height: `${hs.rect.h}%`,
                    }}
                    className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded-lg pointer-events-none"
                  >
                    <span className="absolute -top-5 right-0 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black whitespace-nowrap shadow">
                      {idx + 1}. {hs.drugTitle.split('(')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>چیدمان طبقه به طبقه «{activeAtlasShelf.title}»:</span>
              </h4>

              <div className="space-y-2">
                {activeAtlasShelf.rowsSummary.map((rowText, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed"
                  >
                    {rowText}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-xs font-extrabold text-teal-300">
                  داروهای مهم مشخص‌شده روی این قفسه ({hotspotsOnAtlasShelf.length} بخش):
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {hotspotsOnAtlasShelf.map((hs, idx) => (
                    <div
                      key={hs.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                    >
                      <div className="text-xs font-extrabold text-white">
                        {idx + 1}. {hs.drugTitle}
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold">
                        📍 {hs.rowLabel}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        📦 {hs.boxVisualCue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Modal for Annotated Shelf Photo */}
      {zoomedShelfPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto"
          onClick={() => setZoomedShelfPhoto(null)}
        >
          <div
            className="max-w-3xl w-full mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-black text-white">
                {zoomedShelfPhoto.title} — نسخه #{activeEntry.prescription.rxNumber}
              </h3>
              <button
                type="button"
                onClick={() => setZoomedShelfPhoto(null)}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-extrabold"
              >
                بستن بزرگ‌نمایی ✕
              </button>
            </div>

            <div className="relative w-full rounded-xl overflow-hidden border border-slate-800">
              <img
                src={getRealShelfPhotoUrl(zoomedShelfPhoto.shelfPhotoId)}
                alt={zoomedShelfPhoto.title}
                className="w-full h-auto block"
              />
              {zoomedShelfPhoto.annotations.map((ann) => (
                <div
                  key={`zoom-${ann.itemIndex}-${ann.hotspotId}`}
                  style={{
                    left: `${ann.rect.x}%`,
                    top: `${ann.rect.y}%`,
                    width: `${ann.rect.w}%`,
                    height: `${ann.rect.h}%`,
                    borderColor: ann.colorHex,
                  }}
                  className="absolute border-4 rounded-xl pointer-events-none"
                >
                  <div
                    className={`absolute -top-7 right-0 px-2.5 py-0.5 rounded-lg border text-xs font-black whitespace-nowrap shadow-xl ${ann.badgeBgClass}`}
                  >
                    قلم {ann.itemIndex}: {ann.item.persianName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
