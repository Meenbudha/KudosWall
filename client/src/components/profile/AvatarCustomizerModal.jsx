import React, { useState, useRef } from 'react';
import { X, UploadCloud, Sparkles, Shuffle, Check, Camera, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AVATAR_STYLES = [
  { id: 'bottts', label: '🤖 Tech Bots' },
  { id: 'adventurer', label: '🧭 Adventurer' },
  { id: 'lorelei', label: '✨ Modern Faces' },
  { id: 'fun-emoji', label: '🦊 Playful Emoji' },
  { id: 'pixel-art', label: '👾 Pixel Art' },
  { id: 'avataaars', label: '🧑‍💻 Avataaars' }
];

const INITIAL_SEEDS = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Dakota',
  'Quinn', 'Skyler', 'Reese', 'Rowan', 'Phoenix', 'Sage', 'Emerson', 'Finley'
];

export const AvatarCustomizerModal = ({ isOpen, onClose, currentAvatar, onAvatarSaved }) => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload'
  const [selectedStyle, setSelectedStyle] = useState('bottts');
  const [seedList, setSeedList] = useState(INITIAL_SEEDS);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Generate random new seeds for presets
  const handleShuffle = () => {
    const randomSeeds = Array.from({ length: 16 }, () => 
      'kudos_' + Math.random().toString(36).substring(2, 9)
    );
    setSeedList(randomSeeds);
  };

  // Process and compress local image file to a lightweight data URL
  const processImageFile = (file) => {
    setUploadError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize image via canvas for fast loading & compact storage (max 256x256)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        // Crop to square from center
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedAvatar(dataUrl);
        showToast('Local picture loaded! Click Save to apply.', 'info');
      };
      img.onerror = () => {
        setUploadError('Could not process this image. Please try another file.');
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => {
      setUploadError('Failed to read file from computer.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Save updated avatar to user profile
  const handleSave = async () => {
    if (!selectedAvatar) {
      showToast('Please select or upload an avatar first.', 'error');
      return;
    }

    if (selectedAvatar === currentAvatar) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      const res = await userService.updateProfile({ avatar: selectedAvatar });

      if (res.data?.success) {
        const newAvatar = res.data.user.avatar;
        updateUser({ avatar: newAvatar });
        if (onAvatarSaved) onAvatarSaved(newAvatar);

        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti if unsupported
        }

        showToast('Profile avatar updated successfully! ✨', 'success');
        onClose();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update avatar. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coss-dialog-backdrop" onClick={onClose}>
      <div 
        className="coss-dialog-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 640 }}
      >
        {/* Modal Header */}
        <div className="coss-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                Customize Profile Picture
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Upload a personal photo from your computer or pick from designer avatar styles
              </p>
            </div>
          </div>

          <button onClick={onClose} className="coss-btn coss-btn-ghost coss-btn-sm" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="coss-dialog-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Tab Selector: Designer Presets vs Upload PC */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`coss-btn ${activeTab === 'presets' ? 'coss-btn-primary' : 'coss-btn-secondary'} coss-btn-sm`}
            >
              <Sparkles size={15} /> Designer Avatars
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`coss-btn ${activeTab === 'upload' ? 'coss-btn-primary' : 'coss-btn-secondary'} coss-btn-sm`}
            >
              <UploadCloud size={15} /> Upload from PC
            </button>
          </div>

          {/* TAB 1: DESIGNER AVATAR PRESETS */}
          {activeTab === 'presets' && (
            <div>
              {/* Category Pills & Shuffle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {AVATAR_STYLES.map((style) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                      <button
                        type="button"
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`coss-badge ${isSelected ? 'coss-badge-indigo' : 'coss-badge-outline'}`}
                        style={{
                          cursor: 'pointer',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 800 : 500,
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)'
                        }}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleShuffle}
                  className="coss-btn coss-btn-outline coss-btn-sm"
                  title="Generate new avatar seeds"
                >
                  <Shuffle size={14} /> Shuffle
                </button>
              </div>

              {/* Avatar Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                gap: '0.75rem',
                maxHeight: 250,
                overflowY: 'auto',
                padding: '0.4rem'
              }}>
                {seedList.map((seed, idx) => {
                  const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}`;
                  const isCurrent = selectedAvatar === avatarUrl;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'rgba(99, 102, 241, 0.16)' : 'var(--bg-surface-elevated)',
                        border: isCurrent ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        boxShadow: isCurrent ? '0 0 14px rgba(99, 102, 241, 0.35)' : 'none',
                        transition: 'all 0.16s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => !isCurrent && (e.currentTarget.style.transform = 'scale(1.06)')}
                      onMouseLeave={(e) => !isCurrent && (e.currentTarget.style.transform = 'scale(1)')}
                      title={`Select avatar`}
                    >
                      <img
                        src={avatarUrl}
                        alt="Preset Avatar"
                        style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {isCurrent && (
                        <div style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          background: 'var(--accent-primary)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FROM LOCAL PC */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
                  background: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  style={{ display: 'none' }}
                />

                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <UploadCloud size={28} />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Click to browse or drag & drop image here
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Supports PNG, JPG, WEBP, GIF, SVG from your local device (Max 5MB)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                  ⚡ Auto-cropped & optimized for crystal-clear avatar display
                </div>
              </div>

              {uploadError && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-danger)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}>
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Real-Time Live Preview Comparison */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={selectedAvatar || currentAvatar}
                  alt="Selected Preview"
                  className="coss-avatar coss-avatar-lg"
                  style={{
                    border: '3px solid var(--accent-primary)',
                    boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Selected Avatar Preview
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {selectedAvatar?.startsWith('data:') 
                    ? '📁 Uploaded from Local PC (Custom Photo)'
                    : '🎨 Designer Preset Selected'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="coss-btn coss-btn-ghost coss-btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedAvatar}
                className="coss-btn coss-btn-primary coss-btn-sm"
                style={{ fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Apply Avatar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
