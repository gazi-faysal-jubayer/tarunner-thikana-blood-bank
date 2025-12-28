"use client";

import { useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface RealtimeOptions {
  channel: string;
  event?: string;
  table?: string;
  schema?: string;
  filter?: string;
}

type RealtimeCallback<T> = (payload: T) => void;

/**
 * Hook for subscribing to Supabase Realtime updates
 * Uses mock mode when Supabase is not configured
 */
export function useRealtime<T>(
  options: RealtimeOptions,
  callback: RealtimeCallback<T>
) {
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_SERVICES === "true";

  useEffect(() => {
    if (isMockMode) {
      console.log("[MOCK Realtime] Would subscribe to:", options.channel);
      return;
    }

    const supabase = getSupabaseClient();

    const channel = supabase.channel(options.channel);

    if (options.table) {
      // Subscribe to database changes
      channel.on(
        "postgres_changes" as any,
        {
          event: options.event || "*",
          schema: options.schema || "public",
          table: options.table,
          filter: options.filter,
        },
        (payload: any) => {
          callback(payload.new as T);
        }
      );
    } else {
      // Subscribe to broadcast channel
      channel.on("broadcast", { event: options.event || "update" }, (payload: any) => {
        callback(payload as T);
      });
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.channel, options.table, options.event, callback, isMockMode]);
}

/**
 * Hook for subscribing to blood request updates
 */
export function useRequestRealtime(
  trackingId: string,
  callback: RealtimeCallback<any>
) {
  useRealtime(
    {
      channel: `requests:tracking:${trackingId}`,
      table: "blood_requests",
      event: "UPDATE",
      filter: `tracking_id=eq.${trackingId}`,
    },
    callback
  );
}

/**
 * Hook for subscribing to new blood requests (for admin/volunteer)
 */
export function useNewRequestsRealtime(callback: RealtimeCallback<any>) {
  useRealtime(
    {
      channel: "public:blood_requests",
      table: "blood_requests",
      event: "INSERT",
    },
    callback
  );
}

/**
 * Hook for subscribing to assignment updates (for donors)
 */
export function useDonorAssignmentsRealtime(
  donorId: string,
  callback: RealtimeCallback<any>
) {
  useRealtime(
    {
      channel: `assignments:donor:${donorId}`,
      table: "assignments",
      event: "*",
      filter: `assignee_id=eq.${donorId}`,
    },
    callback
  );
}

/**
 * Hook for subscribing to assignment updates (for volunteers)
 */
export function useVolunteerAssignmentsRealtime(
  volunteerId: string,
  callback: RealtimeCallback<any>
) {
  useRealtime(
    {
      channel: `assignments:volunteer:${volunteerId}`,
      table: "blood_requests",
      event: "*",
      filter: `assigned_volunteer_id=eq.${volunteerId}`,
    },
    callback
  );
}

/**
 * Hook for subscribing to map marker updates
 */
export function useMapMarkersRealtime(callback: RealtimeCallback<any>) {
  useRealtime(
    {
      channel: "map:markers",
      event: "marker_update",
    },
    callback
  );
}

/**
 * Broadcast a map marker update
 */
export function broadcastMapUpdate(markerData: any) {
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_SERVICES === "true";

  if (isMockMode) {
    console.log("[MOCK Realtime] Would broadcast map update:", markerData);
    return;
  }

  const supabase = getSupabaseClient();

  supabase.channel("map:markers").send({
    type: "broadcast",
    event: "marker_update",
    payload: markerData,
  });
}




