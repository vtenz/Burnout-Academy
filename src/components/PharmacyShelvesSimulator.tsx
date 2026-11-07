import React, { useState, useMemo } from 'react';
import {
  Shuffle,
  ShoppingBasket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  SunMedium,
  Trash2,
  Award,
  Layers,
} from 'lucide-react';
import {
  ClinicalCategory,
  DosageForm,
  MasteryStatus,
  PrescriptionCard,
} from '../types/prescription';
import { CLINICAL_CATEGORIES } from '../data/prescriptionsData';
import {
  AggregatedDrug,
  aggregateAllDrugs,
  evaluateShelfBasket,
  groupDrugsByCategory,
  ShelfBasketEvaluation,
} from '../utils/catalogAggregator';
import { getPhotoUrl } from '../utils/assetLoader';

interface PharmacyShelvesSimulatorProps {
  allPrescriptions: PrescriptionCard[];
  onRateMastery: (rxId: string, status: MasteryStatus) => void;
}

const SHELF_HEADER_THEME: Record<
  ClinicalCategory,
  { border: string; headerBg: string; badge: string; boxStripe: string }
> = {
  'گوارش و معده': {
    border: 'border-emerald-700/70',
    headerBg: 'from-emerald-950/90 via-slate-900 to-slate-950',
    badge: 'bg-emerald-500 text-slate-950',
    boxStripe: 'bg-emerald-500',
  },
  'اعصاب و روان': {
    border: 'border-violet-700/70',
    headerBg: 'from-violet-950/90 via-slate-900 to-slate-950',
    badge: 'bg-violet-400 text-slate-950',
    boxStripe: 'bg-violet-500',
  },
  'قلب، فشار خون و دیابت': {
    border: 'border-rose-700/70',
    headerBg: 'from-rose-950/90 via-slate-900 to-slate-950',
    badge: 'bg-rose-400 text-slate-950',
    boxStripe: 'bg-rose-500',
  },
  'آنتی‌بیوتیک و عفونی': {
    border: 'border-amber-700/70',
    headerBg: 'from-amber-950/90 via-slate-900 to-slate-950',
    badge: 'bg-amber-400 text-slate-950',
    boxStripe: 'bg-amber-500',
  },
  'مسکن، التهاب و مفاصل': {
    border: 'border-orange-700/70',
    headerBg: 'from-orange-950/90 via-slate-900 to-slate-950',
    badge: 'bg-orange-400 text-slate-950',
    boxStripe: 'bg-orange-500',
  },
  'تنفسی، سرماخوردگی و آلرژی': {
    border: 'border-cyan-700/70',
    headerBg: 'from-cyan-950/90 via-slate-900 to-slate-950',
    badge: 'bg-cyan-400 text-slate-950',
    boxStripe: 'bg-cyan-500',
  },
  'اطفال و نوزادان': {
    border: 'border-pink-700/70',
    headerBg: 'from-pink-950/90 via-slate-900 to-slate-950',
    badge: 'bg-pink-400 text-slate-950',
    boxStripe: 'bg-pink-500',
  },
  'ویتامین، مکمل و کم‌خونی': {
    border: 'border-lime-700/70',
    headerBg: 'from-lime-950/90 via-slate-900 to-slate-950',
    badge: 'bg-lime-400 text-slate-950',
    boxStripe: 'bg-lime-500',
  },
  'چشمی، پوستی و موضعی': {
    border: 'border-teal-700/70',
    headerBg: 'from-teal-950/90 via-slate-900 to-slate-950',
    badge: 'bg-teal-400 text-slate-950',
    boxStripe: 'bg-teal-500',
  },
  'زنان، اورولوژی و هورمونی': {
    border: 'border-fuchsia-700/70',
    headerBg: 'from-fuchsia-950/90 via-slate-900 to-slate-950',
    badge: 'bg-fuchsia-400 text-slate-950',
    boxStripe: 'bg-fuchsia-500',
  },
};

const FORM_PACKAGE_LABEL: Record<DosageForm, string> = {
  'قرص': 'جعبه قرص (Tab)',
  'کپسول': 'جعبه کپسول (Cap)',
  'آمپول': 'پک آمپول/ویال (Amp)',
  'شربت / سوسپانسیون': 'شیشه شربت (Syr)',
  'پماد / کرم / ژل': 'تیوپ پماد/کرم (Oint)',
  'قطره / اسپری': 'قطره / اسپری (Drop/Spray)',
  'سرم': 'کیسه سرم (Serum)',
  'شیاف / پودر / متفرقه': 'شیاف / ساشه',
};

export const PharmacyShelvesSimulator: React.FC<PharmacyShelvesSimulatorProps> = ({
  allPrescriptions,
  onRateMastery,
}) => {
  const allDrugs = useMemo(() => aggregateAllDrugs(allPrescriptions), [allPrescriptions]);
  const allDrugsMap = useMemo(
    () => new Map<string, AggregatedDrug>(allDrugs.map((d) => [d.key, d])),
    [allDrugs]
  );

  const [targetRxId, setTargetRxId] = useState<string>(allPrescriptions[0]?.id ?? 'rx-1');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [showRxOnMobile, setShowRxOnMobile] = useState(true);

  const [shelfFilter, setShelfFilter] = useState<ClinicalCategory | 'all'>('all');
  const [shelfSearch, setShelfSearch] = useState('');
  const [pickedKeys, setPickedKeys] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<ShelfBasketEvaluation | null>(null);

  const targetRx = useMemo(
    () => allPrescriptions.find((r) => r.id === targetRxId) ?? allPrescriptions[0],
    [allPrescriptions, targetRxId]
  );

  const activeItemsCount = useMemo(
    () => targetRx.items.filter((i) => !i.isCrossedOut).length,
    [targetRx]
  );

  const filteredDrugs = useMemo(() => {
    const q = shelfSearch.trim().toLowerCase();
    return allDrugs.filter((d) => {
      if (shelfFilter !== 'all' && d.category !== shelfFilter) return false;
      if (!q) return true;
      return (
        d.canonicalPersianName.toLowerCase().includes(q) ||
        d.englishCues.some((c) => c.toLowerCase().includes(q)) ||
        d.genericOrBrandNotes.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [allDrugs, shelfFilter, shelfSearch]);

  const groupedByShelf = useMemo(() => groupDrugsByCategory(filteredDrugs), [filteredDrugs]);

  const handleSelectNewRx = (newId: string) => {
    setTargetRxId(newId);
    setActivePhotoIdx(0);
    setZoom(1);
    setPickedKeys([]);
    setEvaluation(null);
  };

  const handlePickRandomRx = () => {
    const randomIdx = Math.floor(Math.random() * allPrescriptions.length);
    handleSelectNewRx(allPrescriptions[randomIdx].id);
  };

  const handleToggleDrugInBasket = (drugKey: string) => {
    setEvaluation(null);
    setPickedKeys((prev) =>
      prev.includes(drugKey) ? prev.filter((k) => k !== drugKey) : [...prev, drugKey]
    );
  };

  const handleSubmitBasket = () => {
    const result = evaluateShelfBasket(targetRx, pickedKeys, allDrugsMap);
    setEvaluation(result);
    if (result.isPerfect) {
      onRateMastery(targetRx.id, 'good');
    } else if (result.scorePercent >= 60) {
      onRateMastery(targetRx.id, 'hard');
    } else {
      onRateMastery(targetRx.id, 'again');
    }
  };

  const currentPhotoId = targetRx.photoIds[activePhotoIdx] ?? targetRx.photoIds[0];

  return (
    <div className="space-y-4">
      {/* Top Pharmacy Counter Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold">
                شبیه‌ساز قفسه‌های واقعی داروخانه
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                نسخه را بخوانید و داروها را از توی قفسه‌های داروخانه بردارید!
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              دقیقاً مثل امتحان عملی فردا: از روی دست‌خط نسخه، داروها را از بین قفسه‌های طبقه‌بندی‌شده انتخاب کنید و دکمه «تحویل سبد دارو» را بزنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={targetRx.id}
              onChange={(e) => handleSelectNewRx(e.target.value)}
              aria-label="انتخاب شماره نسخه برای قفسه‌یابی"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-bold outline-none focus:border-teal-500 max-w-[230px]"
            >
              {allPrescriptions.map((r) => (
                <option key={r.id} value={r.id}>
                  نسخه #{r.rxNumber} — {r.doctorOrTitle.slice(0, 32)} ({r.items.length} قلم)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handlePickRandomRx}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>نسخه تصادفی جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Result Modal/Banner when Basket is Submitted */}
      {evaluation && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border-2 shadow-2xl space-y-4 ${
            evaluation.isPerfect
              ? 'bg-emerald-950/30 border-emerald-500'
              : 'bg-slate-900 border-amber-500/80'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base ${
                  evaluation.isPerfect
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {evaluation.scorePercent}%
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span>
                    {evaluation.isPerfect
                      ? 'آفرین! تمام داروهای نسخه را بی‌نقص از قفسه آوردید!'
                      : 'نتیجه بررسی سبد دارویی شما توسط استاد'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  درست برداشته‌شده: <strong className="text-emerald-300">{evaluation.correctlyPicked.length}</strong> •
                  جامانده از نسخه: <strong className="text-rose-300">{evaluation.missedFromRx.length}</strong> •
                  اشتباه برداشته‌شده: <strong className="text-amber-300">{evaluation.wronglyPicked.length}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickedKeys([]);
                  setEvaluation(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تلاش مجدد روی همین نسخه</span>
              </button>
              <button
                type="button"
                onClick={handlePickRandomRx}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>نسخه بعدی</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Correctly Picked */}
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-2">
              <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>داروهایی که درست از قفسه آوردید ({evaluation.correctlyPicked.length}):</span>
              </div>
              {evaluation.correctlyPicked.length === 0 ? (
                <p className="text-slate-500">هیچ داروی درستی انتخاب نشد.</p>
              ) : (
                <div className="space-y-1.5">
                  {evaluation.correctlyPicked.map((d) => (
                    <div
                      key={d.key}
                      className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-100 font-bold"
                    >
                      ✓ {d.canonicalPersianName}
                      <span className="block text-[11px] text-emerald-400 font-normal mt-0.5">
                        قفسه: {d.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missed Items from Prescription */}
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-800/60 space-y-2">
              <div className="font-extrabold text-rose-300 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>داروهای جامانده که از قفسه نیاوردید ({evaluation.missedFromRx.length}):</span>
              </div>
              {evaluation.missedFromRx.length === 0 ? (
                <p className="text-emerald-400 font-semibold">هیچ دارویی را جا نینداختید! عالی!</p>
              ) : (
                <div className="space-y-1.5">
                  {evaluation.missedFromRx.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-100"
                    >
                      <div className="font-extrabold">
                        ✗ [{item.form}] {item.persianName}
                      </div>
                      <div className="text-[11px] font-mono text-teal-300 mt-0.5" dir="ltr">
                        دست‌خط نسخه: {item.englishCue}
                      </div>
                      <div className="text-[11px] text-amber-300 mt-0.5">
                        باید از قفسه «{item.shelfCategory}» برمی‌داشتید!
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wrongly Picked or Crossed-Out Mistakes */}
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/60 space-y-2">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>داروهای اشتباه یا خط‌خورده در سبد ({evaluation.wronglyPicked.length}):</span>
              </div>
              {evaluation.wronglyPicked.length === 0 ? (
                <p className="text-slate-400">داروی اضافی یا اشتباهی برنداشتید.</p>
              ) : (
                <div className="space-y-1.5">
                  {evaluation.wronglyPicked.map((d) => (
                    <div
                      key={d.key}
                      className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-100 font-bold"
                    >
                      ⚠ {d.canonicalPersianName}
                      <span className="block text-[11px] text-amber-300 font-normal mt-0.5">
                        این دارو در نسخه نبود (یا خط خورده بود).
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout: Prescription Counter + Pharmacy Shelves Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Right/Top Column: Prescription on the Counter + Dispensing Basket */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
          {/* Prescription Card on Counter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-950 text-teal-300 border border-teal-700 text-xs font-extrabold">
                  نسخه #{targetRx.rxNumber}
                </span>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[160px] sm:max-w-[220px]">
                  {targetRx.sessionTitle} • {activeItemsCount} قلم فعال
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowRxOnMobile((s) => !s)}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 text-xs font-bold"
              >
                {showRxOnMobile ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showRxOnMobile ? 'جمع کردن عکس نسخه' : 'نمایش عکس نسخه'}</span>
              </button>
            </div>

            {targetRx.photoIds.length > 1 && showRxOnMobile && (
              <div className="px-3 py-1.5 bg-teal-950/30 border-b border-teal-800/40 flex items-center gap-1.5 overflow-x-auto">
                {targetRx.photoIds.map((pid, idx) => (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      activePhotoIdx === idx
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    تصویر {idx + 1}
                  </button>
                ))}
              </div>
            )}

            <div className={`${showRxOnMobile ? 'block' : 'hidden lg:block'}`}>
              <div className="relative bg-slate-950 min-h-[260px] max-h-[360px] flex items-center justify-center overflow-hidden p-2">
                <img
                  src={getPhotoUrl(currentPhotoId)}
                  alt={targetRx.doctorOrTitle}
                  className={`max-h-[330px] w-auto object-contain rounded-lg transition-transform ${
                    highContrast ? 'contrast-150 brightness-105 saturate-50' : ''
                  }`}
                  style={{ transform: `scale(${zoom})` }}
                />

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-slate-700 text-xs shadow-lg">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.3).toFixed(1))))}
                    className="p-1 text-slate-200 hover:text-teal-300"
                    aria-label="بزرگ‌نمایی نسخه"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-300" dir="ltr">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, Number((z - 0.3).toFixed(1))))}
                    className="p-1 text-slate-200 hover:text-teal-300"
                    aria-label="کوچک‌نمایی نسخه"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="h-3.5 w-px bg-slate-700 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setHighContrast((c) => !c)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                      highContrast ? 'bg-teal-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    <SunMedium className="w-3 h-3" />
                    <span>وضوح</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dispensing Basket Tray */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-300">
                  <ShoppingBasket className="w-4 h-4" />
                  <span>
                    سبد تحویل دارو ({pickedKeys.length} از {activeItemsCount} داروی موردنیاز)
                  </span>
                </div>
                {pickedKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPickedKeys([]);
                      setEvaluation(null);
                    }}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>خالی کردن سبد</span>
                  </button>
                )}
              </div>

              {pickedKeys.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900/70 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  هنوز دارویی از قفسه‌ها برنداشته‌اید. از قفسه‌های روبرو داروهای این نسخه را انتخاب کنید.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[130px] overflow-y-auto">
                  {pickedKeys.map((k) => {
                    const d = allDrugsMap.get(k);
                    if (!d) return null;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleToggleDrugInBasket(k)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950 text-teal-200 border border-teal-700 text-xs font-bold hover:bg-rose-950 hover:text-rose-200 hover:border-rose-700 transition"
                        title="حذف از سبد"
                      >
                        <span className="truncate max-w-[180px]">{d.canonicalPersianName}</span>
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitBasket}
                className="w-full py-2.5 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition"
              >
                <Award className="w-4 h-4" />
                <span>ثبت و تحویل سبد دارو به استاد (Submit)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Left/Bottom Column: The Physical Pharmacy Shelves */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shelf Navigation & Quick Search */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shelfSearch}
                  onChange={(e) => setShelfSearch(e.target.value)}
                  placeholder="جستجوی سریع نام دارو روی قفسه‌های داروخانه..."
                  aria-label="جستجوی دارو در قفسه‌ها"
                  className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              {shelfSearch && (
                <button
                  type="button"
                  onClick={() => setShelfSearch('')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  پاک کردن
                </button>
              )}
            </div>

            {/* Quick Jump to Shelf Section Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setShelfFilter('all')}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                  shelfFilter === 'all'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                همه ۱۰ قفسه داروخانه
              </button>
              {CLINICAL_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setShelfFilter((prev) => (prev === cat ? 'all' : cat))}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    shelfFilter === cat
                      ? 'bg-teal-500 text-slate-950 font-extrabold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  قفسه {idx + 1}: {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Realistic Pharmacy Shelf Units */}
          <div className="space-y-5">
            {CLINICAL_CATEGORIES.map((category, shelfIdx) => {
              const shelfDrugs = groupedByShelf[category] ?? [];
              if (shelfDrugs.length === 0) return null;
              const theme = SHELF_HEADER_THEME[category];

              return (
                <div
                  key={category}
                  className={`rounded-2xl border-2 ${theme.border} bg-slate-950 overflow-hidden shadow-2xl`}
                >
                  {/* Illuminated Top Pharmacy Signage */}
                  <div
                    className={`px-4 py-2.5 bg-gradient-to-l ${theme.headerBg} border-b border-slate-800 flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-black ${theme.badge}`}
                      >
                        قفسه #{shelfIdx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-400" />
                        <span>{category}</span>
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {shelfDrugs.length} ردیف دارو
                    </span>
                  </div>

                  {/* Physical Shelf Interior with Medication Boxes */}
                  <div className="p-3 sm:p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950 to-slate-950">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {shelfDrugs.map((drug) => {
                        const isPicked = pickedKeys.includes(drug.key);
                        const primaryForm = drug.forms[0] ?? 'قرص';

                        return (
                          <button
                            key={drug.key}
                            type="button"
                            onClick={() => handleToggleDrugInBasket(drug.key)}
                            className={`group relative text-right rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-md ${
                              isPicked
                                ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/50 -translate-y-0.5'
                                : 'bg-slate-900/95 hover:bg-slate-800/90 border-slate-700/80 hover:border-teal-500/60 hover:-translate-y-0.5'
                            }`}
                          >
                            {/* Top Pharmaceutical Box Color Stripe */}
                            <div
                              className={`h-1.5 w-full ${
                                isPicked ? 'bg-emerald-400' : theme.boxStripe
                              }`}
                            />

                            <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                              <div>
                                {/* Package Type & Picked Check */}
                                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                                  <span className="font-semibold truncate">
                                    {FORM_PACKAGE_LABEL[primaryForm]}
                                  </span>
                                  {isPicked && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                                      ✓ در سبد
                                    </span>
                                  )}
                                </div>

                                {/* Persian Drug Name on Box */}
                                <div className="text-xs font-extrabold text-white leading-snug line-clamp-2">
                                  {drug.canonicalPersianName}
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                                {/* English Label on Drug Box */}
                                {drug.englishCues[0] && (
                                  <div
                                    className="text-[10px] font-mono text-teal-300 truncate bg-slate-950/90 px-1.5 py-0.5 rounded"
                                    dir="ltr"
                                  >
                                    {drug.englishCues[0]}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400">
                                    {drug.dosages[0] ?? primaryForm}
                                  </span>
                                  <span
                                    className={`font-extrabold ${
                                      isPicked
                                        ? 'text-emerald-300'
                                        : 'text-teal-400 group-hover:text-teal-300'
                                    }`}
                                  >
                                    {isPicked ? 'برداشته شد' : '+ برداشتن'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom 3D Shelf Ledge Shadow */}
                            <div className="h-1 w-full bg-gradient-to-r from-amber-900/40 via-amber-700/50 to-amber-900/40" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Physical Shelf Wooden/Metallic Rail */}
                    <div className="mt-3 h-2.5 w-full rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-t border-slate-600/60 shadow-inner" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
