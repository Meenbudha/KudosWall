import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../utils/effects';

export const Navbar = ({ activeTab, setActiveTab, onOpenGiveKudos, onOpenInbox, onOpenDocs }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('kudos_theme') || 'dark');
  const [isMuted, setIsMuted] = useState(soundEffects.muted);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kudos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    soundEffects.playPop();
  };

  const toggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) soundEffects.playPop();
  };

  return (
    <header style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background var(--transition-normal)'
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
            onClick={() => { setActiveTab('feed'); soundEffects.playPop(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)'
            }}>
              <Award size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  Kudos<span className="text-gradient">Wall</span>
                </span>
                <span className="coss-badge coss-badge-indigo" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>PRO</span>
              </div>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                PEER RECOGNITION PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => { setActiveTab('feed'); soundEffects.playPop(); }}
              className={`coss-btn ${activeTab === 'feed' ? 'coss-btn-primary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <LayoutGrid size={15} />
              Social Feed
            </button>
            <button
              onClick={() => { setActiveTab('leaderboard'); soundEffects.playPop(); }}
              className={`coss-btn ${activeTab === 'leaderboard' ? 'coss-btn-primary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <TrendingUp size={15} />
              Leaderboard
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); soundEffects.playPop(); }}
              className={`coss-btn ${activeTab === 'analytics' ? 'coss-btn-primary' : 'coss-btn-ghost'} coss-btn-sm`}
            >
              <BarChart3 size={15} />
              Analytics
            </button>
          </nav>
        </div>

        {/* Right Section: Wallets, Controls, Give Kudos, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="coss-btn coss-btn-ghost coss-btn-sm"
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-full)' }}
            title={`Switch to ${theme === 'dark' ? 'Daylight Light' : 'Aurora Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* Audio Haptics Toggle */}
          <button
            onClick={toggleSound}
            className="coss-btn coss-btn-ghost coss-btn-sm"
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-full)' }}
            title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
          >
            {isMuted ? <VolumeX size={17} color="var(--text-muted)" /> : <Volume2 size={17} color="var(--accent-primary)" />}
          </button>

          {/* Quick Evaluator Links */}
          <button 
            onClick={() => { onOpenInbox(); soundEffects.playPop(); }}
            className="coss-btn coss-btn-secondary coss-btn-sm" 
            title="Simulated Email Inbox"
          >
            <Mail size={15} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem' }}>Inbox</span>
          </button>

          <button 
            onClick={() => { onOpenDocs(); soundEffects.playPop(); }}
            className="coss-btn coss-btn-secondary coss-btn-sm" 
            title="Interactive API Documentation"
          >
            <BookOpen size={15} color="var(--accent-pink)" />
            <span style={{ fontSize: '0.75rem' }}>API Docs</span>
          </button>

          {user ? (
            <>
              {/* Giving Allowance Pill */}
              <div 
                className="coss-badge coss-badge-indigo"
                style={{ padding: '0.45rem 0.85rem', cursor: 'default', fontSize: '0.8rem' }}
                title="Your monthly points allowance to give to peers"
              >
                <Gift size={15} />
                <span><strong>{user.givingAllowance}</strong> pts to give</span>
              </div>

              {/* Earned Points Pill */}
              <div 
                className="points-chip"
                style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => { setActiveTab('profile'); soundEffects.playPop(); }}
                title="Your cumulative earned recognition points"
              >
                <Sparkles size={14} />
                <span><strong>{user.earnedPoints}</strong> earned</span>
              </div>

              {/* Give Kudos Action Button */}
              <button
                onClick={() => { onOpenGiveKudos(); soundEffects.playPop(); }}
                className="coss-btn coss-btn-primary"
                style={{ borderRadius: 'var(--radius-full)', fontWeight: 700 }}
              >
                <PlusCircle size={18} />
                Give Kudos
              </button>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
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
                    style={{ border: '2px solid var(--accent-primary)', boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)' }}
                  />
                  <ChevronDown size={14} color="var(--text-secondary)" />
                </button>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: 230,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.6rem',
                    zIndex: 100,
                    animation: 'slideUp 0.2s ease-out'
                  }}>
                    <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div className="coss-badge coss-badge-violet" style={{ marginTop: '0.4rem' }}>
                        {user.department}
                      </div>
                    </div>

                    <div style={{ padding: '0.4rem 0' }}>
                      <button
                        onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); soundEffects.playPop(); }}
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
