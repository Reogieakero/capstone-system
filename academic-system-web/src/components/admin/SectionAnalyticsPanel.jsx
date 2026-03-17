'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { 
  IoPeopleOutline, IoStatsChartOutline, IoCalendarOutline, 
  IoPieChartOutline, IoCheckmarkDoneOutline, IoTrendingUpOutline 
} from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs'; 
import styles from './SectionAnalyticsPanel.module.css';

// --- MOCK DATA ---
const SUBJECTS = ['Math', 'Science', 'English', 'Filipino', 'History', 'MAPEH', 'TLE', 'ICT'];

const proficiencyData = [
  { name: 'Advanced', value: 12, color: '#1b5e20', desc: 'Average 95-100' },
  { name: 'Proficient', value: 18, color: '#2e7d32', desc: 'Average 90-94' },
  { name: 'Approaching', value: 8, color: '#66bb6a', desc: 'Average 85-89' },
  { name: 'Developing', value: 4, color: '#a5d6a7', desc: 'Average Below 85' },
];

const gradeData = [
  { range: '95-100', count: 8 },
  { range: '90-94', count: 15 },
  { range: '85-89', count: 12 },
  { range: '80-84', count: 5 },
  { range: '75-79', count: 2 },
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

// FIXED: Define the component OUTSIDE of the main render function
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
        {payload[0].payload.date && (
          <p className={styles.tooltipSub}>Date: <span>{payload[0].payload.date}</span></p>
        )}
        {payload[0].payload.desc && (
          <p className={styles.tooltipSub}>Criteria: <span>{payload[0].payload.desc}</span></p>
        )}
      </div>
    );
  }
  return null;
};

export default function SectionAnalyticsPanel() {
  const [activeSubject, setActiveSubject] = useState('Math');
  const brandGreen = '#2e7d32';

  return (
    <div className={styles.container}>
      {/* Top Stats Cards */}
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
          <div className={styles.graphHeader}>
            <IoPieChartOutline />
            <h3>Section Proficiency</h3>
          </div>
          <div className={styles.pieContainer}>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie data={proficiencyData} innerRadius={85} outerRadius={125} paddingAngle={8} dataKey="value">
                  {proficiencyData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                {/* Use content prop to pass our component */}
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

        {/* RIGHT: Grade & Attendance Stack */}
        <div className={styles.rightPanel}>
          <div className={styles.graphCard}>
            <div className={styles.graphHeader}><IoStatsChartOutline /><h3>Grade Distribution</h3></div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="range" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip type="grade" />} cursor={{fill: '#f0f4f0'}} />
                <Bar dataKey="count" fill={brandGreen} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.graphCard}>
            <div className={styles.graphHeader}><IoTrendingUpOutline /><h3>Weekly Attendance</h3></div>
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

        {/* BOTTOM: Submission with Filter and Dates */}
        <div className={`${styles.graphCard} ${styles.bottomPanel}`}>
          <div className={styles.bottomHeaderRow}>
            <div className={styles.graphHeader}>
              <IoCheckmarkDoneOutline />
              <div className={styles.titleStack}>
                <h3>Submission Rates</h3>
                <span className={styles.subtitle}>{activeSubject} Overview</span>
              </div>
            </div>
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