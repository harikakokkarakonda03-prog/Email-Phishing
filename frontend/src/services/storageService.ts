import { InvestigationData } from '../types/forensic';
import { DEMO_INVESTIGATION } from '../data/demoInvestigation';
import { PRESET_EMAILS } from '../data/presets';

const STORAGE_KEY = 'threatmailer_investigations';
const LEGACY_KEY = 'sih26106_investigations';

export function getSavedInvestigations(): InvestigationData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      // Seed with initial demo investigations
      const initial = [
        DEMO_INVESTIGATION,
        PRESET_EMAILS[1].investigation,
        PRESET_EMAILS[2].investigation,
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEMO_INVESTIGATION];
  }
}

export function saveInvestigation(investigation: InvestigationData): void {
  try {
    const existing = getSavedInvestigations();
    // Prepend new investigation or update if same ID
    const filtered = existing.filter((inv) => inv.id !== investigation.id);
    const updated = [investigation, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save investigation to localStorage', err);
  }
}

export function getInvestigationById(id: string): InvestigationData | null {
  const all = getSavedInvestigations();
  const found = all.find((inv) => inv.id === id);
  if (found) return found;
  if (id === DEMO_INVESTIGATION.id) return DEMO_INVESTIGATION;
  return null;
}
