/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScreenType, ProductItem, CartItem, UserProfile, EmergencyContact } from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CarePlanScreen } from './components/screens/CarePlanScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { VoiceChatScreen } from './components/screens/VoiceChatScreen';
import { CommunityScreen } from './components/screens/CommunityScreen';
import { VideoShortsScreen } from './components/screens/VideoShortsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { PaymentScreen } from './components/screens/PaymentScreen';
import { EmergencyScreen } from './components/screens/EmergencyScreen';
import { OrderInfoScreen } from './components/screens/OrderInfoScreen';
import { AvatarModal } from './components/AvatarModal';
import { CartModal } from './components/CartModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { VipSubscriptionModal } from './components/VipSubscriptionModal';
import { PRODUCTS_DATA, INITIAL_USER_PROFILE } from './data/mockData';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // User Profile state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // VIP Subscription state
  const [isVip, setIsVip] = useState(INITIAL_USER_PROFILE.isVip);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');

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

  const handleCheckoutFromCart = () => {
    setIsCartOpen(false);
    navigateTo('order_info');
  };

  const handleSelectAvatar = (newAvatarUrl: string) => {
    setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
  };

  const handleUpdateUser = (updatedInfo: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updatedInfo }));
  };

  const handleAddEmergencyContact = (contact: EmergencyContact) => {
    setUser((prev) => ({
      ...prev,
      emergencyContacts: [contact, ...prev.emergencyContacts],
    }));
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsVip(loggedInUser.isVip);
    navigateTo('home');
  };

  const handleLogout = () => {
    navigateTo('login');
  };

  const handlePaymentSuccess = () => {
    setIsVip(true);
    setUser((prev) => ({ ...prev, isVip: true }));
    setCartItems([]);
    navigateTo('home');
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

  const showBottomNav =
    activeScreen !== 'onboarding' &&
    activeScreen !== 'chat' &&
    activeScreen !== 'login' &&
    activeScreen !== 'payment' &&
    activeScreen !== 'order_info';

  return (
    <PhoneFrame
      activeScreen={activeScreen}
      isVoiceListening={isVoiceListening}
      onResetOnboarding={() => navigateTo('onboarding')}
      onOpenVoiceChat={() => navigateTo('chat')}
      onNavigateToScreen={(screen) => navigateTo(screen)}
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
                onOpenProfile={() => navigateTo('profile')}
                onOpenEmergency={() => navigateTo('emergency')}
                user={user}
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
                onNavigateToOrderInfo={() => navigateTo('order_info')}
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

          {/* New Profile Screen */}
          {activeScreen === 'profile' && (
            <motion.div
              key="profile"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <ProfileScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigateTo(previousScreen === 'profile' ? 'home' : previousScreen)}
                onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
                onNavigateToEmergency={() => navigateTo('emergency')}
                onNavigateToPayment={() => navigateTo('payment')}
                onNavigateToOrderInfo={() => navigateTo('order_info')}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {/* New Login Screen */}
          {activeScreen === 'login' && (
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <LoginScreen
                onBack={() => navigateTo('home')}
                onLoginSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}

          {/* New Payment Screen */}
          {activeScreen === 'payment' && (
            <motion.div
              key="payment"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <PaymentScreen
                onBack={() => navigateTo(previousScreen === 'payment' ? 'home' : previousScreen)}
                onPaymentSuccess={handlePaymentSuccess}
                cartItems={cartItems}
                defaultPlan={paymentPlan}
              />
            </motion.div>
          )}

          {/* New Emergency SOS Screen */}
          {activeScreen === 'emergency' && (
            <motion.div
              key="emergency"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <EmergencyScreen
                contacts={user.emergencyContacts}
                onAddContact={handleAddEmergencyContact}
                onBack={() => navigateTo(previousScreen === 'emergency' ? 'home' : previousScreen)}
              />
            </motion.div>
          )}

          {/* New Order Info Screen (Address, Phone, Shipping, Notes, Checkout) */}
          {activeScreen === 'order_info' && (
            <motion.div
              key="order_info"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <OrderInfoScreen
                user={user}
                cartItems={cartItems}
                onBack={() => navigateTo(previousScreen === 'order_info' ? 'shop' : previousScreen)}
                onNavigateToPayment={(_order) => {
                  navigateTo('payment');
                }}
                onOrderSuccess={(_order) => {
                  setCartItems([]);
                }}
                onUpdateUserAddresses={(addresses) => {
                  setUser((prev) => ({ ...prev, shippingAddresses: addresses }));
                }}
                onUpdateCart={(items) => setCartItems(items)}
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
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user.avatar}
        onSelectAvatar={handleSelectAvatar}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckoutFromCart}
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
        onSubscribe={() => {
          setIsVip(true);
          setUser((prev) => ({ ...prev, isVip: true }));
        }}
        onNavigateToPayment={() => {
          setIsVipModalOpen(false);
          setPaymentPlan('yearly');
          navigateTo('payment');
        }}
      />
    </PhoneFrame>
  );
}

