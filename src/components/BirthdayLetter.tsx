import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Edit3, Check, Loader2 } from "lucide-react";
import { api, Letter } from "../api";

export function BirthdayLetter() {
  const [letter, setLetter] = useState<Letter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const data = await api.getLetter();
        if (data) {
          setLetter(data);
          setContent(data.content);
        } else {
          setContent("");
        }
      } catch (err) {
        console.error("Failed to load letter", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLetter();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await api.saveLetter(content, letter?.id);
      setLetter(saved);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save letter", err);
      alert("Failed to save the letter.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl relative border border-pink-100"
      >
        <div className="absolute top-0 left-0 w-full h-8 bg-pink-100 rounded-t-3xl flex items-center px-4 space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-amber-400 rounded-full" />
          <div className="w-3 h-3 bg-emerald-400 rounded-full" />
        </div>

        <div className="mt-6 flex justify-between items-center mb-6">
          <h2 className="text-3xl font-cute font-bold text-gray-800 flex items-center gap-2">
            💌 Birthday Wish
          </h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
              title="Edit Letter"
            >
              <Edit3 size={20} />
            </button>
          ) : (
             <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Save
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-pink-300" />
          </div>
        ) : isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 rounded-xl border-2 border-pink-100 bg-pink-50/30 focus:border-pink-300 focus:outline-none resize-none font-sans text-gray-700 font-medium leading-relaxed"
            placeholder="Write your sweet message here..."
          />
        ) : (
          <div className="prose prose-pink max-w-none font-sans text-gray-700 leading-relaxed min-h-[16rem] whitespace-pre-wrap pl-4 border-l-4 border-pink-200">
            {letter?.content || "Click the edit icon to write something sweet!"}
          </div>
        )}
      </motion.div>
    </div>
  );
}
