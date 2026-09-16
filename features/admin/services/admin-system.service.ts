"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  expected_return_time: string | null;
}

export interface SystemSettings {
  maintenance: MaintenanceSettings;
}

const DEFAULT_MAINTENANCE: MaintenanceSettings = {
  enabled: false,
  message: "We are currently performing scheduled maintenance.",
  expected_return_time: null,
};

export async function getSystemSettings(): Promise<SystemSettings> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .eq("key", "maintenance_mode")
    .single();

  if (error || !data) {
    return { maintenance: DEFAULT_MAINTENANCE };
  }

  const value = data.value as Record<string, unknown>;

  return {
    maintenance: {
      enabled: value.enabled === true,
      message: (value.message as string) || DEFAULT_MAINTENANCE.message,
      expected_return_time: (value.expected_return_time as string) || null,
    },
  };
}

export async function updateMaintenanceMode(
  adminUserId: string,
  enabled: boolean,
  message?: string,
  expectedReturnTime?: string | null
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createAdminClient();

  // Get current settings to merge
  const current = await getSystemSettings();

  const newValue: MaintenanceSettings = {
    enabled,
    message: message ?? current.maintenance.message,
    expected_return_time: expectedReturnTime !== undefined ? expectedReturnTime : current.maintenance.expected_return_time,
  };

  const { error } = await supabase
    .from("system_settings")
    .update({
      value: newValue,
      updated_at: new Date().toISOString(),
      updated_by: adminUserId,
    })
    .eq("key", "maintenance_mode");

  if (error) {
    console.error("Error updating maintenance mode:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Public-safe maintenance check — returns only the public-facing info
 * (whether maintenance is active, the message, and expected return time).
 * No admin data is exposed.
 */
export async function getPublicMaintenanceStatus(): Promise<MaintenanceSettings> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();

  if (error || !data) {
    return DEFAULT_MAINTENANCE;
  }

  const value = data.value as Record<string, unknown>;

  return {
    enabled: value.enabled === true,
    message: (value.message as string) || DEFAULT_MAINTENANCE.message,
    expected_return_time: (value.expected_return_time as string) || null,
  };
}
