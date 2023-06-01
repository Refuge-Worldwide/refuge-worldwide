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
      <div className="py-5 lg:py-7 lg:grid-cols-8 lg:flex lg:gap-x-12 xl:gap-x-24 lg:items-center">
        <div className="hidden lg:block lg:col-span-1 text-small flex-initial lg:min-w-[116px]">
          {EventDate(event)}
        </div>
        <div className="flex-initial max-w-[106px] w-full lg:col-span-1">
          <EventBadge eventType={event.eventType} text={event.eventType} />
        </div>
        <div className="h-3 lg:hidden" />
        <p className="font-medium lg:col-span-4 text-small flex-grow">
          {event.title}
        </p>
        <div className="h-3 lg:hidden" />
        <p className="lg:col-span-1 text-small flex-initial lg:min-w-[206px]">
          {event.location}
          <span className="lg:hidden">&nbsp;| {EventDate(event)}</span>
        </p>
        <div className="h-3 lg:hidden" />
        <div className="lg:col-span-1 lg:justify-self-end flex-initial lg:min-w-[106px] text-align-right">
          {(() => {
            if (event.article) {
              return (
                <p className="inline-flex gap-5 text-small font-medium lg:w-full lg:justify-end">
                  More info <Arrow />
                </p>
              );
            } else if (event.ticketLink) {
              return (
                <p className="inline-flex gap-5 text-small font-medium lg:w-full lg:justify-end">
                  {event.linkText ? event.linkText : "Tickets"}
                  <Arrow />
                </p>
              );
            } else if (event.linkText) {
              return (
                <p className="inline-flex gap-5 text-small font-medium lg:w-full lg:justify-end">
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
              <br className="hidden lg:block" />
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
