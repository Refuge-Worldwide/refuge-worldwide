export default function Player() {
  return (
    <div className="bg-black text-white grid grid-cols-10">
      <div className="col-span-1">
        <p>Live</p>
      </div>
      <div className="col-span-8">
        <p>
          Show Name this the name of a show Shuya Okino With ­Takeshi Yamaguchi,
          ­Masaki Tamura, Sara Aiko
        </p>
      </div>
      <div className="col-span-1">{/* Play / Pause */}</div>
    </div>
  );
}
