import { PlayerWidget } from "./mixcloud";

declare global {
  interface Window {
    Mixcloud: {
      PlayerWidget: PlayerWidget;
    };
  }
}
