/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScreenType, ProductItem, CartItem } from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CarePlanScreen } from './components/screens/CarePlanScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { VoiceChatScreen } from './components/screens/VoiceChatScreen';
import { CommunityScreen } from './components/screens/CommunityScreen';
import { VideoShortsScreen } from './components/screens/VideoShortsScreen';
import { CartModal } from './components/CartModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { VipSubscriptionModal } from './components/VipSubscriptionModal';
import { PRODUCTS_DATA } from './data/mockData';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // VIP Subscription state
  const [isVip, setIsVip] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: PRODUCTS_DATA[0], quantity: 1 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Navigation handler: fast, responsive and seamless
  const navigateTo = (newScreen: ScreenType) => {
    if (newScreen === activeScreen) return;
    setPreviousScreen(activeScreen);
    setActiveScreen(newScreen);
  };

  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleCheckout = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C84B4B', '#FCEEEB', '#2ECC71'],
      });
    } catch {
      // ignore
    }
    setIsCartOpen(false);
    setCartItems([]);
  };

  // Instant, rock-solid iOS view transitions (Zero blur lag, zero delay)
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.99,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.18,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  const showBottomNav = activeScreen !== 'onboarding' && activeScreen !== 'chat';

  return (
    <PhoneFrame
      activeScreen={activeScreen}
      isVoiceListening={isVoiceListening}
      onResetOnboarding={() => navigateTo('onboarding')}
      onOpenVoiceChat={() => navigateTo('chat')}
    >
      {/* Dynamic Screen Viewport with Reliable Apple Transitions */}
      <div className="flex-1 relative flex flex-col overflow-hidden w-full h-full bg-[#FFFBF7]">
        <AnimatePresence initial={false}>
          {activeScreen === 'onboarding' && (
            <motion.div
              key="onboarding"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <OnboardingScreen onStart={() => navigateTo('home')} />
            </motion.div>
          )}

          {activeScreen === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <HomeScreen
                onOpenVoiceChat={() => navigateTo('chat')}
                onNavigateToCare={() => navigateTo('care')}
                onOpenNotifications={() => setIsNotificationOpen(true)}
                onOpenVipModal={() => setIsVipModalOpen(true)}
                isVip={isVip}
              />
            </motion.div>
          )}

          {activeScreen === 'video' && (
            <motion.div
              key="video"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full bg-black"
            >
              <VideoShortsScreen onOpenVipModal={() => setIsVipModalOpen(true)} />
            </motion.div>
          )}

          {activeScreen === 'care' && (
            <motion.div
              key="care"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <CarePlanScreen />
            </motion.div>
          )}

          {activeScreen === 'community' && (
            <motion.div
              key="community"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <CommunityScreen />
            </motion.div>
          )}

          {activeScreen === 'shop' && (
            <motion.div
              key="shop"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <ShopScreen
                onOpenCart={() => setIsCartOpen(true)}
                cartCount={cartCount}
                onAddToCart={handleAddToCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                isVip={isVip}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            </motion.div>
          )}

          {activeScreen === 'chat' && (
            <motion.div
              key="chat"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <VoiceChatScreen
                onBack={() => navigateTo(previousScreen === 'chat' ? 'home' : previousScreen)}
                isListening={isVoiceListening}
                setIsListening={setIsVoiceListening}
                isVip={isVip}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Bottom Navigation Bar */}
      {showBottomNav && (
        <BottomNavBar
          activeScreen={activeScreen}
          onSelectTab={navigateTo}
          cartCount={cartCount}
        />
      )}

      {/* Global Modals & Sheets */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isVip={isVip}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <VipSubscriptionModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        isVip={isVip}
        onSubscribe={() => setIsVip(true)}
      />
    </PhoneFrame>
  );
}
