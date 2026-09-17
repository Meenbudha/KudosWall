import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Filter, 
  TrendingUp, 
  Users, 
  Award, 
  Crown 
} from 'lucide-react';
import { analyticsService } from '../../services/api';
import { soundEffects } from '../../utils/effects';

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

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div className="coss-card coss-card-glow" style={{
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.65rem 2rem',
        borderRadius: 'var(--radius-lg)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45)'
          }}>
            <Trophy size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Monthly Peer Leaderboard
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Top recognized colleagues ranked via MongoDB aggregation pipelines
            </p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="coss-tabs-list">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                soundEffects.playPop();
                setTimeframe(tf.id);
              }}
              className={`coss-tab-trigger ${timeframe === tf.id ? 'active' : ''}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="coss-card" style={{ padding: '0.95rem 1.4rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            <Filter size={14} color="var(--accent-primary)" /> Department:
          </span>
          {DEPARTMENTS.map((dept) => {
            const isSelected = department === dept;
            return (
              <button
                key={dept}
                onClick={() => {
                  soundEffects.playPop();
                  setDepartment(dept);
                }}
                className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.28)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radiant Podium Visualization for Top 3 */}
      {top3.length > 0 && (
        <div className="coss-card" style={{
          marginBottom: '1.5rem',
          padding: '2.5rem 1.5rem 1.25rem',
          background: 'radial-gradient(circle at 50% 25%, rgba(99, 102, 241, 0.2) 0%, transparent 75%), var(--bg-surface)',
          border: '1px solid var(--border-medium)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '2rem',
            paddingBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* 2nd Place (Left) */}
            {top3[1] && (
              <div 
                onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(top3[1].userId); }}
                style={{ textAlign: 'center', cursor: 'pointer', width: 200 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <img
                    src={top3[1].avatar}
                    alt={top3[1].name}
                    className="coss-avatar coss-avatar-lg"
                    style={{ border: '3px solid #cbd5e1', boxShadow: '0 0 18px rgba(203, 213, 225, 0.4)' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.35rem' }}>🥈</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{top3[1].name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{top3[1].department}</div>
                <div className="points-chip" style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
                  +{top3[1].totalPoints} pts
                </div>
                <div style={{
                  height: 140,
                  background: 'linear-gradient(to top, rgba(203, 213, 225, 0.35), rgba(203, 213, 225, 0.1))',
                  borderTop: '4px solid #cbd5e1',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  color: '#cbd5e1',
                  boxShadow: 'inset 0 10px 15px -3px rgba(255, 255, 255, 0.1)'
                }}>
                  #2
                </div>
              </div>
            )}

            {/* 1st Place (Center - Highest Podium) */}
            {top3[0] && (
              <div 
                onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(top3[0].userId); }}
                style={{ textAlign: 'center', cursor: 'pointer', width: 230 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <div style={{
                    position: 'absolute',
                    top: -26,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '1.65rem',
                    filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.7))',
                    animation: 'floatUpAndFade 3s infinite alternate'
                  }}>
                    👑
                  </div>
                  <img
                    src={top3[0].avatar}
                    alt={top3[0].name}
                    className="coss-avatar coss-avatar-xl"
                    style={{ border: '4px solid #fbbf24', boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.5rem' }}>🥇</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{top3[0].name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{top3[0].department}</div>
                <div className="coss-badge coss-badge-amber" style={{ marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: 800 }}>
                  🏆 +{top3[0].totalPoints} pts
                </div>
                <div style={{
                  height: 180,
                  background: 'linear-gradient(to top, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.15))',
                  borderTop: '4px solid #f59e0b',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2.25rem',
                  color: '#fbbf24',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.25), inset 0 10px 15px -3px rgba(255, 255, 255, 0.15)'
                }}>
                  #1
                </div>
              </div>
            )}

            {/* 3rd Place (Right) */}
            {top3[2] && (
              <div 
                onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(top3[2].userId); }}
                style={{ textAlign: 'center', cursor: 'pointer', width: 200 }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                  <img
                    src={top3[2].avatar}
                    alt={top3[2].name}
                    className="coss-avatar coss-avatar-lg"
                    style={{ border: '3px solid #d97706', boxShadow: '0 0 18px rgba(217, 119, 6, 0.35)' }}
                  />
                  <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: '1.35rem' }}>🥉</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{top3[2].name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{top3[2].department}</div>
                <div className="points-chip" style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
                  +{top3[2].totalPoints} pts
                </div>
                <div style={{
                  height: 110,
                  background: 'linear-gradient(to top, rgba(217, 119, 6, 0.35), rgba(217, 119, 6, 0.1))',
                  borderTop: '4px solid #d97706',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  color: '#d97706',
                  boxShadow: 'inset 0 10px 15px -3px rgba(255, 255, 255, 0.1)'
                }}>
                  #3
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table with Responsive Overflow Protection */}
      <div className="coss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 740 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '70px' }}>Rank</th>
                <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '190px' }}>Teammate</th>
                <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '130px' }}>Department</th>
                <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '120px' }}>Recognitions</th>
                <th style={{ padding: '0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '180px' }}>Top Values</th>
                <th style={{ padding: '0.95rem 1.75rem 0.95rem 1.15rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right', width: '140px' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recognition activity recorded for this period yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((row) => (
                  <tr
                    key={row.userId}
                    onClick={() => { soundEffects.playPop(); onUserClick && onUserClick(row.userId); }}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.95rem 1.15rem', fontWeight: 900 }}>
                      {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : `#${row.rank}`}
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="coss-avatar coss-avatar-sm"
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{row.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <span className="coss-badge coss-badge-violet" style={{ fontSize: '0.75rem' }}>
                        {row.department}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong>{row.kudosCount}</strong> received
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {row.valuesReceived?.slice(0, 2).map((val) => (
                          <span key={val} className="coss-badge coss-badge-indigo" style={{ fontSize: '0.7rem', padding: '0.18rem 0.5rem' }}>
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1.75rem 0.95rem 1.15rem', textAlign: 'right' }}>
                      <span className="points-chip" style={{ fontSize: '0.85rem' }}>
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
    </div>
  );
};
