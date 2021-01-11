import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Fragment } from "react";
import PlayCircle from "../icons/playCircle";
import Share from "../icons/share";
import { ArtistInterface } from "../types/shared";

export default function ArtistBody({ slug, name, content }: ArtistInterface) {
  console.log(content);

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
        <div className="p-4 sm:p-8">
          <div className="container-md">
            <div className="flex flex-wrap md:flex-nowrap md:space-x-8 lg:space-x-12 justify-between md:items-center">
              <div className="flex">
                <div className="w-20 h-20 sm:w-28 sm:h-28" />
                {/* Hook up to play latest show */}
                {/* <button className="w-20 h-20 sm:w-28 sm:h-28 rounded-full focus:outline-none focus:ring-4">
                  <PlayCircle />
                </button> */}
              </div>

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

            {content?.json && (
              <Fragment>
                <div className="h-6" />

                <div className="prose sm:prose-lg max-w-none">
                  {documentToReactComponents(content?.json)}
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </section>

      <div className="h-12 md:h-24" />
    </Fragment>
  );
}
