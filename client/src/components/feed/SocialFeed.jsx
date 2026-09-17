import React, { useState, useEffect, useCallback } from 'react';
import { 
  Filter, 
  Search, 
  Sparkles, 
  PlusCircle, 
  RefreshCw, 
  MessageSquare,
  TrendingUp,
  Tag,
  Zap
} from 'lucide-react';
import { KudosCard } from './KudosCard';
import { kudosService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../utils/effects';

const VALUE_FILTERS = [
  'ALL',
  '#Teamwork',
  '#CustomerObsession',
  '#Innovation',
  '#Leadership',
  '#BiasForAction'
];

const DEPARTMENTS = ['ALL', 'Developer', 'Design', 'Marketing', 'Sales', 'Product', 'HR'];

export const SocialFeed = ({ onOpenGiveKudos, onUserClick, newKudosItem }) => {
  const { user, openAuthModal } = useAuth();
  const [kudosList, setKudosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedValue, setSelectedValue] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch feed items
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = {
        page: pageNum,
        limit: 8,
        companyValue: selectedValue,
        department: selectedDept,
        search: searchTerm
      };

      const res = await kudosService.getKudosFeed(params);
      if (res.data?.success) {
        if (append) {
          setKudosList((prev) => [...prev, ...res.data.data]);
        } else {
          setKudosList(res.data.data);
        }
        setHasMore(res.data.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedValue, selectedDept, searchTerm]);

  useEffect(() => {
    fetchFeed(1, false);
  }, [fetchFeed]);

  // Prepend newly submitted kudos if received from parent modal
  useEffect(() => {
    if (newKudosItem) {
      setKudosList((prev) => [newKudosItem, ...prev]);
    }
  }, [newKudosItem]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      soundEffects.playPop();
      fetchFeed(page + 1, true);
    }
  };

  const latestKudos = kudosList[0];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Live Activity Pulse Ticker */}
      {latestKudos && (
        <div className="live-ticker">
          <div className="pulse-dot" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Live Recognition:</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>{latestKudos.sender?.name}</strong> recognized <strong>{latestKudos.receiver?.name}</strong> with +{latestKudos.points} pts for {latestKudos.companyValue}
          </span>
        </div>
      )}

      {/* Top Banner & Quick Give Kudos Callout with Vibrant Gradient */}
      <div className="coss-card coss-card-glow" style={{
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 1.85rem',
        borderRadius: 'var(--radius-lg)'
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
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Company Recognition Wall
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Celebrate peer excellence across our core company values with monthly allowance points
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playPop();
            user ? onOpenGiveKudos() : openAuthModal('login');
          }}
          className="coss-btn coss-btn-primary coss-btn-lg"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <PlusCircle size={18} />
          Give Kudos
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="coss-card" style={{ padding: '1.15rem 1.4rem', marginBottom: '1.5rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type="text"
            className="coss-input"
            placeholder="Search by colleague name, department, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={17} color="var(--text-muted)" style={{ position: 'absolute', right: 14, top: 14 }} />
        </div>

        {/* Company Value Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          <Tag size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          {VALUE_FILTERS.map((val) => {
            const isSelected = selectedValue === val;
            return (
              <button
                key={val}
                onClick={() => {
                  soundEffects.playPop();
                  setSelectedValue(val);
                }}
                className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  fontWeight: isSelected ? 800 : 600,
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none'
                }}
              >
                {val}
              </button>
            );
          })}
        </div>

        {/* Department Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          overflowX: 'auto',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <Filter size={15} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => {
                  soundEffects.playPop();
                  setSelectedDept(dept);
                }}
                className={`coss-badge ${isSelected ? 'coss-badge-violet' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-secondary)' : '1px solid var(--border-medium)',
                  fontWeight: isSelected ? 800 : 600,
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none'
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
          <RefreshCw size={32} color="var(--accent-primary)" style={{ animation: 'spin 1.2s linear infinite' }} />
          <p style={{ marginTop: '0.85rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading peer recognitions...
          </p>
        </div>
      ) : kudosList.length === 0 ? (
        <div className="coss-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <MessageSquare size={40} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>No Recognitions Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 380, margin: '0.5rem auto 1.5rem' }}>
            No kudos match your filters. Be the culture spark by celebrating a teammate right now!
          </p>
          <button
            onClick={() => {
              soundEffects.playPop();
              user ? onOpenGiveKudos() : openAuthModal('login');
            }}
            className="coss-btn coss-btn-primary"
          >
            <PlusCircle size={17} />
            Give the First Kudos
          </button>
        </div>
      ) : (
        <div>
          {kudosList.map((item) => (
            <KudosCard
              key={item._id}
              kudos={item}
              onUserClick={onUserClick}
            />
          ))}

          {/* Infinite Scroll / Load More Action */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1.75rem', marginBottom: '2.5rem' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="coss-btn coss-btn-secondary coss-btn-lg"
                style={{ width: '100%', maxWidth: 320 }}
              >
                {loadingMore ? 'Fetching more kudos...' : 'Load More Recognitions'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
