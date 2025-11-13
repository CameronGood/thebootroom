"use client";

import { useState, useEffect } from "react";
import { Boot, Region, AffiliateLink, BootType } from "@/types";

interface Props {
  boot: (Boot & { bootId: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    bootData: Omit<Boot, "createdAt" | "updatedAt"> & { bootId?: string }
  ) => Promise<void>;
}

export default function BootFormModal({
  boot,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [formData, setFormData] = useState({
    year: "",
    gender: "Male" as "Male" | "Female",
    bootType: "Standard" as BootType,
    brand: "",
    model: "",
    lastWidthMM: "",
    flex: "",
    instepHeight: "Low" as "Low" | "Medium" | "High",
    ankleVolume: "Low" as "Low" | "Medium" | "High",
    calfVolume: "Low" as "Low" | "Medium" | "High",
    toeBoxShape: "Round" as "Round" | "Square" | "Angled",
    calfAdjustment: false,
    walkMode: false,
    rearEntry: false,
    affiliateUrl: "",
    imageUrl: "",
    tags: "",
  });
  const [links, setLinks] = useState<{ [region in Region]?: AffiliateLink[] }>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null); // Clear error when modal opens/closes
    if (boot) {
      setFormData({
        year: boot.year || "",
        gender: boot.gender,
        bootType: boot.bootType || "Standard",
        brand: boot.brand || "",
        model: boot.model || "",
        lastWidthMM: boot.lastWidthMM?.toString() || "",
        flex: boot.flex?.toString() || "",
        instepHeight: boot.instepHeight,
        ankleVolume: boot.ankleVolume,
        calfVolume: boot.calfVolume,
        toeBoxShape: boot.toeBoxShape,
        calfAdjustment: boot.calfAdjustment || false,
        walkMode: boot.walkMode || false,
        rearEntry: boot.rearEntry || false,
        affiliateUrl: boot.affiliateUrl || "",
        imageUrl: boot.imageUrl || "",
        tags: boot.tags?.join(";") || "",
      });
      setLinks(boot.links || {});
    } else {
      // Reset form for new boot
      setFormData({
        year: "",
        gender: "Male",
        bootType: "Standard",
        brand: "",
        model: "",
        lastWidthMM: "",
        flex: "",
        instepHeight: "Low",
        ankleVolume: "Low",
        calfVolume: "Low",
        toeBoxShape: "Round",
        calfAdjustment: false,
        walkMode: false,
        rearEntry: false,
        affiliateUrl: "",
        imageUrl: "",
        tags: "",
      });
      setLinks({});
    }
  }, [boot, isOpen]);

  const addLink = (region: Region) => {
    setLinks({
      ...links,
      [region]: [
        ...(links[region] || []),
        { store: "", url: "", available: true },
      ],
    });
  };

  const updateLink = (
    region: Region,
    index: number,
    field: keyof AffiliateLink,
    value: any
  ) => {
    const regionLinks = [...(links[region] || [])];
    regionLinks[index] = { ...regionLinks[index], [field]: value };
    setLinks({ ...links, [region]: regionLinks });
  };

  const removeLink = (region: Region, index: number) => {
    const regionLinks = [...(links[region] || [])];
    regionLinks.splice(index, 1);
    if (regionLinks.length === 0) {
      const { [region]: _, ...rest } = links;
      setLinks(rest);
    } else {
      setLinks({ ...links, [region]: regionLinks });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const bootData = {
        bootId: boot?.bootId,
        year: formData.year,
        gender: formData.gender,
        bootType: formData.bootType,
        brand: formData.brand,
        model: formData.model,
        lastWidthMM: parseFloat(formData.lastWidthMM),
        flex: parseFloat(formData.flex),
        instepHeight: formData.instepHeight,
        ankleVolume: formData.ankleVolume,
        calfVolume: formData.calfVolume,
        toeBoxShape: formData.toeBoxShape,
        calfAdjustment: formData.calfAdjustment,
        walkMode: formData.walkMode,
        rearEntry: formData.rearEntry,
        affiliateUrl: formData.affiliateUrl || undefined,
        links: Object.keys(links).length > 0 ? links : undefined,
        imageUrl: formData.imageUrl || undefined,
        tags: formData.tags
          ? formData.tags
              .split(";")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };

      await onSave(bootData);
      onClose();
    } catch (error: any) {
      console.error("Error saving boot:", error);
      if (error.message === "Duplicate Boot") {
        setError("Duplicate Boot");
      } else {
        setError("Failed to save boot");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {boot ? "Edit Boot" : "Add New Boot"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="25/26"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "Male" | "Female",
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="bootType" className="block text-sm font-medium mb-1 text-black">
                Boot Type
              </label>
              <select
                id="bootType"
                name="bootType"
                value={formData.bootType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bootType: e.target.value as BootType,
                  })
                }
                className="w-full p-2 border border-black rounded-lg text-black"
                required
              >
                <option value="Standard">Standard</option>
                <option value="Freestyle">Freestyle</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Touring">Touring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Width (mm)
              </label>
              <input
                type="number"
                value={formData.lastWidthMM}
                onChange={(e) =>
                  setFormData({ ...formData, lastWidthMM: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                min="50"
                max="150"
                step="0.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Flex</label>
              <input
                type="number"
                value={formData.flex}
                onChange={(e) =>
                  setFormData({ ...formData, flex: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                min="50"
                max="150"
                required
              />
            </div>

            {/* Volume/Shape */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Instep Height
              </label>
              <select
                value={formData.instepHeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instepHeight: e.target.value as "Low" | "Medium" | "High",
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ankle Volume
              </label>
              <select
                value={formData.ankleVolume}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ankleVolume: e.target.value as "Low" | "Medium" | "High",
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Calf Volume
              </label>
              <select
                value={formData.calfVolume}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calfVolume: e.target.value as "Low" | "Medium" | "High",
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Toe Box Shape
              </label>
              <select
                value={formData.toeBoxShape}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    toeBoxShape: e.target.value as
                      | "Round"
                      | "Square"
                      | "Angled",
                  })
                }
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="Round">Round</option>
                <option value="Square">Square</option>
                <option value="Angled">Angled</option>
              </select>
            </div>

            {/* Features */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Features</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.walkMode}
                    onChange={(e) =>
                      setFormData({ ...formData, walkMode: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Walk Mode
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rearEntry}
                    onChange={(e) =>
                      setFormData({ ...formData, rearEntry: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Rear Entry
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.calfAdjustment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calfAdjustment: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Calf Adjustment
                </label>
              </div>
            </div>

            {/* URLs */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Affiliate URL
              </label>
              <input
                type="url"
                value={formData.affiliateUrl}
                onChange={(e) =>
                  setFormData({ ...formData, affiliateUrl: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Tags (semicolon-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
                placeholder="all-mountain;performance;comfort"
              />
            </div>
          </div>

          {/* Affiliate Links by Region */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Regional Affiliate Links
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add multiple vendor links per region. These will be shown to users
              based on their location.
            </p>
            {(["UK", "US", "EU"] as Region[]).map((region) => (
              <div key={region} className="mb-6 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{region} Links</h4>
                  <button
                    type="button"
                    onClick={() => addLink(region)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Link
                  </button>
                </div>
                {links[region]?.map((link, index) => (
                  <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={link.store}
                          onChange={(e) =>
                            updateLink(region, index, "store", e.target.value)
                          }
                          className="w-full p-2 border rounded text-sm"
                          placeholder="Ellis Brigham"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">
                          Affiliate URL
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            updateLink(region, index, "url", e.target.value)
                          }
                          className="w-full p-2 border rounded text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Logo URL (optional)
                        </label>
                        <input
                          type="url"
                          value={link.logo || ""}
                          onChange={(e) =>
                            updateLink(region, index, "logo", e.target.value)
                          }
                          className="w-full p-2 border rounded text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={link.available !== false}
                          onChange={(e) =>
                            updateLink(
                              region,
                              index,
                              "available",
                              e.target.checked
                            )
                          }
                          className="mr-2"
                        />
                        Available
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLink(region, index)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {(!links[region] || links[region].length === 0) && (
                  <p className="text-sm text-gray-500 italic">
                    No links added for {region}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {saving ? "Saving..." : "Save Boot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
