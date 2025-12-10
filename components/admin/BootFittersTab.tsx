"use client";

import { useState, useEffect } from "react";
import {
  listBootFitters,
  deleteBootFitter,
  upsertBootFitter,
} from "@/lib/firestore/bootFitters";
import { BootFitter } from "@/lib/firestore/bootFitters";
import Spinner from "@/components/Spinner";
import BootFitterFormModal from "./BootFitterFormModal";

export default function BootFittersTab() {
  const [fitters, setFitters] = useState<BootFitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFitter, setEditingFitter] = useState<BootFitter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFitters();
  }, []);

  const fetchFitters = async () => {
    setLoading(true);
    try {
      const allFitters = await listBootFitters();
      setFitters(allFitters);
    } catch (error) {
      console.error("Error fetching boot fitters:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFitters = fitters.filter((fitter) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fitter.name.toLowerCase().includes(searchLower) ||
      fitter.city.toLowerCase().includes(searchLower) ||
      fitter.country.toLowerCase().includes(searchLower) ||
      fitter.address.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (fitterId: string) => {
    if (!confirm("Are you sure you want to delete this boot fitter?")) return;

    try {
      await deleteBootFitter(fitterId);
      await fetchFitters();
    } catch (error) {
      console.error("Error deleting boot fitter:", error);
      alert("Failed to delete boot fitter");
    }
  };

  const handleEdit = (fitter: BootFitter) => {
    setEditingFitter(fitter);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingFitter(null);
    setIsModalOpen(true);
  };

  const handleSaveFitter = async (
    fitterData: Omit<BootFitter, "id"> & { id?: string }
  ) => {
    await upsertBootFitter(fitterData);
    await fetchFitters();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFitter(null);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#F4F4F4]">Boot Fitters</h2>
        <button
          onClick={handleAddNew}
          className="px-6 py-2 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] font-medium"
        >
          Add New Boot Fitter
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md p-4 border border-[#F5E4D0]/20">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, city, country, or address..."
          className="w-full p-3 border border-[#F5E4D0]/20 rounded-lg bg-[#040404] text-[#F4F4F4] placeholder:text-[#F4F4F4]/50 focus:outline-none focus:border-[#F5E4D0]/40"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-[#F4F4F4]/60">
        Showing {filteredFitters.length} of {fitters.length} boot fitters
      </div>

      {/* Boot Fitters List */}
      <div className="bg-[#2B2D30] rounded-lg shadow-md border border-[#F5E4D0]/20 overflow-hidden">
        {filteredFitters.length === 0 ? (
          <div className="p-8 text-center text-[#F4F4F4]/60">
            {searchTerm ? "No boot fitters found matching your search" : "No boot fitters added yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-[#F5E4D0]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#F4F4F4]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#F4F4F4]">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#F4F4F4]">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#F4F4F4]">
                    Coordinates
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#F4F4F4]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E4D0]/10">
                {filteredFitters.map((fitter) => (
                  <tr
                    key={fitter.id}
                    className="hover:bg-[#1a1a1a]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-[#F4F4F4] font-medium">
                      {fitter.name}
                    </td>
                    <td className="px-4 py-3 text-[#F4F4F4]/80 text-sm">
                      <div>{fitter.address}</div>
                      <div className="text-[#F4F4F4]/60">
                        {fitter.city}
                        {fitter.state && `, ${fitter.state}`}
                        {fitter.zipCode && ` ${fitter.zipCode}`}
                      </div>
                      <div className="text-[#F4F4F4]/60">{fitter.country}</div>
                    </td>
                    <td className="px-4 py-3 text-[#F4F4F4]/80 text-sm">
                      {fitter.phone && <div>{fitter.phone}</div>}
                      {fitter.website && (
                        <a
                          href={fitter.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F5E4D0] hover:underline"
                        >
                          Website
                        </a>
                      )}
                      {!fitter.phone && !fitter.website && (
                        <span className="text-[#F4F4F4]/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#F4F4F4]/80 text-sm font-mono">
                      {fitter.latitude.toFixed(6)}, {fitter.longitude.toFixed(6)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(fitter)}
                          className="px-3 py-1 text-sm bg-[#F5E4D0] text-[#2B2D30] rounded hover:bg-[#E8D4B8]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(fitter.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <BootFitterFormModal
        fitter={editingFitter}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFitter}
      />
    </div>
  );
}


