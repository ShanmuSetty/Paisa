import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import { useDebts } from './hooks/useDebts';
import { usePrevMonth } from './hooks/usePrevMonth';
import Header from './components/Header';
import StatsRow from './components/StatsRow';
import CashBalance from './components/CashBalance';
import CategoryGrid from './components/CategoryGrid';
import TransactionList from './components/TransactionList';
import CalendarView from './components/CalendarView';
import SearchBar from './components/SearchBar';
import AddForm from './components/AddForm';
import AiChat from './components/AiChat';
import StatsPanel from './components/StatsPanel';
import CategorySheet from './components/CategorySheet';
import DebtsPanel from './components/DebtsPanel';
import './styles/globals.css';

const AiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2C11 2 12.5 6.5 16 8C12.5 9.5 11 14 11 14C11 14 9.5 9.5 6 8C9.5 6.5 11 2 11 2Z" fill="currentColor"/>
    <path d="M4.5 14.5C4.5 14.5 5.3 16.8 7 17.5C5.3 18.2 4.5 20.5 4.5 20.5C4.5 20.5 3.7 18.2 2 17.5C3.7 16.8 4.5 14.5 4.5 14.5Z" fill="currentColor"/>
    <path d="M17 13C17 13 17.6 14.8 19 15.5C17.6 16.2 17 18 17 18C17 18 16.4 16.2 15 15.5C16.4 14.8 17 13 17 13Z" fill="currentColor"/>
  </svg>
);
const StatsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="12" width="4" height="8" rx="1.5" fill="currentColor" opacity="0.5"/>
    <rect x="9" y="7" width="4" height="13" rx="1.5" fill="currentColor" opacity="0.75"/>
    <rect x="16" y="3" width="4" height="17" rx="1.5" fill="currentColor"/>
  </svg>
);
const DebtsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 6V11H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 16L14.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [tab, setTab]               = useState('overview');
  const [showAdd, setShowAdd]       = useState(false);
  const [showAi, setShowAi]         = useState(false);
  const [showStats, setShowStats]   = useState(false);
  const [showDebts, setShowDebts]   = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterType, setFilterType]         = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());

  const { txns, loading, addTxn, updateTxn, deleteTxn, totalIncome, totalExpense } = useTransactions(month, year);
  const { budgets, saveCategoryBudget, totalBudget } = useBudget();
  const { debts, addDebt, settleDebt, deleteDebt } = useDebts();
  const prevTxns = usePrevMonth(month, year);

  return (
    <div style={styles.app}>
      <Header month={month} year={year} setMonth={setMonth} setYear={setYear} />

      <div style={styles.scroll}>
        <StatsRow totalIncome={totalIncome} totalExpense={totalExpense} totalBudget={totalBudget} />
        <CashBalance txns={txns} />

        {debts.length > 0 && (
          <button style={styles.debtStrip} onClick={() => setShowDebts(true)}>
            <span>Debts — {debts.filter(d=>d.direction==='they_owe').length} receivable · {debts.filter(d=>d.direction==='i_owe').length} payable</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#4A1B0C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div style={styles.tabs}>
          {[['overview','Overview'],['calendar','Calendar'],['txns','Transactions']].map(([id, label]) => (
            <button key={id}
              style={{ ...styles.tabBtn, ...(tab === id ? styles.tabActive : {}) }}
              onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'txns' && (
          <SearchBar
            onSearch={setSearchQuery}
            onFilterType={setFilterType}
            onFilterCategory={setFilterCategory}
          />
        )}

        {tab === 'overview' && <CategoryGrid txns={txns} budgets={budgets} saveCategoryBudget={saveCategoryBudget} onCategoryClick={setActiveCategory} />}
        {tab === 'calendar' && <CalendarView txns={txns} month={month} year={year} />}
        {tab === 'txns'     && <TransactionList txns={txns} deleteTxn={deleteTxn} updateTxn={updateTxn} loading={loading} searchQuery={searchQuery} filterType={filterType} filterCategory={filterCategory} />}
      </div>

      <div style={styles.bar}>
        <div style={styles.leftNav}>
          <button style={styles.navBtn} onClick={() => setShowAi(true)}>
            <AiIcon /><span style={styles.navLabel}>Ask AI</span>
          </button>
        </div>
        <button style={styles.fab} onClick={() => setShowAdd(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div style={styles.rightNav}>
          <button style={styles.navBtn} onClick={() => setShowStats(true)}>
            <StatsIcon /><span style={styles.navLabel}>Stats</span>
          </button>
          <button style={styles.navBtn} onClick={() => setShowDebts(true)}>
            <DebtsIcon /><span style={styles.navLabel}>Debts</span>
          </button>
        </div>
      </div>

      {showAdd   && <AddForm addTxn={addTxn} onClose={() => setShowAdd(false)} />}
      {showAi    && <AiChat txns={txns} budgets={budgets} onClose={() => setShowAi(false)} />}
      {showStats && <StatsPanel txns={txns} budgets={budgets} prevTxns={prevTxns} month={month} year={year} onClose={() => setShowStats(false)} />}
      {showDebts && <DebtsPanel debts={debts} addDebt={addDebt} settleDebt={settleDebt} deleteDebt={deleteDebt} addTxn={addTxn} onClose={() => setShowDebts(false)} />}
      {activeCategory && <CategorySheet category={activeCategory} txns={txns} onClose={() => setActiveCategory(null)} />}
    </div>
  );
}

const styles = {
  app: { maxWidth: '430px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)', position: 'relative', display: 'flex', flexDirection: 'column' },
  scroll: { flex: 1, overflowY: 'auto', paddingBottom: '100px' },
  debtStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 20px 0', padding: '10px 14px', background: '#F5C4B3', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', width: 'calc(100% - 40px)', fontSize: '13px', color: '#4A1B0C', fontFamily: 'var(--font-body)' },
  tabs: { display: 'flex', gap: '6px', padding: '16px 20px 4px' },
  tabBtn: { background: 'var(--bg-card)', border: '1px solid #E8DCC8', borderRadius: '99px', padding: '6px 14px', fontSize: '13px', color: 'var(--brown-700)', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' },
  tabActive: { background: 'var(--brown-900)', color: 'var(--brown-300)', border: '1px solid var(--brown-900)', fontWeight: '500' },
  bar: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '12px 28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to top, var(--bg) 65%, transparent)', pointerEvents: 'none' },
  navBtn: { pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-700)', padding: '6px', borderRadius: 'var(--radius-sm)' },
  navLabel: { fontSize: '10px', color: 'var(--brown-700)', fontFamily: 'var(--font-body)', letterSpacing: '0.2px' },
  fab: { pointerEvents: 'all', width: '58px', height: '58px', borderRadius: '50%', background: 'var(--brown-900)', color: 'var(--brown-300)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(65,36,2,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  leftNav: { pointerEvents: 'all', display: 'flex', alignItems: 'center', width: '120px', justifyContent: 'flex-start' },
  rightNav: { pointerEvents: 'all', display: 'flex', gap: '8px', alignItems: 'center', width: '120px', justifyContent: 'flex-end' },
};