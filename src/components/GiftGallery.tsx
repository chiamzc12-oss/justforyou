import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Photo } from "../api";

interface GiftGalleryProps {
  photos: Photo[];
  onDelete?: (id: string, url: string) => void;
}

export function GiftGallery({ photos, onDelete }: GiftGalleryProps) {
  const [stage, setStage] = useState<'gift' | 'card' | 'gallery'>('gift');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <div className="w-full h-[80vh] flex items-center justify-center overflow-hidden relative">
      <style>
        {`
          @keyframes slideMarquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: slideMarquee ${photos.length > 0 ? photos.length * 8 : 20}s linear infinite;
          }
          .pause-marquee {
            animation-play-state: paused;
          }
        `}
      </style>
      <AnimatePresence mode="wait">
        {stage === 'gift' && (
           <motion.div
             key="gift"
             exit={{ scale: 0, opacity: 0, rotate: 10 }}
             className="cursor-pointer group flex flex-col items-center"
             onClick={() => setStage('card')}
           >
             <div className="text-[12rem] relative hover:scale-110 active:scale-95 transition-transform duration-300">
                🎁
                <div className="absolute inset-0 bg-pink-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
             </div>
             <p className="mt-8 font-cute text-3xl text-primary-pink animate-bounce shadow-pink-100 drop-shadow-sm font-bold bg-white/60 px-6 py-2 rounded-full border border-pink-100">
               Tap to open! ✨
             </p>
           </motion.div>
        )}

        {stage === 'card' && (
           <motion.div
             key="card"
             initial={{ scale: 0.5, y: 100, opacity: 0 }}
             animate={{ scale: 1, y: 0, opacity: 1 }}
             exit={{ scale: 0.8, y: -100, opacity: 0 }}
             transition={{ type: 'spring', bounce: 0.5 }}
             className="bg-white/95 backdrop-blur-sm border-4 border-pink-200 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl relative z-10"
           >
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl drop-shadow-lg">
               💌
             </div>
             <h2 className="text-4xl text-primary-pink font-cute font-bold mt-6 mb-4">Happy Birthday!</h2>
             <p className="font-sans font-medium text-gray-700 leading-relaxed mb-8 flex flex-col gap-2">
               <span>My love, every single day with you is a gift.</span>
               <span>Let's look back at some of our favorite memories together!</span>
             </p>
             <button
               onClick={() => setStage('gallery')}
               className="bg-gradient-to-r from-pink-400 to-primary-pink text-white font-cute text-2xl px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 hover:scale-105"
             >
               View Photos 📸
             </button>
           </motion.div>
        )}

        {stage === 'gallery' && (
           <motion.div
             key="gallery"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="w-full h-full relative flex items-center justify-center overflow-hidden"
           >
              {/* Central Rope line to indicate hanging */}
              <div className="absolute left-0 w-[200%] h-1 bg-amber-800/20 top-1/2 -translate-y-12 z-0 hidden md:block rotate-[-2deg]" />
              
              <div className="absolute left-0 w-[200%] h-1 bg-amber-800/20 top-1/3 z-0 md:hidden" />

              {/* Looping photos train */}
              <div className="w-full overflow-hidden flex items-center h-full">
                 <div
                   className={`flex gap-8 md:gap-16 min-w-max px-8 animate-marquee ${selectedPhoto ? 'pause-marquee' : ''}`}
                 >
                    {/* Double the photos array to create seamless loop */}
                    {[...photos, ...photos, ...photos].map((photo, i) => (
                       <div key={`${photo.id}-${i}`} className="relative group shrink-0 mt-8">
                          {/* Clothespeg */}
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-8 bg-amber-200 border border-amber-300 rounded-sm z-10 origin-top shadow-sm rotate-[5deg] md:block" />
                          
                          {/* Polaroid */}
                          <div 
                             onClick={() => setSelectedPhoto(photo)}
                             className="bg-white p-3 md:p-4 pb-8 md:pb-12 rounded-sm shadow-xl w-48 md:w-64 lg:w-72 aspect-[3/4] origin-top rotate-[-2deg] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110 group-hover:z-40 cursor-pointer relative"
                          >
                             {onDelete && (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onDelete(photo.id, photo.url);
                                 }}
                                 className="absolute top-2 right-2 md:top-3 md:right-3 bg-red-100 hover:bg-red-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm"
                                 title="Delete photo"
                               >
                                 ✕
                               </button>
                             )}
                             <div className="w-full h-full bg-pink-50 overflow-hidden mb-3 md:mb-4 rounded-sm border border-gray-100 relative">
                               {photo.url ? (
                                  <img src={photo.url} alt="Memory" className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-5xl bg-pink-50/50">
                                    <span className="animate-pulse">💖</span>
                                  </div>
                               )}
                             </div>
                             {photo.caption && (
                               <p className="text-center font-cute text-sm md:text-lg text-gray-700 line-clamp-2 px-2 leading-tight">
                                 {photo.caption}
                               </p>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Left/Right Overlays to fade edges naturally */}
              <div className="absolute top-0 left-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-[#fff0f5] to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-[#fff0f5] to-transparent z-10 pointer-events-none" />
              
              {/* Zoom Overlay */}
              <AnimatePresence>
                 {selectedPhoto && (
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 cursor-pointer"
                     onClick={() => setSelectedPhoto(null)}
                   >
                     <motion.div
                       initial={{ scale: 0.8, y: 50 }}
                       animate={{ scale: 1, y: 0 }}
                       exit={{ scale: 0.8, y: 50 }}
                       className="bg-white p-4 md:p-6 pb-12 md:pb-16 rounded-sm shadow-2xl max-w-2xl w-full flex flex-col relative cursor-default"
                       style={{ maxHeight: '90vh' }}
                       onClick={(e) => e.stopPropagation()}
                     >
                       <button
                         onClick={() => setSelectedPhoto(null)}
                         className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 font-bold text-xl z-50 border border-gray-100"
                       >
                         ✕
                       </button>

                       {onDelete && (
                         <button
                           onClick={() => {
                             // The confirmation is already handled by App.tsx, but we can call onDelete directly 
                             // and close the modal.
                             onDelete(selectedPhoto.id, selectedPhoto.url);
                             setSelectedPhoto(null);
                           }}
                           className="absolute -top-4 -left-4 bg-red-100 text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-200 z-50 transition-colors"
                           title="Delete photo"
                         >
                           🗑️
                         </button>
                       )}
                       <div className="w-full h-full bg-pink-50 overflow-hidden mb-4 rounded-sm border border-gray-100 flex-1 min-h-0 flex items-center justify-center pointer-events-none select-none">
                         {selectedPhoto.url ? (
                            <img src={selectedPhoto.url} alt="Memory Zoomed" className="w-full h-full object-contain" />
                         ) : (
                            <span className="animate-pulse text-6xl">💖</span>
                         )}
                       </div>
                       {selectedPhoto.caption && (
                         <p className="text-center font-cute text-xl md:text-3xl text-gray-800 mt-2 px-4 whitespace-pre-wrap">
                           {selectedPhoto.caption}
                         </p>
                       )}
                     </motion.div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
