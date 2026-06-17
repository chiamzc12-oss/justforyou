import { supabase } from "./supabase";

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

// Ensure the local API fallback works if Supabase is not configured
const API_BASE = "/api";

export const api = {
  async getPhotos(): Promise<Photo[]> {
    if (supabase) {
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
    }

    const res = await fetch(`${API_BASE}/photos`);
    if (!res.ok) throw new Error("Failed to fetch photos");
    return res.json();
  },

  async uploadPhoto(file: File, caption: string): Promise<Photo> {
    if (supabase) {
      // 1. Upload to Supabase Storage
      let fileExt = "jpg";
      if (file.name) {
         const parts = file.name.split(".");
         if (parts.length > 1) {
            fileExt = parts.pop() || "jpg";
         }
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
    }

    const formData = new FormData();
    formData.append("photo", file, file.name || "image.jpg");
    formData.append("caption", caption);

    const res = await fetch(`${API_BASE}/photos`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Failed to upload photo";
      try {
        const json = JSON.parse(text);
        if (json.error) errMsg = json.error;
      } catch (e) {
        console.error("Upload error response was not JSON", text);
      }
      throw new Error(errMsg);
    }
    return res.json();
  },

  async deletePhoto(id: string, url: string): Promise<void> {
    if (supabase) {
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
    }

    const res = await fetch(`${API_BASE}/photos/${id}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Failed to delete photo";
      try {
        const json = JSON.parse(text);
        if (json.error) errMsg = json.error;
      } catch (e) {
        // Not JSON error
      }
      throw new Error(errMsg);
    }
  },
};
