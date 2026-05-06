import { getCategoryMeta } from '../lib/categories';
import { CategoryIcon } from '../lib/icons';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

export default function CategorySheet({ category, txns, onClose }) {
  const cat      = getCategoryMeta(category);
  const filtered = txns.filter(t => t.category === category);
  const total    = filtered.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <div style={{ ...styles.header, background: cat.fill }}>
          <div style={styles.headerLeft}>
            <div style={styles.iconWrap}>
              <CategoryIcon id={cat.id} color={cat.text} size={24} />
            </div>
            <div>
              <p style={{ ...styles.catName, color: cat.text }}>{cat.label}</p>
              <p style={{ ...styles.catTotal, color: cat.text }}>{fmt(total)} spent</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke={cat.text} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={styles.list}>
          {filtered.length === 0 && <p style={styles.empty}>No transactions in this category yet.</p>}
          {filtered.map(t => (
            <div key={t.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <p style={styles.desc}>{t.description}</p>
                {t.note && <p style={styles.note}>{t.note}</p>}
                <p style={styles.meta}>
                  {fmtDate(t.txn_date)}
                  {t.payment_method === 'cash' && <span style={styles.cashBadge}>cash</span>}
                </p>
              </div>
              <p style={styles.amt}>−{fmt(t.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(65,36,2,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: 'var(--bg)', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' },
  handle: { width: '40px', height: '4px', background: 'var(--brown-300)', borderRadius: '99px', margin: '14px auto 0', flexShrink: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', margin: '12px 16px', borderRadius: 'var(--radius-md)', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: '16px', fontWeight: '600', fontFamily: 'var(--font-display)' },
  catTotal: { fontSize: '13px', marginTop: '2px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  list: { flex: 1, overflowY: 'auto', padding: '0 16px 32px' },
  empty: { textAlign: 'center', color: 'var(--brown-500)', fontSize: '14px', padding: '32px 0' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #E8DCC8' },
  rowLeft: { flex: 1, minWidth: 0 },
  desc: { fontSize: '14px', fontWeight: '500', color: 'var(--brown-900)' },
  note: { fontSize: '12px', color: 'var(--brown-500)', fontStyle: 'italic', marginTop: '2px' },
  meta: { fontSize: '12px', color: 'var(--brown-700)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' },
  cashBadge: { background: '#FAC775', color: '#412402', fontSize: '10px', padding: '1px 6px', borderRadius: '99px', fontWeight: '500' },
  amt: { fontSize: '15px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--brown-900)', flexShrink: 0, marginLeft: '12px' },
};