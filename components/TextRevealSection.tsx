import React from "react";
import ScrollReveal from "./Reusable/ScrollReveal";

const TextRevealSection = () => {
  const TEXT =
    "Blue & Blues was born from the belief that the things we carry everyday should be worth carrying forever. Crafted by Indian artisans for generations. Made in small batches, with care, precision and meaning.";

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
