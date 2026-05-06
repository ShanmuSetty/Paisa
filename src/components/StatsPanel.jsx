import { EXPENSE_CATEGORIES } from '../lib/categories';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtDiff(n) { return (n > 0 ? '+' : '') + fmt(n); }

function DonutChart({ slices, total }) {
  const r = 70, cx = 90, cy = 90, stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const paths = slices.map((s, i) => {
    const pct  = total > 0 ? s.value / total : 0;
    const dash = pct * circumference;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none"
        stroke={s.fill} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
      />
    );
    offset += dash;
    return el;
  });
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8DCC8" strokeWidth={stroke} />
      {paths}
      <text x={cx} y={cy-8} textAnchor="middle" fontSize="13" fill="#854F0B" fontFamily="DM Sans">spent</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="18" fontWeight="600" fill="#412402" fontFamily="Syne">{fmt(total)}</text>
    </svg>
  );
}

function exportCSV(txns) {
  const rows = [
    ['Date','Description','Type','Category','Amount','Payment Method','Note'],
    ...txns.map(t => [
      t.txn_date, t.description, t.type, t.category,
      t.amount, t.payment_method ?? 'bank', t.note ?? ''
    ])
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `paisa-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StatsPanel({ txns, budgets, prevTxns, month, year, onClose }) {
  const expenses = txns.filter(t => t.type === 'expense');
  const income   = txns.filter(t => t.type === 'income');
  const totalExp = expenses.reduce((s,t) => s + Number(t.amount), 0);
  const totalInc = income.reduce((s,t) => s + Number(t.amount), 0);

  const prevExp = (prevTxns ?? []).filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
  const prevInc = (prevTxns ?? []).filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);

  const catTotals = {};
  for (const t of expenses) catTotals[t.category] = (catTotals[t.category] ?? 0) + Number(t.amount);

  const prevCatTotals = {};
  for (const t of (prevTxns ?? []).filter(t => t.type === 'expense'))
    prevCatTotals[t.category] = (prevCatTotals[t.category] ?? 0) + Number(t.amount);

  const bankExp = expenses.filter(t => t.payment_method !== 'cash').reduce((s,t) => s + Number(t.amount), 0);
  const cashExp = expenses.filter(t => t.payment_method === 'cash').reduce((s,t) => s + Number(t.amount), 0);
  const bankInc = income.filter(t => t.payment_method !== 'cash').reduce((s,t) => s + Number(t.amount), 0);
  const cashInc = income.filter(t => t.payment_method === 'cash').reduce((s,t) => s + Number(t.amount), 0);

  const sorted = EXPENSE_CATEGORIES
    .map(c => ({ ...c, spent: catTotals[c.id] ?? 0, budget: budgets[c.id] ?? 0, prevSpent: prevCatTotals[c.id] ?? 0 }))
    .filter(c => c.spent > 0)
    .sort((a,b) => b.spent - a.spent);

  const prevMonthName = MONTHS[month === 0 ? 11 : month - 1];
  const expDiff = totalExp - prevExp;
  const incDiff = totalInc - prevInc;

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <div style={styles.header}>
          <span style={styles.title}>Stats</span>
          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <button style={styles.exportBtn} onClick={() => exportCSV(txns)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight:4}}>
                <path d="M7 1V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 11H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Export CSV
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div style={styles.scroll}>
          {/* summary with MoM */}
          <div style={styles.cardRow}>
            <div style={styles.summCard}>
              <p style={styles.summLabel}>Income</p>
              <p style={{ ...styles.summVal, color: '#3B6D11' }}>{fmt(totalInc)}</p>
              {prevInc > 0 && (
                <p style={{ ...styles.momTag, color: incDiff >= 0 ? '#3B6D11' : '#A32D2D' }}>
                  {fmtDiff(incDiff)} vs {prevMonthName}
                </p>
              )}
            </div>
            <div style={styles.summCard}>
              <p style={styles.summLabel}>Spent</p>
              <p style={{ ...styles.summVal, color: '#854F0B' }}>{fmt(totalExp)}</p>
              {prevExp > 0 && (
                <p style={{ ...styles.momTag, color: expDiff > 0 ? '#A32D2D' : '#3B6D11' }}>
                  {fmtDiff(expDiff)} vs {prevMonthName}
                </p>
              )}
            </div>
          </div>

          {sorted.length > 0 ? (
            <>
              {/* donut */}
              <div style={styles.donutWrap}>
                <DonutChart slices={sorted.map(c=>({fill:c.fill,value:c.spent}))} total={totalExp} />
                <div style={styles.legend}>
                  {sorted.map(c => (
                    <div key={c.id} style={styles.legendRow}>
                      <div style={{ ...styles.legendDot, background: c.fill }} />
                      <span style={styles.legendLabel}>{c.label}</span>
                      <span style={styles.legendAmt}>{fmt(c.spent)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* budget bars */}
              <p style={styles.sectionTitle}>Budget vs spent</p>
              <div style={styles.bars}>
                {sorted.map(cat => {
                  const pct = cat.budget > 0 ? Math.min(100, (cat.spent / cat.budget) * 100) : null;
                  const barColor = pct === null ? cat.fill : pct > 90 ? '#F09595' : pct > 70 ? '#EF9F27' : cat.fill;
                  const diff = cat.spent - cat.prevSpent;
                  return (
                    <div key={cat.id} style={styles.barBlock}>
                      <div style={styles.barMeta}>
                        <div style={{ ...styles.barDot, background: cat.fill }} />
                        <span style={styles.barLabel}>{cat.label}</span>
                        <span style={styles.barAmt}>{fmt(cat.spent)}</span>
                        {cat.budget > 0 && <span style={styles.barBudget}>/ {fmt(cat.budget)}</span>}
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.barFill,
                          width: (pct !== null ? pct : 100) + '%',
                          background: barColor,
                        }} />
                      </div>
                      <div style={styles.barFooter}>
                        {pct !== null && (
                          <p style={{ ...styles.barPct, color: pct > 90 ? '#A32D2D' : 'var(--brown-500)' }}>
                            {Math.round(pct)}% of budget
                          </p>
                        )}
                        {cat.prevSpent > 0 && (
                          <p style={{ ...styles.barMom, color: diff > 0 ? '#A32D2D' : '#3B6D11' }}>
                            {fmtDiff(diff)} vs {prevMonthName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* bank vs cash */}
              <p style={styles.sectionTitle}>Bank vs Cash</p>
              <div style={styles.cardRow}>
                <div style={{ ...styles.methodCard, background: '#B5D4F4' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginBottom:6}}>
                    <path d="M2 8L10 3L18 8H2Z" stroke="#042C53" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                    <rect x="2" y="15" width="16" height="2" rx="1" stroke="#042C53" strokeWidth="1.3" fill="none"/>
                    <path d="M5 8V15M10 8V15M15 8V15" stroke="#042C53" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <p style={styles.methodLabel}>Bank</p>
                  <p style={styles.methodInc}>+{fmt(bankInc)}</p>
                  <p style={styles.methodExp}>−{fmt(bankExp)}</p>
                </div>
                <div style={{ ...styles.methodCard, background: '#C0DD97' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginBottom:6}}>
                    <rect x="1" y="5" width="18" height="10" rx="2" stroke="#173404" strokeWidth="1.4"/>
                    <circle cx="10" cy="10" r="2.5" stroke="#173404" strokeWidth="1.3"/>
                    <path d="M1 8H4M16 8H19M1 12H4M16 12H19" stroke="#173404" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <p style={styles.methodLabel}>Cash</p>
                  <p style={styles.methodInc}>+{fmt(cashInc)}</p>
                  <p style={styles.methodExp}>−{fmt(cashExp)}</p>
                </div>
              </div>
            </>
          ) : (
            <p style={styles.empty}>Add some transactions to see stats!</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(65,36,2,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: 'var(--bg)', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' },
  handle: { width: '40px', height: '4px', background: 'var(--brown-300)', borderRadius: '99px', margin: '14px auto 0', flexShrink: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px', flexShrink: 0 },
  title: { fontSize: '18px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--brown-900)' },
  exportBtn: {
    display: 'flex', alignItems: 'center',
    background: 'var(--bg-card)', border: '1px solid #E8DCC8',
    borderRadius: '99px', padding: '6px 12px',
    fontSize: '12px', color: 'var(--brown-700)',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
  },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-700)', display: 'flex' },
  scroll: { flex: 1, overflowY: 'auto', padding: '8px 16px 40px' },
  cardRow: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px', marginBottom: '20px' },
  summCard: { background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid #E8DCC8' },
  summLabel: { fontSize: '12px', color: 'var(--brown-500)', marginBottom: '4px' },
  summVal: { fontSize: '22px', fontWeight: '600', fontFamily: 'var(--font-display)' },
  momTag: { fontSize: '11px', marginTop: '4px', fontWeight: '500' },
  donutWrap: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  legend: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: '13px', color: 'var(--brown-700)' },
  legendAmt: { fontSize: '13px', fontWeight: '500', color: 'var(--brown-900)' },
  sectionTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--brown-700)', marginBottom: '12px' },
  bars: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  barBlock: {},
  barMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
  barDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  barLabel: { flex: 1, fontSize: '13px', color: 'var(--brown-700)' },
  barAmt: { fontSize: '13px', fontWeight: '500', color: 'var(--brown-900)' },
  barBudget: { fontSize: '12px', color: 'var(--brown-500)' },
  barTrack: { background: '#E8DCC8', borderRadius: '99px', height: '8px', overflow: 'hidden' },
  barFill: { height: '8px', borderRadius: '99px', transition: 'width 0.5s ease' },
  barFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '4px' },
  barPct: { fontSize: '11px' },
  barMom: { fontSize: '11px', fontWeight: '500' },
  methodCard: { borderRadius: 'var(--radius-md)', padding: '14px' },
  methodLabel: { fontSize: '12px', color: 'var(--brown-700)', marginBottom: '6px' },
  methodInc: { fontSize: '14px', fontWeight: '500', color: '#3B6D11', marginBottom: '2px' },
  methodExp: { fontSize: '14px', fontWeight: '500', color: '#854F0B' },
  empty: { textAlign: 'center', color: 'var(--brown-500)', fontSize: '14px', padding: '40px 0' },
};