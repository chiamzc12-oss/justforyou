/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { GiftGallery } from "./components/GiftGallery";
import { HeartGallery } from "./components/HeartGallery";
import { TwinkleMinigame } from "./components/TwinkleMinigame";
import { BirthdayLetter } from "./components/BirthdayLetter";
import { UploadModal } from "./components/UploadModal";
import { api, Photo } from "./api";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoToDelete, setPhotoToDelete] = useState<{id: string, url: string} | null>(null);

  const loadData = async () => {
    try {
      const photoData = await api.getPhotos();
      setPhotos(photoData);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      // We'll expose the error to alert the user about the SQL setup needed
      if (err.message && err.message.includes("does not exist") || err.message.includes("Could not find the table")) {
        alert("Supabase Database isn't set up yet! Please run the commands in supabase.sql in your Supabase project's SQL editor.");
      }
    }
  };

  const handleDeletePhoto = (id: string, url: string) => {
    setPhotoToDelete({ id, url });
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    const { id, url } = photoToDelete;
    // Optimistic unmount to give instant feedback
    setPhotoToDelete(null);
    try {
      await api.deletePhoto(id, url);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete photo:", err);
      // If we failed, reload the data to sync back up
      alert("Failed to delete photo. Check console for details.");
      loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen relative pb-28 font-sans overflow-hidden">
      {/* Decorative top border */}
      <div className="h-2 w-full bg-gradient-to-r from-pastel-pink via-pastel-blue to-pastel-yellow" />

      {/* Main Content Area */}
      <main className="container mx-auto">
        {activeTab === "gallery" && <GiftGallery photos={photos} onDelete={handleDeletePhoto} />}
        {activeTab === "heart" && <HeartGallery photos={photos} onDelete={handleDeletePhoto} />}
        {activeTab === "minigame" && <TwinkleMinigame />}
        {activeTab === "letter" && <BirthdayLetter />}
      </main>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onUploadClick={() => setIsUploadOpen(true)} 
      />

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <div className="text-5xl mb-4">🗑️</div>
              <h2 className="text-2xl font-cute font-bold text-gray-800 mb-2">Delete Memory?</h2>
              <p className="text-gray-600 mb-8 font-medium">
                Are you sure you want to delete this photo forever? This cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setPhotoToDelete(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeletePhoto}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
