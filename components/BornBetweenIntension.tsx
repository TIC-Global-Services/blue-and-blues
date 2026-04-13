
import MobileBornBetween from "@/components/MobileBornBetween";
import DesktopBornBetween from "./DesktopBornBetween";

export default function BornBetweenIntension() {
  return (
    <>
      {/* Mobile */}
      <MobileBornBetween />

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopBornBetween />
      </div>
    </>
  );
}