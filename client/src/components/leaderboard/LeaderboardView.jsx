import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Sparkles, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users,
  Award,
  ChevronRight
} from 'lucide-react';
import { analyticsService } from '../../services/api';

const DEPARTMENTS = ['ALL', 'Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'HR'];
const TIMEFRAMES = [
  { id: 'current_month', label: 'This Month' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'all_time', label: 'All Time' }
];

export const LeaderboardView = ({ onUserClick }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [department, setDepartment] = useState('ALL');
  const [timeframe, setTimeframe] = useState('current_month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [department, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getLeaderboard({ department, timeframe });
      if (res.data?.success) {
        setLeaderboard(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // Helper for podium heights & medal colors
  const getPodiumConfig = (rank) => {
    if (rank === 1) return { color: '#f59e0b', medal: '🥇', height: 160, label: '1st Place' };
    if (rank === 2) return { color: '#94a3b8', medal: '🥈', height: 130, label: '2nd Place' };
    return { color: '#b45309', medal: '🥉', height: 110, label: '3rd Place' };
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="coss-card" style={{
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)'
          }}>
            <Trophy size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Monthly Peer Leaderboard
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Top recognized colleagues ranked via MongoDB aggregation pipelines
            </p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="coss-tabs-list">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`coss-tab-trigger ${timeframe === tf.id ? 'active' : ''}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="coss-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
            <Filter size={14} /> Department:
          </span>
          {DEPARTMENTS.map((dept) => {
            const isSelected = department === dept;
            return (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.78rem',
                  flexShrink: 0
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium Visualization for Top 3 */}
      {top3.length > 0 && (
        <div className="coss-card" style={{
          marginBottom: '1.5rem',
          padding: '2rem 1.5rem 1rem',
          background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 70%), var(--bg-surface)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '1.5rem',
            paddingBottom: '1rem'
          }}>
            {/* 2nd Place (Left) */}
            {top3[1] && (
              <div 
                onClick={() => onUserClick && onUserClick(top3[1].userId)}
                style={{ textAlign: 'center', cursor: 'pointer', width: 180 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <img
                    src={top3[1].avatar}
                    alt={top3[1].name}
                    className="coss-avatar coss-avatar-lg"
                    style={{ border: '3px solid #94a3b8' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.2rem' }}>🥈</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{top3[1].name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{top3[1].department}</div>
                <div className="coss-badge coss-badge-emerald" style={{ marginTop: '0.35rem' }}>
                  +{top3[1].totalPoints} pts
                </div>
                <div style={{
                  height: getPodiumConfig(2).height,
                  background: 'linear-gradient(to top, rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.08))',
                  borderTop: '3px solid #94a3b8',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  color: '#94a3b8'
                }}>
                  #2
                </div>
              </div>
            )}

            {/* 1st Place (Center - Highest) */}
            {top3[0] && (
              <div 
                onClick={() => onUserClick && onUserClick(top3[0].userId)}
                style={{ textAlign: 'center', cursor: 'pointer', width: 200 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <div style={{
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '1.5rem',
                    filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6))'
                  }}>
                    👑
                  </div>
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="coss-avatar coss-avatar-xl"
                    style={{ border: '4px solid #f59e0b', boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.4rem' }}>🥇</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{top3[0].name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{top3[0].department}</div>
                <div className="coss-badge coss-badge-amber" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                  +{top3[0].totalPoints} pts
                </div>
                <div style={{
                  height: getPodiumConfig(1).height,
                  background: 'linear-gradient(to top, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))',
                  borderTop: '3px solid #f59e0b',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#f59e0b'
                }}>
                  #1
                </div>
              </div>
            )}

            {/* 3rd Place (Right) */}
            {top3[2] && (
              <div 
                onClick={() => onUserClick && onUserClick(top3[2].userId)}
                style={{ textAlign: 'center', cursor: 'pointer', width: 180 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <img
                    src={top3[2].avatar}
                    alt={top3[2].name}
                    className="coss-avatar coss-avatar-lg"
                    style={{ border: '3px solid #b45309' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.2rem' }}>🥉</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{top3[2].name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{top3[2].department}</div>
                <div className="coss-badge coss-badge-emerald" style={{ marginTop: '0.35rem' }}>
                  +{top3[2].totalPoints} pts
                </div>
                <div style={{
                  height: getPodiumConfig(3).height,
                  background: 'linear-gradient(to top, rgba(180, 83, 9, 0.25), rgba(180, 83, 9, 0.08))',
                  borderTop: '3px solid #b45309',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  color: '#b45309'
                }}>
                  #3
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="coss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Teammate</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recognitions</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Values</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No recognition activity recorded for this period yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((row) => (
                <tr
                  key={row.userId}
                  onClick={() => onUserClick && onUserClick(row.userId)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 800 }}>
                    {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : `#${row.rank}`}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={row.avatar}
                        alt={row.name}
                        className="coss-avatar coss-avatar-sm"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{row.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span className="coss-badge coss-badge-violet" style={{ fontSize: '0.72rem' }}>
                      {row.department}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {row.kudosCount} received
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {row.valuesReceived?.slice(0, 2).map((val) => (
                        <span key={val} className="coss-badge coss-badge-indigo" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                          {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <span className="coss-badge coss-badge-emerald" style={{ fontWeight: 800, fontSize: '0.84rem' }}>
                      +{row.totalPoints} pts
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
