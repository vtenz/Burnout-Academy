import React, { useState, useEffect } from 'react';
import {
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Shuffle,
} from 'lucide-react';
import { MasteryStatus, PrescriptionCard } from '../types/prescription';
import { getPhotoUrl } from '../utils/assetLoader';

interface BlitzModeProps {
  cards: PrescriptionCard[];
  masteryMap: Record<string, MasteryStatus>;
  onRateMastery: (rxId: string, status: MasteryStatus) => void;
}

export const BlitzMode: React.FC<BlitzModeProps> = ({
  cards,
  masteryMap,
  onRateMastery,
}) => {
  const [deck, setDeck] = useState<PrescriptionCard[]>(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setRevealed(false);
  }, [cards]);

  const currentCard = deck[index] ?? deck[0];

  const handleShuffleDeck = () => {
    const copy = [...deck];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setDeck(copy);
    setIndex(0);
    setRevealed(false);
  };

  const handleRateAndNext = (status: MasteryStatus) => {
    if (!currentCard) return;
    onRateMastery(currentCard.id, status);
    setRevealed(false);
    setIndex((i) => (i + 1) % deck.length);
  };

  if (!currentCard) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-300">
        نسخه‌ای با فیلتر فعلی یافت نشد.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Blitz Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              مرور برق‌آسا و تثبیت حافظه تصویری (Speed-Run)
            </h2>
            <p className="text-xs text-slate-400">
              مخصوص مرور شب امتحان و صبح روز آزمون: در ۳ ثانیه به دست‌خط نگاه کنید، رمز تصویری و اقلام را بگویید و رد شوید!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffleDeck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-400" />
            <span>بُر زدن تصادفی کارت‌ها</span>
          </button>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                setIndex((i) => (i - 1 + deck.length) % deck.length);
              }}
              className="p-1.5 text-slate-300 hover:text-white"
              aria-label="کارت قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-teal-300 tabular-nums">
              {index + 1} / {deck.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                setIndex((i) => (i + 1) % deck.length);
              }}
              className="p-1.5 text-slate-300 hover:text-white"
              aria-label="کارت بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Flashcard Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[420px]">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="font-bold text-teal-300">
              نسخه #{currentCard.rxNumber} ({currentCard.sessionTitle})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-200 border border-indigo-700/60 font-bold">
              تعداد کل اقلام: {currentCard.items.length} قلم
            </span>
          </div>
          <img
            src={getPhotoUrl(currentCard.photoIds[0])}
            alt={currentCard.doctorOrTitle}
            className="max-h-[400px] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
                <Lightbulb className="w-4 h-4" />
                <span>رمز تشخیص سریع ظاهری (Visual Hook):</span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                {currentCard.visualClue}
              </p>
            </div>

            {!revealed ? (
              <div className="py-12 text-center space-y-4">
                <div className="text-base font-extrabold text-slate-200">
                  این نسخه دارای {currentCard.items.length} قلم دارو در دسته «{currentCard.primaryCategory}» است.
                </div>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/20 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>برگرداندن کارت و مشاهده فوری داروها</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {currentCard.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded bg-slate-800 text-teal-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        [{item.form}]
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {item.persianName}
                      </span>
                      {item.dosage !== '—' && (
                        <span className="text-xs text-slate-300">({item.dosage})</span>
                      )}
                      {item.quantity !== '—' && (
                        <span className="text-xs text-emerald-400 font-bold">
                          × {item.quantity}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-mono text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0"
                      dir="ltr"
                    >
                      {item.englishCue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRateAndNext('again')}
                className="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>🔴 بلد نبودم</span>
              </button>
              <button
                type="button"
                onClick={() => handleRateAndNext('hard')}
                className="p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>🟡 شک داشتم</span>
              </button>
              <button
                type="button"
                onClick={() => handleRateAndNext('good')}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>🟢 مسلطم (بعدی)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
