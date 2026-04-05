import { supabase } from "@/lib/supabase";
async function getCurrentUserId() {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}
export async function getUserProfile() {
    const userId = await getCurrentUserId();
    if (!userId) {
        return null;
    }
    const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, last_blocked_sites")
        .eq("user_id", userId)
        .maybeSingle();
    if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
    if (!data) {
        return {
            user_id: userId,
            display_name: null,
            last_blocked_sites: []
        };
    }
    return {
        user_id: data.user_id,
        display_name: data.display_name,
        last_blocked_sites: Array.isArray(data.last_blocked_sites) ? data.last_blocked_sites : []
    };
}
export async function saveDisplayName(displayName) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return;
    }
    const { error } = await supabase
        .from("user_profiles")
        .upsert({
        user_id: userId,
        display_name: displayName.trim() || null,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (error) {
        throw new Error(`Failed to save display name: ${error.message}`);
    }
}
export async function saveLastBlockedSites(domains) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return;
    }
    const normalized = domains
        .map((domain) => domain.trim())
        .filter((domain) => domain.length > 0);
    const { error } = await supabase
        .from("user_profiles")
        .upsert({
        user_id: userId,
        last_blocked_sites: normalized,
        updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (error) {
        throw new Error(`Failed to save blocked site defaults: ${error.message}`);
    }
}
