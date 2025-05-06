
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, UserCheck, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { students, attendanceSummary, exportAttendance } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Get today's attendance summary if it exists
  const todaySummary = attendanceSummary.find(summary => summary.date === today);
  
  // Prepare data for chart
  const chartData = attendanceSummary.map(summary => ({
    date: format(new Date(summary.date), 'MMM dd'),
    present: summary.presentCount,
    absent: summary.absentCount,
    percentage: Math.round((summary.presentCount / summary.totalStudents) * 100),
  }));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button 
          onClick={() => exportAttendance()} 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export All Attendance
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaySummary 
                ? `${todaySummary.presentCount}/${todaySummary.totalStudents}` 
                : '0/0'}
            </div>
            <p className="text-xs text-muted-foreground">Students present today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaySummary 
                ? `${Math.round((todaySummary.presentCount / todaySummary.totalStudents) * 100)}%` 
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Average for today</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
          <CardDescription>View attendance trends for the past week</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="present"
                name="Present"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="absent"
                name="Absent"
                stroke="#ff7782"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentage"
                name="Attendance %"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
