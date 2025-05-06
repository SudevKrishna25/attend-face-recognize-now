
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Download, UserCheck, UserX } from 'lucide-react';

const Report = () => {
  const { students, attendanceRecords, exportAttendance } = useApp();
  const [date, setDate] = useState<Date>(new Date());

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  
  // Get attendance data for selected date
  const dateRecords = attendanceRecords.filter(record => record.date === selectedDateStr);
  const presentCount = dateRecords.filter(record => record.present).length;
  const absentCount = students.length - presentCount;
  const attendancePercentage = students.length > 0 
    ? Math.round((presentCount / students.length) * 100) 
    : 0;
    
  // Group students who are present and absent
  const presentStudents = dateRecords.filter(record => record.present);
  const absentStudents = students.filter(student => 
    !dateRecords.find(record => record.studentId === student.id && record.present)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Report</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(date, 'PPP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={() => exportAttendance(selectedDateStr)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentCount}</div>
            <p className="text-xs text-muted-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {attendancePercentage > 80 ? 'Good attendance rate' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Present Students</CardTitle>
            <CardDescription>Students who attended on {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            {presentStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Time In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presentStudents.map((record) => {
                    const student = students.find(s => s.id === record.studentId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>{student?.rollNumber || 'N/A'}</TableCell>
                        <TableCell>{record.timeIn || 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No students present on this date.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>Absent Students</CardTitle>
            <CardDescription>Students who were absent on {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            {absentStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-muted-foreground">All students were present on this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;
