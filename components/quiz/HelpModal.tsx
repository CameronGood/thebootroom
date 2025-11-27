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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto bg-gradient-to-br from-[#2B2D30] to-[#1a1a1a] border border-[#F5E4D0]/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F5E4D0]/10 to-[#F5E4D0]/5 px-6 py-4 border-b border-[#F5E4D0]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5E4D0]/20 flex items-center justify-center">
              <span className="text-[#F5E4D0] font-semibold text-sm">?</span>
            </div>
            <h3 className="font-bold text-xl text-[#F4F4F4]">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-base text-[#F4F4F4] leading-relaxed space-y-4">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#1a1a1a]/50 border-t border-[#F5E4D0]/10">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] font-semibold transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

