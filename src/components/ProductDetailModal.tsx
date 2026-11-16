import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductItem, ProductReview, UserProfile } from '../types';
import { PRODUCTS_DATA, SHOP_CATEGORIES } from '../data/mockData';
import { apiService } from '../services/apiService';
import { NovaImage } from './NovaBrandMark';
import {
  X,
  Star,
  ShieldCheck,
  ShoppingBag,
  Send,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  user?: UserProfile;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  user,
  onClose,
  onAddToCart,
  onSelectProduct,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState<number | undefined>(undefined);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    setReviews([]);
    setAvgRating(product.rating);
    setReviewsCount(product.reviewsCount);
    setReviewError(null);

    apiService
      .fetchProductReviews(product.id)
      .then((res) => {
        setReviews(res.reviews || []);
        setAvgRating(res.rating);
        setReviewsCount(res.reviewsCount || 0);
      })
      .catch(() => {});
  }, [product?.id]);

  if (!product) return null;

  const categoryLabel =
    SHOP_CATEGORIES.find((c) => c.id === product.category)?.label || product.category;

  const relatedProducts = PRODUCTS_DATA.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await apiService.addProductReview(
        product.id,
        userRating,
        userComment.trim(),
        user
      );
      setReviews(res.reviews);
      setAvgRating(res.rating);
      setReviewsCount(res.reviewsCount);
      setUserComment('');
      window.dispatchEvent(new CustomEvent('nova_reviews_updated'));
    } catch (err: any) {
      setReviewError(err?.message || 'Không gửi được đánh giá.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Sheet / Modal */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[540px] max-h-[90vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col z-10 border border-[#E6DDD1] dark:border-[#362E2A] overflow-y-auto no-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center hover:bg-[#E6DDD1] dark:hover:bg-[#322B27] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Image */}
          <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] mb-4 shrink-0 relative">
            <NovaImage
              src={product.image}
              alt={product.name}
              fallbackTitle={product.name}
              className="w-full h-full object-cover"
            />
            {product.isDemo && (
              <span className="absolute top-3 left-3 bg-[#FFFFFF]/95 dark:bg-[#1E1A17]/95 text-[#322622] dark:text-[#F4EDE6] text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-[#E6DDD1] dark:border-[#362E2A]">
                Sản phẩm minh họa
              </span>
            )}
          </div>

          {/* Brand & Category & Stock */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <div className="flex items-center gap-2 text-[11.5px] font-medium text-[#786962] dark:text-[#B5A89F]">
              <span className="text-[#B55841] dark:text-[#D47A63] font-semibold">{product.brand}</span>
              <span>·</span>
              <span>{categoryLabel}</span>
            </div>

            {product.inStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#263E35] dark:text-[#8DA892] bg-[#EBF1EC] dark:bg-[#1E2922] border border-[#C8D9CB] dark:border-[#33483A] px-2.5 py-0.5 rounded-lg tabular-nums">
                <PackageCheck className="w-3.5 h-3.5" />
                Còn hàng {product.stockCount ? `(${product.stockCount})` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B55841] dark:text-[#D47A63] bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] px-2.5 py-0.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                Tạm hết hàng
              </span>
            )}
          </div>

          {/* Title & Price */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <h2 className="font-editorial text-[20px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-snug">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                {reviewsCount > 0 && avgRating !== undefined ? (
                  <>
                    <Star className="w-3.5 h-3.5 text-[#C4A46B] dark:text-[#D7BA86] fill-current" />
                    <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                      {avgRating}
                    </span>
                    <span className="text-xs text-[#786962] dark:text-[#B5A89F] tabular-nums">
                      ({reviewsCount} đánh giá thực tế)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#786962] dark:text-[#B5A89F] italic">Chưa có đánh giá</span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[20px] font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums block">
                {product.formattedPrice}
              </span>
              {product.formattedOriginalPrice && (
                <span className="text-xs text-[#786962] dark:text-[#B5A89F] line-through tabular-nums">
                  {product.formattedOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Key Benefits */}
          <div className="bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl p-3.5 border border-[#E6DDD1] dark:border-[#362E2A] mb-4">
            <h3 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
              <span>Thông tin chi tiết</span>
            </h3>
            <ul className="space-y-1.5">
              {product.benefits.map((b, idx) => (
                <li key={idx} className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B55841] dark:bg-[#D47A63] shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] mb-2">
                Sản phẩm cùng danh mục ({categoryLabel})
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct?.(rel)}
                    className="p-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FFFFFF] dark:bg-[#1E1A17] hover:border-[#B55841] dark:hover:border-[#D47A63] cursor-pointer flex items-center gap-2.5 transition-colors"
                  >
                    <NovaImage
                      src={rel.image}
                      alt={rel.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#F2ECE3] dark:bg-[#231E1B]"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#322622] dark:text-[#F4EDE6] line-clamp-2 leading-tight">
                        {rel.name}
                      </p>
                      <span className="text-[11px] font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                        {rel.formattedPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real User Reviews */}
          <div className="mb-4 border-t border-[#E6DDD1] dark:border-[#362E2A] pt-3.5">
            <h3 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] mb-2.5 tabular-nums">
              Đánh giá từ mẹ bầu ({reviewsCount})
            </h3>

            {/* Submit Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="mb-3 p-3 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#6B5D56] dark:text-[#C5B9B0]">
                  Chọn số sao của bạn:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="cursor-pointer p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating
                            ? 'text-[#C4A46B] dark:text-[#D7BA86] fill-current'
                            : 'text-[#D6CBC4] dark:text-[#493E38]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {reviewError && <p className="text-[11px] text-[#B55841] dark:text-[#D47A63]">{reviewError}</p>}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Viết nhận xét thực tế về sản phẩm..."
                  className="flex-1 min-h-[40px] px-3 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReview || !userComment.trim()}
                  className="px-3.5 min-h-[40px] bg-[#322622] dark:bg-[#B55841] hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-opacity whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </div>
            </form>

            {reviews.length === 0 ? (
              <p className="text-xs text-[#786962] dark:text-[#B5A89F] italic py-2">
                Chưa có đánh giá nào từ người dùng cho sản phẩm này.
              </p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                        {rev.authorName}
                      </span>
                      <div className="flex items-center gap-0.5 text-[#C4A46B] dark:text-[#D7BA86]">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11.5px] text-[#6B5D56] dark:text-[#C5B9B0]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add to Cart CTA */}
          <motion.button
            whileTap={product.inStock ? { scale: 0.97 } : undefined}
            disabled={!product.inStock}
            onClick={() => {
              if (!product.inStock) return;
              onAddToCart(product);
              onClose();
            }}
            className={`w-full min-h-[48px] py-3.5 rounded-2xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2 shrink-0 transition-colors ${
              product.inStock
                ? 'bg-[#B55841] hover:bg-[#9E4A35] text-white cursor-pointer'
                : 'bg-[#E6DDD1] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums">
              {product.inStock
                ? `Thêm vào giỏ hàng · ${product.formattedPrice}`
                : 'Sản phẩm tạm hết hàng'}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
