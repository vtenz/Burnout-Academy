import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  FlaskConical,
  Ban,
  FileSearch,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DosageForm, MasteryStatus, PrescriptionCard } from '../types/prescription';

interface AnswerDeckProps {
  card: PrescriptionCard;
  mastery: MasteryStatus;
  onRateMastery: (rxId: string, status: MasteryStatus, advanceNext?: boolean) => void;
}

const FORM_BADGE_STYLE: Record<DosageForm, string> = {
  'قرص': 'bg-sky-950/90 text-sky-300 border-sky-700/70',
  'کپسول': 'bg-violet-950/90 text-violet-300 border-violet-700/70',
  'آمپول': 'bg-rose-950/90 text-rose-300 border-rose-700/70',
  'شربت / سوسپانسیون': 'bg-amber-950/90 text-amber-300 border-amber-700/70',
  'پماد / کرم / ژل': 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70',
  'قطره / اسپری': 'bg-cyan-950/90 text-cyan-300 border-cyan-700/70',
  'سرم': 'bg-blue-950/90 text-blue-300 border-blue-700/70',
  'شیاف / پودر / متفرقه': 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-700/70',
};

export const AnswerDeck: React.FC<AnswerDeckProps> = ({
  card,
  mastery,
  onRateMastery,
}) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [showVisualClue, setShowVisualClue] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  // Reset reveal state when switching to a new prescription
  useEffect(() => {
    setRevealedIds({});
    setShowVisualClue(false);
    setShowRawText(false);
  }, [card.id]);

  const allRevealed =
    card.items.length > 0 && card.items.every((item) => revealedIds[item.id]);

  const revealedCount = card.items.filter((item) => revealedIds[item.id]).length;

  const handleRevealAll = () => {
    const next: Record<string, boolean> = {};
    for (const item of card.items) {
      next[item.id] = true;
    }
    setRevealedIds(next);
    setShowVisualClue(true);
  };

  const handleHideAll = () => {
    setRevealedIds({});
  };

  const handleRevealNextItem = () => {
    const firstHidden = card.items.find((item) => !revealedIds[item.id]);
    if (firstHidden) {
      setRevealedIds((prev) => ({ ...prev, [firstHidden.id]: true }));
    }
  };

  const toggleItemReveal = (itemId: string) => {
    setRevealedIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Keyboard shortcuts: Space to reveal all, 1/2/3 to rate
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!allRevealed) {
          handleRevealAll();
        } else {
          handleHideAll();
        }
      } else if (e.key === '1') {
        onRateMastery(card.id, 'again', true);
      } else if (e.key === '2') {
        onRateMastery(card.id, 'hard', true);
      } else if (e.key === '3') {
        onRateMastery(card.id, 'good', true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Answer Deck Header */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{card.doctorOrTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            قفسه اصلی: <span className="text-teal-300 font-semibold">{card.primaryCategory}</span> •
            سختی دست‌خط: <span className="text-slate-200 font-semibold">{card.handwritingDifficulty}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!allRevealed ? (
            <>
              <button
                type="button"
                onClick={handleRevealNextItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
              >
                نمایش قلم بعدی ({revealedCount}/{card.items.length})
              </button>
              <button
                type="button"
                onClick={handleRevealAll}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-teal-500/20 transition"
              >
                <Eye className="w-4 h-4" />
                <span>مشاهده کامل جواب (Space)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleHideAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <EyeOff className="w-4 h-4" />
              <span>مخفی کردن مجدد جواب‌ها</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Pattern Clue Banner (2-second recognition anchor) */}
      <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/50 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-200 ml-1">رمز تشخیص ۲ ثانیه‌ای نسخه در امتحان:</span>
            {showVisualClue || allRevealed ? (
              <span className="text-slate-200 font-medium">{card.visualClue}</span>
            ) : (
              <span className="text-slate-400 italic">
                قبل از دیدن جواب، از روی شکل کلی نسخه و دست‌خط حدس بزنید...
              </span>
            )}
          </div>
        </div>
        {!allRevealed && (
          <button
            type="button"
            onClick={() => setShowVisualClue((s) => !s)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 text-xs font-semibold border border-indigo-700/60 transition"
          >
            {showVisualClue ? 'پنهان کردن سرنخ' : 'نمایش سرنخ ظاهری'}
          </button>
        )}
      </div>

      {/* AI Handwriting Completion / Multi-photo Audit Alert */}
      {card.auditNote && (
        <div className="px-4 py-2 bg-teal-950/40 border-b border-teal-800/50 flex items-start gap-2 text-xs text-teal-200">
          <FileSearch className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">تکمیل و پالایش هوشمند نسخه: </span>
            <span>{card.auditNote}</span>
          </div>
        </div>
      )}

      {/* Medications List (Step-by-step or Full Reveal) */}
      <div className="flex-1 lg:max-h-[460px] overflow-y-auto p-3.5 sm:p-4 space-y-3">
        {card.items.map((item, idx) => {
          const isRevealed = Boolean(revealedIds[item.id]);

          if (!isRevealed) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItemReveal(item.id)}
                className="w-full text-right p-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-teal-500/60 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-300 group-hover:text-teal-300 transition">
                      قلم دارویی شماره {idx + 1} — در ذهن خود بخوانید و کلیک کنید
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      سرنخ شکل دارویی: <span className="text-teal-400 font-semibold">{item.form}</span> • قفسه:{' '}
                      <span className="text-slate-300">{item.shelfCategory}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-slate-800 group-hover:bg-teal-500/20 text-slate-300 group-hover:text-teal-300 text-xs font-semibold transition">
                  نمایش قلم {idx + 1}
                </span>
              </button>
            );
          }

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition ${
                item.isCrossedOut
                  ? 'bg-rose-950/25 border-rose-800/70'
                  : item.isAddedFromImage
                  ? 'bg-teal-950/25 border-teal-700/70'
                  : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-teal-300 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                      FORM_BADGE_STYLE[item.form]
                    }`}
                  >
                    {item.form}
                  </span>

                  <h3 className="text-base font-extrabold text-white">
                    {item.persianName}
                  </h3>

                  {item.dosage && item.dosage !== '—' && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-xs font-bold">
                      دوز: {item.dosage}
                    </span>
                  )}

                  {item.quantity && item.quantity !== '—' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 text-xs font-bold">
                      تعداد: {item.quantity}
                    </span>
                  )}
                </div>

                {/* English Doctor Handwriting Cue */}
                <span
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-teal-300 font-mono text-xs font-semibold tracking-wide"
                  dir="ltr"
                  title="نحوه نگارش انگلیسی در دست‌خط پزشک"
                >
                  {item.englishCue}
                </span>
              </div>

              {/* Generic/Brand note & Instructions */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  {item.genericOrBrandNote && (
                    <div className="text-slate-300">
                      <span className="text-slate-400">نام ژنریک / تجاری در قفسه: </span>
                      <span className="font-semibold text-indigo-300">{item.genericOrBrandNote}</span>
                    </div>
                  )}
                  <div className="text-slate-300">
                    <span className="text-slate-400">دستور مصرف و نکته تحویل: </span>
                    <span className="font-medium text-slate-100">{item.instructions}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[11px]">
                  <Layers className="w-3 h-3 text-teal-400" />
                  قفسه: {item.shelfCategory}
                </span>
              </div>

              {/* Special Callouts: Crossed out, Compounded, or Transcribed from Handwriting */}
              {(item.isCrossedOut || item.isCompounded || item.isAddedFromImage) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.isCrossedOut && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950 text-rose-200 border border-rose-700 text-xs font-bold">
                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                      خط‌خورده در نسخه — در امتحان از قفسه نیاورید!
                    </span>
                  )}
                  {item.isCompounded && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950 text-amber-200 border border-amber-700 text-xs font-bold">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                      داروی ترکیبی (نیاز به ظرف خالی برای ترکیب)
                    </span>
                  )}
                  {item.isAddedFromImage && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-950 text-teal-200 border border-teal-700 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      استخراج‌شده مستقیم از دست‌خط عکس (جامانده در کپشن تلگرام)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Collapsible Raw Channel Caption */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowRawText((s) => !s)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 text-xs font-medium transition"
          >
            <span>مشاهده متن خام ارسالی در کانال تلگرام (`result.txt`)</span>
            {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showRawText && (
            <pre className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {card.rawChannelText}
            </pre>
          )}
        </div>
      </div>

      {/* Bottom Sticky Spaced Repetition Rating Bar */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
          <span className="font-semibold text-slate-300">
            سنجش تسلط شما روی این نسخه (کلیدهای میانبر ۱، ۲، ۳):
          </span>
          <span>پس از ثبت، خودکار به نسخه بعدی می‌رود</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onRateMastery(card.id, 'again', true)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border font-bold transition ${
              mastery === 'again'
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/25'
                : 'bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border-rose-800/80'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>🔴 بلد نبودم</span>
            </div>
            <span className="text-[11px] opacity-85 font-normal mt-0.5">
              تکرار فوری (کلید ۱)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onRateMastery(card.id, 'hard', true)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border font-bold transition ${
              mastery === 'hard'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25'
                : 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 border-amber-800/80'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>🟡 شک داشتم / ناقص</span>
            </div>
            <span className="text-[11px] opacity-85 font-normal mt-0.5">
              مرور مجدد (کلید ۲)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onRateMastery(card.id, 'good', true)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border font-bold transition ${
              mastery === 'good'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/25'
                : 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border-emerald-800/80'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>🟢 کاملاً مسلطم</span>
            </div>
            <span className="text-[11px] opacity-85 font-normal mt-0.5">
              تثبیت شد (کلید ۳)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
