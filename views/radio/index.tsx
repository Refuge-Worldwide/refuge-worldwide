import { Fragment } from "react";
import AllShows from "./allShows";
import NextShows from "./nextShows";

export default function RadioView() {
  return (
    <Fragment>
      <NextShows />

      <AllShows />
    </Fragment>
  );
}
