import Image from "next/image";

export default function Loading() {
  return (
    <div className="block h-96 mt-24 text-center font-medium text-base">
      <Image
        className="mx-auto"
        src="/images/loading.gif"
        width={100}
        height={100}
        alt="Loading"
      />
    </div>
  );
}
