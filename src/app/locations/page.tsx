import { db } from "@/db";
import { locations } from "@/db/schema";
import { asc } from "drizzle-orm";
import { LocationsView } from "./LocationsView";

export const dynamic = 'force-dynamic';

import { getTranslations } from "@/lib/i18n";
import { getCurrentUserProfile } from "@/app/staff-access/actions";
import { redirect } from "next/navigation";

async function getInitialData() {
  // Fetch location data with error handling
  let locationsData: any[] = [];
  let routesData: any[] = [];
  
  try {
    locationsData = await db.query.locations.findMany({
      orderBy: [asc(locations.name)]
    });
    routesData = await db.query.locationRoutes.findMany({
      with: {
        fromLocation: true,
        toLocation: true
      }
    });
  } catch (e) {
    console.error('Database query error in locations page:', e);
  }

  return { locations: locationsData, routes: routesData };
}

export default async function LocationsPage() {
  const [data, user, dict] = await Promise.all([
    getInitialData(),
    getCurrentUserProfile(),
    getTranslations()
  ]);

  if (!user) {
    redirect("/login");
  }

  return <LocationsView locations={data.locations} routes={data.routes} user={user} />;
}
