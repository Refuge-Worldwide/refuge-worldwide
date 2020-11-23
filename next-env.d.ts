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

export declare global {
  interface Window {
    Mixcloud: {
      FooterWidget: (showKey: string, FooterWidgetOptions) => Promise<{}>;
    };
  }
}
