import { useState, useRef, useEffect } from 'react';
import { useAi } from '../hooks/useAi';

const SUGGESTIONS = [
  'Where am I overspending?',
  'How can I save ₹2,000 this month?',
  'Rate my spending habits',
  'Which category costs me the most?',
  'Give me a weekly budget breakdown',
];

export default function AiChat({ txns, budgets, onClose }) {
  const { messages, loading, sendMessage, clearChat } = useAi(txns, budgets);
  const [input, setInput]   = useState('');
  const bottomRef           = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSend(text) {
    const msg = text ?? input.trim();
    if (!msg) return;
    setInput('');
    sendMessage(msg);
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        {/* handle + header */}
        <div style={styles.handle} />
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.sparkle}>✦</span>
            <span style={styles.title}>AI assistant</span>
          </div>
          <div style={styles.headerRight}>
            {messages.length > 0 && (
              <button style={styles.clearBtn} onClick={clearChat}>Clear</button>
            )}
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* messages */}
        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>Ask me anything about your money</p>
              <div style={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button key={s} style={styles.suggBtn} onClick={() => handleSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
              {m.role === 'ai' && <span style={styles.aiLabel}>✦ paisa AI</span>}
              <p style={styles.bubbleText}>{m.text}</p>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              <span style={styles.aiLabel}>✦ paisa AI</span>
              <p style={styles.typing}>thinking<span style={styles.dot1}>.</span><span style={styles.dot2}>.</span><span style={styles.dot3}>.</span></p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Ask about your spending..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
        .d1{animation:blink 1.2s infinite 0s}
        .d2{animation:blink 1.2s infinite 0.2s}
        .d3{animation:blink 1.2s infinite 0.4s}
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(65,36,2,0.45)',
    display: 'flex', alignItems: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    background: 'var(--bg)',
    borderRadius: '24px 24px 0 0',
    width: '100%',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
  },
  handle: {
    width: '40px', height: '4px',
    background: 'var(--brown-300)',
    borderRadius: '99px',
    margin: '14px auto 0',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px 8px',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  sparkle: { fontSize: '18px', color: 'var(--brown-500)' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--brown-900)',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  clearBtn: {
    background: 'none', border: 'none',
    fontSize: '13px', color: 'var(--brown-500)',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'none', border: 'none',
    fontSize: '16px', color: 'var(--brown-700)',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  emptyState: {
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyTitle: {
    fontSize: '14px',
    color: 'var(--brown-500)',
    textAlign: 'center',
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  suggBtn: {
    background: 'var(--bg-card)',
    border: '1px solid #E8DCC8',
    borderRadius: '99px',
    padding: '8px 14px',
    fontSize: '13px',
    color: 'var(--brown-700)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    textAlign: 'left',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: '16px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userBubble: {
    background: 'var(--brown-900)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
  },
  aiBubble: {
    background: 'var(--bg-card)',
    border: '1px solid #E8DCC8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px',
  },
  aiLabel: {
    fontSize: '11px',
    color: 'var(--brown-500)',
    fontWeight: '500',
  },
  bubbleText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--brown-900)',
    whiteSpace: 'pre-wrap',
  },
  typing: {
    fontSize: '14px',
    color: 'var(--brown-700)',
    display: 'flex',
    gap: '2px',
  },
  dot1: { display: 'inline-block', animation: 'blink 1.2s infinite 0s' },
  dot2: { display: 'inline-block', animation: 'blink 1.2s infinite 0.2s' },
  dot3: { display: 'inline-block', animation: 'blink 1.2s infinite 0.4s' },
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px 32px',
    borderTop: '1px solid #E8DCC8',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid #E8DCC8',
    borderRadius: '99px',
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--brown-900)',
    outline: 'none',
  },
  sendBtn: {
    width: '44px', height: '44px',
    borderRadius: '50%',
    background: 'var(--brown-900)',
    color: 'var(--brown-300)',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};