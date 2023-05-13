import { Arrow } from "../icons/arrow";
import { EventBadge } from "./badge";
import Date from "./date";
import Link from "next/link";
import { EventInterface } from "../types/shared";

export default function EventRow({
  event,
  past,
}: {
  event: EventInterface;
  past?: boolean;
}) {
  return (
    <li
      className={`border-b border-black p-5 grid-cols-12 lg:flex lg:gap-x-8 px-4 sm:px-8 hover:bg-black hover:text-white lg:items-center transition-all duration-100`}
    >
      <div className="hidden lg:block lg:col-span-1 text-small flex-initial">
        {past ? (
          <Date dateString={event.date} />
        ) : (
          <Date dateString={event.date} formatString="DD MMM" />
        )}
      </div>
      <div className="flex-initial lg:w-[106px]">
        <EventBadge eventType={event.eventType} text={event.eventType} />
      </div>
      <div className="h-3 lg:hidden" />
      <p className="font-medium lg:col-span-5 text-small flex-grow min-w-[60%]">
        {event.title}
      </p>
      <div className="h-3 lg:hidden" />
      <p className="lg:col-span-2 text-small flex-initial">
        {event.location}
        <span className="lg:hidden">
          | <Date dateString={event.date} />
        </span>
      </p>
      <div className="h-3 lg:hidden" />
      <div className="lg:col-span-2 flex-grow">
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
