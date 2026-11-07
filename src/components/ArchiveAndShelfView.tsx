import React, { useState } from 'react';
import {
  Search,
  Package,
  FileCheck2,
  Grid,
  Sparkles,
  Star,
  ArrowUpLeft,
  Layers,
} from 'lucide-react';
import {
  ClinicalCategory,
  DrugBoxAsset,
  MasteryStatus,
  PrescriptionCard,
} from '../types/prescription';
import { CLINICAL_CATEGORIES, EXCLUDED_PHOTOS_MANIFEST } from '../data/prescriptionsData';
import { getPhotoUrl } from '../utils/assetLoader';

interface ArchiveAndShelfViewProps {
  cards: PrescriptionCard[];
  allCards: PrescriptionCard[];
  drugBoxes: DrugBoxAsset[];
  masteryMap: Record<string, MasteryStatus>;
  onSelectPrescription: (rxId: string) => void;
}

export const ArchiveAndShelfView: React.FC<ArchiveAndShelfViewProps> = ({
  cards,
  allCards,
  drugBoxes,
  masteryMap,
  onSelectPrescription,
}) => {
  const [subTab, setSubTab] = useState<'prescriptions' | 'shelf_boxes' | 'audit_report'>(
    'prescriptions'
  );
  const [boxCategory, setBoxCategory] = useState<ClinicalCategory | 'all'>('all');
  const [boxSearch, setBoxSearch] = useState('');

  const filteredBoxes = drugBoxes.filter((b) => {
    if (boxCategory !== 'all' && b.category !== boxCategory) return false;
    if (!boxSearch.trim()) return true;
    const q = boxSearch.trim().toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.genericName.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.shelfTip.toLowerCase().includes(q)
    );
  });

  const completedOrMergedCards = allCards.filter(
    (c) => Boolean(c.auditNote) || c.items.some((i) => i.isAddedFromImage) || c.photoIds.length > 1
  );

  return (
    <div className="space-y-4">
      {/* Sub-navigation Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('prescriptions')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subTab === 'prescriptions'
                ? 'bg-teal-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>نمای شبکه‌ای نسخه‌ها ({cards.length} نسخه)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('shelf_boxes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subTab === 'shelf_boxes'
                ? 'bg-teal-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>قفسه‌یاب و جعبه داروها ({drugBoxes.length} تصویر جعبه دارو)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('audit_report')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subTab === 'audit_report'
                ? 'bg-teal-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>گزارش پالایش ۱۸۳ عکس و نسخه‌های تکمیل‌شده ({completedOrMergedCards.length} مورد)</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Prescriptions Visual Grid */}
      {subTab === 'prescriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const st = masteryMap[card.id] ?? 'unseen';
            return (
              <div
                key={card.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 rounded-2xl overflow-hidden flex flex-col justify-between transition group shadow-lg"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                    <img
                      src={getPhotoUrl(card.photoIds[0])}
                      alt={card.doctorOrTitle}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 text-teal-300 border border-teal-700/60 text-xs font-extrabold">
                        نسخه #{card.rxNumber}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-950/90 text-slate-200 text-xs font-bold">
                        {card.sessionTitle}
                      </span>
                    </div>
                    {card.isStarredByTeacher && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        مهم
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/95 text-indigo-200 border border-indigo-700 text-xs font-bold">
                        {card.items.length} قلم دارو
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          st === 'good'
                            ? 'bg-emerald-950 text-emerald-300'
                            : st === 'hard'
                            ? 'bg-amber-950 text-amber-300'
                            : st === 'again'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {st === 'good'
                          ? '🟢 مسلط'
                          : st === 'hard'
                          ? '🟡 شک داشتم'
                          : st === 'again'
                          ? '🔴 تکرار فوری'
                          : 'مرور نشده'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="text-sm font-extrabold text-white">{card.doctorOrTitle}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{card.visualClue}</p>

                    <div className="space-y-1 pt-1">
                      {card.items.map((item, i) => (
                        <div
                          key={item.id}
                          className="text-xs flex items-center justify-between gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                        >
                          <span className="text-slate-200 font-semibold truncate">
                            {i + 1}. [{item.form}] {item.persianName}
                          </span>
                          <span className="text-[11px] font-bold text-teal-400 shrink-0">
                            {item.dosage !== '—' ? item.dosage : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectPrescription(card.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-teal-500 text-slate-200 hover:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>باز کردن در میز کار تمرین</span>
                    <ArrowUpLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-tab 2: 33 Drug Boxes & Shelf Guide */}
      {subTab === 'shelf_boxes' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white">
                راهنمای تصویری قفسه‌یابی و جعبه داروها (۳۳ تصویر آموزشی کانال)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                در امتحان عملی، بعد از خواندن نسخه باید جعبه دارو را از قفسه پیدا کنید. این ۳۳ تصویر جعبه‌های دارویی ارسال‌شده در کلاس شما هستند.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={boxSearch}
                  onChange={(e) => setBoxSearch(e.target.value)}
                  placeholder="جستجوی نام دارو یا قفسه..."
                  aria-label="جستجوی جعبه دارو"
                  className="pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-teal-500 outline-none"
                />
              </div>

              <select
                value={boxCategory}
                onChange={(e) => setBoxCategory(e.target.value as ClinicalCategory | 'all')}
                aria-label="فیلتر دسته قفسه"
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="all">همه قفسه‌های دارویی</option>
                {CLINICAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoxes.map((box) => (
              <div
                key={box.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
              >
                <div className="h-52 bg-slate-950 p-3 flex items-center justify-center border-b border-slate-800 relative">
                  <img
                    src={getPhotoUrl(box.photoId)}
                    alt={box.title}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    loading="lazy"
                  />
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-slate-400 font-mono text-[11px] border border-slate-800"
                    dir="ltr"
                  >
                    photo_{box.photoId}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-xs font-bold">
                        {box.form}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        {box.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white">{box.title}</h4>
                    <div className="text-xs text-indigo-300 font-semibold">{box.genericName}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{box.description}</p>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200">
                    <strong className="text-amber-300">نکته قفسه‌یابی در امتحان: </strong>
                    {box.shelfTip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: 183 Photos Audit & AI Handwriting Completion Report */}
      {subTab === 'audit_report' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>گزارش کامل پالایش ۱۸۳ تصویر آپلودشده و تکمیل اقلام جامانده از روی دست‌خط</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">کل عکس‌های آپلودشده کانال</div>
                <div className="text-xl font-extrabold text-white mt-1">۱۸۳ تصویر</div>
                <div className="text-teal-400 mt-0.5">photo_1 تا photo_183</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">نسخه‌های پزشکی خالص</div>
                <div className="text-xl font-extrabold text-teal-300 mt-1">۱۲۹ نسخه واحد</div>
                <div className="text-slate-400 mt-0.5">شامل ۱۳۶ تصویر نسخه (با ادغام چندعکسی‌ها)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">جعبه داروها در تب قفسه‌یاب</div>
                <div className="text-xl font-extrabold text-indigo-300 mt-1">
                  {EXCLUDED_PHOTOS_MANIFEST.drugBoxesAndInfographics.length} تصویر
                </div>
                <div className="text-slate-400 mt-0.5">جداسازی‌شده از کارت‌های نسخه</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">جزوه، وایت‌برد و برگه‌های تستی</div>
                <div className="text-xl font-extrabold text-amber-300 mt-1">
                  {EXCLUDED_PHOTOS_MANIFEST.whiteboardsAndNotebooks.length +
                    EXCLUDED_PHOTOS_MANIFEST.multipleChoiceExamSheets.length}{' '}
                  تصویر
                </div>
                <div className="text-slate-400 mt-0.5">حذف‌شده از بانک نسخه‌ها طبق دستور شما</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedOrMergedCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-slate-900 border border-teal-800/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-xs font-extrabold">
                      نسخه #{card.rxNumber}
                    </span>
                    <span className="text-sm font-extrabold text-white">{card.doctorOrTitle}</span>
                    <span className="text-xs font-mono text-slate-400" dir="ltr">
                      ({card.photoIds.map((p) => `photo_${p}`).join(', ')})
                    </span>
                  </div>
                  <p className="text-xs text-teal-200 leading-relaxed">{card.auditNote}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPrescription(card.id)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition"
                >
                  مشاهده نسخه
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
