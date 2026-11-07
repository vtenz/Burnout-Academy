import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PRESCRIPTIONS, DRUG_BOX_ASSETS, EXCLUDED_PHOTOS_MANIFEST } from '../data/prescriptionsData';
import {
  calculateDeckStats,
  drawExamPrescriptions,
  evaluateExamSubmission,
  filterAndSortPrescriptions,
  StudyFilters,
} from './studyEngine';
import { MasteryStatus } from '../types/prescription';

test('dataset integrity: contains all 129 curated prescriptions across 12 sessions', () => {
  assert.equal(ALL_PRESCRIPTIONS.length, 129);

  // Every rxNumber 1..129 is unique and sequential
  const rxNumbers = ALL_PRESCRIPTIONS.map((r) => r.rxNumber);
  assert.equal(new Set(rxNumbers).size, 129);
  assert.equal(Math.min(...rxNumbers), 1);
  assert.equal(Math.max(...rxNumbers), 129);

  // Every prescription has at least 1 valid item and 1 photoId
  for (const rx of ALL_PRESCRIPTIONS) {
    assert.ok(rx.photoIds.length >= 1, `Prescription ${rx.id} must have at least 1 photoId`);
    assert.ok(rx.items.length >= 1, `Prescription ${rx.id} must have at least 1 medication item`);
  }
});

test('complete 183 channel photos accounting: prescriptions + excluded = 183 unique photos', () => {
  const rxPhotoIds = new Set<number>();
  for (const rx of ALL_PRESCRIPTIONS) {
    for (const pid of rx.photoIds) {
      rxPhotoIds.add(pid);
    }
  }

  const excludedIds = new Set<number>([
    ...EXCLUDED_PHOTOS_MANIFEST.whiteboardsAndNotebooks,
    ...EXCLUDED_PHOTOS_MANIFEST.multipleChoiceExamSheets,
    ...EXCLUDED_PHOTOS_MANIFEST.drugBoxesAndInfographics,
  ]);

  // Verify no overlap between prescription photos and excluded non-prescription photos
  for (const pid of rxPhotoIds) {
    assert.equal(
      excludedIds.has(pid),
      false,
      `Photo ${pid} should not be in both prescriptions and excluded lists`
    );
  }

  assert.equal(rxPhotoIds.size, 137);
  assert.equal(excludedIds.size, 46);
  assert.equal(rxPhotoIds.size + excludedIds.size, 183);
  assert.equal(DRUG_BOX_ASSETS.length, 33);
});

test('multi-photo and handwritten-completed prescriptions are properly merged and completed', () => {
  // Check photo_16 + photo_15 merged in rx-6
  const rx6 = ALL_PRESCRIPTIONS.find((r) => r.rxNumber === 6);
  assert.ok(rx6);
  assert.deepEqual(rx6.photoIds, [16, 15]);

  // Check photo_147 + 148 + 149 merged in rx-109
  const rx109 = ALL_PRESCRIPTIONS.find((r) => r.photoIds.includes(147));
  assert.ok(rx109);
  assert.deepEqual(rx109.photoIds, [147, 148, 149]);

  // Check photo_45 (rx-19) has the 3 top items transcribed from handwriting (total 7 items)
  const rx19 = ALL_PRESCRIPTIONS.find((r) => r.photoIds.includes(45));
  assert.ok(rx19);
  assert.equal(rx19.items.length, 7);
  assert.ok(rx19.items.some((i) => i.isAddedFromImage));

  // Check photo_183 (rx-129) connected to message 287 with 4 items
  const rx129 = ALL_PRESCRIPTIONS.find((r) => r.photoIds.includes(183));
  assert.ok(rx129);
  assert.equal(rx129.items.length, 4);
});

test('Spaced Repetition priority sorting puts again -> hard -> unseen -> good', () => {
  const sample = ALL_PRESCRIPTIONS.slice(0, 4);
  const masteryMap: Record<string, MasteryStatus> = {
    [sample[0].id]: 'good',
    [sample[1].id]: 'unseen',
    [sample[2].id]: 'again',
    [sample[3].id]: 'hard',
  };

  const defaultFilters: StudyFilters = {
    sessionNumber: 'all',
    category: 'all',
    dosageForm: 'all',
    masteryFilter: 'all',
    searchQuery: '',
    sortByPriority: true,
  };

  const sorted = filterAndSortPrescriptions(sample, defaultFilters, masteryMap, {});
  assert.deepEqual(
    sorted.map((s) => s.id),
    [sample[2].id, sample[3].id, sample[1].id, sample[0].id]
  );
});

test('Practical Exam Simulator draws 3 distinct prescriptions and grades item recall accurately', () => {
  const drawn = drawExamPrescriptions(ALL_PRESCRIPTIONS, 3, 'random', {}, () => 0.42);
  assert.equal(drawn.length, 3);
  assert.equal(new Set(drawn.map((d) => d.id)).size, 3);

  // Simulate answering all items right on rx 1, half on rx 2, none on rx 3
  const attempts = {
    [drawn[0].id]: {
      rxId: drawn[0].id,
      revealed: true,
      itemResults: Object.fromEntries(drawn[0].items.map((i) => [i.id, true])),
    },
    [drawn[1].id]: {
      rxId: drawn[1].id,
      revealed: true,
      itemResults: Object.fromEntries(
        drawn[1].items.map((i, idx) => [i.id, idx < Math.ceil(drawn[1].items.length * 0.65)])
      ),
    },
    [drawn[2].id]: {
      rxId: drawn[2].id,
      revealed: true,
      itemResults: {},
    },
  };

  const evaluation = evaluateExamSubmission(drawn, attempts);
  assert.equal(evaluation.totalPrescriptions, 3);
  assert.equal(evaluation.rxMasteryUpdates[drawn[0].id], 'good');
  assert.equal(evaluation.rxMasteryUpdates[drawn[1].id], 'hard');
  assert.equal(evaluation.rxMasteryUpdates[drawn[2].id], 'again');

  const stats = calculateDeckStats(drawn, evaluation.rxMasteryUpdates);
  assert.equal(stats.goodCount, 1);
  assert.equal(stats.hardCount, 1);
  assert.equal(stats.againCount, 1);
});

import {
  aggregateAllDrugs,
  buildDoctorProfiles,
  evaluateShelfBasket,
  groupDrugsByCategory,
  normalizeDrugKey,
} from './catalogAggregator';

test('catalogAggregator: aggregates all medications by category and links every prescription', () => {
  const allDrugs = aggregateAllDrugs(ALL_PRESCRIPTIONS);
  assert.ok(allDrugs.length >= 60, 'Should aggregate at least 60 distinct drug entries');

  const grouped = groupDrugsByCategory(allDrugs);
  assert.ok(grouped['گوارش و معده'].length > 0);
  assert.ok(grouped['اعصاب و روان'].length > 0);

  // Every drug has at least 1 prescription occurrence
  for (const d of allDrugs) {
    assert.ok(d.prescriptionIds.length >= 1);
    assert.ok(d.occurrences.length >= d.prescriptionIds.length);
  }
});

test('catalogAggregator: builds doctor profiles covering all 129 prescriptions', () => {
  const profiles = buildDoctorProfiles(ALL_PRESCRIPTIONS);
  assert.ok(profiles.length >= 8);

  const totalRxAcrossProfiles = profiles.reduce((acc, p) => acc + p.prescriptionCount, 0);
  assert.equal(totalRxAcrossProfiles, 129);

  // Dr. Kabirian is first and has topCategories and topDrugs
  assert.equal(profiles[0].id, 'dr-kabirian');
  assert.ok(profiles[0].topCategories.length > 0);
  assert.ok(profiles[0].topDrugs.length > 0);
});

test('catalogAggregator: evaluateShelfBasket grades picked shelf items and detects crossed-out mistakes', () => {
  const allDrugs = aggregateAllDrugs(ALL_PRESCRIPTIONS);
  const drugMap = new Map(allDrugs.map((d) => [d.key, d]));

  // Pick rx-7 which has 2 crossed-out items (ASA 80 and Olanzapine 15)
  const rx7 = ALL_PRESCRIPTIONS.find((r) => r.rxNumber === 7)!;
  const activeKeys = rx7.items
    .filter((i) => !i.isCrossedOut)
    .map((i) => normalizeDrugKey(i.persianName).key);

  const perfectResult = evaluateShelfBasket(rx7, activeKeys, drugMap);
  assert.equal(perfectResult.isPerfect, true);
  assert.equal(perfectResult.scorePercent, 100);
  assert.equal(perfectResult.missedFromRx.length, 0);

  // Now simulate picking a crossed-out item too
  const crossedKey = normalizeDrugKey(rx7.items.find((i) => i.isCrossedOut)!.persianName).key;
  const mistakeResult = evaluateShelfBasket(rx7, [...activeKeys, crossedKey], drugMap);
  assert.equal(mistakeResult.isPerfect, false);
  assert.equal(mistakeResult.crossedOutMistakes.length, 1);
});

