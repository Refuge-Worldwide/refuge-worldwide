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
    <EventLink event={event}>
      <div className="hidden lg:block lg:col-span-1 text-small flex-initial">
        {past ? (
          <Date dateString={event.date} />
        ) : (
          <Date dateString={event.date} formatString="DD MMM" />
        )}
      </div>
      <div className="flex-initial max-w-[106px] w-full lg:mx-auto lg:col-span-1">
        <EventBadge eventType={event.eventType} text={event.eventType} />
      </div>
      <div className="h-3 lg:hidden" />
      <p className="font-medium lg:col-span-4 text-small min-w-[60%]">
        {event.title}
      </p>
      <div className="h-3 lg:hidden" />
      <p className="lg:col-span-1 text-small flex-initial">
        {event.location}
        <span className="lg:hidden">
          &nbsp;| <Date dateString={event.date} />
        </span>
      </p>
      <div className="h-3 lg:hidden" />
      <div className="lg:col-span-1 lg:justify-self-end flex-grow">
        {event.article ? (
          <p className="inline-flex items-center gap-5 text-small">
            More info <Arrow />
          </p>
        ) : (
          <p className="inline-flex items-center gap-5 text-small">
            Tickets <Arrow />
          </p>
        )}
      </div>
    </EventLink>
  );
}

function EventLink({ event, children }) {
  return (
    <li>
      {event.article ? (
        <Link
          className={`block border-b border-black p-5 lg:grid-cols-8 lg:grid lg:gap-x-8 px-4 sm:px-8 hover:bg-black hover:text-white lg:items-center transition-all duration-100`}
          href={`/news/${event.article.slug}`}
        >
          {children}
        </Link>
      ) : (
        <a
          className={`block border-b border-black p-5 lg:grid-cols-8 lg:grid lg:gap-x-8 px-4 sm:px-8 hover:bg-black hover:text-white lg:items-center transition-all duration-100`}
          href={event.ticketLink}
          target="_blank"
        >
          {children}
        </a>
      )}
    </li>
  );
}
