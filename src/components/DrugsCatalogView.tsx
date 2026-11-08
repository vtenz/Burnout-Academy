import React, { useState, useMemo } from 'react';
import {
  Search,
  Layers,
  Eye,
  ArrowUpLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  KeyRound,
  Pill,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { ClinicalCategory, PrescriptionCard } from '../types/prescription';
import { CLINICAL_CATEGORIES } from '../data/prescriptionsData';
import {
  AggregatedDrug,
  aggregateAllDrugs,
  groupDrugsByCategory,
  HANDWRITING_CHEAT_CODES,
} from '../utils/catalogAggregator';
import { getPhotoUrl } from '../utils/assetLoader';

interface DrugsCatalogViewProps {
  allPrescriptions: PrescriptionCard[];
  onSelectPrescription: (rxId: string) => void;
}

const CATEGORY_ACCENT: Record<ClinicalCategory, string> = {
  'گوارش و معده': 'border-emerald-700/70 bg-emerald-950/30 text-emerald-300',
  'اعصاب و روان': 'border-violet-700/70 bg-violet-950/30 text-violet-300',
  'قلب، فشار خون و دیابت': 'border-rose-700/70 bg-rose-950/30 text-rose-300',
  'آنتی‌بیوتیک و عفونی': 'border-amber-700/70 bg-amber-950/30 text-amber-300',
  'مسکن، التهاب و مفاصل': 'border-orange-700/70 bg-orange-950/30 text-orange-300',
  'تنفسی، سرماخوردگی و آلرژی': 'border-cyan-700/70 bg-cyan-950/30 text-cyan-300',
  'اطفال و نوزادان': 'border-pink-700/70 bg-pink-950/30 text-pink-300',
  'ویتامین، مکمل و کم‌خونی': 'border-lime-700/70 bg-lime-950/30 text-lime-300',
  'چشمی، پوستی و موضعی': 'border-teal-700/70 bg-teal-950/30 text-teal-300',
  'زنان، اورولوژی و هورمونی': 'border-fuchsia-700/70 bg-fuchsia-950/30 text-fuchsia-300',
};

export const DrugsCatalogView: React.FC<DrugsCatalogViewProps> = ({
  allPrescriptions,
  onSelectPrescription,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDrugKey, setExpandedDrugKey] = useState<string | null>(null);
  const [showCheatCodes, setShowCheatCodes] = useState(false);

  // Interactive Handwriting Mini-Quiz state (Creative Memory Booster)
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const allDrugs = useMemo(() => aggregateAllDrugs(allPrescriptions), [allPrescriptions]);

  const filteredDrugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allDrugs.filter((d) => {
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        d.canonicalPersianName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.englishCues.some((c) => c.toLowerCase().includes(q)) ||
        d.genericOrBrandNotes.some((n) => n.toLowerCase().includes(q))
      );
    });
  }, [allDrugs, selectedCategory, searchQuery]);

  const groupedByCat = useMemo(() => groupDrugsByCategory(filteredDrugs), [filteredDrugs]);

  // Quiz pool from top 30 most frequent drugs that have English cues
  const quizPool = useMemo(
    () => allDrugs.filter((d) => d.englishCues.length > 0).slice(0, 35),
    [allDrugs]
  );

  const currentQuizDrug = quizPool[quizIndex % Math.max(1, quizPool.length)];

  const quizOptions = useMemo(() => {
    if (!currentQuizDrug) return [];
    const others = quizPool
      .filter((d) => d.key !== currentQuizDrug.key)
      .slice(0, 12);
    // Deterministic 3 distractors based on quizIndex
    const d1 = others[(quizIndex * 3) % others.length];
    const d2 = others[(quizIndex * 3 + 1) % others.length];
    const d3 = others[(quizIndex * 3 + 2) % others.length];
    const raw = [currentQuizDrug, d1, d2, d3].filter(Boolean);
    // Rotate position deterministically
    const shift = quizIndex % raw.length;
    return [...raw.slice(shift), ...raw.slice(0, shift)];
  }, [currentQuizDrug, quizPool, quizIndex]);

  const handleAnswerQuiz = (drugKey: string) => {
    if (selectedChoice) return;
    setSelectedChoice(drugKey);
    if (drugKey === currentQuizDrug?.key) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuiz = () => {
    setSelectedChoice(null);
    setQuizIndex((i) => i + 1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Creative Handwriting Decoder Toggle */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-extrabold">
                دارونامه جامع ۱۲۹ نسخه
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                کل داروهای نسخه‌ها به تفکیک دسته‌بندی ({allDrugs.length} گروه دارویی پرتکرار)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              روی هر دارو کلیک کنید تا تمام نسخه‌هایی که آن دارو داخلش آمده است را به همراه عکس و دست‌خط پزشک ببینید.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCheatCodes((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition shadow-lg ${
              showCheatCodes
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border-amber-700/70'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {showCheatCodes
                ? 'بستن رمزگشای سریع دست‌خط'
                : '🔑 رمزهای طلایی تشخیص دست‌خط و مینی‌گیم امتحان'}
            </span>
          </button>
        </div>

        {/* Creative Memory Booster: Handwriting Cheat Codes & Rapid Decoder Quiz */}
        {showCheatCodes && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 12 Golden Cheat Codes */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>۱۲ کلید طلایی تشخیص سریع دست‌خط در ۲ ثانیه (مخصوص امتحان فردا):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {HANDWRITING_CHEAT_CODES.map((hc) => (
                  <div
                    key={hc.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div
                      className="text-xs font-mono font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block"
                      dir="ltr"
                    >
                      {hc.cuePattern}
                    </div>
                    <div className="text-xs font-extrabold text-white">{hc.instantRead}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{hc.trick}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapid Handwriting Cue Mini-Game */}
            <div className="lg:col-span-5 bg-slate-950 border border-indigo-800/70 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-indigo-300">
                    ⚡ مینی‌گیم رمزگشایی سریع دست‌خط انگلیسی
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    قطار پاسخ درست: {streak} 🔥
                  </span>
                </div>

                {currentQuizDrug && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1.5">
                    <div className="text-[11px] text-slate-400">
                      اگر دکتر در نسخه این عبارت را نوشته باشد، کدام دارو را از قفسه می‌آورید؟
                    </div>
                    <div
                      className="text-base sm:text-lg font-mono font-black text-teal-300 tracking-wide py-1"
                      dir="ltr"
                    >
                      {currentQuizDrug.englishCues[0]}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-3">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedChoice === opt.key;
                    const isCorrect = opt.key === currentQuizDrug?.key;
                    let btnStyle =
                      'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800';
                    if (selectedChoice) {
                      if (isCorrect) {
                        btnStyle =
                          'bg-emerald-950/90 text-emerald-200 border-emerald-500 font-extrabold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950/90 text-rose-200 border-rose-500';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleAnswerQuiz(opt.key)}
                        className={`w-full text-right px-3 py-2 rounded-xl border text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                      >
                        <span className="truncate">{opt.canonicalPersianName}</span>
                        {selectedChoice && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {selectedChoice && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedChoice && (
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition"
                >
                  سوال بعدی دست‌خط ←
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام فارسی، انگلیسی یا برند دارو (مثلاً: پنتوس، گاباپنتین، سفتریاکسون...)"
              aria-label="جستجو در بانک داروها"
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک کردن</span>
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
              selectedCategory === 'all'
                ? 'bg-teal-500 text-slate-950 shadow'
                : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            همه دسته‌ها ({allDrugs.length} دارو)
          </button>
          {CLINICAL_CATEGORIES.map((cat) => {
            const count = allDrugs.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat ? 'all' : cat))
                }
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 font-extrabold shadow'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Drug Sections */}
      <div className="space-y-6">
        {CLINICAL_CATEGORIES.map((category) => {
          const drugsInCategory = groupedByCat[category] ?? [];
          if (drugsInCategory.length === 0) return null;

          return (
            <section
              key={category}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Category Banner Header */}
              <div
                className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${CATEGORY_ACCENT[category]}`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    قفسه و دسته دارویی: {category}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 text-xs font-bold text-slate-200 border border-slate-700">
                  {drugsInCategory.length} داروی مجزا در نسخه‌ها
                </span>
              </div>

              {/* Drugs List inside this Category */}
              <div className="divide-y divide-slate-800/80">
                {drugsInCategory.map((drug) => {
                  const isExpanded = expandedDrugKey === drug.key;
                  return (
                    <div key={drug.key} className="p-3.5 sm:p-4 hover:bg-slate-900/60 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill className="w-4 h-4 text-teal-400 shrink-0" />
                            <h4 className="text-sm sm:text-base font-extrabold text-white">
                              {drug.canonicalPersianName}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/70 text-xs font-extrabold">
                              در {drug.prescriptionIds.length} نسخه
                            </span>
                            {drug.forms.map((f) => (
                              <span
                                key={f}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold"
                              >
                                {f}
                              </span>
                            ))}
                          </div>

                          {/* English Handwriting Cues for this drug */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] text-slate-400">دست‌خط پزشک در نسخه‌ها:</span>
                            {drug.englishCues.slice(0, 4).map((cue) => (
                              <span
                                key={cue}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[11px] font-semibold"
                                dir="ltr"
                              >
                                {cue}
                              </span>
                            ))}
                          </div>

                          {drug.genericOrBrandNotes.length > 0 && (
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-500">نکته دارویی و قفسه: </span>
                              <span className="text-indigo-300 font-medium">
                                {drug.genericOrBrandNotes.slice(0, 2).join(' • ')}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* One-Click Button to View All Prescriptions Containing This Drug */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDrugKey((prev) => (prev === drug.key ? null : drug.key))
                          }
                          className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                            isExpanded
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg'
                              : 'bg-slate-950 hover:bg-slate-800 text-teal-300 border-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {isExpanded
                              ? 'بستن لیست نسخه‌ها'
                              : `مشاهده ${drug.prescriptionIds.length} نسخه حاوی این دارو`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Prescriptions Drawer for this Drug */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {drug.occurrences.map((occ, idx) => (
                            <div
                              key={`${occ.rxId}-${occ.item.id}-${idx}`}
                              className="bg-slate-950 border border-slate-800 hover:border-teal-500/60 rounded-xl p-2.5 flex items-center gap-3 transition"
                            >
                              <img
                                src={getPhotoUrl(occ.photoIds[0])}
                                alt={occ.doctorOrTitle}
                                className="w-16 h-16 object-cover rounded-lg border border-slate-800 shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <a
                                    href={`?rx=${encodeURIComponent(occ.rxId)}`}
                                    onClick={(e) => {
                                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                                        e.preventDefault();
                                        onSelectPrescription(occ.rxId);
                                      }
                                    }}
                                    className="px-2 py-0.5 rounded bg-teal-950 hover:bg-teal-900 text-teal-300 text-[11px] font-extrabold transition"
                                  >
                                    نسخه #{occ.rxNumber} ({occ.sessionTitle})
                                  </a>
                                </div>
                                <div className="text-xs font-bold text-white truncate">
                                  {occ.doctorOrTitle}
                                </div>
                                <div
                                  className="text-[11px] font-mono text-amber-300 truncate"
                                  dir="ltr"
                                >
                                  {occ.item.englishCue}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => onSelectPrescription(occ.rxId)}
                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-teal-400 hover:text-teal-300"
                                  >
                                    <span>باز کردن در میز کار</span>
                                    <ArrowUpLeft className="w-3 h-3" />
                                  </button>
                                  <span className="text-slate-700">|</span>
                                  <a
                                    href={`?rx=${encodeURIComponent(occ.rxId)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-[11px] font-extrabold transition"
                                    title="باز کردن این نسخه در تب جدید روی میز کار نسخه‌خوانی"
                                  >
                                    <span>تب جدید</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
