export default function Loading() {
  return (
    <div className="h-96 grid place-items-center">
      <h1 hidden>Loading...</h1>

      <img
        className="h-64 w-64 animate-spin-slow"
        src="/images/loading-circle.svg"
        alt=""
      />
    </div>
  );
}
