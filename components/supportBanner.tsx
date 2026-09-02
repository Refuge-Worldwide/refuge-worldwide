import Link from "next/link";

/** Plain clickable image that links to the support page — no visible label. */
export default function SupportBanner() {
  return (
    <section>
      <Link
        href="/support"
        // Mobile/tablet keeps the existing crop-to-fill banner. From lg up,
        // the banner becomes a fixed 450px-tall strip with a background
        // layer (green placeholder for now) showing behind the image, which
        // sits centered at its own natural width rather than stretching.
        className="relative block w-full aspect-[1920/823] overflow-hidden lg:aspect-auto lg:h-[450px] lg:flex lg:items-center lg:justify-center lg:bg-[#5E6614]"
      >
        <img
          src="/images/app-banner.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover lg:static lg:w-auto lg:h-full"
        />
        <span className="sr-only">Become a supporter</span>
      </Link>
    </section>
  );
}
