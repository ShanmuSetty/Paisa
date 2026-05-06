import { useState } from 'react';
import { getCategoryMeta } from '../lib/categories';
import { CategoryIcon } from '../lib/icons';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

export default function CalendarView({ txns, month, year }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay    = getFirstDayOfMonth(month, year);

  // group txns by day
  const byDay = {};
  for (const t of txns) {
    const d = new Date(t.txn_date).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(t);
  }

  // day cell data
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedTxns = selectedDay ? (byDay[selectedDay] ?? []) : [];
  const selectedIncome  = selectedTxns.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const selectedExpense = selectedTxns.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);

  return (
    <div style={styles.wrap}>
      {/* calendar grid */}
      <div style={styles.calCard}>
        {/* day headers */}
        <div style={styles.dayHeaders}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={styles.dayHeader}>{d}</div>
          ))}
        </div>

        {/* cells */}
        <div style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;

            const dayTxns   = byDay[day] ?? [];
            const hasExp    = dayTxns.some(t => t.type === 'expense');
            const hasInc    = dayTxns.some(t => t.type === 'income');
            const isToday   = isCurrentMonth && day === todayDate;
            const isSelected = day === selectedDay;
            const totalExp  = dayTxns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);

            return (
              <div
                key={day}
                style={{
                  ...styles.cell,
                  ...(isSelected ? styles.cellSelected : {}),
                  ...(isToday && !isSelected ? styles.cellToday : {}),
                }}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              >
                <span style={{
                  ...styles.dayNum,
                  color: isSelected ? '#FAEEDA' : isToday ? 'var(--brown-900)' : 'var(--brown-700)',
                  fontWeight: isToday ? '600' : '400',
                }}>
                  {day}
                </span>

                {/* dot indicators */}
                {dayTxns.length > 0 && (
                  <div style={styles.dots}>
                    {hasExp && <div style={{ ...styles.dot, background: isSelected ? '#FAC775' : '#854F0B' }} />}
                    {hasInc && <div style={{ ...styles.dot, background: isSelected ? '#C0DD97' : '#3B6D11' }} />}
                  </div>
                )}

                {/* mini total */}
                {totalExp > 0 && (
                  <span style={{
                    ...styles.miniAmt,
                    color: isSelected ? '#FAC775' : 'var(--brown-500)',
                  }}>
                    {totalExp >= 1000 ? Math.round(totalExp/1000) + 'k' : Math.round(totalExp)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* day detail */}
      {selectedDay && (
        <div style={styles.detail}>
          <div style={styles.detailHeader}>
            <div>
              <p style={styles.detailDate}>
                {new Date(year, month, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {selectedTxns.length > 0 && (
                <div style={styles.detailSummary}>
                  {selectedIncome > 0 && <span style={styles.incTag}>+{fmt(selectedIncome)}</span>}
                  {selectedExpense > 0 && <span style={styles.expTag}>−{fmt(selectedExpense)}</span>}
                </div>
              )}
            </div>
          </div>

          {selectedTxns.length === 0 ? (
            <p style={styles.noTxns}>No transactions on this day.</p>
          ) : (
            <div style={styles.txnList}>
              {selectedTxns.map(t => {
                const cat = getCategoryMeta(t.category);
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} style={styles.txnRow}>
                    <div style={{ ...styles.txnIcon, background: cat.fill }}>
                      <CategoryIcon id={cat.id} color={cat.text} size={16} />
                    </div>
                    <div style={styles.txnInfo}>
                      <p style={styles.txnDesc}>{t.description}</p>
                      {t.note && <p style={styles.txnNote}>{t.note}</p>}
                      <p style={styles.txnMeta}>
                        {cat.label}
                        {t.payment_method === 'cash' && <span style={styles.cashBadge}>cash</span>}
                      </p>
                    </div>
                    <p style={{ ...styles.txnAmt, color: isIncome ? '#3B6D11' : 'var(--brown-900)' }}>
                      {isIncome ? '+' : '−'}{fmt(t.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* if nothing selected show month summary strip */}
      {!selectedDay && (
        <div style={styles.hint}>
          <p style={styles.hintText}>Tap a day to see transactions</p>
          {Object.keys(byDay).length > 0 && (
            <p style={styles.hintSub}>{Object.keys(byDay).length} active days this month</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { padding: '16px 20px 100px' },
  calCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid #E8DCC8',
    padding: '12px',
    marginBottom: '16px',
  },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '4px',
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: '11px',
    color: 'var(--brown-500)',
    fontWeight: '500',
    padding: '4px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  cell: {
    borderRadius: '10px',
    padding: '6px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    minHeight: '52px',
    transition: 'background 0.15s',
  },
  cellSelected: {
    background: 'var(--brown-900)',
  },
  cellToday: {
    background: '#FAC77533',
  },
  dayNum: {
    fontSize: '13px',
    lineHeight: 1,
  },
  dots: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
  },
  dot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  miniAmt: {
    fontSize: '9px',
    fontWeight: '500',
    lineHeight: 1,
  },

  // detail section
  detail: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid #E8DCC8',
    overflow: 'hidden',
  },
  detailHeader: {
    padding: '14px 16px 10px',
    borderBottom: '1px solid #E8DCC8',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailDate: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'var(--font-display)',
    color: 'var(--brown-900)',
    marginBottom: '4px',
  },
  detailSummary: { display: 'flex', gap: '8px', alignItems: 'center' },
  incTag: { fontSize: '12px', fontWeight: '500', color: '#3B6D11', background: '#C0DD9755', padding: '2px 8px', borderRadius: '99px' },
  expTag: { fontSize: '12px', fontWeight: '500', color: '#854F0B', background: '#FAC77555', padding: '2px 8px', borderRadius: '99px' },
  noTxns: { padding: '20px 16px', fontSize: '13px', color: 'var(--brown-500)', textAlign: 'center' },
  txnList: { display: 'flex', flexDirection: 'column' },
  txnRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 16px',
    borderBottom: '1px solid #E8DCC8',
  },
  txnIcon: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txnInfo: { flex: 1, minWidth: 0 },
  txnDesc: { fontSize: '13px', fontWeight: '500', color: 'var(--brown-900)' },
  txnNote: { fontSize: '11px', color: 'var(--brown-500)', fontStyle: 'italic', marginTop: '1px' },
  txnMeta: { fontSize: '11px', color: 'var(--brown-700)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' },
  cashBadge: { background: '#FAC775', color: '#412402', fontSize: '9px', padding: '1px 5px', borderRadius: '99px', fontWeight: '500' },
  txnAmt: { fontSize: '14px', fontWeight: '600', fontFamily: 'var(--font-display)', flexShrink: 0 },

  hint: { textAlign: 'center', padding: '16px 0' },
  hintText: { fontSize: '13px', color: 'var(--brown-500)' },
  hintSub: { fontSize: '12px', color: 'var(--brown-700)', marginTop: '4px' },
};