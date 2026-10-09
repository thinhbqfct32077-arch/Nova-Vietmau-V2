import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Crown } from 'lucide-react';

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
          className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[85%] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9]"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C84B4B]" />
              <h2 className="text-[17px] font-bold text-[#3A2E2B]">
                Giỏ hàng của mẹ ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar max-h-[340px]">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-[#8C7B75]">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-[#D1C5BF] stroke-[1.5]" />
                <p className="text-sm font-medium">Giỏ hàng đang trống</p>
                <p className="text-xs text-[#A89A94] mt-1">
                  Mẹ hãy dạo một vòng Cửa hàng Nova nhé!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF7F4] border border-[#F0ECE9]"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white"
                  />
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-[#3A2E2B] line-clamp-2 leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-xs font-bold text-[#C84B4B] mt-0.5">
                      {item.product.formattedPrice}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-[#3A2E2B]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-[#3A2E2B]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-[#A89A94] hover:text-[#C84B4B] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              {isVip && (
                <div className="flex items-center justify-between text-xs text-[#B38728] font-bold bg-[#FDF5E6] px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Đặc quyền VIP giảm 10%:
                  </span>
                  <span>-{formattedDiscount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8C7B75] font-medium">Tổng thanh toán:</span>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-[#C84B4B] tabular-nums">
                    {formattedFinal}
                  </span>
                  {isVip && (
                    <span className="text-xs text-[#8C7B75] line-through block -mt-1">
                      {formattedRaw}
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCheckout}
                className="w-full py-3.5 bg-[#C84B4B] hover:bg-[#B84040] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
