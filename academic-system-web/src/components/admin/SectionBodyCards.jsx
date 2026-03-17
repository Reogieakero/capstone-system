'use client';

import { Award, BookOpenText, GraduationCap, UserRound, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import styles from './SectionBodyCards.module.css';

const MOCK_STUDENT_NAMES = [
  'Juan Dela Cruz', 'Maria Santos', 'Carlo Reyes', 'Angela Cruz',
  'Nathan Flores', 'Bianca Mendoza', 'Ethan Ramirez', 'Lara Garcia',
  'Miguel Torres', 'Sophia Castillo', 'Daniel Navarro', 'Alyssa Lim',
];

function getHash(value) {
  const input = String(value || 'section');
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getMockTopStudents(section, count = 3) {
  const seed = getHash(`${section.id}-${section.grade_level}-${section.section_name}`);
  return Array.from({ length: count }, (_, index) => {
    const nameIndex = (seed + index * 3) % MOCK_STUDENT_NAMES.length;
    const score = (96 - index - ((seed + index) % 2)).toFixed(1);
    return {
      id: `${section.id}-student-${index + 1}`,
      name: MOCK_STUDENT_NAMES[nameIndex],
      score,
      rank: index + 1,
    };
  });
}

function getSectionLabel(section) {
  const gradeLevel = section?.grade_level ?? 'N/A';
  const sectionName = section?.section_name || section?.name || 'Unnamed Section';
  return `Grade ${gradeLevel} - ${sectionName}`;
}

export default function SectionBodyCards({ sections = [], onViewAnalytics }) {
  return (
    <div className={styles.grid}>
      {sections.map((section) => {
        const topStudents = getMockTopStudents(section);
        const handleOpenAnalytics = () => {
          if (onViewAnalytics) {
            onViewAnalytics(section.id);
          }
        };

        return (
          <article key={section.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <BookOpenText size={16} className={styles.headerIcon} />
                <h3 className={styles.cardTitle}>{getSectionLabel(section)}</h3>
              </div>
              <span className={styles.badge}>Section</span>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <GraduationCap size={14} />
                <span>Grade {section?.grade_level ?? 'N/A'}</span>
              </div>
              <div className={styles.metaItem}>
                <UserRound size={14} />
                <span>{section?.adviser_name || 'No Adviser Assigned'}</span>
              </div>
            </div>

            <div className={styles.studentBlock}>
              <div className={styles.studentHeader}>
                <Award size={14} />
                <span>Top Performing Students</span>
              </div>

              <div className={styles.studentList}>
                {topStudents.map((student) => (
                  <div key={student.id} className={styles.studentRow}>
                    <span className={styles.rankTag}>#{student.rank}</span>
                    <span className={styles.studentName}>{student.name}</span>
                    <span className={styles.studentScore}>{student.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {onViewAnalytics ? (
              <button
                type="button"
                className={styles.analyticsBtn}
                onClick={handleOpenAnalytics}
              >
                <BarChart2 size={16} />
                <span>View Analytics</span>
              </button>
            ) : (
              <Link
                href={`/admin/analytics/${section.id}`}
                className={styles.analyticsBtn}
              >
                <BarChart2 size={16} />
                <span>View Analytics</span>
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}