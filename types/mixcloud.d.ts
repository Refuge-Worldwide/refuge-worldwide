export declare function PlayerWidget(
  target: HTMLIFrameElement
): PlayerWidgetReturnType;

export interface PlayerWidgetReturnType {
  events: {
    buffering: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    ended: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    error: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    pause: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    play: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    progress: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
  };
  load: (cloudcastKey: string, startPlaying: boolean) => Promise<unknown>;
  getCurrentKey: () => Promise<string>;
  getDuration: () => Promise<number>;
  getIsPaused: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getVolume: () => Promise<number>;
  pause: () => Promise<void>;
  play: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  ready: Promise<void>;
}
