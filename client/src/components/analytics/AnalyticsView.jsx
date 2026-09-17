import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  Sparkles, 
  Users, 
  Award, 
  RotateCcw
} from 'lucide-react';
import { analyticsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AnalyticsView = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalyticsSummary();
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllowance = async () => {
    if (!window.confirm('Simulate monthly allowance refresh? This will reset all team members giving allowance to 100 points.')) {
      return;
    }

    try {
      setResetting(true);
      const res = await analyticsService.resetMonthlyAllowance();
      if (res.data?.success) {
        showToast(res.data.message || 'Allowances refreshed to 100 points!', 'success');
        await refreshUser();
        fetchSummary();
      }
    } catch (err) {
      showToast('Reset failed. Make sure you are logged in.', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading organizational recognition analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
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
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <BarChart3 size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Organizational Culture Analytics
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Data insights on company values distribution and peer engagement
            </p>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          className="coss-btn coss-btn-outline coss-btn-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Kudos Shared</span>
            <Award size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {summary?.totalKudos || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peer recognitions across company</span>
        </div>

        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Points Transferred</span>
            <Sparkles size={18} color="var(--accent-success)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--accent-success)', marginTop: '0.5rem' }}>
            {summary?.totalPointsGiven || 0} pts
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Celebrated through peer wallets</span>
        </div>

        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Team Members</span>
            <Users size={18} color="var(--accent-secondary)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {summary?.totalUsers || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across 6 core departments</span>
        </div>
      </div>

      {/* Company Values Distribution */}
      <div className="coss-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Core Values Distribution</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.35rem' }}>
          Which company values team members are celebrating most frequently
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {(summary?.companyValues || []).map((cv) => {
            const percentage = summary?.totalKudos ? Math.round((cv.count / summary.totalKudos) * 100) : 0;
            return (
              <div key={cv._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cv._id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {cv.count} kudos ({cv.totalPoints} pts) • <strong>{percentage}%</strong>
                  </span>
                </div>
                <div style={{
                  height: 9,
                  width: '100%',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="coss-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Department Points Summary</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.35rem' }}>
          Recognition points accumulated by each department
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {(summary?.departmentBreakdown || []).map((d) => (
            <div
              key={d._id}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{d._id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{d.memberCount} members</div>
              <div className="points-chip" style={{ marginTop: '0.65rem', fontSize: '0.78rem' }}>
                +{d.totalEarnedPoints} pts earned
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Allowance Reset Simulator */}
      <div className="coss-card" style={{
        border: '1px solid rgba(245, 158, 11, 0.35)',
        background: 'rgba(245, 158, 11, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} color="var(--accent-warning)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Monthly Allowance Reset Engine</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 560, marginTop: '0.4rem', lineHeight: 1.5 }}>
              According to specification requirements, each month all employee recognition wallets have their 
              <code>givingAllowance</code> refreshed back to <strong>100 points</strong>.
              In production, this executes as a scheduled cron job. You can simulate the trigger here on demand.
            </p>
          </div>

          <button
            onClick={handleResetAllowance}
            disabled={resetting || !user}
            className="coss-btn coss-btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', fontWeight: 700 }}
          >
            <RotateCcw size={16} />
            {resetting ? 'Resetting...' : 'Simulate Monthly Reset (100 pts)'}
          </button>
        </div>
      </div>
    </div>
  );
};
