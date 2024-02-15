import { InferGetStaticPropsType } from "next";
import Layout from "../../../components/layout";
import PageMeta from "../../../components/seo/page";
import { getCollectionPageSingle } from "../../../lib/contentful/pages/radio";
import { getCollectionPathsToPreRender } from "../../../lib/contentful/paths";
import Pill from "../../../components/pill";
import ShowPreview from "../../../components/showPreview";

export default function CollectionPage({
  preview,
  title,
  description,
  image,
  shows,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout preview={preview}>
      <PageMeta title="Radio | Refuge Worldwide" path="radio/" />
      <div className="p-4 sm:p-8 min-h-[80vh]">
        <Pill>
          <h1>{title}</h1>
        </Pill>
        <div className="h-4"></div>
        <h2 className="font-sans text-small mb-12">{description}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {shows.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params, preview = false }) {
  return {
    props: {
      preview,
      ...(await getCollectionPageSingle(params.slug, preview)),
    },
  };
}

export async function getStaticPaths() {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }

  const paths = await getCollectionPathsToPreRender();

  return { paths, fallback: "blocking" };
}
