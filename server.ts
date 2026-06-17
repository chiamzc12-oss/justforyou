import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage config for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// In-memory "database" for the AI Studio preview
interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

let photos: Photo[] = [
  {
    id: "demo-1",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
    caption: "Our first date 💖",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    url: "https://images.unsplash.com/photo-1513271788-294d137b03fc?q=80&w=600&auto=format&fit=crop",
    caption: "That time we went to the beach",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop",
    caption: "You looking cute as always ✨",
    createdAt: new Date().toISOString(),
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadsDir));

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/photos", (req, res) => {
    res.json(photos);
  });

  app.post("/api/photos", upload.single("photo"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      const newPhoto: Photo = {
        id: Math.random().toString(36).substring(7),
        url: fileUrl,
        caption: req.body.caption || "",
        createdAt: new Date().toISOString(),
      };
      
      photos.push(newPhoto);
      // Wait for 1 second to simulate network/upload time
      setTimeout(() => {
        res.status(201).json(newPhoto);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.delete("/api/photos/:id", (req, res) => {
    const { id } = req.params;
    const index = photos.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const photo = photos[index];
    photos.splice(index, 1);

    // If it's an uploaded file (url starts with /uploads/), try to delete the file
    if (photo.url.startsWith("/uploads/")) {
      const fileName = path.basename(photo.url);
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete file:", e);
        }
      }
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
