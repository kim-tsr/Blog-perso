import { CLASSIFIER_RESULTS as R, HF_MODEL, KAGGLE_NOTEBOOK } from '@/lib/classifier'

export default function ClassifierOverview() {
  return (
    <>
      <p className="kd-note" style={{ marginTop: 0, marginBottom: 20 }}>
        Résultats sur le jeu de test, avec un seuil réglé sur la validation pour 1 % de faux positifs. La v2 (1 115 571 prompts d&apos;entraînement, test de 47 790 prompts) atteint 0,964 de macro-F1, avec un intervalle de confiance à 95 % de 0,961 à 0,967. Latence d&apos;environ 28 ms sur GPU et 212 ms sur CPU. Les deux tests sont différents : la comparaison avec la v1 reste indicative.
      </p>
      <div className="kd-table-wrap" style={{ marginTop: 0 }}>
        <table className="kd-table">
          <thead><tr>{R.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{R.rows.map(r => <tr key={r[0]}>{r.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="kd-note">
        Le modèle est disponible sur{' '}
        <a href={HF_MODEL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Hugging Face ↗</a>
        {' '}et l&apos;entraînement de la v2 est reproductible depuis le{' '}
        <a href={KAGGLE_NOTEBOOK} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>notebook Kaggle ↗</a>.
      </p>
    </>
  )
}
