
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

const Register: React.FC = () => {
  const { addStudent, webcamActive, toggleWebcam } = useApp();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize webcam when activated
  React.useEffect(() => {
    if (webcamActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
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
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
        toast.success("Image captured successfully");
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !rollNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!capturedImage) {
      toast.error("Please capture a face image");
      return;
    }
    
    addStudent({
      name,
      rollNumber,
      imageUrl: capturedImage,
    });
    
    // Reset form
    setName('');
    setRollNumber('');
    setCapturedImage(null);
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Register Student</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Student Registration</CardTitle>
          <CardDescription>
            Register a new student by capturing their face and providing basic information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter student's full name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rollNumber" className="text-right">
                  Roll Number
                </Label>
                <Input
                  id="rollNumber"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter student's roll number"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-sm font-medium">Face Capture</div>
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  {webcamActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image captured</div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={webcamActive ? "destructive" : "outline"}
                    onClick={toggleWebcam}
                    className="flex-1"
                  >
                    {webcamActive ? "Stop Camera" : "Start Camera"}
                  </Button>
                  {webcamActive && (
                    <Button
                      type="button"
                      onClick={captureImage}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Registration Instructions</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Enter the student's full name and roll number</li>
                  <li>2. Click "Start Camera" to activate webcam</li>
                  <li>3. Position the student's face in the frame</li>
                  <li>4. Click "Capture" to take a photo</li>
                  <li>5. Review the captured image</li>
                  <li>6. Click "Register Student" to complete registration</li>
                </ul>
                <div className="mt-6 text-sm text-muted-foreground">
                  For optimal face recognition:
                  <ul className="list-disc list-inside mt-2">
                    <li>Ensure good lighting on the face</li>
                    <li>Remove glasses or hats if possible</li>
                    <li>Capture front-facing neutral expression</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <CardFooter className="px-0 flex justify-end">
              <Button type="submit" disabled={!capturedImage || !name || !rollNumber}>
                Register Student
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
