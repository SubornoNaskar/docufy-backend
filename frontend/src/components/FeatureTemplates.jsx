import React from 'react';
import {
  Sparkles,
  FileText,
  HelpCircle,
  ClipboardList,
  Cpu,
  ArrowRight,
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'summary',
    icon: FileText,
    iconColor: 'text-blue-400',
    title: 'Summarize Key Points',
    description: 'Summarize the key points and executive highlights of this document.',
    prompt: 'Summarize the key points and executive highlights of this document.',
  },
  {
    id: 'qa',
    icon: HelpCircle,
    iconColor: 'text-indigo-400',
    title: 'Interview / Q&A Insights',
    description: 'What are the most critical questions and answers covered in this text?',
    prompt: 'What are the most critical questions and answers covered in this text?',
  },
  {
    id: 'action',
    icon: ClipboardList,
    iconColor: 'text-amber-400',
    title: 'Action Items & Deadlines',
    description: 'List all actionable takeaways, deadlines, and responsibilities mentioned.',
    prompt: 'List all actionable takeaways, deadlines, and responsibilities mentioned.',
  },
  {
    id: 'technical',
    icon: Cpu,
    iconColor: 'text-emerald-400',
    title: 'Technical Concepts',
    description: 'Explain the main technical concepts and architecture described in this document.',
    prompt: 'Explain the main technical concepts and architecture described in this document.',
  },
];

export default function FeatureTemplates({ onSelectTemplate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full select-none">
      {/* Central Hero Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full -z-10"></div>
      </div>

      {/* Hero Title & Subtitle */}
      <h1 className="text-2xl font-bold text-white tracking-tight text-center">
        Docufy AI Document Assistant
      </h1>
      <p className="text-slate-400 text-xs sm:text-sm mt-2 text-center max-w-lg leading-relaxed">
        Upload PDF reports, Word files, or notes and chat naturally with grounded facts, source citations, and page numbers.
      </p>

      {/* Feature Templates Grid (Matches Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full">
        {TEMPLATES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTemplate(item.prompt)}
              className="group text-left p-4 rounded-xl bg-[#0b1222]/80 hover:bg-[#111c36] border border-[#172544] hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:shadow-blue-900/10"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${item.iconColor} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                  Use template <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
