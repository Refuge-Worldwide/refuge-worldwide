import { Arrow } from "../icons/arrow";
import { EventBadge } from "./badge";
import Date from "./date";
import Link from "next/link";
import { EventInterface } from "../types/shared";
import dayjs from "dayjs";
import { BiPlus, BiMinus } from "react-icons/bi";
import { useRef } from "react";
import { RenderRichTextWithImages } from "../lib/rich-text";
import Prose from "./Prose";

export default function EventRow({
  event,
  past,
}: {
  event: EventInterface;
  past?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    const content = contentRef.current;

    if (details.open) {
      content!.style.height = `${content!.scrollHeight}px`;
      setTimeout(() => {
        content!.style.height = "auto";
      }, 300);
    } else {
      content!.style.height = `${content!.scrollHeight}px`;
      setTimeout(() => {
        content!.style.height = "0px";
      }, 0);
    }
  };

  return (
    <li className="block border-b border-black transition-all duration-100 px-4 sm:px-8">
      <details className="group event-accordion" onToggle={handleToggle}>
        <summary className="py-5 lg:grid-cols-8 md:flex md:gap-x-6 lg:gap-x-12 xl:gap-x-24 md:items-center cursor-pointer list-none">
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
          <p className="font-medium text-smedium lg:col-span-4 md:text-small flex-grow mb-1 md:mb-0 mr-28 md:mr-0">
            {event.title}
          </p>
          <p className="lg:col-span-1 text-small flex-initial md:min-w-[140px] lg:min-w-[206px]">
            {event.location}
          </p>
          <div className="md:col-span-1 md:justify-self-end flex-initial md:min-w-[106px]">
            <BiPlus className="group-open:hidden ml-auto text-medium md:text-base -mt-9 md:mt-0" />
            <BiMinus className="hidden group-open:block ml-auto text-medium md:text-base -mt-9 md:mt-0" />
          </div>
        </summary>
        <div
          ref={contentRef}
          className="overflow-hidden transition-height duration-200 ease-in-out"
          style={{ height: "0px" }}
        >
          <div className="mt-4 mb-8">
            <div className="space-y-4 mb-4">
              <p className="text-small">
                <span className="font-medium">When:</span>{" "}
                {EventDate(event, true)}
              </p>
              <p className="text-small">
                <span className="font-medium">Where:</span> {event.location}
              </p>
              {event.price && (
                <p className="text-small">
                  <span className="font-medium">Entry:</span> {event.price}
                </p>
              )}
              <p className="text-small max-w-prose">
                {event.description && (
                  <Prose lg={false}>
                    {RenderRichTextWithImages(event.description)}
                  </Prose>
                )}
              </p>
            </div>
            <EventLink event={event} />
          </div>
        </div>
      </details>
    </li>
  );
}

export function FeaturedEventLink({ event, children }) {
  if (event.article && event.article?.type == "Article")
    return <Link href={`/news/${event.article.slug}`}>{children}</Link>;
  if (event.article && event.article?.type == "Workshop")
    return <Link href={`/workshops/${event.article.slug}`}>{children}</Link>;
  return (
    <a href={event.ticketLink} target="_blank">
      {children}
    </a>
  );
}

function EventLink({ event }) {
  if (event.article && event.article?.type == "Article")
    return (
      <Link
        href={`/news/${event.article.slug}`}
        className="inline-flex gap-5 text-small font-medium md:w-full"
      >
        More info <Arrow />
      </Link>
    );
  else if (event.article && event.article?.type == "Workshop")
    return (
      <Link
        href={`/workshops/${event.article.slug}`}
        className="inline-flex gap-5 text-small font-medium md:w-full"
      >
        {event.linkText ? event.linkText : "Apply"}
        <Arrow />
      </Link>
    );
  else if (event.ticketLink)
    return (
      <Link
        href={event.ticketLink}
        className="inline-flex gap-5 text-small font-medium md:w-full"
      >
        {event.linkText ? event.linkText : "Tickets"}
        <Arrow />
      </Link>
    );
}

function EventDate(event, expanded = false) {
  const start = dayjs(event.date);
  const end = dayjs(event.endDate);
  const isSameDay = start.isSame(end, "day");
  const isSameMonth = start.isSame(end, "month");
  return (
    <span className="text-small">
      {event.endDate ? (
        <span>
          {isSameDay ? (
            <span>
              <Date
                dateString={event.date}
                formatString={expanded ? "DD MMM" : "DD MMM YYYY"}
              />
              {expanded && (
                <>
                  {", "}
                  <Date dateString={event.date} formatString="HH:mm" />-
                  <Date dateString={event.endDate} formatString="HH:mm" />
                </>
              )}
            </span>
          ) : isSameMonth ? (
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

function EventDateExpanded(event) {
  const start = dayjs(event.date);
  const end = dayjs(event.endDate);
  const isSameDay = start.isSame(end, "day");
  const isSameMonth = start.isSame(end, "month");
  return (
    <span className="text-small">
      {event.endDate ? (
        <span>
          {isSameDay ? (
            <span>
              <Date dateString={event.date} formatString="DD MMM" />
            </span>
          ) : isSameMonth ? (
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
