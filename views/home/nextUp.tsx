import Pill from "../../components/pill";

export default function NextUp() {
  return (
    <section className="bg-orange border-t-2 border-b-2">
      <div className="flex">
        <div className="py-4 px-8 border-r-2">
          <Pill size="medium">
            <h2>Today</h2>
          </Pill>
        </div>
      </div>
    </section>
  );
}
