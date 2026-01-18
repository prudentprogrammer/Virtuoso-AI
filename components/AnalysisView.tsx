import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, AlertTriangle, GraduationCap, Music } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-t-4 border-primary/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          <Music className="absolute inset-0 m-auto text-primary w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Analyzing Performance</h3>
        <p className="text-zinc-400 max-w-md">
          Virtuoso AI is listening to phrasing, checking timing, and observing technique...
        </p>
      </div>
    );
  }

  if (!result) return null;

  // Simple parser to extract sections from Markdown if possible, 
  // otherwise just renders the text safely.
  // We expect the model to output # Headers.
  
  const sections = result.markdown.split(/##\s+/).filter(Boolean);

  return (
    <div className="bg-surface rounded-xl border border-surfaceHighlight p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
          <p className="text-zinc-400 text-sm">Generated at {new Date(result.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => {
          const [title, ...contentLines] = section.split('\n');
          const content = contentLines.join('\n').trim();
          
          let icon = <Music className="w-5 h-5 text-zinc-400" />;
          let titleColor = "text-white";
          
          if (title.includes("Strengths")) {
            icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
            titleColor = "text-green-400";
          } else if (title.includes("Correction") || title.includes("Improvement")) {
            icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
            titleColor = "text-amber-400";
          } else if (title.includes("Action Plan")) {
            icon = <GraduationCap className="w-5 h-5 text-primary" />;
            titleColor = "text-primary";
          }

          return (
            <div key={idx} className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors">
              <h3 className={`flex items-center gap-2 text-lg font-bold mb-3 ${titleColor}`}>
                {icon}
                {title.replace(/[*_~]/g, '')}
              </h3>
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-light text-base">
                {content.split('\n').map((line, lineIdx) => (
                  <p key={lineIdx} className="mb-2 last:mb-0">
                    {line.replace(/^-\s/, '• ')}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisView;
