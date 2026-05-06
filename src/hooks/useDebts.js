import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const USER_ID = import.meta.env.VITE_USER_ID;

export function useDebts() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    supabase
      .from('debts')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('settled', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDebts(data ?? []));
  }, []);

  async function addDebt(debt) {
    const { data, error } = await supabase
      .from('debts')
      .insert({ ...debt, user_id: USER_ID })
      .select()
      .single();
    if (!error) setDebts(prev => [data, ...prev]);
    return { data, error };
  }

  async function settleDebt(debt, addTxn) {
    // mark settled
    await supabase.from('debts').update({ settled: true }).eq('id', debt.id);
    setDebts(prev => prev.filter(d => d.id !== debt.id));

    // create transaction
    if (debt.direction === 'they_owe') {
      // money comes in — income > returns
      await addTxn({
        description: `Settled: ${debt.person} paid back`,
        amount: debt.amount,
        type: 'income',
        category: 'returns',
        txn_date: new Date().toISOString().split('T')[0],
        note: debt.note || null,
        payment_method: 'bank',
      });
    } else {
      // money goes out — expense > misc
      await addTxn({
        description: `Settled: paid back ${debt.person}`,
        amount: debt.amount,
        type: 'expense',
        category: 'misc',
        txn_date: new Date().toISOString().split('T')[0],
        note: debt.note || null,
        payment_method: 'bank',
      });
    }
  }

  async function deleteDebt(id) {
    await supabase.from('debts').delete().eq('id', id);
    setDebts(prev => prev.filter(d => d.id !== id));
  }

  return { debts, addDebt, settleDebt, deleteDebt };
}