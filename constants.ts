import { Tone, Length, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  tone: Tone.PROFESSIONAL,
  length: Length.MEDIUM,
  language: 'English',
};

export const MOCK_LEADS_TEXT = `John Doe (john@techstart.io)
CEO at TechStart • San Francisco, CA
Posted 2 days ago:
"We are struggling to scale our backend infrastructure. Any recommendations for cloud consultants?"
https://linkedin.com/post/12345

Sarah Smith
CMO at GreenEnergy Inc.
"Just finished a great podcast on sustainable marketing. We are looking to revamp our entire brand strategy next quarter."
Location: London, UK | 1 week ago

Mike Ross
Freelance Designer
mike.ross@design.co
"Does anyone know a good accountant for creative freelancers? I'm drowning in tax paperwork."`;

export const ANIMATION_DELAY_MS = 100;