import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import Error from "../icons/error";
import BackButton from "../components/backButton";

export default function Custom404Page() {
  return (
    <Layout preview={false} className="bg-white">
      <PageMeta title="500: Error | Refuge Worldwide" />

      <section className="border-b border-white relative">
        <div className="absolute left-4 sm:left-8 top-3 sm:top-4 z-20">
          <BackButton backPath="/" />
        </div>
        <div className="container-md p-4 sm:p-8 min-h-[80vh] text-black flex flex-col items-center gap-12 justify-center">
          <Error />
          <h1 className="text-base text-center font-sans">
            Uh oh, signal lost...an error occured.
          </h1>
        </div>
      </section>
    </Layout>
  );
}
