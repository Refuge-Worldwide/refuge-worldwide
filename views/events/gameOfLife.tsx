import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "../../icons/arrow";

export default function GameOfLife() {
  // var gameOfLife = new terra.Terrarium(25, 25, {
  //   trails: 0.9,
  //   periodic: true,
  //   background: [22, 22, 22],
  // });

  // terra.registerCA(
  //   {
  //     type: "GoL",
  //     colorFn: function () {
  //       return this.alive ? this.color + ",1" : "0,0,0,0";
  //     },
  //     process: function (neighbors, x, y) {
  //       var surrounding = neighbors.filter(function (spot) {
  //         return spot.creature.alive;
  //       }).length;
  //       this.alive = surrounding === 3 || (surrounding === 2 && this.alive);
  //       return true;
  //     },
  //   },
  //   function () {
  //     this.alive = Math.random() < 0.5;
  //   }
  // );

  // gameOfLife.grid = gameOfLife.makeGrid("GoL");
  // gameOfLife.animate();

  return (
    <section className="h-[80vh] p-8 md:p-24 bg-[#00AF40]">
      {/* <head>
        <script src="//cdn.jsdelivr.net/terra/latest/mainfile"></script>
      </head> */}
      <Image
        src="/images/Euro_Tour_Poster_2023.jpg"
        width={400}
        height={565}
        alt=""
        className="h-full w-auto mx-auto"
      />
    </section>
  );
}
