import { Fragment } from "react";
import Pill from "../../components/pill";
import Prose from "../../components/Prose";
import ShareButton from "../../components/shareButton";
import { renderRichTextWithImages } from "../../lib/rich-text";
import { ArtistEntry } from "../../types/shared";

export default function ArtistBody({
  slug,
  name,
  content,
}: Pick<ArtistEntry, "slug" | "content" | "name">) {
  return (
    <Fragment>
      <section>
        <div className="container-md p-4 sm:p-8 bg-white">
          <div className="flex flex-wrap md:flex-nowrap md:space-x-8 lg:space-x-12 justify-between">
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

              <Prose>{renderRichTextWithImages(content)}</Prose>
            </Fragment>
          )}

          <div className="h-12 md:h-24" />
        </div>
      </section>
    </Fragment>
  );
}
