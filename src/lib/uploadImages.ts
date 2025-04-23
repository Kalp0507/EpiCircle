// lib/uploadImage.ts
import { supabase } from "@/supabaseClient";

export const uploadImageAndGetUrl = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

    return data.publicUrl;
};
