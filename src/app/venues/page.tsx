import { db } from "@/db";
import { venues } from "@/db/schema";
import { asc } from "drizzle-orm";
import { VenuesView } from "./VenuesView";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getInitialData() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole = 'coach';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role || 'coach';
  }

  const venuesData = await db.query.venues.findMany({
    orderBy: [asc(venues.name)]
  });
  const routesData = await db.query.venueRoutes.findMany({
    with: {
      fromVenue: true,
      toVenue: true
    }
  });
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
