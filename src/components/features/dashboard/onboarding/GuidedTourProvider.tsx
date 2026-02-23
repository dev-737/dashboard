'use client';

import { FilterIcon, Settings01Icon } from '@hugeicons/core-free-icons';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { GuidedTour } from './GuidedTour';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  actionText?: string;
  highlightPadding?: number;
  requiredRoute?: string; // Route where this step should be shown
  navigateToRoute?: string; // Route to navigate to before showing this step
}

interface GuidedTourContextType {
  isTourActive: boolean;
  currentTourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  canGoNextTour: boolean;
  canGoPreviousTour: boolean;
  tourProgress: number;
}

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(
  undefined
);

export function useGuidedTour() {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  }
  return context;
}

interface GuidedTourProviderProps {
  children: ReactNode;
}

export function GuidedTourProvider({ children }: GuidedTourProviderProps) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Define the guided tour steps for the dashboard
  const tourSteps: TourStep[] = useMemo(
    () => [
      {
        id: 'sidebar-navigation',
        title: 'Dashboard Navigation',
        description:
          'This is your main navigation sidebar. Use it to access different sections of your dashboard like hubs, settings, and moderation tools.',
        targetSelector: "[data-tour='sidebar']",
        position: 'right',
        action: 'none',
        highlightPadding: 12,
        requiredRoute: '/dashboard',
      },
      {
        id: 'create-hub-button',
        title: 'Create Your First Hub',
        description:
          'Click this button to create a new hub. Hubs are the core of InterChat - they connect multiple Discord servers together.',
        targetSelector: "[data-tour='create-hub']",
        position: 'bottom',
        action: 'click',
        actionText: 'Click to create hub',
        highlightPadding: 8,
        requiredRoute: '/dashboard',
        navigateToRoute: '/dashboard',
      },
      {
        id: 'hub-list',
        title: 'Your Hubs',
        description:
          "This area shows all the hubs you own or moderate. You can manage each hub's settings, view analytics, and customize their appearance.",
        targetSelector: "[data-tour='hub-list']",
        position: 'top',
        action: 'none',
        highlightPadding: 12,
        requiredRoute: '/dashboard',
      },
      {
        id: 'user-menu',
        title: 'User Settings01Icon',
        description:
          'Access your account settings, preferences, and logout options from this menu. You can also restart this tour anytime from the help menu.',
        targetSelector: "[data-tour='user-menu']",
        position: 'bottom',
        action: 'none', // Changed from click to none to avoid navigation issues
        actionText: 'Click to open menu',
        highlightPadding: 8,
      },
      {
        id: 'search-hubs',
        title: 'Discover Hubs',
        description:
          'Use the search functionality to discover and join existing hubs. This is a great way to connect with communities that match your interests.',
        targetSelector: "[data-tour='search-hubs']",
        position: 'left',
        action: 'none',
        highlightPadding: 8,
      },
      {
        id: 'notifications',
        title: 'Stay Updated',
        description:
          'Check your notifications here for important updates about your hubs, new connections, and system announcements.',
        targetSelector: "[data-tour='notifications']",
        position: 'bottom',
        action: 'none', // Changed from click to none to avoid navigation issues
        actionText: 'View notifications',
        highlightPadding: 8,
      },
    ],
    []
  );

  // FilterIcon steps based on current route or show all if no route requirement
  const getCurrentStepData = useCallback(() => {
    const step = tourSteps[currentTourStep];
    if (!step) return null;

    // If step has a required route and we're not on that route, skip it
    if (step.requiredRoute && !pathname.startsWith(step.requiredRoute)) {
      return null;
    }

    return step;
  }, [currentTourStep, pathname, tourSteps]);

  // Check if current step's target element exists
  const isCurrentStepValid = useCallback(() => {
    // Only run on client side
    if (typeof window === 'undefined') return false;

    const step = getCurrentStepData();
    if (!step) return false;

    const targetElement = document.querySelector(step.targetSelector);
    return !!targetElement;
  }, [getCurrentStepData]);

  const completeTour = useCallback(() => {
    localStorage.setItem('hasSeenGuidedTour', 'true');
    setIsTourActive(false);
  }, []);

  const nextTourStep = useCallback(async () => {
    if (currentTourStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentTourStep + 1];

      // Navigate to the required route if needed
      if (nextStep.navigateToRoute && pathname !== nextStep.navigateToRoute) {
        router.push(nextStep.navigateToRoute);
        // Wait a bit for navigation to complete
        setTimeout(() => {
          setCurrentTourStep(currentTourStep + 1);
        }, 500);
      } else {
        setCurrentTourStep(currentTourStep + 1);
      }
    } else {
      completeTour();
    }
  }, [currentTourStep, tourSteps, pathname, router, completeTour]);

  const startTour = () => {
    setCurrentTourStep(0);
    setIsTourActive(true);
  };

  const previousTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem('hasSeenGuidedTour', 'true');
    setIsTourActive(false);
  };

  const canGoNextTour = currentTourStep < tourSteps.length - 1;
  const canGoPreviousTour = currentTourStep > 0;
  const tourProgress = ((currentTourStep + 1) / tourSteps.length) * 100;

  // Auto-skip invalid steps when route changes or tour becomes active
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !isTourActive) return;

    const checkAndSkipInvalidSteps = () => {
      const step = getCurrentStepData();
      if (!step || !isCurrentStepValid()) {
        // If current step is invalid, try to move to next valid step
        if (canGoNextTour) {
          nextTourStep();
        } else {
          // No more steps, complete tour
          completeTour();
        }
      }
    };

    // Check after a short delay to allow DOM to update
    const timer = setTimeout(checkAndSkipInvalidSteps, 100);
    return () => clearTimeout(timer);
  }, [
    isTourActive,
    canGoNextTour,
    getCurrentStepData,
    isCurrentStepValid,
    nextTourStep,
    completeTour,
  ]);

  const contextValue: GuidedTourContextType = {
    isTourActive,
    currentTourStep,
    startTour,
    nextTourStep,
    previousTourStep,
    skipTour,
    completeTour,
    canGoNextTour,
    canGoPreviousTour,
    tourProgress,
  };

  return (
    <GuidedTourContext.Provider value={contextValue}>
      {children}
      {/* Only show tour if current step is valid and we're on client side */}
      {typeof window !== 'undefined' &&
        getCurrentStepData() &&
        isCurrentStepValid() && (
          <GuidedTour
            isActive={isTourActive}
            steps={tourSteps}
            currentStep={currentTourStep}
            onNext={nextTourStep}
            onPrevious={previousTourStep}
            onSkip={skipTour}
            onComplete={completeTour}
            canGoNext={canGoNextTour}
            canGoPrevious={canGoPreviousTour}
          />
        )}
    </GuidedTourContext.Provider>
  );
}
