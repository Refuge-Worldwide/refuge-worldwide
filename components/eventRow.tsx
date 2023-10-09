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
    <li className="block border-b border-black hover:bg-blue transition-all duration-100 px-4 sm:px-8">
      <EventLink event={event}>
        <div className="py-5 lg:grid-cols-8 md:flex md:gap-x-6 lg:gap-x-12 xl:gap-x-24 md:items-center">
          <div className="hidden md:block lg:col-span-1 text-small flex-initial md:max-w-[100px] md:min-w-[100px] lg:min-w-[116px] ">
            {EventDate(event)}
          </div>
          <div className="flex distance-between md:hidden content-center w-full">
            <div className="flex-grow text-left">{EventDate(event)}</div>
            <EventBadge eventType={event.eventType} text={event.eventType} />
          </div>
          <div className="hidden md:block flex-initial max-w-[106px] w-full lg:col-span-1">
            <EventBadge eventType={event.eventType} text={event.eventType} />
          </div>
          {/* <div className="h-3 md:hidden" /> */}
          <p className="font-medium text-smedium lg:col-span-4 md:text-small flex-grow mb-1 md:mb-0 mr-28 md:mr-0">
            {event.title}
          </p>
          {/* <div className="h-3 md:hidden" /> */}
          <p className="lg:col-span-1 text-small flex-initial md:min-w-[140px] lg:min-w-[206px]">
            {event.location}
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
              } else if (event.eventType == "Workshop") {
                return (
                  <p className="inline-flex gap-5 text-small font-medium md:w-full md:justify-end">
                    {event.linkText ? event.linkText : "Apply"}
                    <Arrow />
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
    </li>
  );
}

export function EventLink({ event, children }) {
  if (event.article)
    return <Link href={`/news/${event.article.slug}`}>{children}</Link>;
  if (event.eventType == "Workshop")
    return <Link href={`/workshops/${event.slug}`}>{children}</Link>;
  return (
    <a href={event.ticketLink} target="_blank">
      {children}
    </a>
  );
}

function EventDate(event) {
  return (
    <span className="text-small">
      {event.endDate ? (
        <span>
          {sameMonth(event.date, event.endDate) ? (
            <span>
              <Date dateString={event.date} formatString="DD" />—
              <Date dateString={event.endDate} />
            </span>
          ) : (
            <span>
              <Date dateString={event.date} formatString="DD MMM" />
              —
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
