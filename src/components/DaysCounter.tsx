import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarHeart, Check, Edit2 } from "lucide-react";

export function DaysCounter() {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("anniversary_date");
    if (saved) {
      setStartDate(saved);
      setTempDate(saved);
    }
  }, []);

  const handleSave = () => {
    if (tempDate) {
      localStorage.setItem("anniversary_date", tempDate);
      setStartDate(tempDate);
      setIsEditing(false);
    }
  };

  const calculateDays = () => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    // Normalize to 00:00:00 for accurate day counting
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();

  return (
    <div className="w-full flex justify-center pt-8 pb-4 px-4 relative z-10">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-pink-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all group"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
          <CalendarHeart size={18} />
        </div>
        
        <div className="flex flex-col">
          {startDate ? (
             <div className="flex items-baseline gap-1">
               <span className="font-bold text-xl text-gray-800">{days}</span>
               <span className="text-sm font-medium text-gray-500">days together</span>
             </div>
          ) : (
             <span className="text-sm font-medium text-pink-500">Set our first day 💕</span>
          )}
        </div>
        
        {!isEditing && (
            <Edit2 size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
        )}
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-cute font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarHeart className="text-pink-500" /> Our Start Date
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">When did our story begin?</label>
                <input 
                  type="date" 
                  value={tempDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none transition-colors text-gray-700 bg-pink-50/30"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!tempDate}
                  className="flex-1 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30"
                >
                  <Check size={18} /> Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
