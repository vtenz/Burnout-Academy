import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  SunMedium,
  Bookmark,
  Star,
  Columns,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import { MasteryStatus, PrescriptionCard } from '../types/prescription';
import { getPhotoUrl } from '../utils/assetLoader';

interface PrescriptionStageProps {
  card: PrescriptionCard;
  mastery: MasteryStatus;
  isBookmarked: boolean;
  onToggleBookmark: (rxId: string) => void;
  onPrevCard?: () => void;
  onNextCard?: () => void;
  currentIndex?: number;
  totalFiltered?: number;
  compactHeader?: boolean;
}

const MASTERY_BADGE: Record<
  MasteryStatus,
  { label: string; className: string; dotColor: string }
> = {
  unseen: {
    label: 'مرور نشده',
    className: 'bg-slate-800/90 text-slate-300 border-slate-700',
    dotColor: 'bg-slate-400',
  },
  again: {
    label: 'نیاز به تکرار فوری',
    className: 'bg-rose-950/90 text-rose-200 border-rose-700/80',
    dotColor: 'bg-rose-500',
  },
  hard: {
    label: 'شک داشتم / ناقص',
    className: 'bg-amber-950/90 text-amber-200 border-amber-700/80',
    dotColor: 'bg-amber-400',
  },
  good: {
    label: 'مسلط (تثبیت‌شده)',
    className: 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80',
    dotColor: 'bg-emerald-400',
  },
};

export const PrescriptionStage: React.FC<PrescriptionStageProps> = ({
  card,
  mastery,
  isBookmarked,
  onToggleBookmark,
  onPrevCard,
  onNextCard,
  currentIndex,
  totalFiltered,
  compactHeader = false,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAllPhotosSideBySide, setShowAllPhotosSideBySide] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [highContrastInk, setHighContrastInk] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fullscreenModal, setFullscreenModal] = useState(false);

  // Reset viewer state when prescription changes
  useEffect(() => {
    setActivePhotoIndex(0);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setShowAllPhotosSideBySide(card.photoIds.length > 1);
  }, [card.id, card.photoIds.length]);

  const handleZoomIn = () => setZoom((z) => Math.min(3.5, Number((z + 0.35).toFixed(2))));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, Number((z - 0.35).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const currentPhotoId = card.photoIds[activePhotoIndex] ?? card.photoIds[0];
  const masteryInfo = MASTERY_BADGE[mastery];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/90 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {onPrevCard && onNextCard && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-1">
              <button
                type="button"
                onClick={onPrevCard}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
                title="نسخه قبلی (کلید راست)"
                aria-label="نسخه قبلی"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-300 tabular-nums">
                {(currentIndex ?? 0) + 1} / {totalFiltered ?? 129}
              </span>
              <button
                type="button"
                onClick={onNextCard}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
                title="نسخه بعدی (کلید چپ)"
                aria-label="نسخه بعدی"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-950/90 text-teal-300 border border-teal-700/60">
            نسخه #{card.rxNumber}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {card.sessionTitle} ({card.sessionDate})
          </span>

          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800"
            dir="ltr"
          >
            {card.photoIds.map((id) => `photo_${id}`).join(' + ')}
          </span>

          {card.isStarredByTeacher && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              نسخه مهم استاد
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pre-reveal Item Count Clue */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-950/90 text-indigo-200 border border-indigo-700/70">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>تعداد اقلام: {card.items.length} قلم دارو</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${masteryInfo.className}`}
          >
            <span className={`w-2 h-2 rounded-full ${masteryInfo.dotColor}`} />
            {masteryInfo.label}
          </span>

          <button
            type="button"
            onClick={() => onToggleBookmark(card.id)}
            className={`p-1.5 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="نشان‌گذاری برای مرور شب امتحان"
            aria-label="نشان‌گذاری نسخه"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Multi-photo Switcher Bar (if prescription has 2 or 3 photos) */}
      {card.photoIds.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-teal-950/30 border-b border-teal-800/40">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-teal-300 ml-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              این نسخه {card.photoIds.length} تصویر دارد:
            </span>
            {card.photoIds.map((pid, idx) => (
              <button
                key={pid}
                type="button"
                onClick={() => {
                  setActivePhotoIndex(idx);
                  setShowAllPhotosSideBySide(false);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  !showAllPhotosSideBySide && activePhotoIndex === idx
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {card.photoLabels?.[idx] ?? `تصویر ${idx + 1} (photo_${pid})`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAllPhotosSideBySide((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
              showAllPhotosSideBySide
                ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            {showAllPhotosSideBySide ? 'نمایش تکی و زوم' : 'نمایش همزمان کنار هم'}
          </button>
        </div>
      )}

      {/* Main Optical Prescription Viewport */}
      <div
        className={`relative flex-1 bg-slate-950 overflow-hidden select-none flex items-center justify-center ${
          compactHeader
            ? 'min-h-[250px] sm:min-h-[340px]'
            : 'min-h-[270px] sm:min-h-[380px] lg:min-h-[500px]'
        } ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showAllPhotosSideBySide && card.photoIds.length > 1 ? (
          <div
            className={`grid gap-3 p-2.5 sm:p-3 w-full h-full items-center justify-center overflow-y-auto ${
              card.photoIds.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {card.photoIds.map((pid, idx) => (
              <div
                key={pid}
                className="flex flex-col items-center bg-slate-900/80 border border-slate-800 rounded-xl p-2 h-full"
              >
                <div className="w-full flex items-center justify-between text-xs text-slate-300 mb-1.5 px-1">
                  <span className="font-semibold">
                    {card.photoLabels?.[idx] ?? `تصویر ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoIndex(idx);
                      setShowAllPhotosSideBySide(false);
                    }}
                    className="text-teal-400 hover:underline text-[11px]"
                  >
                    زوم روی این عکس
                  </button>
                </div>
                <img
                  src={getPhotoUrl(pid)}
                  alt={`${card.doctorOrTitle} - تصویر ${idx + 1}`}
                  className={`max-h-[300px] sm:max-h-[400px] w-auto object-contain rounded-lg transition ${
                    highContrastInk ? 'contrast-150 brightness-105 saturate-50' : ''
                  }`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-2 transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={getPhotoUrl(currentPhotoId)}
              alt={`نسخه شماره ${card.rxNumber} - ${card.doctorOrTitle}`}
              className={`max-h-[320px] sm:max-h-[440px] lg:max-h-[520px] max-w-full object-contain rounded-lg shadow-2xl transition ${
                highContrastInk ? 'contrast-150 brightness-105 saturate-50' : ''
              }`}
              draggable={false}
            />
          </div>
        )}

        {/* Floating Optical Controls Toolbar */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md z-10 max-w-[95vw]">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 sm:p-1.5 text-slate-200 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
            title="بزرگ‌نمایی دست‌خط"
            aria-label="بزرگ‌نمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300 px-0.5 sm:px-1 min-w-[38px] text-center" dir="ltr">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 sm:p-1.5 text-slate-200 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
            title="کوچک‌نمایی"
            aria-label="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1 sm:p-1.5 text-slate-200 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
            title="چرخش ۹۰ درجه"
            aria-label="چرخش تصویر"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="p-1 sm:p-1.5 text-slate-200 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
            title="بازنشانی زوم و چرخش"
            aria-label="بازنشانی زوم"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={() => setHighContrastInk((c) => !c)}
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition shrink-0 ${
              highContrastInk
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="افزایش کنتراست جوهر خودکار برای خوانایی بهتر دست‌خط"
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span>وضوح دست‌خط</span>
          </button>

          <button
            type="button"
            onClick={() => setFullscreenModal(true)}
            className="p-1 sm:p-1.5 text-slate-200 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition"
            title="نمایش تمام‌صفحه"
            aria-label="نمایش تمام‌صفحه"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenModal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ نسخه"
        >
          <div className="w-full max-w-6xl flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-teal-900/80 text-teal-200 font-bold text-sm">
                نسخه #{card.rxNumber} — {card.doctorOrTitle}
              </span>
              <span className="text-xs text-slate-400">
                تعداد اقلام: {card.items.length} قلم دارو
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFullscreenModal(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold"
            >
              بستن (Esc)
            </button>
          </div>
          <div className="flex-1 w-full flex items-center justify-center overflow-auto">
            <img
              src={getPhotoUrl(currentPhotoId)}
              alt={card.doctorOrTitle}
              className={`max-h-[85vh] w-auto object-contain rounded-lg ${
                highContrastInk ? 'contrast-150 brightness-105' : ''
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
