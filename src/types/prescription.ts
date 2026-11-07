export type DosageForm =
  | 'قرص'
  | 'کپسول'
  | 'آمپول'
  | 'شربت / سوسپانسیون'
  | 'پماد / کرم / ژل'
  | 'قطره / اسپری'
  | 'سرم'
  | 'شیاف / پودر / متفرقه';

export type ClinicalCategory =
  | 'گوارش و معده'
  | 'اعصاب و روان'
  | 'قلب، فشار خون و دیابت'
  | 'آنتی‌بیوتیک و عفونی'
  | 'مسکن، التهاب و مفاصل'
  | 'تنفسی، سرماخوردگی و آلرژی'
  | 'اطفال و نوزادان'
  | 'ویتامین، مکمل و کم‌خونی'
  | 'چشمی، پوستی و موضعی'
  | 'زنان، اورولوژی و هورمونی';

export type MasteryStatus = 'unseen' | 'again' | 'hard' | 'good';

export interface PrescriptionItem {
  id: string;
  form: DosageForm;
  persianName: string;
  englishCue: string; // How it appears in doctor's handwriting (e.g. "Tab Pantoss 40mg")
  genericOrBrandNote?: string; // e.g. "پنتوپرازول / Pantoprazole"
  dosage: string; // e.g. "40 میلی‌گرم" or "500 میلی‌گرم"
  quantity: string; // e.g. "60 عدد" or "1 عدد"
  instructions: string; // e.g. "صبح و شب یکی قبل غذا"
  shelfCategory: ClinicalCategory;
  isCrossedOut?: boolean; // True if crossed out on prescription (do not dispense!)
  isCompounded?: boolean; // True if mixed in an empty container (ظرف خالی)
  isAddedFromImage?: boolean; // True if omitted in Telegram text and transcribed directly from handwriting!
}

export interface PrescriptionCard {
  id: string; // e.g. "rx-1"
  rxNumber: number; // 1 to 129
  sessionNumber: number; // 1 to 12
  sessionTitle: string; // e.g. "جلسه اول"
  sessionDate: string; // e.g. "۱۰ مهر"
  photoIds: number[]; // e.g. [16, 15] or [147, 148, 149]
  photoLabels?: string[]; // Optional labels for multi-photo prescriptions
  doctorOrTitle: string; // e.g. "نسخه قانعی - دکتر متخصص داخلی"
  rawChannelText: string; // Original cleaned caption from result.txt
  auditNote?: string; // Note if we completed missing items or merged multiple photos
  isStarredByTeacher?: boolean; // Marked "نسخه مهم*" in channel
  primaryCategory: ClinicalCategory;
  handwritingDifficulty: 'آسان' | 'متوسط' | 'چالشی';
  visualClue: string; // Visual hook to recognize this prescription in 2 seconds
  items: PrescriptionItem[];
}

export interface DrugBoxAsset {
  id: string;
  photoId: number;
  title: string;
  genericName: string;
  form: DosageForm;
  category: ClinicalCategory;
  description: string;
  shelfTip: string;
}

export interface ExamItemResult {
  itemId: string;
  recalledCorrectly: boolean;
}

export interface ExamRxAttempt {
  rxId: string;
  revealed: boolean;
  itemResults: Record<string, boolean>;
}

export interface ExamHistoryEntry {
  id: string;
  timestamp: number;
  rxIds: string[];
  totalItems: number;
  correctItems: number;
  scorePercent: number;
  durationSeconds: number;
}
