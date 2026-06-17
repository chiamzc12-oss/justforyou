import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { api } from "../api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewWidth, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await api.uploadPhoto(file, caption);
      onSuccess();
      handleClose();
    } catch (e: any) {
      console.error(e);
      setUploadError(e.message || "Failed to upload. Server error.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setUploadError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-pink-100/40 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border-4 border-pink-50"
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-primary-pink transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-cute text-primary-pink mb-6 text-center">
            Upload a Memory 🎀
          </h2>

          {!file ? (
            <div 
              className="border-4 border-dashed rounded-3xl p-10 text-center relative overflow-hidden transition-all duration-300 border-pink-200 hover:border-pink-300 hover:bg-pink-50/50 block"
            >
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreviewUrl(URL.createObjectURL(f));
                  }
                }}
              />
              <UploadCloud size={48} className="mx-auto text-pink-300 mb-4" />
              <p className="font-sans font-bold text-gray-600">
                Tap here to select a cute photo!
              </p>
              <p className="text-sm text-gray-400 mt-2 font-medium">
                Choose from gallery or take a picture
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-pink-100 bg-gray-50 flex items-center justify-center relative">
                {previewWidth && <img src={previewWidth} alt="Preview" className="w-full h-full object-cover" />}
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-400 hover:text-red-500 hover:bg-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 font-sans pl-2">
                  Add a sweet caption ✨
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What makes this special?"
                  className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-xl px-4 py-3 outline-none focus:border-primary-pink focus:bg-white transition-all font-sans"
                />
              </div>

              {uploadError && (
                <div className="bg-red-50 text-red-500 font-sans font-medium text-sm p-3 rounded-lg border border-red-200">
                  {uploadError}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-primary-pink to-pink-400 text-white font-cute text-xl py-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <><Loader2 size={24} className="animate-spin" /> Uploading...</>
                ) : (
                  <>Save Memory 💖</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
