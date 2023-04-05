import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function LocalTime({ dateTime }: { dateTime: string }) {
  const utc = dayjs(dateTime).utc();
  const local = utc.local();
  const time = local.format("HH:mm");

  return <time dateTime={utc.toISOString()}>{time}</time>;
}
