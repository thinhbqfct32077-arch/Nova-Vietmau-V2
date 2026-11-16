import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Crown } from 'lucide-react';
import { NovaImage } from './NovaBrandMark';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  isVip?: boolean;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isVip = false,
}) => {
  if (!isOpen) return null;

  const rawTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = isVip ? Math.round(rawTotal * 0.1) : 0;
  const finalTotal = rawTotal - discount;

  const formattedRaw = rawTotal.toLocaleString('vi-VN') + 'đ';
  const formattedDiscount = discount.toLocaleString('vi-VN') + 'đ';
  const formattedFinal = finalTotal.toLocaleString('vi-VN') + 'đ';

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#161311]/55 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[85%] bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#E6DDD1] dark:border-[#362E2A]"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-[#D6CCC0] dark:bg-[#4A403B] rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] flex items-center justify-center text-[#B55841] dark:text-[#D47A63]">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <h2 className="font-editorial text-[19px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                Giỏ hàng của mẹ ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng giỏ hàng"
              className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center hover:bg-[#E6DDD1] dark:hover:bg-[#2F2824] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3.5 space-y-3 no-scrollbar max-h-[340px]">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-[#786962] dark:text-[#B5A89F]">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#B5A89F] dark:text-[#786962] stroke-[1.5]" />
                </div>
                <p className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Giỏ hàng đang trống
                </p>
                <p className="text-xs text-[#786962] dark:text-[#B5A89F] mt-1">
                  Mẹ hãy dạo một vòng Cửa hàng Nova nhé!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]"
                >
                  <NovaImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#F2ECE3] dark:bg-[#1E1A17] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] line-clamp-2 leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] mt-0.5 tabular-nums">
                      {item.product.formattedPrice}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        aria-label="Giảm số lượng"
                        className="w-7 h-7 rounded-lg bg-[#FAF6F0] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] hover:border-[#B55841] cursor-pointer transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        aria-label="Tăng số lượng"
                        className="w-7 h-7 rounded-lg bg-[#FAF6F0] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] hover:border-[#B55841] cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label="Xóa sản phẩm"
                    className="p-2 text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="pt-3.5 border-t border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-3">
              {isVip && (
                <div className="flex items-center justify-between text-xs text-[#9E5B3B] dark:text-[#D7BA86] font-bold bg-[#F6EFE2] dark:bg-[#2F281C] px-3 py-2 rounded-xl border border-[#E5D4B3] dark:border-[#4A3F2B] tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Đặc quyền VIP giảm 10%
                  </span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B5D56] dark:text-[#C5B9B0] font-medium">Tổng thanh toán:</span>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                    {formattedFinal}
                  </span>
                  {isVip && (
                    <span className="text-xs text-[#786962] dark:text-[#B5A89F] line-through block -mt-0.5 tabular-nums">
                      {formattedRaw}
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full min-h-[46px] py-3 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
              >
                <span>Xác nhận đặt hàng</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

