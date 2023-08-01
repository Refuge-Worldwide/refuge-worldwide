import { EventInterface } from "../../types/shared";
import Pill from "../../components/pill";
import EventRow from "../../components/eventRow";
import Image from "next/image";
export default function PastEvents({ events, title }) {
  return (
    <section className="pt-12">
      <div className="p-4 sm:p-8 border-b-2 sticky top-12 lg:top-14 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <Pill outline>
            <h2>Past {title}</h2>
          </Pill>
        </div>
      </div>

      <ul>
        {events.map((event) => (
          <EventRow past={true} key={event.slug} event={event} />
        ))}
      </ul>

      {/* {!isReachingEnd && !isRefreshing && ( */}
      {/* <div className="flex justify-center mt-10 sm:mt-8">
        <button
          // onClick={loadMore}
          className="inline-flex focus:outline-none rounded-full items-center justify-center group"
          aria-label="Load more shows"
        >
          <Image
            src="/images/load-more-button.svg"
            unoptimized
            aria-hidden
            width={128}
            height={128}
            priority
            alt=""
          />

          <span
            className="absolute rounded-full h-20 w-20 group-focus:ring-4"
            aria-hidden
          />
        </button>
      </div> */}
      {/* )} */}
    </section>
  );
}
