import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Student, AttendanceRecord, AttendanceSummary } from '@/lib/types';
import { toast } from 'sonner';

interface AppContextType {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  attendanceSummary: AttendanceSummary[];
  webcamActive: boolean;
  recognitionActive: boolean;
  addStudent: (student: Omit<Student, 'id' | 'registeredAt'>) => void;
  removeStudent: (id: string) => void;
  markAttendance: (studentId: string, present: boolean) => void;
  toggleWebcam: () => void;
  toggleRecognition: () => void;
  exportAttendance: (date?: string) => void;
  faceDetected: boolean;
  recognizedFace: string | null;
  deleteTodayAttendance: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recognizedFace, setRecognizedFace] = useState<string | null>(null);
  
  // Load data from local storage on app initialization
  useEffect(() => {
    const loadedStudents = localStorage.getItem('students');
    const loadedAttendance = localStorage.getItem('attendanceRecords');
    
    if (loadedStudents) {
      try {
        setStudents(JSON.parse(loadedStudents));
      } catch (error) {
        console.error('Failed to parse students from localStorage:', error);
      }
    }
    
    if (loadedAttendance) {
      try {
        setAttendanceRecords(JSON.parse(loadedAttendance));
      } catch (error) {
        console.error('Failed to parse attendance from localStorage:', error);
      }
    }
  }, []);
  
  // Save data to local storage when it changes
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);
  
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords]);

  // Update attendance summary whenever attendance records change
  useEffect(() => {
    const uniqueDates = [...new Set(attendanceRecords.map(record => record.date))];
    
    const summary = uniqueDates.map(date => {
      const recordsForDate = attendanceRecords.filter(record => record.date === date);
      const presentCount = recordsForDate.filter(record => record.present).length;
      
      return {
        date,
        totalStudents: students.length,
        presentCount,
        absentCount: students.length - presentCount,
      };
    });
    
    setAttendanceSummary(summary);
  }, [attendanceRecords, students.length]);

  const addStudent = (student: Omit<Student, 'id' | 'registeredAt'>) => {
    const newStudent: Student = {
      ...student,
      id: uuidv4(),
      registeredAt: new Date().toISOString(),
    };
    
    setStudents(prev => [...prev, newStudent]);
    toast.success(`${student.name} has been added successfully!`);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    // Also remove their attendance records
    setAttendanceRecords(prev => 
      prev.filter(record => record.studentId !== id)
    );
    toast.success("Student removed successfully");
  };

  const markAttendance = (studentId: string, present: boolean) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const today = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    // Check if an attendance record for this student exists for today
    const existingRecord = attendanceRecords.find(
      record => record.studentId === studentId && record.date === today
    );
    
    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === existingRecord.id 
            ? { ...record, present, timeIn: present ? timeNow : '' }
            : record
        )
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: uuidv4(),
        studentId,
        studentName: student.name,
        date: today,
        timeIn: present ? timeNow : '',
        present,
      };
      
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
    
    if (present) {
      setRecognizedFace(student.name);
      setTimeout(() => setRecognizedFace(null), 3000);
      toast.success(`Attendance marked for ${student.name}`);
    }
  };

  const toggleWebcam = () => {
    setWebcamActive(prev => !prev);
  };

  const toggleRecognition = () => {
    if (!webcamActive && !recognitionActive) {
      setWebcamActive(true);
    }
    setRecognitionActive(prev => !prev);
  };

  const exportAttendance = (date?: string) => {
    const filteredRecords = date 
      ? attendanceRecords.filter(record => record.date === date)
      : attendanceRecords;
    
    if (filteredRecords.length === 0) {
      toast.error("No attendance records to export");
      return;
    }
    
    // Create CSV content
    let csvContent = "Date,Student Name,Roll Number,Time In,Status\n";
    
    filteredRecords.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      const rollNumber = student ? student.rollNumber : "N/A";
      
      csvContent += `${record.date},${record.studentName},${rollNumber},${record.timeIn || "N/A"},${record.present ? "Present" : "Absent"}\n`;
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', date ? `attendance_${date}.csv` : 'attendance_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Attendance exported successfully");
  };

  // New function to delete today's attendance records
  const deleteTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => prev.filter(record => record.date !== today));
    toast.success("Today's attendance records have been deleted");
  };

  return (
    <AppContext.Provider
      value={{
        students,
        attendanceRecords,
        attendanceSummary,
        webcamActive,
        recognitionActive,
        addStudent,
        removeStudent,
        markAttendance,
        toggleWebcam,
        toggleRecognition,
        exportAttendance,
        faceDetected,
        recognizedFace,
        deleteTodayAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
