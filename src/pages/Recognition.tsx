
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { Camera, CheckCircle, UserCheck, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Recognition: React.FC = () => {
  const { 
    students, 
    attendanceRecords, 
    webcamActive, 
    recognitionActive,
    toggleWebcam, 
    toggleRecognition,
    markAttendance
  } = useApp();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [processingFrame, setProcessingFrame] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Initialize webcam when activated
  useEffect(() => {
    if (webcamActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          toast.success("Camera connected successfully");
        })
        .catch(err => {
          console.error("Error accessing webcam:", err);
          toast.error("Failed to access webcam. Please check permissions.");
          toggleWebcam();
        });
    } else if (!webcamActive && videoRef.current && videoRef.current.srcObject) {
      // Stop webcam when deactivated
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    return () => {
      // Cleanup function to stop webcam when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [webcamActive, toggleWebcam]);
  
  // Real-time face detection and processing
  useEffect(() => {
    if (!recognitionActive || !videoRef.current || !canvasRef.current) return;
    
    let animationFrame: number;
    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || processingFrame) return;
      
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        setProcessingFrame(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Here we would normally perform face detection using a library like face-api.js
        // For this implementation, we'll simulate face detection
        simulateFaceDetection(canvas).then(facesDetected => {
          setFaceDetected(facesDetected.length > 0);
          
          // If faces detected, try to recognize students
          if (facesDetected.length > 0) {
            facesDetected.forEach(face => {
              const potentialMatches = students.filter(
                student => !recognizedStudents.includes(student.id)
              );
              
              if (potentialMatches.length > 0) {
                // For simulation, randomly recognize a student every few seconds
                if (Math.random() > 0.95) {
                  const randomIndex = Math.floor(Math.random() * potentialMatches.length);
                  const studentToRecognize = potentialMatches[randomIndex];
                  markAttendance(studentToRecognize.id, true);
                  setRecognizedStudents(prev => [...prev, studentToRecognize.id]);
                }
              }
            });
          }
          
          setProcessingFrame(false);
        });
      }
      
      animationFrame = requestAnimationFrame(detectFaces);
    };
    
    animationFrame = requestAnimationFrame(detectFaces);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [recognitionActive, students, recognizedStudents, markAttendance, processingFrame]);
  
  // Simulate face detection
  const simulateFaceDetection = async (canvas: HTMLCanvasElement): Promise<any[]> => {
    // This is a placeholder for actual face detection
    // In a real app, you would use a library like face-api.js here
    
    // For now, just simulate detecting faces randomly
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
    
    if (Math.random() > 0.2) {
      // Simulate detecting 1-2 faces
      const faceCount = Math.floor(Math.random() * 2) + 1;
      return Array(faceCount).fill({ detection: { box: { x: 100, y: 100, width: 100, height: 100 } } });
    }
    
    return [];
  };
  
  // Get today's attendance
  const todayAttendance = attendanceRecords.filter(record => record.date === today);
  const presentStudents = todayAttendance.filter(record => record.present);
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Show loading toast
    const loadingToast = toast.loading("Processing image...");
    
    // Create a reader to read the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      
      const img = new Image();
      img.onload = async () => {
        // Create temporary canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Simulate face detection on the loaded image
        try {
          // In a real app, you would use actual face recognition here
          // For simulation, we'll randomly select 1-3 students
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
          
          const count = Math.floor(Math.random() * 3) + 1;
          const notYetRecognized = students.filter(
            student => !recognizedStudents.includes(student.id)
          );
          
          const toRecognize = notYetRecognized.slice(0, count);
          
          if (toRecognize.length === 0) {
            toast.dismiss(loadingToast);
            toast.info("No new students recognized in the image");
            return;
          }
          
          // Mark selected students as present
          toRecognize.forEach(student => {
            markAttendance(student.id, true);
          });
          
          // Update recognized students list
          setRecognizedStudents(prev => [
            ...prev,
            ...toRecognize.map(student => student.id)
          ]);
          
          toast.dismiss(loadingToast);
          toast.success(`Recognized ${toRecognize.length} student(s) in the image`);
        } catch (error) {
          console.error('Face detection error:', error);
          toast.dismiss(loadingToast);
          toast.error("Error processing image");
        }
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Face Recognition</h1>
        <div className="flex gap-2">
          <Button 
            variant={webcamActive ? "destructive" : "outline"}
            onClick={toggleWebcam}
          >
            {webcamActive ? "Stop Camera" : "Start Camera"}
          </Button>
          <Button
            variant={recognitionActive ? "destructive" : "default"}
            disabled={!webcamActive && !recognitionActive}
            onClick={toggleRecognition}
          >
            {recognitionActive ? "Stop Recognition" : "Start Recognition"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="camera">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera Recognition</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="space-y-4 mt-4">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>Live Face Recognition</CardTitle>
              <CardDescription>
                Use your webcam to automatically detect and mark student attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    {webcamActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        
                        {faceDetected && (
                          <div className="absolute inset-0 border-4 border-green-500 rounded-md animate-pulse-slow"></div>
                        )}
                        
                        {recognitionActive && (
                          <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {faceDetected ? 'Face Detected' : 'No Face Detected'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 mb-2 text-muted-foreground/50" />
                        <div>Camera is off</div>
                        <div className="text-sm">Click "Start Camera" to begin</div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="text-sm text-muted-foreground">
                    {recognitionActive 
                      ? "Face recognition is active. Recognized students will be marked present automatically."
                      : "Click 'Start Recognition' to begin identifying students and taking attendance."}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-medium">Recognition Status</div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {presentStudents.length > 0 ? (
                      presentStudents.map(record => (
                        <div 
                          key={record.id}
                          className="flex items-center p-2 rounded-md bg-muted"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <div className="flex-1">
                            <div className="font-medium">{record.studentName}</div>
                            <div className="text-xs text-muted-foreground">
                              Marked present at {record.timeIn}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No students recognized yet today
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm font-medium">Today's Attendance</div>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-5 w-5 text-brand-500 mr-2" />
                      <div className="text-2xl font-bold">
                        {presentStudents.length}/{students.length}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {presentStudents.length} students present out of {students.length} total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>Image Upload Recognition</CardTitle>
              <CardDescription>
                Upload an image with student faces to automatically mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <div className="text-center">
                      <p className="font-medium">Click to upload an image</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or drag and drop image here
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP
                  </div>
                  
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                    <p className="font-medium mb-1">For best results:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Upload clear, well-lit photos</li>
                      <li>Ensure faces are clearly visible</li>
                      <li>Group photos work best when faces are front-facing</li>
                      <li>Higher resolution images improve recognition accuracy</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="font-medium">Recognition Status</div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {presentStudents.length > 0 ? (
                      presentStudents.map(record => (
                        <div 
                          key={record.id}
                          className="flex items-center p-2 rounded-md bg-muted"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <div className="flex-1">
                            <div className="font-medium">{record.studentName}</div>
                            <div className="text-xs text-muted-foreground">
                              Marked present at {record.timeIn}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No students recognized yet today
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm font-medium">Today's Attendance</div>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-5 w-5 text-brand-500 mr-2" />
                      <div className="text-2xl font-bold">
                        {presentStudents.length}/{students.length}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {presentStudents.length} students present out of {students.length} total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recognition;
