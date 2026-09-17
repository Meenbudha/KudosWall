import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { SocialFeed } from './components/feed/SocialFeed';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileView } from './components/profile/ProfileView';
import { SidebarWidgets } from './components/layout/SidebarWidgets';
import { GiveKudosModal } from './components/feed/GiveKudosModal';
import { AuthModal } from './components/auth/AuthModal';
import { SimulatedInboxModal } from './components/simulated/SimulatedInboxModal';

const AppContent = () => {
  const { user, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'leaderboard' | 'analytics' | 'profile'
  const [viewingUserId, setViewingUserId] = useState(null);

  const [giveKudosOpen, setGiveKudosOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [newlyCreatedKudos, setNewlyCreatedKudos] = useState(null);

  const handleOpenGiveKudos = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setGiveKudosOpen(true);
  };

  const handleUserClick = (id) => {
    if (id) {
      setViewingUserId(id);
      setActiveTab('profile');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'profile') setViewingUserId(null);
          setActiveTab(tab);
        }}
        onOpenGiveKudos={handleOpenGiveKudos}
        onOpenInbox={() => setInboxOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: '1.75rem', paddingBottom: '3.5rem' }}>
        {activeTab === 'feed' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '1.75rem',
            alignItems: 'start'
          }}>
            {/* Center Feed Stream */}
            <div>
              <SocialFeed
                onOpenGiveKudos={handleOpenGiveKudos}
                onUserClick={handleUserClick}
                newKudosItem={newlyCreatedKudos}
              />
            </div>

            {/* Right Sticky Sidebar */}
            <div style={{ position: 'sticky', top: '80px' }}>
              <SidebarWidgets
                onOpenGiveKudos={handleOpenGiveKudos}
                onUserClick={handleUserClick}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView onUserClick={handleUserClick} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userId={viewingUserId}
            onBack={() => {
              setViewingUserId(null);
              setActiveTab('feed');
            }}
            onOpenGiveKudos={handleOpenGiveKudos}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        padding: '1.75rem 0',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>KudosWall</span>
            <span>• Peer Recognition & Internal Feedback Platform (Bonusly / Matter Alternative)</span>
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            Pair-Token Auth (15m/7d Cookies) • Atomic Points Transfer • Coss UI Standard
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GiveKudosModal
        isOpen={giveKudosOpen}
        onClose={() => setGiveKudosOpen(false)}
        onKudosCreated={(kudos) => {
          setNewlyCreatedKudos(kudos);
        }}
      />

      <AuthModal />

      <SimulatedInboxModal
        isOpen={inboxOpen}
        onClose={() => setInboxOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
