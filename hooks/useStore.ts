import create from "zustand";

export enum ActivePlayer {
  CH1,
  CH2,
  MIXCLOUD,
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
