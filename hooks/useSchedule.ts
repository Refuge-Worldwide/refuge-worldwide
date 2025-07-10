import useSWR from "swr";
import { ScheduleShow } from "../types/shared";
import { useEffect } from "react";

type Schedule = {
  status: "online" | "offline";
  liveNow: {
    title: string;
    artwork: string;
    link?: string;
    slug?: string;
    isMixedFeelings?: boolean;
  };
  nextUp: Array<ScheduleShow>;
  schedule: Array<ScheduleShow>;
  ch2: {
    status: "online" | "offline";
    liveNow: string;
  };
};

async function getSchedule(url: URL) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export default function useSchedule() {
  const { data, error, isLoading } = useSWR<Schedule, Error>(
    "/api/schedule",
    getSchedule,
    {
      refreshInterval: 30 * 1000,
      refreshWhenHidden: true,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force revalidation when tab becomes visible
        console.log("Tab is visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    scheduleData: data,
    isLoading,
    error,
  };
}
