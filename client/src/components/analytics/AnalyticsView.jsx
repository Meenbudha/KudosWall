import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  RefreshCw, 
  Sparkles, 
  Users, 
  Award, 
  Layers, 
  RotateCcw,
  CheckCircle2,
  TrendingUp
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Top Header */}
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <BarChart3 size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Organizational Culture Analytics
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
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
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Kudos Shared</span>
            <Award size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {summary?.totalKudos || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Peer recognitions across company</span>
        </div>

        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Points Transferred</span>
            <Sparkles size={18} color="var(--accent-success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '0.5rem' }}>
            {summary?.totalPointsGiven || 0} pts
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Celebrated through peer wallets</span>
        </div>

        <div className="coss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Active Team Members</span>
            <Users size={18} color="var(--accent-secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
            {summary?.totalUsers || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across 6 core departments</span>
        </div>
      </div>

      {/* Company Values Distribution */}
      <div className="coss-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Core Values Distribution</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Which company values team members are celebrating most frequently
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(summary?.companyValues || []).map((cv) => {
            const percentage = summary?.totalKudos ? Math.round((cv.count / summary.totalKudos) * 100) : 0;
            return (
              <div key={cv._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{cv._id}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cv.count} kudos ({cv.totalPoints} pts) • {percentage}%</span>
                </div>
                <div style={{
                  height: 8,
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="coss-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Department Points Summary</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Recognition points accumulated by each department
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {(summary?.departmentBreakdown || []).map((d) => (
            <div
              key={d._id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{d._id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.memberCount} members</div>
              <div className="coss-badge coss-badge-emerald" style={{ marginTop: '0.5rem' }}>
                +{d.totalEarnedPoints} pts earned
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Allowance Reset Simulator */}
      <div className="coss-card" style={{
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'rgba(245, 158, 11, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} color="var(--accent-warning)" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Monthly Allowance Reset Engine</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 540, marginTop: '0.4rem' }}>
              According to specification requirements, each month all employee recognition wallets have their 
              <code>givingAllowance</code> refreshed back to <strong>100 points</strong>.
              In production, this executes as a scheduled cron job. You can simulate the trigger here on demand.
            </p>
          </div>

          <button
            onClick={handleResetAllowance}
            disabled={resetting || !user}
            className="coss-btn coss-btn-primary"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            <RotateCcw size={16} />
            {resetting ? 'Resetting...' : 'Simulate Monthly Reset (100 pts)'}
          </button>
        </div>
      </div>
    </div>
  );
};
