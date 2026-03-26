import React from "react";
import ScrollReveal from "./Reusable/ScrollReveal";

const TextRevealSection = () => {
  const TEXT =
    "Blue & Blues is a quiet luxury leather goods brand rooted in Italian design heritage and crafted through Indian artistry. Founded in Milan, our philosophy blends purposeful design with timeless elegance—where form follows meaning, and every detail serves a reason. Created in small batches using responsibly sourced materials, our pieces are designed to move effortlessly through modern life, evolving with you and developing a character uniquely your own. Blue & Blues creates companions for life, not products for moments.";

  return (
    <div data-light-bg className=" py-20  px-6">
        <div className=" max-w-6xl mx-auto">

      <ScrollReveal
        baseOpacity={0.1}
        enableBlur
        baseRotation={0}
        blurStrength={1}
      >
        {TEXT}
      </ScrollReveal>
        </div>
    </div>
  );
};

export default TextRevealSection;
