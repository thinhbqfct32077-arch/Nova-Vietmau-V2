import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeScreen?: string;
  isVoiceListening?: boolean;
  onResetOnboarding?: () => void;
  onOpenVoiceChat?: () => void;
  onNavigateToScreen?: (screen: any) => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
}) => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#1A1817] flex flex-col items-center justify-center p-0 md:py-6 md:px-4 overflow-x-hidden font-sans">
      {/* Mobile-first viewport container:
          - Mobile (iOS/Android): Fullscreen 100dvh with native safe area insets
          - Desktop/Tablet (Windows/Mac/iPad): Elegant centered mobile viewport card (max-w-[440px])
      */}
      <div
        className="relative w-full max-w-[440px] h-[100dvh] md:h-[90vh] md:max-h-[920px] rounded-none md:rounded-[36px] bg-[#FFFBF7] text-[#3A2E2B] shadow-2xl flex flex-col overflow-hidden border-0 md:border md:border-[#2C2725]/20 md:ring-1 md:ring-white/10"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Main Content Area - naturally renders beneath native OS status bar / safe area */}
        <main className="flex-1 relative flex flex-col overflow-hidden bg-[#FFFBF7] w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
