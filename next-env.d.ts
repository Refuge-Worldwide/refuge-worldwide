/// <reference types="next" />
/// <reference types="next/types/global" />

interface FooterWidgetOptions {
  disablePushstate: boolean;
  disableUnloadWarning: boolean;
  disableHotkeys: boolean;
  hide_artwork: boolean;
  light: boolean;
  autoplay: boolean;
}

interface WidgetInterface {
  ready: any;
  load: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
}

export declare global {
  interface Window {
    Mixcloud: {
      FooterWidget: (showKey: string, FooterWidgetOptions) => Promise<Void>;
      PlayerWidget: (element: HTMLElement) => WidgetInterface;
    };
  }
}
