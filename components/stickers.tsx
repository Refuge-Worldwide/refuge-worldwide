import React, { useState, useEffect } from "react";

const stickers = Array.from(
  { length: 26 },
  (_, i) => `/images/stickers/Stickers-${i}.svg`
);

const getRandomSticker = () => {
  const randomIndex = Math.floor(Math.random() * stickers.length);
  return stickers[randomIndex];
};

const getRandomPosition = () => {
  const x = Math.floor(Math.random() * window.innerWidth - 100);
  const y = Math.floor(Math.random() * window.innerHeight - 100);
  return { x, y };
};

const getRandomInterval = () => {
  return Math.random() * (2000 - 500) + 500;
};

const Stickers = () => {
  const [showStickers, setShowStickers] = useState([]);
  const [inactiveTime, setInactiveTime] = useState(0);

  useEffect(() => {
    let timeout;
    let interval;
    let inactiveTimeout;

    const addStickerWithRandomInterval = () => {
      const newSticker = {
        src: getRandomSticker(),
        position: getRandomPosition(),
      };
      setShowStickers((prevStickers) => [...prevStickers, newSticker]);
      interval = setTimeout(addStickerWithRandomInterval, getRandomInterval());
    };

    const handleUserInteraction = () => {
      clearTimeout(timeout);
      clearInterval(interval);
      setShowStickers([]);
      setInactiveTime(0);
      timeout = setTimeout(() => {
        addStickerWithRandomInterval();
      }, 30000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleUserInteraction();
      } else {
        clearTimeout(timeout);
        clearInterval(interval);
      }
    };

    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div>
      {showStickers.map((sticker, index) => (
        <img
          key={index}
          src={sticker.src}
          alt="Random Sticker"
          className="fixed z-50 drop-shadow w-[50vw] h-[50vw] md:w-[25vw] md:h-[25vw]"
          style={{
            left: `${sticker.position.x}px`,
            top: `${sticker.position.y}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Stickers;
