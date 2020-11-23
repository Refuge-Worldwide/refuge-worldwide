import { Fragment } from "react";
import FeaturedShows from "./featuredShows";
import LatestNews from "./latestNews";

export default function HomeView() {
  return (
    <Fragment>
      <FeaturedShows />

      {/* Slider */}
      <section>
        <h2>SLIDER HERE</h2>
      </section>

      <LatestNews />
    </Fragment>
  );
}
