"use client";

import { SockThickness } from "@/types";
import QuizOptionButton from "@/components/quiz/QuizOptionButton";

interface SockThicknessSelectorProps {
  value: SockThickness;
  onChange: (value: SockThickness) => void;
}

export default function SockThicknessSelector({
  value,
  onChange,
}: SockThicknessSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 max-w-2xl">
        <button
          onClick={() => onChange("thin")}
          className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
            value === "thin"
              ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
              : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
          }`}
        >
          Thin
        </button>
        <button
          onClick={() => onChange("medium")}
          className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
            value === "medium"
              ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
              : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => onChange("thick")}
          className={`px-6 py-2 border font-bold uppercase text-lg rounded-[4px] transition-all duration-200 w-full sm:w-auto ${
            value === "thick"
              ? "bg-[#F5E4D0] text-[#2B2D30] border-[#F5E4D0]"
              : "bg-transparent text-[#F4F4F4] border-[#F5E4D0]/10 hover:border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/10"
          }`}
        >
          Thick
        </button>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-[4px]">
        <p className="text-base text-[#F4F4F4]/90">
          <span className="font-semibold text-blue-400">Tip:</span> Thin socks
          recommended for best measurement accuracy.
        </p>
      </div>
    </div>
  );
}


