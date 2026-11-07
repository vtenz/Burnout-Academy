import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  FileText,
  Pill,
  Layers,
  ArrowUpLeft,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { MasteryStatus, PrescriptionCard } from '../types/prescription';
import { buildDoctorProfiles, DoctorProfile } from '../utils/catalogAggregator';
import { getPhotoUrl } from '../utils/assetLoader';

interface DoctorsDirectoryViewProps {
  allPrescriptions: PrescriptionCard[];
  masteryMap: Record<string, MasteryStatus>;
  onSelectPrescription: (rxId: string) => void;
}

export const DoctorsDirectoryView: React.FC<DoctorsDirectoryViewProps> = ({
  allPrescriptions,
  masteryMap,
  onSelectPrescription,
}) => {
  const doctorProfiles = useMemo(
    () => buildDoctorProfiles(allPrescriptions),
    [allPrescriptions]
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctorProfiles[0]?.id ?? 'dr-kabirian'
  );
  const [expandedAllDrugs, setExpandedAllDrugs] = useState<Record<string, boolean>>({});

  const activeProfile: DoctorProfile | undefined =
    doctorProfiles.find((d) => d.id === selectedDoctorId) ?? doctorProfiles[0];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-extrabold">
                پروفایل پزشکان و الگوی نسخه‌نویسی
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                تک‌تک دکترها، مهر و سبک دست‌خط، پرتکرارترین داروها و نسخه‌های هر دکتر
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              در امتحان عملی، به محض دیدن مهر یا سرنسخه دکتر، با دانستن داروهای محبوب آن دکتر نیمی از نسخه را در ۲ ثانیه می‌خوانید!
            </p>
          </div>
        </div>

        {/* Doctor Selector Cards / Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-3.5">
          {doctorProfiles.map((doc) => {
            const isActive = doc.id === activeProfile?.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`p-3 rounded-xl border text-right transition flex flex-col justify-between gap-1.5 ${
                  isActive
                    ? 'bg-teal-950/90 border-teal-400 text-white shadow-lg ring-1 ring-teal-400/50'
                    : 'bg-slate-950/90 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-teal-300' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs sm:text-sm font-extrabold line-clamp-1">
                      {doc.name}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-teal-300 text-[11px] font-extrabold">
                    {doc.prescriptionCount} نسخه
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{doc.specialtyBadge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Doctor Detailed Breakdown */}
      {activeProfile && (
        <div className="space-y-4">
          {/* Doctor Analytics Card: Stamp Clue, Top Categories & Top Prescribed Drugs */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {activeProfile.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-lg bg-teal-950 text-teal-300 border border-teal-700 text-xs font-bold">
                    {activeProfile.specialtyBadge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed mt-1">
                  <strong className="text-amber-300">مشخصه مهر و دست‌خط در امتحان: </strong>
                  {activeProfile.stampAndStyleDescription}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[11px]">تعداد نسخه‌ها</div>
                  <div className="text-base font-extrabold text-teal-300">
                    {activeProfile.prescriptionCount} نسخه
                  </div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[11px]">مجموع اقلام تجویزی</div>
                  <div className="text-base font-extrabold text-indigo-300">
                    {activeProfile.totalItemsCount} قلم دارو
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Analytics: Drug Categories + Prescribed Medications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left/Right 1: Top Drug Categories */}
              <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>بیشترین دسته‌های دارویی تجویزشده توسط این دکتر:</span>
                </h4>
                <div className="space-y-2">
                  {activeProfile.topCategories.map((catInfo) => (
                    <div key={catInfo.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{catInfo.category}</span>
                        <span className="text-slate-400 font-semibold">
                          {catInfo.count} قلم ({catInfo.percent}٪)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-teal-400 to-emerald-500 rounded-full"
                          style={{ width: `${Math.max(8, catInfo.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left/Right 2: All Medications Prescribed by this Doctor */}
              <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <Pill className="w-4 h-4" />
                    <span>پرتکرارترین داروهایی که این دکتر در نسخه‌ها نوشته است:</span>
                  </h4>
                  {activeProfile.topDrugs.length > 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedAllDrugs((prev) => ({
                          ...prev,
                          [activeProfile.id]: !prev[activeProfile.id],
                        }))
                      }
                      className="text-[11px] text-teal-400 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>
                        {expandedAllDrugs[activeProfile.id] ? 'نمایش کمتر' : 'نمایش همه داروها'}
                      </span>
                      {expandedAllDrugs[activeProfile.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(expandedAllDrugs[activeProfile.id]
                    ? activeProfile.topDrugs
                    : activeProfile.topDrugs.slice(0, 8)
                  ).map((d) => (
                    <div
                      key={d.name}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{d.name}</div>
                        <div
                          className="text-[11px] font-mono text-teal-400 truncate mt-0.5"
                          dir="ltr"
                        >
                          {d.englishCue}
                        </div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-800 text-[11px] font-extrabold">
                        {d.count} بار
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* All Prescriptions of This Doctor */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 px-1">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>
                لیست کامل نسخه‌های «{activeProfile.name}» ({activeProfile.prescriptions.length} نسخه)
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProfile.prescriptions.map((rx) => {
                const st = masteryMap[rx.id] ?? 'unseen';
                return (
                  <div
                    key={rx.id}
                    className="bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-950 border-b border-slate-800 overflow-hidden">
                        <img
                          src={getPhotoUrl(rx.photoIds[0])}
                          alt={rx.doctorOrTitle}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/90 text-teal-300 border border-teal-700 text-xs font-extrabold">
                            نسخه #{rx.rxNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950/90 text-slate-200 text-xs font-bold">
                            {rx.sessionTitle}
                          </span>
                        </div>
                        {rx.isStarredByTeacher && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-slate-950" />
                            مهم
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-950/95 text-indigo-200 border border-indigo-700 text-xs font-bold">
                            {rx.items.length} قلم دارو
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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
                        <div className="text-sm font-extrabold text-white">{rx.doctorOrTitle}</div>
                        <p className="text-xs text-slate-400 line-clamp-2">{rx.visualClue}</p>
                        <div className="space-y-1 pt-1">
                          {rx.items.map((item, idx) => (
                            <div
                              key={item.id}
                              className="text-xs flex items-center justify-between gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                            >
                              <span className="text-slate-200 font-semibold truncate">
                                {idx + 1}. [{item.form}] {item.persianName}
                              </span>
                              <span
                                className="text-[11px] font-mono text-teal-400 shrink-0"
                                dir="ltr"
                              >
                                {item.englishCue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={() => onSelectPrescription(rx.id)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-teal-500 text-slate-200 hover:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <span>تمرین این نسخه در میز کار</span>
                        <ArrowUpLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
