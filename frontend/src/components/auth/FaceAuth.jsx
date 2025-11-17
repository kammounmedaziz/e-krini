import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@ui';
import { authAPI } from '@api';

const FaceAuth = ({ onSuccess, onError, mode = 'login' }) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsActive(false);
    setFaceDetected(false);
    setStatus('');
    setCountdown(10);
    setIsProcessing(false);
  }, []);

  const startAutoScan = useCallback(async () => {
    console.log('Starting auto scan...');
    setIsProcessing(true);
    setStatus('Position your face in the circle');
    setCountdown(10);

    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        console.log('Countdown:', prev);
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-verify after 10 seconds
    timeoutRef.current = setTimeout(async () => {
      console.log('10 seconds elapsed, capturing frame...');
      try {
        setStatus('Capturing face image...');

        // Capture frame from video
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Frame captured, size:', imageData.length, 'characters');

        // Save frame to localStorage for debugging (optional)
        localStorage.setItem('capturedFaceFrame', imageData);
        console.log('Frame saved to localStorage as "capturedFaceFrame"');

        setStatus('Verifying face...');

        // Call face login with captured image
        const response = await authAPI.loginWithFace(imageData);
        console.log('Face login response:', response);

        if (response.success) {
          setStatus('Face authenticated successfully!');
          setFaceDetected(true);
          stopCamera();
          onSuccess(response);
        } else {
          setStatus('Face not recognized. Please try again.');
          setFaceDetected(false);
          setCountdown(10);
          setIsProcessing(false);
          onError(response.error || 'Face authentication failed');
        }
      } catch (err) {
        console.error('Face verification error:', err);
        setStatus('Error during face verification.');
        setCountdown(10);
        setIsProcessing(false);
        onError(err.message || 'Face verification failed. Please try again.');
      }
    }, 10000);
  }, [onSuccess, onError]);  const startCamera = useCallback(async () => {
    console.log('startCamera called');
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      console.log('Camera access granted, stream:', stream);

      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setStatus('Camera started. Please look at the camera.');

        // Wait for video to be ready before starting scan
        const videoElement = videoRef.current;
        console.log('Video element readyState:', videoElement.readyState);

        const onVideoReady = () => {
          console.log('Video loaded, starting scan...');
          videoElement.removeEventListener('loadedmetadata', onVideoReady);
          setTimeout(() => {
            startAutoScan();
          }, 500);
        };

        if (videoElement.readyState >= 2) {
          // Video is already loaded
          console.log('Video already loaded, starting scan...');
          setTimeout(() => {
            startAutoScan();
          }, 500);
        } else {
          // Wait for video to load
          console.log('Waiting for video to load...');
          videoElement.addEventListener('loadedmetadata', onVideoReady);

          // Fallback timeout in case loadedmetadata doesn't fire
          setTimeout(() => {
            if (!isProcessing) {
              console.log('Fallback: starting scan after timeout...');
              startAutoScan();
            }
          }, 2000);
        }
      } else {
        console.error('Video element not found');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      onError('Unable to access camera. Please check permissions.');
    }
  }, [onError, startAutoScan]);  const handleStartFaceAuth = () => {
    console.log('handleStartFaceAuth called, mode:', mode);
    if (mode === 'register') {
      // For registration, we'll handle this differently
      onSuccess({ faceAuthEnabled: true });
    } else {
      console.log('Calling startCamera...');
      startCamera();
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {mode === 'login' ? 'Face Authentication' : 'Enable Face Authentication'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login'
            ? 'Use your face to securely log in'
            : 'Register your face for faster login'
          }
        </p>
      </div>

      {mode === 'login' && (
        <div className="space-y-4">
          {!isActive ? (
            <Button
              type="button"
              onClick={handleStartFaceAuth}
              className="w-full"
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Face Login
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-dark-600"
                  style={{ maxHeight: '300px' }}
                  onLoadedMetadata={() => console.log('Video loaded metadata')}
                  onCanPlay={() => console.log('Video can play')}
                  onPlay={() => console.log('Video started playing')}
                />
                
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    {/* Outer circle guide */}
                    <div className="w-48 h-48 border-4 border-white/50 rounded-full"></div>
                    {/* Inner circle guide */}
                    <div className="absolute inset-4 border-2 border-white/30 rounded-full"></div>
                    
                    {/* Countdown display */}
                    {countdown > 0 && isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl font-bold text-white drop-shadow-lg">
                          {countdown}
                        </div>
                      </div>
                    )}
                    
                    {/* Status icon */}
                    <div className="absolute top-2 right-2">
                      {faceDetected ? (
                        <CheckCircle className="w-8 h-8 text-green-500 bg-white rounded-full" />
                      ) : countdown === 0 ? (
                        <Loader className="w-8 h-8 text-blue-500 animate-spin bg-white rounded-full p-1" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {isProcessing && countdown > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {status}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full"
                >
                  <CameraOff className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const frame = localStorage.getItem('capturedFaceFrame');
                    if (frame) {
                      const link = document.createElement('a');
                      link.href = frame;
                      link.download = 'captured_face_' + Date.now() + '.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert('No frame captured yet. Complete the face scan first.');
                    }
                  }}
                  variant="secondary"
                  className="px-4"
                >
                  Download Frame
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    console.log('Fetching stored face images...');
                    try {
                      const response = await authAPI.getFaceImages();
                      console.log('Stored face images:', response);
                      if (response.success && response.data.faceImages.length > 0) {
                        alert(`Found ${response.data.totalImages} stored face images in database!`);
                        // Show the first image
                        const firstImage = response.data.faceImages[0];
                        if (firstImage.data) {
                          const newWindow = window.open();
                          newWindow.document.write(`<h2>Stored Face Image</h2><img src="${firstImage.data}" style="max-width: 100%; height: auto;" /><p>Captured: ${new Date(firstImage.capturedAt).toLocaleString()}</p>`);
                          newWindow.document.title = 'Stored Face Image';
                        }
                      } else {
                        alert('No face images found in database. Complete a face scan first.');
                      }
                    } catch (err) {
                      console.error('Error fetching face images:', err);
                      alert('Error fetching face images: ' + err.message);
                    }
                  }}
                  variant="secondary"
                  className="px-4"
                >
                  View Stored
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    console.log('Clearing stored face images...');
                    try {
                      const response = await authAPI.getFaceImages();
                      if (response.success && response.data.faceImages.length > 0) {
                        // Delete all images
                        for (const image of response.data.faceImages) {
                          await authAPI.deleteFaceImage(image._id);
                        }
                        alert('All stored face images cleared from database!');
                      } else {
                        alert('No face images to clear.');
                      }
                    } catch (err) {
                      console.error('Error clearing face images:', err);
                      alert('Error clearing face images: ' + err.message);
                    }
                  }}
                  variant="danger"
                  className="px-4"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'register' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Camera className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Face Registration
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your face will be registered during account creation
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleStartFaceAuth}
            className="w-full"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Enable Face Authentication
          </Button>
        </div>
      )}
    </div>
  );
};

export default FaceAuth;