import { Arrow } from "../icons/arrow";
import { EventBadge } from "./badge";
import Date from "./date";
import Link from "next/link";
import { EventInterface } from "../types/shared";
import dayjs from "dayjs";

export default function EventRow({
  event,
  past,
}: {
  event: EventInterface;
  past?: boolean;
}) {
  return (
    <EventLink event={event}>
      <div className="py-5 lg:grid-cols-8 md:flex md:gap-x-6 lg:gap-x-12 xl:gap-x-24 md:items-center">
        <div className="hidden md:block lg:col-span-1 text-small flex-initial md:min-w-[116px] ">
          {EventDate(event)}
        </div>
        <div className="flex-initial max-w-[106px] w-full lg:col-span-1">
          <EventBadge eventType={event.eventType} text={event.eventType} />
        </div>
        <div className="h-3 md:hidden" />
        <p className="font-medium lg:col-span-4 text-small flex-grow">
          {event.title}
        </p>
        <div className="h-3 md:hidden" />
        <p className="lg:col-span-1 text-small flex-initial md:min-w-[206px]">
          {event.location}
          <span className="md:hidden">&nbsp;| {EventDate(event)}</span>
        </p>
        <div className="h-3 md:hidden" />
        <div className="md:col-span-1 md:justify-self-end flex-initial md:min-w-[106px] text-align-right">
          {(() => {
            if (event.article) {
              return (
                <p className="inline-flex gap-5 text-small font-medium md:w-full md:justify-end">
                  More info <Arrow />
                </p>
              );
            } else if (event.ticketLink) {
              return (
                <p className="inline-flex gap-5 text-small font-medium md:w-full md:justify-end">
                  {event.linkText ? event.linkText : "Tickets"}
                  <Arrow />
                </p>
              );
            } else if (event.linkText) {
              return (
                <p className="inline-flex gap-5 text-small font-medium md:w-full md:justify-end">
                  {event.linkText}
                  <Arrow className="invisible" />
                </p>
              );
            }
          })()}
        </div>
      </div>
    </EventLink>
  );
}

function EventLink({ event, children }) {
  return (
    <li>
      {event.article ? (
        <Link
          className={`block border-b border-black hover:bg-black hover:text-white transition-all duration-100 px-4 sm:px-8`}
          href={`/news/${event.article.slug}`}
        >
          {children}
        </Link>
      ) : (
        <a
          className={`block border-b border-black hover:bg-black hover:text-white transition-all duration-100 px-4 sm:px-8`}
          href={event.ticketLink}
          target="_blank"
        >
          {children}
        </a>
      )}
    </li>
  );
}

function EventDate(event) {
  return (
    <span>
      {event.endDate ? (
        <span>
          {sameMonth(event.date, event.endDate) ? (
            <span>
              <Date dateString={event.date} formatString="DD" />
              &nbsp;-&nbsp;
              <Date dateString={event.endDate} />
            </span>
          ) : (
            <span>
              <Date dateString={event.date} formatString="DD MMM" />
              &nbsp;-&nbsp;
              <br className="hidden md:block" />
              <Date dateString={event.endDate} />
            </span>
          )}
        </span>
      ) : (
        <Date dateString={event.date} />
      )}
    </span>
  );
}

function sameMonth(startDate, endDate) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const sameMonth = start.isSame(end, "month");
  return sameMonth;
}
