import { useEffect, useRef, useState } from "react";
import { useIntersection } from "use-intersection";
import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import useInterval from "../../hooks/useInterval";
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

  const [activeId, setActiveId] = useState(1);

  function autoAdvanceCarousel() {
    const isNotLastSlide = activeId < articles.length - 1;

    if (isNotLastSlide) {
      carousel.current.scrollLeft = window.innerWidth * (activeId + 1);
    } else {
      carousel.current.scrollLeft = 0;
    }
  }

  useInterval(() => {
    if (intersecting) autoAdvanceCarousel();
  }, 5 * 1000);

  return (
    <section className="relative">
      {/* Articles */}
      <ul ref={carousel} className="carousel">
        {articles?.map((article, i) => {
          const slide = useRef<HTMLLIElement>(null);

          const isSlideInView = useIntersection(slide, {
            threshold: 0.5,
            root: carousel,
          });

          useEffect(() => {
            if (isSlideInView) setActiveId(i);
          }, [isSlideInView]);

          return (
            <li ref={slide} key={i} id={String(i)}>
              <FeaturedArticlePreview {...article} />
            </li>
          );
        })}
      </ul>

      {/* Indicators */}
      <ul className="absolute bottom-8 inset-x-0 flex justify-center space-x-3">
        {articles?.map((_, i) => {
          const item = !isServer ? document?.getElementById(String(i)) : null;

          const handleOnClick = () =>
            item?.scrollIntoView({
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
