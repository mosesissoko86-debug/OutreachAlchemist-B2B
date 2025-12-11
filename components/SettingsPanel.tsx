import React from 'react';
import { AppSettings, Tone, Length } from '../types';
import { Sliders, Check } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const handleToneChange = (tone: Tone) => {
    onSettingsChange({ ...settings, tone });
  };

  const handleLengthChange = (length: Length) => {
    onSettingsChange({ ...settings, length });
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm mb-6">
      <div className="flex items-center gap-2 mb-4 text-secondary">
        <Sliders size={20} />
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Tone of Voice</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Tone).map((tone) => (
              <button
                key={tone}
                onClick={() => handleToneChange(tone)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  settings.tone === tone
                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Message Length</label>
          <div className="space-y-2">
            {Object.values(Length).map((length) => (
              <div
                key={length}
                onClick={() => handleLengthChange(length)}
                className={`flex items-center p-2 rounded-lg cursor-pointer border transition-all duration-200 ${
                  settings.length === length
                    ? 'bg-slate-800 border-primary text-white'
                    : 'border-transparent hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                   settings.length === length ? 'border-primary bg-primary' : 'border-slate-500'
                }`}>
                   {settings.length === length && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm">{length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
