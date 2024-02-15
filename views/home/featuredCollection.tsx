import { CollectionInterface } from "../../types/shared";
import Link from "next/link";
import { Arrow } from "../../icons/arrow";
import Carousel from "../../components/carousel";
export default function FeaturedCollection({
  collection,
}: {
  collection: CollectionInterface;
}) {
  return (
    <section className="border-b-2">
      <Carousel
        items={collection.shows}
        title={collection.title}
        description={collection.description}
        viewAllLink={"/radio/collections/" + collection.slug}
        type="show"
      />
      <div className="text-center mt-6 sm:mt-8 mb-4 sm:mb-6">
        <Link
          href="/radio/collections"
          className="inline-flex items-center space-x-4 text-base font-medium"
        >
          <span className="underline">All Collections</span>
          <Arrow />
        </Link>
      </div>
      <div className="h-8 sm:h-10"></div>
    </section>
  );
}
