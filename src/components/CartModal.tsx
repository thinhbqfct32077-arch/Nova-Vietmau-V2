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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet / Dialog */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg max-h-[85vh] bg-nova-bg rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col z-10 border border-nova-border"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-nova-taupe/40 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-nova-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-nova-accent-soft border border-nova-border flex items-center justify-center text-nova-accent">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <h2 className="font-editorial text-[19px] font-bold text-nova-text tabular-nums">
                Giỏ hàng của mẹ ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng giỏ hàng"
              className="w-9 h-9 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center hover:bg-nova-accent-soft transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3.5 space-y-3 no-scrollbar max-h-[360px]">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-nova-text-muted">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-nova-bg-subtle border border-nova-border flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-nova-icon stroke-[1.5]" />
                </div>
                <p className="font-editorial text-[16px] font-semibold text-nova-text">
                  Giỏ hàng đang trống
                </p>
                <p className="text-xs text-nova-text-muted mt-1">
                  Mẹ hãy dạo một vòng Cửa hàng Nova nhé!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-nova-surface border border-nova-border"
                >
                  <NovaImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-nova-bg-subtle shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-nova-text line-clamp-2 leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-xs font-bold text-nova-accent mt-0.5 tabular-nums">
                      {item.product.formattedPrice}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        aria-label="Giảm số lượng"
                        className="w-7 h-7 rounded-lg bg-nova-bg border border-nova-border flex items-center justify-center text-nova-text hover:border-nova-taupe cursor-pointer transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-nova-text tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        aria-label="Tăng số lượng"
                        className="w-7 h-7 rounded-lg bg-nova-bg border border-nova-border flex items-center justify-center text-nova-text hover:border-nova-taupe cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label="Xóa sản phẩm"
                    className="p-2 text-nova-icon hover:text-nova-danger cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="pt-3.5 border-t border-nova-border flex flex-col gap-3">
              {isVip && (
                <div className="flex items-center justify-between text-xs text-nova-accent font-bold bg-nova-accent-soft px-3 py-2 rounded-xl border border-nova-border tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Đặc quyền VIP giảm 10%
                  </span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-nova-text-muted font-medium">Tổng thanh toán:</span>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-nova-accent tabular-nums">
                    {formattedFinal}
                  </span>
                  {isVip && (
                    <span className="text-xs text-nova-text-muted line-through block -mt-0.5 tabular-nums">
                      {formattedRaw}
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onCheckout}
                className="w-full min-h-[46px] py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
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
