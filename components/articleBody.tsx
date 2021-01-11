import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Fragment } from "react";
import Share from "../icons/share";
import { ArticleInterface } from "../types/shared";
import Date from "./date";
import Pill from "./pill";

export default function ArticleBody({
  title,
  date,
  subtitle,
  content,
  slug,
  articleType,
}: ArticleInterface) {
  const handleShare = async () => {
    const shareData: ShareData = {
      text: title,
      title: "Refuge Worldwide",
      url: `https://refuge-worldwide.vercel.app/news/${slug}`,
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
            <div className="flex flex-wrap md:flex-nowrap md:space-x-8 lg:space-x-12 justify-between">
              <Pill>
                <span className="font-serif">{articleType}</span>
              </Pill>

              <div className="w-full order-last md:order-none">
                <div className="h-3 block md:hidden" />

                <p className="text-small text-center">
                  <Date dateString={date} />
                </p>

                <div className="h-6" />

                <h1 className="text-base sm:text-large text-center">{title}</h1>

                <div className="h-6" />

                <p className="font-medium text-center">{subtitle}</p>
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

            <div className="h-6" />

            <div className="prose sm:prose-lg max-w-none">
              {documentToReactComponents(content?.json)}
            </div>
          </div>
        </div>
      </section>

      <div className="h-12 md:h-24" />
    </Fragment>
  );
}
