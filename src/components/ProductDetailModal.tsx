import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductItem } from '../types';
import { X, Star, CheckCircle, ShieldCheck, ShoppingBag, Plus } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[90%] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9] overflow-y-auto no-scrollbar"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Image */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F4] mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Price */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h2 className="text-[18px] font-bold text-[#3A2E2B] leading-snug">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center text-[#F39C12]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs font-bold text-[#3A2E2B] tabular-nums">
                  {product.rating}
                </span>
                <span className="text-xs text-[#8C7B75]">
                  ({product.reviewsCount} đánh giá)
                </span>
              </div>
            </div>

            <span className="text-[20px] font-extrabold text-[#C84B4B] tabular-nums">
              {product.formattedPrice}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[#6E5D57] leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Key Benefits */}
          <div className="bg-[#FAF7F4] rounded-2xl p-3.5 border border-[#EDE7E2] mb-5">
            <h3 className="text-xs font-bold text-[#3A2E2B] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
              <span>Đặc điểm nổi bật cho mẹ bầu</span>
            </h3>
            <ul className="space-y-1.5">
              {product.benefits.map((b, idx) => (
                <li key={idx} className="text-xs text-[#6E5D57] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C84B4B]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Add to Cart CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="w-full py-3.5 bg-[#C84B4B] hover:bg-[#B84040] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Thêm vào giỏ hàng · {product.formattedPrice}</span>
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
