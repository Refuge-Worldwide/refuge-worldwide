import Image from "next/image";
import { CollectionInterface } from "../types/shared";
import Pill from "./pill";
import CollectionPreview from "./collectionPreview";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
export default function Collections({
  collections,
}: {
  collections: Array<CollectionInterface>;
}) {
  return (
    <>
      <div className="h-5 sm:h-8"></div>
      <div>
        <Splide
          aria-label="Collections"
          options={{
            type: "slide",
            height: "100%",
            width: "100%",
            gap: "2rem",
            focus: 0,
            lazyLoad: "nearby",
            drag: true,
            arrows: true,
            pagination: false,
            perPage: 4,
            breakpoints: {
              1280: {
                perPage: 3,
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
          {collections.map((collection, i) => (
            <SplideSlide key={i}>
              <CollectionPreview {...collection} />
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </>
  );
}
