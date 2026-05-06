'use server';

import { db } from "@/db";
import { venues, venueRoutes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addVenueAction(formData: FormData) {
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const contactPerson = formData.get('contactPerson') as string;
  const contactPhone = formData.get('contactPhone') as string;
  
  const googleMapsUrl = formData.get('googleMapsUrl') as string;
  const wazeUrl = formData.get('wazeUrl') as string;
  const embedCode = formData.get('embedCode') as string;
  const lat = formData.get('lat') as string;
  const lng = formData.get('lng') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.insert(venues).values({
      name,
      address,
      googleMapsUrl: googleMapsUrl || null,
      wazeUrl: wazeUrl || null,
      embedCode: embedCode || null,
      lat: lat || null,
      lng: lng || null,
    });
    revalidatePath('/venues');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add venue" };
  }
}

export async function deleteVenueAction(id: string) {
  try {
    await db.delete(venues).where(eq(venues.id, id));
    revalidatePath('/venues');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete venue" };
  }
}

export async function updateVenueAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const googleMapsUrl = formData.get('googleMapsUrl') as string;
  const wazeUrl = formData.get('wazeUrl') as string;
  const embedCode = formData.get('embedCode') as string;
  const lat = formData.get('lat') as string;
  const lng = formData.get('lng') as string;

  if (!name) return { error: "Name is required" };

  try {
    await db.update(venues).set({
      name,
      googleMapsUrl: googleMapsUrl || null,
      wazeUrl: wazeUrl || null,
      embedCode: embedCode || null,
      lat: lat || null,
      lng: lng || null,
    }).where(eq(venues.id, id));
    
    revalidatePath('/venues');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update venue" };
  }
}

// ROUTE ACTIONS
export async function addRouteAction(formData: FormData) {
  const fromVenueId = formData.get('fromVenueId') as string;
  const toVenueId = formData.get('toVenueId') as string;
  const duration = parseInt(formData.get('duration') as string);
  const distance = formData.get('distance') as string;

  if (!fromVenueId || !toVenueId || isNaN(duration)) return { error: "Missing data" };

  try {
    await db.insert(venueRoutes).values({
      fromVenueId,
      toVenueId,
      durationMinutes: duration,
      distanceKm: distance || null,
    });
    revalidatePath('/venues');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to add route" };
  }
}

export async function deleteRouteAction(id: string) {
  try {
    await db.delete(venueRoutes).where(eq(venueRoutes.id, id));
    revalidatePath('/venues');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete route" };
  }
}

export async function resolveVenueCoordinatesAction(url: string) {
  if (!url) return { error: "URL is required" };

  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, { 
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const finalUrl = response.url;
    
    // Regex for various patterns
    const googleMatch = finalUrl.match(/@([\d.-]+),([\d.-]+)/) || finalUrl.match(/q=([\d.-]+),([\d.-]+)/);
    const wazeMatch = finalUrl.match(/ll=([\d.-]+)%2C([\d.-]+)/) || finalUrl.match(/ll=([\d.-]+),([\d.-]+)/) || finalUrl.match(/latlng=([\d.-]+)%2C([\d.-]+)/);
    
    const match = wazeMatch || googleMatch;
    
    if (match) {
      return { 
        success: true, 
        lat: match[1], 
        lng: match[2],
        resolvedUrl: finalUrl 
      };
    }

    return { error: "Could not extract coordinates from the resolved link" };
  } catch (error) {
    console.error("Link resolution error:", error);
    return { error: "Failed to resolve link" };
  }
}
