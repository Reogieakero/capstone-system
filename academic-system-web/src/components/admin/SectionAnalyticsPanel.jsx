'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { 
  IoPeopleOutline, IoStatsChartOutline, IoCalendarOutline, 
  IoPieChartOutline, IoCheckmarkDoneOutline, IoTrendingUpOutline,
  IoHelpCircleOutline 
} from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs'; 
import styles from './SectionAnalyticsPanel.module.css';

// --- MOCK DATA & CONSTANTS ---
const SUBJECTS = ['Math', 'Science', 'English', 'Filipino', 'History', 'MAPEH', 'TLE', 'ICT'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'Final'];

const CHART_INFO = {
  proficiency: "Displays the distribution of students based on their cumulative grade averages and competency levels.",
  distribution: "Shows the number of students falling within specific grade ranges for the selected grading period.",
  attendance: "Tracks the average daily attendance percentage of the section over the current week.",
  submission: "Monitors the percentage of students who successfully turned in specific assignments and activities."
};

// Logic to generate different grade data based on quarter
const getGradeData = (period) => {
  const variations = {
    'Q1': [8, 15, 12, 5, 2],
    'Q2': [10, 12, 14, 4, 2],
    'Q3': [12, 10, 15, 3, 2],
    'Q4': [15, 14, 8, 3, 2],
    'Final': [14, 16, 9, 2, 1],
  };
  const counts = variations[period] || variations['Q1'];
  return [
    { range: '95-100', count: counts[0] },
    { range: '90-94', count: counts[1] },
    { range: '85-89', count: counts[2] },
    { range: '80-84', count: counts[3] },
    { range: '75-79', count: counts[4] },
  ];
};

const proficiencyData = [
  { name: 'Advanced', value: 12, color: '#1b5e20', desc: 'Average 95-100' },
  { name: 'Proficient', value: 18, color: '#2e7d32', desc: 'Average 90-94' },
  { name: 'Approaching', value: 8, color: '#66bb6a', desc: 'Average 85-89' },
  { name: 'Developing', value: 4, color: '#a5d6a7', desc: 'Average Below 85' },
];

const attendanceData = [
  { day: 'Mon', rate: 96 }, { day: 'Tue', rate: 92 },
  { day: 'Wed', rate: 98 }, { day: 'Thu', rate: 85 }, { day: 'Fri', rate: 94 },
];

const getSubmissionData = (subject) => [
  { task: 'Quiz 1', rate: 98, date: 'Mar 10' },
  { task: 'Quiz 2', rate: 92, date: 'Mar 12' },
  { task: 'Project 1', rate: 85, date: 'Mar 14' },
  { task: 'Midterm', rate: 95, date: 'Mar 15' },
  { task: 'Final Proj', rate: 88, date: 'Mar 17' },
];

// --- EXTERNAL COMPONENTS (FIXED) ---

const CustomTooltip = ({ active, payload, label, type }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipTitle}>{label || payload[0].name}</p>
        <div className={styles.tooltipDivider} />
        <p className={styles.tooltipValue}>
          {type === 'attendance' ? 'Attendance: ' : 
           type === 'grade' ? 'Student Count: ' : 
           type === 'pie' ? 'Total: ' : 'Rate: '}
          <span>{payload[0].value}{type === 'grade' || type === 'pie' ? '' : '%'}</span>
        </p>
        {payload[0].payload.date && <p className={styles.tooltipSub}>Date: <span>{payload[0].payload.date}</span></p>}
        {payload[0].payload.desc && <p className={styles.tooltipSub}>Criteria: <span>{payload[0].payload.desc}</span></p>}
      </div>
    );
  }
  return null;
};

const ChartHeader = ({ icon: Icon, title, info, subtitle, children }) => (
  <div className={styles.graphHeader}>
    <div className={styles.headerTitleGroup}>
      <Icon />
      <div className={styles.titleStack}>
        <h3>{title}</h3>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      <div className={styles.infoWrapper}>
        <IoHelpCircleOutline className={styles.infoIcon} />
        <div className={styles.infoTooltip}>{info}</div>
      </div>
    </div>
    {children && <div className={styles.headerFilterSlot}>{children}</div>}
  </div>
);

export default function SectionAnalyticsPanel() {
  const [activeSubject, setActiveSubject] = useState('Math');
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const brandGreen = '#2e7d32';

  return (
    <div className={styles.container}>
      {/* Top Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconCircle}><IoPeopleOutline size={20} /></div>
          <div><h3>Total Students</h3><p className={styles.statValue}>42</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconCircle}><IoStatsChartOutline size={20} /></div>
          <div><h3>Avg. Grade</h3><p className={styles.statValue}>89.4%</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconCircle}><IoCalendarOutline size={20} /></div>
          <div><h3>Attendance</h3><p className={styles.statValue}>92.6%</p></div>
        </div>
      </div>

      <div className={styles.mainDashboardGrid}>
        {/* LEFT: Pie Chart */}
        <div className={`${styles.graphCard} ${styles.leftPanel}`}>
          <ChartHeader icon={IoPieChartOutline} title="Section Proficiency" info={CHART_INFO.proficiency} />
          <div className={styles.pieContainer}>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie data={proficiencyData} innerRadius={85} outerRadius={125} paddingAngle={8} dataKey="value">
                  {proficiencyData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<CustomTooltip type="pie" />} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieCenterLabel}>
              <span className={styles.bigLabel}>42</span>
              <span className={styles.smallLabel}>Students</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Grade & Attendance */}
        <div className={styles.rightPanel}>
          <div className={styles.graphCard}>
            <ChartHeader 
              icon={IoStatsChartOutline} 
              title="Grades" 
              info={CHART_INFO.distribution}
            >
              <div className={styles.miniFilter}>
                <FilterTabs 
                  items={QUARTERS} 
                  activeValue={activeQuarter} 
                  onChange={setActiveQuarter} 
                />
              </div>
            </ChartHeader>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={getGradeData(activeQuarter)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="range" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip type="grade" />} cursor={{fill: '#f0f4f0'}} />
                <Bar dataKey="count" fill={brandGreen} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.graphCard}>
            <ChartHeader icon={IoTrendingUpOutline} title="Weekly Attendance" info={CHART_INFO.attendance} />
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[80, 100]} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip type="attendance" />} />
                <Line type="monotone" dataKey="rate" stroke={brandGreen} strokeWidth={3} dot={{ r: 4, fill: brandGreen }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM: Submission */}
        <div className={`${styles.graphCard} ${styles.bottomPanel}`}>
          <div className={styles.bottomHeaderRow}>
            <ChartHeader 
              icon={IoCheckmarkDoneOutline} 
              title="Submission Rates" 
              subtitle={`${activeSubject} Overview`}
              info={CHART_INFO.submission} 
            />
            <div className={styles.filterWrapper}>
              <FilterTabs items={SUBJECTS} activeValue={activeSubject} onChange={setActiveSubject} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getSubmissionData(activeSubject)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="task" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f0f4f0'}} />
              <Bar dataKey="rate" fill={brandGreen} radius={[6, 6, 0, 0]} barSize={50}>
                <LabelList dataKey="date" position="top" style={{ fontSize: '11px', fontWeight: '700', fill: '#2e7d32' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}