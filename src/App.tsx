/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScreenType, ProductItem, CartItem, UserProfile, EmergencyContact, OrderInfo } from './types';
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
import { storageService } from './services/storageService';
import confetti from 'canvas-confetti';
import { Mic } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(() => {
    return storageService.hasCompletedOnboarding() ? 'home' : 'onboarding';
  });
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // User Profile state (loaded from persistent storage)
  const [user, setUser] = useState<UserProfile>(() => storageService.loadUserProfile());
  const [orders, setOrders] = useState<OrderInfo[]>(() => storageService.loadOrders());
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    setIsVip(updatedProfile.isVip ?? false);
    navigateTo('home');
  };

  const handleExploreGuest = () => {
    navigateTo('home');
  };

  // VIP Subscription state
  const [isVip, setIsVip] = useState(() => storageService.loadUserProfile().isVip);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');

  // Cart State (loaded from persistent storage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => storageService.loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Auto-sync cart to persistent storage
  useEffect(() => {
    storageService.saveCart(cartItems);
  }, [cartItems]);

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
    setUser((prev) => {
      const updated = { ...prev, avatar: newAvatarUrl };
      storageService.saveUserProfile(updated);
      return updated;
    });
  };

  const handleUpdateUser = (updatedInfo: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedInfo };
      storageService.saveUserProfile(updated);
      return updated;
    });
  };

  const handleAddEmergencyContact = (contact: EmergencyContact) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        emergencyContacts: [contact, ...prev.emergencyContacts],
      };
      storageService.saveUserProfile(updated);
      return updated;
    });
  };

  const handleDeleteEmergencyContact = (id: string) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== id),
      };
      storageService.saveUserProfile(updated);
      return updated;
    });
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    storageService.saveUserProfile(loggedInUser);
    setUser(loggedInUser);
    setIsVip(loggedInUser.isVip);
    navigateTo('home');
  };

  const handleLogout = () => {
    navigateTo('login');
  };

  const handlePaymentSuccess = () => {
    setIsVip(true);
    setUser((prev) => {
      const updated = { ...prev, isVip: true };
      storageService.saveUserProfile(updated);
      return updated;
    });
    setCartItems([]);
    storageService.saveCart([]);
    navigateTo('home');
  };

  const handleOrderSuccess = (newOrder: OrderInfo) => {
    const updatedOrders = storageService.saveOrder(newOrder);
    setOrders(updatedOrders);
    setCartItems([]);
    storageService.saveCart([]);
  };

  const handleResetData = () => {
    const fresh = storageService.resetAllUserData();
    setUser(fresh);
    setIsVip(fresh.isVip);
    setOrders(storageService.loadOrders());
    setCartItems(storageService.loadCart());
  };

  const handleImportData = (importedUser: UserProfile) => {
    setUser(importedUser);
    setIsVip(importedUser.isVip);
    setOrders(storageService.loadOrders());
    setCartItems(storageService.loadCart());
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
              <OnboardingScreen
                onComplete={handleOnboardingComplete}
                onExploreGuest={handleExploreGuest}
                onOpenLogin={() => navigateTo('login')}
              />
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
                user={user}
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
                orders={orders}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigateTo(previousScreen === 'profile' ? 'home' : previousScreen)}
                onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
                onNavigateToEmergency={() => navigateTo('emergency')}
                onNavigateToPayment={() => navigateTo('payment')}
                onNavigateToOrderInfo={() => navigateTo('order_info')}
                onResetData={handleResetData}
                onImportData={handleImportData}
                onReopenOnboarding={() => navigateTo('onboarding')}
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
                onDeleteContact={handleDeleteEmergencyContact}
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
                onOrderSuccess={(order) => handleOrderSuccess(order)}
                onUpdateUserAddresses={(addresses) => {
                  setUser((prev) => {
                    const updated = { ...prev, shippingAddresses: addresses };
                    storageService.saveUserProfile(updated);
                    return updated;
                  });
                }}
                onUpdateCart={(items) => setCartItems(items)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Nova AI Quick Assistant Pill */}
      {showBottomNav && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigateTo('chat')}
          className="absolute bottom-16 right-4 z-40 bg-gradient-to-tr from-[#B53E3E] via-[#C84B4B] to-[#E0564A] text-white px-3.5 py-2 rounded-full shadow-lg shadow-[#C84B4B]/35 flex items-center gap-2 border border-white/30 cursor-pointer active:scale-95 group backdrop-blur-xs"
          title="Trò chuyện với Trợ lý Nova AI"
        >
          <div className="relative">
            <Mic className="w-4 h-4 stroke-[2.5]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#2ECC71] rounded-full ring-1 ring-white" />
          </div>
          <span className="text-[11.5px] font-bold tracking-tight">Hỏi Nova AI</span>
        </motion.button>
      )}

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

