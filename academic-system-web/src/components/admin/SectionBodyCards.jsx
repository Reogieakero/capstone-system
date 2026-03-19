'use client';

import { Award, BookOpenText, GraduationCap, UserRound, BarChart2, Pencil, CalendarCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './SectionBodyCards.module.css';

const MOCK_STUDENT_NAMES = [
  'Juan Dela Cruz', 'Maria Santos', 'Carlo Reyes', 'Angela Cruz',
  'Nathan Flores', 'Bianca Mendoza', 'Ethan Ramirez', 'Lara Garcia',
  'Miguel Torres', 'Sophia Castillo', 'Daniel Navarro', 'Alyssa Lim',
];

const MOCK_SCHEDULE = [
  { time: '7:30 - 8:30',   teacher: 'Alan Gatdula' },
  { time: '8:30 - 9:30',   teacher: 'Maria Reyes' },
  { time: '9:30 - 10:30',  teacher: 'Jose Santos' },
  { time: '10:30 - 11:30', teacher: 'Lorna Cruz' },
  { time: '11:30 - 12:30', teacher: 'Ramon Bautista' },
  { time: '13:00 - 14:00', teacher: 'Elena Villanueva' },
  { time: '14:00 - 15:00', teacher: 'Mark Dela Rosa' },
];

const MOCK_ATTENDANCE = {
  present: 38,
  absent: 4,
  total: 42,
};

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

function parseTime(timeStr) {
  const [h, m] = timeStr.trim().split(':').map(Number);
  return h * 60 + m;
}

function getCurrentSlot(schedule) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return schedule.find((slot) => {
    const [startStr, endStr] = slot.time.split('-');
    const start = parseTime(startStr);
    const end = parseTime(endStr);
    return currentMinutes >= start && currentMinutes < end;
  }) ?? null;
}

export default function SectionBodyCards({ sections = [], onViewAnalytics, onEditSection }) {
  return (
    <div className={styles.grid}>
      {sections.map((section) => {
        const realStudents = section.top_students ?? [];
        const topStudents = realStudents.length > 0
          ? realStudents
          : getMockTopStudents(section);

        const attendance = section.attendance ?? MOCK_ATTENDANCE;
        const schedule = section.schedule ?? MOCK_SCHEDULE;
        const attendanceRate = Math.round((attendance.present / attendance.total) * 100);
        const currentSlot = getCurrentSlot(schedule);

        const handleOpenAnalytics = () => {
          if (onViewAnalytics) onViewAnalytics(section.id);
        };

        return (
          <article key={section.id} className={styles.card}>

            {/* Header — always visible */}
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <BookOpenText size={16} className={styles.headerIcon} />
                <h3 className={styles.cardTitle}>{getSectionLabel(section)}</h3>
              </div>
              <span className={styles.adviserFloating}>
                <UserRound size={11} />
                {section?.adviser_name || 'No Adviser'}
              </span>
            </div>

            {/* Meta — fades out on hover, takes no height change */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <UserRound size={14} />
                <span>{section?.adviser_name || 'No Adviser Assigned'}</span>
              </div>
            </div>

            {/*
              morphArea: fixed-height container using position:relative + overflow:hidden.
              bentoGrid and studentBlock are both position:absolute inside here,
              so they crossfade without shifting the card height.
            */}
            <div className={styles.morphArea}>

              {/* Bento cards — visible at rest */}
              <div className={styles.bentoGrid}>
                <div className={styles.bentoCard}>
                  <div className={styles.bentoHeader}>
                    <CalendarCheck size={12} className={styles.bentoIcon} />
                    <span>Attendance</span>
                  </div>
                  <div className={styles.attendanceBody}>
                    <div className={styles.attendanceRate}>{attendanceRate}%</div>
                    <div className={styles.attendanceSub}>
                      {attendance.present} / {attendance.total} present
                    </div>
                    <div className={styles.attendanceBar}>
                      <div
                        className={styles.attendanceFill}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.bentoCard}>
                  <div className={styles.bentoHeader}>
                    <Clock size={12} className={styles.bentoIcon} />
                    <span>Current Teacher</span>
                  </div>
                  {currentSlot ? (
                    <div className={styles.currentTeacherBody}>
                      <div className={styles.currentTeacherName}>{currentSlot.teacher}</div>
                      <div className={styles.currentTeacherTime}>{currentSlot.time}</div>
                      <span className={styles.onAirBadge}>On class</span>
                    </div>
                  ) : (
                    <div className={styles.noClassBody}>
                      <span className={styles.noClassText}>No class right now</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student block — hidden at rest, fades in on hover */}
              <div className={styles.studentBlock}>
                <div className={styles.studentHeader}>
                  <Award size={14} />
                  <span>Top Performing Students</span>
                </div>
                <div className={styles.studentList}>
                  {topStudents.map((student, index) => (
                    <div key={student.id ?? index} className={styles.studentRow}>
                      <span className={styles.rankTag}>#{student.rank ?? index + 1}</span>
                      <span className={styles.studentName}>{student.name}</span>
                      <span className={styles.studentScore}>{student.score}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer actions — morph in on hover */}
            <div className={styles.cardFooter}>
              <div className={styles.actions}>
                {onViewAnalytics ? (
                  <button
                    type="button"
                    className={styles.btnAnalytics}
                    onClick={handleOpenAnalytics}
                  >
                    <BarChart2 size={15} />
                    <span>View Analytics</span>
                  </button>
                ) : (
                  <Link
                    href={`/admin/analytics/${section.id}`}
                    className={styles.btnAnalytics}
                  >
                    <BarChart2 size={15} />
                    <span>View Analytics</span>
                  </Link>
                )}

                {onEditSection && (
                  <button
                    type="button"
                    className={styles.btnEdit}
                    onClick={() => onEditSection(section)}
                    aria-label="Edit Section"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            </div>

          </article>
        );
      })}
    </div>
  );
}