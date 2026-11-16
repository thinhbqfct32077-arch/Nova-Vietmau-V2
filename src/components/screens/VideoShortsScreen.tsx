import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOVA_VIDEOS_DATA, VIDEO_CATEGORIES } from '../../data/mockData';
import {
  NovaVideoItem,
  UserProfile,
  VideoCategory,
  AppNotification,
  VideoWatchEntry,
  VideoPlaylist,
} from '../../types';
import { apiService } from '../../services/apiService';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
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
  Bell,
  Upload,
  Shield,
  Edit3,
  Trash2,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  FileVideo,
  CheckCheck,
  Bookmark,
  Search,
  ListMusic,
  Flag,
  Info,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoShortsScreenProps {
  user?: UserProfile;
  onOpenVipModal?: () => void;
  focusVideoId?: string | null;
  onClearFocusVideo?: () => void;
}

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

export const VideoShortsScreen: React.FC<VideoShortsScreenProps> = ({
  user,
  focusVideoId,
  onClearFocusVideo,
}) => {
  const [videos, setVideos] = useState<NovaVideoItem[]>(() =>
    NOVA_VIDEOS_DATA.filter((v) => v.status === 'approved')
  );
  const [myVideos, setMyVideos] = useState<NovaVideoItem[]>([]);
  const [moderationVideos, setModerationVideos] = useState<NovaVideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('all');
  const [weekFilter, setWeekFilter] = useState<'all' | 'my_week' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Favorites, Watch History & Playlists
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<VideoWatchEntry[]>([]);
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'favorites' | 'history' | 'playlists'>('favorites');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [detailVideo, setDetailVideo] = useState<NovaVideoItem | null>(null);

  // Report Video Modal
  const [reportTargetVideo, setReportTargetVideo] = useState<NovaVideoItem | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Comment Drawer state
  const [activeCommentVideo, setActiveCommentVideo] = useState<NovaVideoItem | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Upload / Edit Video Modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<NovaVideoItem | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<VideoCategory, 'all'>>('thai_giao_nhac');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formVideoFile, setFormVideoFile] = useState<File | null>(null);
  const [formPosterFile, setFormPosterFile] = useState<File | null>(null);
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manage & Moderation Modal state
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'mine' | 'moderation'>('mine');
  const [rejectingVideoId, setRejectingVideoId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Video Notifications Drawer state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [videoNotifs, setVideoNotifs] = useState<AppNotification[]>([]);
  const [videoNotifEnabled, setVideoNotifEnabled] = useState(true);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProgressSentRef = useRef<Record<string, number>>({});

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const isGuest = user?.id === 'usr-guest';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const loadAllVideoData = async () => {
    setIsLoadingFeed(true);
    try {
      const feed = await apiService.fetchVideos('feed', user);
      setVideos(feed);
      const mine = await apiService.fetchVideos('mine', user);
      setMyVideos(mine);
      if (canModerate) {
        const modList = await apiService.fetchVideos('moderation', user);
        setModerationVideos(modList);
      }
      const [notifs, prefs, lib] = await Promise.all([
        apiService.fetchNotifications('video', user),
        apiService.fetchNotificationPrefs(user),
        apiService.fetchVideoLibraryState(user),
      ]);
      setVideoNotifs(notifs);
      setVideoNotifEnabled(prefs.videoEnabled);
      setFavoriteVideoIds(lib.favoriteVideoIds);
      setWatchHistory(lib.watchHistory);
      setPlaylists(lib.playlists);
    } catch {
      // Keep fallback data if offline
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    loadAllVideoData();
  }, [user?.id, user?.role]);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const myWeek = user?.pregnancyWeek || 24;
    return videos.filter((v) => {
      if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
      if (weekFilter === 'favorites' && !favoriteVideoIds.includes(v.id)) return false;
      if (weekFilter === 'my_week') {
        const minW = v.weekMin || 1;
        const maxW = v.weekMax || 40;
        if (myWeek < minW || myWeek > maxW) return false;
      }
      if (q) {
        const match =
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q) ||
          v.hashtags.some((h) => h.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [videos, selectedCategory, weekFilter, favoriteVideoIds, searchQuery, user?.pregnancyWeek]);

  // Jump to focused video if navigated from notification or search
  useEffect(() => {
    if (focusVideoId && filteredVideos.length > 0) {
      const idx = filteredVideos.findIndex((v) => v.id === focusVideoId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setTimeout(() => scrollToVideo(idx), 120);
      }
      onClearFocusVideo?.();
    }
  }, [focusVideoId, filteredVideos]);

  useEffect(() => {
    if (currentIndex >= filteredVideos.length && filteredVideos.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredVideos.length]);

  const scrollToVideo = (idx: number) => {
    if (!containerRef.current || idx < 0 || idx >= filteredVideos.length) return;
    const targetEl = containerRef.current.children[idx] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return;
      const vid = filteredVideos[idx];
      if (idx === currentIndex) {
        videoEl.muted = isMuted;
        if (vid) {
          const hist = watchHistory.find((h) => h.videoId === vid.id);
          if (hist && hist.progressSec > 3 && videoEl.currentTime < 1) {
            try {
              videoEl.currentTime = hist.progressSec;
            } catch {}
          }
        }
        if (isPlaying) {
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
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
  }, [currentIndex, isPlaying, isMuted, filteredVideos.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (!clientHeight) return;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < filteredVideos.length) {
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      setVideoProgress(0);
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-control')) return;
    setIsPlaying((prev) => !prev);
  };

  const spawnFloatingHeart = (x: number, y: number) => {
    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1000);
  };

  const handleDoubleTap = (e: React.MouseEvent, videoId: string) => {
    if ((e.target as HTMLElement).closest('.interactive-control')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spawnFloatingHeart(e.clientX - rect.left, e.clientY - rect.top);
    const target = videos.find((v) => v.id === videoId);
    if (target && !target.isLiked) {
      handleToggleLike(videoId, e);
    }
  };

  const handleToggleLike = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const nextLiked = !v.isLiked;
        if (nextLiked) {
          try {
            confetti({
              particleCount: 18,
              spread: 40,
              origin: { y: 0.6 },
              colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
              disableForReducedMotion: true,
            });
          } catch {}
        }
        return {
          ...v,
          isLiked: nextLiked,
          likes: nextLiked ? v.likes + 1 : Math.max(0, v.likes - 1),
        };
      })
    );
    try {
      const updated = await apiService.toggleVideoLike(videoId, user);
      setVideos((prev) => prev.map((v) => (v.id === videoId ? updated : v)));
    } catch {}
  };

  const handleToggleFavorite = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextFavs = await apiService.toggleVideoFavorite(videoId, user);
      setFavoriteVideoIds(nextFavs);
      showToast(
        nextFavs.includes(videoId) ? 'Đã lưu video vào danh sách yêu thích' : 'Đã bỏ lưu video'
      );
    } catch {}
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const activeVid = filteredVideos[currentIndex];
    try {
      const updated = await apiService.createVideoPlaylist(
        newPlaylistName.trim(),
        activeVid?.id,
        user
      );
      setPlaylists(updated);
      setNewPlaylistName('');
      showToast('Đã tạo danh sách phát mới!');
    } catch {}
  };

  const handleToggleInPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const updated = await apiService.toggleVideoInPlaylist(playlistId, videoId, user);
      setPlaylists(updated);
      showToast('Đã cập nhật danh sách phát');
    } catch {}
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetVideo || !reportReason.trim()) return;
    try {
      await apiService.createContentReport(
        {
          targetType: 'video',
          targetId: reportTargetVideo.id,
          targetTitle: reportTargetVideo.title,
          reason: reportReason.trim(),
        },
        user
      );
      setReportTargetVideo(null);
      setReportReason('');
      showToast('Đã gửi báo cáo tới điều phối viên.');
    } catch (err: any) {
      showToast(err?.message || 'Gửi báo cáo thất bại');
    }
  };

  const handleToggleFollow = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const nextFollow = !v.isFollowing;
          showToast(nextFollow ? `Đã theo dõi ${v.channelName}` : 'Đã hủy theo dõi');
          return { ...v, isFollowing: nextFollow };
        }
        return v;
      })
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('Đã sao chép liên kết video!');
  };

  const toggleCaptionExpand = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCaptions((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const handleTimeUpdate = (videoId: string, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setVideoProgress((video.currentTime / video.duration) * 100);
      const sec = Math.floor(video.currentTime);
      const lastSent = lastProgressSentRef.current[videoId] || 0;
      if (sec >= 3 && Math.abs(sec - lastSent) >= 5) {
        lastProgressSentRef.current[videoId] = sec;
        apiService
          .recordVideoProgress(videoId, sec, Math.round(video.duration), user)
          .then(setWatchHistory)
          .catch(() => {});
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !activeCommentVideo) return;
    const text = commentInput.trim();
    setCommentInput('');
    try {
      const updated = await apiService.addVideoComment(activeCommentVideo.id, text, user);
      setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setActiveCommentVideo(updated);
    } catch (err: any) {
      showToast(err?.message || 'Không gửi được bình luận');
    }
  };

  // --- UPLOAD & EDIT HANDLERS ---
  const openCreateModal = () => {
    if (isGuest) {
      showToast('Vui lòng đăng nhập tài khoản thành viên để đăng video.');
      return;
    }
    setEditingVideo(null);
    setUploadMode('file');
    setFormTitle('');
    setFormDesc('');
    setFormCategory('thai_giao_nhac');
    setFormVideoUrl('');
    setFormPosterUrl('');
    setFormVideoFile(null);
    setFormPosterFile(null);
    setUploadError(null);
    setIsUploadOpen(true);
  };

  const openEditModal = (video: NovaVideoItem) => {
    setEditingVideo(video);
    setUploadMode('url');
    setFormTitle(video.title);
    setFormDesc(video.description);
    setFormCategory(video.category);
    setFormVideoUrl(video.videoUrl);
    setFormPosterUrl(video.poster || '');
    setFormVideoFile(null);
    setFormPosterFile(null);
    setUploadError(null);
    setIsManageOpen(false);
    setIsUploadOpen(true);
  };

  const handleSelectVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !ALLOWED_VIDEO_EXTS.includes(ext)) {
      setUploadError('Định dạng không hỗ trợ. Vui lòng chọn tệp MP4, WebM hoặc MOV.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setUploadError('Dung lượng video vượt quá 50MB. Vui lòng chọn tệp nhỏ hơn.');
      e.target.value = '';
      return;
    }
    setFormVideoFile(file);
  };

  const handleSelectPosterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh đại diện video không được vượt quá 5MB.');
      e.target.value = '';
      return;
    }
    setUploadError(null);
    setFormPosterFile(file);
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!formTitle.trim()) {
      setUploadError('Vui lòng nhập tiêu đề video.');
      return;
    }

    setIsSubmittingVideo(true);
    try {
      let finalVideoUrl = formVideoUrl.trim();
      let finalPosterUrl = formPosterUrl.trim();

      if (!editingVideo) {
        if (uploadMode === 'file') {
          if (!formVideoFile) {
            throw new Error('Vui lòng chọn tệp video để tải lên.');
          }
          const uploaded = await apiService.uploadVideoFile(formVideoFile, user);
          finalVideoUrl = uploaded.url;
        } else {
          if (!finalVideoUrl || (!finalVideoUrl.startsWith('/') && !/^https?:\/\//i.test(finalVideoUrl))) {
            throw new Error('Đường dẫn video phải bắt đầu bằng http://, https:// hoặc /');
          }
        }

        if (formPosterFile) {
          const uploadedPoster = await apiService.uploadPosterFile(formPosterFile, user);
          finalPosterUrl = uploadedPoster.url;
        }

        const created = await apiService.createVideo(
          {
            title: formTitle.trim(),
            description: formDesc.trim(),
            videoUrl: finalVideoUrl,
            poster: finalPosterUrl || undefined,
            category: formCategory,
          },
          user
        );

        await loadAllVideoData();
        setIsUploadOpen(false);
        showToast(
          created.status === 'approved'
            ? 'Đã đăng video thai giáo thành công!'
            : 'Đã gửi video! Đang chờ điều phối viên duyệt.'
        );
      } else {
        if (formPosterFile) {
          const uploadedPoster = await apiService.uploadPosterFile(formPosterFile, user);
          finalPosterUrl = uploadedPoster.url;
        }
        await apiService.updateVideo(
          editingVideo.id,
          {
            title: formTitle.trim(),
            description: formDesc.trim(),
            category: formCategory,
            poster: finalPosterUrl || editingVideo.poster,
          },
          user
        );
        await loadAllVideoData();
        setIsUploadOpen(false);
        showToast('Đã cập nhật thông tin video!');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Đăng video thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleModerate = async (
    videoId: string,
    status: 'approved' | 'rejected' | 'hidden',
    reason?: string
  ) => {
    try {
      await apiService.moderateVideo(videoId, status, reason, user);
      setRejectingVideoId(null);
      setRejectionReasonInput('');
      await loadAllVideoData();
      showToast(
        status === 'approved'
          ? 'Đã duyệt và hiển thị video!'
          : status === 'rejected'
          ? 'Đã từ chối video.'
          : 'Đã ẩn video khỏi bảng tin.'
      );
    } catch (err: any) {
      showToast(err?.message || 'Thao tác kiểm duyệt thất bại.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await apiService.deleteVideo(videoId, user);
      await loadAllVideoData();
      showToast('Đã xóa video.');
    } catch (err: any) {
      showToast(err?.message || 'Không thể xóa video.');
    }
  };

  const handleToggleNotifPref = async () => {
    const nextVal = !videoNotifEnabled;
    setVideoNotifEnabled(nextVal);
    try {
      await apiService.updateNotificationPrefs({ videoEnabled: nextVal }, user);
      showToast(nextVal ? 'Đã bật thông báo video mới' : 'Đã tắt thông báo video');
    } catch {}
  };

  const handleClickVideoNotif = async (n: AppNotification) => {
    try {
      const updated = await apiService.markNotificationRead(n.id, user);
      setVideoNotifs(updated);
    } catch {}
    setIsNotifOpen(false);
    if (n.targetId) {
      setSelectedCategory('all');
      const idx = videos.findIndex((v) => v.id === n.targetId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setTimeout(() => scrollToVideo(idx), 100);
      } else {
        setIsManageOpen(true);
      }
    }
  };

  const handleMarkAllVideoNotifsRead = async () => {
    try {
      const updated = await apiService.markAllNotificationsRead('video', user);
      setVideoNotifs(updated);
    } catch {}
  };

  const unreadVideoCount = videoNotifs.filter((n) => !n.isRead).length;
  const pendingCount = moderationVideos.filter((v) => v.status === 'pending').length;

  const getStatusBadge = (status: NovaVideoItem['status']) => {
    if (status === 'approved')
      return <span className="text-[10.5px] font-semibold text-nova-success">Đã duyệt</span>;
    if (status === 'pending')
      return <span className="text-[10.5px] font-semibold text-nova-warning">Chờ duyệt</span>;
    if (status === 'rejected')
      return <span className="text-[10.5px] font-semibold text-nova-danger">Từ chối</span>;
    return <span className="text-[10.5px] font-semibold text-nova-text-muted">Đang ẩn</span>;
  };

  return (
    <div className="relative flex-1 w-full h-full bg-[#1C1B18] select-none overflow-hidden text-[#F0EBE0]">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#25231F]/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-[#F0EBE0] shadow-xl border border-[#3D3932] flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B2B6A3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 z-30 pt-2.5 pb-2 px-3 bg-gradient-to-b from-[#1C1B18]/90 via-[#1C1B18]/55 to-transparent pointer-events-none">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-editorial text-[16px] font-semibold tracking-wide text-[#FAF9F6] drop-shadow-md truncate">
              Video thai giáo
            </span>
            <span className="text-[11px] font-medium text-[#F0EBE0]/75 tabular-nums whitespace-nowrap">
              {filteredVideos.length > 0 ? `${currentIndex + 1}/${filteredVideos.length}` : '0/0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowSearchBar((v) => !v)}
              className="w-9 h-9 rounded-xl bg-[#25231F]/80 backdrop-blur-md border border-[#3D3932] flex items-center justify-center text-[#F0EBE0] cursor-pointer hover:bg-[#2E2B26]"
              title="Tìm video"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLibraryOpen(true)}
              className="px-2.5 py-2 rounded-xl bg-[#25231F]/80 backdrop-blur-md border border-[#3D3932] text-[#F0EBE0] text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#2E2B26] whitespace-nowrap"
              title="Danh sách yêu thích, lịch sử xem và danh sách phát"
            >
              <ListMusic className="w-3.5 h-3.5 text-[#CDBFA9]" />
              <span className="hidden sm:inline">Thư viện</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-2.5 py-2 rounded-xl bg-[#CDBFA9] hover:bg-[#DFD3BF] text-[#1C1B18] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-md whitespace-nowrap"
              title="Đăng video thai giáo mới"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Đăng video</span>
            </button>

            <button
              onClick={() => {
                setManageTab(canModerate && pendingCount > 0 ? 'moderation' : 'mine');
                setIsManageOpen(true);
              }}
              className="relative px-2.5 py-2 rounded-xl bg-[#25231F]/80 backdrop-blur-md border border-[#3D3932] text-[#F0EBE0] text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#2E2B26] whitespace-nowrap"
              title={canModerate ? 'Quản lý và kiểm duyệt video' : 'Video của tôi'}
            >
              {canModerate ? <Shield className="w-3.5 h-3.5 text-[#CDBFA9]" /> : <FileVideo className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{canModerate ? 'Duyệt' : 'Của tôi'}</span>
              {canModerate && pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#CDBFA9] text-[#1C1B18] text-[9px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-[#25231F]/80 backdrop-blur-md border border-[#3D3932] flex items-center justify-center text-[#F0EBE0] cursor-pointer hover:bg-[#2E2B26]"
              title="Thông báo video"
            >
              <Bell className="w-4 h-4" />
              {unreadVideoCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CDBFA9] text-[#1C1B18] text-[9px] font-bold flex items-center justify-center">
                  {unreadVideoCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center cursor-pointer ${
                isMuted
                  ? 'bg-[#25231F]/80 border-[#3D3932] text-[#F0EBE0]/90'
                  : 'bg-[#CDBFA9] border-[#CDBFA9] text-[#1C1B18]'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showSearchBar && (
          <div className="mt-2 pointer-events-auto flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="Tìm tiêu đề video, từ khóa (#thaigiao, #yoga)..."
              className="flex-1 px-3 py-2 rounded-xl bg-[#25231F]/90 border border-[#3D3932] text-xs text-[#F0EBE0] placeholder:text-[#A39D93] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-2 rounded-xl bg-[#2E2B26] text-xs font-semibold text-[#F0EBE0] cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        )}

        {/* Video Category + Week Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-2 pointer-events-auto">
          <button
            onClick={() => setWeekFilter((f) => (f === 'my_week' ? 'all' : 'my_week'))}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              weekFilter === 'my_week'
                ? 'bg-[#CDBFA9] text-[#1C1B18]'
                : 'bg-[#25231F]/80 text-[#F0EBE0]/90 border border-[#3D3932]'
            }`}
          >
            Tuần {user?.pregnancyWeek || 24}
          </button>

          <button
            onClick={() => setWeekFilter((f) => (f === 'favorites' ? 'all' : 'favorites'))}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              weekFilter === 'favorites'
                ? 'bg-[#B2B6A3] text-[#1C1B18]'
                : 'bg-[#25231F]/80 text-[#F0EBE0]/90 border border-[#3D3932]'
            }`}
          >
            Đã lưu ({favoriteVideoIds.length})
          </button>

          {VIDEO_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#FAF9F6] text-[#373630]'
                    : 'bg-[#25231F]/75 text-[#F0EBE0]/85 border border-[#3D3932] hover:bg-[#2E2B26]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <div className="ml-auto hidden sm:flex items-center gap-1 bg-[#25231F]/80 px-1 py-0.5 rounded-lg border border-[#3D3932]">
            <button
              onClick={() => scrollToVideo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="w-6 h-6 flex items-center justify-center text-[#F0EBE0] disabled:opacity-30 cursor-pointer"
              title="Video trước"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollToVideo(Math.min(filteredVideos.length - 1, currentIndex + 1))}
              disabled={currentIndex >= filteredVideos.length - 1}
              className="w-6 h-6 flex items-center justify-center text-[#F0EBE0] disabled:opacity-30 cursor-pointer"
              title="Video tiếp theo"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      {filteredVideos.length === 0 ? (
        <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center bg-[#1C1B18]">
          <FileVideo className="w-12 h-12 text-[#A39D93] mb-3" />
          <h3 className="font-editorial text-lg font-semibold text-[#F0EBE0]">
            {isLoadingFeed ? 'Đang tải video thai giáo...' : 'Không có video phù hợp bộ lọc'}
          </h3>
          <p className="text-xs text-[#A39D93] mt-1 max-w-[260px]">
            Mẹ có thể đặt lại bộ lọc hoặc nhấn nút "Đăng video" để chia sẻ cùng cộng đồng.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setWeekFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2.5 bg-[#CDBFA9] text-[#1C1B18] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Xem tất cả video
          </button>
        </div>
      ) : (
        <main
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {filteredVideos.map((video, index) => {
            const isActive = index === currentIndex;
            const isExpanded = expandedCaptions[video.id] || false;
            const hasError = Boolean(videoErrors[video.id]);
            const isFav = favoriteVideoIds.includes(video.id);
            const watchInfo = watchHistory.find((w) => w.videoId === video.id);

            return (
              <section
                key={video.id}
                onClick={togglePlayPause}
                onDoubleClick={(e) => handleDoubleTap(e, video.id)}
                className="relative h-full w-full snap-start shrink-0 flex items-center justify-center bg-[#1C1B18] overflow-hidden"
                style={{ height: '100%' }}
              >
                {video.poster && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: `url(${video.poster})` }}
                  />
                )}

                {!hasError ? (
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
                    preload="metadata"
                    onCanPlay={(e) => {
                      if (isActive && isPlaying) {
                        e.currentTarget.play().catch(() => {
                          e.currentTarget.muted = true;
                          setIsMuted(true);
                          e.currentTarget.play().catch(() => {});
                        });
                      }
                    }}
                    onError={() => {
                      setVideoErrors((prev) => ({ ...prev, [video.id]: true }));
                    }}
                    onTimeUpdate={isActive ? (e) => handleTimeUpdate(video.id, e) : undefined}
                    className="relative z-10 w-full h-full max-w-[560px] object-cover pointer-events-none"
                  />
                ) : (
                  <div className="relative z-20 p-6 rounded-2xl bg-[#25231F]/95 border border-[#3D3932] text-center max-w-[300px] interactive-control">
                    <AlertTriangle className="w-8 h-8 text-[#D4B47C] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#F0EBE0]">Không thể phát video này</p>
                    <p className="text-[11px] text-[#A39D93] mt-1">
                      Tệp video bị lỗi hoặc kết nối mạng gián đoạn.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoErrors((prev) => ({ ...prev, [video.id]: false }));
                      }}
                      className="mt-3 px-3.5 py-2 bg-[#CDBFA9] text-[#1C1B18] rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Thử lại</span>
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#1C1B18]/35 via-transparent to-[#1C1B18]/92 pointer-events-none" />

                {!isPlaying && isActive && !hasError && (
                  <div className="absolute z-20 w-16 h-16 rounded-full bg-[#25231F]/80 backdrop-blur-md border border-[#3D3932] flex items-center justify-center text-[#FAF9F6] pointer-events-none shadow-2xl">
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </div>
                )}

                {floatingHearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ scale: 0.4, opacity: 1, y: 0 }}
                    animate={{ scale: [0.8, 1.4, 1.2], opacity: [1, 1, 0], y: -90 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute pointer-events-none z-30 text-[#CDBFA9]"
                    style={{ left: heart.x - 20, top: heart.y - 20 }}
                  >
                    <Heart className="w-10 h-10 fill-[#CDBFA9]" />
                  </motion.div>
                ))}

                {/* Right Action Bar */}
                <aside className="absolute right-3 bottom-4 z-20 flex flex-col items-center gap-3 interactive-control">
                  <div className="relative mb-0.5">
                    <div className="w-10 h-10 rounded-full border-2 border-[#FAF9F6] overflow-hidden bg-[#2E2B26] flex items-center justify-center text-xs font-bold text-[#F0EBE0] shadow-md">
                      {video.channelAvatar}
                    </div>
                    <button
                      onClick={(e) => handleToggleFollow(video.id, e)}
                      className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-xs cursor-pointer ${
                        video.isFollowing ? 'bg-[#B2B6A3] text-[#1C1B18]' : 'bg-[#CDBFA9] text-[#1C1B18]'
                      }`}
                    >
                      {video.isFollowing ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={(e) => handleToggleLike(video.id, e)}
                      className="w-10 h-10 flex items-center justify-center cursor-pointer"
                    >
                      <Heart
                        className={`w-6 h-6 drop-shadow-md ${
                          video.isLiked ? 'fill-[#D48A80] text-[#D48A80]' : 'text-[#FAF9F6] stroke-[2]'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-semibold tabular-nums">{video.likes.toLocaleString('vi-VN')}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={(e) => handleToggleFavorite(video.id, e)}
                      className="w-10 h-10 flex items-center justify-center cursor-pointer"
                      title="Lưu video yêu thích"
                    >
                      <Bookmark
                        className={`w-5.5 h-5.5 drop-shadow-md ${
                          isFav ? 'fill-[#CDBFA9] text-[#CDBFA9]' : 'text-[#FAF9F6] stroke-[2]'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-semibold">{isFav ? 'Đã lưu' : 'Lưu'}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentVideo(video);
                      }}
                      className="w-10 h-10 flex items-center justify-center cursor-pointer"
                    >
                      <MessageCircle className="w-6 h-6 drop-shadow-md stroke-[2]" />
                    </button>
                    <span className="text-[10px] font-semibold tabular-nums">{video.commentsCount}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailVideo(video);
                    }}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer"
                    title="Chi tiết và video liên quan"
                  >
                    <Info className="w-5 h-5 drop-shadow-md" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportTargetVideo(video);
                    }}
                    className="w-9 h-9 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100"
                    title="Báo cáo video"
                  >
                    <Flag className="w-4.5 h-4.5 drop-shadow-md" />
                  </button>

                  <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center cursor-pointer">
                    <Share2 className="w-4.5 h-4.5 drop-shadow-md stroke-[2]" />
                  </button>
                </aside>

                {/* Bottom Caption */}
                <div className="absolute left-0 right-16 bottom-3 z-20 flex flex-col px-4 pb-1 pointer-events-none max-w-[600px]">
                  <div className="flex items-center gap-2 mb-1 pointer-events-auto interactive-control flex-wrap">
                    <h3 className="text-[14px] font-semibold text-[#FAF9F6] drop-shadow-md">{video.channelName}</h3>
                    {video.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#B2B6A3]" />}
                    <span className="text-[10.5px] font-medium text-[#F0EBE0]/80">
                      · {VIDEO_CATEGORIES.find((c) => c.id === video.category)?.label}
                    </span>
                    {watchInfo && watchInfo.progressSec > 3 && (
                      <span className="text-[10.5px] font-semibold text-[#CDBFA9] tabular-nums">
                        · Tiếp {watchInfo.progressSec} giây
                      </span>
                    )}
                  </div>

                  <h4 className="font-editorial text-[15px] font-semibold text-[#FAF9F6] leading-snug drop-shadow-md mb-1 pointer-events-auto interactive-control">
                    {video.title}
                  </h4>

                  <div className="pointer-events-auto interactive-control mb-1">
                    <p
                      className={`text-[11.5px] text-[#F0EBE0]/90 leading-relaxed drop-shadow-md ${
                        isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                      }`}
                    >
                      {video.description}
                    </p>
                    <button
                      onClick={(e) => toggleCaptionExpand(video.id, e)}
                      className="text-[10.5px] font-semibold text-[#F0EBE0]/75 hover:text-[#FAF9F6] flex items-center gap-0.5 mt-0.5 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#F0EBE0]/80 text-[10.5px] drop-shadow-md">
                    <Music className="w-3 h-3 shrink-0" />
                    <span className="truncate">{video.musicTitle}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute left-0 right-0 bottom-0 h-1 bg-[#FAF9F6]/20 z-30">
                  <div
                    className="h-full bg-[#CDBFA9] transition-all duration-150"
                    style={{ width: `${isActive ? videoProgress : 0}%` }}
                  />
                </div>
              </section>
            );
          })}
        </main>
      )}

      {/* Video Library Modal (Favorites, Watch History, Playlists) */}
      <AnimatePresence>
        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-[500px] max-h-[85vh] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col overflow-hidden border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-3">
                <h3 className="font-editorial text-lg font-semibold">Thư viện video của mẹ</h3>
                <button
                  onClick={() => setIsLibraryOpen(false)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1.5 p-1 bg-nova-bg-subtle rounded-xl mb-3">
                {[
                  { id: 'favorites', label: `Yêu thích (${favoriteVideoIds.length})` },
                  { id: 'history', label: `Lịch sử (${watchHistory.length})` },
                  { id: 'playlists', label: `Danh sách phát (${playlists.length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLibraryTab(t.id as any)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                      libraryTab === t.id ? 'bg-nova-surface text-nova-text' : 'text-nova-text-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
                {libraryTab === 'favorites' && (
                  <>
                    {favoriteVideoIds.length === 0 ? (
                      <p className="py-10 text-center text-xs text-nova-text-muted">Chưa có video nào được lưu yêu thích.</p>
                    ) : (
                      videos
                        .filter((v) => favoriteVideoIds.includes(v.id))
                        .map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setIsLibraryOpen(false);
                              const idx = filteredVideos.findIndex((x) => x.id === v.id);
                              if (idx !== -1) {
                                setCurrentIndex(idx);
                                setTimeout(() => scrollToVideo(idx), 100);
                              }
                            }}
                            className="w-full p-3 rounded-2xl bg-nova-surface border border-nova-border text-left flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{v.title}</p>
                              <p className="text-[11px] text-nova-text-muted mt-0.5">{v.channelName}</p>
                            </div>
                            <Play className="w-4 h-4 text-nova-accent shrink-0" />
                          </button>
                        ))
                    )}
                  </>
                )}

                {libraryTab === 'history' && (
                  <>
                    {watchHistory.length === 0 ? (
                      <p className="py-10 text-center text-xs text-nova-text-muted">Chưa có lịch sử xem video.</p>
                    ) : (
                      watchHistory.map((h) => {
                        const v = videos.find((x) => x.id === h.videoId);
                        if (!v) return null;
                        return (
                          <button
                            key={h.videoId}
                            onClick={() => {
                              setIsLibraryOpen(false);
                              const idx = filteredVideos.findIndex((x) => x.id === v.id);
                              if (idx !== -1) {
                                setCurrentIndex(idx);
                                setTimeout(() => scrollToVideo(idx), 100);
                              }
                            }}
                            className="w-full p-3 rounded-2xl bg-nova-surface border border-nova-border text-left flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{v.title}</p>
                              <p className="text-[11px] text-nova-text-muted flex items-center gap-1 mt-0.5 tabular-nums">
                                <History className="w-3 h-3" /> Đã xem đến {h.progressSec} giây / {h.durationSec} giây
                              </p>
                            </div>
                            <Play className="w-4 h-4 text-nova-accent shrink-0" />
                          </button>
                        );
                      })
                    )}
                  </>
                )}

                {libraryTab === 'playlists' && (
                  <div className="space-y-3">
                    <form onSubmit={handleCreatePlaylist} className="flex gap-2">
                      <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Tên danh sách phát mới (Ví dụ: Nhạc ngủ tối)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-nova-surface border border-nova-border text-xs text-nova-text"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-semibold cursor-pointer"
                      >
                        Tạo
                      </button>
                    </form>

                    {playlists.map((pl) => {
                      const activeVid = filteredVideos[currentIndex];
                      const hasCurrent = activeVid ? pl.videoIds.includes(activeVid.id) : false;
                      return (
                        <div key={pl.id} className="p-3 rounded-2xl bg-nova-surface border border-nova-border space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-semibold">{pl.name}</h4>
                              <p className="text-[11px] text-nova-text-muted">{pl.videoIds.length} video</p>
                            </div>
                            {activeVid && (
                              <button
                                onClick={() => handleToggleInPlaylist(pl.id, activeVid.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                  hasCurrent ? 'bg-nova-sage-soft text-nova-sage-text' : 'bg-nova-accent-soft text-nova-accent'
                                }`}
                              >
                                {hasCurrent ? 'Đã thêm video đang xem' : '+ Thêm video đang xem'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Detail & Related Videos Modal */}
      <AnimatePresence>
        {detailVideo && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-[480px] max-h-[85vh] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col overflow-hidden border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-3">
                <h3 className="font-editorial text-lg font-semibold">Chi tiết video và gợi ý liên quan</h3>
                <button
                  onClick={() => setDetailVideo(null)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                <h4 className="font-editorial text-base font-semibold">{detailVideo.title}</h4>
                <p className="text-xs text-nova-text-muted leading-relaxed">{detailVideo.description}</p>
                <div className="flex flex-wrap gap-2 text-[11px] font-medium text-nova-accent">
                  {detailVideo.hashtags.map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
                <div className="pt-3 border-t border-nova-border">
                  <p className="text-xs font-semibold text-nova-text-muted uppercase mb-2">Video cùng chủ đề</p>
                  <div className="space-y-2">
                    {videos
                      .filter((v) => v.id !== detailVideo.id && v.category === detailVideo.category)
                      .slice(0, 4)
                      .map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => {
                            setDetailVideo(null);
                            const idx = filteredVideos.findIndex((x) => x.id === rel.id);
                            if (idx !== -1) {
                              setCurrentIndex(idx);
                              setTimeout(() => scrollToVideo(idx), 100);
                            }
                          }}
                          className="w-full p-3 rounded-2xl bg-nova-surface border border-nova-border text-left flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold truncate">{rel.title}</p>
                            <p className="text-[11px] text-nova-text-muted">{rel.channelName}</p>
                          </div>
                          <Play className="w-4 h-4 text-nova-accent shrink-0" />
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Video Modal */}
      <AnimatePresence>
        {reportTargetVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <form
              onSubmit={handleSubmitReport}
              className="w-full max-w-sm bg-nova-surface text-nova-text rounded-3xl p-5 shadow-2xl border border-nova-border space-y-3"
            >
              <h3 className="font-editorial text-base font-semibold">Báo cáo nội dung video</h3>
              <p className="text-xs text-nova-text-muted">{reportTargetVideo.title}</p>
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Mô tả lý do báo cáo (thông tin sai lệch, nội dung không phù hợp...)..."
                className="w-full p-3 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReportTargetVideo(null)}
                  className="px-3 py-2 text-xs font-semibold text-nova-text-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-nova-accent text-nova-accent-contrast text-xs font-semibold cursor-pointer"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* Comments Drawer */}
      <AnimatePresence>
        {activeCommentVideo && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center select-none">
            <div onClick={() => setActiveCommentVideo(null)} className="absolute inset-0 bg-[#1C1B18]/65" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-[460px] max-h-[80%] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col z-10 border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border">
                <h3 className="font-editorial text-base font-semibold">{activeCommentVideo.commentsCount} bình luận</h3>
                <button
                  onClick={() => setActiveCommentVideo(null)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar max-h-[300px]">
                {activeCommentVideo.comments.length === 0 ? (
                  <p className="py-8 text-center text-nova-text-muted text-xs">Chưa có bình luận nào.</p>
                ) : (
                  activeCommentVideo.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-nova-accent text-nova-accent-contrast font-semibold text-xs flex items-center justify-center shrink-0">
                        {c.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-nova-text">{c.author}</span>
                          <span className="text-[10px] text-nova-text-muted">{c.timeAgo}</span>
                        </div>
                        <p className="text-xs text-nova-text-muted mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-nova-border flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Thêm bình luận..."
                  className="flex-1 px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  className="w-10 h-10 rounded-xl bg-nova-accent disabled:opacity-40 text-nova-accent-contrast flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload / Edit Video Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-[480px] max-h-[90vh] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col overflow-y-auto no-scrollbar border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-4">
                <h3 className="font-editorial text-lg font-semibold">
                  {editingVideo ? 'Chỉnh sửa video thai giáo' : 'Đăng video thai giáo mới'}
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-3 p-3 rounded-xl bg-nova-danger-soft border border-nova-danger-border text-xs text-nova-danger font-semibold">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleSubmitVideo} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tiêu đề video *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Nhạc giao hưởng thai giáo buổi tối cho bé"
                    className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none focus:ring-2 focus:ring-nova-accent/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Danh mục nội dung *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs font-semibold text-nova-text focus:outline-none"
                  >
                    {VIDEO_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Mô tả nội dung</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Chia sẻ lợi ích thai kỳ hoặc hướng dẫn thực hành..."
                    className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none resize-none"
                  />
                </div>

                {!editingVideo && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Nguồn video *</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                          uploadMode === 'file'
                            ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                            : 'bg-nova-surface text-nova-text-muted border-nova-border'
                        }`}
                      >
                        Tải tệp từ máy (MP4/WebM/MOV)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                          uploadMode === 'url'
                            ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                            : 'bg-nova-surface text-nova-text-muted border-nova-border'
                        }`}
                      >
                        Nhập đường dẫn URL
                      </button>
                    </div>

                    {uploadMode === 'file' ? (
                      <div className="p-3 bg-nova-surface border border-dashed border-nova-taupe rounded-xl">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleSelectVideoFile}
                          className="text-xs w-full"
                        />
                        <p className="text-[10.5px] text-nova-text-muted mt-1">
                          Định dạng: MP4, WebM, MOV · Tối đa 50MB.
                          {formVideoFile && ` Đã chọn: ${formVideoFile.name} (${(formVideoFile.size / (1024 * 1024)).toFixed(1)}MB)`}
                        </p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder="https://... hoặc /videos/music.mp4"
                        className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">Ảnh đại diện video (tùy chọn)</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleSelectPosterFile}
                      className="text-xs w-full"
                    />
                    <input
                      type="text"
                      value={formPosterUrl}
                      onChange={(e) => setFormPosterUrl(e.target.value)}
                      placeholder="Hoặc dán đường dẫn ảnh bìa (tối đa 5MB nếu tải tệp)"
                      className="w-full px-3.5 py-2 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-nova-border text-xs font-semibold text-nova-text-muted cursor-pointer min-h-[44px]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingVideo}
                    className="flex-1 py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover disabled:opacity-50 text-nova-accent-contrast text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    {isSubmittingVideo
                      ? 'Đang xử lý...'
                      : editingVideo
                      ? 'Lưu thay đổi'
                      : canModerate
                      ? 'Đăng và xuất bản ngay'
                      : 'Gửi video chờ duyệt'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage & Moderation Modal */}
      <AnimatePresence>
        {isManageOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-[520px] max-h-[88vh] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col overflow-hidden border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-3 shrink-0">
                <h3 className="font-editorial text-lg font-semibold">
                  {canModerate ? 'Quản lý và kiểm duyệt video' : 'Video bạn đã đăng'}
                </h3>
                <button
                  onClick={() => setIsManageOpen(false)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {canModerate && (
                <div className="flex gap-1.5 p-1 bg-nova-bg-subtle rounded-xl mb-3 shrink-0">
                  <button
                    onClick={() => setManageTab('mine')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                      manageTab === 'mine' ? 'bg-nova-surface text-nova-text' : 'text-nova-text-muted'
                    }`}
                  >
                    Video của tôi ({myVideos.length})
                  </button>
                  <button
                    onClick={() => setManageTab('moderation')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                      manageTab === 'moderation' ? 'bg-nova-surface text-nova-text' : 'text-nova-text-muted'
                    }`}
                  >
                    Kiểm duyệt ({pendingCount} chờ duyệt)
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
                {(manageTab === 'moderation' && canModerate ? moderationVideos : myVideos).length === 0 ? (
                  <div className="py-10 text-center text-xs text-nova-text-muted">
                    Chưa có video nào trong danh sách này.
                  </div>
                ) : (
                  (manageTab === 'moderation' && canModerate ? moderationVideos : myVideos).map((vid) => (
                    <div
                      key={vid.id}
                      className="p-3.5 bg-nova-surface rounded-2xl border border-nova-border space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {getStatusBadge(vid.status)}
                            <span className="text-[10.5px] text-nova-text-muted">
                              · {vid.channelName} · {VIDEO_CATEGORIES.find((c) => c.id === vid.category)?.label}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-nova-text">{vid.title}</h4>
                          {vid.status === 'rejected' && vid.rejectionReason && (
                            <p className="text-[11px] text-nova-danger mt-1">
                              Lý do từ chối: {vid.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-nova-border">
                        {(vid.authorId === user?.id || canModerate) && (
                          <>
                            <button
                              onClick={() => openEditModal(vid)}
                              className="px-2.5 py-1.5 rounded-lg bg-nova-bg-subtle text-nova-text text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer hover:bg-nova-accent-soft"
                            >
                              <Edit3 className="w-3 h-3" /> Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(vid.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-nova-danger-soft text-nova-danger text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Xóa
                            </button>
                          </>
                        )}

                        {canModerate && (
                          <>
                            {vid.status !== 'approved' && (
                              <button
                                onClick={() => handleModerate(vid.id, 'approved')}
                                className="px-2.5 py-1.5 rounded-lg bg-nova-success-soft text-nova-success text-[11px] font-semibold cursor-pointer"
                              >
                                Duyệt
                              </button>
                            )}
                            {vid.status !== 'hidden' && (
                              <button
                                onClick={() => handleModerate(vid.id, 'hidden')}
                                className="px-2.5 py-1.5 rounded-lg bg-nova-bg-subtle text-nova-text-muted text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <EyeOff className="w-3 h-3" /> Ẩn
                              </button>
                            )}
                            {vid.status !== 'rejected' && (
                              <button
                                onClick={() => setRejectingVideoId(vid.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-nova-warning-soft text-nova-warning text-[11px] font-semibold cursor-pointer"
                              >
                                Từ chối
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {canModerate && rejectingVideoId === vid.id && (
                        <div className="pt-2 flex gap-2">
                          <input
                            type="text"
                            value={rejectionReasonInput}
                            onChange={(e) => setRejectionReasonInput(e.target.value)}
                            placeholder="Nhập lý do từ chối video..."
                            className="flex-1 px-2.5 py-1.5 bg-nova-bg border border-nova-border rounded-lg text-xs text-nova-text"
                          />
                          <button
                            onClick={() => handleModerate(vid.id, 'rejected', rejectionReasonInput)}
                            className="px-3 py-1.5 bg-nova-accent text-nova-accent-contrast rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Xác nhận
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Notifications Drawer */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-[#1C1B18]/65 backdrop-blur-xs">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-[460px] max-h-[85vh] bg-nova-bg text-nova-text rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col overflow-hidden border border-nova-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-nova-accent" />
                  <h3 className="font-editorial text-lg font-semibold">Thông báo video</h3>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-nova-surface rounded-2xl border border-nova-border flex items-center justify-between mb-3 shrink-0">
                <div>
                  <p className="text-xs font-semibold">Nhận thông báo video thai giáo</p>
                  <p className="text-[10.5px] text-nova-text-muted">Báo khi có video mới hoặc trạng thái duyệt video</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifPref}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    videoNotifEnabled ? 'bg-nova-sage' : 'bg-nova-border'
                  }`}
                >
                  <motion.div
                    animate={{ x: videoNotifEnabled ? 20 : 0 }}
                    className="w-5 h-5 rounded-full bg-nova-surface shadow-xs"
                  />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {videoNotifs.length === 0 ? (
                  <p className="py-10 text-center text-xs text-nova-text-muted">Chưa có thông báo video nào.</p>
                ) : (
                  videoNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleClickVideoNotif(n)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-nova-surface border-nova-border'
                          : 'bg-nova-accent-soft border-nova-taupe/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-semibold ${n.isRead ? 'text-nova-text' : 'text-nova-accent'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-nova-text-muted shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-nova-text-muted mt-1">{n.description}</p>
                    </div>
                  ))
                )}
              </div>

              {unreadVideoCount > 0 && (
                <button
                  onClick={handleMarkAllVideoNotifsRead}
                  className="mt-3 w-full py-2.5 bg-nova-bg-subtle hover:bg-nova-accent-soft rounded-xl text-xs font-semibold text-nova-text flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-nova-sage-text" />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
