"use client";

import { useState, useEffect } from "react";
import { BootFitter } from "@/lib/firestore/bootFitters";

interface Props {
  fitter: BootFitter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    fitterData: Omit<BootFitter, "id"> & { id?: string }
  ) => Promise<void>;
}

export default function BootFitterFormModal({
  fitter,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    website: "",
    latitude: "",
    longitude: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (fitter) {
      setFormData({
        name: fitter.name || "",
        address: fitter.address || "",
        city: fitter.city || "",
        state: fitter.state || "",
        zipCode: fitter.zipCode || "",
        country: fitter.country || "",
        phone: fitter.phone || "",
        website: fitter.website || "",
        latitude: fitter.latitude?.toString() || "",
        longitude: fitter.longitude?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
        website: "",
        latitude: "",
        longitude: "",
      });
    }
    setError("");
  }, [fitter, isOpen]);

  const handleGeocode = async () => {
    if (!formData.address || !formData.city || !formData.country) {
      setError("Please enter address, city, and country before geocoding");
      return;
    }

    try {
      const fullAddress = [
        formData.address,
        formData.city,
        formData.state,
        formData.zipCode,
        formData.country,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: fullAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Geocoding failed");
      }

      const data = await response.json();
      setFormData({
        ...formData,
        latitude: data.lat.toString(),
        longitude: data.lng.toString(),
      });
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to geocode address");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.address || !formData.city || !formData.country) {
      setError("Name, address, city, and country are required");
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Valid latitude and longitude are required");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: fitter?.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        country: formData.country,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        latitude: lat,
        longitude: lng,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save boot fitter");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2B2D30] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#F5E4D0]/20">
        <div className="sticky top-0 bg-[#2B2D30] border-b border-[#F5E4D0]/20 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#F4F4F4]">
            {fitter ? "Edit Boot Fitter" : "Add New Boot Fitter"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#F4F4F4]/60 hover:text-[#F4F4F4] text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="border-t border-[#F5E4D0]/20 pt-4">
              <div className="flex items-end gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-[#F4F4F4]">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] focus:outline-none focus:border-[#F5E4D0]/40"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGeocode}
                  className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] text-sm font-medium"
                >
                  Geocode
                </button>
              </div>
              <p className="text-xs text-[#F4F4F4]/60 mt-1">
                Enter address details above, then click "Geocode" to automatically get coordinates
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#F5E4D0]/20 text-[#F4F4F4] rounded-lg hover:bg-[#F5E4D0]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


