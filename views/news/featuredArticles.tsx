import { useEffect, useRef, useState } from "react";
import FeaturedArticlePreview from "../../components/featuredArticlePreview";
import useIntersect from "../../hooks/useIntersect";
import { ArticleInterface } from "../../types/shared";
import { isServer } from "../../util";

export default function FeaturedArticles({
  articles,
}: {
  articles: ArticleInterface[];
}) {
  const [activeId, setActiveId] = useState(0);
  const carousel = useRef(null);

  return (
    <section className="relative">
      {/* Articles */}
      <ul ref={carousel} className="carousel">
        {articles?.map((article, i) => {
          const { setNode, entry } = useIntersect({
            threshold: 0.5,
            root: carousel.current,
          });

          const isIntersecting = entry?.isIntersecting;

          useEffect(() => {
            if (isIntersecting) setActiveId(i);
          }, [isIntersecting]);

          return (
            <li ref={setNode} key={i} id={String(i)}>
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
