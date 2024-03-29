import { useIntersectionObserver } from "@react-hookz/web";
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
import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import { ArticleInterface } from "../../types/shared";
import { __SERVER__ } from "../../util";

function useCarousel<T>(ref: RefObject<HTMLUListElement>, slides: T[]) {
  const [activeId, setActiveId] = useState(1);

  const intersection = useIntersectionObserver(ref, {
    threshold: [0.35],
  });

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
    if (intersection?.isIntersecting) {
      advanceCarousel();
    }
  }, 5000);

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
  priority,
}: {
  article: ArticleInterface;
  setActiveId: Dispatch<SetStateAction<number>>;
  index: number;
  root: MutableRefObject<HTMLUListElement>;
  priority?: boolean;
}) {
  const slide = useRef<HTMLLIElement>(null);

  const intersection = useIntersectionObserver(slide, {
    threshold: [1],
    root,
  });

  useEffect(() => {
    if (intersection?.isIntersecting) setActiveId(index);
  }, [intersection?.isIntersecting, setActiveId, index]);

  return (
    <li ref={slide} id={String(index)}>
      <FeaturedArticlePreview {...article} priority={priority} />
    </li>
  );
}

export default function FeaturedArticles({
  articles,
  aboveTheFold,
}: {
  articles: ArticleInterface[];
  aboveTheFold?: boolean;
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
            priority={aboveTheFold}
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
            if (__SERVER__) {
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
