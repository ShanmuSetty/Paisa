// All app icons as clean SVGs

export const Icons = {
  // categories - expense
  food: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 7C3 5 5 3 10 3C15 3 17 5 17 7V8H3V7Z" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M3 8H17L16 17H4L3 8Z" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M7 11H13M8 14H12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  transport: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="9" rx="2" stroke={color} strokeWidth="1.4"/>
      <path d="M2 10H18" stroke={color} strokeWidth="1.4"/>
      <circle cx="6" cy="17" r="1.5" stroke={color} strokeWidth="1.3"/>
      <circle cx="14" cy="17" r="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M6 6V4M14 6V4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  apparel: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 2L4 5L2 4L4 9H7V18H13V9H16L18 4L16 5L13 2C13 2 12 4 10 4C8 4 7 2 7 2Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    </svg>
  ),
  skincare: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C10 2 14 5 14 9C14 12 12.2 14 10 14C7.8 14 6 12 6 9C6 5 10 2 10 2Z" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M7 16H13M8 18H12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10 14V16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  bills: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <path d="M7 7H13M7 10H13M7 13H10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  entertainment: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.4"/>
      <polygon points="8,7 14,10 8,13" stroke={color} strokeWidth="1.3" fill={color}/>
    </svg>
  ),
  misc: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="8" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.4"/>
      <path d="M7 8V6C7 4.3 8.3 3 10 3C11.7 3 13 4.3 13 6V8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),

  // categories - income
  salary: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="11" rx="2" stroke={color} strokeWidth="1.4"/>
      <circle cx="10" cy="10.5" r="2.5" stroke={color} strokeWidth="1.3"/>
      <path d="M2 8H5M15 8H18M2 13H5M15 13H18" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  allowance: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
    </svg>
  ),
  returns: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10C4 6.7 6.7 4 10 4C12.2 4 14.1 5.2 15.2 7" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12 4L15.5 7L12 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M16 10C16 13.3 13.3 16 10 16C7.8 16 5.9 14.8 4.8 13" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 16L4.5 13L8 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),

  // ui icons
  bank: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 8L10 3L18 8H2Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      <rect x="2" y="15" width="16" height="2" rx="1" stroke={color} strokeWidth="1.3" fill="none"/>
      <path d="M5 8V15M10 8V15M15 8V15" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  cash: (color='currentColor') => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="5" width="18" height="10" rx="2" stroke={color} strokeWidth="1.4"/>
      <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.3"/>
      <path d="M1 8H4M16 8H19M1 12H4M16 12H19" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  close: (color='currentColor') => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4L14 14M14 4L4 14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  chevronRight: (color='currentColor') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export function CategoryIcon({ id, color, size = 20 }) {
  const iconFn = Icons[id] ?? Icons.misc;
  return (
    <span style={{ display: 'flex', alignItems: 'center', width: size, height: size }}>
      {iconFn(color)}
    </span>
  );
}