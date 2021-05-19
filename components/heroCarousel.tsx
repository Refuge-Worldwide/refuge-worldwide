import useInterval from "@use-it/interval";
import cn from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useIntersection } from "use-intersection";
import { CAROUSEL_DELAY } from "../constants";
import { Arrow } from "../icons/arrow";
import { contentful } from "../lib/loaders";
import { HeroSection } from "../types/shared";
import {
  formatArtistNames,
  getArticleBackgroundColor,
  isServer,
  parseGenres,
} from "../util";
import Badge from "./badge";
import Pill from "./pill";

export default function HeroCarousel({ items }: HeroSection) {
  const carousel = useRef<HTMLUListElement>(null);

  const intersecting = useIntersection(carousel, {
    threshold: 0.35,
  });

  const [activeId, setActiveId] = useState(0);

  function autoAdvanceCarousel() {
    const isLastSlide = activeId === items.length - 1;

    if (isLastSlide) {
      carousel.current.scrollBy({
        left: -(window.innerWidth * items.length),
        behavior: "smooth",
      });

      return;
    }

    carousel.current.scrollBy({
      left: window.innerWidth,
      behavior: "smooth",
    });
  }

  useInterval(() => {
    if (intersecting) autoAdvanceCarousel();
  }, CAROUSEL_DELAY);

  return (
    <section className="relative">
      <ul ref={carousel} className="carousel">
        {items.map((item, i) => {
          const slide = useRef<HTMLLIElement>(null);

          const isSlideInView = useIntersection(slide, {
            threshold: 0.5,
            root: carousel,
          });

          useEffect(() => {
            if (isSlideInView) {
              setActiveId(i);
            }
          }, [isSlideInView]);

          const slug =
            item.__typename === "Article"
              ? `/news/${item.slug}`
              : `/radio/${item.slug}`;

          const articleBackgroundClassName = getArticleBackgroundColor(
            item?.articleType
          );

          const articleClassNames = cn(
            "flex flex-col md:grid grid-cols-10 h-full",
            articleBackgroundClassName
          );

          const genres =
            item.__typename === "Show"
              ? parseGenres(item?.genresCollection).slice(0, 3)
              : null;

          return (
            <li ref={slide} key={item.slug} id={`hero-item-${item.slug}`}>
              <Link href={slug}>
                <a aria-labelledby={`hero-item-title-${item.slug}`}>
                  <article className={articleClassNames}>
                    <div className="md:col-span-5 xl:col-span-6 2xl:col-span-7 h-56 md:h-auto relative border-l-2 border-b-2 border-black">
                      <Image
                        key={item.coverImage.sys.id}
                        draggable="false"
                        alt={item.coverImage.title}
                        src={item.coverImage.url}
                        loader={contentful}
                        objectFit="cover"
                        objectPosition="center"
                        layout="fill"
                        loading="eager"
                        priority
                      />
                    </div>

                    <header className="flex-1 md:col-span-5 xl:col-span-4 2xl:col-span-3 p-4 lg:p-8 border-l-2 border-b-2 border-black">
                      <Pill invert={item.__typename === "Show"}>
                        <span className="font-serif">
                          {item.__typename === "Article"
                            ? item?.articleType
                            : "Show"}
                        </span>
                      </Pill>

                      <div className="h-3 sm:h-6" />

                      <h1
                        id={`hero-item-title-${item.slug}`}
                        className="font-serif text-base sm:text-large"
                      >
                        {item.title}
                      </h1>

                      <div className="h-4" />

                      <p className="font-medium">
                        {item.__typename === "Article"
                          ? item.subtitle
                          : formatArtistNames(item.artistsCollection.items)}
                      </p>

                      {item.__typename === "Show" && (
                        <Fragment>
                          <div className="h-4" />

                          <ul className="w-full flex flex-wrap -mr-2 -mb-2">
                            {genres.map((genre, i) => (
                              <li key={i} className="pr-2 pb-2">
                                <Badge invert text={genre} />
                              </li>
                            ))}
                          </ul>
                        </Fragment>
                      )}

                      <div className="h-8" />

                      <div className="inline-flex items-center space-x-5 font-medium leading-none ">
                        <span className="underline">
                          {item.__typename === "Article"
                            ? "Read more"
                            : "Listen Now"}
                        </span>
                        <Arrow />
                      </div>

                      <div className="hidden sm:block h-6" />
                    </header>
                  </article>
                </a>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Indicators */}
      <ul className="absolute top-44 md:top-auto md:bottom-8 inset-x-0 flex justify-center space-x-3">
        {items.map((item, i) => {
          const elem = !isServer
            ? document?.getElementById(`hero-item-${item.slug}`)
            : null;

          const handleOnClick = () =>
            elem?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });

          return (
            <li key={i}>
              <button
                onClick={handleOnClick}
                aria-label={`Carousel Item ${i + 1}`}
                className={`block h-6 w-6 rounded-full border-2 border-white focus:outline-none focus:ring-4 ${
                  i === activeId ? "bg-white" : "bg-transparent "
                }`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
