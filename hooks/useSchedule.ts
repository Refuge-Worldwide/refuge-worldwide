import useSWR from "swr";
import { ScheduleShow } from "../types/shared";

type Schedule = {
  status: "online" | "offline";
  liveNow: {
    title: string;
    artwork: string;
    slug?: string;
    isMixedFeelings?: boolean;
  };
  nextUp: Array<ScheduleShow>;
  schedule: Array<ScheduleShow>;
};

async function getSchedule(url: URL) {
  const res = await fetch(url);

  return res.json();
}

export default function useSchedule() {
  const { data, error, isLoading } = useSWR<Schedule, Error>(
    "/api/schedule",
    getSchedule,
    {
      refreshInterval: 30 * 1000,
    }
  );

  return {
    scheduleData: data,
    isLoading,
    error: error,
  };
}
