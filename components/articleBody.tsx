import { Fragment } from "react";
import { renderRichTextWithImages } from "../lib/rich-text";
import { ArticleInterface } from "../types/shared";
import Date from "./date";
import Pill from "./pill";
import ShareButton from "./shareButton";

export default function ArticleBody({
  title,
  date,
  subtitle,
  content,
  slug,
  articleType,
}: ArticleInterface) {
  return (
    <Fragment>
      <section>
        <div className="container-md p-4 sm:p-8 bg-white">
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
              <ShareButton
                details={{
                  title: title,
                  slug: `/news/${slug}`,
                }}
              />
            </div>
          </div>

          <div className="h-6" />

          <div className="prose sm:prose-lg max-w-none">
            {renderRichTextWithImages(content)}
          </div>

          <div className="h-12 md:h-24" />
        </div>
      </section>
    </Fragment>
  );
}
