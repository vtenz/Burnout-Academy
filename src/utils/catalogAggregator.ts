import {
  ClinicalCategory,
  DosageForm,
  PrescriptionCard,
  PrescriptionItem,
} from '../types/prescription';
import { CLINICAL_CATEGORIES } from '../data/prescriptionsData';

export interface DrugPrescriptionOccurrence {
  rxId: string;
  rxNumber: number;
  sessionNumber: number;
  sessionTitle: string;
  doctorOrTitle: string;
  photoIds: number[];
  item: PrescriptionItem;
}

export interface AggregatedDrug {
  key: string;
  canonicalPersianName: string;
  category: ClinicalCategory;
  forms: DosageForm[];
  dosages: string[];
  englishCues: string[];
  genericOrBrandNotes: string[];
  totalOccurrences: number;
  prescriptionIds: string[];
  occurrences: DrugPrescriptionOccurrence[];
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialtyBadge: string;
  stampAndStyleDescription: string;
  prescriptionCount: number;
  totalItemsCount: number;
  topCategories: { category: ClinicalCategory; count: number; percent: number }[];
  topDrugs: { name: string; form: DosageForm; count: number; englishCue: string }[];
  prescriptions: PrescriptionCard[];
}

export interface ShelfBasketEvaluation {
  isPerfect: boolean;
  scorePercent: number;
  correctlyPicked: AggregatedDrug[];
  missedFromRx: PrescriptionItem[];
  wronglyPicked: AggregatedDrug[];
  crossedOutMistakes: PrescriptionItem[];
}

// Normalize a Persian drug name to a canonical key so variations of the same base drug group cleanly
export function normalizeDrugKey(persianName: string): {
  key: string;
  canonicalName: string;
} {
  const cleaned = persianName
    .replace(/\(خط‌خورده در نسخه\)/g, '')
    .replace(/\(حذف‌شده\)/g, '')
    .trim();

  // Extract main drug identity before dosage numbers if possible, while keeping distinct drugs separate
  const rules: { pattern: RegExp; canonical: string }[] = [
    { pattern: /پنتوس|پنتوپرازول|پنتومید|نولپازا/, canonical: 'قرص / کپسول و آمپول پنتوپرازول (پنتوس / نولپازا / پنتومید)' },
    { pattern: /امپرازول|مرازول|ارازول/, canonical: 'کپسول امپرازول (مرازول / ارازول)' },
    { pattern: /فاموتیدین/, canonical: 'قرص و آمپول فاموتیدین (۲۰ و ۴۰ میلی‌گرم)' },
    { pattern: /کلیدینیوم/, canonical: 'قرص کلیدینیوم سی (Clidinium-C)' },
    { pattern: /دایمتیکون|دی‌گس/, canonical: 'قرص، پرل و قطره دایمتیکون (دی‌گس)' },
    { pattern: /پلازیل|متوکلوپرامید/, canonical: 'قرص، قطره و آمپول پلازیل (متوکلوپرامید)' },
    { pattern: /دمیترون|اندانسترون/, canonical: 'قرص، شربت و آمپول اندانسترون (دمیترون)' },
    { pattern: /دومپریدون|موتیلیوم/, canonical: 'قرص دومپریدون (موتیلیوم)' },
    { pattern: /شیر منیزی|MOM|لاکسی‌ژل/, canonical: 'شربت شیر منیزی (MOM / لاکسی‌ژل - منیزیم هیدروکساید)' },
    { pattern: /آلومینیوم ام‌جی/, canonical: 'شربت آلومینیوم ام‌جی‌اس (Al.Mg.S)' },
    { pattern: /سی‌لاکس|سیلاکس|رولاکس/, canonical: 'قرص و شربت سی‌لاکس / رولاکس (ملین گیاهی سنا)' },
    { pattern: /پیدرولاکس/, canonical: 'پودر پیدرولاکس (PEG)' },
    { pattern: /لاکتولوز/, canonical: 'شربت لاکتولوز (Lactulose)' },
    { pattern: /بیزاکودیل/, canonical: 'قرص و شیاف بیزاکودیل' },
    { pattern: /گلیسرین/, canonical: 'شیاف گلیسرین' },
    { pattern: /سوپرمینت/, canonical: 'قطره و قرص گیاهی سوپرمینت باریج (نعناع)' },
    { pattern: /دیسیکلومین/, canonical: 'قرص و شربت دیسیکلومین (ضداسپاسم)' },
    { pattern: /هیوسین/, canonical: 'قرص و آمپول هیوسین (Hyoscine)' },
    { pattern: /کیدی‌لاکت|کیدی لاکت/, canonical: 'ساشه و قطره پروبیوتیک کیدی‌لاکت (Kidilact)' },
    { pattern: /فورایز|ونوپرازان/, canonical: 'قرص فورایز ۲۰ (Forise = ونوپرازان)' },
    { pattern: /رابپرازول/, canonical: 'قرص رابپرازول ۲۰' },
    { pattern: /لانزوپرازول/, canonical: 'کپسول لانزوپرازول (۱۵ و ۳۰ میلی‌گرم)' },
    { pattern: /گاباپنتین/, canonical: 'کپسول گاباپنتین (۱۰۰ و ۳۰۰ میلی‌گرم)' },
    { pattern: /پرگابالین|لایریور|لیریکا|گابارل/, canonical: 'کپسول پرگابالین (لایریور / لیریکا ۵۰، ۷۵ و ۱۵۰)' },
    { pattern: /نورتریپتیلین/, canonical: 'قرص نورتریپتیلین (۱۰ و ۲۵ میلی‌گرم)' },
    { pattern: /آمی‌تریپتیلین|آمی تریپتیلین/, canonical: 'قرص آمی‌تریپتیلین (۱۰ و ۲۵ میلی‌گرم)' },
    { pattern: /آسنترا|سرترالین|زولوفت/, canonical: 'قرص سرترالین / آسنترا (۵۰ و ۱۰۰ میلی‌گرم)' },
    { pattern: /اس‌سیتالوپرام|ازیپم|لگزاتال|ابیدوکس/, canonical: 'قرص اس‌سیتالوپرام (ازیپم / لگزاتال / ابیدوکس ۱۰ و ۲۰)' },
    { pattern: /سیتالوپرام/, canonical: 'قرص سیتالوپرام (۲۰ و ۴۰ میلی‌گرم)' },
    { pattern: /فلوکستین/, canonical: 'کپسول فلوکستین (۱۰ و ۲۰ میلی‌گرم)' },
    { pattern: /ترانکوپین|کوئنتیاپین|کوئتیاپین/, canonical: 'قرص ترانکوپین / کوئنتیاپین (۲۵ و ۱۰۰ میلی‌گرم)' },
    { pattern: /کلردیازپوکساید|لیبریوم/, canonical: 'قرص کلردیازپوکساید / لیبریوم (۵ و ۱۰ میلی‌گرم)' },
    { pattern: /آلپرازولام|زاناکس/, canonical: 'قرص آلپرازولام (۰/۵ و ۱ میلی‌گرم)' },
    { pattern: /کلونازپام/, canonical: 'قرص کلونازپام (۱ و ۲ میلی‌گرم)' },
    { pattern: /لورازپام/, canonical: 'قرص لورازپام (۱ و ۲ میلی‌گرم)' },
    { pattern: /اولانزاپین/, canonical: 'قرص اولانزاپین (۲/۵، ۵، ۱۰ و ۱۵ میلی‌گرم)' },
    { pattern: /ریسپریدون/, canonical: 'قرص ریسپریدون (۱، ۲ و ۴ میلی‌گرم)' },
    { pattern: /ولبان|بوپروپیون/, canonical: 'قرص ولبان / بوپروپیون (۷۵ و ۱۵۰ میلی‌گرم)' },
    { pattern: /ترازودون|ترازولکس/, canonical: 'قرص ترازودون / ترازولکس ۵۰' },
    { pattern: /پروپرانولول|ایندرال|پروترال/, canonical: 'قرص پروپرانولول (ایندرال / پروترال ۱۰ و ۲۰ میلی‌گرم)' },
    { pattern: /بتاهیستین|اکتوسرک|بتاسرک/, canonical: 'قرص بتاهیستین (اکتوسرک / بتاسرک ۸ و ۱۶ میلی‌گرم)' },
    { pattern: /کتورولاک/, canonical: 'آمپول کتورولاک ۳۰ میلی‌گرم' },
    { pattern: /ملوکسیکام|موبیک/, canonical: 'قرص ملوکسیکام / موبیک (۷/۵ و ۱۵ میلی‌گرم)' },
    { pattern: /سلکوکسیب/, canonical: 'کپسول سلکوکسیب (۱۰۰ و ۲۰۰ میلی‌گرم)' },
    { pattern: /ناپروکسن/, canonical: 'قرص ناپروکسن (۲۵۰ و ۵۰۰ میلی‌گرم)' },
    { pattern: /دیکلوفناک|الفن‌ایکس/, canonical: 'قرص، شیاف، آمپول و ژل دیکلوفناک (الفن‌ایکس)' },
    { pattern: /نوافن/, canonical: 'کپسول نوافن (Novafen)' },
    { pattern: /ژلوفن|ایبوپروفن|بروفن/, canonical: 'کپسول ژلوفن / قرص و شربت ایبوپروفن (بروفن)' },
    { pattern: /استامینوفن کدئین/, canonical: 'قرص استامینوفن کدئین' },
    { pattern: /تایلوفن|پاراکید|استامینوفن|آپوتل/, canonical: 'قرص، شربت، قطره و آمپول استامینوفن (تایلوفن / پاراکید / آپوتل)' },
    { pattern: /متوکاربامول|روباکسین/, canonical: 'قرص و آمپول متوکاربامول (روباکسین)' },
    { pattern: /باکلوفن/, canonical: 'قرص باکلوفن ۱۰ میلی‌گرم' },
    { pattern: /دگزامتازون/, canonical: 'آمپول، قرص و قطره دگزامتازون' },
    { pattern: /بتامتازون/, canonical: 'آمپول، پماد و قطره بتامتازون' },
    { pattern: /متیل‌پردنیزولون|دپومدرول/, canonical: 'ویال متیل‌پردنیزولون (دپومدرول ۴۰)' },
    { pattern: /تریامسینولون ان‌ان/, canonical: 'پماد تریامسینولون ان‌ان (Triamcinolone N.N)' },
    { pattern: /سفتریاکسون/, canonical: 'ویال سفتریاکسون (۱ گرم و ۵۰۰ میلی‌گرم)' },
    { pattern: /آزیترومایسین/, canonical: 'کپسول، قرص و سوسپانسیون آزیترومایسین (۱۰۰، ۲۰۰، ۲۵۰ و ۵۰۰)' },
    { pattern: /سفکسیم/, canonical: 'قرص، کپسول و سوسپانسیون سفکسیم (۱۰۰، ۲۰۰ و ۴۰۰)' },
    { pattern: /کوآموکسی‌کلاو|فاراموکس|آموکسی‌سیلین/, canonical: 'قرص، کپسول و شربت آموکسی‌سیلین / فاراموکس / کوآموکسی‌کلاو' },
    { pattern: /سیپروفلوکساسین/, canonical: 'قرص، کپسول و قطره سیپروفلوکساسین ۵۰۰' },
    { pattern: /مترونیدازول/, canonical: 'قرص خوراکی، واژینال و شربت مترونیدازول (۲۵۰ و ۵۰۰)' },
    { pattern: /سفالکسین/, canonical: 'کپسول و شربت سفالکسین (۲۵۰ و ۵۰۰)' },
    { pattern: /پنی‌سیلین/, canonical: 'ویال و قرص/کپسول پنی‌سیلین (۸۰۰۰۰۰، ۶.۳.۳ و V 500)' },
    { pattern: /فلوکونازول/, canonical: 'کپسول فلوکونازول (۱۵۰ میلی‌گرم)' },
    { pattern: /کلوتریمازول/, canonical: 'پماد موضعی و کرم واژینال کلوتریمازول' },
    { pattern: /دیفن‌هیدرامین/, canonical: 'شربت دیفن‌هیدرامین (ساده و کامپاند)' },
    { pattern: /پدیاتریک گریپ|پدگریپ/, canonical: 'شربت پدیاتریک گریپ (Pediatric Grippe)' },
    { pattern: /هیدروکسی‌زین/, canonical: 'شربت و قرص هیدروکسی‌زین' },
    { pattern: /ستیریزین|سیتریزین/, canonical: 'قرص و شربت ستیریزین ۱۰ میلی‌گرم' },
    { pattern: /نئوتادین|دس‌لوراتادین|لوراتادین/, canonical: 'قرص و شربت نئوتادین (دس‌لوراتادین) / لوراتادین' },
    { pattern: /فکسوفنادین|تلفست/, canonical: 'قرص فکسوفنادین (تلفست ۱۲۰ و ۱۸۰)' },
    { pattern: /کلرفنیرامین/, canonical: 'قرص و آمپول کلرفنیرامین' },
    { pattern: /مونته‌لوکاست|ملوکاست|ایروکاست/, canonical: 'قرص مونته‌لوکاست (ایروکاست / ملوکاست ۵ و ۱۰)' },
    { pattern: /آیورا|پروسپان|تیمکس|تیموسیب|پلارژین|برونکوباریج|کوکنار|زوفا/, canonical: 'شربت‌های ضدسرفه گیاهی (آیورا، پروسپان، پلارژین، کوکنار، تیمکس)' },
    { pattern: /سالبوتامول|سروفلو|سیمبیکورت|فلوتیکازون|بکلومتازون|مومتازون/, canonical: 'اسپری‌های تنفسی و بینی (سالبوتامول، سروفلو، مومتازون، فلوتیکازون)' },
    { pattern: /ویتامین D3/, canonical: 'پرل و آمپول ویتامین D3 (۱۰۰۰، ۵۰۰۰۰ و ۳۰۰۰۰۰ واحد)' },
    { pattern: /ویتامین B1/, canonical: 'قرص ویتامین B1 ۳۰۰ میلی‌گرم' },
    { pattern: /نوروبیون|ب‌کمپلکس|B-Complex/, canonical: 'آمپول نوروبیون و ب‌کمپلکس' },
    { pattern: /فولیک اسید|کوالی‌فول/, canonical: 'قرص فولیک اسید (۱ و ۵ میلی‌گرم) و قطره کوالی‌فول' },
    { pattern: /ففول|فروگلوبین|فیت‌آیرون|فروزومال|سیدفر|فرودین|سولفات فروس|هماتینیک/, canonical: 'کپسول، شربت و قطره آهن و کم‌خونی (ففول، فیت‌آیرون، فروگلوبین، فروزومال)' },
    { pattern: /نئوزینک|ویتازینک|زینک پلاس|زینک سولفات/, canonical: 'شربت و کپسول زینک (نئوزینک، ویتازینک، زینک پلاس)' },
    { pattern: /کلسیم|استئوکر|یونی‌فلکس/, canonical: 'قرص و شربت کلسیم دی / استئوکر / یونی‌فلکس' },
    { pattern: /لووتیروکسین/, canonical: 'قرص لووتیروکسین ۰/۱ میلی‌گرم (۱۰۰ میکروگرم)' },
    { pattern: /آتورواستاتین|رزوواستاتین/, canonical: 'قرص آتورواستاتین (۱۰، ۲۰ و ۴۰) و رزوواستاتین' },
    { pattern: /لوزارتان|لوزار|لوزامیکس|والسارتان|والزومیکس|آربیتوین/, canonical: 'قرص‌های فشار خون: لوزارتان / لوزامیکس / والسارتان / آربیتوین' },
    { pattern: /آملودیپین/, canonical: 'قرص آملودیپین ۵ میلی‌گرم' },
    { pattern: /متفورمین|گلوکوفاژ|زیپمت|گلوریپا|امپاگلیفلوزین|گلی‌بن‌کلامید|دیابتون/, canonical: 'قرص‌های دیابت: متفورمین (گلوکوفاژ)، زیپمت، گلوریپا، گلی‌بن‌کلامید' },
    { pattern: /آسپرین|آس‌آ|ASA|اسویکس|کلوپیدوگرل/, canonical: 'قرص آسپرین ۸۰ (ASA) و اسویکس ۷۵ (کلوپیدوگرل)' },
    { pattern: /نیتروکانتین|نیترومینت/, canonical: 'قرص نیتروکانتین ۲/۶ (نیتروگلیسیرین آهسته‌رهش)' },
    { pattern: /متوهگزال|متوپرولول|بیزوپرولول|کارودیلول/, canonical: 'بتابلوکرهای قلبی: متوهگزال ۴۷/۵، بیزوپرولول ۲/۵، کارودیلول ۶/۲۵' },
    { pattern: /فوروزماید|لازیکس|هیدروکلروتیازید|اسپیرونولاکتون/, canonical: 'قرص‌های ادرارآور (دیورتیک): لازیکس (فوروزماید) و اسپیرونولاکتون' },
    { pattern: /سرم/, canonical: 'انواع سرم‌های تزریقی (۱/۳ ۲/۳، نرمال سالین، رینگر، دکستروز)' },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(cleaned)) {
      return { key: rule.canonical, canonicalName: rule.canonical };
    }
  }

  return { key: cleaned, canonicalName: cleaned };
}

function normalizeCategory(cat: string): ClinicalCategory {
  if ((CLINICAL_CATEGORIES as string[]).includes(cat)) {
    return cat as ClinicalCategory;
  }
  if (cat.includes('اعصاب')) return 'اعصاب و روان';
  if (cat.includes('قلب') || cat.includes('فشار') || cat.includes('دیابت')) return 'قلب، فشار خون و دیابت';
  if (cat.includes('آنتی') || cat.includes('عفون')) return 'آنتی‌بیوتیک و عفونی';
  if (cat.includes('مسکن') || cat.includes('مفاصل') || cat.includes('التهاب')) return 'مسکن، التهاب و مفاصل';
  if (cat.includes('تنفس') || cat.includes('سرما') || cat.includes('آلرژی')) return 'تنفسی، سرماخوردگی و آلرژی';
  if (cat.includes('اطفال') || cat.includes('کودک') || cat.includes('نوزاد')) return 'اطفال و نوزادان';
  if (cat.includes('ویتامین') || cat.includes('مکمل') || cat.includes('خون')) return 'ویتامین، مکمل و کم‌خونی';
  if (cat.includes('چشم') || cat.includes('پوست') || cat.includes('موضعی')) return 'چشمی، پوستی و موضعی';
  if (cat.includes('زنان') || cat.includes('هورمون') || cat.includes('اورولوژی')) return 'زنان، اورولوژی و هورمونی';
  return 'گوارش و معده';
}

export function aggregateAllDrugs(prescriptions: PrescriptionCard[]): AggregatedDrug[] {
  const map = new Map<string, AggregatedDrug>();

  for (const rx of prescriptions) {
    for (const item of rx.items) {
      const { key, canonicalName } = normalizeDrugKey(item.persianName);
      const safeCat = normalizeCategory(item.shelfCategory);
      let entry = map.get(key);

      if (!entry) {
        entry = {
          key,
          canonicalPersianName: canonicalName,
          category: safeCat,
          forms: [],
          dosages: [],
          englishCues: [],
          genericOrBrandNotes: [],
          totalOccurrences: 0,
          prescriptionIds: [],
          occurrences: [],
        };
        map.set(key, entry);
      }

      entry.totalOccurrences += 1;
      if (!entry.prescriptionIds.includes(rx.id)) {
        entry.prescriptionIds.push(rx.id);
      }
      if (!entry.forms.includes(item.form)) {
        entry.forms.push(item.form);
      }
      if (item.dosage && item.dosage !== '—' && item.dosage !== '-' && !entry.dosages.includes(item.dosage)) {
        entry.dosages.push(item.dosage);
      }
      if (item.englishCue && !entry.englishCues.includes(item.englishCue)) {
        entry.englishCues.push(item.englishCue);
      }
      if (
        item.genericOrBrandNote &&
        !entry.genericOrBrandNotes.includes(item.genericOrBrandNote)
      ) {
        entry.genericOrBrandNotes.push(item.genericOrBrandNote);
      }

      entry.occurrences.push({
        rxId: rx.id,
        rxNumber: rx.rxNumber,
        sessionNumber: rx.sessionNumber,
        sessionTitle: rx.sessionTitle,
        doctorOrTitle: rx.doctorOrTitle,
        photoIds: rx.photoIds,
        item,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalOccurrences - a.totalOccurrences);
}

export function groupDrugsByCategory(
  drugs: AggregatedDrug[]
): Record<ClinicalCategory, AggregatedDrug[]> {
  const grouped = {} as Record<ClinicalCategory, AggregatedDrug[]>;
  for (const cat of CLINICAL_CATEGORIES) {
    grouped[cat] = [];
  }
  for (const d of drugs) {
    const safeCat = normalizeCategory(d.category);
    grouped[safeCat].push(d);
  }
  return grouped;
}

// Classify each prescription into its Doctor Profile (Named Doctors + Clinical Specialty Groups)
function classifyPrescriptionDoctor(rx: PrescriptionCard): {
  id: string;
  name: string;
  specialtyBadge: string;
  stampAndStyleDescription: string;
} {
  const combined = `${rx.doctorOrTitle} ${rx.visualClue} ${rx.rawChannelText}`;

  if (combined.includes('کبیریان')) {
    return {
      id: 'dr-kabirian',
      name: 'دکتر مرتضی کبیریان',
      specialtyBadge: 'پزشک عمومی و داخلی (پرتکرارترین مهر کانال)',
      stampAndStyleDescription:
        'مهر مستطیلی آبی «دکتر مرتضی کبیریان» با شماره‌گذاری ۱، ۲، ۳ در سمت چپ و نوشتن N= در مقابل هر قلم؛ بسیار پرتکرار در نسخه‌های اطفال، گوارش، سرماخوردگی و ویتامین D3.',
    };
  }

  if (combined.includes('ماهری')) {
    return {
      id: 'dr-maheri',
      name: 'دکتر سعید ماهری',
      specialtyBadge: 'پزشک متخصص داخلی، پروستات، اعصاب و آلرژی',
      stampAndStyleDescription:
        'نسخه‌های ۲ عکسی و چندقلمی با دست‌خط پیوسته؛ تجویز داروهای تخصصی مثل فورایز (ونوپرازان)، تامسولوسین، مادوپار، پرامی‌پکسول و آمپول‌های ضدحساسیت.',
    };
  }

  if (combined.includes('نیما احمدی')) {
    return {
      id: 'dr-nima-ahmadi',
      name: 'دکتر نیما احمدی',
      specialtyBadge: 'متخصص ارتوپدی، مفاصل و ستون فقرات',
      stampAndStyleDescription:
        'مهر آبی ارتوپدی با تجویز ترکیب کلاسیک درد مفاصل و دیسک: آمپول کتورولاک + نوروبیون + ملوکسیکام + گاباپنتین + نورتریپتیلین + کپسول غضروف‌ساز پی‌اسکلتون و پماد ستاگرین.',
    };
  }

  if (combined.includes('عبداللهی')) {
    return {
      id: 'dr-abdollahi',
      name: 'دکتر محمدرضا عبداللهی',
      specialtyBadge: 'پزشک داخلی، سرگیجه و گوارش',
      stampAndStyleDescription:
        'مهر «دکتر محمدرضا عبداللهی» با شماره‌گذاری خوانا ۱ تا ۴؛ ترکیب داروهای ضدتهوع و سرگیجه (پلازیل + بتاهیستین) به همراه مرازول (امپرازول) و قطره دایمتیکون.',
    };
  }

  if (combined.includes('رضا زارع')) {
    return {
      id: 'dr-reza-zare',
      name: 'دکتر رضا زارع',
      specialtyBadge: 'پزشک عمومی و عفونی (نسخه فتوکپی سیاه‌وسفید)',
      stampAndStyleDescription:
        'تنها نسخه کپی سیاه‌وسفید کانال با مهر اریب «دکتر رضا زارع»؛ اعداد تعداد داروها (۴، ۲۰، ۳۰، ۱۰) در سمت راست داخل دایره نوشته شده‌اند.',
    };
  }

  if (combined.includes('دندانپزشکی') || combined.includes('کلرهگزیدین') || combined.includes('فاراموکس')) {
    return {
      id: 'dr-dental',
      name: 'پزشکان جراح-دندانپزشک (نسخه‌های دندانپزشکی)',
      specialtyBadge: 'جراح-دندانپزشک',
      stampAndStyleDescription:
        'نسخه‌های ۳ تا ۴ قلمی بسیار مشخص شامل آنتی‌بیوتیک دندانی (آموکسی‌سیلین / فاراموکس ۵۰۰، کوآموکسی‌کلاو ۶۲۵، پنی‌سیلین V ۵۰۰ و مترونیدازول) + مسکن (نوافن / ژلوفن ۴۰۰) + دهانشویه کلرهگزیدین.',
    };
  }

  if (rx.primaryCategory === 'اعصاب و روان') {
    return {
      id: 'dr-neuro-psych',
      name: 'متخصصین اعصاب و روان (نورولوژی و روان‌پزشکی)',
      specialtyBadge: 'متخصص مغز و اعصاب و روان‌پزشکی',
      stampAndStyleDescription:
        'نسخه‌های ۶۰ و ۱۰۰ عددی شامل داروهای ضدافسردگی و اضطراب (آسنترا، ازیپم/لگزاتال، سیتالوپرام، فلوکستین، نورتریپتیلین، ولبان)، آرام‌بخش‌ها (لیبریوم، آلپرازولام، کلونازپام، ترانکوپین) و داروهای پارکینسون/آلزایمر (آلزیکسا، دونپزیل، مادوپار).',
    };
  }

  if (rx.primaryCategory === 'قلب، فشار خون و دیابت') {
    return {
      id: 'dr-cardio-endo',
      name: 'متخصصین قلب و عروق، فشار خون و غدد (دیابت/تیروئید)',
      specialtyBadge: 'متخصص قلب و داخلی-غدد',
      stampAndStyleDescription:
        'نسخه‌های پرتعداد (N=60، N=100، N=120، N=200) شامل داروهای فشار خون (لوزارتان، والزومیکس، لوزامیکس، آملودیپین، متوهگزال)، چربی (آتورواستاتین)، رقیق‌کننده خون (آسپرین ۸۰، اسویکس ۷۵)، دیابت (گلوکوفاژ، زیپمت، گلوریپا) و لووتیروکسین.',
    };
  }

  if (rx.primaryCategory === 'اطفال و نوزادان') {
    return {
      id: 'dr-pediatrics',
      name: 'متخصصین کودکان و نوزادان (نسخه‌های اطفال)',
      specialtyBadge: 'متخصص اطفال و نوزادان',
      stampAndStyleDescription:
        'نسخه‌های سرشار از شربت (Syr) و قطره (Drop): شربت‌های سرماخوردگی اطفال (پدگریپ، دیفن، تایلوفن/پاراکید، آزیترومایسین ۱۰۰/۲۰۰، سفکسیم ۱۰۰)، مکمل‌های رشد (نئوزینک، ویتازینک، فروگلوبین، میم) و پمادهای ترکیبی ادرارسوختگی در ظرف خالی.',
    };
  }

  if (rx.primaryCategory === 'گوارش و معده') {
    return {
      id: 'dr-gastro',
      name: 'متخصصین گوارش و کبد (نسخه‌های معده و روده)',
      specialtyBadge: 'متخصص داخلی و گوارش',
      stampAndStyleDescription:
        'تجویز مهارکننده‌های اسید (پنتوس ۴۰، امپرازول، فاموتیدین)، ضداسپاسم و نفخ (کلیدینیوم سی، دایمتیکون، دیسیکلومین، سوپرمینت)، ضدتهوع (پلازیل، دمیترون) و ملین‌ها (شربت MOM، لاکتولوز، پیدرولاکس، سی‌لاکس).',
    };
  }

  if (
    rx.primaryCategory === 'زنان، اورولوژی و هورمونی' ||
    rx.primaryCategory === 'چشمی، پوستی و موضعی'
  ) {
    return {
      id: 'dr-obgyn-eye-derm',
      name: 'متخصصین زنان، چشم‌پزشکی، پوست و اورولوژی',
      specialtyBadge: 'متخصص زنان / چشم / پوست',
      stampAndStyleDescription:
        'نسخه‌های تخصصی شامل داروهای زنان (فلوکونازول ۱۵۰، کرم واژینال کلوتریمازول و دالاواگ، دوفاستون، پروژسترون، لاکتوفم)، قطره‌های چشمی/گوشی (کوزوپت، لاتانوپروست، باکتیماید، کلرامفنیکل) و پمادهای پوستی.',
    };
  }

  return {
    id: 'dr-emergency-ortho-ent',
    name: 'پزشکان اورژانس، عفونی، تنفسی و ارتوپدی',
    specialtyBadge: 'پزشک اورژانس، عفونی و تنفسی',
    stampAndStyleDescription:
      'نسخه‌های حاد شامل سرم‌ها (۱/۳ ۲/۳ و نرمال سالین)، آمپول‌های تزریقی (سفتریاکسون ۱ گرم + لیدوکائین + کتورولاک + دگزامتازون)، آنتی‌بیوتیک‌های خوراکی و اسپری/شربت‌های ضدسرفه و حساسیت.',
  };
}

export function buildDoctorProfiles(prescriptions: PrescriptionCard[]): DoctorProfile[] {
  const map = new Map<
    string,
    {
      id: string;
      name: string;
      specialtyBadge: string;
      stampAndStyleDescription: string;
      prescriptions: PrescriptionCard[];
    }
  >();

  for (const rx of prescriptions) {
    const info = classifyPrescriptionDoctor(rx);
    let group = map.get(info.id);
    if (!group) {
      group = {
        ...info,
        prescriptions: [],
      };
      map.set(info.id, group);
    }
    group.prescriptions.push(rx);
  }

  const profiles: DoctorProfile[] = [];

  for (const group of map.values()) {
    const catCounts = new Map<ClinicalCategory, number>();
    const drugCounts = new Map<
      string,
      { name: string; form: DosageForm; count: number; englishCue: string }
    >();
    let totalItemsCount = 0;

    for (const rx of group.prescriptions) {
      for (const item of rx.items) {
        totalItemsCount++;
        catCounts.set(item.shelfCategory, (catCounts.get(item.shelfCategory) ?? 0) + 1);

        const { canonicalName } = normalizeDrugKey(item.persianName);
        const existingDrug = drugCounts.get(canonicalName);
        if (existingDrug) {
          existingDrug.count++;
        } else {
          drugCounts.set(canonicalName, {
            name: canonicalName,
            form: item.form,
            count: 1,
            englishCue: item.englishCue,
          });
        }
      }
    }

    const topCategories = Array.from(catCounts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percent: totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topDrugs = Array.from(drugCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    profiles.push({
      id: group.id,
      name: group.name,
      specialtyBadge: group.specialtyBadge,
      stampAndStyleDescription: group.stampAndStyleDescription,
      prescriptionCount: group.prescriptions.length,
      totalItemsCount,
      topCategories,
      topDrugs,
      prescriptions: group.prescriptions,
    });
  }

  // Sort so named doctors appear first, then specialty groups by prescription count
  const namedOrder = [
    'dr-kabirian',
    'dr-maheri',
    'dr-nima-ahmadi',
    'dr-abdollahi',
    'dr-reza-zare',
  ];

  return profiles.sort((a, b) => {
    const idxA = namedOrder.indexOf(a.id);
    const idxB = namedOrder.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return b.prescriptionCount - a.prescriptionCount;
  });
}

// Evaluate user's picked shelf drugs against a target prescription
export function evaluateShelfBasket(
  targetRx: PrescriptionCard,
  pickedDrugKeys: string[],
  allDrugsMap: Map<string, AggregatedDrug>
): ShelfBasketEvaluation {
  const activeRxItems = targetRx.items.filter((i) => !i.isCrossedOut);
  const crossedOutRxItems = targetRx.items.filter((i) => i.isCrossedOut);

  const requiredKeysSet = new Set<string>();
  for (const item of activeRxItems) {
    requiredKeysSet.add(normalizeDrugKey(item.persianName).key);
  }

  const crossedOutKeysSet = new Set<string>();
  for (const item of crossedOutRxItems) {
    crossedOutKeysSet.add(normalizeDrugKey(item.persianName).key);
  }

  const pickedSet = new Set(pickedDrugKeys);

  const correctlyPicked: AggregatedDrug[] = [];
  const wronglyPicked: AggregatedDrug[] = [];
  const crossedOutMistakes: PrescriptionItem[] = [];

  for (const key of pickedSet) {
    const drugObj = allDrugsMap.get(key);
    if (requiredKeysSet.has(key)) {
      if (drugObj) correctlyPicked.push(drugObj);
    } else {
      if (drugObj) wronglyPicked.push(drugObj);
      if (crossedOutKeysSet.has(key)) {
        const crossedItem = crossedOutRxItems.find(
          (i) => normalizeDrugKey(i.persianName).key === key
        );
        if (crossedItem) crossedOutMistakes.push(crossedItem);
      }
    }
  }

  const missedFromRx: PrescriptionItem[] = [];
  for (const item of activeRxItems) {
    const { key } = normalizeDrugKey(item.persianName);
    if (!pickedSet.has(key)) {
      missedFromRx.push(item);
    }
  }

  const totalRequired = requiredKeysSet.size;
  const rawScore = Math.max(0, correctlyPicked.length - wronglyPicked.length * 0.5);
  const scorePercent =
    totalRequired > 0 ? Math.max(0, Math.round((rawScore / totalRequired) * 100)) : 100;

  return {
    isPerfect:
      correctlyPicked.length === totalRequired &&
      wronglyPicked.length === 0 &&
      missedFromRx.length === 0,
    scorePercent,
    correctlyPicked,
    missedFromRx,
    wronglyPicked,
    crossedOutMistakes,
  };
}

// High-yield Handwriting Cheat-Codes & Co-occurring Drug Combos for tomorrow's exam
export interface HandwritingCheatCode {
  id: string;
  cuePattern: string;
  instantRead: string;
  shelfLocation: ClinicalCategory;
  trick: string;
}

export const HANDWRITING_CHEAT_CODES: HandwritingCheatCode[] = [
  {
    id: 'hc-1',
    cuePattern: 'Tab Pantoss 40 / Nolpaza 20 / Pantomid',
    instantRead: 'قرص پنتوپرازول (۲۰ و ۴۰ میلی‌گرم)',
    shelfLocation: 'گوارش و معده',
    trick: 'هر وقت اول کلمه P و آخرش ss یا za دیدی با دوز ۲۰ یا ۴۰ و دستور «صبح ناشتا»، بدون شک پنتوپرازول است!',
  },
  {
    id: 'hc-2',
    cuePattern: 'Tab Wellban 75 / 150',
    instantRead: 'قرص ولبان (بوپروپیون آهسته‌رهش)',
    shelfLocation: 'اعصاب و روان',
    trick: 'دوز ۷۵ و ۱۵۰ با حرف W در نسخه‌های اعصاب فقط ولبان (بوپروپیون) است.',
  },
  {
    id: 'hc-3',
    cuePattern: 'Tab Metohexal 47.5',
    instantRead: 'قرص متوهگزال ۴۷/۵ (متوپرولول سوکسینات)',
    shelfLocation: 'قلب، فشار خون و دیابت',
    trick: 'عدد اعشاری ۴۷/۵ یا ۲۳/۷۵ در کل داروخانه فقط مربوط به متوهگزال (متوپرولول آهسته‌رهش) است!',
  },
  {
    id: 'hc-4',
    cuePattern: 'Tab Mobic 15 / Meloxicam 15',
    instantRead: 'قرص موبیک ۱۵ (ملوکسیکام)',
    shelfLocation: 'مسکن، التهاب و مفاصل',
    trick: 'در نسخه‌های درد مفاصل کنار گاباپنتین، کلمه ۵ حرفی Mobic با عدد 15 همان ملوکسیکام است.',
  },
  {
    id: 'hc-5',
    cuePattern: 'Cap Lyriver 75 / 150 + Cap Loxeta 60',
    instantRead: 'کپسول لایریور (پرگابالین) + لوکستا (دولوکستین)',
    shelfLocation: 'اعصاب و روان',
    trick: 'دو کپسول برند اکتوور که با L شروع می‌شوند: Lyriver = پرگابالین، Loxeta = دولوکستین.',
  },
  {
    id: 'hc-6',
    cuePattern: 'Tab Ezipam 10 / Lexatal 10 / Abidox',
    instantRead: 'قرص اس‌سیتالوپرام ۱۰ و ۲۰ میلی‌گرم',
    shelfLocation: 'اعصاب و روان',
    trick: 'هر سه نام تجاری (ازیپم، لگزاتال، ابیدوکس) همان اس‌سیتالوپرام هستند!',
  },
  {
    id: 'hc-7',
    cuePattern: 'Tab Alzixa 10 + Tab Donepezil 10',
    instantRead: 'قرص آلزیکسا (ممانتین) + دونپزیل (نسخه آلزایمر)',
    shelfLocation: 'اعصاب و روان',
    trick: 'این دو قرص ۱۰ میلی‌گرمی ۶۰ عددی همیشه با هم در نسخه سالمندان/آلزایمر می‌آیند.',
  },
  {
    id: 'hc-8',
    cuePattern: 'Drop Cosopt + Drop Latanoprost (Xalatan)',
    instantRead: 'قطره چشمی کوزوپت + لاتانوپروست (فشار چشم / گلوکوم)',
    shelfLocation: 'چشمی، پوستی و موضعی',
    trick: 'جفت طلایی نسخه چشم‌پزشکی برای فشار چشم (گلوکوم).',
  },
  {
    id: 'hc-9',
    cuePattern: 'Amp Ceftriaxone 1g + Amp Ketorolac + Amp Lidocaine',
    instantRead: 'سفتریاکسون ۱ گرم + کتورولاک + لیدوکائین (حلال بی‌حسی)',
    shelfLocation: 'آنتی‌بیوتیک و عفونی',
    trick: 'مثلث طلایی تزریقی اورژانس: هر وقت سفتریاکسون دیدی، زیرش لیدوکائین یا آب مقطر و یک آمپول مسکن (کتورولاک/دگزامتازون) است.',
  },
  {
    id: 'hc-10',
    cuePattern: 'ظرف خالی + Oint Triamcinolone N.N + Clotrimazole + Irox / Zinc Oxide',
    instantRead: 'نسخه ترکیبی ادرارسوختگی نوزاد (ترکیب ۳ پماد در ظرف خالی)',
    shelfLocation: 'اطفال و نوزادان',
    trick: 'هر وقت بالای نسخه «ظرف خالی» و آکولاد دیدی، ترکیب تریامسینولون ان‌ان + کلوتریمازول + کرم ایروکس/زینک اکساید یا کالاندولا است.',
  },
  {
    id: 'hc-11',
    cuePattern: 'Tab Forise 20 (ونوپرازان) / Tab Ectoserc (بتاهیستین)',
    instantRead: 'قرص فورایز ۲۰ (ضداسید جدید) / قرص اکتوسرک (ضدسرگیجه)',
    shelfLocation: 'گوارش و معده',
    trick: 'فورایز (Forise) برند ونوپرازان برای معده است؛ اکتوسرک (Ectoserc) برند بتاهیستین برای سرگیجه است.',
  },
  {
    id: 'hc-12',
    cuePattern: 'Tab Losamix H / Valsomix / Arbitwin',
    instantRead: 'قرص‌های ترکیبی فشار خون (لوزامیکس اچ، والزومیکس، آربیتوین)',
    shelfLocation: 'قلب، فشار خون و دیابت',
    trick: 'پسوند mix یا H در داروهای فشار خون یعنی ترکیب با آملودیپین و هیدروکلروتیازید (با اعداد مثل 5/80 یا 5/160/12.5).',
  },
];
