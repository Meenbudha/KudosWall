import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { SocialFeed } from './components/feed/SocialFeed';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileView } from './components/profile/ProfileView';
import { GiveKudosModal } from './components/feed/GiveKudosModal';
import { AuthModal } from './components/auth/AuthModal';
import { SimulatedInboxModal } from './components/simulated/SimulatedInboxModal';
import { ApiDocsModal } from './components/docs/ApiDocsModal';

const AppContent = () => {
  const { user, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'leaderboard' | 'analytics' | 'profile'
  const [viewingUserId, setViewingUserId] = useState(null);

  const [giveKudosOpen, setGiveKudosOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
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
        onOpenDocs={() => setDocsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1, paddingTop: '1.75rem', paddingBottom: '3rem' }}>
        {activeTab === 'feed' && (
          <SocialFeed
            onOpenGiveKudos={handleOpenGiveKudos}
            onUserClick={handleUserClick}
            newKudosItem={newlyCreatedKudos}
          />
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
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>KudosWall</strong> • Peer Recognition & Internal Feedback Platform (Bonusly / Matter Alternative)
          </div>
          <div>
            Pair-Token Auth (15m/7d Cookies) • Atomic Points Transfers • Coss UI System
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

      <ApiDocsModal
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
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
