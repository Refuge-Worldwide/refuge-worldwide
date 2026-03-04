import Link from "next/link";
import { AiOutlineEdit } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { useCalendarAuth } from "@refuge-worldwide/calendar";
import calendarConfig from "../contentful-calendar.config";

export default function Edit({ id }: { id?: string }) {
  const pathname = usePathname();
  const { isAuthenticated } = useCalendarAuth(calendarConfig);

  if (id && isAuthenticated)
    return (
      <Link
        className={`absolute ${
          pathname == "/" ? "mt-[58px] sm:mt-28 " : "mt-4"
        } right-6 rounded-full border border-black bg-white p-3 shadow-md z-10`}
        href={`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries/${id}`}
        target="_blank"
      >
        <AiOutlineEdit size={20} aria-label="Edit" />
      </Link>
    );
}
