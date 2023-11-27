import create from "zustand";
import Cookies from "js-cookie";

export enum ActivePlayer {
  MIXCLOUD,
  RADIO_CO,
  SOUNDCLOUD,
}

interface GlobalStore {
  activePlayer: ActivePlayer | undefined;
  activePlayerSet: (activePlayer: ActivePlayer) => void;

  showUrl: string | undefined;
  showUrlSet: (showKey: string) => void;
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  activePlayer: undefined,
  activePlayerSet: (activePlayer) => set({ activePlayer }),

  showUrl: undefined,
  showUrlSet: (showUrl) =>
    set({
      activePlayer: showUrl.includes("soundcloud")
        ? ActivePlayer.SOUNDCLOUD
        : ActivePlayer.MIXCLOUD,
      showUrl,
    }),
}));
