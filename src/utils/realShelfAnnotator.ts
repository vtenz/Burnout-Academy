import {
  ClinicalCategory,
  DosageForm,
  PrescriptionCard,
  PrescriptionItem,
} from '../types/prescription';

export interface ShelfBoundingBox {
  /** Left offset percentage (0..100) */
  x: number;
  /** Top offset percentage (0..100) */
  y: number;
  /** Width percentage (0..100) */
  w: number;
  /** Height percentage (0..100) */
  h: number;
}

export interface RealExamShelfPhoto {
  id: number;
  title: string;
  signLabel: string;
  description: string;
  rowsSummary: string[];
}

export interface RealShelfHotspot {
  id: string;
  shelfPhotoId: number;
  drugTitle: string;
  rowLabel: string;
  boxVisualCue: string;
  rect: ShelfBoundingBox;
  /** Optional dosage form restriction so Ampoules only match Shelf 1, Syrups match Shelf 12, etc. */
  allowedForms?: DosageForm[];
  persianKeywords: string[];
  englishKeywords: string[];
  isSignatureBrand?: boolean;
}

export interface MatchedItemShelfAnnotation {
  itemIndex: number; // 1-based index in the prescription
  item: PrescriptionItem;
  shelfPhotoId: number;
  shelfTitle: string;
  hotspotId: string;
  drugOnShelfTitle: string;
  rowLabel: string;
  boxVisualCue: string;
  rect: ShelfBoundingBox;
  isExactBoxMatch: boolean;
  colorHex: string;
  badgeBgClass: string;
  borderClass: string;
}

export interface RankedExamPrescription {
  rank: number;
  prescription: PrescriptionCard;
  probabilityScore: number; // 15..99
  probabilityTier: 'very-high' | 'high' | 'medium' | 'low';
  probabilityLabel: string;
  exactMatchCount: number;
  totalItems: number;
  exactCoveragePercent: number;
  shelfIdsUsed: number[];
  annotations: MatchedItemShelfAnnotation[];
}

export const ITEM_HIGHLIGHT_PALETTE = [
  {
    colorHex: '#10b981', // emerald
    badgeBgClass: 'bg-emerald-500 text-slate-950 border-emerald-300',
    borderClass: 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.75)]',
  },
  {
    colorHex: '#f59e0b', // amber
    badgeBgClass: 'bg-amber-400 text-slate-950 border-amber-200',
    borderClass: 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.75)]',
  },
  {
    colorHex: '#06b6d4', // cyan
    badgeBgClass: 'bg-cyan-400 text-slate-950 border-cyan-200',
    borderClass: 'border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.75)]',
  },
  {
    colorHex: '#f43f5e', // rose
    badgeBgClass: 'bg-rose-500 text-white border-rose-300',
    borderClass: 'border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.75)]',
  },
  {
    colorHex: '#a855f7', // purple
    badgeBgClass: 'bg-purple-500 text-white border-purple-300',
    borderClass: 'border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.75)]',
  },
  {
    colorHex: '#84cc16', // lime
    badgeBgClass: 'bg-lime-400 text-slate-950 border-lime-200',
    borderClass: 'border-lime-400 shadow-[0_0_16px_rgba(132,204,22,0.75)]',
  },
  {
    colorHex: '#ec4899', // pink
    badgeBgClass: 'bg-pink-500 text-white border-pink-300',
    borderClass: 'border-pink-400 shadow-[0_0_16px_rgba(236,72,153,0.75)]',
  },
  {
    colorHex: '#3b82f6', // blue
    badgeBgClass: 'bg-blue-500 text-white border-blue-300',
    borderClass: 'border-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.75)]',
  },
];

export const REAL_EXAM_SHELVES: RealExamShelfPhoto[] = [
  {
    id: 1,
    title: 'قفسه ۱: آمپول‌ها و ویال‌های تزریقی',
    signLabel: 'آمپول ها',
    description:
      'شامل تمام آمپول‌ها و ویال‌های پرتکرار امتحان (دگزامتازون، بتامتازون LA، نوروبیون، بکوویت، دی‌تری‌کل، متوکاربامول، سفتریاکسون، سفازولین، سیکلومین، پلازیل، کلرفنیرامین و پنتوپرازول تزریقی).',
    rowsSummary: [
      'طبقه ۱: دگزامتازون، راویت-بی (نوروبیون)، بتامتازون ال.آ (اکسیر)، بتازون',
      'طبقه ۲: متوکاربامول، آمپول HCG 5000، پروژسترون ۵۰، دگزامتازون، ویال سفازولین ۱ گرم',
      'طبقه ۳: ویتامین B12، بکوویت (ب‌کمپلکس اکسیر)، دی‌تری‌کل (ویتامین D3)، تریامسینولون ۴۰، فروزماید ۴۰',
      'طبقه ۴: سیکلومین (دی‌سیکلومین)، وبیامین ۱۰۰۰ (B12)، نوروبیون، ویال پنتوپرازول ۴۰',
      'طبقه ۵: اپی‌نفرین، تریام‌هگزال ۴۰، کلرفنیرامین، پلادیک (متوکلوپرامید)، لیدوکائین',
      'طبقه ۶: ب‌کمپلکس، روکامیکس (پیرکسیکام/ملوکسیکام)، سفتریاکسون ۱ گرم، نوروبیون، رانیتیدین',
    ],
  },
  {
    id: 2,
    title: 'قفسه ۲: داروهای اعصاب و روان (بخش اول)',
    signLabel: 'دارو های اعصاب',
    description:
      'قرص‌ها و کپسول‌های اعصاب، افسردگی، تشنج و آرام‌بخش (پوکساید، دپاکین، آلپرازولام، ترانکوپین ۱۰۰، ریسپریدون، پرگابالین ۷۵، سیتالوپرام، لوکستا ۲۰، الانزاپین، فلوکستین، زولوفت، پیراستام و گاباپنتین رازک).',
    rowsSummary: [
      'طبقه ۱: کاربامازپین/کلونازپام، دیوآپوکس (سدیم والپروات)، ارگوتامین-سی',
      'طبقه ۲: پوکساید (کلردیازپوکساید)، دپاکین کرونو، آلپرازولام ۰/۵، ترانکوپین ۱۰۰ (کوئنتیاپین)، ریسپریدون',
      'طبقه ۳: تری‌هگزی‌فنیدیل ۲ (آرتان)، پرگابالین ۷۵، سیتالوپرام، آلزیکسا ۵',
      'طبقه ۴: هالوپریدول، لوکستا ۲۰ (دولوکستین)، الانزاپین، ایمی‌پرامین، لورازپام ۲ عبیدی، نورتریپتیلین ۱۰، کاربامازپین ۲۰۰',
      'طبقه ۵: فلوکستین ۲۰، تری‌فلوپرازین، زولوفت ۱۰۰ (سرترالین)، پیراستام ۸۰۰، ریسپریدون، ریواستیگمین ۳',
      'طبقه ۶: فلووکسامین ۱۰۰ (لوکسام)، کپسول گاباپنتین ۱۰۰ و ۳۰۰ (رازک)',
    ],
  },
  {
    id: 3,
    title: 'قفسه ۳: داروهای قلبی، فشار خون و دیابت',
    signLabel: 'دارو های قلبی',
    description:
      'داروهای فشار خون، قلب و قند خون (نیتروژل، والزومیکس، آدوان ۸۰، اسپیداکتون، پروپرانولول، آسویکس، آملودیپین، کاپتوپریل، آسپرین ۸۰، زباکر ۲/۵، لوزار ۲۵، پرانول ۱۰، پنتوس ۴۰، زیپمت، دیابزید و متفورمین ۵۰۰).',
    rowsSummary: [
      'طبقه ۱: نیتروژل ۰/۴، آملوپرس ۵، والزومیکس ۵/۸۰، آدوان ۸۰ (والسارتان)، اسپیداکتون ۱۰۰',
      'طبقه ۲: دیلتیازم، نیتروکاردین و سوستاک ۶/۴، پروپرانولول ۲۰ عبیدی، آسویکس ۷۵ (کلوپیدوگرل)',
      'طبقه ۳: هیدروکلروتیازید، آملودیپین آریا ۵، کاپتوپریل ۲۵ و ۵۰ اکسیر، آ.اس.آ ۸۰ و ۱۰۰',
      'طبقه ۴: زباکر ۲/۵ (بیزوپرولول)، لوزار ۲۵ (لوزارتان)، پرانول ۱۰، آتورواستاتین، پنتوس ۴۰، آ.اس.آ ۸۰، فوروزماید',
      'طبقه ۵: گلوکوفاژ/متفورمین، زیپمت ۵۰/۵۰۰، گلی‌بن‌کلامید، دیابزید ۸۰ (گلیکلازید)، پیوگلیتازون، متفورمین ۵۰۰',
    ],
  },
  {
    id: 4,
    title: 'قفسه ۴: داروهای گوارشی و معده',
    signLabel: 'دارو های گوارشی',
    description:
      'داروهای ضداسید، ضدتهوع و روده (هیوتکس، دی‌مکس، نولپازا ۲۰، پنتومید ۴۰، سایمتیدین، کولوفین/کلوفک ۱۳۵، پانکراتین، فاموتیدین ۲۰ و ۴۰، امپرازول ۲۰، کلیدینیوم-سی، دومپریدون، دمیترون ۴، سولفاسالازین و دایمتیکون).',
    rowsSummary: [
      'طبقه ۱: هیوتکس ۱۰ (هیوسین)، دی‌مکس ۱۲۵ و ۱۸۰ (دایمتیکون جویدنی)',
      'طبقه ۲: نولپازا ۲۰ (پنتوپرازول)، پنتومید ۴۰، سایمتیدین ۲۰۰، کولوفین ۱۳۵ و متوکلوپرامید، پانکراتین',
      'طبقه ۳: فاموتیدین ۲۰ و ۴۰، لنسوپرازول، کلوفک ۱۳۵ (مبورین خارجی) و دیفنوکسیلات، دی‌سیکلومین، امپرازول ۲۰',
      'طبقه ۴: پنتوپرازول ۴۰، رانیتیدین، کلیدینیوم-سی، رایزول (امپرازول ۲۰)، دومپریدون ۱۰',
      'طبقه ۵: دمیترون ۴ (اندانسترون)، اس‌امپرازول (نکسیوم)، سولفاسالازین ۵۰۰، بیزاکودیل',
      'طبقه ۶: دایمتیکون ۴۰، کلپرمین و کولومب ۱۳۵، آلومینیوم ام‌جی‌اس، سوکرالفیت ۵۰۰',
    ],
  },
  {
    id: 5,
    title: 'قفسه ۵: پمادها و کرم‌های موضعی + دیورتیک‌ها',
    signLabel: 'پمادها و کرم‌های موضعی',
    description:
      'انواع پمادها و کرم‌های پوستی و چشمی (فلوئوسینولون، هیدروکورتیزون ۱٪، بتامتازون، موپیروسین ناژو ۲٪، کلوبتازول، کلوتریمازول، تریامسینولون ان.ان، اورکس ۲۰٪ و درموپان) به همراه قرص‌های دیورتیک در طبقات بالا.',
    rowsSummary: [
      'طبقه ۱ و ۲: تیکلوپیدین، اسپیرونولاکتون، کاپتوپریل ۲۵، وراپامیل ۴۰، فوروزماید ۴۰، تریامترن-اچ',
      'طبقه ۳: پماد فلوئوسینولون، پماد هیدروکورتیزون ۱٪، بتامتازون، موپیروسین ۲٪ ناژو، کلوبتازول (کلوویت)',
      'طبقه ۴: کرم کلوتریمازول ۱٪، پماد تریامسینولون ان.ان، کرم اورکس ۲۰٪ (اوسرین اوره)، کرم درموپان ۵٪',
    ],
  },
  {
    id: 6,
    title: 'قفسه ۶: داروهای آرام‌بخش (اعصاب ۲)',
    signLabel: 'دارو های آرام بخش',
    description:
      'داروهای آرام‌بخش، ضدافسردگی و ضدتشنج تکمیلی (دیازپام، زولپیدم، پرگابالین ۵۰ و ۷۵، سرترالین، اس‌سیتالوپرام/لوبل، کلونازپام ۱ و ۲، سیتالوپرام هگزال، لیتیوم کربنات، بوسپیرون، توپیرامات و رهاکین ۲۰۰).',
    rowsSummary: [
      'طبقه ۱: آلپرازولام ۰/۵، زولپیدم ۱۰، دیازپام ۵ و ۱۰، لورازپام ۲',
      'طبقه ۲: پرگابالین ۵۰، سرترالین ۱۰۰، لوبل (اس‌سیتالوپرام/لووتیراستام)، ارگوتامین-سی',
      'طبقه ۳: داکسپین ۱۰، کلونازپام ۱ و ۲، کلومیپرامین ۲۵، فنوباربیتال، سیتالوپرام هگزال ۴۰',
      'طبقه ۴: تیوریدازین ۲۵، ترانکوپین ۲۵، کاربامازپین ۲۰۰، فلورازپام ۱۵',
      'طبقه ۵: لیتمون ۳۰۰ (لیتیوم)، سرترالین ۵۰ و ۱۰۰، بوسپیراکس ۱۰ (بوسپیرون)، کلردیازپوکساید ۵',
      'طبقه ۶: توپیرامات ۱۰۰، دپاکین، پرگابالین ۷۵، پاروکستین ۲۰، رهاکین ۲۰۰ (سدیم والپروات)',
    ],
  },
  {
    id: 7,
    title: 'قفسه ۷: داروهای خارجی (مهم‌ترین قفسه آزمون!)',
    signLabel: 'دارو های خارجی',
    description:
      'مهم‌ترین قفسه برای نسخه‌های چالشی امتحان! شامل برندهای معروفی که پزشکان دقیقاً با همین نام می‌نویسند: Betaserc 8، MetoHEXAL 47.5، Piascledine 300، Zoloft 50، Sirdalud 4، Asentra 50، Tamsulosin Hexal 0.4، Roaccutane، Cobix 100، Zaditen، Lanoxin، Celebrex 100، Rowatinex و Tegretol.',
    rowsSummary: [
      'طبقه ۱: لووکارویت (ال-کارنیتین)، بتاسرک ۸ (Betaserc 8)، مادوپار ۲۵۰، وارفارین ۵، تریپل فلکس',
      'طبقه ۲: متوهگزال ۴۷/۵ (MetoHEXAL 47.5)، پیاسکلدین ۳۰۰ (Piascledine 300)، آرتروسن، زولوفت ۵۰ (Zoloft)، سیردالود ۴ (Sirdalud)',
      'طبقه ۳: آسنترا ۵۰ (Asentra 50 - سه جعبه روی هم)، تامسولوسین هگزال ۰/۴، رواکوتان ۲۰، کوبیکس ۱۰۰ (Cobix)',
      'طبقه ۴: زادیتن (Zaditen - کتوتیفن خارجی)، لانوکسین ۰/۲۵ (دیگوکسین)، رانوور ۱۵۰، سلبرکس ۱۰۰ (Celebrex)',
      'طبقه ۵: پریناتال (Prenatal)، لتیزن ۱۰، رواتینکس (Rowatinex)، تگرتول ۲۰۰ و ۴۰۰ (Tegretol)',
    ],
  },
  {
    id: 8,
    title: 'قفسه ۸: داروهای مسکن و ضدالتهاب مفاصل',
    signLabel: 'دارو های مسکن',
    description:
      'انواع مسکن‌ها، شل‌کننده‌های عضلانی و ضدالتهاب‌ها (ژلوفن، ادویفن ۴۰۰، سلکسیب ۱۰۰ و ۲۰۰، مفنامیک اسید ۲۵۰، آ.ث.آ، تیزانیدین، ناپروکسن ۲۵۰ و ۵۰۰، استامینوفن ۵۰۰ و ۳۲۵، رهامون، باکلوفن، نوافن، ملوکسیکام، استامینوفن کدئین، ولتادک ۱۰۰، ترامادول و ایندومتاسین ۲۵).',
    rowsSummary: [
      'طبقه ۱: ناپروکسن ۵۰۰، ژلوفن ۲۰۰ و ۴۰۰ (Gelofen)، ادویفن ۴۰۰ (Advifen)',
      'طبقه ۲: دگزامتازون ۰/۵، سلکسیب ۱۰۰ (Celecoxib)، مفنامیک اسید ۲۵۰، آ.ث.آ',
      'طبقه ۳: فارماپین، تیزانیدین ۴، ناپروکسن ۲۵۰، استامینوفن ۵۰۰ و ۳۲۵، رهامون',
      'طبقه ۴: باکلوفن ۱۰ و ۲۵، نوافن (Novafen)، ملوکسیکام ۷/۵ و ۱۵ (موبیکس)، استامینوفن کدئین',
      'طبقه ۵: ادویفن ۴۰۰، ولتادک ۱۰۰ (دیکلوفناک آهسته‌رهش)، ترامادول ۵۰ و ۱۰۰',
      'طبقه ۶: دیکلوفناک ۲۵ و ۱۰۰، ایندومتاسین ۲۵، پیروکسیکام، سلکسیب ۱۰۰ و ۲۰۰',
    ],
  },
  {
    id: 9,
    title: 'قفسه ۹: شیاف‌ها و قلم‌های انسولین',
    signLabel: 'شیافها',
    description:
      'شامل قلم‌های انسولین در بالای قفسه (Levemir، Lantus، NovoMix) و انواع شیاف‌ها در داخل قفسه (دیکلوفناک ۵۰ و ۱۰۰، بیزاکودیل ۵ و ۱۰، آنتی‌هموروئید، استامینوفن ۱۲۵ و ۳۲۵ کودکان، گلیسیرین و شیاف پروژسترون).',
    rowsSummary: [
      'بالای قفسه: قلم انسولین لومیر (Levemir)، لانتوس (Lantus SoloStar)، نوومیکس ۳۰ (NovoMix)',
      'طبقه ۱: شیاف دیکلوفناک ۵۰ و ۱۰۰، شیاف سیکلوژست/پروژسترون',
      'طبقه ۲: شیاف بیزاکودیل ۵ و ۱۰، شیاف آنتی‌هموروئید، شیاف دیکلوفناک ۱۰۰',
      'طبقه ۴: شیاف استامینوفن ۱۲۵ و ۳۲۵ (فرنیژست)',
      'طبقه ۵: شیاف گلیسیرین کودکان و بزرگسالان، شیاف ایندومتاسین ۵۰',
    ],
  },
  {
    id: 10,
    title: 'قفسه ۱۰: داروهای زنان، نازایی و هورمونی',
    signLabel: 'دارو های زنان',
    description:
      'قرص‌ها و کپسول‌های تخصصی زنان و غدد (دانازول، اوسیت HD و LD، قرص واژینال نیستاتین، متیل‌ارگونوین، مدروکسی‌پروژسترون، لتروزول/لتروفم، کلومیفن/اوومید، ترنسید ۲۵۰، استرومارین، دوفاستون ۱۰، سیپروترون کامپاند، دزوسپتیو، لووکسین، کابرگولین و فلوکونازول ۱۵۰).',
    rowsSummary: [
      'طبقه ۱: کپسول دانازول ۲۰۰، قرص اوسیت اچ‌دی (HD)',
      'طبقه ۲: قرص واژینال نیستاتین، مژسترول ۴۰، متیل‌ارگونوین، لیبیدوفم و لاولایف',
      'طبقه ۳: مدروکسی‌پروژسترون ۵، لتروفم (لتروزول ۲/۵)، اوومید ۵۰ (کلومیفن)، اوسیت ال‌دی (LD)، کپسول ترنسید ۲۵۰ (ترانگزامیک اسید)',
      'طبقه ۴: متیل‌ارگونوین، ایزوکسوپرین ۱۰، لاینسترول، استرومارین ۰/۶۲۵ و ۱/۲۵',
      'طبقه ۵: دوفاستون ۱۰ (Duphaston - دیدروژسترون)، تری‌فازیک، سیپروترون کامپاند، دزوسپتیو',
      'طبقه ۶: لووکسین ۰/۱ (لووتیروکسین)، لونژیل ۰/۷۵، تاموکسیفن ۲۰، کابرگولین، فلوکونازول ۱۵۰ (جعبه صورتی)',
    ],
  },
  {
    id: 11,
    title: 'قفسه ۱۱: پودرها، قطره‌های چشمی، کورتون و چربی خون',
    signLabel: 'پودرها / داروهای انگلی / داروهای کورتون',
    description:
      'شامل پودرها (ORS، پیدرولاکس، سوربیتول)، داروهای ضدباکتری/ضدانگل (آلبندازول، مبندازول، پرمترین)، قطره‌های چشمی و اسپری بینی (فلوتیکازون، اشک مصنوعی آرتلاک)، قرص پردنیزولون ۵ و ۵۰، و قرص‌های چربی خون (آتورواستاتین، لوواستاتین، فنوفیبرات).',
    rowsSummary: [
      'طبقه ۱: پودر ORS، سوربیتول، کلستیرامین',
      'طبقه ۲ و ۳: لوسیون پرمترین، قرص آلبندازول ۴۰۰، مبندازول ۱۰۰، پودر پیدرولاکس (پلی‌اتیلن گلیکول)',
      'طبقه ۴: اسپری بینی فلوتیکازون، قطره‌های چشمی (بتامتازون، سیپروفلوکساسین، کلرامفنیکل، نفازولین)',
      'طبقه ۵: قطره چشمی آرتلاک (Artelac - اشک مصنوعی)، قرص پردنیزولون ۵ و ۵۰',
      'طبقه ۶: آتورواستاتین ۱۰، ۲۰ و ۴۰، لوواستاتین، کپسول فنوفیبرات ۲۰۰',
    ],
  },
  {
    id: 12,
    title: 'قفسه ۱۲: شربت‌ها، سوسپانسیون‌ها و قطره‌های اطفال',
    signLabel: 'شربت ها',
    description:
      'تمامی شربت‌های سرماخوردگی، سرفه، آنتی‌بیوتیک، گوارشی و تقویتی کودکان و بزرگسالان (پدی‌کاف، برم‌هگزین، ایبوپروفن، کوریزان، لاکتولوز، مترونیدازول، کوتریموکسازول، دیفن‌هیدرامین، اکسپکتورانت، کیدی‌لاکت، گل‌گریپ، استامینوفن، اندانسترون، ستیریزین، زینک سولفات، سفیکسیم ۱۰۰، آزیترومایسین ۲۰۰ و شربت اپیلیم).',
    rowsSummary: [
      'طبقه ۱: شربت سالبوتامول/تئوفیلین، شربت پدی‌کاف، شربت برم‌هگزین، شربت ایبوپروفن، شربت کوریزان',
      'طبقه ۲: شربت لاکتولوز (Lactulose)، سوسپانسیون مترونیدازول، کوتریموکسازول، شربت دیفن‌هیدرامین و اکسپکتورانت',
      'طبقه ۳: ساشه کیدی‌لاکت زینک، شربت گل‌گریپ، شربت زینک‌پلاس، شربت کوریزان، قطره کیدی‌لاکت (KidiLact)',
      'طبقه ۴: شربت کوریزان درد و تب، شربت استامینوفن، شربت اندانسترون، شربت ستیریزین، شربت زینک سولفات',
      'طبقه ۵: شربت سالبوتامول، سوسپانسیون سفیکسیم ۱۰۰ (آفاکسیم)، قطره آهن و مولتی‌ویتامین، سوسپانسیون آزیترومایسین و سفالکسین',
      'طبقه ۶: شربت هیدروکسی‌زین، شربت آلومینیوم ام‌جی‌اس، شربت اپیلیم (سدیم والپروات)',
    ],
  },
  {
    id: 13,
    title: 'قفسه ۱۳: داروهای گیاهی',
    signLabel: 'دارو های گیاهی',
    description:
      'شربت‌ها و قرص‌های گیاهی پرتکرار (شربت تیمولی/آویشن، شربت فیژان، رولاکس، سنکل، لیورگل ۱۴۰، کپسول آناهیل، پودر پسیلیوم، قرص سی‌لاکس، شیر افزا، روتارین، سویاگل، روهمورین، کلپرمین و پروستاتان).',
    rowsSummary: [
      'طبقه ۱: شربت تیمولی، شربت آویشن کیمیاگر، شربت فیژان، قرص رولاکس، قطره سنکل، قرص لیورگل ۱۴۰',
      'طبقه ۲: لاکتودین، کپسول آناهیل (Anaheal - بروملین)، پودر پسیلیوم، قرص سی‌لاکس (C-Lax)',
      'طبقه ۳: جینکوتیدی، لیورگل ۷۰، شیر افزا، روتارین، سویاگل، روهمورین',
      'طبقه ۴: کلپرمین (نعناع فلفلی)، پودر موسیلیوم، کپسول پروستاتان',
    ],
  },
  {
    id: 14,
    title: 'قفسه ۱۴: آنتی‌هیستامین‌ها، سرگیجه و سرماخوردگی',
    signLabel: 'آنتی هیستامینها',
    description:
      'قرص‌های حساسیت، کهیر، سرگیجه و سرماخوردگی (کلداکس، اکتوسرک ۸ و ۱۶، بتاهیستین ۸، مونته‌لوکاست/ایروکاست، کلرفنیرامین ۴، آپو-ستیریزین، لوراتادین ۱۰، هیدروکسی‌زین ۲۵، سیپروهپتادین ۴، فکسوفنادین/تلفست ۱۸۰، لتیزن ۱۰، گریپین، کوریزان، پرازوسین، ترازوسین، فین‌پشیا و سرماخوردگی بزرگسالان).',
    rowsSummary: [
      'طبقه ۱: کلداکس، اکتوسرک ۱۶ (بتاهیستین)، بتاهیستین ۸، مونته‌لوکاست ۱۰ (مونتکس)',
      'طبقه ۲: کلرفنیرامین ۴، آپو-ستیریزین ۱۰، لوراتادین ۱۰، تدارین ۲۵ (هیدروکسی‌زین)، ستیریزین ۱۰، سیپروهپتادین ۴، فکسوفنادین ۱۸۰',
      'طبقه ۳: لتیزن ۱۰ (ستیریزین)، ایروکاست ۴، ۵ و ۱۰ (مونته‌لوکاست)، تلفست ۱۲۰ و ۱۸۰ (Telfast)، اکتوسرک ۸',
      'طبقه ۴: گریپین، کوریزان بزرگسالان، کلداکس، آلکاف، پرازوسین ۵، ترازوسین ۲، فین‌پشیا (Finpecia)، سرماخوردگی بزرگسالان',
    ],
  },
  {
    id: 15,
    title: 'قفسه ۱۵: ویتامین‌ها، آهن، کم‌خونی و قرص جوشان (بخش راست)',
    signLabel: 'ویتامین‌ها و کم‌خونی',
    description:
      'کپسول‌ها و قرص‌های کم‌خونی و ویتامینه (ای-ویژل ۲۰۰ و ۴۰۰، فولفول، ففول، فروتب، ویتامین B1 300، ویتامین C 250، تالبکوبید، امگا-۳، کلسیتریول ۰/۲۵، مولتی‌ویتامین مینرال، ای-زاویت، هماتینیک، سیستین B6 زینک، دی-ویژل ۵۰۰۰۰، آ-ویژل، فولیک اسید ۱ و ۵، آیزن پلاس، د-ویتین و قرص‌های جوشان کلسیم و ویتامین ث).',
    rowsSummary: [
      'طبقه ۱: ای-ویژل ۲۰۰ و ۴۰۰، فولفول (Fullfol)، فروتب (فروس سولفات)، ویتامین ب۱ ۳۰۰، ویتامین ث ۲۵۰',
      'طبقه ۲: ففول (Fefol)، تالبکوبید، آهن+فولیک اسید، امگا-۳، کلسیتریول ۰/۲۵، مولتی‌ویتامین، هماتینیک (Hematinic)',
      'طبقه ۳: سیستین B6 زینک رازک، مگا کلسی-د، دی-ویژل ۵۰۰۰۰ (ویتامین D3)، آ-ویژل، فولیک اسید ۱ و ۵، آیزن پلاس (Eisen plus)، د-ویتین',
      'طبقه ۴: قرص جوشان کلسیم و ویتامین ث، کپسول پرگناکر/بارداری، امگا-رکس',
    ],
  },
  {
    id: 16,
    title: 'قفسه ۱۶: مکمل‌ها، کلسیم، زینک پلاس و فروگلوبین (بخش چپ)',
    signLabel: 'مکمل‌ها و کلسیم',
    description:
      'مکمل‌های تغذیه‌ای، مفاصل، پوست و مو (نفروویت، کالمرز، کلسی‌کر، امگا-۳، هرویت، آیرون پلاس، ویتامین C + زینک، تالیکوئید پلاس، ففار، فروگلوبین و کپسول‌های زینک پلاس یوروویتال و دانا).',
    rowsSummary: [
      'طبقه ۱: نفروویت (Nephrovit)، کالمرز (Calmerz)، کلسی‌کر (CalciCare)',
      'طبقه ۲: نوروتامین، امگا-۳ (Omega-3)، ویتامین D3',
      'طبقه ۳: هرویت (Hair-Vit)، آیرون پلاس (Iron+)، ویتامین C + زینک، تالیکوئید پلاس، ففار (Fefar)',
      'طبقه ۴: فروگلوبین (Feroglobin)، زینک پلاس (Zinc Plus - قوطی و جعبه با عکس صورت)، کلسی‌کر',
    ],
  },
  {
    id: 17,
    title: 'قفسه ۱۷: داروهای آنتی‌بیوتیک و ضدعفونی',
    signLabel: 'دارو های آنتی بیوتیک',
    description:
      'تمامی قرص‌ها و کپسول‌های آنتی‌بیوتیک و ضدقارچ (لوپراکس/سفیکسیم ۲۰۰ و ۴۰۰، سفالکسین ۵۰۰، سیپروفلوکساسین ۵۰۰، نیتروفورانتوئین ۱۰۰، آمپی‌سیلین ۵۰۰، مترونیدازول ۲۵۰، کلاموکس/کوآموکسی‌کلاو ۳۷۵ و ۶۲۵، آزیترومایسین ۲۵۰ و ۵۰۰، کلاریترومایسین ۵۰۰، کلوگزاسیلین، آموکسی‌سیلین ۵۰۰، تاوانکس/لووفلوکساسین ۵۰۰، داکسی‌سایکلین ۱۰۰، فلوکونازول ۱۵۰ و کوتریموکسازول).',
    rowsSummary: [
      'طبقه ۱: لوپراکس ۴۰۰ و ۲۰۰ (سفیکسیم)، سفالکسین ۵۰۰، سیپروفلوکساسین ۵۰۰، نیتروفورانتوئین ۱۰۰، آمپی‌سیلین ۵۰۰',
      'طبقه ۲: مترونیدازول ۲۵۰، کلاموکس ۶۲۵، آزیترومایسین ۲۵۰ اکسیر، آموکسی‌سیلین ۵۰۰، کلوگزاسیلین ۵۰۰، آزیترومایسین ۵۰۰ و کلاریترومایسین ۵۰۰',
      'طبقه ۳: آموراکس ۵۰۰، سفیکسیم ۴۰۰، سیپروفلوکساسین ۵۰۰، کلاموکس ۳۷۵ و ۶۲۵ (کوآموکسی‌کلاو)، مترونیدازول ۲۵۰، سفالکسین ۵۰۰',
      'طبقه ۴: کوآموکسی‌کلاو ۶۲۵، تاوانکس ۵۰۰ (لووفلوکساسین)، آموکسی‌سیلین ۵۰۰، داکسی‌سایکلین ۱۰۰، فلوکونازول ۱۵۰، سیپروفلوکساسین ۵۰۰، کوتریموکسازول',
    ],
  },
];

export const REAL_SHELF_HOTSPOTS: RealShelfHotspot[] = [
  // ================= SHELF 1: AMPOULES (آمپول‌ها) =================
  {
    id: 'sh1-dexa',
    shelfPhotoId: 1,
    drugTitle: 'آمپول دگزامتازون ۸mg/2ml',
    rowLabel: 'طبقه ۱ (بالا) سمت چپ و طبقه ۲ وسط',
    boxVisualCue: 'جعبه سفید با نوار آبی در طبقه ۱ چپ (و جعبه زرد-سفید ایستاده در طبقه ۲)',
    rect: { x: 22, y: 11, w: 11, h: 9 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول دگزامتازون', 'دگزامتازون'],
    englishKeywords: ['amp dexa', 'dexamethasone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-neurobion-top',
    shelfPhotoId: 1,
    drugTitle: 'آمپول نوروبیون / راویت-بی (B1+B6+B12)',
    rowLabel: 'طبقه ۴ وسط و طبقه ۶ پایین',
    boxVisualCue: 'جعبه سفید افقی «نوروبیون» در طبقه ۴ وسط (و راویت-بی بنفش در طبقه ۱)',
    rect: { x: 50, y: 58, w: 12, h: 8 },
    allowedForms: ['آمپول'],
    persianKeywords: ['نوروبیون', 'راویت', 'آمپول نوروبیون'],
    englishKeywords: ['neurobion', 'ravit'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-betamethasone-la',
    shelfPhotoId: 1,
    drugTitle: 'آمپول بتامتازون ال.آ (Betamethasone LA / بتازون)',
    rowLabel: 'طبقه ۱ (بالا) — وسط و سمت راست',
    boxVisualCue: 'جعبه سرمه‌ای-سفید «بتامتازون ال.آ - اکسیر» و دو جعبه سفید «بتازون ال.آ» در طبقه اول',
    rect: { x: 46, y: 14, w: 35, h: 8 },
    allowedForms: ['آمپول'],
    persianKeywords: ['بتامتازون', 'بتازون', 'بتامتازون ال'],
    englishKeywords: ['betamethasone', 'betasone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-methocarbamol',
    shelfPhotoId: 1,
    drugTitle: 'آمپول متوکاربامول (روباکسین)',
    rowLabel: 'طبقه ۲ سمت چپ (و طبقه ۳ وسط-راست)',
    boxVisualCue: 'جعبه بزرگ سبز-سفید ایستاده در منتهی‌الیه چپ طبقه دوم',
    rect: { x: 21, y: 24, w: 12, h: 11 },
    allowedForms: ['آمپول'],
    persianKeywords: ['متوکاربامول', 'روباکسین', 'آمپول متوکاربامول'],
    englishKeywords: ['methocarbamol', 'robaxin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-hcg',
    shelfPhotoId: 1,
    drugTitle: 'آمپول HCG ۵۰۰۰ واحد (کوریونیک گونادوتروپین)',
    rowLabel: 'طبقه ۲ — دومین جعبه از سمت چپ',
    boxVisualCue: 'جعبه سفید با نشان قرمز 5000 (کوریونیک گونادوتروپین انسانی)',
    rect: { x: 33, y: 26, w: 11, h: 9.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['گونادوتروپین', 'هاش سی جی', 'پرگنيل', 'hcg'],
    englishKeywords: ['hcg', 'chorionic', 'pregnyl'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-progesterone',
    shelfPhotoId: 1,
    drugTitle: 'آمپول پروژسترون ۵۰mg',
    rowLabel: 'طبقه ۲ — وسط-بالا و جعبه‌های بنفش سمت راست',
    boxVisualCue: 'جعبه سفید-آبی «پروژسترون ۵۰» در بالای طبقه ۲ و جعبه‌های بنفش سمت راست',
    rect: { x: 63, y: 26, w: 17, h: 10 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول پروژسترون', 'پروژسترون', 'پرولوتون'],
    englishKeywords: ['amp progesterone', 'progesterone', 'proluton'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-cefazolin',
    shelfPhotoId: 1,
    drugTitle: 'ویال سفازولین ۱ گرم',
    rowLabel: 'طبقه ۲ — وسط-راست',
    boxVisualCue: 'جعبه سفید-آبی افقی «سفازولین ۱ گرم» در طبقه دوم',
    rect: { x: 52, y: 30, w: 12, h: 6.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['سفازولین', 'کفزول'],
    englishKeywords: ['cefazolin', 'kefzol'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-becovit',
    shelfPhotoId: 1,
    drugTitle: 'آمپول بکوویت / ویتامین ب‌کمپلکس (B-Complex + B12)',
    rowLabel: 'طبقه ۳ — سمت چپ (بکوویت سرمه‌ای و ب۱۲ بالای آن)',
    boxVisualCue: 'جعبه سرمه‌ای-قرمز-سفید «بکوویت (ویتامین ب کمپلکس اکسیر)» و جعبه سفید وبیامین ۱۰۰۰ بالای آن',
    rect: { x: 22, y: 36, w: 14, h: 14.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['ب کمپلکس', 'ب‌کمپلکس', 'بکوویت', 'ویتامین ب۱۲', 'وبیامین', 'سیانوکوبالامین'],
    englishKeywords: ['b-complex', 'b complex', 'becovit', 'b12', 'cyanocobalamin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-d3col',
    shelfPhotoId: 1,
    drugTitle: 'آمپول ویتامین D3 (دی تری کل ۳۰۰,۰۰۰ واحد)',
    rowLabel: 'طبقه ۳ — دومین جعبه از چپ',
    boxVisualCue: 'جعبه سفید با کادر سبز «دی تری کل» کنار بکوویت',
    rect: { x: 35, y: 43, w: 11, h: 7.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول ویتامین دی', 'آمپول ویتامین d', 'دی تری کل', 'کوله کلسیفرول'],
    englishKeywords: ['amp vit d', 'amp d3', 'd3-col', 'cholecalciferol'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-triamcinolone',
    shelfPhotoId: 1,
    drugTitle: 'آمپول تریامسینولون ۴۰ (اکسیر / تریام‌هگزال ۴۰)',
    rowLabel: 'طبقه ۳ وسط (تریامسینولون اکسیر) و طبقه ۵ چپ (تریام‌هگزال قرمز)',
    boxVisualCue: 'جعبه سرمه‌ای-سبز در طبقه ۳ وسط و جعبه قرمز-سفید «تریام هگزال ۴۰» در طبقه ۵',
    rect: { x: 45, y: 43, w: 12, h: 7.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['تریامسینولون', 'تریام هگزال', 'تریام‌هگزال'],
    englishKeywords: ['triamcinolone', 'triamhexal'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-furosemide',
    shelfPhotoId: 1,
    drugTitle: 'آمپول فروزماید ۴۰ (لازیکس)',
    rowLabel: 'طبقه ۳ — منتهی‌الیه سمت راست',
    boxVisualCue: 'جعبه سفید با طرح آبی «فروزماید ۴۰» در سمت راست طبقه سوم',
    rect: { x: 66, y: 43, w: 12, h: 8 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول فوروزماید', 'آمپول فروزماید', 'لازیکس'],
    englishKeywords: ['amp furosemide', 'lasix'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-cyclomin',
    shelfPhotoId: 1,
    drugTitle: 'آمپول سیکلومین (دی‌سیکلومین ۲۰mg) / هیوسین',
    rowLabel: 'طبقه ۴ — سمت چپ',
    boxVisualCue: 'جعبه آبی-سفید «سیکلومین (دی‌سیکلومین)» در سمت چپ طبقه چهارم',
    rect: { x: 21, y: 55, w: 11, h: 9 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول دی سیکلومین', 'آمپول دی‌سیکلومین', 'سیکلومین', 'آمپول هیوسین'],
    englishKeywords: ['dicyclomine', 'cyclomin', 'amp hyoscine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-pantoprazole-iv',
    shelfPhotoId: 1,
    drugTitle: 'ویال پنتوپرازول ۴۰mg تزریقی',
    rowLabel: 'طبقه ۴ — سمت راست',
    boxVisualCue: 'جعبه سفید-آبی «پنتوپرازول ۴۰» در سمت راست طبقه چهارم',
    rect: { x: 61, y: 58, w: 14, h: 8 },
    allowedForms: ['آمپول'],
    persianKeywords: ['ویال پنتوپرازول', 'آمپول پنتوپرازول'],
    englishKeywords: ['vial pantoprazole', 'amp pantoprazole'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-chlorpheniramine',
    shelfPhotoId: 1,
    drugTitle: 'آمپول کلرفنیرامین ۱۰mg/ml',
    rowLabel: 'طبقه ۵ — وسط',
    boxVisualCue: 'جعبه سفید با خط قرمز «کلرفنیرامین» در وسط طبقه پنجم',
    rect: { x: 42, y: 69, w: 12, h: 8.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول کلرفنیرامین', 'کلرفنیرامین تزریقی'],
    englishKeywords: ['amp chlorpheniramine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-pladic',
    shelfPhotoId: 1,
    drugTitle: 'آمپول متوکلوپرامید (پلازیل / پلادیک) و اندانسترون تزریقی',
    rowLabel: 'طبقه ۵ — سمت راست کلرفنیرامین',
    boxVisualCue: 'جعبه سفید-نارنجی «پلادیک (متوکلوپرامید)» در طبقه پنجم',
    rect: { x: 53, y: 68, w: 11, h: 10 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول متوکلوپرامید', 'پلازیل', 'پلادیک', 'آمپول اندانسترون', 'دمیترون تزریقی'],
    englishKeywords: ['plasil', 'pladic', 'amp metoclopramide', 'amp ondansetron'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-rocamix',
    shelfPhotoId: 1,
    drugTitle: 'آمپول روکامیکس (پیروکسیکام / ملوکسیکام / کتورولاک تزریقی)',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — دومین جعبه از چپ',
    boxVisualCue: 'جعبه سفید-سبز «روکامیکس» کنار ویتامین ب‌کمپلکس در طبقه ششم',
    rect: { x: 31, y: 83, w: 11, h: 9 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول پیروکسیکام', 'روکامیکس', 'آمپول کتورولاک', 'آمپول ملوکسیکام', 'آمپول دیکلوفناک'],
    englishKeywords: ['amp piroxicam', 'rocamix', 'ketorolac', 'amp meloxicam'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-ceftriaxone',
    shelfPhotoId: 1,
    drugTitle: 'ویال سفتریاکسون ۱ گرم (Ceftriaxone 1g)',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — وسط',
    boxVisualCue: 'جعبه سفید بزرگ «سفتریاکسون ۱ گرم» در وسط طبقه آخر',
    rect: { x: 41, y: 84, w: 14, h: 8.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['سفتریاکسون', 'روسفین', 'ویال سفتریاکسون'],
    englishKeywords: ['ceftriaxone', 'rocephin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh1-ranitidine-amp',
    shelfPhotoId: 1,
    drugTitle: 'آمپول رانیتیدین ۵۰mg/2ml',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — سمت راست',
    boxVisualCue: 'جعبه سفید-سبز «رانیتیدین» در منتهی‌الیه راست طبقه ششم',
    rect: { x: 64, y: 85, w: 11, h: 8.5 },
    allowedForms: ['آمپول'],
    persianKeywords: ['آمپول رانیتیدین'],
    englishKeywords: ['amp ranitidine'],
  },

  // ================= SHELF 2 & 6: NEURO / PSYCH (داروهای اعصاب و آرام‌بخش) =================
  {
    id: 'sh2-poxide',
    shelfPhotoId: 2,
    drugTitle: 'قرص پوکساید ۵ و ۱۰ (کلردیازپوکساید)',
    rowLabel: 'طبقه ۲ — سمت چپ',
    boxVisualCue: 'دو جعبه سفید روی هم «پوکساید» در سمت چپ طبقه دوم',
    rect: { x: 19, y: 31, w: 12, h: 7.5 },
    persianKeywords: ['پوکساید', 'کلردیازپوکساید', 'لیبریوم'],
    englishKeywords: ['poxide', 'chlordiazepoxide', 'librium'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-depakine',
    shelfPhotoId: 2,
    drugTitle: 'قرص دپاکین کرونو ۵۰۰ / سدیم والپروات (دیوآپوکس / رهاکین)',
    rowLabel: 'طبقه ۱ وسط (دیوآپوکس) و طبقه ۲ چپ (دپاکین کرونو)',
    boxVisualCue: 'جعبه سفید ایستاده «دپاکین کرونو» در طبقه ۲ و جعبه بزرگ «دیوآپوکس» در طبقه ۱',
    rect: { x: 30, y: 31, w: 7, h: 8 },
    persianKeywords: ['دپاکین', 'سدیم والپروات', 'والپروات', 'دیوآپوکس', 'رهاکین'],
    englishKeywords: ['depakine', 'valproate', 'divapox', 'rahakin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-alprazolam',
    shelfPhotoId: 2,
    drugTitle: 'قرص آلپرازولام ۰/۵ و ۱ میلی‌گرم (زاناکس)',
    rowLabel: 'طبقه ۲ وسط-چپ و طبقه ۴ وسط',
    boxVisualCue: 'جعبه سفید-زرد «آلپرازولام ۰/۵» در طبقه دوم و چهارم',
    rect: { x: 36, y: 34, w: 10, h: 5.5 },
    persianKeywords: ['آلپرازولام', 'زاناکس', 'آپرازولام'],
    englishKeywords: ['alprazolam', 'xanax'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-tranqopine',
    shelfPhotoId: 2,
    drugTitle: 'قرص ترانکوپین ۱۰۰ و ۲۵ (کوئنتیاپین / سروکوئل)',
    rowLabel: 'طبقه ۲ — وسط',
    boxVisualCue: 'جعبه سفید-قهوه‌ای «ترانکوپین ۱۰۰» در وسط طبقه دوم',
    rect: { x: 45, y: 34, w: 10, h: 5.5 },
    persianKeywords: ['ترانکوپین', 'کوئنتیاپین', 'سروکوئل', 'کوتیاپین'],
    englishKeywords: ['tranqopine', 'quetiapine', 'seroquel'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-risperidone',
    shelfPhotoId: 2,
    drugTitle: 'قرص ریسپریدون ۱ و ۲ میلی‌گرم',
    rowLabel: 'طبقه ۲ سمت راست و طبقه ۵ وسط',
    boxVisualCue: 'جعبه سفید-آبی «ریسپریدون» در طبقه دوم راست و طبقه پنجم',
    rect: { x: 59, y: 35, w: 11, h: 5.5 },
    persianKeywords: ['ریسپریدون'],
    englishKeywords: ['risperidone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-pregabalin',
    shelfPhotoId: 2,
    drugTitle: 'کپسول پرگابالین ۷۵ و ۵۰ (لیریکا / لایریور)',
    rowLabel: 'طبقه ۳ — وسط-راست',
    boxVisualCue: 'جعبه سفید با نوشته بنفش «پرگابالین ۷۵» در طبقه سوم',
    rect: { x: 49, y: 48, w: 12, h: 6 },
    persianKeywords: ['پرگابالین', 'لیریکا', 'لایریور', 'ژاباپنتین'],
    englishKeywords: ['pregabalin', 'lyrica', 'lyriver'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-citalopram',
    shelfPhotoId: 2,
    drugTitle: 'قرص سیتالوپرام ۲۰ و ۴۰ / اس‌سیتالوپرام (ازپرام / لگزاتال)',
    rowLabel: 'طبقه ۳ — زیر پرگابالین ۷۵ (و لوبل در قفسه ۶ طبقه ۲)',
    boxVisualCue: 'جعبه سفید-بنفش «Citalopram» زیر پرگابالین ۷۵',
    rect: { x: 49, y: 50, w: 11, h: 4.5 },
    persianKeywords: ['سیتالوپرام', 'اس سیتالوپرام', 'اس‌سیتالوپرام', 'ازپرام', 'لگزاتال', 'سیپرالکس'],
    englishKeywords: ['citalopram', 'escitalopram', 'lexatal', 'ozipram', 'cipralex'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-luxeta',
    shelfPhotoId: 2,
    drugTitle: 'کپسول لوکستا ۲۰ (دولوکستین ۲۰ / سیمبالتا)',
    rowLabel: 'طبقه ۴ — سمت چپ',
    boxVisualCue: 'جعبه سفید بزرگ با طرح صورتی-بنفش «لوکستا ۲۰» در سمت چپ طبقه چهارم',
    rect: { x: 17, y: 56, w: 16, h: 8.5 },
    persianKeywords: ['لوکستا', 'دولوکستین', 'سیمبالتا'],
    englishKeywords: ['luxeta', 'duloxetine', 'cymbalta'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-olanzapine',
    shelfPhotoId: 2,
    drugTitle: 'قرص الانزاپین ۵ و ۱۰ (اولانزاپین / زیپرکسا)',
    rowLabel: 'طبقه ۴ — کنار لوکستا ۲۰',
    boxVisualCue: 'دو جعبه سفید-سبز روی هم «الانزاپین» در طبقه چهارم',
    rect: { x: 32, y: 56, w: 10, h: 9 },
    persianKeywords: ['الانزاپین', 'اولانزاپین', 'زیپرکسا'],
    englishKeywords: ['olanzapine', 'zyprexa'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-lorazepam',
    shelfPhotoId: 2,
    drugTitle: 'قرص لورازپام ۱ و ۲ میلی‌گرم (عبیدی)',
    rowLabel: 'طبقه ۴ — وسط',
    boxVisualCue: 'جعبه سفید «لورازپام ۲ - عبیدی» در وسط طبقه چهارم',
    rect: { x: 46, y: 58, w: 11, h: 4.5 },
    persianKeywords: ['لورازپام', 'آتیوان'],
    englishKeywords: ['lorazepam', 'ativan'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-nortriptyline',
    shelfPhotoId: 2,
    drugTitle: 'قرص نورتریپتیلین ۱۰ و ۲۵ / آمی‌تریپتیلین / ایمی‌پرامین',
    rowLabel: 'طبقه ۴ — سمت راست',
    boxVisualCue: 'جعبه سفید-قهوه‌ای «نورتریپتیلین ۱۰» بالای کاربامازپین در طبقه چهارم',
    rect: { x: 57, y: 58, w: 11, h: 5.5 },
    persianKeywords: ['نورتریپتیلین', 'آمی تریپتیلین', 'آمی‌تریپتیلین', 'ایمی پرامین', 'ایمی‌پرامین', 'کلومیپرامین'],
    englishKeywords: ['nortriptyline', 'amitriptyline', 'imipramine', 'clomipramine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-fluoxetine',
    shelfPhotoId: 2,
    drugTitle: 'کپسول فلوکستین ۱۰ و ۲۰ (پروزاک)',
    rowLabel: 'طبقه ۵ — سمت چپ',
    boxVisualCue: 'جعبه سفید ایستاده «فلوکستین ۲۰» در منتهی‌الیه چپ طبقه پنجم',
    rect: { x: 15, y: 69, w: 8.5, h: 9 },
    persianKeywords: ['فلوکستین', 'پروزاک'],
    englishKeywords: ['fluoxetine', 'prozac'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-piracetam',
    shelfPhotoId: 2,
    drugTitle: 'قرص پیراستام ۸۰۰ (Piracetam 800)',
    rowLabel: 'طبقه ۵ — وسط',
    boxVisualCue: 'جعبه سفید-سبز «Piracetam 800» کنار زولوفت در طبقه پنجم',
    rect: { x: 47, y: 68, w: 10, h: 7.5 },
    persianKeywords: ['پیراستام', 'نوتروپیل'],
    englishKeywords: ['piracetam', 'nootropil'],
    isSignatureBrand: true,
  },
  {
    id: 'sh2-gabapentin',
    shelfPhotoId: 2,
    drugTitle: 'کپسول گاباپنتین ۱۰۰ و ۳۰۰ (گاباپنتین - رازک ۱۰۰ / نورونتین)',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — وسط و راست',
    boxVisualCue: 'جعبه‌های بزرگ سفید-طلایی «گاباپنتین - رازک ۱۰۰» در طبقه آخر',
    rect: { x: 33, y: 82, w: 31, h: 15 },
    persianKeywords: ['گاباپنتین', 'نورونتین', 'گاباپنتین رازک'],
    englishKeywords: ['gabapentin', 'neurontin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh6-clonazepam',
    shelfPhotoId: 6,
    drugTitle: 'قرص کلونازپام ۱ و ۲ / دیازپام / زولپیدم / بوسپیرون',
    rowLabel: 'طبقه ۳ وسط-راست (کلونازپام ۲) و طبقه ۱ (دیازپام و زولپیدم)',
    boxVisualCue: 'جعبه سفید-آبی «کلونازپام ۲» در طبقه سوم قفسه داروهای آرام‌بخش',
    rect: { x: 55, y: 52, w: 9, h: 5 },
    persianKeywords: ['کلونازپام', 'دیازپام', 'زولپیدم', 'بوسپیرون', 'بوسپیراکس', 'لووتیراستام', 'اپیتام', 'توپیرامات'],
    englishKeywords: ['clonazepam', 'diazepam', 'zolpidem', 'buspirone', 'levetiracetam', 'topiramate'],
    isSignatureBrand: true,
  },

  // ================= SHELF 3: CARDIAC & DIABETES (داروهای قلبی و دیابت) =================
  {
    id: 'sh3-nitrogel',
    shelfPhotoId: 3,
    drugTitle: 'کپسول نیتروژل ۰/۴ و قرص نیتروکانتین ۲/۶ (سوستاک ۶/۴)',
    rowLabel: 'طبقه ۱ سمت چپ (نیتروژل) و طبقه ۲ چپ (سوستاک ۶/۴)',
    boxVisualCue: 'جعبه صورتی-قرمز «نیتروژل ۰/۴» در طبقه اول چپ و «سوستاک ۶/۴» در طبقه دوم',
    rect: { x: 22, y: 14, w: 12, h: 8 },
    persianKeywords: ['نیتروژل', 'نیتروگلیسرین', 'نیتروکانتین', 'سوستاک', 'نیتروکاردین', 'ایزوسورباید'],
    englishKeywords: ['nitrogel', 'nitroglycerin', 'nitrocontin', 'sustac', 'isosorbide'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-valsomix',
    shelfPhotoId: 3,
    drugTitle: 'قرص والزومیکس ۵/۸۰ و ۵/۱۶۰ (آملودیپین + والسارتان / اکسفورج)',
    rowLabel: 'طبقه ۱ (بالا) — وسط-چپ',
    boxVisualCue: 'جعبه سفید بزرگ با نماد قلب «والزومیکس ۵/۸۰» در طبقه اول',
    rect: { x: 33, y: 17, w: 16, h: 6 },
    persianKeywords: ['والزومیکس', 'والسومیکس', 'اکسفورج', 'والسارتان آملودیپین'],
    englishKeywords: ['valsomix', 'exforge', 'valsodek'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-advan',
    shelfPhotoId: 3,
    drugTitle: 'قرص آدوان ۸۰ و ۱۶۰ (والسارتان ۸۰ / دیووان)',
    rowLabel: 'طبقه ۱ (بالا) — کنار والزومیکس',
    boxVisualCue: 'جعبه سفید-بنفش «آدوان ۸۰» در طبقه اول',
    rect: { x: 49, y: 17, w: 11, h: 6 },
    persianKeywords: ['آدوان', 'والسارتان', 'دیووان', 'ولبان'],
    englishKeywords: ['advan', 'valsartan', 'diovan'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-spironolactone',
    shelfPhotoId: 3,
    drugTitle: 'قرص اسپیداکتون ۲۵ و ۱۰۰ (اسپیرونولاکتون / آلداکتون)',
    rowLabel: 'طبقه ۱ (بالا) — سمت راست',
    boxVisualCue: 'جعبه سفید-قرمز «اسپیداکتون ۱۰۰» در منتهی‌الیه راست طبقه اول',
    rect: { x: 60, y: 17, w: 13, h: 6 },
    persianKeywords: ['اسپیرونولاکتون', 'اسپیداکتون', 'آلداکتون'],
    englishKeywords: ['spironolactone', 'spidactone', 'aldactone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-propranolol',
    shelfPhotoId: 3,
    drugTitle: 'قرص پروپرانولول ۱۰ و ۲۰ (پرانول ۱۰ / ایندرال)',
    rowLabel: 'طبقه ۲ وسط (پروپرانولول ۲۰ عبیدی) و طبقه ۴ وسط-چپ (پرانول ۱۰ صورتی)',
    boxVisualCue: 'جعبه صورتی ایستاده «پرانول ۱۰» در طبقه ۴ و جعبه سفید «پروپرانولول ۲۰ عبیدی» در طبقه ۲',
    rect: { x: 45, y: 24, w: 12, h: 8 },
    persianKeywords: ['پروپرانولول', 'پرانول', 'ایندرال'],
    englishKeywords: ['propranolol', 'pranol', 'inderal'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-asovix',
    shelfPhotoId: 3,
    drugTitle: 'قرص آسویکس ۷۵ (کلوپیدوگرل ۷۵ / پلاویکس / اسویکس)',
    rowLabel: 'طبقه ۲ — سمت راست',
    boxVisualCue: 'جعبه سفید با کادر قرمز «آسویکس» در سمت راست طبقه دوم',
    rect: { x: 58, y: 27, w: 12, h: 5.5 },
    persianKeywords: ['آسویکس', 'اسویکس', 'کلوپیدوگرل', 'پلاویکس'],
    englishKeywords: ['asovix', 'osvix', 'clopidogrel', 'plavix'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-amlodipine',
    shelfPhotoId: 3,
    drugTitle: 'قرص آملودیپین ۵ (آملودیپین آریا ۵ / آملوپرس ۵)',
    rowLabel: 'طبقه ۳ وسط (آملودیپین آریا ۵) و طبقه ۱ بالای والزومیکس',
    boxVisualCue: 'جعبه سفید-بنفش «آملودیپین آریا ۵» در وسط طبقه سوم',
    rect: { x: 40, y: 41, w: 12, h: 4.5 },
    persianKeywords: ['آملودیپین', 'آملوپرس', 'نورواسک'],
    englishKeywords: ['amlodipine', 'amlopres', 'norvasc'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-captopril',
    shelfPhotoId: 3,
    drugTitle: 'قرص کاپتوپریل ۲۵ و ۵۰ - اکسیر',
    rowLabel: 'طبقه ۳ — زیر آملودیپین',
    boxVisualCue: 'جعبه‌های آبی-سفید «کاپتوپریل ۵۰ - اکسیر» در وسط طبقه سوم',
    rect: { x: 38, y: 45, w: 22, h: 5.5 },
    persianKeywords: ['کاپتوپریل', 'انالاپریل', 'لیزینوپریل'],
    englishKeywords: ['captopril', 'enalapril', 'lisinopril'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-asa80',
    shelfPhotoId: 3,
    drugTitle: 'قرص آ.اس.آ ۸۰ (A.S.A 80 / آسپرین قلبی)',
    rowLabel: 'طبقه ۴ سمت راست (و طبقه ۳ سمت راست)',
    boxVisualCue: 'جعبه سبز-سفید با قلب قرمز «A.S.A 80» در طبقه چهارم سمت راست',
    rect: { x: 57, y: 58, w: 9, h: 6 },
    persianKeywords: ['آ اس آ', 'آ.اس.آ', 'آسپرین', 'اسپرین'],
    englishKeywords: ['asa 80', 'a.s.a', 'aspirin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-zebacor',
    shelfPhotoId: 3,
    drugTitle: 'قرص زباکر ۲/۵ و ۵ (بیزوپرولول / کنکور)',
    rowLabel: 'طبقه ۴ — سمت چپ',
    boxVisualCue: 'جعبه سفید-سبز «زباکر ۲/۵» در سمت چپ طبقه چهارم',
    rect: { x: 23, y: 53, w: 12, h: 8 },
    persianKeywords: ['زباکر', 'بیزوپرولول', 'کنکور'],
    englishKeywords: ['zebacor', 'bisoprolol', 'concor'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-losartan',
    shelfPhotoId: 3,
    drugTitle: 'قرص لوزار ۲۵ و ۵۰ (لوزارتان / پوزارکس)',
    rowLabel: 'طبقه ۴ — زیر زباکر ۲/۵',
    boxVisualCue: 'جعبه سفید-آبی «لوزار ۲۵» در طبقه چهارم سمت چپ',
    rect: { x: 25, y: 58, w: 10, h: 4.5 },
    persianKeywords: ['لوزارتان', 'لوزار', 'پوزارکس'],
    englishKeywords: ['losartan', 'losar', 'pozarex'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-pantoss',
    shelfPhotoId: 3,
    drugTitle: 'قرص پنتوس ۴۰ (Pantoss 40 - پنتوپرازول ۴۰)',
    rowLabel: 'طبقه ۴ — وسط-راست کنار آسپرین ۸۰',
    boxVisualCue: 'جعبه سفید-سبز «پنتوس ۴۰» دقیقاً در طبقه چهارم کنار A.S.A 80',
    rect: { x: 46, y: 58, w: 11, h: 5.5 },
    persianKeywords: ['پنتوس'],
    englishKeywords: ['pantoss'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-zipmet',
    shelfPhotoId: 3,
    drugTitle: 'قرص زیپمت ۵۰/۵۰۰ (سیتاگلیپتین + متفورمین / جانومت)',
    rowLabel: 'طبقه ۵ (پایین‌ترین طبقه) — چپ-وسط',
    boxVisualCue: 'جعبه سفید ایستاده «زیپمت» در طبقه پنجم کنار گلوکوفاژ',
    rect: { x: 34, y: 78, w: 6, h: 7 },
    persianKeywords: ['زیپمت', 'سیتاگلیپتین', 'جانومت', 'زپتین'],
    englishKeywords: ['zipmet', 'sitagliptin', 'janumet'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-diabezid',
    shelfPhotoId: 3,
    drugTitle: 'قرص دیابزید ۸۰ (گلیکلازید ۸۰ / گلی‌بن‌کلامید ۵)',
    rowLabel: 'طبقه ۵ (پایین‌ترین طبقه) — وسط',
    boxVisualCue: 'جعبه سفید «دیابزید ۸۰» و «گلی‌بن‌کلامید» در وسط طبقه پنجم',
    rect: { x: 39, y: 70, w: 11, h: 15 },
    persianKeywords: ['دیابزید', 'گلیکلازید', 'گلی بن کلامید', 'گلی‌بن‌کلامید', 'پیوگلیتازون', 'آماريل'],
    englishKeywords: ['diabezid', 'gliclazide', 'glibenclamide', 'pioglitazone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh3-metformin',
    shelfPhotoId: 3,
    drugTitle: 'قرص متفورمین ۵۰۰ و ۱۰۰۰ (گلوکوفاژ)',
    rowLabel: 'طبقه ۵ (پایین‌ترین طبقه) — سمت راست و چپ',
    boxVisualCue: 'جعبه بزرگ سفید-قرمز «متفورمین ۵۰۰» در سمت راست طبقه آخر (و گلوکوفاژ ۱۰۰۰ در سمت چپ)',
    rect: { x: 55, y: 80, w: 11, h: 10 },
    persianKeywords: ['متفورمین', 'گلوکوفاژ'],
    englishKeywords: ['metformin', 'glucophage'],
    isSignatureBrand: true,
  },

  // ================= SHELF 4: GI (داروهای گوارشی) =================
  {
    id: 'sh4-hyotex',
    shelfPhotoId: 4,
    drugTitle: 'قرص هیوتکس ۱۰ (هیوسین ۱۰mg)',
    rowLabel: 'طبقه ۱ (بالا) — سمت چپ',
    boxVisualCue: 'دو جعبه سفید-نارنجی «هیوتکس ۱۰» در سمت چپ طبقه اول',
    rect: { x: 23, y: 17, w: 17, h: 7 },
    persianKeywords: ['هیوتکس', 'قرص هیوسین', 'هیوسین'],
    englishKeywords: ['hyotex', 'tab hyoscine', 'hyoscine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-dimex',
    shelfPhotoId: 4,
    drugTitle: 'قرص جویدنی دی‌مکس ۱۲۵ و ۱۸۰ (دایمتیکون)',
    rowLabel: 'طبقه ۱ (بالا) — وسط (و دایمتیکون ۴۰ در طبقه ۶)',
    boxVisualCue: 'دو جعبه آبی بزرگ «دی‌مکس ۱۲۵ و ۱۸۰» در طبقه اول گوارشی',
    rect: { x: 40, y: 16, w: 24, h: 8 },
    persianKeywords: ['دایمتیکون', 'دی مکس', 'دی‌مکس', 'سایمتیکون'],
    englishKeywords: ['dimethicone', 'dimex', 'simethicone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-nolpaza',
    shelfPhotoId: 4,
    drugTitle: 'قرص نولپازا ۲۰ و پنتومید ۴۰ (پنتوپرازول ۲۰ و ۴۰)',
    rowLabel: 'طبقه ۲ — سمت چپ (نولپازا ۲۰ نارنجی و پنتومید ۴۰ سفید)',
    boxVisualCue: 'جعبه بزرگ نارنجی-سفید «نولپازا ۲۰» و کنار آن «پنتومید ۴۰» در طبقه دوم (و پنتوپرازول ۴۰ در طبقه ۴)',
    rect: { x: 24, y: 30, w: 23, h: 9.5 },
    persianKeywords: ['نولپازا', 'پنتومید', 'پنتوپرازول', 'پنتازول'],
    englishKeywords: ['nolpaza', 'pantomid', 'pantoprazole'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-colofac',
    shelfPhotoId: 4,
    drugTitle: 'قرص کلوفک ۱۳۵ / کولوفین ۱۳۵ (مبورین ۱۳۵ و ۲۰۰)',
    rowLabel: 'طبقه ۳ وسط (Colofac خارجی) و طبقه ۲ وسط-راست (کولوفین ۱۳۵)',
    boxVisualCue: 'جعبه سفید-زرد «Colofac 135» در وسط طبقه سوم و «کولوفین ۱۳۵» در طبقه دوم',
    rect: { x: 49, y: 46, w: 11, h: 7.5 },
    persianKeywords: ['کلوفک', 'کولوفین', 'کولومب', 'مبورین', 'مبوورین'],
    englishKeywords: ['colofac', 'colofin', 'mebeverine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-famotidine',
    shelfPhotoId: 4,
    drugTitle: 'قرص فاموتیدین ۲۰ و ۴۰ میلی‌گرم',
    rowLabel: 'طبقه ۳ — سمت چپ (و طبقه ۴ وسط)',
    boxVisualCue: 'جعبه‌های سفید و آبی «فاموتیدین ۲۰ و ۴۰» در سمت چپ طبقه سوم',
    rect: { x: 24, y: 45, w: 13, h: 9 },
    persianKeywords: ['فاموتیدین', 'سایمتیدین'],
    englishKeywords: ['famotidine', 'cimetidine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-clidinium',
    shelfPhotoId: 4,
    drugTitle: 'قرص کلیدینیوم-سی (Clidinium-C)',
    rowLabel: 'طبقه ۴ — سمت چپ (دو جعبه کنار هم)',
    boxVisualCue: 'دو جعبه سفید-سبز «کلیدینیوم - سی» در سمت چپ طبقه چهارم',
    rect: { x: 24, y: 63, w: 22, h: 6.5 },
    persianKeywords: ['کلیدینیوم', 'کلیدینیوم سی'],
    englishKeywords: ['clidinium', 'clidinium-c'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-omeprazole',
    shelfPhotoId: 4,
    drugTitle: 'کپسول امپرازول ۲۰ (رایزول / میرازول) و اس‌امپرازول (نکسیوم)',
    rowLabel: 'طبقه ۴ وسط-راست (رایزول و امپرازول ۲۰) و طبقه ۵ چپ (اس‌امپرازول)',
    boxVisualCue: 'جعبه‌های سفید-بنفش «امپرازول ۲۰» و «رایزول» در طبقه چهارم',
    rect: { x: 50, y: 58, w: 18, h: 9 },
    persianKeywords: ['امپرازول', 'رایزول', 'میرازول', 'اس امپرازول', 'اس‌امپرازول', 'نکسیوم', 'لنسوپرازول'],
    englishKeywords: ['omeprazole', 'risole', 'esomeprazole', 'nexium', 'lansoprazole'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-domperidone',
    shelfPhotoId: 4,
    drugTitle: 'قرص دومپریدون ۱۰ (موتیلیوم) و متوکلوپرامید ۱۰ (پلازیل)',
    rowLabel: 'طبقه ۴ سمت راست (دومپریدون آبی) و طبقه ۲ وسط-راست (متوکلوپرامید)',
    boxVisualCue: 'جعبه آبی-سفید «دومپریدون» در منتهی‌الیه راست طبقه چهارم',
    rect: { x: 69, y: 63, w: 11, h: 4.5 },
    persianKeywords: ['دومپریدون', 'موتیلیوم', 'قرص متوکلوپرامید', 'متوکلوپرامید'],
    englishKeywords: ['domperidone', 'motilium', 'tab metoclopramide', 'metoclopramide'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-demitron',
    shelfPhotoId: 4,
    drugTitle: 'قرص دمیترون ۴ (اندانسترون ۴mg)',
    rowLabel: 'طبقه ۵ — سمت چپ',
    boxVisualCue: 'جعبه سبز-نارنجی «دمیترون ۴» در سمت چپ طبقه پنجم',
    rect: { x: 25, y: 75, w: 10, h: 9.5 },
    persianKeywords: ['دمیترون', 'اندانسترون', 'قرص اندانسترون'],
    englishKeywords: ['demitron', 'ondansetron', 'tab ondansetron'],
    isSignatureBrand: true,
  },
  {
    id: 'sh4-sulfasalazine',
    shelfPhotoId: 4,
    drugTitle: 'قرص سولفاسالازین ۵۰۰ / مزالازین / بیزاکودیل / لوپرامید',
    rowLabel: 'طبقه ۵ — وسط و راست',
    boxVisualCue: 'جعبه زرد-سفید بزرگ «سولفاسالازین ۵۰۰» و کنار آن «لوپرامید و بیزاکودیل» در طبقه پنجم',
    rect: { x: 55, y: 68, w: 24, h: 12 },
    persianKeywords: ['سولفاسالازین', 'مزالازین', 'آزاکول', 'لوپرامید', 'دیفنوکسیلات', 'بیزاکودیل', 'پانکراتین', 'آلومینیوم ام جی', 'سوکرالفیت'],
    englishKeywords: ['sulfasalazine', 'mesalazine', 'loperamide', 'diphenoxylate', 'bisacodyl', 'pancreatin', 'sucralfate'],
    isSignatureBrand: true,
  },

  // ================= SHELF 5: OINTMENTS & CREAMS (پمادها و کرم‌ها) =================
  {
    id: 'sh5-steroid-oint',
    shelfPhotoId: 5,
    drugTitle: 'پماد فلوئوسینولون / هیدروکورتیزون ۱٪ / بتامتازون / کلوبتازول (کلوویت)',
    rowLabel: 'طبقه ۳ — چپ و وسط و راست',
    boxVisualCue: 'جعبه‌های افقی پماد «فلوئوسینولون» و «هیدروکورتیزون ۱ درصد» در سمت چپ و «بتامتازون و کلوویت» در وسط و راست طبقه سوم',
    rect: { x: 21, y: 50, w: 48, h: 12 },
    allowedForms: ['پماد / کرم / ژل'],
    persianKeywords: ['فلوئوسینولون', 'هیدروکورتیزون', 'پماد بتامتازون', 'کلوبتازول', 'کلوویت', 'مومتازون', 'اليكا'],
    englishKeywords: ['fluocinolone', 'hydrocortisone', 'oint betamethasone', 'clobetasol', 'mometasone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh5-mupirocin',
    shelfPhotoId: 5,
    drugTitle: 'پماد موپیروسین ۲٪ ناژو / تتراسایکلین / جنتامایسین / نیتروفورازون',
    rowLabel: 'طبقه ۳ — سمت راست',
    boxVisualCue: 'جعبه سفید-سبز «موپیروسین - ناژو ۲ درصد» در سمت راست طبقه سوم',
    rect: { x: 55, y: 54, w: 14, h: 8 },
    allowedForms: ['پماد / کرم / ژل'],
    persianKeywords: ['موپیروسین', 'پماد تتراسایکلین', 'پماد جنتامایسین', 'فوسیدین', 'سیلور سولفادیازین', 'نیتروفورازون'],
    englishKeywords: ['mupirocin', 'bactroban', 'oint tetracycline', 'oint gentamicin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh5-clotrimazole-urex',
    shelfPhotoId: 5,
    drugTitle: 'کرم کلوتریمازول ۱٪ / تریامسینولون ان.ان / اورکس ۲۰٪ (اوسرین اوره) / زینک اکساید',
    rowLabel: 'طبقه ۴ — از چپ به راست',
    boxVisualCue: 'جعبه‌های «کلوتریمازول» و «تریامسینولون N.N» در چپ، «Urex 20%» در وسط و «Dermopan 5%» در راست طبقه چهارم',
    rect: { x: 20, y: 64, w: 43, h: 11 },
    allowedForms: ['پماد / کرم / ژل'],
    persianKeywords: ['کلوتریمازول', 'تریامسینولون ان ان', 'ان ان', 'اوره', 'اوسرین', 'اورکس', 'درموپان', 'زینک اکساید', 'ایروکس', 'کالامین', 'آسیکلوویر', 'پماد دیکلوفناک', 'ژل دیکلوفناک', 'پیروکسیکام ژل', 'سالیسیلیک'],
    englishKeywords: ['clotrimazole', 'triamcinolone n.n', 'urex', 'eucerin', 'urea', 'dermopan', 'zinc oxide', 'acyclovir'],
    isSignatureBrand: true,
  },

  // ================= SHELF 7: FOREIGN BRANDS (داروهای خارجی طلایی!) =================
  {
    id: 'sh7-betaserc',
    shelfPhotoId: 7,
    drugTitle: 'قرص بتاسرک ۸ و ۱۶ (Betaserc 8 - بتاهیستین خارجی Abbott)',
    rowLabel: 'طبقه ۱ (بالا) — دومین و سومین جعبه از چپ',
    boxVisualCue: 'دو جعبه سفید با نوشته آبی «Betaserc 8» کنار لووکارویت در طبقه اول',
    rect: { x: 31, y: 29, w: 17, h: 8 },
    persianKeywords: ['بتاسرک', 'بتاهیستین خارجی'],
    englishKeywords: ['betaserc'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-levocarvit',
    shelfPhotoId: 7,
    drugTitle: 'محلول/قرص لووکارویت (ال-کارنیتین) / مادوپار / وارفارین / تریپل فلکس',
    rowLabel: 'طبقه ۱ (بالا) — چپ و راست',
    boxVisualCue: 'جعبه آبی-سفید «Levocarvit» در چپ، «Madopar» در وسط، «Warfarin» زرد و «Triple Flex» در راست طبقه اول',
    rect: { x: 21, y: 26, w: 11, h: 10 },
    persianKeywords: ['لووکارویت', 'کارنیتین', 'ال کارنیتین', 'مادوپار', 'لوودوپا', 'وارفارین', 'تریپل فلکس', 'گلوکزآمین'],
    englishKeywords: ['levocarvit', 'carnitine', 'madopar', 'levodopa', 'warfarin', 'triple flex', 'glucosamine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-metohexal',
    shelfPhotoId: 7,
    drugTitle: 'قرص متوهگزال ۴۷/۵ و ۲۳/۷۵ (MetoHEXAL Succ 47.5mg - متوپرولول)',
    rowLabel: 'طبقه ۲ — سمت چپ (پشت پیاسکلدین ۳۰۰)',
    boxVisualCue: 'دو جعبه سفید با نوار سرمه‌ای «MetoHEXAL Succ 47.5 mg» در سمت چپ طبقه دوم',
    rect: { x: 23, y: 40, w: 12, h: 10 },
    persianKeywords: ['متوهگزال', 'متورال', 'متوپرولول', 'امپرول'],
    englishKeywords: ['metohexal', '47.5', '23.75', 'metoral', 'metoprolol', 'emprol'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-piascledine',
    shelfPhotoId: 7,
    drugTitle: 'کپسول پیاسکلدین ۳۰۰ (Piascledine 300) و آرتروسن ۳۰۰',
    rowLabel: 'طبقه ۲ — جلوی متوهگزال سمت چپ',
    boxVisualCue: 'جعبه سفید-بنفش معروف «PIASCLEDINE 300» و کنار آن «آرتروسن ۳۰۰» در طبقه دوم',
    rect: { x: 27, y: 44, w: 16, h: 7 },
    persianKeywords: ['پیاسکلدین', 'آرتروسن', 'آووکادو'],
    englishKeywords: ['piascledine', 'arthrocen'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-zoloft',
    shelfPhotoId: 7,
    drugTitle: 'قرص زولوفت ۵۰ و ۱۰۰ (Zoloft 50mg - سرترالین خارجی)',
    rowLabel: 'طبقه ۲ — وسط کنار سیردالود',
    boxVisualCue: 'جعبه سفید-آبی ایستاده «Zoloft 50mg» در وسط طبقه دوم',
    rect: { x: 44, y: 42, w: 6.5, h: 8.5 },
    persianKeywords: ['زولوفت'],
    englishKeywords: ['zoloft'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-sirdalud',
    shelfPhotoId: 7,
    drugTitle: 'قرص سیردالود ۴ میلی‌گرم (Sirdalud 4mg - تیزانیدین خارجی)',
    rowLabel: 'طبقه ۲ — وسط-راست کنار زولوفت',
    boxVisualCue: 'دو جعبه سفید روی هم «سیردالود ۴ میلی‌گرم» در طبقه دوم',
    rect: { x: 50, y: 43, w: 10, h: 8 },
    persianKeywords: ['سیردالود'],
    englishKeywords: ['sirdalud'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-asentra',
    shelfPhotoId: 7,
    drugTitle: 'قرص آسنترا ۵۰ و ۱۰۰ (Asentra 50 - سرترالین)',
    rowLabel: 'طبقه ۳ — وسط-چپ (سه جعبه روی هم)',
    boxVisualCue: 'سه جعبه سفید با مربع خاکستری «آسنترا ۵۰» چیده‌شده روی هم در طبقه سوم',
    rect: { x: 32, y: 52, w: 11, h: 11 },
    persianKeywords: ['آسنترا', 'سرترالین'],
    englishKeywords: ['asentra', 'sertraline'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-tamsulosin',
    shelfPhotoId: 7,
    drugTitle: 'کپسول تامسولوسین هگزال ۰/۴ (اومنیک / Tamsulosin 0.4)',
    rowLabel: 'طبقه ۳ — وسط',
    boxVisualCue: 'جعبه سفید-آبی «تامسولوسین هگزال ۰/۴ میلی‌گرم» در وسط طبقه سوم',
    rect: { x: 45, y: 58, w: 11, h: 6 },
    persianKeywords: ['تامسولوسین', 'اومنیک', 'مکسولوسین'],
    englishKeywords: ['tamsulosin', 'omnic', '0.4'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-roaccutane-cobix',
    shelfPhotoId: 7,
    drugTitle: 'کپسول رواکوتان ۲۰ (ایزوترتینوئین) و کوبیکس ۱۰۰ (سلکوکسیب)',
    rowLabel: 'طبقه ۳ — سمت راست',
    boxVisualCue: 'جعبه سفید با نوار صورتی «رواکوتان» و جلوی آن جعبه سبز-سفید «کوبیکس ۱۰۰» در طبقه سوم',
    rect: { x: 56, y: 55, w: 17, h: 10 },
    persianKeywords: ['رواکوتان', 'آکوتان', 'ایزوترتینوئین', 'نئوتیگازون', 'کوبیکس'],
    englishKeywords: ['roaccutane', 'accutane', 'isotretinoin', 'cobix'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-zaditen-lanoxin',
    shelfPhotoId: 7,
    drugTitle: 'قرص زادیتن (کتوتیفن خارجی) / لانوکسین ۰/۲۵ (دیگوکسین) / سلبرکس ۱۰۰',
    rowLabel: 'طبقه ۴ — از چپ به راست',
    boxVisualCue: 'جعبه سفید «زادیتن»، جعبه آبی «Lanoxin»، جعبه نارنجی «رانوور ۱۵۰» و «CELEBREX 100mg» در طبقه چهارم',
    rect: { x: 29, y: 69, w: 42, h: 8.5 },
    persianKeywords: ['زادیتن', 'کتوتیفن', 'لانوکسین', 'دیگوکسین', 'سلبرکس', 'رانوور'],
    englishKeywords: ['zaditen', 'ketotifen', 'lanoxin', 'digoxin', 'celebrex'],
    isSignatureBrand: true,
  },
  {
    id: 'sh7-tegretol-rowatinex',
    shelfPhotoId: 7,
    drugTitle: 'قرص تگرتول ۲۰۰/۴۰۰ (کاربامازپین) و کپسول رواتینکس و پریناتال',
    rowLabel: 'طبقه ۵ (پایین‌ترین طبقه) — چپ تا راست',
    boxVisualCue: 'جعبه زرد «Prenatal» در چپ، «رواتینکس» در وسط و دو جعبه زرد «تگرتول ۲۰۰» در راست طبقه پنجم',
    rect: { x: 41, y: 80, w: 29, h: 10 },
    persianKeywords: ['تگرتول', 'رواتینکس', 'پریناتال'],
    englishKeywords: ['tegretol', 'rowatinex', 'prenatal'],
    isSignatureBrand: true,
  },

  // ================= SHELF 8: ANALGESICS / NSAIDS (داروهای مسکن) =================
  {
    id: 'sh8-gelofen',
    shelfPhotoId: 8,
    drugTitle: 'کپسول ژلوفن ۲۰۰ و ۴۰۰ / ادویفن ۴۰۰ (ایبوپروفن)',
    rowLabel: 'طبقه ۱ (بالا) چپ تا راست و طبقه ۵ سمت چپ',
    boxVisualCue: 'جعبه سفید-سبز «GELOFEN 200»، جعبه بزرگ سفید با حرف A قرمز «ادویفن ۴۰۰» و جعبه صورتی «ژلوفن»',
    rect: { x: 32, y: 12, w: 24, h: 8.5 },
    persianKeywords: ['ژلوفن', 'ادویفن', 'ایبوپروفن', 'بروفن'],
    englishKeywords: ['gelofen', 'advifen', 'ibuprofen', 'brufen'],
    isSignatureBrand: true,
  },
  {
    id: 'sh8-celecoxib-mefenamic',
    shelfPhotoId: 8,
    drugTitle: 'کپسول سلکسیب ۱۰۰ و ۲۰۰ (سلکوکسیب) و مفنامیک اسید ۲۵۰',
    rowLabel: 'طبقه ۲ وسط (و طبقه ۶ سمت راست)',
    boxVisualCue: 'جعبه سفید-سبز «سلکسیب ۱۰۰» و کنار آن جعبه سفید-آبی «مفنامیک اسید ۲۵۰» در طبقه دوم',
    rect: { x: 39, y: 27, w: 24, h: 10 },
    persianKeywords: ['سلکسیب', 'سلکوکسیب', 'مفنامیک اسید', 'مفنامیک'],
    englishKeywords: ['celecoxib', 'celxib', 'mefenamic'],
    isSignatureBrand: true,
  },
  {
    id: 'sh8-naproxen-tizanidine',
    shelfPhotoId: 8,
    drugTitle: 'قرص ناپروکسن ۲۵۰ و ۵۰۰ و قرص تیزانیدین ۴',
    rowLabel: 'طبقه ۳ سمت چپ (تیزانیدین و ناپروکسن ۲۵۰) و طبقه ۱ چپ (ناپروکسن ۵۰۰)',
    boxVisualCue: 'جعبه سفید-زرد «تیزانیدین» و کنار آن «ناپروکسن ۲۵۰» در سمت چپ طبقه سوم',
    rect: { x: 20, y: 44, w: 22, h: 7 },
    persianKeywords: ['ناپروکسن', 'تیزانیدین'],
    englishKeywords: ['naproxen', 'tizanidine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh8-acetaminophen',
    shelfPhotoId: 8,
    drugTitle: 'قرص استامینوفن ۵۰۰ و ۳۲۵ / رهامون / آ.ث.آ',
    rowLabel: 'طبقه ۳ وسط و راست',
    boxVisualCue: 'جعبه سفید و زرشکی «استامینوفن ۵۰۰ و ۳۲۵» در وسط طبقه ۳ و جعبه سرمه‌ای «رهامون» در سمت راست',
    rect: { x: 41, y: 39, w: 38, h: 15 },
    persianKeywords: ['قرص استامینوفن', 'استامینوفن ۵۰۰', 'استامینوفن ۳۲۵', 'رهامون', 'آ.ث.آ'],
    englishKeywords: ['tab acetaminophen', 'acetaminophen 500', 'acetaminophen 325', 'rahamon'],
    isSignatureBrand: true,
  },
  {
    id: 'sh8-baclofen-novafen-meloxicam',
    shelfPhotoId: 8,
    drugTitle: 'قرص باکلوفن ۱۰ و ۲۵ / کپسول نوافن / قرص ملوکسیکام ۷/۵ و ۱۵ (موبیکس) / استامینوفن کدئین',
    rowLabel: 'طبقه ۴ — از چپ به راست',
    boxVisualCue: 'در طبقه چهارم از چپ: «باکلوفن ۱۰ و ۲۵»، «نوافن»، «ملوکسیکام (موبیکس)» و در راست جعبه قرمز «استامینوفن کدئین»',
    rect: { x: 20, y: 52, w: 58, h: 17 },
    persianKeywords: ['باکلوفن', 'نوافن', 'ملوکسیکام', 'موبیکس', 'استامینوفن کدئین', 'کدئین'],
    englishKeywords: ['baclofen', 'novafen', 'meloxicam', 'mobix', 'acetaminophen codeine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh8-voltadek-diclofenac-indomethacin',
    shelfPhotoId: 8,
    drugTitle: 'قرص و کپسول دیکلوفناک ۱۰۰ (ولتادک ۱۰۰) / ایندومتاسین ۲۵ / پیروکسیکام / ترامادول',
    rowLabel: 'طبقه ۵ و طبقه ۶ (پایین)',
    boxVisualCue: 'جعبه سفید-بنفش «ولتادک ۱۰۰» در طبقه ۵ و «دیکلوفناک ۲۵ و ایندومتاسین ۲۵» در طبقه ۶ سمت چپ',
    rect: { x: 18, y: 71, w: 45, h: 22 },
    persianKeywords: ['ولتادک', 'قرص دیکلوفناک', 'کپسول دیکلوفناک', 'دیکلوفناک', 'ایندومتاسین', 'پیروکسیکام', 'ترامادول'],
    englishKeywords: ['voltadek', 'tab diclofenac', 'cap diclofenac', 'indomethacin', 'piroxicam', 'tramadol'],
    isSignatureBrand: true,
  },

  // ================= SHELF 9: SUPPOSITORIES & INSULINS (شیاف‌ها و انسولین‌ها) =================
  {
    id: 'sh9-insulins',
    shelfPhotoId: 9,
    drugTitle: 'قلم‌های انسولین (Levemir / Lantus SoloStar / NovoMix 30 / NovoRapid)',
    rowLabel: 'بالای سقف قفسه شیاف‌ها — از چپ به راست',
    boxVisualCue: 'سه جعبه ایستاده بالای قفسه: «Levemir FlexPen» سبز، «Lantus SoloStar» سفید و «NovoMix 30»',
    rect: { x: 29, y: 0, w: 34, h: 14 },
    persianKeywords: ['انسولین', 'لانتوس', 'لومیر', 'نووراپید', 'نوومیکس', 'رگولار', 'ان پی اچ'],
    englishKeywords: ['insulin', 'lantus', 'levemir', 'novorapid', 'novomix'],
    isSignatureBrand: true,
  },
  {
    id: 'sh9-suppositories',
    shelfPhotoId: 9,
    drugTitle: 'انواع شیاف (دیکلوفناک ۵۰ و ۱۰۰، استامینوفن ۱۲۵ و ۳۲۵، بیزاکودیل، آنتی‌هموروئید، سیکلوژست)',
    rowLabel: 'طبقات ۱ تا ۵ داخل قفسه شیاف‌ها',
    boxVisualCue: 'طبقه ۱ و ۲: شیاف دیکلوفناک و بیزاکودیل و آنتی‌هموروئید | طبقه ۴: شیاف استامینوفن (فرنیژست)',
    rect: { x: 30, y: 15, w: 38, h: 52 },
    allowedForms: ['شیاف / پودر / متفرقه'],
    persianKeywords: ['شیاف', 'شیاف دیکلوفناک', 'شیاف استامینوفن', 'فرنیژست', 'شیاف بیزاکودیل', 'آنتی هموروئید', 'سیکلوژست', 'شیاف گلیسیرین', 'شیاف ایندومتاسین'],
    englishKeywords: ['supp', 'suppository', 'ferdigest', 'cyclogest'],
    isSignatureBrand: true,
  },

  // ================= SHELF 10: OB/GYN & HORMONAL (داروهای زنان) =================
  {
    id: 'sh10-nystatin-vag',
    shelfPhotoId: 10,
    drugTitle: 'قرص واژینال نیستاتین / متیل‌ارگونوین / مژسترول / دانازول / HD',
    rowLabel: 'طبقه ۱ و طبقه ۲ قفسه داروهای زنان',
    boxVisualCue: 'جعبه سفید-بنفش «نیستاتین» در طبقه ۲ چپ و «متیل ارگونوین» در وسط طبقه ۲',
    rect: { x: 19, y: 29, w: 40, h: 9 },
    persianKeywords: ['نیستاتین', 'متیل ارگونوین', 'مژسترول', 'دانازول', 'اچ دی'],
    englishKeywords: ['nystatin', 'methylergonovine', 'megestrol', 'danazol'],
    isSignatureBrand: true,
  },
  {
    id: 'sh10-transid-letrozole-ld',
    shelfPhotoId: 10,
    drugTitle: 'کپسول ترنسید ۲۵۰ (ترانگزامیک اسید) / لتروفم (لتروزول) / اوومید (کلومیفن) / قرص LD و مدروکسی‌پروژسترون',
    rowLabel: 'طبقه ۳ — از چپ به راست',
    boxVisualCue: 'در طبقه سوم از چپ: «مدروکسی‌پروژسترون»، «لتروفم»، «اوومید ۵۰ و اوسیت ال‌دی» و در سمت راست دو جعبه بزرگ سفید-آبی «ترنسید ۲۵۰»',
    rect: { x: 18, y: 39, w: 54, h: 14 },
    persianKeywords: ['ترنسید', 'ترانگزامیک', 'ترانگزامیک اسید', 'لتروزول', 'لتروفم', 'کلومیفن', 'اوومید', 'ال دی', 'اوسیت', 'مدروکسی', 'مدروکسی پروژسترون'],
    englishKeywords: ['transid', 'tranexamic', 'letrozole', 'letrofem', 'clomiphene', 'ovomid', 'medroxyprogesterone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh10-duphaston-cyproterone',
    shelfPhotoId: 10,
    drugTitle: 'قرص دوفاستون ۱۰ (Duphaston - دیدروژسترون) / سیپروترون کامپاند / دزوسپتیو / استرومارین',
    rowLabel: 'طبقه ۵ (و طبقه ۴ استرومارین)',
    boxVisualCue: 'دو جعبه سفید-زرد «Duphaston 10» در سمت چپ طبقه پنجم و کنار آن «تری‌فازیک، سیپروترون کامپاند و دزوسپتیو»',
    rect: { x: 18, y: 66, w: 51, h: 11 },
    persianKeywords: ['دوفاستون', 'دیدروژسترون', 'سیپروترون', 'دزوسپتیو', 'مارولون', 'روکین', 'یاسمین', 'استرومارین', 'استروژن', 'لاینسترول'],
    englishKeywords: ['duphaston', 'dydrogesterone', 'cyproterone', 'desoceptive', 'estromarin', 'conjugated estrogens'],
    isSignatureBrand: true,
  },
  {
    id: 'sh10-levothyroxine-cabergoline-fluconazole',
    shelfPhotoId: 10,
    drugTitle: 'قرص لووکسین ۰/۱ (لووتیروکسین) / کابرگولین / تاموکسیفن / کپسول فلوکونازول ۱۵۰',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — چپ تا راست',
    boxVisualCue: 'جعبه‌های آبی-سفید «لووکسین» در چپ، «تاموکسیفن» در وسط، «کابرگولین» و جعبه صورتی «فلوکونازول ۱۵۰» در راست طبقه ششم',
    rect: { x: 27, y: 80, w: 41, h: 12 },
    persianKeywords: ['لووکسین', 'لووتیروکسین', 'کابرگولین', 'داستینکس', 'تاموکسیفن', 'لونژیل', 'لوونورژسترل'],
    englishKeywords: ['levoxin', 'levothyroxine', 'cabergoline', 'dostinex', 'tamoxifen', 'levonorgestrel'],
    isSignatureBrand: true,
  },

  // ================= SHELF 11: POWDERS, EYE DROPS, CORTICOSTEROIDS, STATINS =================
  {
    id: 'sh11-ors-pidrolax',
    shelfPhotoId: 11,
    drugTitle: 'پودر پیدرولاکس (PEG) / پودر ORS / قرص آلبندازول و مبندازول / پرمترین',
    rowLabel: 'طبقات ۱ تا ۳ قفسه پودرها و داروهای انگلی',
    boxVisualCue: 'طبقه ۱: پودر ORS و سوربیتول | طبقه ۳: قرص آلبندازول، مبندازول و قوطی آبی-سفید پودر پیدرولاکس در سمت راست',
    rect: { x: 28, y: 18, w: 43, h: 35 },
    persianKeywords: ['پیدرولاکس', 'پلی اتیلن گلیکول', 'او آر اس', 'سوربیتول', 'آلبندازول', 'مبندازول', 'پرمترین', 'کلستیرامین'],
    englishKeywords: ['pidrolax', 'peg', 'ors', 'albendazole', 'mebendazole', 'permethrin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh11-eyedrops-fluticasone',
    shelfPhotoId: 11,
    drugTitle: 'اسپری بینی فلوتیکازون و قطره‌های چشمی/گوشی (آرتلاک، بتامتازون، سیپروفلوکساسین، کلرامفنیکل)',
    rowLabel: 'طبقه ۴ و طبقه ۵ سمت چپ (آرتلاک)',
    boxVisualCue: 'طبقه ۴: اسپری فلوتیکازون و قطره‌های چشمی | طبقه ۵ چپ: جعبه سفید بزرگ «آرتلاک (اشک مصنوعی)»',
    rect: { x: 27, y: 55, w: 44, h: 22 },
    allowedForms: ['قطره / اسپری'],
    persianKeywords: ['قطره چشمی', 'اشک مصنوعی', 'آرتلاک', 'فلوتیکازون', 'اسپری بینی', 'نفازولین', 'قطره بتامتازون', 'قطره سیپروفلوکساسین', 'کلرامفنیکل', 'تیمولول', 'لاتانوپروست', 'سالبوتامول اسپری', 'سرتاید', 'بکلومتازون'],
    englishKeywords: ['artelac', 'eye drop', 'ophthalmic', 'fluticasone', 'nasal spray', 'salbutamol spray', 'seretide'],
    isSignatureBrand: true,
  },
  {
    id: 'sh11-prednisolone',
    shelfPhotoId: 11,
    drugTitle: 'قرص پردنیزولون ۵ و ۵۰ میلی‌گرم (کورتون خوراکی)',
    rowLabel: 'طبقه ۵ — وسط',
    boxVisualCue: 'جعبه‌های سفید-بنفش «پردنیزولون ۵ و ۵۰» در وسط طبقه پنجم',
    rect: { x: 45, y: 65, w: 22, h: 9 },
    persianKeywords: ['پردنیزولون', 'قرص پردنیزولون'],
    englishKeywords: ['prednisolone', 'tab prednisolone'],
    isSignatureBrand: true,
  },
  {
    id: 'sh11-atorvastatin-fenofibrate',
    shelfPhotoId: 11,
    drugTitle: 'قرص آتورواستاتین ۱۰، ۲۰ و ۴۰ / رزوواستاتین / لوواستاتین / کپسول فنوفیبرات ۲۰۰',
    rowLabel: 'طبقه ۶ (پایین‌ترین طبقه) — چپ تا راست',
    boxVisualCue: 'در طبقه آخر: جعبه‌های «آتورواستاتین و لوواستاتین» در چپ و وسط و جعبه سفید «فنوفیبرات» در سمت راست',
    rect: { x: 28, y: 77, w: 43, h: 15 },
    persianKeywords: ['آتورواستاتین', 'اتورواستاتین', 'لیپیتور', 'رزوواستاتین', 'روپیکسون', 'لوواستاتین', 'سیمواستاتین', 'فنوفیبرات', 'جم فیبروزیل'],
    englishKeywords: ['atorvastatin', 'rosuvastatin', 'ropixon', 'lovastatin', 'simvastatin', 'fenofibrate'],
    isSignatureBrand: true,
  },

  // ================= SHELF 12: SYRUPS & SUSPENSIONS (شربت‌ها) =================
  {
    id: 'sh12-cold-cough-syrups',
    shelfPhotoId: 12,
    drugTitle: 'شربت‌های سرفه و سرماخوردگی (پدی‌کاف، برم‌هگزین، ایبوپروفن، کوریزان، دیفن‌هیدرامین، اکسپکتورانت)',
    rowLabel: 'طبقه ۱، ۲ و ۴ قفسه شربت‌ها',
    boxVisualCue: 'طبقه ۱: پدی‌کاف، برم‌هگزین، شربت ایبوپروفن نارنجی و کوریزان زرد | طبقه ۲: شیشه‌های دیفن‌هیدرامین و اکسپکتورانت | طبقه ۴: شربت کوریزان و استامینوفن',
    rect: { x: 27, y: 25, w: 43, h: 20 },
    allowedForms: ['شربت / سوسپانسیون'],
    persianKeywords: ['شربت سرماخوردگی', 'شربت کوریزان', 'کوریزان', 'پدی کاف', 'پدی‌کاف', 'برم هگزین', 'برم‌هگزین', 'شربت ایبوپروفن', 'شربت استامینوفن', 'تایلوفن', 'پاراکید', 'دیفن هیدرامین', 'دیفن‌هیدرامین', 'اکسپکتورانت', 'پرومتازین', 'گایافنزین', 'دکسترومتورفان', 'شربت ستیریزین', 'شربت هیدروکسی زین', 'شربت کتوتیفن', 'شربت سالبوتامول', 'شربت تئوفیلین'],
    englishKeywords: ['syr corizan', 'corizan', 'pedi cough', 'bromhexine', 'syr ibuprofen', 'syr acetaminophen', 'tylophen', 'diphenhydramine', 'expectorant', 'promethazine', 'syr cetirizine', 'syr ketotifen', 'syr salbutamol'],
    isSignatureBrand: true,
  },
  {
    id: 'sh12-lactulose-kidilact',
    shelfPhotoId: 12,
    drugTitle: 'شربت لاکتولوز / ساشه و قطره کیدی‌لاکت زینک / شربت گل‌گریپ (گریپ‌میکسچر) / شربت اندانسترون و زینک',
    rowLabel: 'طبقه ۲ سمت چپ (لاکتولوز) و طبقه ۳ و ۴ (کیدی‌لاکت، گل‌گریپ، اندانسترون و زینک)',
    boxVisualCue: 'جعبه سفید بزرگ «Lactulose» در چپ طبقه ۲، «KIDILACT ZINC» و «گل‌گریپ» در چپ طبقه ۳ و «کیدی‌لاکت» در راست طبقه ۳',
    rect: { x: 21, y: 35, w: 48, h: 30 },
    allowedForms: ['شربت / سوسپانسیون', 'قطره / اسپری', 'شیاف / پودر / متفرقه'],
    persianKeywords: ['لاکتولوز', 'کیدی لاکت', 'کیدی‌لاکت', 'گل گریپ', 'گل‌گریپ', 'گریپ میکسچر', 'شربت زینک', 'زینک سولفات', 'شربت اندانسترون', 'شربت آلومینیوم', 'شربت معده', 'شربت اپیلیم'],
    englishKeywords: ['lactulose', 'kidilact', 'gripe mixture', 'gol gripe', 'syr zinc', 'syr ondansetron', 'epilim syrup'],
    isSignatureBrand: true,
  },
  {
    id: 'sh12-antibiotic-suspensions',
    shelfPhotoId: 12,
    drugTitle: 'سوسپانسیون‌های آنتی‌بیوتیک اطفال (سفیکسیم ۱۰۰ / آفاکسیم، آزیترومایسین ۲۰۰، آموکسی‌سیلین، مترونیدازول، کوتریموکسازول، سفالکسین) و قطره آهن',
    rowLabel: 'طبقه ۵ (سفیکسیم ۱۰۰، قطره آهن، آزیترومایسین) و طبقه ۲ چپ (مترونیدازول و کوتریموکسازول)',
    boxVisualCue: 'در طبقه پنجم: «آفاکسیم ۱۰۰ (سفیکسیم)» در چپ، «قطره فروس سولفات» در وسط و «آزیترومایسین و سفالکسین» در راست',
    rect: { x: 23, y: 66, w: 46, h: 11 },
    allowedForms: ['شربت / سوسپانسیون', 'قطره / اسپری'],
    persianKeywords: ['سوسپانسیون', 'شربت سفیکسیم', 'آفاکسیم', 'شربت آزیترومایسین', 'شربت آموکسی', 'شربت کوآموکسی', 'فارمنتین', 'شربت مترونیدازول', 'مترومکس', 'شربت کوتریموکسازول', 'شربت سفالکسین', 'قطره آهن', 'فروس سولفات قطره', 'قطره آ د', 'قطره مولتی'],
    englishKeywords: ['susp', 'syr cefixime', 'afaxim', 'syr azithromycin', 'syr amoxicillin', 'syr co-amoxiclav', 'syr metronidazole', 'syr cotrimoxazole', 'syr cephalexin', 'ferrous drop'],
    isSignatureBrand: true,
  },

  // ================= SHELF 13: HERBAL (داروهای گیاهی) =================
  {
    id: 'sh13-herbal-all',
    shelfPhotoId: 13,
    drugTitle: 'داروهای گیاهی (شربت تیمولی/آویشن، فیژان، لیورگل ۱۴۰، کپسول آناهیل، سی‌لاکس، پسیلیوم، سنکل، شیر افزا، روتارین، کلپرمین، پروستاتان)',
    rowLabel: 'طبقات ۱ تا ۴ قفسه داروهای گیاهی',
    boxVisualCue: 'طبقه ۱: شربت تیمولی، آویشن، فیژان، سنکل و لیورگل | طبقه ۲: کپسول آناهیل (عکس آناناس) و سی‌لاکس | طبقه ۳ و ۴: شیر افزا، روتارین، کلپرمین و پروستاتان',
    rect: { x: 11, y: 19, w: 71, h: 66 },
    persianKeywords: ['تیمولی', 'آویشن', 'برونکوباریج', 'فیژان', 'رولاکس', 'سنکل', 'لیورگل', 'آناهیل', 'بروملین', 'پسیلیوم', 'موسیلیوم', 'سی لاکس', 'سی‌لاکس', 'سنا', 'شیر افزا', 'روتارین', 'سویاگل', 'روهمورین', 'کلپرمین', 'پروستاتان', 'جینکوتیدی', 'مموورال', 'کوکنار'],
    englishKeywords: ['thymoli', 'bronchobarij', 'fijan', 'sankol', 'livergol', 'anaheal', 'c-lax', 'psyllium', 'shirafza', 'rotarin', 'colpermin', 'prostatan'],
    isSignatureBrand: true,
  },

  // ================= SHELF 14: ANTIHISTAMINES & COLD (آنتی‌هیستامین‌ها) =================
  {
    id: 'sh14-betahistine-montelukast',
    shelfPhotoId: 14,
    drugTitle: 'قرص اکتوسرک ۸ و ۱۶ (بتاهیستین) و قرص مونته‌لوکاست ۱۰ و ۵ (ایروکاست / مونتکس)',
    rowLabel: 'طبقه ۱ (اکتوسرک ۱۶، بتاهیستین ۸، مونتکس ۱۰) و طبقه ۳ (ایروکاست و اکتوسرک ۸)',
    boxVisualCue: 'طبقه ۱: جعبه سفید-آبی «اکتوسرک ۱۶» و «بتاهیستین ۸» و «مونتکس ۱۰» | طبقه ۳: جعبه سفید «ایروکاست»',
    rect: { x: 16, y: 24, w: 56, h: 10 },
    persianKeywords: ['اکتوسرک', 'بتاهیستین', 'مونته لوکاست', 'مونته‌لوکاست', 'ایروکاست', 'مونتکس'],
    englishKeywords: ['actoserc', 'betahistine', 'montelukast', 'airokast', 'montex'],
    isSignatureBrand: true,
  },
  {
    id: 'sh14-cetirizine-loratadine-hydroxyzine',
    shelfPhotoId: 14,
    drugTitle: 'قرص ستیریزین ۱۰ (آپو-ستیریزین / لتیزن ۱۰) / لوراتادین ۱۰ / هیدروکسی‌زین ۲۵ / سیپروهپتادین ۴ / کلرفنیرامین ۴',
    rowLabel: 'طبقه ۲ چپ تا راست و طبقه ۳ چپ (لتیزن ۱۰)',
    boxVisualCue: 'طبقه ۲: دو جعبه سرمه‌ای «آپو-ستیریزین»، «لوراتادین ۱۰ شفا»، «تدارین ۲۵ (هیدروکسی‌زین)» و «ستیریزین ۱۰» | طبقه ۳ چپ: «لتیزن ۱۰»',
    rect: { x: 16, y: 37, w: 53, h: 25 },
    persianKeywords: ['ستیریزین', 'ستریزین', 'آپو ستیریزین', 'لتیزن', 'لوراتادین', 'دس لوراتادین', 'نئوتادین', 'هیدروکسی زین', 'هیدروکسی‌زین', 'تدارین', 'سیپروهپتادین', 'قرص کلرفنیرامین', 'دیمن هیدرینات'],
    englishKeywords: ['cetirizine', 'letizen', 'loratadine', 'desloratadine', 'hydroxyzine', 'cyproheptadine', 'tab chlorpheniramine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh14-telfast-fexofenadine',
    shelfPhotoId: 14,
    drugTitle: 'قرص تلفست ۱۲۰ و ۱۸۰ (Telfast / فکسوفنادین ۱۸۰)',
    rowLabel: 'طبقه ۳ وسط (تلفست بنفش-نارنجی) و طبقه ۲ سمت راست (فکسوفنادین ۱۸۰)',
    boxVisualCue: 'جعبه بنفش-نارنجی بزرگ «تلفست ۱۸۰» در وسط طبقه سوم و جعبه سفید «فکسوفنادین ۱۸۰» در راست طبقه دوم',
    rect: { x: 37, y: 57, w: 13, h: 9 },
    persianKeywords: ['تلفست', 'فکسوفنادین', 'فکسوفنادين'],
    englishKeywords: ['telfast', 'fexofenadine'],
    isSignatureBrand: true,
  },
  {
    id: 'sh14-coldax-finpecia-terazosin',
    shelfPhotoId: 14,
    drugTitle: 'قرص کلداکس / گریپین / کوریزان / سرماخوردگی بزرگسالان / فین‌پشیا (فیناستراید) / ترازوسین و پرازوسین',
    rowLabel: 'طبقه ۴ (پایین‌ترین طبقه) — چپ تا راست',
    boxVisualCue: 'در طبقه چهارم: «گریپین و کوریزان» در چپ، «کلداکس» در وسط-چپ، «پرازوسین، ترازوسین و FINPECIA» در وسط و جعبه‌های آبی «سرماخوردگی بزرگسالان» در راست',
    rect: { x: 16, y: 69, w: 60, h: 17 },
    persianKeywords: ['کلداکس', 'گریپین', 'قرص سرماخوردگی', 'سرماخوردگی بزرگسالان', 'ادالت کلد', 'آلکاف', 'فین پشیا', 'فیناستراید', 'پرازوسین', 'ترازوسین'],
    englishKeywords: ['coldax', 'adult cold', 'gripin', 'finpecia', 'finasteride', 'prazosin', 'terazosin'],
    isSignatureBrand: true,
  },

  // ================= SHELF 15 & 16: VITAMINS, IRON & SUPPLEMENTS =================
  {
    id: 'sh15-fefol-ferotab-hematinic',
    shelfPhotoId: 15,
    drugTitle: 'کپسول ففول (Fefol) / فولفول / فروتب / هماتینیک / آیزن پلاس / فولیک اسید ۱ و ۵',
    rowLabel: 'طبقه ۱، ۲ و ۳ قفسه ویتامین‌ها و کم‌خونی',
    boxVisualCue: 'طبقه ۱: «FULLFOL» و «فروتب» | طبقه ۲: «Fefol» چپ و «هماتینیک و Feriron» راست | طبقه ۳: «فولیک اسید ۱ و ۵» و «Eisen plus»',
    rect: { x: 15, y: 17, w: 72, h: 52 },
    persianKeywords: ['ففول', 'فولفول', 'فروتب', 'قرص آهن', 'فروس سولفات', 'هماتینیک', 'آیزن پلاس', 'فرآیرون', 'فولیک اسید', 'اسید فولیک', 'سیدرال', 'فروگلوبین کپسول'],
    englishKeywords: ['fefol', 'fullfol', 'ferotab', 'ferrous', 'hematinic', 'eisen plus', 'folic acid', 'sideral'],
    isSignatureBrand: true,
  },
  {
    id: 'sh15-dvigel-evigel-b1',
    shelfPhotoId: 15,
    drugTitle: 'پرل ویتامین D3 ۵۰۰۰۰ (دی-ویژل / د-ویتین) / ای-ویژل ۴۰۰ (ویتامین E) / آ-ویژل / کلسیتریول / ویتامین B1 300 / قرص جوشان',
    rowLabel: 'طبقه ۳ چپ (دی-ویژل و آ-ویژل) و راست (د-ویتین) و طبقه ۴ چپ (قرص جوشان ویتامین C و کلسیم)',
    boxVisualCue: 'طبقه ۳ چپ: جعبه زرد «دی-ویژل ۵۰۰۰۰» و بنفش «آ-ویژل» | طبقه ۳ راست: «د-ویتین ۵۰۰۰۰» | طبقه ۴ چپ: لوله‌های قرص جوشان',
    rect: { x: 24, y: 54, w: 63, h: 20 },
    persianKeywords: ['دی ویژل', 'دی‌ویژل', 'د ویتین', 'د-ویتین', 'ویتامین دی', 'ویتامین d', 'پرل ویتامین', 'ای ویژل', 'ویتامین ای', 'ویتامین e', 'آ ویژل', 'کلسیتریول', 'روکالتسرول', 'ویتامین ب۱', 'ویتامین ب ۱', 'نوروبیون قرص', 'ویتامین ث', 'جوشان', 'قرص جوشان'],
    englishKeywords: ['d-vigel', 'd-vitin', 'vit d3', 'vitamin d', '50000', 'e-vigel', 'vitamin e', 'calcitriol', 'vit b1', 'effervescent', 'vit c'],
    isSignatureBrand: true,
  },
  {
    id: 'sh16-zincplus-feroglobin-calcicare',
    shelfPhotoId: 16,
    drugTitle: 'کپسول زینک پلاس (Zinc Plus) / فروگلوبین / کلسی‌کر (CalciCare) / کالمرز / امگا-۳ / هرویت / سیستین B6 / نفروویت',
    rowLabel: 'طبقه ۱ (کالمرز، کلسی‌کر، نفروویت)، طبقه ۲ (امگا-۳)، طبقه ۳ (هرویت) و طبقه ۴ (فروگلوبین و زینک پلاس)',
    boxVisualCue: 'طبقه ۱: جعبه‌های زرد و سفید «Calmerz و CalciCare» | طبقه ۴ پایین: جعبه‌های «Feroglobin» و «Zinc Plus» با تصویر چهره روی جعبه',
    rect: { x: 13, y: 70, w: 58, h: 21 },
    persianKeywords: ['زینک پلاس', 'زینک', 'فروگلوبین', 'کلسی کر', 'کلسی‌کر', 'کالمرز', 'کلسیم', 'استئوکر', 'امگا ۳', 'امگا ۳', 'هرویت', 'سیستین', 'نفروویت', 'مولتی ویتامین', 'ول من', 'ول وومن'],
    englishKeywords: ['zinc plus', 'feroglobin', 'calcicare', 'calmerz', 'calcium', 'omega-3', 'omega 3', 'hair-vit', 'cystine', 'nephrovit', 'multivitamin'],
    isSignatureBrand: true,
  },

  // ================= SHELF 17: ANTIBIOTICS (داروهای آنتی‌بیوتیک) =================
  {
    id: 'sh17-cefixime-loprax',
    shelfPhotoId: 17,
    drugTitle: 'قرص سفیکسیم ۴۰۰ و ۲۰۰ (لوپراکس ۴۰۰ / Loprax 400)',
    rowLabel: 'طبقه ۱ سمت چپ (لوپراکس ۴۰۰ و ۲۰۰) و طبقه ۳ وسط-چپ (سفیکسیم ۴۰۰)',
    boxVisualCue: 'جعبه سفید-بنفش «لوپراکس ۴۰۰ (سفیکسیم)» در طبقه ۱ چپ و جعبه‌های نقطه‌دار «سفیکسیم ۴۰۰» در طبقه ۳',
    rect: { x: 15, y: 25, w: 26, h: 6.5 },
    persianKeywords: ['سفیکسیم', 'لوپراکس', 'قرص سفیکسیم'],
    englishKeywords: ['cefixime', 'loprax', 'suprax'],
    isSignatureBrand: true,
  },
  {
    id: 'sh17-ciprofloxacin-tavanex',
    shelfPhotoId: 17,
    drugTitle: 'قرص سیپروفلوکساسین ۵۰۰ و قرص تاوانکس ۵۰۰ (لووفلوکساسین ۵۰۰)',
    rowLabel: 'طبقه ۳ وسط (سیپروفلوکساسین) و طبقه ۴ چپ-وسط (تاوانکس ۵۰۰)',
    boxVisualCue: 'جعبه سفید-سبز «تاوانکس» در طبقه ۴ و جعبه‌های «سیپروفلوکساسین ۵۰۰» در طبقات ۱، ۳ و ۴',
    rect: { x: 32, y: 73, w: 12, h: 6.5 },
    persianKeywords: ['سیپروفلوکساسین', 'سیپروفکت', 'تاوانکس', 'لووفلوکساسین', 'نیتروفورانتوئین'],
    englishKeywords: ['ciprofloxacin', 'tavanex', 'levofloxacin', 'nitrofurantoin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh17-coamoxiclav-klamoks',
    shelfPhotoId: 17,
    drugTitle: 'قرص کوآموکسی‌کلاو ۶۲۵ و ۳۷۵ (کلاموکس ۶۲۵ / فارمنتین)',
    rowLabel: 'طبقه ۳ وسط-راست (کلاموکس ۳۷۵ و ۶۲۵) و طبقه ۲ چپ و طبقه ۴ چپ',
    boxVisualCue: 'جعبه‌های سفید-بنفش چیده‌شده روی هم «کلاموکس ۶۲۵ / کو-آموکسی‌کلاو ۶۲۵» در وسط-راست طبقه سوم',
    rect: { x: 52, y: 52, w: 14, h: 16.5 },
    persianKeywords: ['کوآموکسی کلاو', 'کوآموکسی‌کلاو', 'کو آموکسی کلاو', 'کلاموکس', 'فارمنتین', 'آگمنتین'],
    englishKeywords: ['co-amoxiclav', 'co amoxiclav', 'klamoks', 'farmentin', 'augmentin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh17-azithromycin-clarithromycin',
    shelfPhotoId: 17,
    drugTitle: 'کپسول و قرص آزیترومایسین ۲۵۰ و ۵۰۰ و کلاریترومایسین ۵۰۰',
    rowLabel: 'طبقه ۲ سمت راست (آزیترومایسین ۵۰۰ و کلاریترومایسین ۵۰۰) و طبقه ۲ چپ (آزیترومایسین ۲۵۰ اکسیر)',
    boxVisualCue: 'جعبه‌های سفید در سمت راست طبقه دوم «آزیترومایسین ۵۰۰ و کلاریترومایسین ۵۰۰» و جعبه سرمه‌ای «آزیترومایسین ۲۵۰ اکسیر» در چپ',
    rect: { x: 68, y: 41, w: 13, h: 9.5 },
    persianKeywords: ['آزیترومایسین', 'ازیترومایسین', 'زیتروماکس', 'کلاریترومایسین'],
    englishKeywords: ['azithromycin', 'zithromax', 'clarithromycin'],
    isSignatureBrand: true,
  },
  {
    id: 'sh17-metronidazole',
    shelfPhotoId: 17,
    drugTitle: 'قرص مترونیدازول ۲۵۰ و ۵۰۰ میلی‌گرم',
    rowLabel: 'طبقه ۲ سمت چپ و طبقه ۳ سمت راست',
    boxVisualCue: 'دو جعبه سفید-بنفش/سبز «مترونیدازول ۲۵۰» در منتهی‌الیه چپ طبقه دوم (و در سمت راست طبقه سوم)',
    rect: { x: 15, y: 39, w: 10, h: 11 },
    persianKeywords: ['قرص مترونیدازول', 'مترونیدازول', 'فلاژیل'],
    englishKeywords: ['tab metronidazole', 'metronidazole', 'flagyl'],
    isSignatureBrand: true,
  },
  {
    id: 'sh17-amoxicillin-cephalexin-doxy',
    shelfPhotoId: 17,
    drugTitle: 'کپسول آموکسی‌سیلین ۵۰۰ (آموراکس) / سفالکسین ۵۰۰ / داکسی‌سایکلین ۱۰۰ / فلوکونازول / کوتریموکسازول',
    rowLabel: 'طبقه ۳ و طبقه ۴ (پایین)',
    boxVisualCue: 'طبقه ۴: «آموکسی‌سیلین ۵۰۰» سبز-سفید، کنار آن «داکسی‌سایکلین ۱۰۰»، بالای آن جعبه آبی-صورتی «فلوکونازول» و در راست «کوتریموکسازول»',
    rect: { x: 31, y: 74, w: 52, h: 14 },
    persianKeywords: ['آموکسی سیلین', 'آموکسی‌سیلین', 'آموراکس', 'سفالکسین', 'کلوگزاسیلین', 'آمپی سیلین', 'داکسی سایکلین', 'داکسی‌سایکلین', 'فلوکونازول', 'کوتریموکسازول', 'آسیکلوویر قرص', 'کلیندامایسین'],
    englishKeywords: ['amoxicillin', 'amorax', 'cephalexin', 'cloxacillin', 'ampicillin', 'doxycycline', 'fluconazole', 'cotrimoxazole', 'clindamycin'],
    isSignatureBrand: true,
  },
];

// Fallback Shelf Zone by Dosage Form or Clinical Category so 100% of items get a valid shelf photo & bounding box
const FALLBACK_BY_FORM: Partial<
  Record<
    DosageForm,
    { shelfPhotoId: number; rowLabel: string; boxVisualCue: string; rect: ShelfBoundingBox }
  >
> = {
  آمپول: {
    shelfPhotoId: 1,
    rowLabel: 'قفسه ۱ (آمپول‌ها) — طبقات میانی تزریقی‌ها',
    boxVisualCue: 'قفسه اختصاصی آمپول‌ها و ویال‌های تزریقی (طبقات ۱ تا ۶)',
    rect: { x: 22, y: 25, w: 56, h: 48 },
  },
  'شربت / سوسپانسیون': {
    shelfPhotoId: 12,
    rowLabel: 'قفسه ۱۲ (شربت‌ها) — طبقات میانی شربت‌ها و سوسپانسیون‌ها',
    boxVisualCue: 'قفسه اختصاصی شربت‌ها و سوسپانسیون‌های خوراکی (طبقات ۱ تا ۶)',
    rect: { x: 22, y: 35, w: 48, h: 40 },
  },
  'پماد / کرم / ژل': {
    shelfPhotoId: 5,
    rowLabel: 'قفسه ۵ — طبقات ۳ و ۴ (پمادها و کرم‌های موضعی)',
    boxVisualCue: 'ردیف پمادها و کرم‌های پوستی و موضعی در طبقات سوم و چهارم قفسه ۵',
    rect: { x: 21, y: 50, w: 48, h: 25 },
  },
  'قطره / اسپری': {
    shelfPhotoId: 11,
    rowLabel: 'قفسه ۱۱ — طبقه ۴ و ۵ (قطره‌های چشمی و اسپری‌های تنفسی/بینی)',
    boxVisualCue: 'ردیف قطره‌های چشمی و اسپری‌ها در طبقه چهارم و پنجم قفسه ۱۱',
    rect: { x: 28, y: 56, w: 42, h: 20 },
  },
  سرم: {
    shelfPhotoId: 1,
    rowLabel: 'قفسه ۱ (تزریقی‌ها و ویال‌ها)',
    boxVisualCue: 'بخش فرآورده‌های تزریقی و سرم‌ها در قفسه ۱',
    rect: { x: 22, y: 55, w: 55, h: 35 },
  },
};

const FALLBACK_BY_CATEGORY: Record<
  ClinicalCategory,
  { shelfPhotoId: number; rowLabel: string; boxVisualCue: string; rect: ShelfBoundingBox }
> = {
  'گوارش و معده': {
    shelfPhotoId: 4,
    rowLabel: 'قفسه ۴ (داروهای گوارشی) — طبقات ۲ تا ۵',
    boxVisualCue: 'قفسه اختصاصی داروهای گوارشی و معده',
    rect: { x: 24, y: 30, w: 54, h: 45 },
  },
  'اعصاب و روان': {
    shelfPhotoId: 2,
    rowLabel: 'قفسه ۲ (داروهای اعصاب) و قفسه ۶ (آرام‌بخش‌ها)',
    boxVisualCue: 'قفسه اختصاصی داروهای اعصاب و روان (طبقات ۲ تا ۵)',
    rect: { x: 18, y: 31, w: 52, h: 45 },
  },
  'قلب، فشار خون و دیابت': {
    shelfPhotoId: 3,
    rowLabel: 'قفسه ۳ (داروهای قلبی و دیابت) — طبقات ۱ تا ۵',
    boxVisualCue: 'قفسه اختصاصی داروهای قلب، فشار خون و قند خون',
    rect: { x: 22, y: 16, w: 50, h: 68 },
  },
  'آنتی‌بیوتیک و عفونی': {
    shelfPhotoId: 17,
    rowLabel: 'قفسه ۱۷ (داروهای آنتی‌بیوتیک) — طبقات ۱ تا ۴',
    boxVisualCue: 'قفسه اختصاصی قرص‌ها و کپسول‌های آنتی‌بیوتیک',
    rect: { x: 15, y: 25, w: 66, h: 58 },
  },
  'مسکن، التهاب و مفاصل': {
    shelfPhotoId: 8,
    rowLabel: 'قفسه ۸ (داروهای مسکن و ضدالتهاب) — طبقات ۱ تا ۶',
    boxVisualCue: 'قفسه اختصاصی مسکن‌ها و ضدالتهاب‌ها',
    rect: { x: 20, y: 27, w: 56, h: 55 },
  },
  'تنفسی، سرماخوردگی و آلرژی': {
    shelfPhotoId: 14,
    rowLabel: 'قفسه ۱۴ (آنتی‌هیستامین‌ها و سرماخوردگی) — طبقات ۱ تا ۴',
    boxVisualCue: 'قفسه اختصاصی آنتی‌هیستامین‌ها و داروهای سرماخوردگی',
    rect: { x: 16, y: 28, w: 58, h: 52 },
  },
  'اطفال و نوزادان': {
    shelfPhotoId: 12,
    rowLabel: 'قفسه ۱۲ (شربت‌ها و قطره‌های اطفال) — طبقات ۱ تا ۵',
    boxVisualCue: 'قفسه شربت‌ها، سوسپانسیون‌ها و قطره‌های کودکان',
    rect: { x: 22, y: 27, w: 48, h: 50 },
  },
  'ویتامین، مکمل و کم‌خونی': {
    shelfPhotoId: 15,
    rowLabel: 'قفسه ۱۵ و ۱۶ (ویتامین‌ها، مکمل‌ها و کم‌خونی)',
    boxVisualCue: 'قفسه ویتامین‌ها، قرص آهن و مکمل‌های تقویتی',
    rect: { x: 15, y: 20, w: 70, h: 55 },
  },
  'چشمی، پوستی و موضعی': {
    shelfPhotoId: 5,
    rowLabel: 'قفسه ۵ (پمادها و کرم‌ها) و قفسه ۱۱ (قطره‌های چشمی)',
    boxVisualCue: 'ردیف پمادها و کرم‌های موضعی در قفسه ۵',
    rect: { x: 21, y: 50, w: 48, h: 25 },
  },
  'زنان، اورولوژی و هورمونی': {
    shelfPhotoId: 10,
    rowLabel: 'قفسه ۱۰ (داروهای زنان و هورمونی) — طبقات ۲ تا ۶',
    boxVisualCue: 'قفسه اختصاصی داروهای زنان و هورمونی',
    rect: { x: 19, y: 30, w: 52, h: 55 },
  },
};

export function getShelfById(shelfPhotoId: number): RealExamShelfPhoto {
  return (
    REAL_EXAM_SHELVES.find((s) => s.id === shelfPhotoId) ?? REAL_EXAM_SHELVES[0]
  );
}

export function matchItemToRealShelf(
  item: PrescriptionItem,
  itemIndex: number
): MatchedItemShelfAnnotation {
  const palette = ITEM_HIGHLIGHT_PALETTE[(itemIndex - 1) % ITEM_HIGHLIGHT_PALETTE.length];
  const pText = `${item.persianName} ${item.genericOrBrandNote ?? ''}`.toLowerCase();
  const eText = `${item.englishCue} ${item.genericOrBrandNote ?? ''}`.toLowerCase();

  let bestHotspot: RealShelfHotspot | null = null;
  let bestScore = 0;

  for (const hs of REAL_SHELF_HOTSPOTS) {
    // Enforce dosage form compatibility if hotspot specifies allowedForms
    if (hs.allowedForms && !hs.allowedForms.includes(item.form)) {
      continue;
    }
    // Conversely, if item is an Ampoule, strongly prefer Shelf 1 unless it's insulin (Shelf 9)
    if (
      item.form === 'آمپول' &&
      hs.shelfPhotoId !== 1 &&
      hs.shelfPhotoId !== 9
    ) {
      continue;
    }
    // If item is a Syrup/Suspension, strongly prefer Shelf 12 or 13 (herbal syrups)
    if (
      item.form === 'شربت / سوسپانسیون' &&
      hs.shelfPhotoId !== 12 &&
      hs.shelfPhotoId !== 13 &&
      hs.shelfPhotoId !== 16 &&
      hs.shelfPhotoId !== 7
    ) {
      continue;
    }
    // If item is an Ointment/Cream/Gel, strongly prefer Shelf 5
    if (item.form === 'پماد / کرم / ژل' && hs.shelfPhotoId !== 5) {
      continue;
    }

    let score = 0;
    for (const pk of hs.persianKeywords) {
      const kw = pk.toLowerCase();
      if (pText.includes(kw)) {
        score = Math.max(score, 20 + kw.length);
      }
    }
    for (const ek of hs.englishKeywords) {
      const kw = ek.toLowerCase();
      if (eText.includes(kw)) {
        score = Math.max(score, 25 + kw.length);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestHotspot = hs;
    }
  }

  if (bestHotspot && bestScore >= 20) {
    const shelf = getShelfById(bestHotspot.shelfPhotoId);
    return {
      itemIndex,
      item,
      shelfPhotoId: bestHotspot.shelfPhotoId,
      shelfTitle: shelf.title,
      hotspotId: bestHotspot.id,
      drugOnShelfTitle: bestHotspot.drugTitle,
      rowLabel: bestHotspot.rowLabel,
      boxVisualCue: bestHotspot.boxVisualCue,
      rect: bestHotspot.rect,
      isExactBoxMatch: true,
      colorHex: palette.colorHex,
      badgeBgClass: palette.badgeBgClass,
      borderClass: palette.borderClass,
    };
  }

  // Fallback by form first (e.g. آمپول -> قفسه ۱, شربت -> قفسه ۱۲, پماد -> قفسه ۵), then by clinical category
  const formFallback = FALLBACK_BY_FORM[item.form];
  const catFallback =
    FALLBACK_BY_CATEGORY[item.shelfCategory] ?? FALLBACK_BY_CATEGORY['گوارش و معده'];
  const chosenFallback = formFallback ?? catFallback;
  const shelf = getShelfById(chosenFallback.shelfPhotoId);

  return {
    itemIndex,
    item,
    shelfPhotoId: chosenFallback.shelfPhotoId,
    shelfTitle: shelf.title,
    hotspotId: `fallback-sh${chosenFallback.shelfPhotoId}-${itemIndex}`,
    drugOnShelfTitle: `${item.persianName} (${shelf.signLabel})`,
    rowLabel: chosenFallback.rowLabel,
    boxVisualCue: chosenFallback.boxVisualCue,
    rect: chosenFallback.rect,
    isExactBoxMatch: false,
    colorHex: palette.colorHex,
    badgeBgClass: palette.badgeBgClass,
    borderClass: palette.borderClass,
  };
}

export function rankPrescriptionsByShelfProbability(
  prescriptions: PrescriptionCard[]
): RankedExamPrescription[] {
  const scored = prescriptions.map((rx) => {
    const annotations = rx.items.map((item, idx) =>
      matchItemToRealShelf(item, idx + 1)
    );
    const totalItems = Math.max(1, annotations.length);
    const exactMatchCount = annotations.filter((a) => a.isExactBoxMatch).length;
    const exactCoverageRatio = exactMatchCount / totalItems;
    const exactCoveragePercent = Math.round(exactCoverageRatio * 100);

    const shelfIdsUsed = Array.from(
      new Set(annotations.map((a) => a.shelfPhotoId))
    ).sort((a, b) => a - b);

    // Bonus points for prescriptions with 3..6 items where every item is on the exam shelves,
    // plus teacher-important prescriptions and Shelf 7 (foreign signature brands) items
    const hasForeignShelfBrand = annotations.some((a) => a.shelfPhotoId === 7 && a.isExactBoxMatch);
    const idealExamLengthBonus = rx.items.length >= 2 && rx.items.length <= 6 ? 8 : 3;
    const teacherBonus = rx.isStarredByTeacher ? 6 : 0;
    const foreignBrandBonus = hasForeignShelfBrand ? 5 : 0;
    const exactVolumeBonus = Math.min(12, exactMatchCount * 2.5);

    const rawScore = Math.round(
      exactCoverageRatio * 68 +
        exactVolumeBonus +
        idealExamLengthBonus +
        teacherBonus +
        foreignBrandBonus
    );
    const probabilityScore = Math.max(18, Math.min(99, rawScore));

    let probabilityTier: RankedExamPrescription['probabilityTier'] = 'low';
    let probabilityLabel = 'احتمال کمتر (داروهای خاص)';

    if (exactCoveragePercent === 100 && exactMatchCount >= 3) {
      probabilityTier = 'very-high';
      probabilityLabel = '🔥 احتمال بسیار بالا (۱۰۰٪ موجود در قفسه‌های آزمون)';
    } else if (exactCoveragePercent >= 80 || probabilityScore >= 78) {
      probabilityTier = 'high';
      probabilityLabel = '✅ شانس بالا در امتحان (تطبیق مستقیم با قفسه‌ها)';
    } else if (exactCoveragePercent >= 50 || probabilityScore >= 58) {
      probabilityTier = 'medium';
      probabilityLabel = '🟡 شانس متوسط (بخش عمده موجود در قفسه)';
    }

    return {
      rank: 0,
      prescription: rx,
      probabilityScore,
      probabilityTier,
      probabilityLabel,
      exactMatchCount,
      totalItems: annotations.length,
      exactCoveragePercent,
      shelfIdsUsed,
      annotations,
    };
  });

  scored.sort((a, b) => {
    if (b.exactCoveragePercent !== a.exactCoveragePercent) {
      return b.exactCoveragePercent - a.exactCoveragePercent;
    }
    if (b.probabilityScore !== a.probabilityScore) {
      return b.probabilityScore - a.probabilityScore;
    }
    if (b.exactMatchCount !== a.exactMatchCount) {
      return b.exactMatchCount - a.exactMatchCount;
    }
    return a.prescription.rxNumber - b.prescription.rxNumber;
  });

  return scored.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
