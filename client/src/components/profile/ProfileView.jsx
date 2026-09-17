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
  Calendar
} from 'lucide-react';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KudosCard } from '../feed/KudosCard';

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile data...</p>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="coss-card" style={{ textAlign: 'center', padding: '3rem' }}>
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
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Back button if navigating from feed or leaderboard */}
      {onBack && (
        <button
          onClick={onBack}
          className="coss-btn coss-btn-ghost coss-btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back to Wall
        </button>
      )}

      {/* Profile Header Card */}
      <div className="coss-card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <img
              src={user.avatar}
              alt={user.name}
              className="coss-avatar coss-avatar-xl"
              style={{ border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: '#fff' }}>{user.name}</h1>
                <span className="coss-badge coss-badge-violet">{user.department}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {user.email}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <Calendar size={13} />
                <span>Joined Internal Kudos Network</span>
              </div>
            </div>
          </div>

          {/* Action if viewing another peer */}
          {currentUser && (currentUser.id || currentUser._id) !== user._id && (
            <button
              onClick={onOpenGiveKudos}
              className="coss-btn coss-btn-primary"
            >
              <Gift size={16} />
              Give Kudos to {user.name.split(' ')[0]}
            </button>
          )}
        </div>

        {/* Recognition Wallets Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Monthly Giving Allowance Wallet */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Monthly Giving Allowance</span>
              <Gift size={18} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0.5rem 0 0.25rem' }}>
              {user.givingAllowance} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100 pts</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Refreshes to 100 pts on 1st of every month
            </span>
          </div>

          {/* Earned Recognition Points Wallet */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Cumulative Earned Points</span>
              <Sparkles size={18} color="var(--accent-success)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-success)', margin: '0.5rem 0 0.25rem' }}>
              {user.earnedPoints} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>pts</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              From {stats.countReceived} received peer recognitions
            </span>
          </div>

          {/* Badges Count */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Earned Badges</span>
              <Award size={18} color="var(--accent-warning)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-warning)', margin: '0.5rem 0 0.25rem' }}>
              {user.badges?.length || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>unlocked</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Milestones in teamwork & culture
            </span>
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="coss-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Recognition Badges</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Milestones earned by giving and receiving peer feedback
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}>
          {BADGE_CATALOG.map((b) => {
            const isUnlocked = earnedBadgeIds.has(b.id);
            return (
              <div
                key={b.id}
                style={{
                  background: isUnlocked ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: `1px solid ${isUnlocked ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{
                  fontSize: '1.75rem',
                  lineHeight: 1,
                  filter: isUnlocked ? 'none' : 'grayscale(100%)'
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isUnlocked ? '#fff' : 'var(--text-muted)' }}>
                      {b.name}
                    </div>
                    {isUnlocked && <CheckCircle2 size={13} color="var(--accent-success)" />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="coss-tabs-list">
            <button
              onClick={() => setActiveHistoryTab('received')}
              className={`coss-tab-trigger ${activeHistoryTab === 'received' ? 'active' : ''}`}
            >
              <Inbox size={15} />
              Received ({receivedKudos.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('sent')}
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
              <div className="coss-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
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
              <div className="coss-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
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
    </div>
  );
};
