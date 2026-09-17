import React, { useState } from 'react';
import { ArrowRight, Sparkles, Clock, Share2, Check, Flame } from 'lucide-react';
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

  // Value tag badge color selector
  const getTagBadgeClass = (tag) => {
    switch (tag) {
      case '#Innovation': return 'coss-badge-violet';
      case '#CustomerObsession': return 'coss-badge-emerald';
      case '#Teamwork': return 'coss-badge-indigo';
      case '#Leadership': return 'coss-badge-amber';
      case '#BiasForAction': return 'coss-badge-rose';
      default: return 'coss-badge-cyan';
    }
  };

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

  // Optimistic emoji reaction toggle with floating emoji burst
  const handleReactionClick = async (e, emoji) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    // Trigger visual floating particle burst & audio pop
    spawnEmojiBurst(e, emoji);

    if (isReacting) return;
    setIsReacting(true);

    const userId = user.id || user._id;

    // Optimistic UI state update
    const previousReactions = JSON.parse(JSON.stringify(reactions));
    const nextReactions = [...reactions];

    let group = nextReactions.find((r) => r.emoji === emoji);
    if (!group) {
      group = { emoji, users: [] };
      nextReactions.push(group);
    }

    const hasReacted = group.users.some((u) => (u._id || u).toString() === userId.toString());

    if (hasReacted) {
      group.users = group.users.filter((u) => (u._id || u).toString() !== userId.toString());
    } else {
      group.users.push(userId);
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
    <article className="coss-card coss-card-interactive" style={{ marginBottom: '1.35rem' }}>
      {/* Top Header: Sender -> Receiver, Points & Timestamp */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Sender */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(kudos.sender?._id); }}
          >
            <img
              src={kudos.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sender'}
              alt={kudos.sender?.name}
              className="coss-avatar coss-avatar-sm"
              style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {kudos.sender?.name || 'Anonymous'}
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
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
            justifyContent: 'center'
          }}>
            <ArrowRight size={14} color="var(--accent-primary)" />
          </div>

          {/* Receiver */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(kudos.receiver?._id); }}
          >
            <img
              src={kudos.receiver?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Receiver'}
              alt={kudos.receiver?.name}
              className="coss-avatar coss-avatar-sm"
              style={{ border: '2px solid var(--accent-primary)', boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)' }}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {kudos.receiver?.name || 'Teammate'}
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {kudos.receiver?.department}
              </span>
            </div>
          </div>
        </div>

        {/* Points Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="points-chip">
            <Sparkles size={14} />
            +{kudos.points} pts
          </div>

          <button
            onClick={handleCopyLink}
            className="coss-btn coss-btn-ghost coss-btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}
            title="Share Kudos"
          >
            {copied ? <Check size={14} color="var(--accent-success)" /> : <Share2 size={14} />}
          </button>
        </div>
      </div>

      {/* Message Content */}
      <p style={{
        marginTop: '1.15rem',
        fontSize: '0.95rem',
        lineHeight: 1.65,
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
        marginTop: '1.25rem',
        paddingTop: '1.1rem',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Company Value Tag & Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className={`coss-badge ${getTagBadgeClass(kudos.companyValue)}`}>
            {kudos.companyValue}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>{formatTime(kudos.createdAt)}</span>
          </div>
        </div>

        {/* Emoji Reactions Bar with Floating Emoji Burst on Click */}
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
