import { ThreatMonitoring } from './features/threat-monitoring/ThreatMonitoring';

/**
 * Deliberately chrome-less. The brief asks for "a simple shell containing this
 * table experience" — a fake navigation rail would only invite judgement of
 * screens that are not part of this exercise.
 */
export function App() {
  return (
    <main className="app">
      <div className="app__shell">
        <ThreatMonitoring />
      </div>
    </main>
  );
}
