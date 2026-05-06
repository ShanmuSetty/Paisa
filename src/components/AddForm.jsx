import { useState, useRef } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { CategoryIcon, Icons } from '../lib/icons';
import { parseUPIScreenshot } from '../lib/parseUPI';

const today = () => new Date().toISOString().split('T')[0];

export default function AddForm({ addTxn, onClose }) {
  const [type, setType]         = useState('expense');
  const [desc, setDesc]         = useState('');
  const [amount, setAmount]     = useState('');
  const [cat, setCat]           = useState('food');
  const [date, setDate]         = useState(today());
  const [note, setNote]         = useState('');
  const [method, setMethod]     = useState('bank');
  const [saving, setSaving]     = useState(false);
  const [parsing, setParsing]   = useState(false);
  const [parseErr, setParseErr] = useState('');
  const [err, setErr]           = useState('');
  const fileRef = useRef();

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function switchType(t) {
    setType(t);
    setCat(t === 'expense' ? 'food' : 'salary');
  }

  async function handleScreenshot(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseErr('');
    setParsing(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const result = await parseUPIScreenshot(base64, file.type);
      if (result.amount)      setAmount(String(result.amount));
      if (result.description) setDesc(result.description);
      if (result.date)        setDate(result.date);
      if (result.type)        switchType(result.type);
    } catch {
      setParseErr('Could not read screenshot. Fill in manually.');
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!desc.trim()) return setErr('Add a description.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setErr('Enter a valid amount.');
    setSaving(true);
    const { error } = await addTxn({
      description: desc.trim(), amount: parseFloat(amount),
      type, category: cat, txn_date: date,
      note: note.trim() || null, payment_method: method,
    });
    setSaving(false);
    if (error) return setErr(error.message);
    onClose();
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.sheet}>
        <div style={s.handle} />

        <div style={s.titleRow}>
          <h2 style={s.title}>Add transaction</h2>
          <button style={s.scanBtn} type="button" onClick={() => fileRef.current.click()} disabled={parsing}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="9" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6 2H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span style={s.scanLabel}>{parsing ? 'Reading...' : 'Scan UPI'}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleScreenshot} />
        </div>

        {parsing && <div style={s.parsingBanner}>Reading your screenshot with AI...</div>}
        {parseErr && <p style={s.parseErr}>{parseErr}</p>}

        <div style={s.toggle}>
          {['expense','income'].map(t => (
            <button key={t} type="button"
              style={{ ...s.toggleBtn, ...(type === t ? s.toggleActive : {}) }}
              onClick={() => switchType(t)}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <input style={s.input} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />

          <div style={s.catGrid}>
            {categories.map(c => (
              <button key={c.id} type="button"
                style={{ ...s.catBtn, background: cat===c.id ? c.fill : 'var(--bg-card)', color: cat===c.id ? c.text : 'var(--brown-700)', border: cat===c.id ? 'none' : '1px solid #E8DCC8' }}
                onClick={() => setCat(c.id)}>
                <CategoryIcon id={c.id} color={cat===c.id ? c.text : 'var(--brown-700)'} size={14} />
                {c.label}
              </button>
            ))}
          </div>

          <div style={s.methodRow}>
            <span style={s.methodLabel}>Pay via</span>
            <div style={s.methodToggle}>
              {[['bank', Icons.bank],['cash', Icons.cash]].map(([val, IconFn]) => (
                <button key={val} type="button"
                  style={{ ...s.methodBtn, ...(method===val ? s.methodActive : {}) }}
                  onClick={() => setMethod(val)}>
                  <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    {IconFn(method===val ? 'var(--brown-300)' : 'var(--brown-700)')}
                    {val.charAt(0).toUpperCase()+val.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <input style={s.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <textarea style={{ ...s.input, resize:'none', height:'72px' }} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

          {err && <p style={s.err}>{err}</p>}
          <button style={s.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save transaction'}</button>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(65,36,2,0.45)', display:'flex', alignItems:'flex-end', zIndex:100 },
  sheet: { background:'var(--bg)', borderRadius:'24px 24px 0 0', padding:'16px 20px 40px', width:'100%', maxHeight:'92vh', overflowY:'auto' },
  handle: { width:'40px', height:'4px', background:'var(--brown-300)', borderRadius:'99px', margin:'0 auto 16px' },
  titleRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  title: { fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'600', color:'var(--brown-900)' },
  scanBtn: { display:'flex', alignItems:'center', gap:'6px', background:'var(--brown-900)', color:'var(--brown-300)', border:'none', borderRadius:'99px', padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-body)' },
  scanLabel: { fontSize:'13px', fontWeight:'500' },
  parsingBanner: { background:'#FAC77533', border:'1px solid #FAC775', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:'13px', color:'var(--brown-700)', marginBottom:'12px', textAlign:'center' },
  parseErr: { fontSize:'13px', color:'#A32D2D', marginBottom:'8px' },
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