"use client";

import Image from "next/image";
import Link from "next/link";

interface BestSellingCardProps {
  title: string;
  imgUrl: string;
  url: string;
  price: string;
}

const BestSellingCard = ({ title, imgUrl, url, price }: BestSellingCardProps) => {
  return (
    <Link
      href={url}
      target="_blank"
      className="block rounded-xl overflow-hidden relative group cursor-pointer hover:scale-108 transition-transform duration-500 ease-out "
    >
      {/* Image */}
      <div className="aspect-3/4 bg-gray-100 w-full">
        <Image
          src={imgUrl}
          alt={title}
          width={500}
          height={500}
          className="w-full h-full object-cover object-center rounded-xl aspect-3/4"
        />
      </div>

      {/* Overlay — hidden by default, slides up on hover */}
      <div className=" translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out px-2 py-5">
        <div className="flex justify-between items-end text-primary uppercase font-medium">
          <h3 className="text-lg max-w-[150px] leading-tight">{title}</h3>
          <p className="text-sm shrink-0 ml-3">₹{price}</p>
        </div>
      </div>
    </Link>
  );
};

export default BestSellingCard;
