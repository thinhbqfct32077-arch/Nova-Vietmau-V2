import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS_DATA, SHOP_CATEGORIES } from '../../data/mockData';
import { SHOP_COMBOS } from '../../data/ecosystemData';
import { ProductItem, ProductCategory, ProductCombo, OrderInfo, UserProfile } from '../../types';
import { apiService } from '../../services/apiService';
import { NovaImage } from '../NovaBrandMark';
import {
  Search,
  ShoppingBag,
  Star,
  Plus,
  SlidersHorizontal,
  Check,
  Crown,
  X,
  RotateCcw,
  Package,
  Info,
  Heart,
  Scale,
  Sparkles,
  Clock,
  CheckCircle2,
  Truck,
} from 'lucide-react';

interface ShopScreenProps {
  onOpenCart: () => void;
  cartCount: number;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  isVip?: boolean;
  onOpenVipModal?: () => void;
  onNavigateToOrderInfo?: () => void;
  user?: UserProfile;
  orders?: OrderInfo[];
}

type SortType = 'default' | 'price_asc' | 'price_desc' | 'promo';
type PriceRange = 'all' | 'under150' | '150to400' | 'above400';

export const ShopScreen: React.FC<ShopScreenProps> = ({
  onOpenCart,
  cartCount,
  onAddToCart,
  onSelectProduct,
  isVip = false,
  onOpenVipModal,
  onNavigateToOrderInfo,
  user,
  orders: localOrders = [],
}) => {
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [serverOrders, setServerOrders] = useState<OrderInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [sortType, setSortType] = useState<SortType>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reviewsSummary, setReviewsSummary] = useState<
    Record<string, { rating?: number; reviewsCount: number }>
  >({});

  // Advanced Filter, Wishlist, Compare & Order Tracking state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyWishlist, setOnlyWishlist] = useState(false);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const loadShopData = () => {
    apiService
      .fetchProducts()
      .then((list) => {
        if (list.length > 0) setCatalogProducts(list);
      })
      .catch(() => {});
    apiService
      .fetchAllReviewsSummary()
      .then((res) => {
        if (res && res.summary) setReviewsSummary(res.summary);
      })
      .catch(() => {});
    apiService
      .fetchWishlist(user)
      .then(setWishlistIds)
      .catch(() => {});
    apiService
      .fetchOrders(false, user)
      .then(setServerOrders)
      .catch(() => {});
  };

  useEffect(() => {
    loadShopData();
    const handler = () => loadShopData();
    window.addEventListener('nova_reviews_updated', handler);
    window.addEventListener('nova_orders_updated', handler);
    return () => {
      window.removeEventListener('nova_reviews_updated', handler);
      window.removeEventListener('nova_orders_updated', handler);
    };
  }, [user?.id]);

  const enrichedProducts = useMemo<ProductItem[]>(() => {
    return catalogProducts.map((p) => {
      const realRev = reviewsSummary[p.id];
      if (realRev) {
        return {
          ...p,
          rating: realRev.rating,
          reviewsCount: realRev.reviewsCount,
        };
      }
      return p;
    });
  }, [catalogProducts, reviewsSummary]);

  const availableBrands = useMemo(
    () => Array.from(new Set(enrichedProducts.map((p) => p.brand))),
    [enrichedProducts]
  );

  const mergedOrders = useMemo(() => {
    const map = new Map<string, OrderInfo>();
    [...serverOrders, ...localOrders].forEach((o) => {
      if (!map.has(o.orderId)) map.set(o.orderId, o);
    });
    return Array.from(map.values());
  }, [serverOrders, localOrders]);

  const handleAdd = (e: React.MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    if (!product.inStock) return;
    onAddToCart(product);
    setAddedNoticeId(product.id);
    setTimeout(() => {
      setAddedNoticeId(null);
    }, 1200);
  };

  const handleAddCombo = (combo: ProductCombo) => {
    let addedCount = 0;
    combo.productIds.forEach((pid) => {
      const prod = enrichedProducts.find((p) => p.id === pid && p.inStock);
      if (prod) {
        onAddToCart(prod);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      notify(`Đã thêm ${addedCount} sản phẩm từ "${combo.title}" vào giỏ hàng!`);
    } else {
      notify('Các sản phẩm trong combo hiện tạm hết hàng.');
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const optimistic = wishlistIds.includes(productId)
      ? wishlistIds.filter((id) => id !== productId)
      : [productId, ...wishlistIds];
    setWishlistIds(optimistic);
    try {
      const updated = await apiService.toggleWishlist(productId, user);
      setWishlistIds(updated);
    } catch {}
  };

  const handleToggleCompare = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (compareIds.includes(productId)) {
      setCompareIds(compareIds.filter((id) => id !== productId));
    } else if (compareIds.length >= 3) {
      notify('Chỉ so sánh tối đa 3 sản phẩm cùng lúc.');
    } else {
      setCompareIds([...compareIds, productId]);
    }
  };

  const handleResetFilters = () => {
    setSortType('default');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedBrand('all');
    setOnlyInStock(false);
    setOnlyWishlist(false);
    setIsAdvancedFilterOpen(false);
  };

  const filteredProducts = useMemo(() => {
    let list = [...enrichedProducts];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (onlyWishlist) {
      list = list.filter((p) => wishlistIds.includes(p.id));
    }

    if (selectedPriceRange === 'under150') {
      list = list.filter((p) => p.price < 150000);
    } else if (selectedPriceRange === '150to400') {
      list = list.filter((p) => p.price >= 150000 && p.price <= 400000);
    } else if (selectedPriceRange === 'above400') {
      list = list.filter((p) => p.price > 400000);
    }

    if (onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    if (sortType === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortType === 'promo') {
      list = list.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    return list;
  }, [
    enrichedProducts,
    searchQuery,
    selectedCategory,
    selectedBrand,
    onlyWishlist,
    wishlistIds,
    selectedPriceRange,
    onlyInStock,
    sortType,
  ]);

  const compareProducts = useMemo(
    () => enrichedProducts.filter((p) => compareIds.includes(p.id)),
    [enrichedProducts, compareIds]
  );

  const hasActiveAdvancedFilter =
    selectedPriceRange !== 'all' || onlyInStock || selectedBrand !== 'all' || onlyWishlist;

  const ORDER_STATUS_LABEL: Record<string, string> = {
    pending: 'Chờ xác nhận',
    awaiting_verification: 'Chờ xác minh CK VietQR',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao thành công',
    cancelled: 'Đã hủy',
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-5 pt-3 pb-20 overflow-y-auto no-scrollbar select-none bg-[#FAF6F0] dark:bg-[#161311] relative">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-semibold px-4 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between py-1 mb-2.5 shrink-0 gap-2">
        <div className="min-w-0">
          <h1 className="font-editorial text-[22px] sm:text-[26px] font-semibold text-[#322622] dark:text-[#F4EDE6] tracking-tight leading-tight truncate">
            Cửa hàng Mẹ & Bé
          </h1>
          {isVip && (
            <span className="text-[11px] font-semibold text-[#9E5B3B] dark:text-[#D7BA86] flex items-center gap-1 mt-0.5">
              <Crown className="w-3 h-3 fill-current" />
              <span>Đặc quyền VIP: Giảm 10% đơn hàng</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOrdersOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] text-[11px] font-semibold flex items-center gap-1.5 border border-[#EBCDC2] dark:border-[#52352D] hover:bg-[#F2DFD8] dark:hover:bg-[#432B25] transition-colors cursor-pointer whitespace-nowrap min-h-[40px] tabular-nums"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Đơn hàng ({mergedOrders.length})</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCart}
            className="w-10 h-10 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] relative hover:border-[#B55841] transition-colors cursor-pointer"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#B55841] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs tabular-nums"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </header>

      {/* Transparent Demo Catalog Notice */}
      <div className="mb-3 p-2.5 rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-2 text-[11px] text-[#6B5D56] dark:text-[#C5B9B0] shrink-0">
        <Info className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
        <span>
          <strong>Danh mục minh họa (Demo):</strong> Tồn kho, giỏ hàng, mã giảm giá và đơn hàng COD/VietQR được xử lý thực tế trên hệ thống Nova.
        </span>
      </div>

      {/* VIP Banner */}
      {!isVip && onOpenVipModal && (
        <div
          onClick={onOpenVipModal}
          className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-[#F6EFE2] to-[#F7EAE5] dark:from-[#2F281C] dark:to-[#35231E] border border-[#E5D4B3] dark:border-[#4A3F2B] flex items-center justify-between cursor-pointer shrink-0 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C4A46B] dark:bg-[#D7BA86] text-white dark:text-[#161311] flex items-center justify-center shadow-xs shrink-0">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                Tiết kiệm 10% với gói Nova VIP
              </p>
              <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">Ưu đãi trực tiếp trên giỏ hàng</p>
            </div>
          </div>
          <span className="text-[10.5px] font-semibold text-[#B55841] dark:text-[#D47A63] bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] px-2.5 py-1 rounded-lg whitespace-nowrap">
            Xem gói
          </span>
        </div>
      )}

      {/* Search Bar & Sort */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 shrink-0">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786962] dark:text-[#B5A89F]">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sản phẩm, thương hiệu, công dụng..."
            className="w-full min-h-[42px] pl-10 pr-24 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#786962] hover:text-[#322622] dark:hover:text-[#F4EDE6] cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setOnlyWishlist(!onlyWishlist)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                onlyWishlist
                  ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]'
                  : 'text-[#786962] dark:text-[#B5A89F]'
              }`}
              title={`Yêu thích (${wishlistIds.length})`}
            >
              <Heart className={`w-4 h-4 ${onlyWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                hasActiveAdvancedFilter
                  ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]'
                  : 'text-[#786962] dark:text-[#B5A89F]'
              }`}
              title="Bộ lọc nâng cao"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="min-h-[42px] px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] focus:outline-none cursor-pointer"
          aria-label="Sắp xếp sản phẩm"
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="price_asc">Giá: Thấp đến cao</option>
          <option value="price_desc">Giá: Cao đến thấp</option>
          <option value="promo">Đang khuyến mãi</option>
        </select>
      </div>

      {/* Mother & Baby Combos Strip */}
      <section className="mb-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-editorial text-sm font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A46B] dark:text-[#D7BA86]" />
            <span>Combo Mẹ & Bé tiết kiệm</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {SHOP_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] nova-card-shadow flex items-center justify-between gap-2.5"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-[#9E5B3B] dark:text-[#D7BA86] bg-[#F6EFE2] dark:bg-[#2F281C] px-2 py-0.5 rounded-md inline-block">
                  {combo.badgeText}
                </span>
                <p className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] mt-1 truncate">
                  {combo.title}
                </p>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">{combo.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddCombo(combo)}
                className="px-3.5 min-h-[38px] py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-[11px] font-semibold whitespace-nowrap cursor-pointer shrink-0 transition-colors"
              >
                + Chọn combo
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Horizontal Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 mb-2 shrink-0">
        {SHOP_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 min-h-[38px] py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 border ${
                isActive
                  ? 'bg-[#B55841] text-white border-[#B55841] shadow-2xs'
                  : 'bg-[#FFFFFF] dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Compare Bar + Result Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-3 text-[11px] text-[#786962] dark:text-[#B5A89F]">
        <span className="tabular-nums">
          Hiển thị <strong className="text-[#322622] dark:text-[#F4EDE6]">{filteredProducts.length}</strong> /{' '}
          {enrichedProducts.length} sản phẩm
          {onlyWishlist && ` · Đang lọc Yêu thích (${wishlistIds.length})`}
        </span>
        <div className="flex items-center gap-3">
          {compareIds.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1 text-[#4F6B56] dark:text-[#8DA892] font-semibold hover:underline cursor-pointer tabular-nums"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>So sánh ({compareIds.length}/3)</span>
            </button>
          )}
          {(sortType !== 'default' || searchQuery !== '' || selectedCategory !== 'all' || hasActiveAdvancedFilter) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[#B55841] dark:text-[#D47A63] font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 px-4 rounded-3xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-center nova-card-shadow my-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p className="text-xs text-[#786962] dark:text-[#B5A89F] mt-1">
            Hãy thử từ khóa khác hoặc đặt lại bộ lọc danh mục nhé!
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-5 min-h-[44px] py-2 bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredProducts.map((product) => {
            const isRecentlyAdded = addedNoticeId === product.id;
            const isWishlisted = wishlistIds.includes(product.id);
            const isComparing = compareIds.includes(product.id);
            const effectivePrice = isVip ? Math.round(product.price * 0.9) : product.price;
            const discountPercent =
              product.originalPrice && product.originalPrice > effectivePrice
                ? Math.round(((product.originalPrice - effectivePrice) / product.originalPrice) * 100)
                : 0;

            return (
              <motion.div
                key={product.id}
                layout
                whileHover={{ y: -3 }}
                onClick={() => onSelectProduct(product)}
                className={`bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-[22px] p-3 nova-card-shadow border flex flex-col justify-between cursor-pointer group transition-all relative overflow-hidden ${
                  product.inStock
                    ? 'border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#D47A63]'
                    : 'border-[#E6DDD1] dark:border-[#2C2522] opacity-80'
                }`}
              >
                <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B] mb-2.5">
                  <NovaImage
                    src={product.image}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      product.inStock ? 'group-hover:scale-105' : 'grayscale-[40%]'
                    }`}
                    loading="lazy"
                  />

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {discountPercent > 0 && (
                      <span className="bg-[#B55841] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs tabular-nums">
                        -{discountPercent}%
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="bg-[#322622]/90 text-white text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md">
                        Tạm hết hàng
                      </span>
                    )}
                  </div>

                  {/* Wishlist & Compare buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs shadow-xs cursor-pointer transition-colors ${
                        isWishlisted
                          ? 'bg-[#B55841] text-white'
                          : 'bg-white/90 dark:bg-[#1E1A17]/90 text-[#6B5D56] dark:text-[#C5B9B0]'
                      }`}
                      aria-label="Yêu thích"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(e, product.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs shadow-xs cursor-pointer transition-colors ${
                        isComparing
                          ? 'bg-[#6D8572] text-white'
                          : 'bg-white/90 dark:bg-[#1E1A17]/90 text-[#6B5D56] dark:text-[#C5B9B0]'
                      }`}
                      title="So sánh sản phẩm"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[10.5px] font-medium text-[#786962] dark:text-[#B5A89F] truncate">
                      {product.brand}
                    </p>
                    <h3 className="font-editorial text-[13.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-snug line-clamp-2 min-h-[38px] mt-0.5 group-hover:text-[#B55841] dark:group-hover:text-[#D47A63] transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mt-1 text-[10.5px]">
                      {product.reviewsCount > 0 && product.rating !== undefined ? (
                        <>
                          <Star className="w-3 h-3 text-[#C4A46B] dark:text-[#D7BA86] fill-current" />
                          <span className="font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                            {product.rating}
                          </span>
                          <span className="text-[#786962] dark:text-[#B5A89F] tabular-nums">
                            ({product.reviewsCount})
                          </span>
                        </>
                      ) : (
                        <span className="text-[#786962] dark:text-[#B5A89F] italic">Chưa có đánh giá</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                    <div>
                      <span className="text-[14px] font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                        {effectivePrice.toLocaleString('vi-VN')}đ
                      </span>
                      {(product.formattedOriginalPrice || isVip) && (
                        <span className="text-[10px] text-[#786962] dark:text-[#B5A89F] line-through block leading-tight tabular-nums">
                          {product.formattedOriginalPrice || product.formattedPrice}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileTap={product.inStock ? { scale: 0.85 } : undefined}
                      disabled={!product.inStock}
                      onClick={(e) => handleAdd(e, product)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        !product.inStock
                          ? 'bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] cursor-not-allowed'
                          : isRecentlyAdded
                          ? 'bg-[#6D8572] text-white cursor-pointer'
                          : 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] hover:bg-[#B55841] hover:text-white cursor-pointer'
                      }`}
                      aria-label={`Thêm ${product.name} vào giỏ`}
                    >
                      {isRecentlyAdded ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Modal */}
      <AnimatePresence>
        {isAdvancedFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedFilterOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-[460px] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col z-10 border border-[#E6DDD1] dark:border-[#362E2A] max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                  <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Bộ lọc nâng cao
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] flex items-center justify-center text-[#786962] dark:text-[#B5A89F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-2">
                  Khoảng giá
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all' as PriceRange, label: 'Mọi mức giá' },
                    { id: 'under150' as PriceRange, label: 'Dưới 150.000đ' },
                    { id: '150to400' as PriceRange, label: '150.000đ - 400.000đ' },
                    { id: 'above400' as PriceRange, label: 'Trên 400.000đ' },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer border transition-colors ${
                        selectedPriceRange === range.id
                          ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border-[#B55841]'
                          : 'bg-[#FFFFFF] dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A]'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-2">
                  Thương hiệu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6]"
                >
                  <option value="all">Tất cả thương hiệu</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5 space-y-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 accent-[#B55841]"
                  />
                  <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Chỉ hiển thị sản phẩm còn hàng
                  </span>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyWishlist}
                    onChange={(e) => setOnlyWishlist(e.target.checked)}
                    className="w-4 h-4 accent-[#B55841]"
                  />
                  <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                    Chỉ hiển thị mục đã Yêu thích ({wishlistIds.length})
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 min-h-[44px] py-3 text-xs font-semibold text-[#6B5D56] dark:text-[#C5B9B0] bg-[#F2ECE3] dark:bg-[#231E1B] rounded-xl cursor-pointer transition-colors"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => setIsAdvancedFilterOpen(false)}
                  className="flex-1 min-h-[44px] py-3 text-xs font-semibold text-white bg-[#B55841] hover:bg-[#9E4A35] rounded-xl shadow-sm cursor-pointer transition-colors tabular-nums"
                >
                  Áp dụng ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 select-none">
            <div onClick={() => setIsCompareOpen(false)} className="fixed inset-0 bg-black/55 backdrop-blur-xs" />
            <div className="relative z-10 w-full max-w-3xl bg-[#FAF6F0] dark:bg-[#161311] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-4">
                <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2 tabular-nums">
                  <Scale className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
                  <span>So sánh sản phẩm ({compareProducts.length}/3)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCompareIds([]);
                      setIsCompareOpen(false);
                    }}
                    className="text-xs font-semibold text-[#B55841] dark:text-[#D47A63] cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                  <button
                    onClick={() => setIsCompareOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {compareProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2"
                  >
                    <NovaImage
                      src={p.image}
                      alt={p.name}
                      fallbackTitle={p.name}
                      className="w-full h-32 object-cover rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B]"
                    />
                    <p className="font-editorial text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                      {p.name}
                    </p>
                    <p className="text-sm font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                      {p.formattedPrice}
                    </p>
                    <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Thương hiệu: {p.brand}</p>
                    <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
                      Tồn kho: {p.inStock ? `Còn ${p.stockCount ?? ''}` : 'Tạm hết hàng'}
                    </p>
                    <ul className="space-y-1 text-[11px] text-[#6B5D56] dark:text-[#C5B9B0]">
                      {p.benefits.slice(0, 3).map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Tracking Drawer Modal */}
      <AnimatePresence>
        {isOrdersOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 select-none">
            <div onClick={() => setIsOrdersOpen(false)} className="fixed inset-0 bg-black/55 backdrop-blur-xs" />
            <div className="relative z-10 w-full max-w-xl bg-[#FAF6F0] dark:bg-[#161311] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-3.5">
                <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2 tabular-nums">
                  <Truck className="w-4.5 h-4.5 text-[#B55841] dark:text-[#D47A63]" />
                  <span>Theo dõi đơn hàng ({mergedOrders.length})</span>
                </h3>
                <button
                  onClick={() => setIsOrdersOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {mergedOrders.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#786962] dark:text-[#B5A89F] space-y-2">
                  <Package className="w-9 h-9 mx-auto opacity-40" />
                  <p>Mẹ chưa có đơn hàng nào được tạo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#B55841] dark:text-[#D47A63]">
                          {ord.orderId}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border border-[#EBCDC2] dark:border-[#52352D]">
                          {ORDER_STATUS_LABEL[ord.status] || ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
                        PT: {ord.paymentMethod.toUpperCase()} · Tổng:{' '}
                        <strong className="text-[#322622] dark:text-[#F4EDE6]">
                          {ord.totalAmount.toLocaleString('vi-VN')}đ
                        </strong>
                      </p>
                      {ord.trackingHistory && ord.trackingHistory.length > 0 && (
                        <div className="pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A] space-y-1">
                          {ord.trackingHistory.map((ev, idx) => (
                            <p
                              key={idx}
                              className="text-[11px] text-[#6B5D56] dark:text-[#C5B9B0] flex items-center gap-1.5"
                            >
                              <Clock className="w-3 h-3 text-[#4F6B56] dark:text-[#8DA892] shrink-0" />
                              <span>{ev.label}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {onNavigateToOrderInfo && cartCount > 0 && (
                <button
                  onClick={() => {
                    setIsOrdersOpen(false);
                    onNavigateToOrderInfo();
                  }}
                  className="mt-4 w-full min-h-[44px] py-3 rounded-2xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors tabular-nums"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đi tới thanh toán giỏ hàng hiện tại ({cartCount} sản phẩm)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

