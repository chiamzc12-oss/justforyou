import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle } from "lucide-react";
import { Photo } from "../api";

interface HeartGalleryProps {
  photos: Photo[];
  onDelete?: (id: string, url: string) => void;
}

export function HeartGallery({ photos, onDelete }: HeartGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [displayedSpots, setDisplayedSpots] = useState<Photo[]>([]);
  const totalSpots = 27;

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const initial = [];
    for (let i = 0; i < totalSpots; i++) {
        initial.push(photos[i % photos.length]);
    }
    setDisplayedSpots(initial);
  }, [photos]);

  useEffect(() => {
    if (!photos || photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setDisplayedSpots(prev => {
        if (prev.length !== totalSpots) return prev;
        const next = [...prev];
        const hiddenPhotos = photos.filter(p => !next.some(spot => spot?.id === p.id));
        
        if (hiddenPhotos.length > 0) {
            const randomSpotIdx = Math.floor(Math.random() * totalSpots);
            const randomHiddenPhoto = hiddenPhotos[Math.floor(Math.random() * hiddenPhotos.length)];
            next[randomSpotIdx] = randomHiddenPhoto;
        } else {
            const idx1 = Math.floor(Math.random() * totalSpots);
            const idx2 = Math.floor(Math.random() * totalSpots);
            const temp = next[idx1];
            next[idx1] = next[idx2];
            next[idx2] = temp;
        }
        return next;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [photos, totalSpots]);

  const handleShuffle = () => {
    if (!photos || photos.length === 0) return;
    const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);
    const next = [];
    for (let i = 0; i < totalSpots; i++) {
        next.push(shuffledPhotos[i % shuffledPhotos.length]);
    }
    setDisplayedSpots(next);
  };

  // If no photos, show empty
  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="text-6xl mb-4 opacity-50">💔</div>
        <h3 className="text-xl font-cute text-gray-500 font-bold mb-2">No memories yet</h3>
        <p className="text-gray-400 font-medium">Upload some sweet moments to fill the heart!</p>
      </div>
    );
  }

  // A 7x7 grid heart pattern (1 = photo, 0 = empty)
  // Total 27 spots
  const heartPattern = [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ];

  // Map photos to the spots.
  let currentSpotAt = 0;

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6 relative w-full flex items-center justify-center">
        <div>
          <h2 className="text-3xl font-cute font-bold text-pink-500 mb-2">
            Heart Wall 💖
          </h2>
          <p className="text-gray-500 font-medium font-sans text-sm">
            Our memories shaped with love
          </p>
        </div>
        <button 
          onClick={handleShuffle}
          className="absolute right-0 sm:right-10 bg-pink-100 text-pink-500 p-2 sm:px-4 sm:py-2 rounded-full hover:bg-pink-200 transition-colors shadow-sm flex items-center gap-2 font-bold font-sans"
        >
          <Shuffle size={18} />
          <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      <div className="w-full max-w-3xl flex items-center justify-center relative flex-1">
        <div 
          className="grid gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-4" 
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {heartPattern.map((row, rIndex) => (
            row.map((cell, cIndex) => {
              if (cell === 1) {
                const photo = displayedSpots[currentSpotAt] || photos[currentSpotAt % photos.length];
                currentSpotAt++;
                const isEven = currentSpotAt % 2 === 0;
                return (
                  <motion.div
                    key={`${rIndex}-${cIndex}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: currentSpotAt * 0.03, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.15, zIndex: 10, rotate: isEven ? 5 : -5 }}
                    className="relative aspect-square w-10 sm:w-16 md:w-20 lg:w-24 rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer border-[3px] border-white bg-gray-100"
                    onClick={() => photo && setSelectedPhoto(photo)}
                  >
                    {photo && (
                      <img 
                        key={photo.id}
                        src={photo.url} 
                        alt="Memory tile" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                  </motion.div>
                );
              } else {
                return <div key={`${rIndex}-${cIndex}`} className="w-10 sm:w-16 md:w-20 lg:w-24 aspect-square" />;
              }
            })
          ))}
        </div>
      </div>

      {/* Selected Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white p-4 rounded-3xl shadow-2xl flex flex-col cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(selectedPhoto.id, selectedPhoto.url);
                    setSelectedPhoto(null);
                  }}
                  className="absolute -top-4 -left-4 bg-red-100 text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-200 z-50 transition-colors"
                  title="Delete photo"
                >
                  🗑️
                </button>
              )}
              <button 
                className="absolute -top-4 -right-4 bg-white text-gray-400 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50 hover:text-gray-600 transition-colors z-[110]"
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </button>
              
              <div className="w-full rounded-2xl bg-gray-100 mb-4 flex items-center justify-center overflow-hidden">
                <img src={selectedPhoto.url} alt="Memory Zoomed" className="w-full h-auto max-h-[60vh] object-contain" />
              </div>
              {selectedPhoto.caption && (
                <p className="text-center font-cute text-xl text-gray-700 bg-pink-50 p-4 rounded-xl border border-pink-100/50 break-words">
                  {selectedPhoto.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
