export const EXPENSE_CATEGORIES = [
  { id: 'food',          label: 'Food',          fill: '#9FE1CB', text: '#04342C' },
  { id: 'transport',     label: 'Transport',     fill: '#F5C4B3', text: '#4A1B0C' },
  { id: 'apparel',       label: 'Apparel',       fill: '#CECBF6', text: '#26215C' },
  { id: 'skincare',      label: 'Skin care',     fill: '#F4C0D1', text: '#4B1528' },
  { id: 'bills',         label: 'Bills',         fill: '#B5D4F4', text: '#042C53' },
  { id: 'entertainment', label: 'Entertainment', fill: '#FAC775', text: '#412402' },
  { id: 'misc',          label: 'Misc',          fill: '#D3D1C7', text: '#2C2C2A' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary',    label: 'Salary',    fill: '#C0DD97', text: '#173404' },
  { id: 'allowance', label: 'Allowance', fill: '#C0DD97', text: '#173404' },
  { id: 'returns',   label: 'Returns',   fill: '#C0DD97', text: '#173404' },
];

export function getCategoryMeta(id) {
  return (
    EXPENSE_CATEGORIES.find(c => c.id === id) ||
    INCOME_CATEGORIES.find(c => c.id === id) ||
    { id, label: id, fill: '#D3D1C7', text: '#2C2C2A' }
  );
}