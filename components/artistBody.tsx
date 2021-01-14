import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Fragment } from "react";
import Share from "../icons/share";
import { renderRichTextWithImages } from "../lib/rich-text";
import { ArtistInterface } from "../types/shared";
import Pill from "./pill";

export default function ArtistBody({ slug, name, content }: ArtistInterface) {
  const handleShare = async () => {
    const shareData: ShareData = {
      text: name,
      title: "Refuge Worldwide",
      url: `https://refuge-worldwide.vercel.app/artists/${slug}`,
    };

    try {
      /**
       * @todo Handle sharing on devices without the Share API
       */
      await navigator.share(shareData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Fragment>
      <section>
        <div className="container-md p-4 sm:p-8 bg-white">
          <div className="flex flex-wrap md:flex-nowrap md:space-x-8 lg:space-x-12 justify-between md:items-center">
            <Pill>
              <span className="font-serif">Artist</span>
            </Pill>

            <div className="w-full order-last md:order-none">
              <div className="h-3 block md:hidden" />

              <h1 className="text-base sm:text-large text-center">{name}</h1>
            </div>

            <div className="flex">
              <button
                className="w-20 h-20 sm:w-28 sm:h-28 focus:outline-none"
                onClick={handleShare}
              >
                <Share />
              </button>
            </div>
          </div>

          {content && (
            <Fragment>
              <div className="h-6" />

              <div className="prose sm:prose-lg max-w-none">
                {renderRichTextWithImages(content)}
              </div>
            </Fragment>
          )}
        </div>
      </section>

      <div className="h-12 md:h-24" />
    </Fragment>
  );
}
