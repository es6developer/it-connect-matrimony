"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
}

const sizeMap = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
  xl: { icon: 64, text: "text-3xl" },
};

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const dims = sizeMap[size];

  const logo = (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="IT Connect Matrimony"
        width={dims.icon}
        height={dims.icon}
        className="rounded-lg"
        priority
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-extrabold tracking-wide ${dims.text}`}>
            <span className="text-blue-400">IT</span>{" "}
            <span className="text-white">CONNECT</span>
          </span>
          <span className="text-[0.6em] font-bold tracking-[0.3em] text-amber-400">
            MATRIMONY
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0">
        {logo}
      </Link>
    );
  }

  return logo;
}
