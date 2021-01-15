export default function Alert() {
  return (
    <section className="bg-red py-4">
      <p className="text-center font-medium">
        This is page is a preview.{" "}
        <a href="/api/exit-preview" className="underline">
          Click here
        </a>{" "}
        to exit preview mode.
      </p>
    </section>
  );
}
