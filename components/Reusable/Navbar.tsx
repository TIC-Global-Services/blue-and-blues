"use client";

import { useState } from "react";
import Image from "next/image";
import { IoSearch as Search } from "react-icons/io5";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const NavLinks = [
    { name: "Shop", href: "/" },
    { name: "Collections", href: "/" },
    { name: "About", href: "/" },
    { name: "Care", href: "/" },
    { name: "Search", icon: Search, href: "/" },
    { name: "Account", href: "/" },
    { name: "Cart", href: "/" },
  ];

  const leftLinks = NavLinks.slice(0, 4);
  const rightLinks = NavLinks.slice(4);

  return (
    <>
      {/* NAVBAR */}
      <div className="absolute top-4 z-50 text-white w-full uppercase backdrop-blur-xs rounded-xl left-1/2 -translate-x-1/2">
        <div className=" mx-auto flex items-center justify-between py-6 px-10">
          {/* LEFT (desktop only) */}
          <div className="hidden md:flex items-center gap-6">
            {leftLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-sm hover:text-white/70 transition"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button onClick={() => setOpen(true)} className="md:hidden text-2xl">
            <HiOutlineMenu />
          </button>

          {/* CENTER LOGO */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Image
              src={"/logo/blues-logo.png"}
              alt="Blue & Blues Logo"
              width={100}
              height={100}
            />
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-6">
            {rightLinks.map((link, i) => {
              if (link.name === "Search" && link.icon) {
                const Icon = link.icon;

                return (
                  <a key={i} href={link.href}>
                    <Icon className="text-xl hover:text-white/70 transition" />
                  </a>
                );
              }

              return (
                <a
                  key={i}
                  href={link.href}
                  className="text-sm hover:text-white/70 transition"
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* MOBILE RIGHT ICONS */}
          <div className="md:hidden flex items-center gap-4">
            <Search className="text-xl" />
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`
          fixed inset-0 z-50
          bg-black/90 backdrop-blur-md
          transition-all duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 text-white text-3xl"
        >
          <HiOutlineX />
        </button>

        {/* MENU CONTENT */}
        <div className="h-full flex flex-col items-center justify-center gap-8 text-white uppercase">
          {NavLinks.map((link, i) => {
            if (link.name === "Search") return null;

            return (
              <a
                key={i}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`
                  text-2xl tracking-wide
                  transition-all duration-300
                  ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {link.name}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
