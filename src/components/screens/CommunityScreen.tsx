import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hospitalBagImg from '../../assets/images/hospital_bag_1790926782533.jpg';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search,
  PlusCircle,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface PostComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
}

export interface DetailedPost {
  id: string;
  author: string;
  avatar: string;
  isVerified?: boolean;
  category: 'all' | 'experience' | 'nutrition' | 'birth_prep' | 'confession';
  weekTag: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  isLiked?: boolean;
  comments: PostComment[];
}

export const INITIAL_DETAILED_POSTS: DetailedPost[] = [
  {
    id: 'post-1',
    author: 'Mẹ Nguyễn Lan',
    avatar: 'NL',
    category: 'birth_prep',
    weekTag: 'Tuần 32',
    title: 'Review chi tiết danh sách đồ đi sinh gọn nhẹ cho mẹ bầu tuần 32',
    content:
      'Sau bao ngày nghiên cứu kinh nghiệm từ các mom đi trước, mình đã gói gọn đồ đi sinh vào một giỏ duy nhất: 3 bộ quần áo cài cúc cho mẹ, 5 bộ cotton mềm cho con, tã dán sơ sinh, khăn xô và tinh dầu tràm. Các mẹ đừng mang quá nhiều đồ cồng kềnh nha!',
    image: hospitalBagImg,
    likes: 345,
    commentsCount: 82,
    timeAgo: '2 giờ trước',
    isLiked: false,
    comments: [
      {
        id: 'c-1',
        author: 'Mẹ Thùy Chi',
        avatar: 'TC',
        content: 'Bài viết hữu ích quá mom ơi, mình lưu lại để tuần sau sắm dần!',
        timeAgo: '1 giờ trước',
      },
      {
        id: 'c-2',
        author: 'Mẹ Hương Trà',
        avatar: 'HT',
        content: 'Nhớ mang theo vài chiếc thìa nhỏ và cốc pha sữa ấm nữa mom nhé.',
        timeAgo: '30 phút trước',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Bác sĩ Thu Hà',
    avatar: 'TH',
    isVerified: true,
    category: 'nutrition',
    weekTag: 'Chuyên gia Sản khoa',
    title: '5 Thực phẩm vàng giúp con vào cân, mẹ không tăng cân ở 3 tháng giữa',
    content:
      'Giai đoạn tam cá nguyệt 2 là lúc thai nhi tăng tốc phát triển khung xương và cơ bắp. Để dinh dưỡng tập trung vào con mà mẹ không lo tiểu đường thai kỳ: 1. Trứng gà luộc, 2. Bột yến mạch & hạt chia, 3. Khoai lang luộc bữa phụ, 4. Ức gà & cá hồi, 5. Sữa hạt không đường.',
    likes: 890,
    commentsCount: 142,
    timeAgo: '4 giờ trước',
    isLiked: true,
    comments: [
      {
        id: 'c-3',
        author: 'Khánh Băng (Tôi)',
        avatar: 'KB',
        content: 'Cảm ơn bác sĩ! Em tuần 12 bắt đầu áp dụng thực đơn này được không ạ?',
        timeAgo: '3 giờ trước',
      },
      {
        id: 'c-4',
        author: 'Bác sĩ Thu Hà',
        avatar: 'TH',
        content: '@Khánh Băng Hoàn toàn được nhé mẹ! Hãy ăn đa dạng và uống đủ nước lọc.',
        timeAgo: '2 giờ trước',
      },
    ],
  },
  {
    id: 'post-3',
    author: 'Mẹ Bích Ngọc',
    avatar: 'BN',
    category: 'experience',
    weekTag: 'Tuần 12',
    title: 'Tự nhiên hết nghén từ tuần 12 có sao không các mẹ ơi?',
    content:
      'Mấy tuần trước mình nghén không ăn uống được gì, sút mất 2kg. Tự dưng 2 hôm nay thấy người khỏe re, thèm ăn trở lại mà tự nhiên lại lo lo. Có mẹ nào cũng hết nghén đột ngột như mình không?',
    likes: 45,
    commentsCount: 23,
    timeAgo: '5 giờ trước',
    isLiked: false,
    comments: [
      {
        id: 'c-5',
        author: 'Mẹ Phương Vy',
        avatar: 'PV',
        content: 'Bình thường lắm mom ơi! Tuần 12 nhau thai làm việc hoàn chỉnh nên bớt nghén đấy, chúc mừng mom nha!',
        timeAgo: '4 giờ trước',
      },
    ],
  },
  {
    id: 'post-4',
    author: 'Mẹ Hoàng Anh',
    avatar: 'HA',
    category: 'confession',
    weekTag: 'Thanh lý mẹ bé',
    title: 'Góc thanh lý gối ôm chữ U và máy hút sữa mới 99%',
    content:
      'Mình sinh xong bé trộm vía bú mẹ trực tiếp nên pass lại máy hút sữa Spectra và 1 gối ôm chữ U Nova chất vải cotton kháng khuẩn cho mẹ nào cần nhé, giá hạt dẻ giao lưu thôi ạ.',
    likes: 112,
    commentsCount: 31,
    timeAgo: '7 giờ trước',
    isLiked: false,
    comments: [],
  },
  {
    id: 'post-5',
    author: 'Mẹ Minh Thư',
    avatar: 'MT',
    category: 'experience',
    weekTag: 'Tuần 12',
    title: 'Nhật ký siêu âm tuần 12: Con đã vẫy tay chào ba mẹ!',
    content:
      'Hôm nay đi đo độ mờ da gáy, nhìn màn hình siêu âm thấy em bé nghịch ngợm cử động hai tay hai chân mà ba mẹ rớt nước mắt vì hạnh phúc. Độ mờ da gáy 1.2mm đạt chuẩn an toàn rồi các mom ơi!',
    likes: 215,
    commentsCount: 54,
    timeAgo: '1 ngày trước',
    isLiked: true,
    comments: [],
  },
];

export const CommunityScreen: React.FC = () => {
  const [posts, setPosts] = useState<DetailedPost[]>(INITIAL_DETAILED_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Comment Modal state
  const [activeCommentPost, setActiveCommentPost] = useState<DetailedPost | null>(null);
  const [commentText, setCommentText] = useState('');

  // New Post Modal state
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [poppingHeartId, setPoppingHeartId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'experience', label: 'Kinh nghiệm mang thai' },
    { id: 'nutrition', label: 'Dinh dưỡng' },
    { id: 'birth_prep', label: 'Sắm đồ đi sinh' },
    { id: 'confession', label: 'Góc tâm sự' },
  ];

  // Toggle Heart
  const handleToggleLike = (postId: string) => {
    setPoppingHeartId(postId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          if (isLiked) {
            try {
              confetti({
                particleCount: 20,
                spread: 40,
                origin: { y: 0.6 },
                colors: ['#C84B4B', '#FCEEEB', '#FF6B6B'],
                disableForReducedMotion: true,
              });
            } catch {
              // ignore
            }
          }
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
    setTimeout(() => {
      setPoppingHeartId(null);
    }, 400);
  };

  // Add Comment
  const handleAddComment = () => {
    if (!commentText.trim() || !activeCommentPost) return;

    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      author: 'Khánh Băng (Tôi)',
      avatar: 'KB',
      content: commentText.trim(),
      timeAgo: 'Vừa xong',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === activeCommentPost.id) {
          const updated = {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
          setActiveCommentPost(updated);
          return updated;
        }
        return p;
      })
    );
    setCommentText('');
  };

  // Create New Post
  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: DetailedPost = {
      id: `post-${Date.now()}`,
      author: 'Khánh Băng (Tôi)',
      avatar: 'KB',
      category: 'experience',
      weekTag: 'Tuần 12',
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      commentsCount: 0,
      timeAgo: 'Vừa xong',
      isLiked: true,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsNewPostOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FFFBF7]">
      {/* Top Header */}
      <header className="flex items-center justify-between py-1 mb-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#3A2E2B] tracking-tight leading-tight">
            Cộng đồng Mẹ & Bé Nova
          </h1>
          <p className="text-[12px] font-medium text-[#8C7B75] mt-0.5">
            Nơi chia sẻ yêu thương & kiến thức tin cậy
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] text-[#8C7B75] hover:text-[#3A2E2B] flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
            aria-label="Tìm kiếm bài viết"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          {/* New Post Trigger */}
          <button
            onClick={() => setIsNewPostOpen(true)}
            className="w-9 h-9 rounded-full bg-[#C84B4B] text-white flex items-center justify-center hover:bg-[#B84040] cursor-pointer transition-colors shadow-sm shadow-[#C84B4B]/20"
            aria-label="Viết bài mới"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* Expandable Search Input */}
      <AnimatePresence>
        {showSearchInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, câu hỏi, mẹo hay..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#EDE7E2] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
              />
              <Search className="w-4 h-4 text-[#8C7B75] absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#8C7B75]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Horizontal Scroll Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 mb-4 shrink-0 min-h-[46px]">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-9 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 flex items-center justify-center leading-none ${
                isActive
                  ? 'bg-[#C84B4B] text-white shadow-xs'
                  : 'bg-white border border-[#EBE4DE] text-[#6B5A54] hover:bg-[#FAF7F4]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-4">
        {filteredPosts.map((post) => {
          const isPopping = poppingHeartId === post.id;

          return (
            <motion.article
              key={post.id}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-[24px] p-4.5 ios-card-shadow border border-[#F2ECE7] flex flex-col justify-between"
            >
              {/* Author & Verified Tag Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                      post.isVerified
                        ? 'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]'
                        : 'bg-[#FDF3EE] text-[#C84B4B] border-[#F6DDD7]'
                    }`}
                  >
                    {post.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h2 className="text-[13px] font-bold text-[#3A2E2B] leading-tight">
                        {post.author}
                      </h2>
                      {post.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2980B9] fill-[#2980B9]/20" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#8C7B75] leading-tight">
                      {post.timeAgo}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    post.isVerified
                      ? 'bg-[#EBF5FB] text-[#2980B9]'
                      : 'bg-[#FCEEEB] text-[#C84B4B]'
                  }`}
                >
                  {post.weekTag}
                </span>
              </div>

              {/* Title & Content */}
              <h3 className="text-[15px] font-bold text-[#3A2E2B] leading-snug mb-1.5">
                {post.title}
              </h3>
              <p className="text-[12px] text-[#63534D] leading-relaxed mb-3">
                {post.content}
              </p>

              {/* Optional Post Image */}
              {post.image && (
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#FAF6F3] mb-3 border border-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Social Action Bar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[#8C7B75]">
                <div className="flex items-center gap-4">
                  {/* Heart Button with Pop Effect */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleToggleLike(post.id)}
                    animate={isPopping ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                      post.isLiked ? 'text-[#C84B4B]' : 'hover:text-[#C84B4B]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.isLiked
                          ? 'fill-[#C84B4B] text-[#C84B4B]'
                          : 'stroke-[2]'
                      }`}
                    />
                    <span className="tabular-nums">{post.likes}</span>
                  </motion.button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setActiveCommentPost(post)}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-[#3A2E2B] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 stroke-[1.8]" />
                    <span className="tabular-nums">{post.commentsCount}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="hover:text-[#3A2E2B] cursor-pointer"
                    title="Lưu bài viết"
                  >
                    <Bookmark className="w-4 h-4 stroke-[1.8]" />
                  </button>
                  <button
                    className="hover:text-[#3A2E2B] cursor-pointer"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Comments Drawer Modal */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCommentPost(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[430px] max-h-[85%] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9]"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#3A2E2B]">
                  Bình luận ({activeCommentPost.commentsCount})
                </h3>
                <button
                  onClick={() => setActiveCommentPost(null)}
                  className="w-7 h-7 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#8C7B75]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar max-h-[300px]">
                {activeCommentPost.comments.length === 0 ? (
                  <div className="py-8 text-center text-[#8C7B75] text-xs">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cùng mẹ nhé!
                  </div>
                ) : (
                  activeCommentPost.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-[#FAF7F4] border border-[#F0ECE9]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#3A2E2B]">
                          {c.author}
                        </span>
                        <span className="text-[10px] text-[#8C7B75]">{c.timeAgo}</span>
                      </div>
                      <p className="text-xs text-[#63534D] leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Bar */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Gửi bình luận hoặc lời động viên..."
                  className="flex-1 px-3.5 py-2.5 bg-[#FAF7F4] border border-[#EDE7E2] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="w-9 h-9 rounded-xl bg-[#C84B4B] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Post Modal Sheet */}
      <AnimatePresence>
        {isNewPostOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPostOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[430px] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9]"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                <h3 className="text-[15px] font-bold text-[#3A2E2B]">
                  Viết bài chia sẻ cùng cộng đồng
                </h3>
                <button
                  onClick={() => setIsNewPostOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#8C7B75]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F4] border border-[#EDE7E2] rounded-xl text-xs font-bold text-[#3A2E2B] mb-2.5 focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
              />

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nội dung chia sẻ, tâm sự hoặc hỏi đáp..."
                className="w-full h-28 p-3.5 bg-[#FAF7F4] border border-[#EDE7E2] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30 resize-none mb-3"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsNewPostOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#8C7B75]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-5 py-2.5 bg-[#C84B4B] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#B84040]"
                >
                  Đăng bài ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
