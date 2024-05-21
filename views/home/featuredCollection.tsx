import { CollectionInterface } from "../../types/shared";
import Link from "next/link";
import { Arrow } from "../../icons/arrow";
import Carousel from "../../components/carousel";
import Image from "next/image";
import Pill from "../../components/pill";
export default function FeaturedCollection({
  collection,
}: {
  collection: CollectionInterface;
}) {
  return (
    <section className="border-t-2">
      <div className="w-full h-[400px] relative -mb-56">
        <Image
          src={collection.image.url}
          width={590}
          height={332}
          alt=""
          className="bg-black/25 object-cover w-full h-full"
        />
        <div className="absolute bg-orange/50 w-full h-full flex items-center justify-center top-0 left-0"></div>
        <div className="absolute top-8 left-8">
          <Pill>
            <h2>Featured Collection</h2>
          </Pill>
        </div>
        <Image
          src="/images/energy-crew.png"
          width={250}
          height={332}
          alt={collection.title}
          className="absolute top-[40%] left-8 transform -translate-y-1/2"
        />
        {/* <h2 className="font-sans text-large font-medium absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
          {collection.title}
        </h2> */}
      </div>

      <Carousel
        items={collection.shows.items}
        title={collection.title}
        // description={collection.description}
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
