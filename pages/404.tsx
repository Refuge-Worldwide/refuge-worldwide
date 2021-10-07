import Layout from "../components/layout";
import PageMeta from "../components/seo/page";

export default function Custom404Page() {
  return (
    <Layout preview={false} className="bg-black">
      <PageMeta title="404: This page could not be found | Refuge Worldwide" />

      <section className="border-b border-white">
        <div className="container-md p-4 sm:p-8">
          <div className="h-32 sm:h-64" />

          <div className="text-white">
            <h1 className="text-base sm:text-large text-center">
              404: This page could not be found
            </h1>
          </div>

          <div className="h-32 sm:h-64" />
        </div>
      </section>
    </Layout>
  );
}
