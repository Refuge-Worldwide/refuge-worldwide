import { Fragment } from "react";
import { renderRichTextWithImages } from "../../lib/rich-text";
import { ArtistInterface } from "../../types/shared";
import Pill from "../../components/pill";
import ShareButton from "../../components/shareButton";

export default function ArtistBody({ slug, name, content }: ArtistInterface) {
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
              <ShareButton
                details={{
                  title: name,
                  slug: `/artists/${slug}`,
                }}
              />
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

          <div className="h-12 md:h-24" />
        </div>
      </section>
    </Fragment>
  );
}
