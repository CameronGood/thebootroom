"use client";

import { useState, useEffect, useMemo } from "react";
import {
  listBoots,
  deleteBoot,
  upsertBoot,
  bootExists,
} from "@/lib/firestore/boots";
import { Boot } from "@/types";
import Spinner from "@/components/Spinner";
import BootFormModal from "./BootFormModal";
import { auth } from "@/lib/firebase";

export default function BootsTab() {
  const [boots, setBoots] = useState<(Boot & { bootId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
    duplicates?: number;
    skipped?: number;
    total?: number;
  } | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterBootType, setFilterBootType] = useState<string>("all");
  const [filterWidth, setFilterWidth] = useState<string>("all");
  const [filterInstepHeight, setFilterInstepHeight] = useState<string>("all");
  const [filterAnkleVolume, setFilterAnkleVolume] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "brand" | "model" | "flex"
  >("brand");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingBoot, setEditingBoot] = useState<
    (Boot & { bootId: string }) | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBoots();
  }, []);

  const fetchBoots = async () => {
    setLoading(true);
    try {
      const allBoots = await listBoots();
      setBoots(allBoots as (Boot & { bootId: string })[]);
    } catch (error) {
      console.error("Error fetching boots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueWidths = useMemo(() => {
    const widths = [...new Set(boots.map((b) => b.bootWidth).filter(Boolean))].sort();
    return widths;
  }, [boots]);

  const uniqueBootTypes = useMemo(() => {
    const types = new Set<string>();
    boots.forEach((boot) => {
      if (boot.bootType) {
        // Handle both string and object formats (for backwards compatibility)
        if (typeof boot.bootType === "string") {
          types.add(boot.bootType);
        } else if (typeof boot.bootType === "object") {
          // Legacy format: convert object to strings
          const legacyType = boot.bootType as any;
          if (legacyType.standard) types.add("Standard");
          if (legacyType.freestyle) types.add("Freestyle");
          if (legacyType.hybrid) types.add("Hybrid");
          if (legacyType.freeride) types.add("Freeride");
        }
      }
    });
    return Array.from(types).sort();
  }, [boots]);

  const uniqueInstepHeights = useMemo(() => {
    const heights = new Set<string>();
    boots.forEach((boot) => {
      const instepArray = Array.isArray(boot.instepHeight) 
        ? boot.instepHeight 
        : boot.instepHeight ? [boot.instepHeight] : [];
      instepArray.forEach((h) => heights.add(h));
    });
    return Array.from(heights).sort();
  }, [boots]);

  const uniqueAnkleVolumes = useMemo(() => {
    const volumes = new Set<string>();
    boots.forEach((boot) => {
      const ankleArray = Array.isArray(boot.ankleVolume) 
        ? boot.ankleVolume 
        : boot.ankleVolume ? [boot.ankleVolume] : [];
      ankleArray.forEach((v) => volumes.add(v));
    });
    return Array.from(volumes).sort();
  }, [boots]);

  // Filter and sort boots
  const filteredAndSortedBoots = useMemo(() => {
    let filtered = boots.filter((boot) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        // Convert bootType to string for searching
        const bootTypeStr =
          typeof boot.bootType === "string"
            ? boot.bootType
            : typeof boot.bootType === "object" && boot.bootType
              ? (() => {
                  const legacyType = boot.bootType as any;
                  return [
                    legacyType.standard ? "Standard" : "",
                    legacyType.freestyle ? "Freestyle" : "",
                    legacyType.hybrid ? "Hybrid" : "",
                    legacyType.freeride ? "Freeride" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                })()
              : "";
        const matchesSearch =
          boot.brand.toLowerCase().includes(searchLower) ||
          boot.model.toLowerCase().includes(searchLower) ||
          bootTypeStr.toLowerCase().includes(searchLower) ||
          boot.year.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filterGender !== "all" && boot.gender !== filterGender) {
        return false;
      }

      // Boot type filter
      if (filterBootType !== "all") {
        const bootTypeMatches =
          typeof boot.bootType === "string"
            ? boot.bootType === filterBootType
            : typeof boot.bootType === "object" && boot.bootType
              ? (() => {
                  const legacyType = boot.bootType as any;
                  return (
                    (filterBootType === "Standard" && legacyType.standard) ||
                    (filterBootType === "Freestyle" && legacyType.freestyle) ||
                    (filterBootType === "Hybrid" && legacyType.hybrid) ||
                    (filterBootType === "Freeride" && legacyType.freeride)
                  );
                })()
              : false;
        if (!bootTypeMatches) return false;
      }

      // Width filter
      if (filterWidth !== "all" && boot.bootWidth !== filterWidth) {
        return false;
      }

      // Instep Height filter
      if (filterInstepHeight !== "all") {
        const instepArray = Array.isArray(boot.instepHeight) 
          ? boot.instepHeight 
          : boot.instepHeight ? [boot.instepHeight] : [];
        if (!instepArray.includes(filterInstepHeight as any)) {
          return false;
        }
      }

      // Ankle Volume filter
      if (filterAnkleVolume !== "all") {
        const ankleArray = Array.isArray(boot.ankleVolume) 
          ? boot.ankleVolume 
          : boot.ankleVolume ? [boot.ankleVolume] : [];
        if (!ankleArray.includes(filterAnkleVolume as any)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case "brand":
          aVal = a.brand;
          bVal = b.brand;
          break;
        case "model":
          aVal = a.model;
          bVal = b.model;
          break;
        case "flex":
          aVal = a.flex;
          bVal = b.flex;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
    });

    return filtered;
  }, [
    boots,
    searchTerm,
    filterGender,
    filterBootType,
    filterWidth,
    filterInstepHeight,
    filterAnkleVolume,
    sortBy,
    sortOrder,
  ]);

  const handleImport = async () => {
    if (!csvText.trim()) {
      alert("Please paste CSV content");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      // Get current user's auth token
      const user = auth.currentUser;
      if (!user) {
        alert("You must be signed in to import boots");
        setImporting(false);
        return;
      }

      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append("csvText", csvText);

      const response = await fetch("/api/admin/import-boots", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import boots");
      }

      const result = await response.json();
      setImportResult(result);
      if (result.imported > 0) {
        await fetchBoots();
        setCsvText("");
      }
    } catch (error) {
      console.error("Error importing boots:", error);
      alert(`Failed to import boots: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (bootId: string) => {
    if (!confirm("Are you sure you want to delete this boot?")) return;

    try {
      await deleteBoot(bootId);
      await fetchBoots();
    } catch (error) {
      console.error("Error deleting boot:", error);
      alert("Failed to delete boot");
    }
  };

  const handleEdit = (boot: Boot & { bootId: string }) => {
    setEditingBoot(boot);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBoot(null);
    setIsModalOpen(true);
  };

  const handleSaveBoot = async (
    bootData: Omit<Boot, "createdAt" | "updatedAt"> & { bootId?: string }
  ) => {
    // Check for duplicates (only for new boots, not when editing the same boot)
    const isNewBoot = !bootData.bootId;
    if (isNewBoot) {
      const exists = await bootExists(
        bootData.brand,
        bootData.model,
        bootData.year,
        bootData.gender
      );
      if (exists) {
        throw new Error("Duplicate Boot");
      }
    } else {
      // When editing, check if another boot with same brand/model/year/gender exists
      const exists = await bootExists(
        bootData.brand,
        bootData.model,
        bootData.year,
        bootData.gender,
        bootData.bootId
      );
      if (exists) {
        throw new Error("Duplicate Boot");
      }
    }
    await upsertBoot(bootData);
    await fetchBoots();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBoot(null);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-6 border border-[#F5E4D0]/20">
        <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">Import Boots (CSV)</h2>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full h-32 p-3 border border-gray-600 rounded-lg font-mono text-sm bg-[#1a1a1a] text-[#F4F4F4] placeholder:text-[#F4F4F4]/50"
          placeholder="Paste CSV content here..."
        />
        <button
          onClick={handleImport}
          disabled={importing || !csvText.trim()}
          className="mt-4 px-6 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {importing ? "Importing..." : "Import"}
        </button>
        {importResult && (
          <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#F5E4D0]/20">
            <div className="mb-2">
              <p className="font-semibold text-lg text-[#F4F4F4]">
                Imported: {importResult.imported} boots
              </p>
              <p className="text-sm text-[#F4F4F4]/80">
                Total rows: {importResult.total || 0} | Imported:{" "}
                {importResult.imported} | Duplicates:{" "}
                {importResult.duplicates || 0} | Skipped:{" "}
                {importResult.skipped || 0} | Errors:{" "}
                {importResult.errors?.length || 0}
              </p>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-red-400 mb-2">
                  Errors ({importResult.errors.length}):
                </p>
                <div className="max-h-60 overflow-y-auto bg-[#2B2D30] p-3 rounded border border-red-400/30">
                  <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
                    {importResult.errors.map((error, i) => (
                      <li key={i} className="break-words">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {importResult.imported === 0 &&
              (!importResult.errors || importResult.errors.length === 0) && (
                <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded">
                  <p className="text-sm text-yellow-300">
                    ⚠️ No boots were imported and no errors were reported. This
                    might mean:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-300/80 mt-2 ml-4">
                    <li>All rows were skipped (empty brand/model)</li>
                    <li>CSV format doesn't match expected columns</li>
                    <li>Check browser console (F12) for detailed logs</li>
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Boots Table */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md overflow-hidden border border-[#F5E4D0]/20">
        <div className="px-6 py-4 border-b border-[#F5E4D0]/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#F4F4F4]">
              All Boots ({filteredAndSortedBoots.length} of {boots.length})
            </h2>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] text-sm font-medium"
            >
              + Add New Boot
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Brand, model, type..."
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4] placeholder:text-[#F4F4F4]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Gender
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
              >
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Boot Type
              </label>
              <select
                value={filterBootType}
                onChange={(e) => setFilterBootType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
              >
                <option value="all">All</option>
                {uniqueBootTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Width
              </label>
              <select
                value={filterWidth}
                onChange={(e) => setFilterWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
              >
                <option value="all">All</option>
                {uniqueWidths.map((width) => (
                  <option key={width} value={width}>
                    {width}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Instep Height
              </label>
              <select
                value={filterInstepHeight}
                onChange={(e) => setFilterInstepHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
              >
                <option value="all">All</option>
                {uniqueInstepHeights.map((height) => (
                  <option key={height} value={height}>
                    {height}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Ankle Volume
              </label>
              <select
                value={filterAnkleVolume}
                onChange={(e) => setFilterAnkleVolume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
              >
                <option value="all">All</option>
                {uniqueAnkleVolumes.map((volume) => (
                  <option key={volume} value={volume}>
                    {volume}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4F4F4] mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#1a1a1a] text-[#F4F4F4]"
                >
                  <option value="brand">Brand</option>
                  <option value="model">Model</option>
                  <option value="flex">Flex</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-[#1a1a1a] text-[#F4F4F4] bg-[#2B2D30]"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Width
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Flex
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Instep
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Ankle Vol.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Calf Vol.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Toe Shape
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Features
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#F4F4F4]/80 uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E4D0]/10">
              {filteredAndSortedBoots.map((boot) => (
                <tr key={boot.bootId} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-sm text-[#F4F4F4] whitespace-nowrap">
                    {boot.year}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#F4F4F4] whitespace-nowrap">
                    {boot.brand}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4] whitespace-nowrap">
                    {boot.model}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {boot.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {typeof boot.bootType === "string"
                      ? boot.bootType
                      : typeof boot.bootType === "object" && boot.bootType
                        ? (() => {
                            const legacyType = boot.bootType as any;
                            return [
                              legacyType.standard ? "Standard" : "",
                              legacyType.freestyle ? "Freestyle" : "",
                              legacyType.hybrid ? "Hybrid" : "",
                              legacyType.freeride ? "Freeride" : "",
                            ]
                              .filter(Boolean)
                              .join(", ") || "—";
                          })()
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {boot.bootWidth || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {boot.flex}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {Array.isArray(boot.instepHeight) 
                      ? boot.instepHeight.join(", ") 
                      : boot.instepHeight || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {Array.isArray(boot.ankleVolume) 
                      ? boot.ankleVolume.join(", ") 
                      : boot.ankleVolume || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {Array.isArray(boot.calfVolume) 
                      ? boot.calfVolume.join(", ") 
                      : boot.calfVolume || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    {boot.toeBoxShape}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F4F4F4]/80 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {boot.walkMode && (
                        <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded border border-blue-700/50">
                          Walk
                        </span>
                      )}
                      {boot.rearEntry && (
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-300 text-xs rounded border border-green-700/50">
                          Rear
                        </span>
                      )}
                      {boot.calfAdjustment && (
                        <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded border border-purple-700/50">
                          Calf
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(boot)}
                        className="text-[#F5E4D0] hover:text-[#E8D4B8] font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(boot.bootId)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedBoots.length === 0 && (
            <div className="px-6 py-8 text-center text-[#F4F4F4]/60">
              No boots found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      <BootFormModal
        boot={editingBoot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBoot}
      />
    </div>
  );
}
