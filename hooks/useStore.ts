import create from "zustand";
import Cookies from "js-cookie";

export enum ActivePlayer {
  CH1,
  CH2,
  MIXCLOUD,
  SOUNDCLOUD,
  YOUTUBE,
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
      activePlayer: archivePlayerType(showUrl),
      showUrl,
    }),
}));

const archivePlayerType = (showUrl) => {
  if (showUrl.includes("soundcloud")) {
    return ActivePlayer.SOUNDCLOUD;
  }
  if (showUrl.includes("youtube")) {
    return ActivePlayer.YOUTUBE;
  }
  return ActivePlayer.MIXCLOUD;
};
