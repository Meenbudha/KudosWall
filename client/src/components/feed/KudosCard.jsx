import React, { useState } from 'react';
import { ArrowRight, Sparkles, Clock, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { kudosService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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

  // Optimistic emoji reaction toggle
  const handleReactionClick = async (emoji) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

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
      // Rollback on network failure
      setReactions(previousReactions);
      showToast('Could not register reaction. Please try again.', 'error');
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <article className="coss-card coss-card-interactive" style={{ marginBottom: '1.25rem' }}>
      {/* Top Header: Sender -> Receiver, Points & Timestamp */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sender */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            onClick={() => onUserClick && onUserClick(kudos.sender?._id)}
          >
            <img
              src={kudos.sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sender'}
              alt={kudos.sender?.name}
              className="coss-avatar coss-avatar-sm"
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                {kudos.sender?.name || 'Anonymous'}
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {kudos.sender?.department}
              </span>
            </div>
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          {/* Receiver */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            onClick={() => onUserClick && onUserClick(kudos.receiver?._id)}
          >
            <img
              src={kudos.receiver?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Receiver'}
              alt={kudos.receiver?.name}
              className="coss-avatar coss-avatar-sm"
              style={{ border: '2px solid var(--accent-primary)' }}
            />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                {kudos.receiver?.name || 'Teammate'}
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {kudos.receiver?.department}
              </span>
            </div>
          </div>
        </div>

        {/* Points Badge & Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            className="coss-badge coss-badge-emerald"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Sparkles size={13} />
            +{kudos.points} pts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>{formatTime(kudos.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <p style={{
        marginTop: '1rem',
        fontSize: '0.9375rem',
        lineHeight: 1.6,
        color: '#e2e8f0',
        whiteSpace: 'pre-line'
      }}>
        {kudos.message}
      </p>

      {/* Value Tag Badge & Separator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Company Value Tag */}
        <div className={`coss-badge ${getTagBadgeClass(kudos.companyValue)}`}>
          {kudos.companyValue}
        </div>

        {/* Emoji Reactions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {EMOJI_MAP.map((item) => {
            const group = reactions.find((r) => r.emoji === item.emoji);
            const count = group?.users?.length || 0;
            const currentUserId = user?.id || user?._id;
            const isActive = group?.users?.some((u) => (u._id || u).toString() === currentUserId?.toString());

            return (
              <button
                key={item.emoji}
                onClick={() => handleReactionClick(item.emoji)}
                className={`coss-reaction-pill ${isActive ? 'active' : ''}`}
                title={`React with ${item.label}`}
              >
                <span>{item.emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
};
