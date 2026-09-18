"use server";

import { createClient } from "@/lib/supabase/server";

export interface SupportTicket {
  id: string;
  user_id: string;
  category: "general" | "account" | "billing" | "study_planner" | "bug_report" | "feature_request";
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface CreateSupportTicketInput {
  category: "general" | "account" | "billing" | "study_planner" | "bug_report" | "feature_request";
  subject: string;
  description: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

/**
 * Creates a support ticket for the authenticated user.
 * Derived strictly from authenticated session auth.uid().
 */
export async function createSupportTicket(
  input: CreateSupportTicketInput
): Promise<{ success: boolean; data: SupportTicket | null; error: string | null }> {
  const supabase = await createClient();

  // Validate authenticated session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, data: null, error: "You must be signed in to submit a support ticket." };
  }

  if (!input.subject || input.subject.trim().length < 4) {
    return { success: false, data: null, error: "Subject must be at least 4 characters long." };
  }

  if (!input.description || input.description.trim().length < 10) {
    return { success: false, data: null, error: "Description must be at least 10 characters long." };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      category: input.category,
      subject: input.subject.trim(),
      description: input.description.trim(),
      priority: input.priority || "normal",
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating support ticket:", error);
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as SupportTicket, error: null };
}

/**
 * Fetches support tickets submitted by the authenticated user.
 */
export async function getUserSupportTickets(): Promise<{ tickets: SupportTicket[]; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { tickets: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user support tickets:", error);
    return { tickets: [], error: error.message };
  }

  return { tickets: (data || []) as SupportTicket[], error: null };
}
