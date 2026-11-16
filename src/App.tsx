/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { JourneyScreen } from './components/screens/JourneyScreen';
import { WeeklyScreen } from './components/screens/WeeklyScreen';
import { ChecklistScreen } from './components/screens/ChecklistScreen';
import { MemoriesScreen } from './components/screens/MemoriesScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { FamilyScreen } from './components/screens/FamilyScreen';
import { BirthPlanScreen } from './components/screens/BirthPlanScreen';
import { PostpartumBabyScreen } from './components/screens/PostpartumBabyScreen';
import { RewardsScreen } from './components/screens/RewardsScreen';
import { AdminDashboardScreen } from './components/screens/AdminDashboardScreen';
import { AvatarModal } from './components/AvatarModal';
import { CartModal } from './components/CartModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { VipSubscriptionModal } from './components/VipSubscriptionModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { storageService, ThemeMode, FontScale } from './services/storageService';
import { apiService } from './services/apiService';
import { Mic } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(() => {
    return storageService.hasCompletedOnboarding() ? 'home' : 'onboarding';
  });
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // User Profile & Orders state (loaded from persistent storage)
  const [user, setUser] = useState<UserProfile>(() => storageService.loadUserProfile());
  const [orders, setOrders] = useState<OrderInfo[]>(() => storageService.loadOrders());
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Theme & Font Scale preferences
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => storageService.getThemeMode());
  const [fontScale, setFontScale] = useState<FontScale>(() => storageService.getFontScale());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // VIP Subscription state
  const [isVip, setIsVip] = useState(() => storageService.loadUserProfile().isVip);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');

  // Cart & Modals State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => storageService.loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(
    () => storageService.loadNotifications().filter((n) => !n.isRead).length
  );

  // Cross-screen Deep-Link Focus Targets
  const [focusVideoId, setFocusVideoId] = useState<string | null>(null);
  const [focusPostId, setFocusPostId] = useState<string | null>(null);
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);
  const [focusWeek, setFocusWeek] = useState<number | null>(null);
  const [focusArticleId, setFocusArticleId] = useState<string | null>(null);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Apply theme & fontScale to document root on startup and updates
  useEffect(() => {
    storageService.setThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    storageService.setFontScale(fontScale);
  }, [fontScale]);

  // Network online/offline listeners
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Bootstrap HMAC-signed session token for authenticated accounts & refresh unread notifications count
  useEffect(() => {
    if (!user.id || user.id === 'usr-guest') {
      apiService.clearSession();
      return;
    }
    let cancelled = false;
    apiService
      .ensureSession(user)
      .then(({ user: serverUser }) => {
        if (cancelled) return;
        if (serverUser && serverUser.role && serverUser.role !== user.role) {
          setUser((prev) => {
            const next = { ...prev, role: serverUser.role };
            storageService.saveUserProfile(next);
            return next;
          });
        }
        return apiService.fetchNotifications('all', serverUser || user);
      })
      .then((serverNotifs) => {
        if (cancelled || !Array.isArray(serverNotifs)) return;
        const localUnread = storageService.loadNotifications().filter((n) => !n.isRead).length;
        const serverUnread = serverNotifs.filter((n) => !n.isRead).length;
        setUnreadNotificationsCount(localUnread + serverUnread);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  // Auto-sync cart to persistent storage
  useEffect(() => {
    storageService.saveCart(cartItems);
  }, [cartItems]);

  // Navigation handler: fast, responsive and seamless
  const navigateTo = useCallback(
    (newScreen: ScreenType) => {
      if (newScreen === activeScreen) return;
      setPreviousScreen(activeScreen);
      setActiveScreen(newScreen);
    },
    [activeScreen]
  );

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    setIsVip(updatedProfile.isVip ?? false);
    navigateTo('home');
  };

  const handleExploreGuest = () => {
    navigateTo('home');
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
    apiService.clearSession();
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

  const handleAccountDeleted = () => {
    apiService.clearSession();
    handleResetData();
    navigateTo('login');
  };

  const handleImportData = (importedUser: UserProfile) => {
    setUser(importedUser);
    setIsVip(importedUser.isVip);
    setOrders(storageService.loadOrders());
    setCartItems(storageService.loadCart());
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
      user={user}
      isVip={isVip}
      cartCount={cartCount}
      unreadNotificationsCount={unreadNotificationsCount}
      themeMode={themeMode}
      onToggleTheme={handleToggleTheme}
      onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
      onOpenNotifications={() => setIsNotificationOpen(true)}
      isOnline={isOnline}
      onOpenEmergency={() => navigateTo('emergency')}
      onOpenVipModal={() => setIsVipModalOpen(true)}
    >
      {/* Dynamic Screen Viewport with Reliable Apple Transitions */}
      <div className="flex-1 relative flex flex-col overflow-hidden w-full h-full bg-[#FAF6F0] dark:bg-[#161311]">
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
                onNavigateScreen={navigateTo}
                onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
                themeMode={themeMode}
                onToggleTheme={handleToggleTheme}
                unreadNotificationsCount={unreadNotificationsCount}
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
              <VideoShortsScreen
                user={user}
                focusVideoId={focusVideoId}
                onClearFocusVideo={() => setFocusVideoId(null)}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
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
              <CarePlanScreen user={user} onNavigate={navigateTo} />
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
              <CommunityScreen
                user={user}
                focusPostId={focusPostId}
                focusCommentId={focusCommentId}
                onClearFocusTarget={() => {
                  setFocusPostId(null);
                  setFocusCommentId(null);
                }}
                onUpdateUser={(updatedUser) => {
                  setUser(updatedUser);
                  storageService.saveUserProfile(updatedUser);
                }}
              />
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
                user={user}
                orders={orders}
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
                onNavigateScreen={navigateTo}
                themeMode={themeMode}
                onChangeTheme={setThemeMode}
                fontScale={fontScale}
                onChangeFontScale={setFontScale}
                onResetData={handleResetData}
                onImportData={handleImportData}
                onReopenOnboarding={() => navigateTo('onboarding')}
                onAccountDeleted={handleAccountDeleted}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

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
                user={user}
                onBack={() => navigateTo(previousScreen === 'payment' ? 'home' : previousScreen)}
                onPaymentSuccess={handlePaymentSuccess}
                onNavigateToOrderInfo={() => navigateTo('order_info')}
                cartItems={cartItems}
                defaultPlan={paymentPlan}
              />
            </motion.div>
          )}

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

          {activeScreen === 'journey' && (
            <motion.div
              key="journey"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <JourneyScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigateTo('home')}
                onOpenWeek={(week) => {
                  setFocusWeek(week);
                  navigateTo('weekly');
                }}
                onNavigateScreen={navigateTo}
              />
            </motion.div>
          )}

          {activeScreen === 'weekly' && (
            <motion.div
              key="weekly"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <WeeklyScreen
                user={user}
                initialWeek={focusWeek ?? user.pregnancyWeek}
                onBack={() => navigateTo('home')}
                onNavigateScreen={(screen, meta) => {
                  if (meta?.videoId) setFocusVideoId(meta.videoId);
                  if (meta?.articleId) setFocusArticleId(meta.articleId);
                  navigateTo(screen);
                }}
              />
            </motion.div>
          )}

          {activeScreen === 'checklist' && (
            <motion.div
              key="checklist"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <ChecklistScreen user={user} onBack={() => navigateTo('home')} />
            </motion.div>
          )}

          {activeScreen === 'memories' && (
            <motion.div
              key="memories"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <MemoriesScreen user={user} onBack={() => navigateTo('home')} />
            </motion.div>
          )}

          {activeScreen === 'report' && (
            <motion.div
              key="report"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <ReportScreen user={user} onBack={() => navigateTo('home')} />
            </motion.div>
          )}

          {activeScreen === 'library' && (
            <motion.div
              key="library"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <LibraryScreen
                user={user}
                focusArticleId={focusArticleId}
                onClearFocusArticle={() => setFocusArticleId(null)}
              />
            </motion.div>
          )}

          {activeScreen === 'family' && (
            <motion.div
              key="family"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <FamilyScreen user={user} />
            </motion.div>
          )}

          {activeScreen === 'birth_plan' && (
            <motion.div
              key="birth_plan"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <BirthPlanScreen user={user} onBack={() => navigateTo('home')} />
            </motion.div>
          )}

          {activeScreen === 'postpartum' && (
            <motion.div
              key="postpartum"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <PostpartumBabyScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigateTo('home')}
              />
            </motion.div>
          )}

          {activeScreen === 'rewards' && (
            <motion.div
              key="rewards"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <RewardsScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigateTo('home')}
              />
            </motion.div>
          )}

          {activeScreen === 'admin' && (
            <motion.div
              key="admin"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col w-full h-full"
            >
              <AdminDashboardScreen user={user} onBack={() => navigateTo('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Nova AI Quick Companion Trigger */}
      {showBottomNav && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          type="button"
          onClick={() => navigateTo('chat')}
          className="no-print absolute bottom-[calc(4.65rem+env(safe-area-inset-bottom,0px))] right-4 z-40 bg-[#263E35] hover:bg-[#1E312A] dark:bg-[#B55841] text-[#FAF6F0] px-3.5 py-2.5 rounded-full ios-float-shadow flex items-center gap-2 border border-[#C4A46B]/40 cursor-pointer active:scale-95 md:hidden min-h-[44px]"
          title="Tâm sự cùng Trợ lý Nova AI"
        >
          <Mic className="w-4 h-4 stroke-[2.2] text-[#D7BA86] dark:text-white shrink-0" />
          <span className="text-[11.5px] font-semibold tracking-tight whitespace-nowrap">Hỏi Nova AI</span>
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
        user={user}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        user={user}
        onClose={() => setIsNotificationOpen(false)}
        onNavigateScreen={(screen) => navigateTo(screen)}
        onUnreadCountChange={(count) => setUnreadNotificationsCount(count)}
        onNavigateNotification={(notif) => {
          if (notif.category === 'video' && notif.targetId) {
            setFocusVideoId(notif.targetId);
            navigateTo('video');
          } else if (notif.category === 'community' && notif.targetId) {
            setFocusPostId(notif.targetId);
            setFocusCommentId(notif.commentId || null);
            navigateTo('community');
          } else if (notif.actionScreen) {
            navigateTo(notif.actionScreen);
          }
        }}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        user={user}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={(screen, meta) => {
          if (meta?.week) setFocusWeek(meta.week);
          if (meta?.articleId) setFocusArticleId(meta.articleId);
          if (meta?.videoId) setFocusVideoId(meta.videoId);
          if (meta?.postId) setFocusPostId(meta.postId);
          if (meta?.product) setSelectedProduct(meta.product);
          navigateTo(screen);
        }}
      />

      <VipSubscriptionModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        isVip={isVip}
        onSubscribe={() => {
          setIsVip(true);
          setUser((prev) => {
            const updated = { ...prev, isVip: true };
            storageService.saveUserProfile(updated);
            return updated;
          });
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
