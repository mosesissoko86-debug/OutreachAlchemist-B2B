import React, { useState } from 'react';
import { Lead, Priority } from '../types';
import { Copy, RefreshCw, Check, Sparkles, Building, MapPin, Calendar, Mail, ExternalLink, Quote, MessageSquare, ChevronDown, ChevronUp, Gem, TrendingUp, User, Activity, Linkedin, Twitter, Instagram, Globe, HelpCircle, MessageCircle } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onRegenerate: (leadId: string) => void;
  onToggleCollapse: (leadId: string) => void;
}

const PriorityBadge: React.FC<{ priority?: Priority }> = ({ priority }) => {
  if (!priority) return null;

  const styles = {
    [Priority.PAID]: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 border-orange-300/50",
    [Priority.HIGH]: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 border-rose-400/50",
    [Priority.SOLID]: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-cyan-400/50",
    [Priority.STANDARD]: "bg-slate-700 text-slate-300 border-slate-600",
  };

  const icons = {
    [Priority.PAID]: <Gem size={12} className="fill-current" />,
    [Priority.HIGH]: <TrendingUp size={12} />,
    [Priority.SOLID]: <Activity size={12} />,
    [Priority.STANDARD]: <User size={12} />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border transform transition-transform group-hover:scale-105 ${styles[priority] || styles[Priority.STANDARD]}`}>
      {icons[priority] || icons[Priority.STANDARD]}
      {priority}
    </span>
  );
};

const PlatformIcon: React.FC<{ platform?: string }> = ({ platform }) => {
  const p = (platform || 'Other').toLowerCase();
  
  let icon = <HelpCircle size={16} />;
  let colorClass = "text-slate-400 bg-slate-800";
  let name = "Unknown Source";

  if (p.includes('linkedin')) {
    icon = <Linkedin size={16} />;
    colorClass = "text-white bg-[#0077b5]";
    name = "LinkedIn";
  } else if (p.includes('twitter') || p.includes('x.com')) {
    icon = <Twitter size={16} />;
    colorClass = "text-white bg-black";
    name = "X / Twitter";
  } else if (p.includes('reddit')) {
    icon = <MessageCircle size={16} />;
    colorClass = "text-white bg-[#FF4500]"; // Reddit Orange
    name = "Reddit";
  } else if (p.includes('instagram')) {
    icon = <Instagram size={16} />;
    colorClass = "text-white bg-gradient-to-br from-purple-500 to-orange-500";
    name = "Instagram";
  } else if (p.includes('email') || p.includes('mail')) {
    icon = <Mail size={16} />;
    colorClass = "text-white bg-emerald-500";
    name = "Email";
  } else if (p.includes('web')) {
    icon = <Globe size={16} />;
    colorClass = "text-white bg-indigo-500";
    name = "Website";
  }

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold shadow-md ${colorClass} transition-transform hover:scale-105`}>
      {icon}
      <span>{name}</span>
    </div>
  );
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onRegenerate, onToggleCollapse }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.generatedMessage) {
      navigator.clipboard.writeText(lead.generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerate(lead.id);
  };

  return (
    <div className={`group relative bg-card/40 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col hover:shadow-2xl ${
      lead.isCollapsed 
        ? 'border-slate-800 hover:border-slate-600' 
        : 'border-slate-700/50 hover:border-primary/50 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)] hover:-translate-y-1'
    }`}>
      
      {/* Dynamic Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* status indicator line with gradient */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${
        lead.status === 'completed' ? 'bg-gradient-to-b from-success to-emerald-700' : 
        lead.status === 'error' ? 'bg-gradient-to-b from-red-500 to-rose-700' : 
        lead.status === 'generating' ? 'bg-gradient-to-b from-secondary to-primary animate-pulse' : 'bg-slate-700'
      }`} />

      {/* Header Section (Always Visible) */}
      <div 
        onClick={() => onToggleCollapse(lead.id)}
        className="relative p-5 pl-7 cursor-pointer z-10"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
             <div className="flex items-center flex-wrap gap-3 mb-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-secondary transition-all">
                  {lead.name}
                </h3>
                <PriorityBadge priority={lead.priority} />
                {lead.role && lead.role !== 'Unknown' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-secondary font-medium border border-secondary/20 truncate max-w-[200px]">
                    {lead.role}
                  </span>
                )}
             </div>
             
             {!lead.isCollapsed && (
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-slate-400 animate-fade-in">
                    <PlatformIcon platform={lead.platform} />
                    
                    {lead.company && lead.company !== 'Unknown' && (
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Building size={14} className="text-secondary" /> {lead.company}
                    </span>
                    )}
                    
                    {lead.location && (
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MapPin size={14} className="text-accent" /> {lead.location}
                    </span>
                    )}

                    {lead.postDate && (
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Calendar size={14} className="text-warning" /> {lead.postDate}
                    </span>
                    )}
                </div>
             )}
          </div>

          <div className="flex flex-col items-end gap-2">
             <div className="text-slate-500 group-hover:text-primary transition-colors bg-slate-900/50 p-1.5 rounded-lg">
                 {lead.isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
             </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${lead.isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}>
        <div className="p-5 pl-7 pt-0">
            
            {/* Action Buttons Row */}
            <div className="flex justify-end gap-3 mb-5 border-b border-slate-700/50 pb-4">
                 {lead.postLink && (
                   <a 
                     href={lead.postLink} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-secondary/20 hover:text-secondary text-xs font-medium text-slate-400 transition-all border border-transparent hover:border-secondary/30"
                   >
                     <ExternalLink size={14} /> View Source
                   </a>
                 )}
                 
                 <button 
                   onClick={handleRegenerateClick}
                   disabled={lead.status === 'generating'}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-primary/20 hover:text-primary text-xs font-medium text-slate-400 transition-all border border-transparent hover:border-primary/30"
                 >
                   <RefreshCw size={14} className={lead.status === 'generating' ? 'animate-spin' : ''} /> Regenerate
                 </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Context & Metadata */}
            <div className="space-y-4">
                {lead.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 hover:border-secondary/50 transition-colors group/email">
                        <div className="p-1.5 bg-blue-500/20 rounded-md text-blue-400 group-hover/email:bg-blue-500 group-hover/email:text-white transition-colors">
                            <Mail size={16} />
                        </div>
                        <span className="truncate select-all font-mono text-xs md:text-sm">{lead.email}</span>
                    </div>
                )}
                
                <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl p-4 border border-slate-700/50 shadow-inner group/quote">
                    <div className="absolute top-4 left-4 text-slate-700 group-hover/quote:text-slate-600 transition-colors">
                        <Quote size={20} />
                    </div>
                    <div className="pl-8 relative z-10">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 opacity-70">Source Context</p>
                        <p className="text-sm text-slate-300 italic leading-relaxed line-clamp-6">
                        "{lead.originalPostText || lead.context}"
                        </p>
                    </div>
                </div>
                
                {lead.originalPostText && lead.context && lead.originalPostText !== lead.context && (
                    <div className="bg-primary/5 rounded-xl p-3 px-4 border border-primary/10">
                    <p className="text-[10px] text-primary font-bold uppercase mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> AI Analysis
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">{lead.context}</p>
                    </div>
                )}
            </div>

            {/* Right Column: Generated Message */}
            <div className="relative flex flex-col h-full min-h-[200px]">
                <div className="absolute -top-3 left-0 bg-card px-2 text-xs font-bold text-secondary flex items-center gap-1.5 z-20 rounded-full border border-slate-700 shadow-sm">
                    <MessageSquare size={12} /> Generated Draft
                </div>
                
                <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-slate-700/50 p-5 pt-6 shadow-inner relative overflow-hidden group/message">
                    
                    {/* Background noise texture optional */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    {lead.status === 'completed' && lead.generatedMessage ? (
                        <div className="relative h-full flex flex-col z-10">
                            <div className="flex-1 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {lead.generatedMessage}
                            </div>
                            <div className="flex justify-end mt-4 pt-3 border-t border-slate-700/50">
                                <button
                                    onClick={handleCopy}
                                    className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg transform active:scale-95 ${
                                        copied 
                                        ? 'bg-success text-white' 
                                        : 'bg-primary text-white hover:bg-violet-600 hover:shadow-violet-500/25'
                                    }`}
                                >
                                    <div className={`absolute inset-0 bg-white/20 translate-x-[-100%] ${!copied && 'group-hover/message:animate-shimmer'}`}></div>
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    ) : lead.status === 'generating' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 z-10">
                            <div className="relative">
                                <Sparkles className="text-secondary mb-3 animate-bounce" size={32} />
                                <div className="absolute inset-0 bg-secondary blur-xl opacity-30 animate-pulse"></div>
                            </div>
                            <span className="text-slate-300 text-sm font-medium animate-pulse mt-2">Crafting personalized magic...</span>
                        </div>
                    ) : lead.status === 'error' ? (
                        <div className="h-full flex items-center justify-center text-red-400 text-sm z-10">
                            Failed to generate. Try regenerating.
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm italic z-10">
                            <Sparkles size={24} className="mb-2 opacity-20" />
                            Waiting to generate...
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};