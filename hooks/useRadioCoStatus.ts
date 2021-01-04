import useSWR from "swr";
import { RadioCoInterface } from "../types/shared";

const getRadioCoStatus = async (_: any, stationId: string) => {
  const URL = `https://public.radio.co/stations/${stationId}/status`;

  const res = await fetch(URL);

  return res.json();
};

export default function useRadioCoStatus(stationId: string) {
  return useSWR<RadioCoInterface>(["RadioCo", stationId], getRadioCoStatus, {
    /**
     * @note Refresh the radio data every 30s
     */
    // refreshInterval: 30 * 1000,
  });
}
