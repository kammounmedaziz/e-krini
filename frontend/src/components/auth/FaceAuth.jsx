import React, { useState, useRef, useCallback } from 'react';
import { Camera, CameraOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@ui';

const FaceAuth = ({ onSuccess, onError, mode = 'login' }) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setStatus('Camera started. Please look at the camera.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      onError('Unable to access camera. Please check permissions.');
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setFaceDetected(false);
    setStatus('');
  }, []);

  const captureAndVerify = useCallback(async () => {
    if (!videoRef.current || !isActive) return;

    setIsProcessing(true);
    setStatus('Processing face authentication...');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to backend for verification
      const response = await fetch('/api/v1/auth/login-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const result = await response.json();

      if (result.success) {
        setStatus('Face authentication successful!');
        setFaceDetected(true);
        onSuccess(result);
      } else {
        setStatus('Face not recognized. Please try again.');
        setFaceDetected(false);
        onError(result.error || 'Face authentication failed');
      }
    } catch (err) {
      console.error('Face verification error:', err);
      setStatus('Error during face verification.');
      onError('Face verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [isActive, onSuccess, onError]);

  const handleStartFaceAuth = () => {
    if (mode === 'register') {
      // For registration, we'll handle this differently
      onSuccess({ faceAuthEnabled: true });
    } else {
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
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {faceDetected ? (
                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {status}
                </p>
                {isProcessing && (
                  <Loader className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={captureAndVerify}
                  disabled={isProcessing}
                  className="flex-1"
                  variant="primary"
                >
                  {isProcessing ? 'Verifying...' : 'Verify Face'}
                </Button>
                <Button
                  type="button"
                  onClick={stopCamera}
                  variant="outline"
                  className="px-4"
                >
                  <CameraOff className="w-4 h-4" />
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