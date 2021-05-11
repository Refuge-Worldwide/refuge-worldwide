import { Arrow } from "../icons/arrow";

export default function HeroCarousel() {
  return (
    <section className="relative">
      <ul className="carousel">
        <li>
          <a className="flex flex-col-reverse md:grid h-full">
            <article className="bg-black text-white">
              <header>
                <h1 className="font-serif">Title</h1>

                <p className="text-base">Subtitle</p>

                <div className="inline-flex items-center space-x-5 font-medium leading-none ">
                  <span className="underline">Listen Now</span>
                  <Arrow />
                </div>
              </header>
            </article>
          </a>
        </li>
      </ul>
    </section>
  );
}
