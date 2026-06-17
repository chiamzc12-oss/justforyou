import { supabase } from "./supabase";

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export interface Letter {
  id: string;
  content: string;
}

export const isVideo = (url: string | undefined): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

// Ensure the local API fallback works if Supabase is not configured
const API_BASE = "/api";

export const api = {
  async getLetter(): Promise<Letter | null> {
    if (!supabase) throw new Error("Supabase credentials missing!");
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); 
    
    if (error) throw new Error(error.message);
    if (!data) return null;
    return { id: data.id, content: data.content };
  },

  async saveLetter(content: string, id?: string): Promise<Letter> {
    if (!supabase) throw new Error("Supabase credentials missing!");
    
    if (id) {
       const { data, error } = await supabase
         .from("letters")
         .update({ content })
         .eq("id", id)
         .select()
         .single();
       if (error) throw new Error(error.message);
       return { id: data.id, content: data.content };
    } else {
       const { data, error } = await supabase
         .from("letters")
         .insert([{ content }])
         .select()
         .single();
       if (error) throw new Error(error.message);
       return { id: data.id, content: data.content };
    }
  },

  async getPhotos(): Promise<Photo[]> {
    if (!supabase) {
      throw new Error("Supabase credentials missing! If you are on Vercel, please add VITE_URL and VITE_KEY to your environment variables and REDEPLOY the app.");
    }

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    
    return data.map((d: any) => ({
      id: d.id,
      url: d.url,
      caption: d.caption,
      createdAt: d.created_at,
    }));
  },

  async uploadPhoto(file: File, caption: string): Promise<Photo> {
    if (!supabase) {
      throw new Error("Supabase credentials missing! If you are on Vercel, please add VITE_URL and VITE_KEY to your environment variables and REDEPLOY the app.");
    }

    // 1. Upload to Supabase Storage
      let fileExt = "jpg";
      if (file.name && file.name.includes(".")) {
         const parts = file.name.split(".");
         if (parts.length > 1) {
            fileExt = parts.pop() || "jpg";
         }
      } else if (file.type) {
         fileExt = file.type.split("/")[1] || "jpg";
         if (fileExt === "quicktime") fileExt = "mov";
      }
      
      // Ensure videos get a proper extension for detection
      if (file.type && file.type.startsWith("video/") && !["mp4", "mov", "webm", "ogg"].includes(fileExt.toLowerCase())) {
         fileExt = "mp4";
      }
      
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pictures")
        .upload(fileName, file, {
           cacheControl: "3600",
           upsert: false
        });
        
      if (uploadError) {
        throw new Error(`Storage Error: ${uploadError.message || JSON.stringify(uploadError)}. Did you create the 'pictures' bucket and make it public?`);
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("pictures")
        .getPublicUrl(fileName);

      // 3. Insert into Database
      const { data: dbData, error: dbError } = await supabase
        .from("photos")
        .insert([
          {
            url: publicUrlData.publicUrl,
            caption: caption,
          },
        ])
        .select()
        .single();
        
      if (dbError) {
        throw new Error(`Database Error: ${dbError.message}. Check your RLS policies for 'photos' table.`);
      }
      
      return {
        id: dbData.id,
        url: dbData.url,
        caption: dbData.caption,
        createdAt: dbData.created_at,
      };
  },

  async deletePhoto(id: string, url: string): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase credentials missing! If you are on Vercel, please add VITE_URL and VITE_KEY to your environment variables and REDEPLOY the app.");
    }

    // 1. Delete from DB
      const { error: dbError } = await supabase.from("photos").delete().eq("id", id);
      if (dbError) throw new Error(dbError.message);
      
      // 2. Delete from storage
      try {
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
           const { error: storageError } = await supabase.storage.from("pictures").remove([fileName]);
           if (storageError) console.warn("Could not delete from storage", storageError);
        }
      } catch(e) {
        console.warn("Could not parse file name for deletion", e);
      }
      return;
  },
};
