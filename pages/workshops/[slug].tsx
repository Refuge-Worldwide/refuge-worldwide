import { InferGetStaticPropsType } from "next";
import Layout from "../../components/layout";
import Prose from "../../components/Prose";
import WorkshopMeta from "../../components/seo/workshop";
import { getWorkshopPageSingle } from "../../lib/contentful/pages/workshops";
import { getWorkshopPathsToPreRender } from "../../lib/contentful/paths";
import { renderRichTextWithImages } from "../../lib/rich-text";
import SinglePage from "../../views/singlePage";
import Script from "next/script";

export default function Workshop({
  workshop,
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const tallyID = workshop.tallyFormLink.split("/").pop();
  const tallyEmbed = `https://tally.so/embed/${tallyID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  return (
    <Layout preview={preview}>
      <WorkshopMeta {...workshop} />
      <SinglePage
        coverImage={workshop.coverImage}
        objectPosition="center"
        backPath="/events"
      >
        <div className="container-md p-4 sm:p-8 bg-white">
          <h1 className="text-base sm:text-large text-center mb-12">
            {workshop.title}
          </h1>

          <div>
            <Prose>{renderRichTextWithImages(workshop.content)}</Prose>
          </div>
          <div className="mt-16 max-w-[750px] mx-auto">
            <iframe
              src={tallyEmbed}
              width="100%"
              height="1600"
              title={workshop.title + " form"}
              className="mb-24"
              loading="lazy"
            ></iframe>

            {/* Add back in when tally works with router */}
            {/* <Script
              id="tally-js"
              src="https://tally.so/widgets/embed.js"
              onReady={() => {
                console.log("script ready");
                let Tally: any;
                Tally?.loadEmbeds();
              }}
            /> */}
          </div>
        </div>
      </SinglePage>
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  return {
    props: { preview, ...(await getWorkshopPageSingle(params.slug, preview)) },
  };
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const paths = await getWorkshopPathsToPreRender();

  return { paths, fallback: "blocking" };
}
