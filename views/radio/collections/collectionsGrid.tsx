import Carousel from "../../../components/carousel";
import { CollectionInterface } from "../../../types/shared";
import CollectionPreview from "../../../components/collectionPreview";

export default function CollectionsGrid({
  collections,
}: {
  collections: CollectionInterface[];
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8 p-4 sm:p-8">
      {collections.map((collection, i) => (
        <li key={i}>
          <CollectionPreview {...collection} />
        </li>
      ))}
    </ul>
  );
}
