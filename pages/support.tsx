import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { SupportButton } from "@/components/supportButton";
import { getSupportPage } from "../lib/contentful/pages/support";
import { RenderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      preview,
      ...(await getSupportPage(preview)),
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function SupportPage({
  preview,
  content,
  coverImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // Split the single rich-text field into title (its first block), the
  // first paragraph, and everything after, so the app badges and support
  // button can be interleaved between them. There are no separate
  // "title"/"intro" fields in Contentful yet — if that changes, this split
  // can go away. Each slice keeps the full `links` data so embedded images
  // still render wherever they land.
  const blocks: any[] = content?.json?.content ?? [];
  const sliceContent = (slice: any[]) =>
    content?.json && {
      json: { ...content.json, content: slice },
      links: content.links,
    };
  const titleDoc = sliceContent(blocks.slice(0, 1));
  const introDoc = sliceContent(blocks.slice(1, 2));
  const restDoc = sliceContent(blocks.slice(2));

  return (
    <Layout preview={preview} pageId="Aa4GRMf6fuDtkH0UhkX19">
      <PageMeta title="Support | Refuge Worldwide" path="support/" />

      <SinglePage coverImage={coverImage}>
        {blocks.length > 0 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>{RenderRichTextWithImages(titleDoc)}</Prose>
            </div>
          </section>
        )}

        <section>
          <div className="container-md p-4 sm:p-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://apps.apple.com/us/app/refuge-worldwide/id6785827225"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src="/images/app-store-badge.svg"
                alt="Download on the App Store"
                className="h-14"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.refugeworldwide.app&hl=en-US"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-20"
              />
            </a>
          </div>
        </section>

        {blocks.length > 1 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>{RenderRichTextWithImages(introDoc)}</Prose>
            </div>
          </section>
        )}

        <section>
          <div className="container-md p-4 sm:p-8 text-center">
            <SupportButton
              className="bg-black text-white rounded-full py-4 px-8 text-small font-medium hover:bg-black/80 transition-colors"
              showFindOutMoreLink={false}
            >
              Become a supporter
            </SupportButton>
          </div>
        </section>

        {blocks.length > 2 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>{RenderRichTextWithImages(restDoc)}</Prose>
            </div>
          </section>
        )}

        <section>
          <div className="container-md p-4 sm:p-8 text-center">
            <SupportButton
              className="bg-black text-white rounded-full py-4 px-8 text-small font-medium hover:bg-black/80 transition-colors"
              showFindOutMoreLink={false}
            >
              Become a supporter
            </SupportButton>
          </div>
        </section>
      </SinglePage>
    </Layout>
  );
}
