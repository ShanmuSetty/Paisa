const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function Header({ month, year, setMonth, setYear }) {
  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.logo}>paisa</h1>
      <div style={styles.monthRow}>
        <button style={styles.arrow} onClick={prev}>‹</button>
        <span style={styles.monthLabel}>{MONTHS[month]} {year}</span>
        <button style={styles.arrow} onClick={next}>›</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 0',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--brown-900)',
    letterSpacing: '-0.5px',
  },
  monthRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  arrow: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: 'var(--brown-500)',
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
  },
  monthLabel: {
    fontSize: '13px',
    color: 'var(--brown-700)',
    fontWeight: '500',
  },
};