import dayjs from "dayjs";

export default function Date({
  dateString,
  formatString = "DD MMM YYYY",
}: {
  dateString: string;
  formatString?: string;
}) {
  return (
    <time dateTime={dateString}>{dayjs(dateString).format(formatString)}</time>
  );
}
