import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const USER_ID = import.meta.env.VITE_USER_ID;

export function useBudget() {
  // { food: 3000, transport: 1000, ... }
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    supabase
      .from('budgets')
      .select('category, amount')
      .eq('user_id', USER_ID)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        for (const row of data) map[row.category] = Number(row.amount);
        setBudgets(map);
      });
  }, []);

  async function saveCategoryBudget(category, amount) {
    const { data } = await supabase
      .from('budgets')
      .upsert({ user_id: USER_ID, category, amount, updated_at: new Date().toISOString() })
      .select()
      .single();
    setBudgets(prev => ({ ...prev, [category]: Number(data.amount) }));
  }

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);

  return { budgets, saveCategoryBudget, totalBudget };
}