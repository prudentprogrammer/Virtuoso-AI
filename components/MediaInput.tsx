import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Mic, StopCircle, RefreshCw, X, Play, Pause } from 'lucide-react';
import { MediaFile } from '../types';

interface MediaInputProps {
  label: string;
  media: MediaFile;
  onChange: (media: MediaFile) => void;
  disabled?: boolean;
}

const MediaInput: React.FC<MediaInputProps> = ({ label, media, onChange, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup URL on unmount or change
    return () => {
      if (media.previewUrl && media.source === 'record') {
        URL.revokeObjectURL(media.previewUrl);
      }
    };
  }, [media.previewUrl, media.source]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onChange({
        ...media,
        file,
        previewUrl: url,
        type: file.type.startsWith('video') ? 'video' : 'audio',
        source: 'upload'
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], "recorded_practice.webm", { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        onChange({
          ...media,
          file,
          previewUrl: url,
          type: 'video',
          source: 'record'
        });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        chunksRef.current = [];
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      
      // Timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);

    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRecordingTime(0);
      }
    }
  };

  const clearMedia = () => {
    onChange({
      ...media,
      file: null,
      previewUrl: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlayback = () => {
    if (videoPreviewRef.current) {
      if (videoPreviewRef.current.paused) {
        videoPreviewRef.current.play();
        setIsPlaying(true);
      } else {
        videoPreviewRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative flex flex-col h-full bg-surface rounded-xl border-2 ${isRecording ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-surfaceHighlight'} overflow-hidden transition-all duration-300`}>
      {/* Header Label */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${media.file ? 'bg-green-500' : 'bg-gray-500'}`} />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">{label}</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative bg-black/20">
        {!media.file && !isRecording && (
          <div className="text-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-surfaceHighlight hover:bg-zinc-700 transition-all border border-zinc-700 hover:border-zinc-600 disabled:opacity-50"
              >
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-primary mb-2 transition-colors" />
                <span className="text-xs text-zinc-400">Upload</span>
              </button>
              
              <button
                onClick={startRecording}
                disabled={disabled}
                className="group flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-surfaceHighlight hover:bg-zinc-700 transition-all border border-zinc-700 hover:border-zinc-600 disabled:opacity-50"
              >
                <Video className="w-8 h-8 text-zinc-400 group-hover:text-red-400 mb-2 transition-colors" />
                <span className="text-xs text-zinc-400">Record</span>
              </button>
            </div>
            <p className="text-zinc-500 text-sm">Select a video or audio file to begin</p>
          </div>
        )}

        {isRecording && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center z-20">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
               <Mic className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-4xl font-mono font-bold text-white mb-8">
              {formatTimer(recordingTime)}
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
            >
              <StopCircle className="w-5 h-5" />
              Stop Recording
            </button>
          </div>
        )}

        {media.file && !isRecording && (
          <div className="relative w-full h-full flex flex-col">
            <video
              ref={videoPreviewRef}
              src={media.previewUrl || undefined}
              className="w-full h-full object-cover"
              playsInline
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-300 flex items-center justify-center group">
              <button
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current ml-1" />}
              </button>
              
              <button 
                onClick={clearMedia}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*,audio/*"
        className="hidden"
      />
    </div>
  );
};

export default MediaInput;
