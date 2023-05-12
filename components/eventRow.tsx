import { Arrow } from "../icons/arrow";
import Badge from "./badge";
import Date from "./date";
import Link from "next/link";
export default function EventRow({ event }) {
  return (
    <li className="border-t border-black p-5 lg:grid grid-cols-12 lg:gap-x-4 px-4 sm:px-8">
      <div className="hidden lg:block lg:col-span-1 text-small">
        <Date dateString={event.date} formatString="DD" />
      </div>
      <div className="flex lg:col-span-2">
        <Badge text={event.eventType} />
      </div>
      <div className="h-3 lg:hidden" />
      <p className="font-medium lg:col-span-5 text-small">{event.title}</p>
      <div className="h-3 lg:hidden" />
      <p className="lg:col-span-2 text-small">
        {event.location}
        <span className="lg:hidden">
          | <Date dateString={event.date} />
        </span>
      </p>
      <div className="h-3 lg:hidden" />
      <div className="lg:col-span-2">
        {event.article ? (
          <Link
            href={`/news/${event.article.slug}`}
            className="inline-flex items-center gap-5 text-small"
          >
            More info <Arrow />
          </Link>
        ) : (
          <Link
            href={`/news/${event.tickets}`}
            className="inline-flex items-center gap-5 text-small"
          >
            Tickets <Arrow />
          </Link>
        )}
      </div>
    </li>
  );
}
