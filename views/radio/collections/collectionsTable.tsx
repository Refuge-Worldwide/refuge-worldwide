import Carousel from "../../../components/carousel";
import { CollectionInterface } from "../../../types/shared";

export default function CollectionsTable({
  collections,
}: {
  collections: CollectionInterface[];
}) {
  return (
    <ul className="divide-black divide-y-2">
      {collections.map((collection, i) => (
        <li className="" key={i}>
          <Carousel
            type="show"
            items={collection.shows.items}
            title={collection.title}
            description={collection.description}
            viewAllLink={"/radio/collections/" + collection.slug}
          />
        </li>
      ))}
    </ul>
  );
}
