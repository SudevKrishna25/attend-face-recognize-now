
// Types for our application

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  imageUrl?: string;
  faceEncoding?: number[]; // This would represent the face encoding data
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  timeIn: string;
  present: boolean;
}

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}
