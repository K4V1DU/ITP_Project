import React, { useState, useEffect, useRef } from "react";
import "./Banners.css";

function Banners() {
  const images = [
    "/banners/banner1.png",
    "/banners/banner2.png",
    "/banners/banner3.png",
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex]); // warning ignored

  const handleMouseEnter = () => clearTimeout(timeoutRef.current);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(nextSlide, 10000);
  };

  return (
    <div
      className="container__slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {images.map((src, index) => (
        <div
          key={index}
          className={`slider__item ${index === activeIndex ? "active" : "inactive"}`}
        >
          <img src={src} alt={`Banner ${index + 1}`} />
        </div>
      ))}

      <button className="slider__btn-prev" onClick={prevSlide}>
        {"<"}
      </button>
      <button className="slider__btn-next" onClick={nextSlide}>
        {">"}
      </button>
    </div>
  );
}

export default Banners;
