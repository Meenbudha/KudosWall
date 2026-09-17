import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, KeyRound, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SimulatedInboxModal = ({ isOpen, onClose }) => {
  const { openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await authService.getSimulatedInbox();
      if (res.data?.success) {
        setEmails(res.data.emails || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="coss-dialog-backdrop" onClick={onClose}>
      <div className="coss-dialog-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
        {/* Header */}
        <div className="coss-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={16} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Simulated Email Inbox</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Inspect outgoing simulated verification emails & password reset tokens
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchEmails}
              className="coss-btn coss-btn-ghost coss-btn-sm"
              style={{ padding: '0.35rem' }}
              title="Refresh inbox"
            >
              <RefreshCw size={15} />
            </button>
            <button onClick={onClose} className="coss-btn coss-btn-ghost coss-btn-sm" style={{ padding: '0.35rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="coss-dialog-body" style={{ maxHeight: 450, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading simulated emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Mail size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Simulated Inbox is Empty</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                When you sign up a new user or request a password reset, simulated emails will appear here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {emails.map((mail) => (
                <div
                  key={mail.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`coss-badge ${mail.type === 'VERIFICATION' ? 'coss-badge-emerald' : 'coss-badge-amber'}`} style={{ marginBottom: '0.35rem' }}>
                        {mail.type}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {mail.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        To: {mail.recipientName} &lt;{mail.to}&gt; • {new Date(mail.sentAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
                    {mail.message}
                  </p>

                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <code style={{ fontSize: '0.75rem', color: '#a5b4fc', wordBreak: 'break-all' }}>
                      Token: {mail.token}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(mail.token);
                        showToast('Token copied to clipboard!', 'success');
                        if (mail.type === 'VERIFICATION') {
                          onClose();
                          openAuthModal('verify', { email: mail.to, simulatedEmail: mail });
                        } else {
                          onClose();
                          openAuthModal('reset', { email: mail.to });
                        }
                      }}
                      className="coss-btn coss-btn-primary coss-btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      Use Token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
