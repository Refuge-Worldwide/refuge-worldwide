import dayjs from "dayjs";

export default function Date({
  dateString,
  formatString = "MMMM DD, YYYY",
}: {
  dateString: string;
  formatString?: string;
}) {
  return (
    <time dateTime={dateString}>{dayjs(dateString).format(formatString)}</time>
  );
}
