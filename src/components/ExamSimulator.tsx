import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Flame,
  Star,
  ClipboardCheck,
  ArrowLeft,
  History,
} from 'lucide-react';
import {
  ExamHistoryEntry,
  ExamRxAttempt,
  MasteryStatus,
  PrescriptionCard,
} from '../types/prescription';
import {
  drawExamPrescriptions,
  evaluateExamSubmission,
  ExamEvaluationSummary,
} from '../utils/studyEngine';
import { PrescriptionStage } from './PrescriptionStage';

interface ExamSimulatorProps {
  allCards: PrescriptionCard[];
  masteryMap: Record<string, MasteryStatus>;
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (rxId: string) => void;
  onApplyExamMasteryUpdates: (
    updates: Record<string, MasteryStatus>,
    historyEntry: ExamHistoryEntry
  ) => void;
  examHistory: ExamHistoryEntry[];
  onJumpToStudyCard: (rxId: string) => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  allCards,
  masteryMap,
  bookmarks,
  onToggleBookmark,
  onApplyExamMasteryUpdates,
  examHistory,
  onJumpToStudyCard,
}) => {
  const [drawMode, setDrawMode] = useState<'random' | 'weak_focus' | 'starred_focus'>('random');
  const [examCards, setExamCards] = useState<PrescriptionCard[]>(() =>
    drawExamPrescriptions(allCards, 3, 'random', masteryMap)
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, ExamRxAttempt>>({});
  const [scratchpad, setScratchpad] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submittedSummary, setSubmittedSummary] = useState<ExamEvaluationSummary | null>(null);

  // Initialize attempts whenever examCards change
  useEffect(() => {
    const initial: Record<string, ExamRxAttempt> = {};
    for (const c of examCards) {
      initial[c.id] = {
        rxId: c.id,
        revealed: false,
        itemResults: {},
      };
    }
    setAttempts(initial);
    setScratchpad({});
    setActiveTabIndex(0);
    setElapsedSeconds(0);
    setSubmittedSummary(null);
  }, [examCards]);

  // Live exam timer
  useEffect(() => {
    if (submittedSummary) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submittedSummary]);

  const startNewExam = (mode: 'random' | 'weak_focus' | 'starred_focus' = drawMode) => {
    setDrawMode(mode);
    const nextCards = drawExamPrescriptions(allCards, 3, mode, masteryMap);
    setExamCards(nextCards);
  };

  const currentCard = examCards[activeTabIndex] ?? examCards[0];
  const currentAttempt = attempts[currentCard?.id] ?? {
    rxId: currentCard?.id ?? '',
    revealed: false,
    itemResults: {},
  };

  const handleRevealCurrentRx = () => {
    if (!currentCard) return;
    setAttempts((prev) => {
      const existing = prev[currentCard.id];
      // Default all items to true so student can uncheck any they missed, or toggle individually
      const defaultResults: Record<string, boolean> = {};
      for (const item of currentCard.items) {
        defaultResults[item.id] = existing?.itemResults?.[item.id] ?? true;
      }
      return {
        ...prev,
        [currentCard.id]: {
          rxId: currentCard.id,
          revealed: true,
          itemResults: defaultResults,
        },
      };
    });
  };

  const handleToggleItemResult = (rxId: string, itemId: string, correct: boolean) => {
    setAttempts((prev) => ({
      ...prev,
      [rxId]: {
        rxId,
        revealed: true,
        itemResults: {
          ...(prev[rxId]?.itemResults ?? {}),
          [itemId]: correct,
        },
      },
    }));
  };

  const handleMarkAllItemsForCurrentRx = (correct: boolean) => {
    if (!currentCard) return;
    const nextMap: Record<string, boolean> = {};
    for (const item of currentCard.items) {
      nextMap[item.id] = correct;
    }
    setAttempts((prev) => ({
      ...prev,
      [currentCard.id]: {
        rxId: currentCard.id,
        revealed: true,
        itemResults: nextMap,
      },
    }));
  };

  const handleSubmitExam = () => {
    const summary = evaluateExamSubmission(examCards, attempts);
    setSubmittedSummary(summary);

    const entry: ExamHistoryEntry = {
      id: `exam-${Date.now()}`,
      timestamp: Date.now(),
      rxIds: examCards.map((c) => c.id),
      totalItems: summary.totalItems,
      correctItems: summary.correctItems,
      scorePercent: summary.scorePercent,
      durationSeconds: elapsedSeconds,
    };
    onApplyExamMasteryUpdates(summary.rxMasteryUpdates, entry);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentCard) return null;

  return (
    <div className="space-y-4">
      {/* Top Exam Control Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
              شبیه‌ساز امتحان عملی فردا
            </span>
            <h2 className="text-lg font-extrabold text-white">
              آزمون ۳ نسخه‌ای تصادفی (تشخیص دست‌خط و قفسه‌یابی)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دقیقاً مشابه جلسه امتحان: ۳ نسخه تصادفی به شما داده شده است. ابتدا بدون دیدن جواب داروها را تشخیص دهید، سپس پاسخ را باز کنید و تیک بزنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => startNewExam('random')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              drawMode === 'random'
                ? 'bg-teal-500 text-slate-950 border-teal-400'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>۳ نسخه کاملاً تصادفی جدید</span>
          </button>

          <button
            type="button"
            onClick={() => startNewExam('weak_focus')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              drawMode === 'weak_focus'
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-800 text-rose-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>۳ نسخه از نقطه‌ضعف‌های من</span>
          </button>

          <button
            type="button"
            onClick={() => startNewExam('starred_focus')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              drawMode === 'starred_focus'
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-slate-800 text-amber-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>۳ نسخه از مهم‌های استاد</span>
          </button>
        </div>
      </div>

      {/* Exam Report Card (shown when submitted) */}
      {submittedSummary && (
        <div className="bg-slate-900 border-2 border-teal-500/70 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
                  submittedSummary.passedExam
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                }`}
              >
                {submittedSummary.scorePercent}%
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>کارنامه آزمون عملی ۳ نسخه‌ای</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      submittedSummary.passedExam
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {submittedSummary.passedExam ? 'قبول با تسلط بالا' : 'نیاز به تکرار نسخه‌های خطا'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  تعداد اقلام درست تشخیص داده‌شده:{' '}
                  <strong className="text-emerald-300">{submittedSummary.correctItems}</strong> از{' '}
                  <strong>{submittedSummary.totalItems}</strong> قلم دارو • زمان صرف‌شده:{' '}
                  <strong>{formatTime(elapsedSeconds)}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startNewExam(drawMode)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>شروع یک آزمون ۳ نسخه‌ای جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {examCards.map((card, idx) => {
              const att = attempts[card.id];
              const correctCount = card.items.filter((i) => att?.itemResults?.[i.id]).length;
              const status = submittedSummary.rxMasteryUpdates[card.id];
              return (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-300">
                        نسخه {idx + 1} آزمون (#{card.rxNumber})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          status === 'good'
                            ? 'bg-emerald-950 text-emerald-300'
                            : status === 'hard'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {correctCount} از {card.items.length} قلم درست
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">{card.doctorOrTitle}</div>
                    <p className="text-xs text-slate-400 mt-1">{card.visualClue}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToStudyCard(card.id)}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold transition"
                  >
                    <span>مرور عمیق این نسخه در میز کار</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3 Prescription Selector Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {examCards.map((card, idx) => {
          const att = attempts[card.id];
          const isRevealed = Boolean(att?.revealed);
          const correctCount = card.items.filter((i) => att?.itemResults?.[i.id]).length;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveTabIndex(idx)}
              className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                activeTabIndex === idx
                  ? 'bg-teal-950/80 border-teal-500 text-white shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-teal-400">
                  نسخه {idx + 1} از ۳ (شماره #{card.rxNumber})
                </div>
                <div className="text-sm font-extrabold mt-0.5 truncate max-w-[200px]">
                  {card.items.length} قلم دارو • {card.sessionTitle}
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isRevealed
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isRevealed ? `${correctCount}/${card.items.length} درست` : 'در انتظار پاسخ'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Exam Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <PrescriptionStage
            card={currentCard}
            mastery={masteryMap[currentCard.id] ?? 'unseen'}
            isBookmarked={Boolean(bookmarks[currentCard.id])}
            onToggleBookmark={onToggleBookmark}
            compactHeader
          />
        </div>

        <div className="lg:col-span-5 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">
                برگه پاسخ‌نامه عملی — نسخه {activeTabIndex + 1} از ۳
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                سرنخ آزمون: این نسخه دقیقاً شامل{' '}
                <strong className="text-teal-300">{currentCard.items.length} قلم دارو</strong> است.
              </p>
            </div>

            {!currentAttempt.revealed && (
              <button
                type="button"
                onClick={handleRevealCurrentRx}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
              >
                <Eye className="w-4 h-4" />
                <span>مشاهده جواب و ثبت تیک</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Mental Scratchpad before revealing */}
            <div>
              <label
                htmlFor="exam-scratchpad"
                className="block text-xs font-bold text-slate-300 mb-1.5"
              >
                یادداشت ذهنی یا تایپ داروهای تشخیص‌داده‌شده قبل از دیدن جواب (اختیاری):
              </label>
              <textarea
                id="exam-scratchpad"
                rows={2}
                value={scratchpad[currentCard.id] ?? ''}
                onChange={(e) =>
                  setScratchpad((prev) => ({ ...prev, [currentCard.id]: e.target.value }))
                }
                placeholder={`نام ${currentCard.items.length} قلم داروی این نسخه، دوز و تعدادشان را در ذهن بگویید یا اینجا بنویسید...`}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {!currentAttempt.revealed ? (
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-dashed border-slate-700 text-center space-y-3">
                <ClipboardCheck className="w-10 h-10 text-teal-400 mx-auto" />
                <div className="text-sm font-extrabold text-white">
                  آماده بررسی اقلام نسخه {activeTabIndex + 1} هستید؟
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  تصویر نسخه را با دقت زوم کنید، هر {currentCard.items.length} قلم دارو را همراه با شکل دارویی و دوز به خاطر بیاورید و سپس دکمه زیر را بزنید.
                </p>
                <button
                  type="button"
                  onClick={handleRevealCurrentRx}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>نمایش اقلام نسخه و نمره‌دهی</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-semibold">
                    کدام اقلام را درست تشخیص دادید؟
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMarkAllItemsForCurrentRx(true)}
                      className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold"
                    >
                      همه درست
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAllItemsForCurrentRx(false)}
                      className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold"
                    >
                      همه نادرست
                    </button>
                  </div>
                </div>

                {currentCard.items.map((item, idx) => {
                  const isCorrect = Boolean(currentAttempt.itemResults[item.id]);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition ${
                        isCorrect
                          ? 'bg-emerald-950/20 border-emerald-700/70'
                          : 'bg-rose-950/25 border-rose-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-teal-300">
                              قلم {idx + 1}:
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-bold">
                              {item.form}
                            </span>
                            <span className="text-sm font-extrabold text-white">
                              {item.persianName}
                            </span>
                            {item.dosage !== '—' && (
                              <span className="text-xs text-amber-300 font-bold">
                                ({item.dosage})
                              </span>
                            )}
                          </div>
                          <div
                            className="text-xs font-mono text-teal-300 mt-1"
                            dir="ltr"
                          >
                            {item.englishCue}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            تعداد: {item.quantity} • دستور: {item.instructions}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleItemResult(currentCard.id, item.id, true)
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>درست گفتم</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleItemResult(currentCard.id, item.id, false)
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
                              !isCorrect
                                ? 'bg-rose-600 text-white border-rose-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>جا انداختم</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exam Footer Navigation & Final Submit */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {activeTabIndex < 2 ? (
                <button
                  type="button"
                  onClick={() => setActiveTabIndex((i) => Math.min(2, i + 1))}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  رفتن به نسخه بعدی آزمون ({activeTabIndex + 2} از ۳)
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  هر ۳ نسخه را بررسی کردید؟ کارنامه را صادر کنید:
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
            >
              <Award className="w-4 h-4" />
              <span>پایان آزمون و ثبت در سیستم مرور هوشمند</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previous Exam Attempts History */}
      {examHistory.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <h4 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 mb-2.5">
            <History className="w-4 h-4 text-teal-400" />
            <span>تاریخچه آزمون‌های شبیه‌ساز شما ({examHistory.length} آزمون ثبت‌شده)</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {examHistory.slice(0, 8).map((h, i) => (
              <div
                key={h.id}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
              >
                <span className="text-slate-400">آزمون #{examHistory.length - i}:</span>
                <span
                  className={`font-extrabold ${
                    h.scorePercent >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {h.scorePercent}% ({h.correctItems}/{h.totalItems} قلم)
                </span>
                <span className="text-slate-500">• {formatTime(h.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
