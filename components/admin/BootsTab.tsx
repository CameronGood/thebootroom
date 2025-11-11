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
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "brand" | "model" | "flex" | "lastWidthMM"
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
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(boots.map((b) => b.brand))].sort();
    return brands;
  }, [boots]);

  const uniqueBootTypes = useMemo(() => {
    const types = [...new Set(boots.map((b) => b.bootType))].sort();
    return types;
  }, [boots]);

  // Filter and sort boots
  const filteredAndSortedBoots = useMemo(() => {
    let filtered = boots.filter((boot) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          boot.brand.toLowerCase().includes(searchLower) ||
          boot.model.toLowerCase().includes(searchLower) ||
          boot.bootType.toLowerCase().includes(searchLower) ||
          boot.year.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filterGender !== "all" && boot.gender !== filterGender) {
        return false;
      }

      // Boot type filter
      if (filterBootType !== "all" && boot.bootType !== filterBootType) {
        return false;
      }

      // Brand filter
      if (filterBrand !== "all" && boot.brand !== filterBrand) {
        return false;
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
        case "lastWidthMM":
          aVal = a.lastWidthMM;
          bVal = b.lastWidthMM;
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
    filterBrand,
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
      const formData = new FormData();
      formData.append("csvText", csvText);

      const response = await fetch("/api/admin/import-boots", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);
      if (result.imported > 0) {
        await fetchBoots();
        setCsvText("");
      }
    } catch (error) {
      console.error("Error importing boots:", error);
      alert("Failed to import boots");
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Import Boots (CSV)</h2>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold mb-2">Expected CSV Format:</p>
          <p className="text-gray-700 mb-2">
            Required columns:{" "}
            <code className="bg-white px-1 rounded">
              year,gender,bootType,brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume,toeBoxShape,calfAdjustment,walkMode,rearEntry,affiliateUrl,imageUrl,tags
            </code>
          </p>
          <p className="text-gray-600 text-xs">
            Example:{" "}
            <code className="bg-white px-1 rounded">
              25/26,Male,All-Mountain,Salomon,Shift Alpha BOA
              130,98,130,Low,Low,Low,Square,No,No,No,https://...,https://...,all-mountain;performance
            </code>
          </p>
        </div>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          placeholder="Paste CSV content here..."
        />
        <button
          onClick={handleImport}
          disabled={importing || !csvText.trim()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
        >
          {importing ? "Importing..." : "Import"}
        </button>
        {importResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-2">
              <p className="font-semibold text-lg">
                Imported: {importResult.imported} boots
              </p>
              <p className="text-sm text-gray-600">
                Total rows: {importResult.total || 0} | Imported:{" "}
                {importResult.imported} | Duplicates:{" "}
                {importResult.duplicates || 0} | Skipped:{" "}
                {importResult.skipped || 0} | Errors:{" "}
                {importResult.errors?.length || 0}
              </p>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-red-600 mb-2">
                  Errors ({importResult.errors.length}):
                </p>
                <div className="max-h-60 overflow-y-auto bg-white p-3 rounded border">
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
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
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No boots were imported and no errors were reported. This
                    might mean:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 ml-4">
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              All Boots ({filteredAndSortedBoots.length} of {boots.length})
            </h2>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + Add New Boot
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Brand, model, type..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Boot Type
              </label>
              <select
                value={filterBootType}
                onChange={(e) => setFilterBootType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="brand">Brand</option>
                  <option value="model">Model</option>
                  <option value="flex">Flex</option>
                  <option value="lastWidthMM">Width</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Flex
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Width (mm)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instep
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Calf Vol.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Toe Shape
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Features
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedBoots.map((boot) => (
                <tr key={boot.bootId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {boot.year}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {boot.brand}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {boot.model}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.bootType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.flex}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.lastWidthMM}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.instepHeight}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.calfVolume}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {boot.toeBoxShape}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {boot.walkMode && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          Walk
                        </span>
                      )}
                      {boot.rearEntry && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Rear
                        </span>
                      )}
                      {boot.calfAdjustment && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                          Calf
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(boot)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(boot.bootId)}
                        className="text-red-600 hover:text-red-800 font-medium"
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
            <div className="px-6 py-8 text-center text-gray-500">
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
