import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, AlertTriangle, Check, Search, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { userService, kudosService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const COMPANY_VALUES = [
  { tag: '#Teamwork', description: 'Cross-functional collaboration & helping teammates' },
  { tag: '#CustomerObsession', description: 'Delighting clients & solving real problems' },
  { tag: '#Innovation', description: 'Creative problem solving & technical excellence' },
  { tag: '#Leadership', description: 'Mentoring peers & driving ownership' },
  { tag: '#BiasForAction', description: 'Speed of delivery & overcoming obstacles' }
];

const POINT_OPTIONS = [10, 20, 50];

export const GiveKudosModal = ({ isOpen, onClose, onKudosCreated }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [points, setPoints] = useState(20);
  const [customPoints, setCustomPoints] = useState('');
  const [message, setMessage] = useState('');
  const [companyValue, setCompanyValue] = useState('#Innovation');
  const [submitting, setSubmitting] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      userService.getUsersDirectory()
        .then((res) => {
          if (res.data?.success) {
            // Filter out current logged in user to strictly enforce no self-gifting
            const currentUserId = user?.id || user?._id;
            const peers = res.data.data.filter((u) => u._id !== currentUserId);
            setUsersList(peers);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const effectivePoints = customPoints ? parseInt(customPoints, 10) || 0 : points;
  const currentAllowance = user?.givingAllowance || 0;
  const hasInsufficientFunds = effectivePoints > currentAllowance;

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      showToast('Please select a teammate to recognize.', 'error');
      return;
    }

    if (effectivePoints <= 0) {
      showToast('Points must be greater than zero.', 'error');
      return;
    }

    if (hasInsufficientFunds) {
      showToast(`Insufficient giving allowance. You only have ${currentAllowance} pts left.`, 'error');
      return;
    }

    if (!message.trim()) {
      showToast('Please add a message detailing why you are recognizing them.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await kudosService.giveKudos({
        receiverId: selectedUser._id,
        points: effectivePoints,
        message: message.trim(),
        companyValue
      });

      if (res.data?.success) {
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignore if canvas unsupported
        }

        showToast(res.data.message || 'Kudos sent successfully!', 'success');
        await refreshUser();
        if (onKudosCreated) onKudosCreated(res.data.kudos);
        onClose();
        
        // Reset form
        setSelectedUser(null);
        setMessage('');
        setCustomPoints('');
        setPoints(20);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send kudos. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="coss-dialog-backdrop" onClick={onClose}>
      <div className="coss-dialog-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
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
              <Sparkles size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Give Peer Kudos</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Recognize a teammate and award monthly allowance points
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="coss-btn coss-btn-ghost coss-btn-sm"
            style={{ padding: '0.35rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="coss-dialog-body">
          {/* Allowance Health Indicator */}
          <div style={{
            background: hasInsufficientFunds ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${hasInsufficientFunds ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color={hasInsufficientFunds ? 'var(--accent-danger)' : 'var(--accent-primary)'} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Your Giving Allowance:
              </span>
            </div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: hasInsufficientFunds ? 'var(--accent-danger)' : 'var(--accent-success)'
            }}>
              {currentAllowance} pts remaining
            </span>
          </div>

          {/* Receiver Autocomplete / Selector */}
          <div className="coss-form-group" style={{ position: 'relative' }}>
            <label className="coss-label">
              <span>Select Recipient *</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Self-gifting prohibited</span>
            </label>

            {selectedUser ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="coss-avatar coss-avatar-sm"
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>
                      {selectedUser.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {selectedUser.department} • {selectedUser.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="coss-btn coss-btn-ghost coss-btn-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="coss-input"
                    placeholder="Search teammate by name or department..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setUserDropdownOpen(true);
                    }}
                    onFocus={() => setUserDropdownOpen(true)}
                  />
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 12, top: 12 }} />
                </div>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 'calc(100% + 4px)',
                    maxHeight: 200,
                    overflowY: 'auto',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 20,
                    padding: '0.25rem'
                  }}>
                    {filteredUsers.length === 0 ? (
                      <div style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No teammates found matching query.
                      </div>
                    ) : (
                      filteredUsers.map((peer) => (
                        <div
                          key={peer._id}
                          onClick={() => {
                            setSelectedUser(peer);
                            setUserDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className="coss-avatar coss-avatar-sm"
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{peer.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {peer.department}
                            </div>
                          </div>
                          <span className="coss-badge coss-badge-indigo" style={{ fontSize: '0.7rem' }}>
                            {peer.earnedPoints} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Point Selector (10, 20, 50 pts) */}
          <div className="coss-form-group">
            <label className="coss-label">
              <span>Points Amount *</span>
              <span>Available: {currentAllowance} pts</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 110px', gap: '0.5rem' }}>
              {POINT_OPTIONS.map((val) => {
                const isSelected = !customPoints && points === val;
                const isExceeded = val > currentAllowance;
                return (
                  <button
                    type="button"
                    key={val}
                    disabled={isExceeded}
                    onClick={() => {
                      setPoints(val);
                      setCustomPoints('');
                    }}
                    className={`coss-btn ${isSelected ? 'coss-btn-primary' : 'coss-btn-secondary'}`}
                    style={{
                      padding: '0.55rem',
                      opacity: isExceeded ? 0.35 : 1
                    }}
                  >
                    +{val} pts
                  </button>
                );
              })}

              <input
                type="number"
                min="1"
                max={currentAllowance}
                placeholder="Custom"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="coss-input"
                style={{ textAlign: 'center', padding: '0.45rem' }}
              />
            </div>
            {hasInsufficientFunds && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                <AlertTriangle size={13} />
                Selected points exceed your current allowance ({currentAllowance} pts).
              </div>
            )}
          </div>

          {/* Company Value Tag Picker */}
          <div className="coss-form-group">
            <label className="coss-label">Company Value Tag *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {COMPANY_VALUES.map((cv) => {
                const isSelected = companyValue === cv.tag;
                return (
                  <button
                    type="button"
                    key={cv.tag}
                    onClick={() => setCompanyValue(cv.tag)}
                    className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)'
                    }}
                    title={cv.description}
                  >
                    {cv.tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recognition Message Field */}
          <div className="coss-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="coss-label">Recognition Message *</label>
              <span style={{ fontSize: '0.72rem', color: message.length > 500 ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
                {message.length} / 500
              </span>
            </div>
            <textarea
              className="coss-textarea"
              placeholder="What did they do that was remarkable? Detail the impact of their contribution..."
              value={message}
              maxLength={500}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Footer Actions */}
          <div className="coss-dialog-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="coss-btn coss-btn-ghost"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || hasInsufficientFunds || !selectedUser || !message.trim()}
              className="coss-btn coss-btn-primary"
            >
              <Send size={16} />
              {submitting ? 'Sending Kudos...' : `Send +${effectivePoints} Kudos`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
