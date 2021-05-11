import { Arrow } from "../icons/arrow";

export default function HeroCarousel() {
  return (
    <section className="relative">
      <ul className="carousel">
        <li>
          <a className="flex flex-col-reverse md:grid h-full">
            <article className="bg-black text-white">
              <header className="flex-1 p-4 lg:p-8">
                <h1 className="font-serif text-base sm:text-large">Title</h1>

                <div className="h-4" />

                <p>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.{" "}
                </p>

                <div className="h-6" />

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
