import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import Prose from "../components/Prose";
import PageMeta from "../components/seo/page";
import { SupportButton } from "@/components/supportButton";
import { getSupportPage } from "../lib/contentful/pages/support";
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
  // Split the single rich-text field into an intro (its first block) and the
  // rest, so the support picker can sit between them. There's no separate
  // "intro" field in Contentful yet — if that changes, this split can go away.
  const blocks: any[] = content?.json?.content ?? [];
  const introDoc = content?.json && {
    ...content.json,
    content: blocks.slice(0, 1),
  };
  const restDoc = content?.json && {
    ...content.json,
    content: blocks.slice(1),
  };

  return (
    <Layout preview={preview} pageId="Aa4GRMf6fuDtkH0UhkX19">
      <PageMeta title="Support | Refuge Worldwide" path="support/" />

      <SinglePage coverImage={coverImage}>
        <section>
          <div className="container-md p-4 sm:p-8 bg-white">
            <Prose>{documentToReactComponents(introDoc)}</Prose>
          </div>
        </section>

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

        {blocks.length > 1 && (
          <section>
            <div className="container-md p-4 sm:p-8 bg-white">
              <Prose>{documentToReactComponents(restDoc)}</Prose>
            </div>
          </section>
        )}
      </SinglePage>
    </Layout>
  );
}
