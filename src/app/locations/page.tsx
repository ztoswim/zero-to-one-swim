import { db } from "@/db";
import { locations } from "@/db/schema";
import { asc } from "drizzle-orm";
import { LocationsView } from "./LocationsView";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getInitialData() {
  let userProfile: any = { role: 'coach' };
  
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profile = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.id, user.id)
        });
        userProfile = profile || { role: 'coach' };
      }
    }
  } catch (e) {
    console.error('Error fetching user profile in locations page:', e);
  }

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

  return { locations: locationsData, routes: routesData, userProfile };
}

export default async function LocationsPage() {
  const { locations: locationsData, routes, userProfile } = await getInitialData();

  return <LocationsView locations={locationsData} routes={routes} user={userProfile} />;
}
