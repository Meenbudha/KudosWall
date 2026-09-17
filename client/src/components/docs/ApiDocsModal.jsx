import React, { useState, useEffect } from 'react';
import { X, BookOpen, Key, Check, Copy } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export const ApiDocsModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/docs')
        .then((res) => setDocs(res.data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="coss-dialog-backdrop" onClick={onClose}>
      <div className="coss-dialog-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 750 }}>
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
              <BookOpen size={16} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>KudosWall REST API Documentation</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pair token JWT authentication, atomic point transactions & MongoDB aggregations
              </p>
            </div>
          </div>

          <button onClick={onClose} className="coss-btn coss-btn-ghost coss-btn-sm" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="coss-dialog-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {/* Security Architecture Callout */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={15} /> Pair-Token Auth & Cookie Specifications:
            </div>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Access Token:</strong> 15 minutes validity, stored in secure <code>httpOnly</code> cookie (or Authorization Bearer header).</li>
              <li><strong>Refresh Token:</strong> 7 days validity, stored in secure <code>httpOnly</code> cookie with token rotation on refresh.</li>
              <li><strong>Atomic Points Safety:</strong> Mongoose atomic conditional deduction ensures zero negative balances or concurrent overdrafts.</li>
            </ul>
          </div>

          {/* Endpoints List */}
          {docs?.endpoints?.map((cat) => (
            <div key={cat.category} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                {cat.category}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`coss-badge ${item.method === 'GET' ? 'coss-badge-emerald' : item.method === 'POST' ? 'coss-badge-indigo' : 'coss-badge-amber'}`}>
                          {item.method}
                        </span>
                        <code style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          /api{item.path}
                        </code>
                      </div>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.description}
                      </span>
                    </div>

                    {item.body && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <strong>Body:</strong> {item.body.join(', ')}
                      </div>
                    )}

                    {item.query && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <strong>Query Params:</strong> {item.query.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
