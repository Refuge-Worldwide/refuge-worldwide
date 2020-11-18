export interface CoverImage {
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
}

export interface ImageInterface extends CoverImage {}

export interface ArtistInterface {
  name: string;
  photo: ImageInterface;
}
