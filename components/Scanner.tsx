import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, CheckCircle, AlertTriangle, WifiOff } from 'lucide-react';
import { Button } from './ui/Button';
import { GeminiService } from '../services/geminiService';
import { ScannedData } from '../types';
import { TRANSLATIONS, COLORS } from '../constants';

interface ScannerProps {
  onScanComplete: (data: ScannedData, mode: 'ADD' | 'SELL') => void;
  onClose: () => void;
  language: 'en' | 'bn';
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose, language }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfidenceModal, setShowConfidenceModal] = useState(false);
  const [pendingData, setPendingData] = useState<ScannedData | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const t = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;
  const tSub = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].bn : TRANSLATIONS[key].en;

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const capture = useCallback(() => {
    if (isOffline) {
      alert(language === 'en' ? "Offline: AI Scanning unavailable." : "অফলাইন: AI স্ক্যানিং অনুপলব্ধ।");
      return;
    }

    // Haptic Feedback
    if (navigator.vibrate) navigator.vibrate(50);

    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      analyze(imageSrc);
    }
  }, [webcamRef, isOffline, language]);



  const analyze = async (imageSrc: string) => {
    setIsAnalyzing(true);
    try {
      const data = await GeminiService.analyzeProductImage(imageSrc);

      if (data) {
        // Offline or Failed case (Confidence 0)
        if (data.confidence === 0) {
          // Error/Offline vibrate
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          // Don't alert here, let the offline banner speak, just pass through
          onScanComplete(data, 'ADD');
          return;
        }

        // Low Confidence Case (< 0.8)
        if (data.confidence < 0.8) {
          setPendingData(data);
          setShowConfidenceModal(true);
          // Warning vibrate
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
          // High Confidence
          // Success vibrate
          if (navigator.vibrate) navigator.vibrate(100);
          onScanComplete(data, 'ADD');
        }
      } else {
        // Fallback if AI fails completely (null result)
        onScanComplete({ name: "", confidence: 0, image: imageSrc }, 'ADD');
      }
    } catch (e) {
      console.error(e);
      onScanComplete({ name: "", confidence: 0, image: imageSrc }, 'ADD');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retake = () => {
    setImgSrc(null);
    setIsAnalyzing(false);
    setShowConfidenceModal(false);
    setPendingData(null);
  };

  const handleConfirm = () => {
    if (pendingData) {
      onScanComplete(pendingData, 'ADD');
    }
  };

  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  };

  const themeColor = COLORS.secondary; // Always green for ADD

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <div className="absolute top-16 left-0 right-0 z-20 flex justify-center animate-in slide-in-from-top-4">
          <div className="bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-red-400/30">
            <WifiOff size={16} className="text-white" />
            <span className="text-white font-bold text-sm">{t('offlineMode')}</span>
          </div>
        </div>
      )}

      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="absolute inset-0 w-full h-full object-cover"
            disablePictureInPicture={false}
            forceScreenshotSourceSize={true}
            imageSmoothing={true}
            mirrored={false}
            onUserMedia={(mediaStream) => console.log('Webcam started', mediaStream.id)}
            onUserMediaError={(err) => console.error('Webcam error', err)}
            screenshotQuality={0.8}
          />
        ) : (
          <img src={imgSrc} alt="captured" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}

        {/* Overlay Scanner Guides */}
        {!imgSrc && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ${isAnalyzing ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
            <div className="w-64 h-64 border-4 rounded-3xl opacity-90 relative transition-colors duration-300" style={{ borderColor: themeColor }}>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 -mt-1 -ml-1 rounded-tl-lg" style={{ borderColor: themeColor }}></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 -mt-1 -mr-1 rounded-tr-lg" style={{ borderColor: themeColor }}></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 -mb-1 -ml-1 rounded-bl-lg" style={{ borderColor: themeColor }}></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 -mb-1 -mr-1 rounded-br-lg" style={{ borderColor: themeColor }}></div>

              {/* Scanning Animation Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}

        {/* Loading Overlay with Pulse */}
        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#4CAF50] opacity-30 animate-ping"></div>
              <div className="relative rounded-full h-16 w-16 border-t-4 border-b-4 flex items-center justify-center mb-6 animate-spin" style={{ borderColor: themeColor }}></div>
            </div>
            <p className="text-xl font-bold animate-pulse" style={{ color: themeColor }}>{t('identifying')}</p>
            <p className="text-white text-sm font-bn">{tSub('identifying')}</p>
          </div>
        )}

        {/* Low Confidence Modal */}
        {showConfidenceModal && pendingData && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in zoom-in-95 duration-200">
            <div className="bg-[#1E1E1E] w-full max-w-sm rounded-[32px] p-6 border border-[#333] shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 text-yellow-500 animate-bounce">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{t('confidenceLow')}</h3>
                <p className="text-gray-400 text-sm">{t('confidenceMessage')}</p>
                <div className="mt-4 px-4 py-2 bg-[#2A2A2A] rounded-xl border border-[#333]">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Detected:</span>
                  <p className="text-white font-bold">{pendingData.name || "Unknown"}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="flex-1 py-4 bg-[#2A2A2A] rounded-2xl font-bold text-white hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  {t('retake')}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-4 bg-[#FF9800] rounded-2xl font-bold text-black hover:bg-[#F57C00] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#121212] p-6 pb-8 space-y-4">
        {!imgSrc ? (
          <div className="w-full">
            <button
              onClick={capture}
              className="w-full h-20 rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg font-bold text-lg uppercase tracking-wider text-black bg-[#4CAF50]"
            >
              <Camera size={28} />
              <span>{t('scan')}</span>
            </button>
            <p className="text-center text-gray-500 mt-2 font-bn text-sm">
              {tSub('scan')}
            </p>
          </div>
        ) : !showConfidenceModal && (
          <div className="flex gap-4">
            <Button
              labelEn={TRANSLATIONS.retake.en}
              labelBn={TRANSLATIONS.retake.bn}
              onClick={retake}
              variant="secondary"
              icon={<RefreshCw size={24} />}
              language={language}
            />
          </div>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};