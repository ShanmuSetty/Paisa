import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../lib/categories';

export default function SearchBar({ onSearch, onFilterType, onFilterCategory }) {
  const [query, setQuery]       = useState('');
  const [type, setType]         = useState('all');
  const [category, setCategory] = useState('all');

  function handleQuery(v) { setQuery(v); onSearch(v); }
  function handleType(v)  { setType(v);  onFilterType(v); }
  function handleCat(v)   { setCategory(v); onFilterCategory(v); }

  return (
    <div style={styles.wrap}>
      {/* search input */}
      <div style={styles.inputWrap}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.searchIcon}>
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          style={styles.input}
          placeholder="Search transactions..."
          value={query}
          onChange={e => handleQuery(e.target.value)}
        />
        {query && (
          <button style={styles.clearBtn} onClick={() => handleQuery('')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* type filter pills */}
      <div style={styles.pills}>
        {[['all','All'],['expense','Expense'],['income','Income']].map(([v, l]) => (
          <button key={v}
            style={{ ...styles.pill, ...(type === v ? styles.pillActive : {}) }}
            onClick={() => handleType(v)}>
            {l}
          </button>
        ))}
      </div>

      {/* category filter pills */}
      <div style={styles.pills}>
        <button
          style={{ ...styles.pill, ...(category === 'all' ? styles.pillActive : {}) }}
          onClick={() => handleCat('all')}>
          All categories
        </button>
        {EXPENSE_CATEGORIES.map(c => (
          <button key={c.id}
            style={{
              ...styles.pill,
              ...(category === c.id ? { background: c.fill, color: c.text, border: 'none' } : {}),
            }}
            onClick={() => handleCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: '12px 20px 4px', display: 'flex', flexDirection: 'column', gap: '10px' },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--bg-card)', border: '1px solid #E8DCC8',
    borderRadius: '99px', padding: '0 14px',
  },
  searchIcon: { color: 'var(--brown-500)', flexShrink: 0 },
  input: { flex: 1, border: 'none', background: 'none', padding: '11px 0', fontSize: '14px', color: 'var(--brown-900)', outline: 'none' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-500)', display: 'flex', flexShrink: 0 },
  pills: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  pill: {
    background: 'var(--bg-card)', border: '1px solid #E8DCC8',
    borderRadius: '99px', padding: '5px 12px',
    fontSize: '12px', color: 'var(--brown-700)',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  pillActive: { background: 'var(--brown-900)', color: 'var(--brown-300)', border: '1px solid var(--brown-900)', fontWeight: '500' },
};