"use client";

import { ButtonHTMLAttributes } from "react";

interface QuizOptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function QuizOptionButton({
  active = false,
  className = "",
  type = "button",
  ...rest
}: QuizOptionButtonProps) {
  const baseClasses =
    "px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 bg-[#2B2D30] w-full sm:w-auto";
  const activeClasses =
    "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]";
  const inactiveClasses =
    "text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10";

  return (
    <button
      type={type}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${className}`}
      {...rest}
    />
  );
}

