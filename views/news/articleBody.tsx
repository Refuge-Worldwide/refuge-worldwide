import dynamic from "next/dynamic";
import { Fragment } from "react";
import Date from "../../components/date";
import Pill from "../../components/pill";
import Prose from "../../components/Prose";
import { RenderRichTextWithImages } from "../../lib/rich-text";
import { ArticleInterface } from "../../types/shared";
import Link from "next/link";
import { Arrow } from "../../icons/arrow";
const ShareButton = dynamic(() => import("../../components/shareButton"));

export default function ArticleBody({
  title,
  date,
  subtitle,
  content,
  slug,
  articleType,
  author,
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

              {author?.name && (
                <Fragment>
                  <div className="h-6" />

                  <p className="font-medium text-center">By {author.name}</p>
                </Fragment>
              )}
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

          <Prose>
            {RenderRichTextWithImages(content)}{" "}
            {title.includes("ICYMI") && (
              <div className="text-center mt-32">
                <Link
                  href="/news/archive/icymi"
                  className="inline-flex items-center space-x-4 text-base font-medium"
                >
                  <span className="underline">All ICYMI</span>
                  <Arrow />
                </Link>
              </div>
            )}
            {title.includes("Berlin Stories") && (
              <div className="text-center mt-32">
                <Link
                  href="/news/archive/berlin-stories"
                  className="inline-flex items-center space-x-4 text-base font-medium"
                >
                  <span className="underline">All Berlin Stories</span>
                  <Arrow />
                </Link>
              </div>
            )}
          </Prose>

          {/* Center h5 headings for specific article because its not possible via cms (ﾉ･o･)ﾉ */}
          {title.includes("Falastin Cinema Week Programme Announcement") && (
            <style jsx global>{`
              h5 {
                text-align: center;
                margin-top: -1rem !important;
                margin-bottom: 3rem !important;
                font-family: Visuelt, system-ui, -apple-system, "system-ui",
                  "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
                  sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
                  "Segoe UI Symbol", "Noto Color Emoji";
              }
            `}</style>
          )}

          <div className="h-12 md:h-24" />
        </div>
      </section>
    </Fragment>
  );
}
