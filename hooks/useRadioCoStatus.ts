import useSWR from "swr";

export interface RadioCoInterface {
  status: "online" | "offline";
  source: {
    type: string;
    collaborator?: any;
    relay?: any;
  };
  collaborators: any[];
  relays: any[];
  current_track: {
    title: string;
    start_time: string;
    artwork_url: string;
    artwork_url_large: string;
  };
  history: { title: string }[];
  logo_url: string;
  streaming_hostname: string;
  outputs: {
    name: string;
    format: string;
    bitrate: number;
  }[];
}

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
