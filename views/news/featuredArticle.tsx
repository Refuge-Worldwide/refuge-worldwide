import Link from "next/link";
import Badge from "../../components/badge";
import Date from "../../components/date";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";

export default function FeaturedArticle() {
  return (
    <article className="bg-green">
      <header className="border-2">
        <Pill>
          <span className="font-serif">Featured</span>
        </Pill>
        <p className="font-medium">
          <Date dateString="2020-08-08" />
        </p>
        <h1 className="text-large">What is it like to change the game?</h1>
        <p className="font-medium">Interview with Alex Barck</p>
        <Badge text={"Interview"} />
        <p>
          Monthly show from Kyoto, Japan’s original capital city, presented by
          Shuya Okino, music tastemaker and member of Kyoto Jazz Massive.
        </p>
        <Link href={`/news/`}>
          <a className="inline-flex items-center space-x-5 font-medium leading-none">
            <span className="underline">Read more</span>
            <Arrow />
          </a>
        </Link>
      </header>
      <main className="border-2 bg-white">IMAGE HERE</main>
    </article>
  );
}
