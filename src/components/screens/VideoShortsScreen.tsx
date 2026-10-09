import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOVA_VIDEOS_DATA } from '../../data/mockData';
import { NovaVideoItem, VideoComment } from '../../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Check,
  Plus,
  X,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoShortsScreenProps {
  onOpenVipModal?: () => void;
}

export const VideoShortsScreen: React.FC<VideoShortsScreenProps> = () => {
  const [videos, setVideos] = useState<NovaVideoItem[]>(NOVA_VIDEOS_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // Default to muted true so HTML5 video autoplay is 100% permitted by all browser policies
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expanded caption per video id
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  // Video progress per video id (0 to 100)
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Floating heart particles on like
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Comment Modal state
  const [activeCommentVideo, setActiveCommentVideo] = useState<NovaVideoItem | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Refs for video elements
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to video helper
  const scrollToVideo = (idx: number) => {
    if (!containerRef.current || idx < 0 || idx >= videos.length) return;
    const targetEl = containerRef.current.children[idx] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Play current active video and pause others
  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return;
      if (idx === currentIndex) {
        videoEl.muted = isMuted;
        if (isPlaying) {
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Browser autoplay policy fallback
              videoEl.muted = true;
              setIsMuted(true);
              videoEl.play().catch(() => {});
            });
          }
        } else {
          videoEl.pause();
        }
      } else {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
    });
  }, [currentIndex, isPlaying, isMuted]);

  // Handle scroll detection for snap index
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      setVideoProgress(0);
    }
  };

  // Toggle Play / Pause on screen tap
  const togglePlayPause = (e: React.MouseEvent) => {
    // Avoid triggering when tapping controls or buttons
    if ((e.target as HTMLElement).closest('.interactive-control')) return;

    setIsPlaying((prev) => !prev);
  };

  // Double tap to like
  const handleDoubleTap = (e: React.MouseEvent, videoId: string) => {
    if ((e.target as HTMLElement).closest('.interactive-control')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spawnFloatingHeart(x, y);
    likeVideo(videoId);
  };

  const spawnFloatingHeart = (x: number, y: number) => {
    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1000);
  };

  const likeVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId && !v.isLiked) {
          try {
            confetti({
              particleCount: 20,
              spread: 40,
              origin: { y: 0.6 },
              colors: ['#E91E63', '#FF4081', '#FFFFFF'],
              disableForReducedMotion: true,
            });
          } catch {
            // ignore
          }
          return {
            ...v,
            isLiked: true,
            likes: v.likes + 1,
          };
        }
        return v;
      })
    );
  };

  // Toggle Like button in Action bar
  const handleToggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextLiked = !v.isLiked;
          if (nextLiked) {
            spawnFloatingHeart(window.innerWidth - 60, window.innerHeight / 2);
            try {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { y: 0.6 },
                colors: ['#E91E63', '#FF4081', '#FFFFFF'],
                disableForReducedMotion: true,
              });
            } catch {
              // ignore
            }
          }
          return {
            ...v,
            isLiked: nextLiked,
            likes: nextLiked ? v.likes + 1 : v.likes - 1,
          };
        }
        return v;
      })
    );
  };

  // Toggle Follow Channel
  const handleToggleFollow = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextFollow = !v.isFollowing;
          setToastMessage(nextFollow ? `Đã theo dõi ${v.channelName}` : `Đã hủy theo dõi`);
          setTimeout(() => setToastMessage(null), 1800);
          return { ...v, isFollowing: nextFollow };
        }
        return v;
      })
    );
  };

  // Share action
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToastMessage('Đã sao chép liên kết video!');
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Toggle caption expand
  const toggleCaptionExpand = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCaptions((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  // Update video progress bar
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setVideoProgress((video.currentTime / video.duration) * 100);
    }
  };

  // Add Comment
  const handleAddComment = () => {
    if (!commentInput.trim() || !activeCommentVideo) return;

    const newComment: VideoComment = {
      id: `vc-${Date.now()}`,
      author: 'Khánh Băng (Tôi)',
      avatar: 'KB',
      content: commentInput.trim(),
      timeAgo: 'Vừa xong',
      likes: 0,
    };

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === activeCommentVideo.id) {
          const updated = {
            ...v,
            commentsCount: v.commentsCount + 1,
            comments: [newComment, ...v.comments],
          };
          setActiveCommentVideo(updated);
          return updated;
        }
        return v;
      })
    );

    setCommentInput('');
  };

  return (
    <div className="relative flex-1 w-full h-full bg-black select-none overflow-hidden text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2C2725]/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xl border border-white/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Floating Controls */}
      <header className="absolute top-2 left-0 right-0 z-30 px-3.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-sm font-black tracking-wider text-white drop-shadow-md">
            NOVA SHORTS
          </span>
          <span className="w-2 h-2 rounded-full bg-[#C84B4B] animate-pulse" />
          <span className="text-[11px] font-bold text-white/70">
            {currentIndex + 1}/{videos.length}
          </span>
          {/* 4K Ultra HD Badge */}
          <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-amber-400/40 text-[9px] font-black text-amber-300 flex items-center gap-1 shadow-xs ml-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>4K DỌC</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Up/Down Navigation Buttons */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-white/20">
            <button
              onClick={() => scrollToVideo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-white/20 cursor-pointer transition-colors"
              title="Video trước"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollToVideo(Math.min(videos.length - 1, currentIndex + 1))}
              disabled={currentIndex === videos.length - 1}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white disabled:opacity-25 hover:bg-white/20 cursor-pointer transition-colors"
              title="Video tiếp theo"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mute / Unmute Button with Pill Badge */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-black/60 border-white/20 text-white/90 hover:bg-black/80'
                : 'bg-[#C84B4B]/90 border-[#C84B4B] text-white shadow-md'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px]">Bật tiếng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px]">Đang phát</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Snap Scroll Vertical Videos Container */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {videos.map((video, index) => {
          const isActive = index === currentIndex;
          const isExpanded = expandedCaptions[video.id] || false;

          return (
            <section
              key={video.id}
              onClick={togglePlayPause}
              onDoubleClick={(e) => handleDoubleTap(e, video.id)}
              className="relative h-full w-full snap-start shrink-0 flex items-center justify-center bg-black overflow-hidden"
              style={{ height: '100%' }}
            >
              {/* High-Resolution 4K Vertical Poster Underlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${video.poster})` }}
              />

              {/* HTML5 Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={video.videoUrl}
                poster={video.poster}
                playsInline
                loop
                autoPlay
                muted={isMuted}
                preload="auto"
                onCanPlay={(e) => {
                  if (isActive && isPlaying) {
                    e.currentTarget.play().catch(() => {
                      e.currentTarget.muted = true;
                      setIsMuted(true);
                      e.currentTarget.play().catch(() => {});
                    });
                  }
                }}
                onTimeUpdate={isActive ? handleTimeUpdate : undefined}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Bottom Gradient Scrim for 100% Readable Caption Text */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

              {/* Persistent Center Play Icon when Video is Paused */}
              {!isPlaying && isActive && (
                <div className="absolute z-20 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-none shadow-2xl animate-fade-in">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
              )}

              {/* Double-tap Floating Hearts */}
              {floatingHearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ scale: 0.4, opacity: 1, y: 0 }}
                  animate={{ scale: [0.8, 1.4, 1.2], opacity: [1, 1, 0], y: -90 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-30 text-[#C84B4B]"
                  style={{ left: heart.x - 20, top: heart.y - 20 }}
                >
                  <Heart className="w-10 h-10 fill-[#C84B4B] drop-shadow-[0_0_12px_rgba(200,75,75,0.8)]" />
                </motion.div>
              ))}

              {/* TikTok Right Action Bar (Elevated ergonomically above bottom edge) */}
              <aside
                aria-label="Tương tác video"
                className="absolute right-2.5 bottom-3.5 z-20 flex flex-col items-center gap-3.5 interactive-control"
              >
                {/* Channel Avatar & Follow Button */}
                <div className="relative mb-0.5">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-[#3A2E2B] flex items-center justify-center text-xs font-bold text-[#FCEEEB] shadow-md"
                  >
                    {video.channelAvatar}
                  </motion.div>
                  <motion.button
                    whileTap={{ scale: 0.7 }}
                    onClick={(e) => handleToggleFollow(video.id, e)}
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full flex items-center justify-center text-white shadow-xs cursor-pointer transition-all ${
                      video.isFollowing
                        ? 'bg-[#2ECC71]'
                        : 'bg-[#C84B4B] hover:scale-110'
                    }`}
                    title={video.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  >
                    {video.isFollowing ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <Plus className="w-3 h-3 stroke-[3]" />
                    )}
                  </motion.button>
                </div>

                {/* Heart / Like Button with Spring Elastic Rebound */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.65, rotate: -15 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    onClick={(e) => handleToggleLike(video.id, e)}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer relative"
                  >
                    <Heart
                      className={`w-6.5 h-6.5 drop-shadow-md transition-all ${
                        video.isLiked
                          ? 'fill-[#C84B4B] text-[#C84B4B] scale-110 drop-shadow-[0_0_10px_rgba(200,75,75,0.7)]'
                          : 'text-white stroke-[2]'
                      }`}
                    />
                  </motion.button>
                  <span className="text-[10px] font-bold drop-shadow-md tabular-nums">
                    {video.likes.toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Comment Button */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.75 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentVideo(video);
                    }}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="w-6.5 h-6.5 drop-shadow-md stroke-[2]" />
                  </motion.button>
                  <span className="text-[10px] font-bold drop-shadow-md tabular-nums">
                    {video.commentsCount}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.75 }}
                    onClick={handleShare}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Share2 className="w-5.5 h-5.5 drop-shadow-md stroke-[2]" />
                  </motion.button>
                  <span className="text-[10px] font-bold drop-shadow-md tabular-nums">
                    {video.sharesCount}
                  </span>
                </div>

                {/* Spinning Music Vinyl Disc */}
                <div className="relative mt-0.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                    className="w-9 h-9 rounded-full border-2 border-white/60 bg-[#1A1817] flex items-center justify-center shadow-lg relative"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#C84B4B] flex items-center justify-center shadow-xs">
                      <Music className="w-2 h-2 text-white" />
                    </div>
                  </motion.div>
                </div>
              </aside>

              {/* Redesigned TikTok / Reels Bottom Caption Bar (Positioned ergonomically right at bottom) */}
              <div className="absolute left-0 right-16 bottom-2.5 z-20 flex flex-col px-3.5 pb-1 pointer-events-none">
                {/* Channel Name & Quick Follow Pill */}
                <div className="flex items-center gap-2 mb-1 pointer-events-auto interactive-control">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] font-extrabold text-white drop-shadow-md tracking-tight">
                      {video.channelName}
                    </h3>
                    {video.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] fill-[#2ECC71]/30 drop-shadow-xs" />
                    )}
                  </div>

                  {/* Follow Pill Button */}
                  <button
                    onClick={(e) => handleToggleFollow(video.id, e)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-xs border ${
                      video.isFollowing
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-[#C84B4B] border-[#C84B4B] text-white hover:bg-[#B84040]'
                    }`}
                  >
                    {video.isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}
                  </button>
                </div>

                {/* Video Title */}
                <h4 className="text-[13px] font-bold text-white leading-snug drop-shadow-md mb-1 pointer-events-auto interactive-control">
                  {video.title}
                </h4>

                {/* Description with Expand / Collapse Toggle */}
                <div className="pointer-events-auto interactive-control mb-1">
                  <p
                    className={`text-[11.5px] text-white/90 leading-relaxed drop-shadow-md ${
                      isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                    }`}
                  >
                    {video.description}
                  </p>
                  <button
                    onClick={(e) => toggleCaptionExpand(video.id, e)}
                    className="text-[10.5px] font-bold text-white/75 hover:text-white flex items-center gap-0.5 mt-0.5 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Thu gọn' : '... Xem thêm'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Hashtags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5 pointer-events-auto interactive-control">
                  {video.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10.5px] font-bold text-[#FCEEEB] hover:text-[#C84B4B] drop-shadow-xs cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Music Track Marquee Ticker */}
                <div className="flex items-center gap-1.5 text-white/90 text-[10.5px] drop-shadow-md pointer-events-auto interactive-control">
                  <Music className="w-3 h-3 animate-pulse text-[#FCEEEB] shrink-0" />
                  <span className="truncate">{video.musicTitle}</span>
                </div>
              </div>

              {/* Slim Video Timeline Progress Bar at bottom edge */}
              <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/20 z-30">
                <div
                  className="h-full bg-white/90 transition-all duration-150"
                  style={{ width: `${isActive ? videoProgress : 0}%` }}
                />
              </div>
            </section>
          );
        })}
      </main>

      {/* TikTok Bottom Comments Drawer Modal */}
      <AnimatePresence>
        {activeCommentVideo && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCommentVideo(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-Up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[430px] max-h-[75%] bg-[#1E1B1A] text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-white/10"
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white/90">
                  {activeCommentVideo.commentsCount} bình luận
                </h3>
                <button
                  onClick={() => setActiveCommentVideo(null)}
                  className="w-7 h-7 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3.5 no-scrollbar max-h-[300px]">
                {activeCommentVideo.comments.length === 0 ? (
                  <div className="py-8 text-center text-white/50 text-xs">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ nhé!
                  </div>
                ) : (
                  activeCommentVideo.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C84B4B] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {c.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/90">
                            {c.author}
                          </span>
                          <span className="text-[10px] text-white/40">{c.timeAgo}</span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Comment Bar */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Thêm bình luận cho mẹ và bé..."
                  className="flex-1 px-3.5 py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C84B4B]"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  className="w-9 h-9 rounded-xl bg-[#C84B4B] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
