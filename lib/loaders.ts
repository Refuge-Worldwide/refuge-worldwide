import type { ImageLoader } from "next/image";

const loaders: Record<string, ImageLoader> = {
  contentful: ({ src, width, quality = 75 }) => {
    // crop images to 16:9 aspect ratio so we don't chop any faces in half
    const aspectRatio = 16 / 9;
    const height = Math.round(width / aspectRatio);
    return `${src}?w=${width}&h=${height}&q=${quality}&fm=jpg&fl=progressive&f=faces&fit=fill`;
  },
};

export default loaders;
