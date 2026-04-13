"use client";

import Image from "next/image";
import Link from "next/link";

interface BestSellingCardProps {
  title: string;
  imgUrl: string;
  url: string;
  price: string;
  showInfo?: boolean; 
}

const BestSellingCard = ({
  title,
  imgUrl,
  url,
  price,
  showInfo = true,
}: BestSellingCardProps) => {
  return (
    <Link href={url} target="_blank" className="block text-center">
      <div className="relative rounded-xl overflow-hidden bg-white shadow-md">
        <div className="aspect-[3/4] w-full">
          <Image src={imgUrl} alt={title} fill className="object-cover" />
        </div>
      </div>

      {/* Conditional text */}
      {showInfo && (
        <div className="mt-5 space-y-1">
          <h3 className="text-primary uppercase font-medium text-sm leading-tight">
            {title}
          </h3>
          <p className="text-black/80 text-sm font-medium">
            ₹{Number(price).toLocaleString("en-IN")}
          </p>
        </div>
      )}
    </Link>
  );
};

export default  BestSellingCard;