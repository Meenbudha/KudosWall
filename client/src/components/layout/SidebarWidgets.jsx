import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Sparkles, 
  Trophy, 
  Award, 
  Heart, 
  Users, 
  Lightbulb, 
  Target, 
  Crown, 
  Rocket, 
  ChevronRight,
  TrendingUp,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/api';
import { soundEffects } from '../../utils/effects';

export const SidebarWidgets = ({ onOpenGiveKudos, onUserClick, setActiveTab }) => {
  const { user, openAuthModal } = useAuth();
  const [topPeers, setTopPeers] = useState([]);

  useEffect(() => {
    analyticsService.getLeaderboard({ limit: 3 })
      .then((res) => {
        if (res.data?.success) {
          setTopPeers(res.data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const valuesCatalog = [
    { tag: '#Innovation', icon: Lightbulb, color: '#8b5cf6', desc: 'Creative breakthroughs & technical mastery' },
    { tag: '#CustomerObsession', icon: Target, color: '#10b981', desc: 'Putting users first & solving real pains' },
    { tag: '#Teamwork', icon: Users, color: '#6366f1', desc: 'Radical collaboration & peer enablement' },
    { tag: '#Leadership', icon: Crown, color: '#f59e0b', desc: 'Ownership, mentorship & high standards' },
    { tag: '#BiasForAction', icon: Rocket, color: '#f43f5e', desc: 'Speed, grit & bias for high velocity' }
  ];

  const allowancePercent = user ? Math.round((user.givingAllowance / 100) * 100) : 0;

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* User Recognition Wallet Spotlight */}
      {user ? (
        <div className="coss-card coss-card-glow" style={{ padding: '1.4rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <img
              src={user.avatar}
              alt={user.name}
              className="coss-avatar coss-avatar-lg"
              style={{ border: '3px solid var(--accent-primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.department}</div>
              <div className="coss-badge coss-badge-emerald" style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
                <Sparkles size={11} /> {user.earnedPoints} pts earned
              </div>
            </div>
          </div>

          {/* Monthly Allowance Progress Bar */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '0.45rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Gift size={14} color="var(--accent-primary)" /> Monthly Giving Allowance
              </span>
              <strong style={{ color: 'var(--accent-primary)' }}>{user.givingAllowance} / 100 pts</strong>
            </div>

            <div style={{
              height: 8,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${allowancePercent}%`,
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Badges Mini Showcase */}
          {user.badges?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Badges:</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {user.badges.slice(0, 4).map((b) => (
                  <span
                    key={b.id}
                    title={`${b.name}: ${b.description}`}
                    style={{ fontSize: '1.2rem', cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    {b.icon}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { soundEffects.playPop(); onOpenGiveKudos(); }}
            className="coss-btn coss-btn-primary"
            style={{ width: '100%', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
          >
            <PlusCircle size={16} /> Give Kudos Now
          </button>
        </div>
      ) : (
        <div className="coss-card coss-card-glow" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Celebrate Your Peers</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 1.15rem' }}>
            Sign in to access your 100 monthly recognition points and give kudos.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="coss-btn coss-btn-primary"
            style={{ width: '100%' }}
          >
            Sign In to Start
          </button>
        </div>
      )}

      {/* Culture Champions Top 3 Mini-Podium Widget */}
      <div className="coss-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} color="var(--accent-warning)" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Top Champions
            </span>
          </div>
          <button
            onClick={() => { soundEffects.playPop(); setActiveTab('leaderboard'); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            View All <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {topPeers.map((peer, idx) => (
            <div
              key={peer.userId}
              onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(peer.userId); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface-elevated)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="coss-avatar coss-avatar-sm"
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{peer.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{peer.department}</div>
                </div>
              </div>

              <span className="points-chip" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                +{peer.totalPoints}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Company Values Legend */}
      <div className="coss-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Award size={16} color="var(--accent-secondary)" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Company Core Values
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {valuesCatalog.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.tag}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  background: `${v.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  <Icon size={14} color={v.color} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: v.color }}>{v.tag}</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
