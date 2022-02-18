export const SEO = {
  DESCRIPTION:
    "Refuge Worldwide is a community radio station and fundraising platform based in Berlin.",
  ROOT: "https://refugeworldwide.com",
};

export const TWITTER_URL = "https://twitter.com/RefugeWorldwide";

export const INSTAGRAM_URL = "https://instagram.com/RefugeWorldwide/";

export const SOUNDCLOUD_URL = "https://soundcloud.com/RefugeWorldwide/";

export const MIXCLOUD_URL = "https://www.mixcloud.com/RefugeWorldwide/";

export const PATREON_URL = "https://www.patreon.com/refugeworldwide";

export const CONTACT_URL = "mailto:hello@refugeworldwide.com";

export const SHOP_URL = "https://shop.refugeworldwide.com";

export const ALPHABET = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "#",
];

export const REGEX = {
  NUMERIC: new RegExp(/^\d+$/iu),
  SPECIAL: new RegExp(/\W|_/iu),
};

export const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`;
