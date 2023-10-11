import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";

export default function MixedFeelingsPlayer() {
  const { pathname } = useRouter();
  const isHomePage = pathname === "/";

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  return (
    <div ref={ref} className={`flex items-stretch bg-black text-white`}>
      <div className={`${isHomePage && "aspect-video grow"} `}>
        <div
          className={`${
            inView && isHomePage
              ? ""
              : "fixed bottom-4 right-4 z-50 w-1/3 max-w-2xl"
          }`}
        >
          <div className={`${inView && "hidden"} bg-black px-4 py-3`}>
            <span>Mixed feelings</span>
          </div>
          <iframe
            className="aspect-video"
            width="100%"
            height="auto"
            src="https://www.youtube.com/embed/gMNHvXSW4iE?si=Uurr0Qin5XqUep8T"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>
      <div
        className={`${
          !isHomePage && "hidden"
        } p-6 max-w-2xl flex flex-col justify-between`}
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>More info</p>
      </div>
    </div>
  );
}
