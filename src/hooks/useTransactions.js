import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const USER_ID = import.meta.env.VITE_USER_ID;

export function useTransactions(month, year) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStr  = String(month + 1).padStart(2, '0');
  const nextMonth = String(month + 2).padStart(2, '0');

  useEffect(() => {
    setLoading(true);
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', USER_ID)
      .gte('txn_date', `${year}-${monthStr}-01`)
      .lt('txn_date',  `${year}-${nextMonth}-01`)
      .order('txn_date', { ascending: false })
      .then(({ data }) => {
        setTxns(data ?? []);
        setLoading(false);
      });
  }, [month, year]);

  async function addTxn(txn) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...txn, user_id: USER_ID })
      .select()
      .single();
    if (!error) setTxns(prev => [data, ...prev]);
    return { data, error };
  }

  async function updateTxn(updated) {
    setTxns(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  async function deleteTxn(id) {
    await supabase.from('transactions').delete().eq('id', id);
    setTxns(prev => prev.filter(t => t.id !== id));
  }

  const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  return { txns, loading, addTxn, updateTxn, deleteTxn, totalIncome, totalExpense };
}