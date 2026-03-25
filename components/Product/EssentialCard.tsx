import Image from "next/image";
import Link from "next/link";
import React from "react";

interface EssentialCardProps {
  title: string;
  imgUrl: string;
  url: string;
  price: string;
}

const EssentialCard = ({ title, imgUrl, url, price }: EssentialCardProps) => {
  return (
    <div className="border border-gray-200 rounded-xl p-2 group hover:border-primary/30 transition-colors duration-300">
      <Link href={url} target="_blank" className="block space-y-3">
        <div className="rounded-lg overflow-hidden aspect-3/4 bg-gray-50">
          <Image
            src={imgUrl}
            alt={title}
            width={500}
            height={500}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="text-primary uppercase font-medium flex justify-between items-end px-1 pb-1">
          <h3 className="text-sm leading-tight">{title}</h3>
          <p className="text-sm shrink-0 ml-2">₹{price}</p>
        </div>
      </Link>
    </div>
  );
};

export default EssentialCard;
