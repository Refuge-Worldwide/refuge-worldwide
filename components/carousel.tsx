import Image from "next/image";
import { CollectionInterface, PastShowSchema } from "../types/shared";
import { ShowInterface } from "../types/shared";
import Pill from "./pill";
import ShowPreview from "./showPreview";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import CollectionPreview from "./collectionPreview";
import { useRouter } from "next/router";

export default function Carousel({
  items,
  type,
  title,
  description,
  viewAllLink,
}: {
  items: CollectionInterface[] | ShowInterface[] | PastShowSchema[];
  type: "show" | "collection";
  title: string;
  description?: string;
  viewAllLink?: string;
}) {
  const router = useRouter();

  return (
    <Splide
      aria-label="Collections"
      className="group/section py-4 sm:py-8"
      hasTrack={false}
      options={{
        type: "slide",
        height: "100%",
        width: "100%",
        gap: "2rem",
        padding: "2rem",
        focus: 0,
        lazyLoad: "nearby",
        drag: true,
        pagination: false,
        perPage: 4,
        breakpoints: {
          1280: {
            perPage: 3,
            padding: "1rem",
          },
          1024: {
            perPage: 2,
          },
          640: {
            perPage: 1,
          },
        },
      }}
    >
      <div className="px-4 sm:px-8 flex gap-4 items-center justify-between">
        {router.pathname == "/radio/collections" ? (
          <div>
            <h3 className="font-sans font-medium">{title}</h3>
            {description && (
              <p className="font-sans text-small mb-1">{description}</p>
            )}
          </div>
        ) : (
          <div className="flex gap-4 items-end">
            <Pill>
              <h2>{title}</h2>
            </Pill>
            {description && (
              <p className="font-sans text-small mb-1 mt-2">{description}</p>
            )}
          </div>
        )}

        <div className="splide__arrows flex space-x-4 mt-4 ml-4 opacity-0 group-focus-within/section:opacity-100 group-hover/section:opacity-100 transition-all">
          <button className="splide__arrow splide__arrow--prev disabled:opacity-50 disabled:cursor-not-allowed">
            <Arrow className="rotate-180" />
          </button>
          <button className="splide__arrow splide__arrow--next disabled:opacity-50 disabled:cursor-not-allowed">
            <Arrow />
          </button>
        </div>
      </div>
      <div className="h-5 sm:h-8"></div>

      <SplideTrack className="cursor-grab active:cursor-grabbing">
        {items.map((item, i) => (
          <SplideSlide key={i}>
            {type == "show" && <ShowPreview {...item} />}
            {type == "collection" && <CollectionPreview {...item} />}
          </SplideSlide>
        ))}
        {viewAllLink && (
          <SplideSlide className="aspect-video border-black border hover:bg-black hover:text-white group duration-150">
            <Link
              href={viewAllLink}
              className="inline-flex items-center space-x-4 text-base font-medium w-full h-full justify-center"
            >
              <span className="underline">View all</span>
              <Arrow className="group-hover:fill-white" />
            </Link>
          </SplideSlide>
        )}
      </SplideTrack>
    </Splide>
  );
}
