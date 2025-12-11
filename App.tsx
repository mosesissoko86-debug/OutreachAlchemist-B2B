import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { extractLeadsFromText, generateLeadMessage } from './services/geminiService';
import { Lead, AppSettings, Tone, Length, Priority } from './types';
import { DEFAULT_SETTINGS, MOCK_LEADS_TEXT } from './constants';
import { SettingsPanel } from './components/SettingsPanel';
import { LeadCard } from './components/LeadCard';
import { IndustryChart, KeywordBubbleChart } from './components/Charts';
import { Sparkles, ArrowRight, Wand2, Trash2, LayoutGrid, List, Copy, AlertCircle, ChevronsDown, ChevronsUp, Download, FileJson, FileText, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [appState, setAppState] = useState<'input' | 'processing' | 'results'>('input');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setAppState('processing');
    setErrorMsg(null);
    
    try {
      const extractedData = await extractLeadsFromText(inputText);
      
      const newLeads: Lead[] = extractedData.map(data => ({
        ...data,
        id: uuidv4(),
        status: 'pending',
        isCollapsed: false,
        priority: data.priority || Priority.STANDARD
      }));

      // Sort by priority logic (Paid > High > Solid > Standard)
      const priorityOrder = { [Priority.PAID]: 0, [Priority.HIGH]: 1, [Priority.SOLID]: 2, [Priority.STANDARD]: 3 };
      newLeads.sort((a, b) => (priorityOrder[a.priority!] ?? 3) - (priorityOrder[b.priority!] ?? 3));

      setLeads(newLeads);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze text. Please ensure you are pasting valid text content.");
      setAppState('input');
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    
    const promises = leads.map(async (lead) => {
        if (lead.status === 'completed' || lead.status === 'generating') return;

        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'generating', isCollapsed: false } : l));

        try {
            const message = await generateLeadMessage(lead, settings);
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'completed', generatedMessage: message } : l));
        } catch (e) {
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'error' } : l));
        }
    });

    await Promise.all(promises);
    setIsGeneratingAll(false);
  };

  const handleRegenerate = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'generating', isCollapsed: false } : l));
    
    try {
        const message = await generateLeadMessage(lead, settings);
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'completed', generatedMessage: message } : l));
    } catch (e) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'error' } : l));
    }
  };

  const toggleLeadCollapse = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isCollapsed: !l.isCollapsed } : l));
  };

  const setGlobalCollapse = (collapsed: boolean) => {
    setLeads(prev => prev.map(l => ({ ...l, isCollapsed: collapsed })));
  };

  const handleExport = (format: 'csv' | 'json' | 'txt') => {
    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'json') {
        content = JSON.stringify(leads, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    } else if (format === 'csv') {
        const headers = ['Name', 'Company', 'Role', 'Platform', 'Email', 'Priority', 'Status', 'Generated Message', 'Original Context'];
        const rows = leads.map(l => [
            l.name, l.company, l.role, l.platform || 'Unknown', l.email || '', l.priority, l.status, `"${(l.generatedMessage || '').replace(/"/g, '""')}"`, `"${(l.context || '').replace(/"/g, '""')}"`
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
    } else if (format === 'txt') {
        content = leads.map(l => 
            `LEAD: ${l.name} (${l.priority})\n` +
            `SOURCE: ${l.platform || 'Unknown'}\n` +
            `ROLE: ${l.role} @ ${l.company}\n` +
            `CONTEXT: ${l.context}\n` +
            `MESSAGE:\n${l.generatedMessage || '(Not Generated)'}\n` +
            `----------------------------------------\n`
        ).join('\n');
        mimeType = 'text/plain';
        extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all leads?")) {
        setLeads([]);
        setAppState('input');
        setInputText('');
    }
  };

  // Auto-scroll to results when ready
  useEffect(() => {
    if (appState === 'results' && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appState]);

  return (
    <div className="min-h-screen bg-dark text-slate-200 selection:bg-primary/30 font-sans pb-20 overflow-x-hidden">
      
      {/* Background Ambience - More Cheerful & Vibrant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
         <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[90px] animate-float" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12">
           <div className="text-center md:text-left mb-6 md:mb-0">
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent animate-shimmer bg-[length:200%_auto]">
                 Outreach
               </span>
               Alchemist
             </h1>
             <p className="text-slate-400 text-lg max-w-md">Transform raw lead lists into golden conversations.</p>
           </div>
           
           {appState === 'results' && (
             <button 
               onClick={handleClear}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-all text-sm border border-slate-700 hover:border-red-500/50 backdrop-blur-sm"
             >
               <Trash2 size={16} /> Start Over
             </button>
           )}
        </header>

        {/* Input Section */}
        <section className={`transition-all duration-700 ease-out ${appState !== 'input' ? 'hidden' : 'block animate-pop'}`}>
            <div className="glass-panel p-1 rounded-3xl shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               
               <div className="bg-dark/90 rounded-[22px] p-6 md:p-8 relative z-10">
                  <label className="block text-xl font-bold text-white mb-5 flex items-center gap-3">
                     <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg">
                        <LayoutGrid className="text-white" size={20} />
                     </div>
                     Paste your leads here
                  </label>
                  
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={MOCK_LEADS_TEXT}
                    className="w-full h-64 bg-slate-900/50 border border-slate-700/80 rounded-xl p-6 text-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  
                  <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                    <p className="text-xs text-slate-500 flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                       <AlertCircle size={12} className="text-secondary" />
                       AI detects Name, Platform, Context & Priority automatically.
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={!inputText.trim()}
                      className={`group relative px-8 py-3.5 rounded-xl font-bold text-white shadow-xl transition-all w-full md:w-auto overflow-hidden ${
                        inputText.trim() 
                        ? 'bg-gradient-to-r from-primary via-purple-500 to-secondary hover:shadow-primary/50 hover:scale-105 active:scale-95' 
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                      }`}
                    >
                       <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer"></div>
                       <span className="flex items-center justify-center gap-2 relative z-10">
                         Analyze Leads <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </span>
                    </button>
                  </div>
               </div>
            </div>
        </section>

        {/* Processing State */}
        {appState === 'processing' && (
           <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
              <div className="relative w-32 h-32 mb-8">
                 <div className="absolute inset-0 border-4 border-slate-700/30 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-4 border-4 border-t-accent border-l-warning border-b-transparent border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                 <Sparkles className="absolute inset-0 m-auto text-white animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Analyzing Intelligence...</h2>
              <p className="text-slate-400 mt-3 text-lg">Classifying priority, identifying platforms, and discovering context.</p>
           </div>
        )}

        {/* Results Section */}
        {appState === 'results' && (
           <div ref={resultsRef} className="animate-slide-up space-y-8">
              
              {/* Controls & Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Left: Settings */}
                 <div className="lg:col-span-2">
                   <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                 </div>
                 
                 {/* Right: Visualization */}
                 <div className="bg-card/40 p-6 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-md flex flex-col justify-between hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2">
                       <h3 className="text-white font-semibold flex items-center gap-2"><List size={16} className="text-secondary"/> Insights</h3>
                       <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold">{leads.length} Leads</span>
                    </div>
                    <div className="flex-1 min-h-[150px] flex items-center justify-center">
                        {leads.length > 0 && (
                            leads.length > 5 ? <IndustryChart leads={leads} /> : <KeywordBubbleChart leads={leads} />
                        )}
                    </div>
                 </div>
              </div>

              {/* Action Bar */}
              <div className="sticky top-4 z-40 bg-dark/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
                 
                 <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                            Found {leads.length} Leads
                        </h2>
                        <span className="text-xs text-slate-400 hidden sm:inline">Sorted by Priority: Paid &gt; High &gt; Solid &gt; Standard</span>
                    </div>
                    
                    {/* View Controls */}
                    <div className="flex gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
                        <button 
                            onClick={() => setGlobalCollapse(false)} 
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                            title="Expand All"
                        >
                            <ChevronsDown size={18} />
                        </button>
                        <button 
                            onClick={() => setGlobalCollapse(true)} 
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                            title="Collapse All"
                        >
                            <ChevronsUp size={18} />
                        </button>
                    </div>
                 </div>
                 
                 <div className="flex gap-3 w-full md:w-auto">
                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <Download size={18} /> <span className="hidden sm:inline">Export</span>
                        </button>
                        
                        {showExportMenu && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col animate-pop">
                                <button onClick={() => handleExport('csv')} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 text-left transition-colors">
                                    <FileSpreadsheet size={16} className="text-emerald-500"/> Export CSV
                                </button>
                                <button onClick={() => handleExport('json')} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 text-left transition-colors border-t border-slate-700/50">
                                    <FileJson size={16} className="text-amber-500"/> Export JSON
                                </button>
                                <button onClick={() => handleExport('txt')} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 text-left transition-colors border-t border-slate-700/50">
                                    <FileText size={16} className="text-blue-500"/> Export TXT
                                </button>
                            </div>
                            </>
                        )}
                    </div>

                    <button
                      onClick={handleGenerateAll}
                      disabled={isGeneratingAll}
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 overflow-hidden relative group ${
                        isGeneratingAll 
                        ? 'bg-slate-600 cursor-wait' 
                        : 'bg-gradient-to-r from-primary via-purple-500 to-secondary hover:shadow-primary/50 hover:scale-105'
                      }`}
                    >
                       <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer"></div>
                       <Wand2 size={18} className={`relative z-10 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                       <span className="relative z-10">{isGeneratingAll ? 'Generating...' : 'Generate All DMs'}</span>
                    </button>
                 </div>
              </div>

              {/* Lead Cards List */}
              <div className="grid grid-cols-1 gap-5">
                 {leads.map((lead, index) => (
                    <div key={lead.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                       <LeadCard 
                           lead={lead} 
                           onRegenerate={handleRegenerate} 
                           onToggleCollapse={toggleLeadCollapse}
                       />
                    </div>
                 ))}
              </div>

           </div>
        )}

      </div>
    </div>
  );
}