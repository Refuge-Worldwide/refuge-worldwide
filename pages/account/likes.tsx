import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/lib/supabase/server-props";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import ShowPreview from "../../components/showPreview";
import Link from "next/link";
import useSWR from "swr";
import { IoArrowBack } from "react-icons/io5";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type LikesPageProps = {
  user: { id: string; email: string };
};

export default function LikesPage({ user }: LikesPageProps) {
  const { data, error, isLoading } = useSWR("/api/user/likes", fetcher);

  return (
    <Layout>
      <PageMeta
        title="Favorite Shows | Refuge Worldwide"
        path="account/likes/"
      />

      <div className="min-h-[75vh] bg-blue">
        {/* Header */}
        <div className="p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-white hover:underline mb-6"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Back to Account</span>
            </Link>

            <h1 className="font-serif text-large text-white mb-2">
              Favorite Shows
            </h1>
            <p className="text-small text-white/80">
              Shows you&apos;ve liked from the archive
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 sm:p-8 min-h-[50vh]">
          <div className="max-w-4xl mx-auto">
            {isLoading && (
              <p className="text-small">Loading your favorite shows...</p>
            )}

            {error && (
              <p className="text-small text-red">Error loading shows</p>
            )}

            {data?.shows?.length === 0 && (
              <div className="border-2 border-black rounded-3xl p-8 text-center">
                <p className="mb-4">You haven&apos;t liked any shows yet.</p>
                <Link
                  href="/radio"
                  className="inline-block bg-black text-white rounded-full py-3 px-6 hover:bg-black/80 transition-colors"
                >
                  Browse the Archive
                </Link>
              </div>
            )}

            {data?.shows?.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.shows.map((show: any) => (
                  <li key={show.id}>
                    <ShowPreview
                      id={show.id}
                      title={show.title}
                      slug={show.slug}
                      date={show.date}
                      mixcloudLink={show.mixcloudLink}
                      coverImage={show.coverImage}
                      genres={show.genres}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: { id: user.id, email: user.email },
    },
  };
}
