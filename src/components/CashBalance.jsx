function fmt(n) { return '₹' + Math.round(Math.abs(n)).toLocaleString('en-IN'); }

export default function CashBalance({ txns }) {
  const cashIn  = txns.filter(t => t.payment_method === 'cash' && t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const cashOut = txns.filter(t => t.payment_method === 'cash' && t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
  const balance = cashIn - cashOut;

  if (cashIn === 0 && cashOut === 0) return null;

  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{flexShrink:0}}>
          <rect x="1" y="4" width="16" height="10" rx="2" stroke="#173404" strokeWidth="1.3"/>
          <circle cx="9" cy="9" r="2.2" stroke="#173404" strokeWidth="1.2"/>
          <path d="M1 7H3.5M14.5 7H17M1 11H3.5M14.5 11H17" stroke="#173404" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div>
          <p style={styles.label}>Cash in hand</p>
          <p style={styles.sub}>+{fmt(cashIn)} in · −{fmt(cashOut)} out</p>
        </div>
      </div>
      <p style={{ ...styles.balance, color: balance >= 0 ? '#3B6D11' : '#A32D2D' }}>
        {balance >= 0 ? '' : '−'}{fmt(balance)}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: '#C0DD97',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    margin: '10px 20px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { display: 'flex', alignItems: 'center', gap: '10px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#173404' },
  sub: { fontSize: '11px', color: '#3B6D11', marginTop: '2px' },
  balance: { fontSize: '20px', fontWeight: '600', fontFamily: 'var(--font-display)' },
};