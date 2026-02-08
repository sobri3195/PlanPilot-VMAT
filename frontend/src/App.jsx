import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:8000';

const initialForm = {
  site: 'Head & Neck',
  ai_ci: 0.92,
  manual_ci: 0.91,
  ai_hi: 1.07,
  manual_hi: 1.05,
  ai_oar_score: 23,
  manual_oar_score: 24,
  ai_minutes: 45,
  manual_minutes: 95,
  ai_revisions: 1,
  manual_revisions: 3,
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [analysis, setAnalysis] = useState(null);
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState('');

  const inputConfig = useMemo(
    () => [
      ['ai_ci', 'AI CI'],
      ['manual_ci', 'Manual CI'],
      ['ai_hi', 'AI HI'],
      ['manual_hi', 'Manual HI'],
      ['ai_oar_score', 'AI OAR Score'],
      ['manual_oar_score', 'Manual OAR Score'],
      ['ai_minutes', 'AI Planning Time (min)'],
      ['manual_minutes', 'Manual Planning Time (min)'],
      ['ai_revisions', 'AI Revisions'],
      ['manual_revisions', 'Manual Revisions'],
    ],
    []
  );

  useEffect(() => {
    fetch(`${API_BASE}/api/sample-cases`)
      .then((response) => response.json())
      .then(setSamples)
      .catch(() => setError('Gagal mengambil sample cases dari backend.'));
  }, []);

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: key === 'site' ? value : Number(value) }));
  };

  const analyze = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Request gagal');
      }

      setAnalysis(await response.json());
    } catch (err) {
      setError('Tidak bisa menganalisis data. Pastikan backend berjalan di port 8000.');
    }
  };

  return (
    <main className="container">
      <h1>PlanPilot-VMAT</h1>
      <p>
        Perbandingan <strong>AI plan generation</strong> vs <strong>manual planning</strong> untuk studi non-inferiority VMAT multi-site.
      </p>

      <form onSubmit={analyze} className="card">
        <label>
          Site
          <input value={form.site} onChange={(e) => onFieldChange('site', e.target.value)} />
        </label>

        <div className="grid">
          {inputConfig.map(([key, label]) => (
            <label key={key}>
              {label}
              <input type="number" step="0.01" value={form[key]} onChange={(e) => onFieldChange(key, e.target.value)} />
            </label>
          ))}
        </div>

        <button type="submit">Analisis Kasus</button>
      </form>

      {error && <p className="error">{error}</p>}

      {analysis && (
        <section className="card">
          <h2>Hasil Analisis: {analysis.site}</h2>
          <ul>
            <li>CI non-inferior: {String(analysis.metrics.ci.nonInferior)}</li>
            <li>HI non-inferior: {String(analysis.metrics.hi.nonInferior)}</li>
            <li>OAR non-inferior: {String(analysis.metrics.oarScore.nonInferior)}</li>
            <li>Penghematan waktu (menit): {analysis.metrics.planningTimeMinutes.savedByAI}</li>
            <li>Reduksi revisi: {analysis.metrics.revisions.reducedByAI}</li>
            <li>Status overall non-inferiority: {String(analysis.overallNonInferior)}</li>
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Sample Multi-site</h2>
        <ul>
          {samples.map((sample, index) => (
            <li key={`${sample.site}-${index}`}>
              {sample.site}: overall non-inferiority = {String(sample.overallNonInferior)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
