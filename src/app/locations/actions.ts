'use server';

import { db } from "@/db";
import { locations, locationRoutes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addLocationAction(formData: FormData) {
  const name = formData.get('name') as string;
  
  const googleMapsUrl = formData.get('googleMapsUrl') as string;
  const wazeUrl = formData.get('wazeUrl') as string;
  const googleEmbedCode = formData.get('googleEmbedCode') as string;
  const wazeEmbedCode = formData.get('wazeEmbedCode') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(locations).values({
      name,
      googleMapsUrl: googleMapsUrl || null,
      wazeUrl: wazeUrl || null,
      googleEmbedCode: googleEmbedCode || null,
      wazeEmbedCode: wazeEmbedCode || null,
    });
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add location" };
  }
}

export async function deleteLocationAction(id: string) {
  try {
    await db.delete(locations).where(eq(locations.id, id));
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete location" };
  }
}

export async function updateLocationAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const googleMapsUrl = formData.get('googleMapsUrl') as string;
  const wazeUrl = formData.get('wazeUrl') as string;
  const googleEmbedCode = formData.get('googleEmbedCode') as string;
  const wazeEmbedCode = formData.get('wazeEmbedCode') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.update(locations).set({
      name,
      googleMapsUrl: googleMapsUrl || null,
      wazeUrl: wazeUrl || null,
      googleEmbedCode: googleEmbedCode || null,
      wazeEmbedCode: wazeEmbedCode || null,
    }).where(eq(locations.id, id));
    
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update location" };
  }
}

// ROUTE ACTIONS
export async function addRouteAction(formData: FormData) {
  const fromLocationId = formData.get('fromLocationId') as string;
  const toLocationId = formData.get('toLocationId') as string;
  const duration = parseInt(formData.get('duration') as string);
  const distance = formData.get('distance') as string;

  if (!fromLocationId || !toLocationId || isNaN(duration)) return { error: "Missing data" };

  try {
    await db.insert(locationRoutes).values({
      fromLocationId,
      toLocationId,
      durationMinutes: duration,
    });
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add route" };
  }
}

export async function deleteRouteAction(id: string) {
  try {
    await db.delete(locationRoutes).where(eq(locationRoutes.id, id));
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete route" };
  }
}

export async function updateRouteAction(id: string, formData: FormData) {
  const duration = parseInt(formData.get('duration') as string);

  if (isNaN(duration)) return { error: "Missing data" };

  try {
    await db.update(locationRoutes).set({
      durationMinutes: duration,
    }).where(eq(locationRoutes.id, id));
    revalidatePath('/locations');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update route" };
  }
}
