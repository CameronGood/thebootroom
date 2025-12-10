"use client";

import { ReactNode } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function HelpModal({
  isOpen,
  onClose,
  title,
  children,
}: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[130px]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#040404]" />
      
      {/* Modal Content */}
      <div
        className="relative z-10 w-[90%] max-w-6xl mx-auto bg-[#2B2D30] border-[3px] border-[#F5E4D0]/10 overflow-hidden max-h-[calc(100vh-130px-2rem)] overflow-y-auto hide-scrollbar rounded-[4px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-[3px] border-[#F5E4D0]/10 bg-[#2B2D30]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold uppercase text-[#F4F4F4]">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 border-[3px] border-[#F5E4D0]/10 bg-[#F4F4F4] hover:bg-[#E8D4B8] text-[#2B2D30] inline-flex items-center justify-center font-bold text-lg rounded-[4px] transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 bg-[#2B2D30]">
          <div className="text-base lg:text-lg text-[#F4F4F4] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

