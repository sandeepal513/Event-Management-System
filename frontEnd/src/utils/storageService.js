import { supabase } from "./supabaseClient";

export async function uploadImage(image){
    if (!image) return null;

    const fileName = `${Date.now()}_${image.name}`;

    const {error} = await supabase.storage
    .from('events-image')
    .upload(fileName, image);

    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }

    const { data } = supabase.storage
    .from('events-image')
    .getPublicUrl(fileName);

    return data.publicUrl;
}


export async function uploadProfileImage(image){
    if (!image) return null;

    const fileName = `${Date.now()}_${image.name}`;

    const {error} = await supabase.storage
    .from('user-profile')
    .upload(fileName, image);

    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }

    const { data } = supabase.storage
    .from('user-profile')
    .getPublicUrl(fileName);

    return data.publicUrl;
}