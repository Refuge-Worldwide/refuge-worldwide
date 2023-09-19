import create from "zustand";

export enum ActivePlayer {
  MIXCLOUD,
  RADIO_CO,
  SOUNDCLOUD,
}

interface GlobalStore {
  activePlayer: ActivePlayer | undefined;
  activePlayerSet: (activePlayer: ActivePlayer) => void;

  showKey: string | undefined;
  showKeySet: (showKey: string) => void;

  showUrl: string | undefined;
  showUrlSet: (showKey: string) => void;
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  activePlayer: undefined,
  activePlayerSet: (activePlayer) => set({ activePlayer }),

  showKey: undefined,
  showKeySet: (showKey) =>
    set({
      activePlayer: ActivePlayer.MIXCLOUD,
      showKey,
    }),

  showUrl: undefined,
  showUrlSet: (showUrl) =>
    set({
      activePlayer: showUrl.includes("soundcloud")
        ? ActivePlayer.SOUNDCLOUD
        : ActivePlayer.MIXCLOUD,
      showUrl,
    }),
}));
