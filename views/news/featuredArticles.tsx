import useInterval from "@use-it/interval";
import cn from "classnames";
import {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIntersection } from "use-intersection";
import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import { ArticleInterface } from "../../types/shared";
import { isServer } from "../../util";

function useCarousel<T>(
  ref: RefObject<HTMLUListElement>,
  slides: T[],
  {
    threshold,
    delay,
  }: {
    threshold: number;
    delay: number;
  } = {
    threshold: 0.35,
    delay: 5000,
  }
) {
  const [activeId, setActiveId] = useState(1);

  const isIntersecting = useIntersection(ref, { threshold });

  const advanceCarousel = useCallback(() => {
    const isNotLastSlide = activeId < slides.length - 1;

    if (isNotLastSlide) {
      ref.current.scrollBy({
        left: window.innerWidth * (activeId + 1),
        behavior: "smooth",
      });
    } else {
      ref.current.scrollBy({
        left: -(window.innerWidth * slides.length),
        behavior: "smooth",
      });
    }
  }, [ref, activeId, slides]);

  useInterval(() => {
    if (isIntersecting) {
      advanceCarousel();
    }
  }, delay);

  return {
    activeId,
    setActiveId,
  };
}

function FeaturedArticleSlide({
  index,
  root,
  setActiveId,
  article,
}: {
  article: ArticleInterface;
  setActiveId: Dispatch<SetStateAction<number>>;
  index: number;
  root: MutableRefObject<HTMLUListElement>;
}) {
  const slide = useRef<HTMLLIElement>(null);

  const isIntersecting = useIntersection(slide, {
    threshold: 0.5,
    root,
  });

  useEffect(() => {
    if (isIntersecting) setActiveId(index);
  }, [isIntersecting, setActiveId, index]);

  return (
    <li ref={slide} id={String(index)}>
      <FeaturedArticlePreview {...article} />
    </li>
  );
}

export default function FeaturedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  const carousel = useRef<HTMLUListElement>(null);

  const { activeId, setActiveId } = useCarousel(carousel, articles);

  return (
    <section className="relative">
      {/* Articles */}
      <ul ref={carousel} className="carousel">
        {articles.map((article, index) => (
          <FeaturedArticleSlide
            key={index}
            article={article}
            index={index}
            root={carousel}
            setActiveId={setActiveId}
          />
        ))}
      </ul>

      {/* Indicators */}
      <ul className="absolute top-52 md:top-auto md:bottom-8 inset-x-0 flex justify-center space-x-3">
        {articles.map((_, idx) => {
          const indicatorClassNames = cn(
            "block h-6 w-6 rounded-full border-2 border-white focus:outline-none focus:ring-4",
            idx === activeId ? "bg-white" : "bg-transparent "
          );

          const onClick = () => {
            if (isServer) {
              return;
            }

            document.getElementById(String(idx)).scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          };

          return (
            <li key={idx}>
              <button
                onClick={onClick}
                aria-label={`Carousel Item ${idx + 1}`}
                className={indicatorClassNames}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
