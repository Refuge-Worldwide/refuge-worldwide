import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import FaqAccordion from "../components/faqAccordion";
import { getSupportPage } from "../lib/contentful/pages/support";
import { RenderRichTextWithImages } from "../lib/rich-text";
import SinglePage from "../views/singlePage";
import { useDirectusUser } from "../hooks/useDirectusUser";
import { getSessionUser } from "../lib/directus/session";
import { getUserAccess } from "../lib/directus/staff";

const HEADING_TYPES = new Set([
  BLOCKS.HEADING_1,
  BLOCKS.HEADING_2,
  BLOCKS.HEADING_3,
  BLOCKS.HEADING_4,
  BLOCKS.HEADING_5,
  BLOCKS.HEADING_6,
]);

const nodeText = (node: any): string =>
  (node.content ?? [])
    .map((child: any) =>
      child.nodeType === "text" ? child.value : nodeText(child)
    )
    .join("");

const faqItemsFromList = (listBlock: any) =>
  (listBlock.content ?? [])
    .filter((item: any) => item.nodeType === BLOCKS.LIST_ITEM)
    .map((item: any) => {
      const [questionNode, answerListNode] = item.content ?? [];
      const answerListItem = answerListNode?.content?.[0];
      return {
        question: questionNode ? nodeText(questionNode) : "",
        answerBlocks: answerListItem?.content ?? [],
      };
    });

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const preview = !!context.preview;
  const user = await getSessionUser(context.req, context.res, "id");
  const hasSupporterAccess = user
    ? (await getUserAccess(user.id)).hasSupporterAccess
    : false;

  return {
    props: {
      preview,
      hasSupporterAccess,
      ...(await getSupportPage(preview)),
    },
  };
}

export default function SupportPage({
  preview,
  content,
  coverImage,
  hasSupporterAccess,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { showSupporters } = useDirectusUser();

  if (!showSupporters) {
    return (
      <Layout preview={preview} pageId="Aa4GRMf6fuDtkH0UhkX19">
        <PageMeta title="Support | Refuge Worldwide" path="support/" />

        <SinglePage coverImage={coverImage}>
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>{documentToReactComponents(content?.json)}</Prose>
            </div>
          </section>
        </SinglePage>
      </Layout>
    );
  }

  // Split the single rich-text field into title (its first block), the
  // first paragraph, and everything after, so the app badges can sit right
  // after the first paragraph. There are no separate "title"/"intro"
  // fields in Contentful yet — if that changes, this split can go away.
  // Each slice keeps the full `links` data so embedded images still
  // render wherever they land. "Become a supporter" CTA buttons come
  // from the rich text itself — see the BLOCKS.PARAGRAPH override in
  // lib/rich-text.tsx.
  const blocks: any[] = content?.json?.content ?? [];
  const sliceContent = (slice: any[]) =>
    content?.json && {
      json: { ...content.json, content: slice },
      links: content.links,
    };
  const titleDoc = sliceContent(blocks.slice(0, 1));
  const introDoc = sliceContent(blocks.slice(1, 2));

  // Everything after the intro paragraph, up to the "FAQ" heading, renders
  // as normal body copy. After that, each heading (e.g. "About the app")
  // starts a new FAQ category, and the unordered-list that follows it
  // holds that category's Q&As — rendered as <details>/<summary> accordion
  // items rather than plain nested bullets.
  const restBlocks: any[] = blocks.slice(2);
  const faqHeadingIndex = restBlocks.findIndex(
    (block) =>
      block.nodeType === BLOCKS.HEADING_2 &&
      nodeText(block).trim().toLowerCase() === "faq"
  );
  const leadBlocks =
    faqHeadingIndex === -1 ? restBlocks : restBlocks.slice(0, faqHeadingIndex);
  const faqTitleBlock =
    faqHeadingIndex === -1 ? null : restBlocks[faqHeadingIndex];
  const faqBlocks =
    faqHeadingIndex === -1 ? [] : restBlocks.slice(faqHeadingIndex + 1);

  const leadDoc = sliceContent(leadBlocks);
  const faqTitleDoc = faqTitleBlock && sliceContent([faqTitleBlock]);

  const faqCategories: {
    title: string;
    items: { question: string; answerDoc: any }[];
  }[] = [];
  faqBlocks.forEach((block) => {
    if (HEADING_TYPES.has(block.nodeType)) {
      faqCategories.push({ title: nodeText(block), items: [] });
    } else if (block.nodeType === BLOCKS.UL_LIST && faqCategories.length > 0) {
      const items = faqItemsFromList(block).map((item) => ({
        question: item.question,
        answerDoc: sliceContent(item.answerBlocks),
      }));
      faqCategories[faqCategories.length - 1].items.push(...items);
    }
  });

  return (
    <Layout preview={preview} pageId="Aa4GRMf6fuDtkH0UhkX19">
      <PageMeta title="Support | Refuge Worldwide" path="support/" />

      <SinglePage coverImage={coverImage}>
        {blocks.length > 0 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>
                {RenderRichTextWithImages(titleDoc, { hasSupporterAccess })}
              </Prose>
            </div>
          </section>
        )}

        {blocks.length > 1 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>
                {RenderRichTextWithImages(introDoc, { hasSupporterAccess })}
              </Prose>
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

        {leadBlocks.length > 0 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>
                {RenderRichTextWithImages(leadDoc, { hasSupporterAccess })}
              </Prose>
            </div>
          </section>
        )}

        {faqCategories.length > 0 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              {faqTitleDoc && (
                <Prose>
                  {RenderRichTextWithImages(faqTitleDoc, {
                    hasSupporterAccess,
                  })}
                </Prose>
              )}
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mt-8 first:mt-4">
                  <p className="font-medium text-smedium mb-2">
                    {category.title}
                  </p>
                  <ul>
                    {category.items.map((item, itemIndex) => (
                      <FaqAccordion key={itemIndex} question={item.question}>
                        <Prose lg={false}>
                          {RenderRichTextWithImages(item.answerDoc, {
                            hasSupporterAccess,
                          })}
                        </Prose>
                      </FaqAccordion>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </SinglePage>
    </Layout>
  );
}
