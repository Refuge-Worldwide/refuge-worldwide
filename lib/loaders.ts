import type { ImageLoader } from "next/future/image";

const loaders: Record<string, ImageLoader> = {
  contentful: ({ src, width, quality = 75 }) => {
    return `${src}?w=${width}&q=${quality}&fm=jpg&fl=progressive`;
  },
};

export default loaders;
