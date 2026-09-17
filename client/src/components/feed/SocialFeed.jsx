import React, { useState, useEffect, useCallback } from 'react';
import { 
  Filter, 
  Search, 
  Sparkles, 
  PlusCircle, 
  RefreshCw, 
  MessageSquare,
  TrendingUp,
  Tag
} from 'lucide-react';
import { KudosCard } from './KudosCard';
import { kudosService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VALUE_FILTERS = [
  'ALL',
  '#Teamwork',
  '#CustomerObsession',
  '#Innovation',
  '#Leadership',
  '#BiasForAction'
];

const DEPARTMENTS = ['ALL', 'Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'HR'];

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
      fetchFeed(page + 1, true);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Top Banner & Quick Give Kudos Callout */}
      <div className="coss-card" style={{
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              Company Recognition Wall
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Celebrate extraordinary peers living our core company values
            </p>
          </div>
        </div>

        <button
          onClick={user ? onOpenGiveKudos : () => openAuthModal('login')}
          className="coss-btn coss-btn-primary"
        >
          <PlusCircle size={17} />
          Give Kudos
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="coss-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
          <input
            type="text"
            className="coss-input"
            placeholder="Search by colleague name or message keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 12, top: 12 }} />
        </div>

        {/* Company Value Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          <Tag size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          {VALUE_FILTERS.map((val) => {
            const isSelected = selectedValue === val;
            return (
              <button
                key={val}
                onClick={() => setSelectedValue(val)}
                className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  flexShrink: 0
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
          gap: '0.4rem',
          overflowX: 'auto',
          marginTop: '0.6rem',
          paddingTop: '0.6rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <Filter size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`coss-badge ${isSelected ? 'coss-badge-violet' : 'coss-badge-outline'}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.72rem',
                  flexShrink: 0
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
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <RefreshCw size={28} className="animate-pulse-glow" color="var(--accent-primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Loading peer recognitions...
          </p>
        </div>
      ) : kudosList.length === 0 ? (
        <div className="coss-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>No Kudos Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 360, margin: '0.5rem auto 1.25rem' }}>
            There are no recognitions matching your current filters. Be the first to spark joy on the team!
          </p>
          <button
            onClick={user ? onOpenGiveKudos : () => openAuthModal('login')}
            className="coss-btn coss-btn-primary"
          >
            <PlusCircle size={16} />
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
            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="coss-btn coss-btn-secondary coss-btn-lg"
                style={{ width: '100%', maxWidth: 300 }}
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
