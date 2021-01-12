import { ImageLoaderProps } from "next/image";

export function contentful({ src, width, quality = 75 }: ImageLoaderProps) {
  console.log(width);
  return `${src}?w=${width}&q=${quality}&fm=jpg&fl=progressive`;
}
