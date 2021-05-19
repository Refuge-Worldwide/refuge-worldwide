import useInterval from "@use-it/interval";
import { useEffect, useRef, useState } from "react";
import { useIntersection } from "use-intersection";
import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import { CAROUSEL_DELAY } from "../../constants";
import { ArticleInterface } from "../../types/shared";
import { isServer } from "../../util";

export default function FeaturedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  const carousel = useRef<HTMLUListElement>(null);

  const intersecting = useIntersection(carousel, {
    threshold: 0.35,
  });

  const [activeId, setActiveId] = useState(0);

  function autoAdvanceCarousel() {
    const isLastSlide = activeId === articles.length - 1;

    if (isLastSlide) {
      carousel.current.scrollBy({
        left: -(window.innerWidth * articles.length),
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
      {/* Articles */}
      <ul ref={carousel} className="carousel">
        {articles.map((article, i) => {
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

          return (
            <li
              ref={slide}
              key={article.slug}
              id={`featured-article-${article.slug}`}
            >
              <FeaturedArticlePreview {...article} />
            </li>
          );
        })}
      </ul>

      {/* Indicators */}
      <ul className="absolute top-44 md:top-auto md:bottom-8 inset-x-0 flex justify-center space-x-3">
        {articles?.map((article, i) => {
          const elem = !isServer
            ? document?.getElementById(`featured-article-${article.slug}`)
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
