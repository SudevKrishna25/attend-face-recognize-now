
import { Student, AttendanceRecord, AttendanceSummary } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Students
export const mockStudents: Student[] = [
  {
    id: uuidv4(),
    name: 'John Doe',
    rollNumber: 'CS2021001',
    imageUrl: '/placeholder.svg',
    registeredAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    rollNumber: 'CS2021002',
    imageUrl: '/placeholder.svg',
    registeredAt: new Date(2023, 0, 16).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Michael Johnson',
    rollNumber: 'CS2021003',
    imageUrl: '/placeholder.svg',
    registeredAt: new Date(2023, 0, 17).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Emily Davis',
    rollNumber: 'CS2021004',
    imageUrl: '/placeholder.svg',
    registeredAt: new Date(2023, 0, 18).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Robert Wilson',
    rollNumber: 'CS2021005',
    imageUrl: '/placeholder.svg',
    registeredAt: new Date(2023, 0, 19).toISOString(),
  },
];

// Generate mock attendance records
const generateMockAttendanceRecords = () => {
  const records: AttendanceRecord[] = [];
  
  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    mockStudents.forEach(student => {
      // Randomly mark students as present or absent
      const present = Math.random() > 0.2;
      
      if (present) {
        // Generate a random check-in time between 8:00 AM and 9:30 AM
        const hour = 8;
        const minute = Math.floor(Math.random() * 90);
        const timeIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        records.push({
          id: uuidv4(),
          studentId: student.id,
          studentName: student.name,
          date: dateStr,
          timeIn,
          present,
        });
      } else {
        records.push({
          id: uuidv4(),
          studentId: student.id,
          studentName: student.name,
          date: dateStr,
          timeIn: '',
          present,
        });
      }
    });
  }
  
  return records;
};

export const mockAttendanceRecords = generateMockAttendanceRecords();

// Generate attendance summary
export const generateAttendanceSummary = (): AttendanceSummary[] => {
  const summary: AttendanceSummary[] = [];
  const uniqueDates = [...new Set(mockAttendanceRecords.map(record => record.date))];
  
  uniqueDates.forEach(date => {
    const recordsForDate = mockAttendanceRecords.filter(record => record.date === date);
    const presentCount = recordsForDate.filter(record => record.present).length;
    
    summary.push({
      date,
      totalStudents: mockStudents.length,
      presentCount,
      absentCount: mockStudents.length - presentCount,
    });
  });
  
  return summary;
};

export const mockAttendanceSummary = generateAttendanceSummary();
