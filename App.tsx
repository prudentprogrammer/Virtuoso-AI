import React, { useState } from 'react';
import { Sparkles, Music4, Info } from 'lucide-react';
import MediaInput from './components/MediaInput';
import AnalysisView from './components/AnalysisView';
import { analyzePerformance } from './services/geminiService';
import { MediaFile, AppState, AnalysisResult } from './types';
import { SAMPLE_CONTEXT_PROMPTS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [teacherMedia, setTeacherMedia] = useState<MediaFile>({
    id: 'teacher', file: null, previewUrl: null, type: 'video', source: 'upload'
  });
  const [studentMedia, setStudentMedia] = useState<MediaFile>({
    id: 'student', file: null, previewUrl: null, type: 'video', source: 'upload'
  });
  const [context, setContext] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!teacherMedia.file || !studentMedia.file) return;

    setAppState(AppState.ANALYZING);
    setAnalysisResult(null);

    try {
      const result = await analyzePerformance({
        teacherMedia,
        studentMedia,
        context: context || "General performance comparison"
      });
      setAnalysisResult(result);
      setAppState(AppState.COMPLETE);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("An error occurred during analysis. Please try again. Ensure your API Key is valid.");
    }
  };

  const isReady = teacherMedia.file !== null && studentMedia.file !== null;

  return (
    <div className="min-h-screen bg-background text-zinc-100 pb-20">
      {/* Navigation */}
      <nav className="border-b border-surfaceHighlight bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Music4 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Virtuoso AI</h1>
              <p className="text-xs text-zinc-500 font-medium">Professional Practice Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Info Tooltip or similar could go here */}
             <div className="text-xs px-3 py-1 rounded-full bg-surfaceHighlight text-zinc-400 border border-zinc-700">
               Gemini 3 Pro Powered
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Text */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            Master your craft.
          </h2>
          <p className="text-zinc-400">
            Upload a reference clip from your teacher and your own practice attempt. 
            Virtuoso AI will analyze the nuances of your timing, pitch, and technique.
          </p>
        </div>

        {/* Input Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
          <MediaInput 
            label="Teacher Reference" 
            media={teacherMedia} 
            onChange={setTeacherMedia}
            disabled={appState === AppState.ANALYZING}
          />
          <MediaInput 
            label="Student Practice" 
            media={studentMedia} 
            onChange={setStudentMedia}
            disabled={appState === AppState.ANALYZING}
          />
        </div>

        {/* Context Input */}
        <div className="bg-surface rounded-xl p-6 border border-surfaceHighlight">
          <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            What are we working on? (Optional)
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., Focus on the vibrato in the second phrase..."
              className="flex-1 bg-black/20 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              disabled={appState === AppState.ANALYZING}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_CONTEXT_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setContext(prompt)}
                className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700/50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!isReady || appState === AppState.ANALYZING}
            className={`
              relative overflow-hidden group
              px-12 py-4 rounded-full font-bold text-lg tracking-wide shadow-2xl transition-all duration-300
              ${!isReady 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-primary to-indigo-600 text-white hover:scale-105 hover:shadow-primary/25'
              }
            `}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <Sparkles className={`w-5 h-5 ${appState === AppState.ANALYZING ? 'animate-spin' : ''}`} />
              {appState === AppState.ANALYZING ? 'Analyzing Performance...' : 'Compare & Coach Me'}
            </div>
          </button>
        </div>

        {/* Results Area */}
        {(appState === AppState.ANALYZING || appState === AppState.COMPLETE) && (
          <div className="mt-12">
            <AnalysisView 
              isLoading={appState === AppState.ANALYZING}
              result={analysisResult}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
