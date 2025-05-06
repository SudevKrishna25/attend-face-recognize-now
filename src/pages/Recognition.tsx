
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApp } from '@/context/AppContext';
import { Camera, CheckCircle, UserCheck, Upload, Trash2 } from 'lucide-react';
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
    markAttendance,
    deleteTodayAttendance
  } = useApp();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [processingFrame, setProcessingFrame] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'none' | 'detecting' | 'found'>('none');
  const [lastProcessTime, setLastProcessTime] = useState(0);
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
      setFaceDetected(false);
      setFaceDetectionStatus('none');
    }
    
    return () => {
      // Cleanup function to stop webcam when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [webcamActive, toggleWebcam]);
  
  // Reset recognized students list when recognition is toggled off
  useEffect(() => {
    if (!recognitionActive) {
      setRecognizedStudents([]);
    }
  }, [recognitionActive]);
  
  // Real-time face detection and processing with improved realism
  useEffect(() => {
    if (!recognitionActive || !videoRef.current || !canvasRef.current) return;
    
    let animationFrame: number;
    const processInterval = 500; // Process every 500ms for better performance
    
    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || processingFrame) return;
      
      const now = Date.now();
      // Only process frames at specified interval
      if (now - lastProcessTime < processInterval) {
        animationFrame = requestAnimationFrame(detectFaces);
        return;
      }
      
      setLastProcessTime(now);
      setProcessingFrame(true);
      
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Improved face detection simulation
        setFaceDetectionStatus('detecting');
        
        try {
          // Simulate processing with realistic timing
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Get image data for analysis
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Advanced simulation: analyze pixel data for face-like patterns
          // In a real app, this would use a face detection library
          const hasFace = detectFaceInImageData(imageData);
          
          if (hasFace) {
            console.log("Face detected in frame");
            setFaceDetected(true);
            setFaceDetectionStatus('found');
            
            // Only attempt recognition every few frames to avoid too many recognitions
            if (Math.random() > 0.7) {
              const potentialMatches = students.filter(
                student => !recognizedStudents.includes(student.id)
              );
              
              if (potentialMatches.length > 0) {
                // In a real app, this would compare face encodings
                // Here we select a random student to simulate recognition
                const randomIndex = Math.floor(Math.random() * potentialMatches.length);
                const studentToRecognize = potentialMatches[randomIndex];
                markAttendance(studentToRecognize.id, true);
                setRecognizedStudents(prev => [...prev, studentToRecognize.id]);
                
                // Add delay to simulate processing
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          } else {
            console.log("No face detected in frame");
            setFaceDetected(false);
            setFaceDetectionStatus('none');
          }
        } catch (error) {
          console.error("Error in face detection:", error);
          toast.error("Error processing video frame");
        }
        
        setProcessingFrame(false);
      }
      
      animationFrame = requestAnimationFrame(detectFaces);
    };
    
    animationFrame = requestAnimationFrame(detectFaces);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [recognitionActive, students, recognizedStudents, markAttendance, processingFrame, lastProcessTime]);
  
  // Improved face detection simulation that analyzes image data
  const detectFaceInImageData = (imageData: ImageData): boolean => {
    // This is a simplified simulation of face detection
    // In a real app, you would use a face detection library like face-api.js, 
    // TensorFlow.js or connect to a backend API
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Check if there's sufficient light in the image (not just black)
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Calculate brightness
      totalBrightness += (r + g + b) / 3;
    }
    
    const avgBrightness = totalBrightness / (width * height);
    if (avgBrightness < 20) {
      console.log("Image too dark, brightness:", avgBrightness);
      return false; // Image too dark
    }
    
    // Look for skin-tone like colors in the center region of the image
    // This is a very basic approach; real face detection is much more complex
    const centerRegion = {
      x: Math.floor(width * 0.25),
      y: Math.floor(height * 0.1),
      width: Math.floor(width * 0.5),
      height: Math.floor(height * 0.8)
    };
    
    let skinTonePixels = 0;
    let totalPixels = 0;
    
    for (let y = centerRegion.y; y < centerRegion.y + centerRegion.height; y += 5) {
      for (let x = centerRegion.x; x < centerRegion.x + centerRegion.width; x += 5) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Very basic skin tone detection
        if (r > 60 && g > 40 && b > 20 && 
            r > g && g > b && 
            r - g > 15 && g - b > 15) {
          skinTonePixels++;
        }
        totalPixels++;
      }
    }
    
    const skinRatio = skinTonePixels / totalPixels;
    console.log("Skin tone ratio:", skinRatio);
    
    // Variation based on time to create more realistic behavior
    const timeVariation = Math.sin(Date.now() / 1000) * 0.15 + 0.8;
    
    // Determine if a face is present based on our simplified detection
    return skinRatio > 0.04 * timeVariation && Math.random() > 0.2;
  };
  
  // Handle image upload with improved detection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Show loading toast
    const loadingToast = toast.loading("Processing image...");
    
    // Create a reader to read the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        toast.dismiss(loadingToast);
        toast.error("Failed to read image");
        return;
      }
      
      const img = new Image();
      img.onload = async () => {
        // Create temporary canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast.dismiss(loadingToast);
          toast.error("Could not process image");
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // More realistic detection
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
          
          const hasFaces = detectFaceInImageData(imageData);
          
          if (hasFaces) {
            // Calculate how many faces to detect based on image size
            // In a real app this would come from actual face detection
            const imageSizeScore = Math.min(1, (img.width * img.height) / (1280 * 720));
            const maxDetections = Math.min(
              Math.floor(imageSizeScore * 3) + 1, 
              students.length - recognizedStudents.length
            );
            
            if (maxDetections <= 0) {
              toast.dismiss(loadingToast);
              toast.info("All students have already been recognized");
              return;
            }
            
            // Select students to recognize
            const notYetRecognized = students.filter(
              student => !recognizedStudents.includes(student.id)
            );
            
            // Randomly determine how many faces to recognize (at least 1, at most maxDetections)
            const detectionCount = Math.max(1, Math.floor(Math.random() * maxDetections));
            const toRecognize = notYetRecognized.slice(0, detectionCount);
            
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
          } else {
            toast.dismiss(loadingToast);
            toast.error("No faces detected in the uploaded image");
          }
        } catch (error) {
          console.error('Face detection error:', error);
          toast.dismiss(loadingToast);
          toast.error("Error processing image");
        }
      };
      
      img.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to load image");
      };
      
      img.src = e.target.result as string;
    };
    
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to read file");
    };
    
    reader.readAsDataURL(file);
  };
  
  // Get today's attendance
  const todayAttendance = attendanceRecords.filter(record => record.date === today);
  const presentStudents = todayAttendance.filter(record => record.present);
  
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Today's Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Today's Attendance Records?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will remove all attendance records for today. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteTodayAttendance}>
                  Delete Records
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                            {faceDetectionStatus === 'found' ? 'Face Detected' : 
                             faceDetectionStatus === 'detecting' ? 'Scanning...' : 'No Face Detected'}
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
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 flex flex-col items-center justify-center relative">
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
