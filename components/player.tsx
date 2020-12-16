export default function Player() {
  return (
    <section className="bg-black text-white">
      <div className="pt-2 pb-2 grid grid-cols-10">
        <div className="col-span-1">
          <div className="px-4 md:px-8">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red" />
              <p>Live</p>
            </div>
          </div>
        </div>
        <div className="col-span-8">
          <p>
            Show Name this the name of a show Shuya Okino With ­Takeshi
            Yamaguchi, ­Masaki Tamura, Sara Aiko
          </p>
        </div>
        <div className="col-span-1">{/* Play / Pause */}</div>
      </div>
    </section>
  );
}
