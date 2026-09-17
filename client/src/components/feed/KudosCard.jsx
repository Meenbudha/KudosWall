import React, { useState } from 'react';
import { ArrowRight, Sparkles, Clock, Share2, Check, Flame, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { kudosService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { spawnEmojiBurst, soundEffects } from '../../utils/effects';

const EMOJI_MAP = [
  { emoji: '+1', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🚀', label: 'Rocket' }
];

export const KudosCard = ({ kudos, onUserClick }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [reactions, setReactions] = useState(kudos.reactions || []);
  const [isReacting, setIsReacting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gradient configurations per company value tag
  const getValueTheme = (tag) => {
    switch (tag) {
      case '#Innovation':
        return {
          gradient: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
          badgeClass: 'coss-badge-violet',
          borderGlow: 'rgba(139, 92, 246, 0.4)'
        };
      case '#CustomerObsession':
        return {
          gradient: 'linear-gradient(90deg, #10b981, #06b6d4)',
          badgeClass: 'coss-badge-emerald',
          borderGlow: 'rgba(16, 185, 129, 0.4)'
        };
      case '#Teamwork':
        return {
          gradient: 'linear-gradient(90deg, #6366f1, #ec4899)',
          badgeClass: 'coss-badge-indigo',
          borderGlow: 'rgba(99, 102, 241, 0.4)'
        };
      case '#Leadership':
        return {
          gradient: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          badgeClass: 'coss-badge-amber',
          borderGlow: 'rgba(245, 158, 11, 0.4)'
        };
      case '#BiasForAction':
        return {
          gradient: 'linear-gradient(90deg, #f43f5e, #fb923c)',
          badgeClass: 'coss-badge-rose',
          borderGlow: 'rgba(244, 63, 94, 0.4)'
        };
      default:
        return {
          gradient: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          badgeClass: 'coss-badge-cyan',
          borderGlow: 'rgba(99, 102, 241, 0.4)'
        };
    }
  };

  const theme = getValueTheme(kudos.companyValue);

  // Format relative time
  const formatTime = (dateString) => {
    try {
      const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  // Optimistic emoji reaction toggle with floating emoji burst (1 active reaction per user)
  const handleReactionClick = async (e, emoji) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    const userId = user.id || user._id;

    // Check if user currently has this emoji or another active on this kudos
    let activeEmoji = null;
    for (const group of reactions) {
      if (group.users?.some((u) => (u._id || u).toString() === userId.toString())) {
        activeEmoji = group.emoji;
        break;
      }
    }

    const isTogglingOff = activeEmoji === emoji;

    // Trigger visual floating particle burst right above the emoji pill if reacting
    if (!isTogglingOff) {
      spawnEmojiBurst(e, emoji);
    }

    if (isReacting) return;
    setIsReacting(true);

    // Optimistic UI state update: remove user from all groups first
    const previousReactions = JSON.parse(JSON.stringify(reactions));
    const nextReactions = reactions.map((r) => ({
      ...r,
      users: r.users.filter((u) => (u._id || u).toString() !== userId.toString())
    }));

    // If not toggling off, add user to target emoji group
    if (!isTogglingOff) {
      let targetGroup = nextReactions.find((r) => r.emoji === emoji);
      if (!targetGroup) {
        targetGroup = { emoji, users: [] };
        nextReactions.push(targetGroup);
      }
      targetGroup.users.push(userId);
    }

    setReactions(nextReactions);

    try {
      const res = await kudosService.toggleReaction(kudos._id, emoji);
      if (res.data?.success) {
        setReactions(res.data.reactions);
      }
    } catch (err) {
      setReactions(previousReactions);
      showToast('Could not register reaction. Please try again.', 'error');
    } finally {
      setIsReacting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#kudos-${kudos._id}`);
    setCopied(true);
    soundEffects.playPop();
    showToast('Kudos link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className="coss-card coss-card-interactive"
      style={{
        marginBottom: '1.4rem',
        padding: '1.65rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)'
      }}
    >
      {/* Top Colorful Accent Line matching company value */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: theme.gradient
      }} />

      {/* Header: Sender -> Receiver, Points & Share */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Sender */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(kudos.sender?._id); }}
          >
            <img
              src={kudos.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sender'}
              alt={kudos.sender?.name}
              className="coss-avatar coss-avatar-sm"
              style={{ border: '2px solid var(--border-medium)' }}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {kudos.sender?.name || 'Anonymous'}
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {kudos.sender?.department}
              </span>
            </div>
          </div>

          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <ArrowRight size={14} color="var(--accent-primary)" />
          </div>

          {/* Receiver */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(kudos.receiver?._id); }}
          >
            <img
              src={kudos.receiver?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Receiver'}
              alt={kudos.receiver?.name}
              className="coss-avatar coss-avatar-sm"
              style={{ border: '2px solid var(--accent-primary)', boxShadow: '0 0 14px rgba(99, 102, 241, 0.45)' }}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {kudos.receiver?.name || 'Teammate'}
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {kudos.receiver?.department}
              </span>
            </div>
          </div>
        </div>

        {/* Points Chip & Share Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="points-chip" style={{ fontSize: '0.84rem' }}>
            <Sparkles size={14} />
            +{kudos.points} pts
          </div>

          <button
            onClick={handleCopyLink}
            className="coss-btn coss-btn-ghost coss-btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}
            title="Share Kudos link"
          >
            {copied ? <Check size={15} color="var(--accent-success)" /> : <Share2 size={15} />}
          </button>
        </div>
      </div>

      {/* Recognition Message Content */}
      <p style={{
        marginTop: '1.25rem',
        fontSize: '0.96rem',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-line',
        fontWeight: 450
      }}>
        {kudos.message}
      </p>

      {/* Value Tag Badge & Reaction Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.35rem',
        paddingTop: '1.15rem',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Company Value Tag & Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className={`coss-badge ${theme.badgeClass}`}
            style={{
              boxShadow: `0 0 12px ${theme.borderGlow}`,
              borderWidth: '1px',
              fontWeight: 800,
              padding: '0.35rem 0.85rem'
            }}
          >
            {kudos.companyValue}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={13} />
            <span>{formatTime(kudos.createdAt)}</span>
          </div>
        </div>

        {/* Emoji Reactions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {EMOJI_MAP.map((item) => {
            const group = reactions.find((r) => r.emoji === item.emoji);
            const count = group?.users?.length || 0;
            const currentUserId = user?.id || user?._id;
            const isActive = group?.users?.some((u) => (u._id || u).toString() === currentUserId?.toString());

            return (
              <button
                key={item.emoji}
                onClick={(e) => handleReactionClick(e, item.emoji)}
                className={`coss-reaction-pill ${isActive ? 'active' : ''}`}
                title={`React with ${item.label}`}
              >
                <span>{item.emoji}</span>
                {count > 0 && <span style={{ fontWeight: 800 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
};
