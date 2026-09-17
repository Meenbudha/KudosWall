import React, { useState, useEffect } from 'react';
import { 
  User, 
  Gift, 
  Sparkles, 
  Award, 
  Send, 
  Inbox, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KudosCard } from '../feed/KudosCard';
import { soundEffects } from '../../utils/effects';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';

const BADGE_CATALOG = [
  { id: 'first_kudos', name: 'Culture Starter', icon: '🌱', description: 'Sent your very first peer kudos!' },
  { id: 'rising_star', name: 'Rising Star', icon: '⭐', description: 'Earned 50+ points from teammates.' },
  { id: 'century_club', name: 'Century Champion', icon: '🏆', description: 'Crossed 100+ earned points!' },
  { id: 'generous_heart', name: 'Generous Heart', icon: '💖', description: 'Recognized peers 5 or more times.' },
  { id: 'team_pillar', name: 'Team Pillar', icon: '🏛️', description: 'Received recognition from 3+ distinct colleagues.' }
];

export const ProfileView = ({ userId, onBack, onOpenGiveKudos }) => {
  const { user: currentUser } = useAuth();
  const targetId = userId || currentUser?.id || currentUser?._id;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHistoryTab, setActiveHistoryTab] = useState('received'); // 'received' | 'sent'
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  useEffect(() => {
    if (targetId) {
      setLoading(true);
      userService.getUserProfile(targetId)
        .then((res) => {
          if (res.data?.success) {
            setProfileData(res.data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [targetId]);

  const handleBadgeClick = (isUnlocked, badgeName) => {
    soundEffects.playPop();
    if (isUnlocked) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4.5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile data...</p>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="coss-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
        <p>User profile could not be loaded.</p>
        <button onClick={onBack} className="coss-btn coss-btn-outline" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const { user, stats, receivedKudos, sentKudos } = profileData;
  const earnedBadgeIds = new Set((user.badges || []).map((b) => b.id));

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Back button if navigating from feed or leaderboard */}
      {onBack && (
        <button
          onClick={() => { soundEffects.playPop(); onBack(); }}
          className="coss-btn coss-btn-ghost coss-btn-sm"
          style={{ marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} />
          Back to Wall
        </button>
      )}

      {/* Profile Header Card with Radiant Gradient Background */}
      <div className="coss-card coss-card-glow" style={{ marginBottom: '1.75rem', padding: '2.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={user.avatar}
                alt={user.name}
                className="coss-avatar coss-avatar-xl"
                style={{
                  border: '4px solid var(--accent-primary)',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
                  cursor: (currentUser && (currentUser.id || currentUser._id) === user._id) ? 'pointer' : 'default',
                  transition: 'transform var(--transition-fast)'
                }}
                onClick={() => {
                  if (currentUser && (currentUser.id || currentUser._id) === user._id) {
                    setAvatarModalOpen(true);
                  }
                }}
                title={currentUser && (currentUser.id || currentUser._id) === user._id ? 'Click to change avatar' : user.name}
              />
              {currentUser && (currentUser.id || currentUser._id) === user._id && (
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: '3px solid var(--bg-surface)',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="Change profile picture"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{user.name}</h1>
                <span className="coss-badge coss-badge-violet" style={{ fontSize: '0.8rem' }}>{user.department}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {user.email}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                <Calendar size={14} color="var(--accent-primary)" />
                <span>Internal Kudos Network Member</span>
              </div>
              {currentUser && (currentUser.id || currentUser._id) === user._id && (
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="coss-btn coss-btn-secondary coss-btn-sm"
                  style={{ marginTop: '0.85rem' }}
                >
                  <Camera size={14} color="var(--accent-primary)" />
                  <span>Customize Avatar / Upload Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Action if viewing another peer */}
          {currentUser && (currentUser.id || currentUser._id) !== user._id && (
            <button
              onClick={() => { soundEffects.playPop(); onOpenGiveKudos(); }}
              className="coss-btn coss-btn-primary coss-btn-lg"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <Gift size={18} />
              Give Kudos to {user.name.split(' ')[0]}
            </button>
          )}
        </div>

        {/* Recognition Wallets Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginTop: '2.25rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Monthly Giving Allowance Wallet */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.35rem',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly Giving Allowance</span>
              <Gift size={20} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.6rem 0 0.3rem' }}>
              {user.givingAllowance} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100 pts</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Refreshes to 100 pts on 1st of every month
            </span>
          </div>

          {/* Earned Recognition Points Wallet */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.35rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cumulative Earned Points</span>
              <Sparkles size={20} color="var(--accent-success)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-success)', margin: '0.6rem 0 0.3rem' }}>
              {user.earnedPoints} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>pts</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              From {stats.countReceived} received peer recognitions
            </span>
          </div>

          {/* Badges Count */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.35rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Earned Badges</span>
              <Award size={20} color="var(--accent-warning)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-warning)', margin: '0.6rem 0 0.3rem' }}>
              {user.badges?.length || 0} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>unlocked</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Milestones in teamwork & culture
            </span>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="coss-card" style={{ marginBottom: '1.75rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Recognition Badges</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.35rem' }}>
          Milestones earned through peer feedback and participation. Click any unlocked badge to celebrate!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {BADGE_CATALOG.map((b) => {
            const isUnlocked = earnedBadgeIds.has(b.id);
            return (
              <div
                key={b.id}
                onClick={() => handleBadgeClick(isUnlocked, b.name)}
                style={{
                  background: isUnlocked ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${isUnlocked ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: isUnlocked ? 1 : 0.45,
                  cursor: isUnlocked ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  boxShadow: isUnlocked ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => isUnlocked && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => isUnlocked && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{
                  fontSize: '2rem',
                  lineHeight: 1,
                  filter: isUnlocked ? 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.4))' : 'grayscale(100%)'
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {b.name}
                    </div>
                    {isUnlocked && <CheckCircle2 size={15} color="var(--accent-success)" />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {b.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kudos History Tabs: Received vs Sent */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div className="coss-tabs-list">
            <button
              onClick={() => { soundEffects.playPop(); setActiveHistoryTab('received'); }}
              className={`coss-tab-trigger ${activeHistoryTab === 'received' ? 'active' : ''}`}
            >
              <Inbox size={15} />
              Received ({receivedKudos.length})
            </button>
            <button
              onClick={() => { soundEffects.playPop(); setActiveHistoryTab('sent'); }}
              className={`coss-tab-trigger ${activeHistoryTab === 'sent' ? 'active' : ''}`}
            >
              <Send size={15} />
              Sent ({sentKudos.length})
            </button>
          </div>
        </div>

        {activeHistoryTab === 'received' ? (
          <div>
            {receivedKudos.length === 0 ? (
              <div className="coss-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No kudos received yet.</p>
              </div>
            ) : (
              receivedKudos.map((k) => (
                <KudosCard key={k._id} kudos={k} />
              ))
            )}
          </div>
        ) : (
          <div>
            {sentKudos.length === 0 ? (
              <div className="coss-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No kudos sent yet.</p>
              </div>
            ) : (
              sentKudos.map((k) => (
                <KudosCard key={k._id} kudos={k} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Avatar Customizer & PC Photo Upload Modal */}
      {currentUser && (currentUser.id || currentUser._id) === user._id && (
        <AvatarCustomizerModal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          currentAvatar={user.avatar}
          onAvatarSaved={(newAvatar) => {
            setProfileData((prev) => ({
              ...prev,
              user: { ...prev.user, avatar: newAvatar }
            }));
          }}
        />
      )}
    </div>
  );
};
