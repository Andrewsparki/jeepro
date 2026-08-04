"use server";

import { createClient } from "@/lib/supabase/server";

export type EventType = "Study Session" | "Revision Session" | "Formula Review" | "PYQ Practice" | "Mock Test" | "Custom Task";

export interface PlannerEvent {
  id?: string;
  user_id?: string;
  title: string;
  event_type: EventType;
  subject_id?: string | null;
  chapter_id?: string | null;
  start_time: string;
  end_time: string;
  status: "pending" | "completed" | "missed";
  google_event_id?: string | null;
  created_at?: string;
}

// Fetch all events for the authenticated user
export async function getPlannerEvents(): Promise<PlannerEvent[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("planner_events")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return data as PlannerEvent[];
}

// Create a new planner event
export async function createPlannerEvent(event: PlannerEvent): Promise<PlannerEvent | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Attempt Google Calendar Sync (One-Way Push)
  let google_event_id = null;
  const { data: sessionData } = await supabase.auth.getSession();
  const providerToken = sessionData.session?.provider_token;

  if (providerToken) {
    google_event_id = await pushToGoogleCalendar(event, providerToken);
  }

  const { data, error } = await supabase
    .from("planner_events")
    .insert([{ ...event, user_id: user.id, google_event_id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw new Error(error.message);
  }
  return data as PlannerEvent;
}

// Update an existing planner event
export async function updatePlannerEvent(event: PlannerEvent): Promise<PlannerEvent | null> {
  if (!event.id) throw new Error("Event ID required for update");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: sessionData } = await supabase.auth.getSession();
  const providerToken = sessionData.session?.provider_token;

  // Sync update to Google Calendar if google_event_id exists
  if (providerToken && event.google_event_id) {
    await updateGoogleCalendarEvent(event, providerToken);
  }

  const { data, error } = await supabase
    .from("planner_events")
    .update({
      title: event.title,
      event_type: event.event_type,
      start_time: event.start_time,
      end_time: event.end_time,
      status: event.status,
      subject_id: event.subject_id,
      chapter_id: event.chapter_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", event.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw new Error(error.message);
  }
  return data as PlannerEvent;
}

// Toggle status of a planner event (completed <-> pending)
export async function togglePlannerEventStatus(id: string, currentStatus: "pending" | "completed" | "missed"): Promise<PlannerEvent | null> {
  const newStatus: "pending" | "completed" = currentStatus === "completed" ? "pending" : "completed";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("planner_events")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling event status:", error);
    throw new Error(error.message);
  }
  return data as PlannerEvent;
}

// Delete a planner event (locally and from Google Calendar)
export async function deletePlannerEvent(id: string, googleEventId?: string | null): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: sessionData } = await supabase.auth.getSession();
  const providerToken = sessionData.session?.provider_token;

  // Delete from Google Calendar if synced
  if (providerToken && googleEventId) {
    await deleteFromGoogleCalendar(googleEventId, providerToken);
  }

  const { error } = await supabase
    .from("planner_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

// Google Calendar Sync Layer Helpers
async function pushToGoogleCalendar(event: PlannerEvent, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.title,
        description: `Scheduled via JEE Pro Planner. Type: ${event.event_type}`,
        start: { dateTime: new Date(event.start_time).toISOString() },
        end: { dateTime: new Date(event.end_time).toISOString() },
        colorId: "9",
      }),
    });

    if (response.ok) {
      const gcalEvent = await response.json();
      return gcalEvent.id;
    } else {
      console.error("Google Calendar Push failed:", await response.text());
      return null;
    }
  } catch (err) {
    console.error("Network error pushing to Google Calendar:", err);
    return null;
  }
}

async function updateGoogleCalendarEvent(event: PlannerEvent, accessToken: string): Promise<boolean> {
  if (!event.google_event_id) return false;
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.google_event_id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: `Scheduled via JEE Pro Planner. Type: ${event.event_type}`,
          start: { dateTime: new Date(event.start_time).toISOString() },
          end: { dateTime: new Date(event.end_time).toISOString() },
        }),
      }
    );
    return response.ok;
  } catch (err) {
    console.error("Network error updating Google Calendar event:", err);
    return false;
  }
}

async function deleteFromGoogleCalendar(googleEventId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.ok;
  } catch (err) {
    console.error("Network error deleting Google Calendar event:", err);
    return false;
  }
}
