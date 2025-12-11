export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  context: string;
  industry: string;
  email?: string;
  postLink?: string;
  postDate?: string;
  location?: string;
  originalPostText?: string;
  generatedMessage?: string;
  platform?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  priority?: Priority;
  isCollapsed?: boolean;
}

export enum Priority {
  PAID = 'Paid',
  HIGH = 'High',
  SOLID = 'Solid',
  STANDARD = 'Standard',
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  WITTY = 'Witty',
  DIRECT = 'Direct',
  EMPATHETIC = 'Empathetic',
}

export enum Length {
  SHORT = 'Short (Tweet style)',
  MEDIUM = 'Medium (Email style)',
  LONG = 'Long (Detailed proposal)',
}

export interface AppSettings {
  tone: Tone;
  length: Length;
  language: string;
}

export interface ProcessingStats {
  totalLeads: number;
  completed: number;
  industries: { name: string; value: number }[];
}