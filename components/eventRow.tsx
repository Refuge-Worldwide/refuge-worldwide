import { Arrow } from "../icons/arrow";
import Badge from "./badge";
import Date from "./date";
import Link from "next/link";
import { EventInterface } from "../types/shared";

export default function EventRow({
  event,
  past,
  filter,
}: {
  event: EventInterface;
  past?: boolean;
  filter: string;
}) {
  return (
    <li
      className={`border-b border-black p-5 grid-cols-12 lg:gap-x-4 px-4 sm:px-8 ${
        filter == event.eventType || filter == "" ? "block lg:grid" : "hidden"
      }`}
    >
      <div className="hidden lg:block lg:col-span-1 text-small">
        {past ? (
          <Date dateString={event.date} />
        ) : (
          <Date dateString={event.date} formatString="DD" />
        )}
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
      <div className="lg:col-span-2 justify-self-end">
        {event.article ? (
          <Link
            href={`/news/${event.article.slug}`}
            className="inline-flex items-center gap-5 text-small"
          >
            More info <Arrow />
          </Link>
        ) : (
          <a
            href={event.ticketLink}
            target="_blank"
            className="inline-flex items-center gap-5 text-small"
          >
            Tickets <Arrow />
          </a>
        )}
      </div>
    </li>
  );
}
