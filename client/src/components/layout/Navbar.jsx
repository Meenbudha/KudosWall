import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Gift, 
  PlusCircle, 
  LogOut, 
  User as UserIcon, 
  Mail, 
  BookOpen, 
  TrendingUp, 
  LayoutGrid, 
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenGiveKudos, onOpenInbox, onOpenDocs }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);

  const demoAccounts = [
    { name: 'Alex Rivera', email: 'alex.rivera@company.internal', dept: 'Engineering' },
    { name: 'Sarah Chen', email: 'sarah.chen@company.internal', dept: 'Design' },
    { name: 'Marcus Vance', email: 'marcus.vance@company.internal', dept: 'Engineering' },
    { name: 'Elena Rostova', email: 'elena.rostova@company.internal', dept: 'Product' },
    { name: 'David Kim', email: 'david.kim@company.internal', dept: 'Marketing' },
    { name: 'Priya Patel', email: 'priya.patel@company.internal', dept: 'Sales' }
  ];

  const handleQuickLogin = async (email) => {
    setQuickLoginOpen(false);
    setUserDropdownOpen(false);
    const { useAuth: authHook } = await import('../../context/AuthContext');
    // Using login from context
  };

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div 
            onClick={() => setActiveTab('feed')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Award size={22} color="#fff" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Kudos<span style={{ color: 'var(--accent-primary)' }}>Wall</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                PEER RECOGNITION PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('feed')}
              className={`coss-btn ${activeTab === 'feed' ? 'coss-btn-secondary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <LayoutGrid size={15} />
              Social Feed
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`coss-btn ${activeTab === 'leaderboard' ? 'coss-btn-secondary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <TrendingUp size={15} />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`coss-btn ${activeTab === 'analytics' ? 'coss-btn-secondary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <BarChart3 size={15} />
              Analytics
            </button>
          </nav>
        </div>

        {/* Right Section: Wallets, Give Kudos, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Evaluator Links */}
          <button 
            onClick={onOpenInbox}
            className="coss-btn coss-btn-ghost coss-btn-sm" 
            title="Simulated Email Inbox for testing verification tokens"
            style={{ position: 'relative' }}
          >
            <Mail size={16} />
            <span style={{ fontSize: '0.75rem' }}>Simulated Inbox</span>
          </button>

          <button 
            onClick={onOpenDocs}
            className="coss-btn coss-btn-ghost coss-btn-sm" 
            title="Interactive API Documentation"
          >
            <BookOpen size={16} />
            <span style={{ fontSize: '0.75rem' }}>API Docs</span>
          </button>

          {user ? (
            <>
              {/* Giving Allowance Pill */}
              <div 
                className="coss-badge coss-badge-indigo"
                style={{ padding: '0.4rem 0.8rem', cursor: 'default' }}
                title="Your monthly points allowance to give to peers"
              >
                <Gift size={14} />
                <span><strong>{user.givingAllowance}</strong> pts to give</span>
              </div>

              {/* Earned Points Pill */}
              <div 
                className="coss-badge coss-badge-emerald"
                style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                onClick={() => setActiveTab('profile')}
                title="Your cumulative earned recognition points"
              >
                <Sparkles size={14} />
                <span><strong>{user.earnedPoints}</strong> pts earned</span>
              </div>

              {/* Give Kudos Action Button */}
              <button
                onClick={onOpenGiveKudos}
                className="coss-btn coss-btn-primary"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <PlusCircle size={17} />
                Give Kudos
              </button>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="coss-avatar coss-avatar-sm"
                    style={{ border: '2px solid var(--accent-primary)' }}
                  />
                  <ChevronDown size={14} color="var(--text-secondary)" />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 220,
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 100
                  }}>
                    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div className="coss-badge coss-badge-violet" style={{ marginTop: '0.35rem' }}>
                        {user.department}
                      </div>
                    </div>

                    <div style={{ padding: '0.35rem 0' }}>
                      <button
                        onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); }}
                        className="coss-btn coss-btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem' }}
                      >
                        <UserIcon size={15} /> My Profile & Badges
                      </button>
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="coss-btn coss-btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem', color: 'var(--accent-danger)' }}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="coss-btn coss-btn-outline coss-btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="coss-btn coss-btn-primary coss-btn-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
