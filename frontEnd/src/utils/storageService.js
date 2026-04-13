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

export async function deleteProfileImage(imageUrl) {
    if (!imageUrl) return true;

    const marker = "/user-profile/";
    const markerIndex = String(imageUrl).indexOf(marker);

    if (markerIndex === -1) {
        return true;
    }

    const rawPath = imageUrl.slice(markerIndex + marker.length).split("?")[0];
    const filePath = decodeURIComponent(rawPath);

    if (!filePath) return true;

    const { error } = await supabase.storage
        .from("user-profile")
        .remove([filePath]);

    if (error) {
        console.error("Error deleting profile image:", error);
        return false;
    }

    return true;
}