import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  Wallet,
  ReceiptText,
  TrendingUp,
  CircleHelp,
  UserRound,
  AlertCircle,
} from 'lucide-react';

import { sendAssistantMessage } from '../services/aiAssistantService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const suggestions = [
  {
    icon: Wallet,
    title: 'Show my wallet balance',
    prompt: 'What are my current wallet balances?',
  },
  {
    icon: ReceiptText,
    title: 'Explain my latest transaction',
    prompt: 'Explain my latest transaction in simple terms.',
  },
  {
    icon: TrendingUp,
    title: 'Summarize my activity',
    prompt: 'Summarize my recent wallet activity.',
  },
  {
    icon: CircleHelp,
    title: 'How do withdrawals work?',
    prompt: 'Explain how withdrawals work in VELOOP Wallet.',
  },
];

const initialMessage = {
  role: 'assistant',
  content:
    "Hi! I'm VELOOP AI, your wallet assistant. I can help you understand your balances, recent transactions, and wallet activity. What would you like to know?",
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const requestLock = useRef(false);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages, loading]);

  async function submit(text = input) {
    const question = text.trim();

    if (!question || requestLock.current) return;

    requestLock.current = true;

    const conversation = messages
      .filter((message) =>
        ['user', 'assistant'].includes(message.role)
      )
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [
      ...current,
      { role: 'user', content: question },
    ]);

    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await sendAssistantMessage(
        question,
        conversation
      );

      const answer =
        response?.answer ||
        response?.data?.answer ||
        'I could not generate a response. Please try again.';

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: answer },
      ]);
    } catch (err) {
      console.error('AI Assistant error:', err);

      setError(
        err?.message ||
          'Unable to connect to the AI assistant. Please try again.'
      );
    } finally {
      setLoading(false);
      requestLock.current = false;

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }

  function resetChat() {
    if (requestLock.current) return;

    setMessages([initialMessage]);
    setError('');
    setInput('');
  }

  return (
    <div className="page-stack ai-assistant-page">
      <div className="page-intro">
        <div>
          <div className="eyebrow">
            <Sparkles size={13} />
            GROQ-POWERED AI
          </div>

          <h1>
            AI Financial <span className="gradient-text">Assistant</span>
          </h1>

          <p>
            Ask questions about your VELOOP wallet, transactions, and
            account activity.
          </p>
        </div>

        <button
          className="btn-outline"
          onClick={resetChat}
          disabled={loading}
          type="button"
        >
          <RotateCcw size={15} />
          New chat
        </button>
      </div>

      <div className="ai-assistant-layout">
        <section className="glass-card ai-chat-card">
          <div className="ai-chat-header">
            <div className="ai-avatar">
              <Bot size={22} />
            </div>

            <div className="ai-chat-title">
              <b>VELOOP AI Assistant</b>
              <span>
                <i className="status-dot" />
                Online · Wallet-aware support
              </span>
            </div>

            <span className="ai-model-chip">Groq AI</span>
          </div>

          <div className="ai-message-list">
            {messages.map((message, index) => (
              <div
                className={`ai-message-row ${
                  message.role === 'user'
                    ? 'user-message-row'
                    : ''
                }`}
                key={`${index}-${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="ai-message-avatar">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`ai-message ${
                    message.role === 'user'
                      ? 'user-message'
                      : 'assistant-message'
                  }`}
                >
                  <div className="ai-message-label">
                    {message.role === 'user'
                      ? 'You'
                      : 'VELOOP AI'}
                  </div>

                  <div className="ai-message-content ai-markdown">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="ai-message-avatar user-ai-avatar">
                    <UserRound size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-message-row">
                <div className="ai-message-avatar">
                  <Bot size={15} />
                </div>

                <div className="ai-message assistant-message">
                  <div className="ai-message-label">VELOOP AI</div>

                  <div className="ai-thinking">
                    <span />
                    <span />
                    <span />
                    Thinking…
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert error-alert ai-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            className="ai-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about your wallet or transactions…"
              rows={1}
              maxLength={1000}
              disabled={loading}
            />

            <button
              type="submit"
              className="ai-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>

          <div className="ai-disclaimer">
            AI responses are informational. Your wallet balance and
            transaction records remain controlled by VELOOP backend
            systems.
          </div>
        </section>

        <aside className="ai-side-panel">
          <div className="glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">QUICK PROMPTS</span>
                <h2>Try asking</h2>
              </div>

              <Sparkles size={18} color="#60a5fa" />
            </div>

            <div className="ai-suggestions">
              {suggestions.map(({ icon: Icon, title, prompt }) => (
                <button
                  key={title}
                  className="ai-suggestion"
                  onClick={() => submit(prompt)}
                  disabled={loading}
                  type="button"
                >
                  <span className="ai-suggestion-icon">
                    <Icon size={17} />
                  </span>

                  <span>{title}</span>
                  <span className="ai-suggestion-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card ai-security-card">
            <div className="ai-security-icon">
              <Wallet size={18} />
            </div>

            <b>Private &amp; secure</b>

            <p>
              Your request uses your authenticated session. The
              assistant only receives your wallet summary and recent
              transaction details needed to answer.
            </p>

            <div className="ai-security-footer">
              <span className="status-dot" />
              Protected by VELOOP API
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}