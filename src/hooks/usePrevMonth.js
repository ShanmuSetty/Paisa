import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const USER_ID = import.meta.env.VITE_USER_ID;

export function usePrevMonth(month, year) {
  const [prevTxns, setPrevTxns] = useState([]);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear  = month === 0 ? year - 1 : year;
  const mStr  = String(prevMonth + 1).padStart(2, '0');
  const nStr  = String(prevMonth + 2).padStart(2, '0');

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', USER_ID)
      .gte('txn_date', `${prevYear}-${mStr}-01`)
      .lt('txn_date',  `${prevYear}-${nStr}-01`)
      .then(({ data }) => setPrevTxns(data ?? []));
  }, [month, year]);

  return prevTxns;
}