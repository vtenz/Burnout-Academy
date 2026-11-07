import {
  ClinicalCategory,
  DosageForm,
  ExamRxAttempt,
  MasteryStatus,
  PrescriptionCard,
} from '../types/prescription';

export interface StudyFilters {
  sessionNumber: number | 'all';
  category: ClinicalCategory | 'all';
  dosageForm: DosageForm | 'all';
  masteryFilter: MasteryStatus | 'all' | 'weak_only' | 'starred' | 'completed_by_ai';
  searchQuery: string;
  sortByPriority: boolean;
}

export interface DeckStats {
  totalPrescriptions: number;
  totalItems: number;
  unseenCount: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  masteryPercent: number;
  reviewedCount: number;
  starredCount: number;
  completedFromImageCount: number;
}

const MASTERY_PRIORITY_WEIGHT: Record<MasteryStatus, number> = {
  again: 0, // Highest priority: needs immediate repetition
  hard: 1,  // Second priority: had doubt / incomplete
  unseen: 2, // Third priority: not yet studied
  good: 3,  // Lowest priority: already mastered
};

export function getCardMastery(
  rxId: string,
  masteryMap: Record<string, MasteryStatus>
): MasteryStatus {
  return masteryMap[rxId] ?? 'unseen';
}

export function matchesSearchQuery(card: PrescriptionCard, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  if (
    card.id.toLowerCase().includes(normalized) ||
    String(card.rxNumber).includes(normalized) ||
    card.doctorOrTitle.toLowerCase().includes(normalized) ||
    card.rawChannelText.toLowerCase().includes(normalized) ||
    card.visualClue.toLowerCase().includes(normalized) ||
    card.primaryCategory.toLowerCase().includes(normalized) ||
    card.photoIds.some((pid) => `photo_${pid}`.includes(normalized) || String(pid) === normalized)
  ) {
    return true;
  }

  return card.items.some(
    (item) =>
      item.persianName.toLowerCase().includes(normalized) ||
      item.englishCue.toLowerCase().includes(normalized) ||
      (item.genericOrBrandNote && item.genericOrBrandNote.toLowerCase().includes(normalized)) ||
      item.dosage.toLowerCase().includes(normalized) ||
      item.instructions.toLowerCase().includes(normalized) ||
      item.form.toLowerCase().includes(normalized)
  );
}

export function filterAndSortPrescriptions(
  cards: PrescriptionCard[],
  filters: StudyFilters,
  masteryMap: Record<string, MasteryStatus>,
  bookmarks: Record<string, boolean>
): PrescriptionCard[] {
  const filtered = cards.filter((card) => {
    if (filters.sessionNumber !== 'all' && card.sessionNumber !== filters.sessionNumber) {
      return false;
    }

    if (filters.category !== 'all') {
      const hasCat =
        card.primaryCategory === filters.category ||
        card.items.some((i) => i.shelfCategory === filters.category);
      if (!hasCat) return false;
    }

    if (filters.dosageForm !== 'all') {
      const hasForm = card.items.some((i) => i.form === filters.dosageForm);
      if (!hasForm) return false;
    }

    const status = getCardMastery(card.id, masteryMap);
    if (filters.masteryFilter === 'weak_only') {
      if (status !== 'again' && status !== 'hard') return false;
    } else if (filters.masteryFilter === 'starred') {
      if (!card.isStarredByTeacher && !bookmarks[card.id]) return false;
    } else if (filters.masteryFilter === 'completed_by_ai') {
      if (!card.auditNote && !card.items.some((i) => i.isAddedFromImage)) return false;
    } else if (filters.masteryFilter !== 'all') {
      if (status !== filters.masteryFilter) return false;
    }

    if (!matchesSearchQuery(card, filters.searchQuery)) {
      return false;
    }

    return true;
  });

  if (!filters.sortByPriority) {
    return [...filtered].sort((a, b) => a.rxNumber - b.rxNumber);
  }

  return [...filtered].sort((a, b) => {
    const statusA = getCardMastery(a.id, masteryMap);
    const statusB = getCardMastery(b.id, masteryMap);
    const weightDiff = MASTERY_PRIORITY_WEIGHT[statusA] - MASTERY_PRIORITY_WEIGHT[statusB];
    if (weightDiff !== 0) return weightDiff;
    return a.rxNumber - b.rxNumber;
  });
}

export function calculateDeckStats(
  cards: PrescriptionCard[],
  masteryMap: Record<string, MasteryStatus>
): DeckStats {
  let totalItems = 0;
  let unseenCount = 0;
  let againCount = 0;
  let hardCount = 0;
  let goodCount = 0;
  let starredCount = 0;
  let completedFromImageCount = 0;

  for (const card of cards) {
    totalItems += card.items.length;
    if (card.isStarredByTeacher) starredCount++;
    if (card.auditNote || card.items.some((i) => i.isAddedFromImage)) {
      completedFromImageCount++;
    }

    const status = getCardMastery(card.id, masteryMap);
    if (status === 'again') againCount++;
    else if (status === 'hard') hardCount++;
    else if (status === 'good') goodCount++;
    else unseenCount++;
  }

  const totalPrescriptions = cards.length;
  const reviewedCount = againCount + hardCount + goodCount;
  // Weighted mastery: good = 1.0, hard = 0.5, again/unseen = 0
  const weightedScore = goodCount + hardCount * 0.4;
  const masteryPercent =
    totalPrescriptions > 0 ? Math.round((weightedScore / totalPrescriptions) * 100) : 0;

  return {
    totalPrescriptions,
    totalItems,
    unseenCount,
    againCount,
    hardCount,
    goodCount,
    masteryPercent,
    reviewedCount,
    starredCount,
    completedFromImageCount,
  };
}

export function drawExamPrescriptions(
  cards: PrescriptionCard[],
  count: number = 3,
  mode: 'random' | 'weak_focus' | 'starred_focus' = 'random',
  masteryMap: Record<string, MasteryStatus> = {},
  rng: () => number = Math.random
): PrescriptionCard[] {
  if (cards.length <= count) return [...cards];

  let pool = [...cards];

  if (mode === 'weak_focus') {
    const weakPool = cards.filter((c) => {
      const st = getCardMastery(c.id, masteryMap);
      return st === 'again' || st === 'hard' || st === 'unseen';
    });
    if (weakPool.length >= count) {
      // Prioritize 'again' and 'hard' first if available
      const critical = weakPool.filter((c) => {
        const st = getCardMastery(c.id, masteryMap);
        return st === 'again' || st === 'hard';
      });
      pool = critical.length >= count ? critical : weakPool;
    }
  } else if (mode === 'starred_focus') {
    const starredPool = cards.filter((c) => c.isStarredByTeacher);
    if (starredPool.length >= count) {
      pool = starredPool;
    }
  }

  // Fisher-Yates shuffle on copy
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export interface ExamEvaluationSummary {
  totalPrescriptions: number;
  totalItems: number;
  correctItems: number;
  missedItems: number;
  scorePercent: number;
  passedExam: boolean;
  rxMasteryUpdates: Record<string, MasteryStatus>;
}

export function evaluateExamSubmission(
  examCards: PrescriptionCard[],
  attempts: Record<string, ExamRxAttempt>
): ExamEvaluationSummary {
  let totalItems = 0;
  let correctItems = 0;
  const rxMasteryUpdates: Record<string, MasteryStatus> = {};

  for (const card of examCards) {
    const attempt = attempts[card.id];
    let cardCorrect = 0;

    for (const item of card.items) {
      totalItems++;
      const isCorrect = Boolean(attempt?.itemResults?.[item.id]);
      if (isCorrect) {
        correctItems++;
        cardCorrect++;
      }
    }

    if (cardCorrect === card.items.length && card.items.length > 0) {
      rxMasteryUpdates[card.id] = 'good';
    } else if (cardCorrect >= Math.ceil(card.items.length * 0.6)) {
      rxMasteryUpdates[card.id] = 'hard';
    } else {
      rxMasteryUpdates[card.id] = 'again';
    }
  }

  const missedItems = totalItems - correctItems;
  const scorePercent = totalItems > 0 ? Math.round((correctItems / totalItems) * 100) : 0;

  return {
    totalPrescriptions: examCards.length,
    totalItems,
    correctItems,
    missedItems,
    scorePercent,
    passedExam: scorePercent >= 75,
    rxMasteryUpdates,
  };
}
