import { InferGetStaticPropsType } from "next";
import Layout from "../components/layout";
import { getSubmissionPage } from "../lib/contentful/pages/submission";
import SinglePage from "../views/singlePage";
import Script from "next/script";
import PageMeta from "../components/seo/page";

export async function getStaticProps({ preview = false }) {
  return {
    props: {
      ...(await getSubmissionPage(preview)),
    },
  };
}

export default function Workshop({
  coverImage,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const tallyID = "wbWoOo";
  const tallyEmbed = `https://tally.so/embed/${tallyID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <Layout>
      <PageMeta title="Residents Feedback | Refuge Worldwide" path="about/" />
      <SinglePage coverImage={coverImage} objectPosition="center">
        <div className="container-md p-4 sm:p-8 bg-white">
          <h1 className="text-base sm:text-large text-center mb-12">
            Refuge Worldwide Residents Feedback
          </h1>
          <div className="mt-16 max-w-[750px] mx-auto">
            <iframe
              src={tallyEmbed}
              width="100%"
              height="800"
              title="Application form"
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
