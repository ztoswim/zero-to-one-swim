import { db } from "@/db";
import { venues } from "@/db/schema";
import { asc } from "drizzle-orm";
import { VenuesView } from "./VenuesView";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getInitialData() {
  let userRole = 'coach';
  
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
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        userRole = profile?.role || 'coach';
      }
    }
  } catch (e) {
    console.error('Error fetching user role in venues page:', e);
  }

  // Fetch venue data with error handling
  let venuesData: any[] = [];
  let routesData: any[] = [];
  
  try {
    venuesData = await db.query.venues.findMany({
      orderBy: [asc(venues.name)]
    });
    routesData = await db.query.venueRoutes.findMany({
      with: {
        fromVenue: true,
        toVenue: true
      }
    });
  } catch (e) {
    console.error('Database query error in venues page:', e);
  }

  return { venues: venuesData, routes: routesData, userRole };
}

export default async function VenuesPage() {
  const { venues: venuesData, routes, userRole } = await getInitialData();

  return (
    <main className="py-12 bg-gray-50/30 min-h-screen">
      <VenuesView venues={venuesData} routes={routes} userRole={userRole} />
    </main>
  );
}
