import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import loaders from "../lib/loaders";
import { EventInterface, EventType } from "../types/shared";
import Date from "./date";
import Pill from "./pill";

function getEventBackgroundColor(type: EventType) {
  let bg: string;

  if (type === "Workshop") bg = "bg-orange";
  if (type === "Party") bg = "bg-blue";
  if (type === "Fundraiser") bg = "bg-pink";
  if (type === "Hang Out") bg = "bg-red";
  if (type === "Exhibition") bg = "bg-green";

  return bg;
}

export default function FeaturedEventPreview({
  title,
  date,
  slug,
  eventType,
  coverImage,
  priority,
}: EventInterface & { priority?: boolean }) {
  const articleClassNames = cn(
    "flex flex-col-reverse md:grid grid-cols-10 h-full md:items-stretch md:justify-items-stretch min-h-[70vh]",
    getEventBackgroundColor(eventType)
  );

  return (
    <Link href={`/news/${slug}`} aria-labelledby={`featured-article-${slug}`}>
      <article className={articleClassNames}>
        <header className="flex-1 md:col-span-5 2xl:col-span-3 p-4 lg:p-8 border-l-0 border-t-0 md:border-t-2 border-b-2 border-black">
          <div>
            <div>
              <Pill>
                <span className="font-serif inline-flex">{eventType}</span>
              </Pill>
            </div>

            <div className="h-3 sm:h-6" />

            <p className="font-medium">
              <Date dateString={date} />
            </p>

            <div className="h-2" />

            <h1
              id={`featured-article-${slug}`}
              className="text-base sm:text-large"
            >
              {title}
            </h1>

            <div className="h-4" />

            <p className="font-medium flex-grow">
              Subtitle goes here...Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>

            <div className="h-6" />

            <div className="inline-flex items-center space-x-5 font-medium leading-none">
              <span className="underline">Read more</span>
              <Arrow />
            </div>

            <div className="hidden sm:block h-6" />
          </div>
        </header>

        <div className="md:col-span-5 2xl:col-span-7 h-64 md:h-auto relative md:border-l-2 border-t-2 border-b-2 border-black">
          <Image
            className="object-cover object-center"
            key={coverImage.sys.id}
            draggable="false"
            alt={coverImage.description ? coverImage.description : title}
            src={coverImage.url}
            loader={loaders.contentful}
            priority={priority}
            fill
          />
        </div>
      </article>
    </Link>
  );
}
