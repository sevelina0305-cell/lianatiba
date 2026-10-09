// Tanzania-Aligned Grading Engine for Secondary Schools (O-Level & A-Level)
import { EducationLevel, GradingScheme, GradeBoundary } from '../types';

export const DEFAULT_O_LEVEL_SCHEME: GradingScheme = {
  id: 'scheme_o_level_standard',
  name: 'Standard O-Level (Form I - IV)',
  level: 'O_LEVEL',
  isDefault: true,
  boundaries: [
    { grade: 'A', minScore: 75, maxScore: 100, points: 1, remark: 'Distinction', remarkSwahili: 'Bora Sana' },
    { grade: 'B', minScore: 65, maxScore: 74, points: 2, remark: 'Very Good', remarkSwahili: 'Vizuri Sana' },
    { grade: 'C', minScore: 45, maxScore: 64, points: 3, remark: 'Good', remarkSwahili: 'Vizuri' },
    { grade: 'D', minScore: 30, maxScore: 44, points: 4, remark: 'Satisfactory', remarkSwahili: 'Inaridhisha' },
    { grade: 'F', minScore: 0, maxScore: 29, points: 5, remark: 'Fail', remarkSwahili: 'Amefeli' },
  ],
  divisions: [
    { division: 'I', minPoints: 7, maxPoints: 17, description: 'Division One (Distinction)' },
    { division: 'II', minPoints: 18, maxPoints: 21, description: 'Division Two (Merit)' },
    { division: 'III', minPoints: 22, maxPoints: 25, description: 'Division Three (Credit)' },
    { division: 'IV', minPoints: 26, maxPoints: 33, description: 'Division Four (Pass)' },
    { division: '0', minPoints: 34, maxPoints: 35, description: 'Division Zero (Fail)' },
  ],
};

export const DEFAULT_A_LEVEL_SCHEME: GradingScheme = {
  id: 'scheme_a_level_standard',
  name: 'Standard A-Level (Form V - VI)',
  level: 'A_LEVEL',
  isDefault: true,
  boundaries: [
    { grade: 'A', minScore: 80, maxScore: 100, points: 1, remark: 'Excellent', remarkSwahili: 'Bora Kabisa' },
    { grade: 'B', minScore: 70, maxScore: 79, points: 2, remark: 'Very Good', remarkSwahili: 'Vizuri Sana' },
    { grade: 'C', minScore: 60, maxScore: 69, points: 3, remark: 'Good', remarkSwahili: 'Vizuri' },
    { grade: 'D', minScore: 50, maxScore: 59, points: 4, remark: 'Satisfactory', remarkSwahili: 'Wastani' },
    { grade: 'E', minScore: 40, maxScore: 49, points: 5, remark: 'Pass', remarkSwahili: 'Ufaulu wa Chini' },
    { grade: 'S', minScore: 35, maxScore: 39, points: 6, remark: 'Subsidiary', remarkSwahili: 'Ufaulu Mdogo (S)' },
    { grade: 'F', minScore: 0, maxScore: 34, points: 7, remark: 'Fail', remarkSwahili: 'Amefeli' },
  ],
  divisions: [
    { division: 'I', minPoints: 3, maxPoints: 9, description: 'Division One (Distinction)' },
    { division: 'II', minPoints: 10, maxPoints: 12, description: 'Division Two (Merit)' },
    { division: 'III', minPoints: 13, maxPoints: 17, description: 'Division Three (Credit)' },
    { division: 'IV', minPoints: 18, maxPoints: 19, description: 'Division Four (Pass)' },
    { division: '0', minPoints: 20, maxPoints: 21, description: 'Division Zero (Fail)' },
  ],
};

/**
 * Calculate grade and points for a single subject raw score
 */
export function calculateSubjectGrade(
  score: number | undefined | null,
  isAbsent: boolean,
  scheme: GradingScheme
): { grade: string; points: number; remark: string; remarkSwahili: string } {
  if (isAbsent || score === undefined || score === null) {
    return {
      grade: 'ABS',
      points: scheme.level === 'O_LEVEL' ? 5 : 7,
      remark: 'Absent',
      remarkSwahili: 'Hajahudhuria',
    };
  }

  // Cap between 0 and 100
  const normalized = Math.max(0, Math.min(100, Math.round(score)));

  for (const b of scheme.boundaries) {
    if (normalized >= b.minScore && normalized <= b.maxScore) {
      return {
        grade: b.grade,
        points: b.points,
        remark: b.remark,
        remarkSwahili: b.remarkSwahili,
      };
    }
  }

  const lastBoundary = scheme.boundaries[scheme.boundaries.length - 1];
  return {
    grade: lastBoundary.grade,
    points: lastBoundary.points,
    remark: lastBoundary.remark,
    remarkSwahili: lastBoundary.remarkSwahili,
  };
}

/**
 * Calculate Overall Division for Tanzanian Students
 * O-Level uses Best 7 subjects points sum.
 * A-Level uses 3 Principal subjects points sum.
 */
export function calculateDivision(
  subjectScores: { points: number; grade: string; isAbsent: boolean }[],
  level: EducationLevel,
  scheme: GradingScheme
): { totalPoints: number; division: 'I' | 'II' | 'III' | 'IV' | '0'; summary: string } {
  const validScores = subjectScores.filter((s) => !s.isAbsent);

  if (validScores.length === 0) {
    return { totalPoints: 0, division: '0', summary: 'All Absent / No Marks' };
  }

  // Sort ascending by points (lower points is better in NECTA system: A=1, B=2, C=3...)
  const sortedPoints = validScores.map((s) => s.points).sort((a, b) => a - b);

  if (level === 'O_LEVEL') {
    // Best 7 subjects
    const bestSeven = sortedPoints.slice(0, 7);
    const sumPoints = bestSeven.reduce((acc, curr) => acc + curr, 0);

    // Division check
    for (const d of scheme.divisions) {
      if (sumPoints >= d.minPoints && sumPoints <= d.maxPoints) {
        return { totalPoints: sumPoints, division: d.division, summary: d.description };
      }
    }
    return { totalPoints: sumPoints, division: '0', summary: 'Division Zero (Fail)' };
  } else {
    // A-Level: Best 3 principal subjects
    const bestThree = sortedPoints.slice(0, 3);
    const sumPoints = bestThree.reduce((acc, curr) => acc + curr, 0);

    for (const d of scheme.divisions) {
      if (sumPoints >= d.minPoints && sumPoints <= d.maxPoints) {
        return { totalPoints: sumPoints, division: d.division, summary: d.description };
      }
    }
    return { totalPoints: sumPoints, division: '0', summary: 'Division Zero (Fail)' };
  }
}
