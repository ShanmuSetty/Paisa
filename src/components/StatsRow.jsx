function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function StatsRow({ totalIncome, totalExpense, totalBudget }) {
  const left = totalBudget - totalExpense;
  const pct  = totalBudget ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
  const barColor = pct > 90 ? '#F09595' : pct > 70 ? '#EF9F27' : 'var(--brown-300)';

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <p style={styles.label}>Budget left</p>
          <p style={styles.big}>{totalBudget ? fmt(Math.max(0, left)) : '—'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={styles.label}>Total budget</p>
          <p style={styles.sub}>{totalBudget ? fmt(totalBudget) : 'Set below ↓'}</p>
        </div>
      </div>

      <div style={styles.subRow}>
        <div>
          <p style={styles.subLabel}>Income</p>
          <p style={styles.subVal}>{fmt(totalIncome)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={styles.subLabel}>Spent</p>
          <p style={{ ...styles.subVal, color: 'var(--brown-300)' }}>{fmt(totalExpense)}</p>
        </div>
      </div>

      {totalBudget > 0 && (
        <div style={styles.barWrap}>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: pct + '%', background: barColor }} />
          </div>
          <span style={styles.barPct}>{pct}%</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--brown-900)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    margin: '16px 20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: '12px', color: 'var(--brown-300)', marginBottom: '4px' },
  big: { fontSize: '34px', fontWeight: '600', fontFamily: 'var(--font-display)', color: '#FAEEDA', letterSpacing: '-1px' },
  sub: { fontSize: '16px', fontWeight: '500', color: '#FAEEDA', marginTop: '4px' },
  subRow: { display: 'flex', justifyContent: 'space-between' },
  subLabel: { fontSize: '11px', color: 'var(--brown-500)', marginBottom: '2px' },
  subVal: { fontSize: '17px', fontWeight: '500', color: '#FAEEDA' },
  barWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  barTrack: { flex: 1, background: '#5A3010', borderRadius: '99px', height: '8px' },
  barFill: { height: '8px', borderRadius: '99px', transition: 'width 0.4s ease' },
  barPct: { fontSize: '12px', color: 'var(--brown-300)', minWidth: '32px', textAlign: 'right' },
};