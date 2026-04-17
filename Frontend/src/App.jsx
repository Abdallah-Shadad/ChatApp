import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from './api.js'
import { hub } from './hub.js'

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  :root {
    --bg:        #0a0a0f;
    --surface:   #11111a;
    --panel:     #16161f;
    --border:    #1e1e2e;
    --border2:   #2a2a3e;
    --accent:    #6c63ff;
    --accent2:   #a78bfa;
    --accent3:   #38bdf8;
    --danger:    #f87171;
    --success:   #4ade80;
    --text:      #e8e8f0;
    --text2:     #9090b0;
    --text3:     #5a5a7a;
    --bubble-me: #1e1b4b;
    --bubble-them: #14141e;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius:    14px;
    --radius-sm: 8px;
    --shadow:    0 8px 32px rgba(0,0,0,0.4);
    --glow:      0 0 20px rgba(108,99,255,0.15);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    overflow: hidden;
  }

  /* ── AUTH SCREEN ── */
  .auth-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56,189,248,0.06) 0%, transparent 50%),
      var(--bg);
  }

  .auth-card {
    background: var(--surface);
    padding: 40px;
    border-radius: var(--radius);
    width: 100%;
    max-width: 480px; /* Increased from 400px for a better look */
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    animation: fadeIn 0.4s ease-out;
  } 

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 36px;
  }

  .auth-logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .auth-logo-text {
    font-family: var(--font-head);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .auth-logo-text span { color: var(--accent2); }

  .auth-title {
    font-family: var(--font-head);
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .auth-sub {
    color: var(--text2);
    font-size: 14px;
    margin-bottom: 32px;
  }

  .field {
    margin-bottom: 16px;
  }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text2);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }

  .field input {
    width: 100%;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
  }

  .field input::placeholder { color: var(--text3); }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 24px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    color: #fff;
    margin-top: 8px;
    box-shadow: 0 4px 16px rgba(108,99,255,0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(108,99,255,0.4);
  }

  .btn-primary:active:not(:disabled) { transform: translateY(0); }

  .btn-ghost {
    background: transparent;
    color: var(--text2);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--panel);
    color: var(--text);
    border-color: var(--border2);
  }

  .btn-danger {
    background: rgba(248,113,113,0.1);
    color: var(--danger);
    border: 1px solid rgba(248,113,113,0.2);
  }

  .btn-danger:hover:not(:disabled) {
    background: rgba(248,113,113,0.2);
  }

  .auth-switch {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: var(--text2);
  }

  .auth-switch button {
    background: none;
    border: none;
    color: var(--accent2);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    padding: 0;
    transition: color 0.2s;
  }

  .auth-switch button:hover { color: var(--accent); }

  .error-banner {
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    color: var(--danger);
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── APP SHELL ── */
  .app-shell {
    display: flex;
    height: 100vh;
    background: var(--bg);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 300px;
    min-width: 300px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-mark {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .logo-name {
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .logo-name span { color: var(--accent2); }

  .sidebar-actions {
    display: flex;
    gap: 6px;
  }

  .icon-btn {
    width: 32px; height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--text2);
    font-size: 14px;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: var(--panel);
    color: var(--text);
    border-color: var(--border2);
  }

  .sidebar-user {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
  }

  .avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .avatar-sm {
    width: 28px; height: 28px;
    font-size: 11px;
  }

  .avatar-lg {
    width: 44px; height: 44px;
    font-size: 18px;
  }

  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-status {
    font-size: 11px;
    color: var(--success);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--success);
  }

  .conn-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .conn-connected { background: rgba(74,222,128,0.1); color: var(--success); }
  .conn-reconnecting { background: rgba(251,191,36,0.1); color: #fbbf24; }
  .conn-disconnected { background: rgba(248,113,113,0.1); color: var(--danger); }

  .rooms-section { flex: 1; overflow-y: auto; padding: 12px 0; }

  .section-label {
    padding: 4px 16px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text3);
  }

  .room-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.15s;
    position: relative;
  }

  .room-item:hover { background: var(--panel); }

  .room-item.active {
    background: rgba(108,99,255,0.08);
  }

  .room-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 4px; bottom: 4px;
    width: 3px;
    background: var(--accent);
    border-radius: 0 2px 2px 0;
  }

  .room-icon {
    width: 36px; height: 36px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .room-item.active .room-icon {
    background: rgba(108,99,255,0.15);
    border-color: rgba(108,99,255,0.3);
  }

  .room-meta { flex: 1; min-width: 0; }

  .room-name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .room-preview {
    font-size: 11px;
    color: var(--text3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .unread-badge {
    min-width: 18px; height: 18px;
    background: var(--accent);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    padding: 0 5px;
    flex-shrink: 0;
  }

  /* ── CHAT MAIN ── */
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
  }

  .chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    flex-shrink: 0;
  }

  .chat-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chat-header-info {}

  .chat-room-name {
    font-family: var(--font-head);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .chat-room-meta {
    font-size: 12px;
    color: var(--text2);
    margin-top: 1px;
  }

  .chat-header-actions { display: flex; gap: 8px; }

  /* ── MESSAGES ── */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background:
      radial-gradient(ellipse 60% 30% at 80% 20%, rgba(108,99,255,0.04) 0%, transparent 50%),
      var(--bg);
  }

  .message-content {
    background: var(--bubble-them);
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    display: inline-block; /* Fixes character wrap */
    max-width: 85%;
    word-wrap: break-word;
    white-space: pre-wrap; /* Fixes spacing/newlines */
  }
  .message-item {
    display: flex;
    margin-bottom: 16px;
    width: 100%;               /* Take full width of the chat container */
  }
  .message-item.me {
    justify-content: flex-end; /* Align your messages to the right */
  }

  .msg-group { margin-bottom: 16px; }

  .msg-group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .msg-sender-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text2);
  }

  .msg-time-label {
    font-size: 11px;
    color: var(--text3);
  }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 3px;
    min-width: 0;
  }

  .msg-row.mine { flex-direction: row-reverse; }

  .msg-row > div {
    min-width: 0;
  }

  .msg-spacer { width: 28px; flex-shrink: 0; }

  .bubble {
    max-width: 80%;
    min-width: 25ch;
    width: fit-content;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: pre-wrap;
    display: inline-flex;
    flex-direction: column;
    animation: bubbleIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes bubbleIn {
    from { opacity: 0; transform: scale(0.9) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .bubble.mine {
    background: linear-gradient(135deg, var(--accent), #7c3aed);
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 12px rgba(108,99,255,0.3);
  }

  .bubble.theirs {
    background: var(--bubble-them);
    border: 1px solid var(--border);
    color: var(--text);
    border-bottom-left-radius: 4px;
  }

  .msg-status {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    margin-top: 3px;
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
  }

  .date-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 12px;
  }

  .date-divider::before, .date-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .date-divider span {
    font-size: 11px;
    color: var(--text3);
    white-space: nowrap;
    padding: 3px 10px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0 8px 24px;
    font-size: 12px;
    color: var(--text3);
    min-height: 24px;
  }

  .typing-dots {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .typing-dots span {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--text3);
    animation: typingDot 1.2s infinite;
  }

  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typingDot {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  .load-more-btn {
    align-self: center;
    background: var(--panel);
    border: 1px solid var(--border);
    color: var(--text2);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 12px;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s;
    font-family: var(--font-body);
  }

  .load-more-btn:hover { background: var(--border); color: var(--text); }

  /* ── INPUT BAR ── */
  .input-bar {
    padding: 16px 24px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .input-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 8px 8px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
  }

  .msg-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    resize: none;
    max-height: 120px;
    min-height: 24px;
    line-height: 1.5;
    padding: 4px 0;
  }

  .msg-input::placeholder { color: var(--text3); }

  .send-btn {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), #7c3aed);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(108,99,255,0.4); }
  .send-btn:active { transform: scale(0.95); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* ── EMPTY / LANDING ── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text3);
    gap: 12px;
    background:
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(108,99,255,0.05) 0%, transparent 60%),
      var(--bg);
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.4;
  }

  .empty-title {
    font-family: var(--font-head);
    font-size: 20px;
    font-weight: 700;
    color: var(--text2);
    letter-spacing: -0.3px;
  }

  .empty-sub { font-size: 13px; color: var(--text3); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    width: 380px;
    box-shadow: var(--shadow);
    animation: scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  .modal-title {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    letter-spacing: -0.3px;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .modal-actions .btn { flex: 1; }

  /* ── TOAST ── */
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 200;
  }

  .toast {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: var(--shadow);
    animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    max-width: 300px;
  }

  .toast.success { border-left: 3px solid var(--success); }
  .toast.error   { border-left: 3px solid var(--danger); }
  .toast.info    { border-left: 3px solid var(--accent); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .members-panel {
    width: 260px;
    background: var(--surface);
    border-left: 1px solid var(--border);
    padding: 20px 16px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .members-panel-title {
    font-family: var(--font-head);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text2);
    margin-bottom: 16px;
  }

  .member-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }

  .member-row:last-child { border-bottom: none; }

  .member-info { flex: 1; min-width: 0; }

  .member-name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .role-owner { background: rgba(167,139,250,0.15); color: var(--accent2); }
  .role-member { background: rgba(144,144,176,0.1); color: var(--text3); }
`

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const COLORS = ['#6c63ff', '#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#60a5fa']
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const initials = (name) => name?.slice(0, 2).toUpperCase() || '??'
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDate = (d) => {
  const now = new Date(), dt = new Date(d)
  const diff = Math.floor((now - dt) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastId = 0
const toastListeners = []
const showToast = (msg, type = 'info') => {
  const id = ++toastId
  toastListeners.forEach(fn => fn({ id, msg, type }))
}

function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    toastListeners.push(handler)
    return () => { const i = toastListeners.indexOf(handler); if (i > -1) toastListeners.splice(i, 1) }
  }, [])
  const icons = { success: '✓', error: '✕', info: '◈' }
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{icons[t.type]}</span> {t.msg}
        </div>
      ))}
    </div>
  )
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = mode === 'login'
        ? await api.auth.login({ email: form.email, password: form.password })
        : await api.auth.register(form)
      localStorage.setItem('nexchat_token', data.token)
      localStorage.setItem('nexchat_user', JSON.stringify({ id: data.userId, username: data.username, email: data.email }))
      onAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <div className="auth-logo-text">Shadad<span>Chat</span></div>
        </div>
        <div className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="auth-sub">{mode === 'login' ? 'Sign in to continue chatting' : 'Join NexChat today'}</div>
        {error && <div className="error-banner">⚠ {error}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <div className="field">
                <label>Full Name</label>
                <input value={form.name} onChange={set('name')} placeholder="Ahmed Mohamed" required />
              </div>
              <div className="field">
                <label>Username</label>
                <input value={form.username} onChange={set('username')} placeholder="ahmed123" required />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'login' ? <>No account? <button onClick={() => { setMode('register'); setError('') }}>Sign up</button></> : <>Already have an account? <button onClick={() => { setMode('login'); setError('') }}>Sign in</button></>}
        </div>
      </div>
    </div>
  )
}

// ─── CREATE ROOM MODAL ────────────────────────────────────────────────────────
function CreateRoomModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const room = await api.rooms.create({ name: name.trim() })
      onCreated(room)
      showToast(`Room "${room.name}" created`, 'success')
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally { setLoading(false) }
  }
  return (
    <Modal title="New Room" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Room Name</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Engineering Team" required />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '+'} Create
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── ADD MEMBER MODAL ─────────────────────────────────────────────────────────
function AddMemberModal({ roomId, onClose }) {
  const [username, setUsername] = useState(''); // Corrected state
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      // Sending the username string to the API
      await api.members.add(roomId, username.trim());
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Member</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        {/* Changed 'submit' to 'handleSubmit' */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              autoFocus
              type="text" // Changed from 'number' to 'text'
              value={username} // Changed from 'userId' to 'username'
              onChange={e => setUsername(e.target.value)} // Changed from 'setUserId' to 'setUsername'
              placeholder="Enter username (e.g. ahmed123)"
              required
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!username.trim() || loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe }) {
  const statusIcon = { Sent: '✓', Delivered: '✓✓', Read: '✓✓' }
  return (
    <div className={`msg-row ${isMe ? 'mine' : ''}`}>
      {!isMe && (
        <div className="avatar avatar-sm" style={{ background: avatarColor(msg.senderName), color: '#fff' }}>
          {initials(msg.senderName)}
        </div>
      )}
      <div>
        <div className={`bubble ${isMe ? 'mine' : 'theirs'}`}>{msg.content}</div>
        {isMe && (
          <div className="msg-status">
            {fmtTime(msg.sentAt)} {statusIcon[msg.status] || '✓'}
          </div>
        )}
        {!isMe && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, paddingLeft: 4 }}>{fmtTime(msg.sentAt)}</div>}
      </div>
      {isMe && <div className="msg-spacer" />}
    </div>
  )
}

// ─── CHAT VIEW ────────────────────────────────────────────────────────────────
function ChatView({ room, user, connection, showMembers, onToggleMembers }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)

  // Load history
  useEffect(() => {
    setMessages([]); setCursor(null); setHasMore(true)
    loadHistory(null, true)
    hub.markAsRead(room.id)
    inputRef.current?.focus()
  }, [room.id])

  const loadHistory = async (cur, reset = false) => {
    try {
      const data = await api.messages.getHistory(room.id, cur, 30)
      const msgs = (data || []).reverse()
      if (reset) {
        setMessages(msgs)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50)
      } else {
        setMessages(prev => [...msgs, ...prev])
      }
      setHasMore(msgs.length === 30)
      if (msgs.length > 0) setCursor(msgs[0].id)
    } catch (err) {
      showToast('Failed to load messages', 'error')
    }
  }

  const loadMore = async () => {
    if (!hasMore || loadingMore || !cursor) return
    setLoadingMore(true)
    await loadHistory(cursor)
    setLoadingMore(false)
  }

  // SignalR listeners
  useEffect(() => {
    if (!connection) return
    const onMsg = (msg) => {
      if (msg.roomId !== room.id) return
      setMessages(prev => [...prev, msg])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      if (msg.senderId !== user.id) hub.markAsRead(room.id)
    }
    const onUndelivered = (msgs) => {
      const roomMsgs = msgs.filter(m => m.roomId === room.id)
      if (roomMsgs.length > 0) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id))
          return [...prev, ...roomMsgs.filter(m => !ids.has(m.id))].sort((a, b) => a.id - b.id)
        })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    }
    const onTyping = ({ roomId, username, isTyping }) => {
      if (roomId !== room.id || username === user.username) return
      setTyping(prev => isTyping ? [...new Set([...prev, username])] : prev.filter(u => u !== username))
    }
    connection.on('ReceiveMessage', onMsg)
    connection.on('ReceiveUndeliveredMessages', onUndelivered)
    connection.on('UserTyping', onTyping)
    return () => {
      connection.off('ReceiveMessage', onMsg)
      connection.off('ReceiveUndeliveredMessages', onUndelivered)
      connection.off('UserTyping', onTyping)
    }
  }, [connection, room.id, user])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!isTypingRef.current) { hub.startTyping(room.id); isTypingRef.current = true }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => { hub.stopTyping(room.id); isTypingRef.current = false }, 1500)
  }

  const send = async () => {
    const content = input.trim()
    if (!content) return
    setInput('')
    clearTimeout(typingTimer.current)
    hub.stopTyping(room.id); isTypingRef.current = false
    try {
      await hub.sendMessage(room.id, content)
    } catch {
      showToast('Failed to send message', 'error')
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const d = fmtDate(msg.sentAt)
    if (!acc[d]) acc[d] = []
    acc[d].push(msg)
    return acc
  }, {})

  return (
    <>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="room-icon" style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }}>🏠</div>
          <div className="chat-header-info">
            <div className="chat-room-name">{room.name}</div>
            <div className="chat-room-meta">created by {room.createdByUsername}</div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="icon-btn" title="Members" onClick={onToggleMembers} style={showMembers ? { background: 'rgba(108,99,255,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>👥</button>
        </div>
      </div>

      <div className="messages-area">
        {hasMore && (
          <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? '...' : '↑ Load older messages'}
          </button>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-divider"><span>{date}</span></div>
            {msgs.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === user.id} />
            ))}
          </div>
        ))}

        {typing.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots"><span /><span /><span /></div>
            <span>{typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <div className="input-row">
          <textarea
            ref={inputRef}
            className="msg-input"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKey}
            placeholder={`Message #${room.name}...`}
          />
          <button className="send-btn" onClick={send} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MEMBERS PANEL ────────────────────────────────────────────────────────────
function MembersPanel({ room, user, onAddMember }) {
  return (
    <div className="members-panel">
      <div className="members-panel-title">Members</div>
      <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 12, fontSize: 12 }} onClick={onAddMember}>
        + Add Member
      </button>
      <div className="member-row">
        <div className="avatar avatar-sm" style={{ background: avatarColor(room.createdByUsername), color: '#fff' }}>
          {initials(room.createdByUsername)}
        </div>
        <div className="member-info">
          <div className="member-name">{room.createdByUsername}</div>
        </div>
        <span className="role-badge role-owner">Owner</span>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(() => {
    const t = localStorage.getItem('nexchat_token')
    const u = localStorage.getItem('nexchat_user')
    return t && u ? { token: t, ...JSON.parse(u) } : null
  })
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [connStatus, setConnStatus] = useState('disconnected')
  const [connection, setConnection] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [unread, setUnread] = useState({})

  const user = auth ? { id: auth.userId, username: auth.username, email: auth.email } : null

  // Load rooms
  useEffect(() => {
    if (!auth) return
    api.rooms.getAll().then(setRooms).catch(() => { })
  }, [auth])

  // Connect SignalR
  useEffect(() => {
    if (!auth) return
    let conn
    hub.connect(auth.token, {
      onMessage: (msg) => {
        if (!activeRoom || msg.roomId !== activeRoom.id) {
          setUnread(prev => ({ ...prev, [msg.roomId]: (prev[msg.roomId] || 0) + 1 }))
        }
      },
      onUndelivered: (msgs) => {
        const counts = {}
        msgs.forEach(m => { counts[m.roomId] = (counts[m.roomId] || 0) + 1 })
        setUnread(prev => {
          const next = { ...prev }
          Object.entries(counts).forEach(([rid, c]) => { next[rid] = (next[rid] || 0) + c })
          return next
        })
      },
      onRead: () => { },
      onTyping: () => { },
      onStatus: (s) => setConnStatus(s),
    }).then(c => { conn = c; setConnection(c) }).catch(() => setConnStatus('disconnected'))

    return () => { hub.disconnect() }
  }, [auth])

  const selectRoom = (room) => {
    setActiveRoom(room)
    setUnread(prev => ({ ...prev, [room.id]: 0 }))
    setShowMembers(false)
  }

  const logout = () => {
    hub.disconnect()
    localStorage.removeItem('nexchat_token')
    localStorage.removeItem('nexchat_user')
    setAuth(null); setRooms([]); setActiveRoom(null); setConnection(null)
  }

  const deleteRoom = async (room) => {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return
    try {
      await api.rooms.delete(room.id)
      setRooms(prev => prev.filter(r => r.id !== room.id))
      if (activeRoom?.id === room.id) setActiveRoom(null)
      showToast('Room deleted', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (!auth) return (
    <>
      <style>{CSS}</style>
      <AuthScreen onAuth={(data) => setAuth(data)} />
      <ToastContainer />
    </>
  )

  const statusLabel = { connected: 'Connected', reconnecting: 'Reconnecting...', disconnected: 'Offline' }

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-mark">💬</div>
              <div className="logo-name">Shadad<span>Chat</span></div>
            </div>
            <div className="sidebar-actions">
              <button className="icon-btn" title="New Room" onClick={() => setShowCreate(true)}>+</button>
              <button className="icon-btn" title="Logout" onClick={logout}>⎋</button>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="avatar" style={{ background: avatarColor(user.username), color: '#fff' }}>
              {initials(user.username)}
            </div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-status">
                <div className="status-dot" style={{ background: connStatus === 'connected' ? 'var(--success)' : connStatus === 'reconnecting' ? '#fbbf24' : 'var(--danger)' }} />
                <span className={`conn-badge conn-${connStatus}`}>{statusLabel[connStatus]}</span>
              </div>
            </div>
          </div>

          <div className="rooms-section">
            <div className="section-label">Rooms ({rooms.length})</div>
            {rooms.length === 0 && (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                No rooms yet.<br />
                <button className="btn btn-ghost" style={{ marginTop: 10, fontSize: 12 }} onClick={() => setShowCreate(true)}>Create one</button>
              </div>
            )}
            {rooms.map(room => (
              <div key={room.id} className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`} onClick={() => selectRoom(room)}>
                <div className="room-icon">🏠</div>
                <div className="room-meta">
                  <div className="room-name">{room.name}</div>
                  <div className="room-preview">by {room.createdByUsername}</div>
                </div>
                {unread[room.id] > 0 && <div className="unread-badge">{unread[room.id]}</div>}
                {room.createdByUsername === user.username && (
                  <button
                    className="icon-btn"
                    style={{ width: 24, height: 24, fontSize: 12 }}
                    onClick={e => { e.stopPropagation(); deleteRoom(room) }}
                    title="Delete room"
                  >🗑</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="chat-main">
          {activeRoom ? (
            <ChatView
              room={activeRoom}
              user={user}
              connection={connection}
              showMembers={showMembers}
              onToggleMembers={() => setShowMembers(p => !p)}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">Welcome to ShadadChat</div>
              <div className="empty-sub">Select a room or create one to start chatting</div>
              <button className="btn btn-primary" style={{ marginTop: 8, width: 'auto', padding: '10px 24px' }} onClick={() => setShowCreate(true)}>
                Create a Room
              </button>
            </div>
          )}
        </div>

        {/* MEMBERS PANEL */}
        {activeRoom && showMembers && (
          <MembersPanel
            room={activeRoom}
            user={user}
            onAddMember={() => setShowAddMember(true)}
          />
        )}
      </div>

      {/* MODALS */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(room) => { setRooms(prev => [...prev, room]); selectRoom(room) }}
        />
      )}
      {showAddMember && activeRoom && (
        <AddMemberModal
          roomId={activeRoom.id}
          onClose={() => setShowAddMember(false)}
        />
      )}

      <ToastContainer />
    </>
  )
}
