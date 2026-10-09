import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS_DATA } from '../../data/mockData';
import { ProductItem } from '../../types';
import {
  Search,
  ShoppingBag,
  Star,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  Crown,
  X,
  RotateCcw,
  Sparkles,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

interface ShopScreenProps {
  onOpenCart: () => void;
  cartCount: number;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  isVip?: boolean;
  onOpenVipModal?: () => void;
}

type FilterType = 'all' | 'price' | 'rating' | 'promo';
type PriceSortOrder = 'asc' | 'desc';
type PriceRange = 'all' | 'under100' | '100to500' | 'above500';

export const ShopScreen: React.FC<ShopScreenProps> = ({
  onOpenCart,
  cartCount,
  onAddToCart,
  onSelectProduct,
  isVip = false,
  onOpenVipModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [priceSortOrder, setPriceSortOrder] = useState<PriceSortOrder>('asc');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);

  // Advanced Filter Modal State
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number>(0);

  const filterChips: { id: FilterType; label: string; hasArrow?: boolean }[] = [
    { id: 'all', label: 'Tất cả' },
    {
      id: 'price',
      label:
        selectedFilter === 'price'
          ? priceSortOrder === 'asc'
            ? 'Mức giá ↑'
            : 'Mức giá ↓'
          : 'Mức giá',
      hasArrow: true,
    },
    { id: 'rating', label: 'Đánh giá' },
    { id: 'promo', label: 'Khuyến mãi' },
  ];

  const handleChipClick = (filterId: FilterType) => {
    if (filterId === 'price') {
      if (selectedFilter === 'price') {
        // Toggle sort order between asc and desc
        setPriceSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSelectedFilter('price');
        setPriceSortOrder('asc');
      }
    } else {
      setSelectedFilter(filterId);
      setShowPriceDropdown(false);
    }
  };

  const handleAdd = (e: React.MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedNoticeId(product.id);
    setTimeout(() => {
      setAddedNoticeId(null);
    }, 1200);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilter('all');
    setPriceSortOrder('asc');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedMinRating(0);
    setIsAdvancedFilterOpen(false);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS_DATA];

    // 1. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category filter (from advanced sheet)
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 3. Price range filter (from advanced sheet)
    if (selectedPriceRange === 'under100') {
      list = list.filter((p) => p.price < 100000);
    } else if (selectedPriceRange === '100to500') {
      list = list.filter((p) => p.price >= 100000 && p.price <= 500000);
    } else if (selectedPriceRange === 'above500') {
      list = list.filter((p) => p.price > 500000);
    }

    // 4. Rating filter (from advanced sheet)
    if (selectedMinRating > 0) {
      list = list.filter((p) => p.rating >= selectedMinRating);
    }

    // 5. Active Tab Filter & Sorter
    if (selectedFilter === 'price') {
      list.sort((a, b) =>
        priceSortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    } else if (selectedFilter === 'rating') {
      // Sort highest rating first
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedFilter === 'promo') {
      // Filter promotional / popular affordable items (< 300k) or books & skincare
      list = list.filter((p) => p.price <= 300000 || p.category === 'books');
    }

    return list;
  }, [
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedMinRating,
    selectedFilter,
    priceSortOrder,
  ]);

  const hasActiveAdvancedFilter =
    selectedCategory !== 'all' ||
    selectedPriceRange !== 'all' ||
    selectedMinRating > 0;

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FFFBF7] relative">
      {/* Top Header (Hình 1) */}
      <header className="flex items-center justify-between py-1 mb-3 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold text-[#3A2E2B] tracking-tight leading-tight">
            Cửa hàng Nova
          </h1>
          {isVip && (
            <span className="text-[10px] font-bold text-[#B38728] flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              <span>Đặc quyền VIP: Đang giảm 10% toàn bộ</span>
            </span>
          )}
        </div>

        {/* Shopping Cart Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onOpenCart}
          className="w-10 h-10 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#3A2E2B] relative hover:bg-[#FAF6F3] cursor-pointer"
          aria-label="Giỏ hàng"
        >
          <ShoppingBag className="w-5 h-5 text-[#3A2E2B] stroke-[1.8]" />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#C84B4B] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
      </header>

      {/* VIP 10% banner prompt if not VIP */}
      {!isVip && onOpenVipModal && (
        <div
          onClick={onOpenVipModal}
          className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-[#FFF6E5] to-[#FCEEEB] border border-[#F3E5AB] flex items-center justify-between cursor-pointer shrink-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#D4AF37] text-white flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-[#3A2E2B]">
                Tiết kiệm 10% với gói Nova VIP
              </p>
              <p className="text-[10px] text-[#7A6A64]">
                Chỉ 99k/tháng cho toàn bộ cửa hàng
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#C84B4B] bg-white px-2 py-1 rounded-full shadow-2xs">
            Nâng cấp
          </span>
        </div>
      )}

      {/* Search Bar with Advanced Filter Trigger (Hình 1) */}
      <div className="relative mb-3.5 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B75]">
          <Search className="w-4 h-4 stroke-[2]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm đồ dùng mẹ & bé..."
          className="w-full pl-10 pr-20 py-3 bg-white border border-[#EDE7E2] rounded-2xl text-[13px] text-[#3A2E2B] placeholder:text-[#8C7B75] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30 focus:border-[#C84B4B] shadow-2xs transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Sliders Button opening Advanced Sheet */}
          <button
            onClick={() => setIsAdvancedFilterOpen(true)}
            className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
              hasActiveAdvancedFilter
                ? 'bg-[#FCEEEB] text-[#C84B4B]'
                : 'text-[#8C7B75] hover:text-[#3A2E2B]'
            }`}
            title="Bộ lọc nâng cao"
            aria-label="Mở bộ lọc nâng cao"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveAdvancedFilter && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C84B4B]" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips with Morphing Shared Layout Animation (Hình 1) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-3 shrink-0 min-h-[48px]">
        {filterChips.map((chip) => {
          const isActive = selectedFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              className={`relative h-9 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 shrink-0 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'text-[#6E5D57] bg-white border border-[#EDE7E2] hover:bg-[#FAF7F4]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="shopFilterTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute inset-0 bg-[#C84B4B] rounded-full shadow-sm"
                />
              )}
              <span className="relative z-10 leading-none">{chip.label}</span>
              {chip.hasArrow && (
                <span className="relative z-10 flex items-center">
                  {selectedFilter === 'price' && priceSortOrder === 'desc' ? (
                    <ChevronUp className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  ) : (
                    <ChevronDown
                      className={`w-3.5 h-3.5 stroke-[2.5] ${
                        isActive ? 'text-white' : 'text-[#8C7B75]'
                      }`}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Filter Status & Reset Action */}
      <div className="flex items-center justify-between px-1 mb-3 text-[11px] text-[#8C7B75]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>
            <strong className="text-[#3A2E2B] tabular-nums font-bold">
              {filteredProducts.length}
            </strong>{' '}
            sản phẩm
          </span>
          {selectedFilter === 'price' && (
            <span className="text-[#C84B4B] font-semibold">
              · {priceSortOrder === 'asc' ? 'Giá tăng dần ↑' : 'Giá giảm dần ↓'}
            </span>
          )}
          {selectedFilter === 'rating' && (
            <span className="text-[#C84B4B] font-semibold">
              · Đánh giá cao nhất
            </span>
          )}
          {selectedFilter === 'promo' && (
            <span className="text-[#C84B4B] font-semibold">
              · Khuyến mãi hot
            </span>
          )}
        </div>

        {(selectedFilter !== 'all' ||
          searchQuery !== '' ||
          hasActiveAdvancedFilter) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[#C84B4B] font-semibold hover:underline cursor-pointer shrink-0 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Product Grid 2 Cột (Hình 1) */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 rounded-3xl bg-white border border-[#EFEAE5] text-center ios-card-shadow my-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-bold text-[#3A2E2B]">
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p className="text-xs text-[#8C7B75] mt-1 max-w-[240px] mx-auto leading-relaxed">
            Mẹ hãy thử tìm kiếm từ khóa khác hoặc đặt lại bộ lọc nhé!
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-[#C84B4B] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#B84040] cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => {
            const isRecentlyAdded = addedNoticeId === product.id;
            const displayPrice = isVip
              ? Math.round(product.price * 0.9).toLocaleString('vi-VN') + 'đ'
              : product.formattedPrice;

            return (
              <motion.div
                key={product.id}
                layout
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-[22px] p-3 ios-card-shadow border border-[#F2ECE7] flex flex-col justify-between cursor-pointer group hover:border-[#E5DDD6] transition-all relative overflow-hidden"
              >
                {/* Product Image Square */}
                <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-[#F7F3EF] mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  {/* Rating badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs">
                    <Star className="w-3 h-3 text-[#F39C12] fill-current" />
                    <span className="text-[10px] font-bold text-[#3A2E2B] tabular-nums">
                      {product.rating}
                    </span>
                  </div>

                  {isVip && (
                    <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#2A2321] text-[9px] font-black px-1.5 py-0.2 rounded-md">
                      -10% VIP
                    </div>
                  )}
                </div>

                {/* Product Name & Price */}
                <div className="flex flex-col flex-1 justify-between">
                  <h3 className="text-[13px] font-bold text-[#3A2E2B] leading-snug line-clamp-2 min-h-[36px] group-hover:text-[#C84B4B] transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                    <div>
                      <span className="text-[14px] font-extrabold text-[#C84B4B] tabular-nums">
                        {displayPrice}
                      </span>
                      {isVip && (
                        <span className="text-[10px] text-[#A0938E] line-through block leading-tight">
                          {product.formattedPrice}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Mini Button */}
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleAdd(e, product)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isRecentlyAdded
                          ? 'bg-[#2ECC71] text-white'
                          : 'bg-[#FCEEEB] text-[#C84B4B] hover:bg-[#C84B4B] hover:text-white'
                      }`}
                      aria-label={`Thêm ${product.name} vào giỏ`}
                    >
                      {isRecentlyAdded ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Safe Care Guarantee Footer Pill */}
      <div className="mt-5 p-3 rounded-2xl bg-[#FAF6F3] border border-[#EBE4DE] text-center">
        <p className="text-[11px] text-[#7A6A64]">
          🛡️ 100% Sản phẩm được kiểm định an toàn cho mẹ bầu & trẻ sơ sinh
        </p>
      </div>

      {/* Advanced Filter Modal Sheet */}
      <AnimatePresence>
        {isAdvancedFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[430px] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9] max-h-[85%] overflow-y-auto no-scrollbar"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C84B4B]" />
                  <h3 className="text-base font-bold text-[#3A2E2B]">
                    Bộ lọc nâng cao
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#8C7B75] hover:bg-[#EFEAE5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Category */}
              <div className="mb-4">
                <label className="text-xs font-bold text-[#3A2E2B] block mb-2">
                  Danh mục sản phẩm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Tất cả danh mục' },
                    { id: 'books', label: 'Sách & Sổ tay' },
                    { id: 'jewelry', label: 'Trang sức phong thủy' },
                    { id: 'skincare', label: 'Dưỡng da thai kỳ' },
                    { id: 'bedding', label: 'Gối ôm & Giấc ngủ' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer border ${
                        selectedCategory === cat.id
                          ? 'bg-[#FCEEEB] text-[#C84B4B] border-[#C84B4B]'
                          : 'bg-[#FAF7F4] text-[#6E5D57] border-[#EDE7E2] hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price Range */}
              <div className="mb-4">
                <label className="text-xs font-bold text-[#3A2E2B] block mb-2">
                  Khoảng giá
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all' as PriceRange, label: 'Mọi mức giá' },
                    { id: 'under100' as PriceRange, label: 'Dưới 100.000đ' },
                    { id: '100to500' as PriceRange, label: '100.000đ - 500.000đ' },
                    { id: 'above500' as PriceRange, label: 'Trên 500.000đ' },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer border ${
                        selectedPriceRange === range.id
                          ? 'bg-[#FCEEEB] text-[#C84B4B] border-[#C84B4B]'
                          : 'bg-[#FAF7F4] text-[#6E5D57] border-[#EDE7E2] hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Rating */}
              <div className="mb-5">
                <label className="text-xs font-bold text-[#3A2E2B] block mb-2">
                  Đánh giá người dùng
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { val: 0, label: 'Tất cả' },
                    { val: 4.8, label: '4.8⭐ trở lên' },
                    { val: 5.0, label: '5.0⭐ tuyệt đối' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      onClick={() => setSelectedMinRating(r.val)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        selectedMinRating === r.val
                          ? 'bg-[#FCEEEB] text-[#C84B4B] border-[#C84B4B]'
                          : 'bg-[#FAF7F4] text-[#6E5D57] border-[#EDE7E2]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 text-xs font-bold text-[#8C7B75] bg-[#FAF7F4] hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Thiết lập lại
                </button>
                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#C84B4B] hover:bg-[#B84040] rounded-xl shadow-md cursor-pointer"
                >
                  Áp dụng ({filteredProducts.length} món)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
