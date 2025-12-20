import { BootSummary, QuizAnswers, Volume, ToeShape } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BootComparisonTableProps {
  boots: BootSummary[];
  userAnswers: QuizAnswers;
  selectedModels?: Record<string, Set<number>>;
}

export default function BootComparisonTable({
  boots,
  userAnswers,
  selectedModels,
}: BootComparisonTableProps) {
  if (!boots || boots.length === 0) {
    return null;
  }

  // Check if a boot is selected for comparison
  const isBootSelected = (boot: BootSummary): boolean => {
    if (!selectedModels) return true; // If no selection data, assume all are selected
    
    // Check if selectedModels is empty (no selections made at all)
    const hasAnySelections = Object.keys(selectedModels).length > 0 && 
      Object.values(selectedModels).some(set => set.size > 0);
    
    // If no selections have been made at all, show all boots
    if (!hasAnySelections) return true;
    
    const selectedIndices = selectedModels[boot.bootId];
    if (!selectedIndices || selectedIndices.size === 0) return false;
    
    // For boots with models, check if any model is selected
    if (boot.models && boot.models.length > 0) {
      return Array.from(selectedIndices).some(index => 
        index >= 0 && index < boot.models!.length
      );
    }
    
    // For single-model boots, check if index 0 is selected
    return selectedIndices.has(0);
  };

  // Calculate match for each characteristic
  const calculateMatch = (
    boot: BootSummary,
    characteristic: "toeBox" | "instep" | "ankle" | "calf"
  ): boolean => {
    switch (characteristic) {
      case "toeBox":
        return boot.toeBoxShape === userAnswers.toeShape;
      case "instep":
        return (
          boot.instepHeight?.includes(userAnswers.instepHeight) ?? false
        );
      case "ankle":
        return (
          boot.ankleVolume?.includes(userAnswers.ankleVolume) ?? false
        );
      case "calf":
        return (
          boot.calfVolume?.includes(userAnswers.calfVolume) ?? false
        );
      default:
        return false;
    }
  };

  const characteristics = [
    { key: "toeBox" as const, label: "Toe Box" },
    { key: "instep" as const, label: "Instep" },
    { key: "ankle" as const, label: "Ankle" },
    { key: "calf" as const, label: "Calf" },
  ];

  return (
    <div className="mt-0 mb-0">
      {/* Header section with container */}
      <Card className="bg-[#2B2D30] border-[#F5E4D0]/20 shadow-lg rounded-b-none">
        <CardContent className="pt-8 pb-6 px-6 sm:pt-8 sm:pb-7 sm:px-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#F4F4F4] mb-4">
              Boot-to-Boot Comparison
            </h3>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-[#F4F4F4]/90 font-medium">Match</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <span className="text-[#F4F4F4]/90 font-medium">Might need adjustment.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table outside container - no gap */}
      <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 scrollbar-thin scrollbar-thumb-[#F5E4D0]/20 scrollbar-track-transparent">
        <div className="border border-[#F5E4D0]/20 rounded-t-none rounded-lg overflow-hidden min-w-full bg-[#1A1C1E] shadow-inner">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-[#1A1C1E] to-[#1A1C1E]/95">
                <th className="text-left px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-sm font-bold text-[#F4F4F4] border-b-2 border-[#F5E4D0]/30 sticky left-0 bg-gradient-to-b from-[#1A1C1E] to-[#1A1C1E]/95 z-10 min-w-[100px] sm:min-w-[120px] md:min-w-[140px]">
                  {/* Empty header for characteristic column */}
                </th>
                {boots.map((boot) => {
                  const isSelected = isBootSelected(boot);
                  return (
                    <th
                      key={boot.bootId}
                      className={`text-center px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-sm font-semibold border-b-2 border-l border-[#F5E4D0]/20 min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] ${
                        isSelected 
                          ? "text-[#F4F4F4] bg-[#1A1C1E]/50" 
                          : "text-[#F4F4F4]/50 bg-[#1A1C1E]/30"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1 md:gap-1.5">
                        {isSelected ? (
                          <>
                            <span className="font-bold text-sm sm:text-base md:text-lg text-[#F5E4D0] leading-tight">
                              {boot.brand}
                            </span>
                            <span className="text-xs sm:text-sm text-[#F4F4F4]/70 font-normal leading-tight">
                              {boot.model}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-sm sm:text-base text-[#F4F4F4]/50 leading-tight">
                            Not included
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {characteristics.map((char, rowIndex) => (
                <tr
                  key={char.key}
                  className={`transition-colors duration-150 ${
                    rowIndex % 2 === 0
                      ? "bg-[#2B2D30] hover:bg-[#2B2D30]/95"
                      : "bg-[#2B2D30]/80 hover:bg-[#2B2D30]/85"
                  }`}
                >
                  <td className="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 text-sm font-semibold text-[#F4F4F4] border-b border-[#F5E4D0]/10 sticky left-0 bg-inherit z-10 min-w-[100px] sm:min-w-[120px] md:min-w-[140px]">
                    {char.label}
                  </td>
                  {boots.map((boot) => {
                    const isSelected = isBootSelected(boot);
                    const isMatch = calculateMatch(boot, char.key);
                    return (
                      <td
                        key={boot.bootId}
                        className={`text-center px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 border-b border-l border-[#F5E4D0]/10 transition-colors duration-150 ${
                          !isSelected
                            ? "bg-[#1A1C1E]/20"
                            : isMatch 
                              ? "bg-green-500/8 hover:bg-green-500/12" 
                              : "bg-orange-500/8 hover:bg-orange-500/12"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {!isSelected ? (
                            <span className="text-xs sm:text-sm text-[#F4F4F4]/30 font-medium">
                              —
                            </span>
                          ) : isMatch ? (
                            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" strokeWidth={2.5} />
                              <span className="text-[10px] sm:text-xs text-green-400/80 font-medium uppercase tracking-wide hidden sm:inline">
                                Match
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                              <Circle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400" strokeWidth={2.5} />
                              <span className="text-[10px] sm:text-xs text-orange-400/80 font-medium uppercase tracking-wide hidden sm:inline">
                                Might need adjustment.
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

