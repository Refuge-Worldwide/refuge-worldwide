import Image from "next/image";
import { CollectionInterface } from "../../types/shared";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import Link from "next/link";
import { Arrow } from "../../icons/arrow";
export default function FeaturedCollection({
  collection,
}: {
  collection: CollectionInterface;
}) {
  return (
    <section className="border-b-2 group/section">
      <div className="pt-16 -mt-16" id="shows" aria-hidden />
      <div className="py-4 sm:py-8">
        <Splide
          aria-label="Collections"
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
            <div className="flex gap-4 items-end">
              <Pill>
                <h2>{collection.title}</h2>
              </Pill>
              <p className="font-sans text-small mb-1 mt-2">
                {collection.description}
              </p>
            </div>

            <div className="splide__arrows flex space-x-4 mt-4 ml-4 opacity-0 group-hover/section:opacity-100 transition-all">
              <button className="splide__arrow splide__arrow--prev disabled:opacity-50 disabled:cursor-not-allowed">
                <Arrow className="rotate-180" />
              </button>
              <button className="splide__arrow splide__arrow--next disabled:opacity-50 disabled:cursor-not-allowed">
                <Arrow />
              </button>
            </div>
          </div>
          <div className="h-5 sm:h-8"></div>

          <SplideTrack>
            {collection.shows.map((show, i) => (
              <SplideSlide key={i}>
                <ShowPreview {...show} />
              </SplideSlide>
            ))}
            <SplideSlide className="h-full">
              <Link
                href={`/radio/collections/${collection.slug}`}
                className="inline-flex items-center space-x-4 text-base font-medium w-full h-full"
              >
                <span className="underline">View all</span>
                <Arrow />
              </Link>
            </SplideSlide>
          </SplideTrack>

          <div className="h-10 sm:h-16" />
          <div className="text-center">
            <Link
              href="/radio/collections"
              className="inline-flex items-center space-x-4 text-base font-medium"
            >
              <span className="underline">All Collections</span>
              <Arrow />
            </Link>
          </div>
          <div className="h-8 sm:h-10" />
        </Splide>
      </div>
    </section>
  );
}
