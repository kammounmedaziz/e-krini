import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@ui';
import { Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const FaceCaptureModal = ({ isOpen, onClose, onComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [totalFrames] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const startFaceCapture = async () => {
    // Get user information from localStorage
    const userData = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('FaceCaptureModal - Tokens and user data check:', {
      hasUserData: !!userData,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    if (!userData) {
      console.error('FaceCaptureModal - No user data in localStorage');
      toast.error('User session not found. Please log in again.');
      return;
    }

    if (!accessToken) {
      console.error('FaceCaptureModal - No access token in localStorage');
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
      console.log('FaceCaptureModal - Parsed user data:', user);
    } catch (parseError) {
      console.error('FaceCaptureModal - Error parsing user data:', parseError);
      toast.error('User session corrupted. Please log in again.');
      return;
    }

    console.log('FaceCaptureModal - Starting face capture for user:', user.username || user.email);

    setIsCapturing(true);
    setCapturedFrames(0);
    setError(null);

    try {
      // Simulate capturing frames for user feedback
      for (let i = 0; i < totalFrames; i++) {
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay between frames

        const frame = captureFrame();
        if (frame) {
          setCapturedFrames(i + 1);
        }
      }

      setIsProcessing(true);

      console.log('FaceCaptureModal - Calling enableFaceAuth API (user ID will be extracted from token)');
      // Call the backend enableFaceAuth endpoint (user ID comes from authenticated token)
      const response = await fetch('http://localhost:3001/api/v1/auth/enable-face-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({}) // No need to send userId, backend gets it from token
      });

      console.log('FaceCaptureModal - Response status:', response.status);
      const result = await response.json();
      console.log('FaceCaptureModal - Response data:', result);

      if (result.success) {
        toast.success('Face registration completed successfully!');
        onComplete();
        onClose();
      } else {
        throw new Error(result.error?.message || result.error || 'Face registration failed');
      }

    } catch (err) {
      console.error('FaceCaptureModal - Face registration error:', err);
      setError(err.message || 'Face registration failed. Please try again.');
      toast.error('Face registration failed. Please try again.');
    } finally {
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Face Authentication Setup
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position your face in the center and follow the instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Camera View */}
          <div className="relative mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white/70" />
                  </div>
                </div>
              </div>

              {/* Status overlay */}
              {(isCapturing || isProcessing) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    {isProcessing ? (
                      <>
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-lg font-semibold">Processing...</p>
                        <p className="text-sm opacity-75">Please wait while we register your face</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-semibold">Capturing...</p>
                        <p className="text-sm opacity-75">Frame {capturedFrames} of {totalFrames}</p>
                        <div className="w-full max-w-xs bg-white/20 rounded-full h-2 mt-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(capturedFrames / totalFrames) * 100}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Instructions:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Position your face in the center of the circle
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Ensure good lighting and remove glasses if possible
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Keep your head still and look directly at the camera
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                The system will capture frames and register your face
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                This process may take a few moments to complete
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCapturing || isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={startFaceCapture}
              disabled={isCapturing || isProcessing || !!error}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isCapturing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Capturing...
                </>
              ) : isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Face Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FaceCaptureModal;