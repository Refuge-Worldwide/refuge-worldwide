import Link from "next/link";

/** Plain clickable placeholder image that links to the support page — no visible label. */
export default function SupportBanner() {
  return (
    <section>
      {/* Test image — swap /images/support-banner-placeholder.svg for a real asset when ready */}
      <Link
        href="/support"
        className="relative block w-full aspect-[21/9] sm:aspect-[3/1] overflow-hidden"
      >
        <img
          src="/images/support-banner-placeholder.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="sr-only">Become a supporter</span>
      </Link>
    </section>
  );
}
