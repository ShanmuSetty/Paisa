import { useState } from 'react';
import { getCategoryMeta } from '../lib/categories';
import { CategoryIcon } from '../lib/icons';
import AddForm from './AddForm';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { Icons } from '../lib/icons';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({ txns, month, year, addTxn }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAdd, setShowAdd]         = useState(false);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay    = getFirstDayOfMonth(month, year);

  const byDay = {};
  for (const t of txns) {
    const d = new Date(t.txn_date).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(t);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedTxns   = selectedDay ? (byDay[selectedDay] ?? []) : [];
  const selectedIncome  = selectedTxns.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const selectedExpense = selectedTxns.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);

  // build the pre-filled date string for AddForm
  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    : null;

  return (
    <div style={styles.wrap}>
      {/* calendar grid */}
      <div style={styles.calCard}>
        <div style={styles.dayHeaders}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={styles.dayHeader}>{d}</div>
          ))}
        </div>

        <div style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;

            const dayTxns    = byDay[day] ?? [];
            const hasExp     = dayTxns.some(t => t.type === 'expense');
            const hasInc     = dayTxns.some(t => t.type === 'income');
            const isToday    = isCurrentMonth && day === todayDate;
            const isSelected = day === selectedDay;
            const totalExp   = dayTxns.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount), 0);

            return (
              <div key={day}
                style={{ ...styles.cell, ...(isSelected ? styles.cellSelected : {}), ...(isToday && !isSelected ? styles.cellToday : {}) }}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              >
                <span style={{ ...styles.dayNum, color: isSelected ? '#FAEEDA' : isToday ? 'var(--brown-900)' : 'var(--brown-700)', fontWeight: isToday ? '600' : '400' }}>
                  {day}
                </span>
                {dayTxns.length > 0 && (
                  <div style={styles.dots}>
                    {hasExp && <div style={{ ...styles.dot, background: isSelected ? '#FAC775' : '#854F0B' }} />}
                    {hasInc && <div style={{ ...styles.dot, background: isSelected ? '#C0DD97' : '#3B6D11' }} />}
                  </div>
                )}
                {totalExp > 0 && (
                  <span style={{ ...styles.miniAmt, color: isSelected ? '#FAC775' : 'var(--brown-500)' }}>
                    {totalExp >= 1000 ? Math.round(totalExp/1000)+'k' : Math.round(totalExp)}
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
                  {selectedIncome  > 0 && <span style={styles.incTag}>+{fmt(selectedIncome)}</span>}
                  {selectedExpense > 0 && <span style={styles.expTag}>−{fmt(selectedExpense)}</span>}
                </div>
              )}
            </div>
            {/* Add for this date button */}
            <button style={styles.addDayBtn} onClick={() => setShowAdd(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add
            </button>
          </div>

          {selectedTxns.length === 0 ? (
            <div style={styles.emptyDay}>
              <p style={styles.emptyText}>Nothing logged on this day.</p>
              <button style={styles.emptyAddBtn} onClick={() => setShowAdd(true)}>
                + Add transaction
              </button>
            </div>
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

      {!selectedDay && (
        <div style={styles.hint}>
          <p style={styles.hintText}>Tap a day to view or add transactions</p>
          {Object.keys(byDay).length > 0 && (
            <p style={styles.hintSub}>{Object.keys(byDay).length} active days this month</p>
          )}
        </div>
      )}

      {/* AddForm pre-filled with selected date */}
      {showAdd && selectedDateStr && (
        <AddFormWithDate
          addTxn={addTxn}
          prefillDate={selectedDateStr}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// Wrapper that overrides the date default in AddForm
function AddFormWithDate({ addTxn, prefillDate, onClose }) {
  const [type, setType]         = useState('expense');
  const [desc, setDesc]         = useState('');
  const [amount, setAmount]     = useState('');
  const [cat, setCat]           = useState('food');
  const [note, setNote]         = useState('');
  const [method, setMethod]     = useState('bank');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');



  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function switchType(t) { setType(t); setCat(t === 'expense' ? 'food' : 'salary'); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!desc.trim()) return setErr('Add a description.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setErr('Enter a valid amount.');
    setSaving(true);
    const { error } = await addTxn({
      description: desc.trim(), amount: parseFloat(amount),
      type, category: cat, txn_date: prefillDate,
      note: note.trim() || null, payment_method: method,
    });
    setSaving(false);
    if (error) return setErr(error.message);
    onClose();
  }

  return (
    <div style={as.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={as.sheet}>
        <div style={as.handle} />
        <div style={as.titleRow}>
          <h2 style={as.title}>Add transaction</h2>
          <span style={as.dateBadge}>{new Date(prefillDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
        </div>

        <div style={as.toggle}>
          {['expense','income'].map(t => (
            <button key={t} type="button"
              style={{ ...as.toggleBtn, ...(type===t ? as.toggleActive : {}) }}
              onClick={() => switchType(t)}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={as.form}>
          <input style={as.input} placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <input style={as.input} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />

          <div style={as.catGrid}>
            {categories.map(c => (
              <button key={c.id} type="button"
                style={{ ...as.catBtn, background: cat===c.id ? c.fill : 'var(--bg-card)', color: cat===c.id ? c.text : 'var(--brown-700)', border: cat===c.id ? 'none' : '1px solid #E8DCC8' }}
                onClick={() => setCat(c.id)}>
                <CategoryIcon id={c.id} color={cat===c.id ? c.text : 'var(--brown-700)'} size={14} />
                {c.label}
              </button>
            ))}
          </div>

          <div style={as.methodRow}>
            <span style={as.methodLabel}>Pay via</span>
            <div style={as.methodToggle}>
              {[['bank', Icons.bank],['cash', Icons.cash]].map(([val, IconFn]) => (
                <button key={val} type="button"
                  style={{ ...as.methodBtn, ...(method===val ? as.methodActive : {}) }}
                  onClick={() => setMethod(val)}>
                  <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    {IconFn(method===val ? 'var(--brown-300)' : 'var(--brown-700)')}
                    {val.charAt(0).toUpperCase()+val.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <textarea style={{ ...as.input, resize:'none', height:'68px' }} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

          {err && <p style={as.err}>{err}</p>}
          <button style={as.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save transaction'}</button>
        </form>
      </div>
    </div>
  );
}

const as = {
  overlay: { position:'fixed', inset:0, background:'rgba(65,36,2,0.45)', display:'flex', alignItems:'flex-end', zIndex:110 },
  sheet: { background:'var(--bg)', borderRadius:'24px 24px 0 0', padding:'16px 20px 40px', width:'100%', maxHeight:'92vh', overflowY:'auto' },
  handle: { width:'40px', height:'4px', background:'var(--brown-300)', borderRadius:'99px', margin:'0 auto 16px' },
  titleRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  title: { fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'600', color:'var(--brown-900)' },
  dateBadge: { background:'var(--brown-900)', color:'var(--brown-300)', borderRadius:'99px', padding:'6px 14px', fontSize:'13px', fontWeight:'500' },
  toggle: { display:'flex', background:'var(--bg-card)', borderRadius:'var(--radius-sm)', padding:'4px', marginBottom:'16px', gap:'4px' },
  toggleBtn: { flex:1, padding:'8px', border:'none', borderRadius:'8px', fontSize:'14px', textTransform:'capitalize', color:'var(--brown-500)', background:'none', cursor:'pointer' },
  toggleActive: { background:'var(--brown-900)', color:'var(--brown-300)', fontWeight:'500' },
  form: { display:'flex', flexDirection:'column', gap:'12px' },
  input: { background:'var(--bg-card)', border:'1px solid #E8DCC8', borderRadius:'var(--radius-sm)', padding:'12px 14px', fontSize:'15px', color:'var(--brown-900)', outline:'none', width:'100%' },
  catGrid: { display:'flex', flexWrap:'wrap', gap:'8px' },
  catBtn: { borderRadius:'99px', padding:'6px 12px', fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'5px' },
  methodRow: { display:'flex', alignItems:'center', gap:'12px' },
  methodLabel: { fontSize:'13px', color:'var(--brown-700)', flexShrink:0 },
  methodToggle: { display:'flex', background:'var(--bg-card)', border:'1px solid #E8DCC8', borderRadius:'99px', padding:'3px', gap:'4px', flex:1 },
  methodBtn: { flex:1, padding:'6px 10px', border:'none', borderRadius:'99px', fontSize:'13px', color:'var(--brown-700)', background:'none', cursor:'pointer' },
  methodActive: { background:'var(--brown-900)', color:'var(--brown-300)', fontWeight:'500' },
  err: { fontSize:'13px', color:'#A32D2D' },
  saveBtn: { background:'var(--brown-900)', color:'var(--brown-300)', border:'none', borderRadius:'var(--radius-md)', padding:'16px', fontSize:'16px', fontWeight:'500', fontFamily:'var(--font-display)', cursor:'pointer', marginTop:'4px' },
};

const styles = {
  wrap: { padding:'16px 20px 100px' },
  calCard: { background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid #E8DCC8', padding:'12px', marginBottom:'16px' },
  dayHeaders: { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:'4px' },
  dayHeader: { textAlign:'center', fontSize:'11px', color:'var(--brown-500)', fontWeight:'500', padding:'4px 0' },
  grid: { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px' },
  cell: { borderRadius:'10px', padding:'6px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', cursor:'pointer', minHeight:'52px', transition:'background 0.15s' },
  cellSelected: { background:'var(--brown-900)' },
  cellToday: { background:'#FAC77533' },
  dayNum: { fontSize:'13px', lineHeight:1 },
  dots: { display:'flex', gap:'2px', alignItems:'center' },
  dot: { width:'5px', height:'5px', borderRadius:'50%' },
  miniAmt: { fontSize:'9px', fontWeight:'500', lineHeight:1 },
  detail: { background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid #E8DCC8', overflow:'hidden' },
  detailHeader: { padding:'14px 16px 10px', borderBottom:'1px solid #E8DCC8', display:'flex', justifyContent:'space-between', alignItems:'center' },
  detailDate: { fontSize:'14px', fontWeight:'600', fontFamily:'var(--font-display)', color:'var(--brown-900)', marginBottom:'4px' },
  detailSummary: { display:'flex', gap:'8px', alignItems:'center' },
  incTag: { fontSize:'12px', fontWeight:'500', color:'#3B6D11', background:'#C0DD9755', padding:'2px 8px', borderRadius:'99px' },
  expTag: { fontSize:'12px', fontWeight:'500', color:'#854F0B', background:'#FAC77555', padding:'2px 8px', borderRadius:'99px' },
  addDayBtn: { display:'flex', alignItems:'center', gap:'5px', background:'var(--brown-900)', color:'var(--brown-300)', border:'none', borderRadius:'99px', padding:'7px 14px', fontSize:'13px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font-body)', flexShrink:0 },
  emptyDay: { padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' },
  emptyText: { fontSize:'13px', color:'var(--brown-500)' },
  emptyAddBtn: { background:'var(--brown-900)', color:'var(--brown-300)', border:'none', borderRadius:'99px', padding:'10px 20px', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'var(--font-body)' },
  txnList: { display:'flex', flexDirection:'column' },
  txnRow: { display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', borderBottom:'1px solid #E8DCC8' },
  txnIcon: { width:'34px', height:'34px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  txnInfo: { flex:1, minWidth:0 },
  txnDesc: { fontSize:'13px', fontWeight:'500', color:'var(--brown-900)' },
  txnNote: { fontSize:'11px', color:'var(--brown-500)', fontStyle:'italic', marginTop:'1px' },
  txnMeta: { fontSize:'11px', color:'var(--brown-700)', marginTop:'2px', display:'flex', alignItems:'center', gap:'6px' },
  cashBadge: { background:'#FAC775', color:'#412402', fontSize:'9px', padding:'1px 5px', borderRadius:'99px', fontWeight:'500' },
  txnAmt: { fontSize:'14px', fontWeight:'600', fontFamily:'var(--font-display)', flexShrink:0 },
  hint: { textAlign:'center', padding:'16px 0' },
  hintText: { fontSize:'13px', color:'var(--brown-500)' },
  hintSub: { fontSize:'12px', color:'var(--brown-700)', marginTop:'4px' },
};