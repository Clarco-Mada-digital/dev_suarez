'use client';

type Event = {
  name: string;
  path: string;
  referrer: string;
  timestamp: number;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  // Ajoutez d'autres propriétés selon vos besoins
};

class AnalyticsService {
  private static instance: AnalyticsService;
  private apiUrl: string = '/api/analytics';
  private sessionId: string = '';
  private lastPageView: string = '';
  private readonly IGNORED_PATHS = ['/admin', '/api', '/_next'];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.sessionId = this.getOrCreateSessionId();
      this.setupAutoPageView();
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private shouldTrack(path: string): boolean {
    return !this.IGNORED_PATHS.some(ignoredPath => 
      path.startsWith(ignoredPath)
    );
  }

  private async trackEvent(event: Omit<Event, 'timestamp'>): Promise<void> {
    const fullEvent: Event = {
      ...event,
      timestamp: Date.now(),
    };

    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...fullEvent,
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  public async trackPageView(path: string, referrer: string = document.referrer): Promise<void> {
    if (!this.shouldTrack(path) || path === this.lastPageView) {
      return;
    }

    this.lastPageView = path;

    await this.trackEvent({
      name: 'page_view',
      path,
      referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
    });
  }

  public async trackCustomEvent(name: string, data: Record<string, any> = {}): Promise<void> {
    await this.trackEvent({
      name,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      ...data,
    });
  }

  private setupAutoPageView(): void {
    if (typeof window === 'undefined') return;

    // Track initial page view
    this.trackPageView(window.location.pathname);

    // Track subsequent route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const handlePushReplace = (data: any, unused: string, url?: string | URL | null) => {
      if (url) {
        const path = typeof url === 'string' ? new URL(url, window.location.origin).pathname : url.pathname;
        if (this.shouldTrack(path)) {
          this.trackPageView(path, window.location.href);
        }
      }
    };

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handlePushReplace(args[0], args[1], args[2]);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handlePushReplace(args[0], args[1], args[2]);
    };

    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname, document.referrer);
    });
  }
}

export const analytics = AnalyticsService.getInstance();
