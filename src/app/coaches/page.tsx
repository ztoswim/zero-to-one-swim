import { db } from "@/db";
import { coaches as coachesSchema } from "@/db/schema";
import { asc } from "drizzle-orm";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUserProfile } from "@/app/staff-access/actions";

import { AddCoachDialog } from "./AddCoachDialog";
import { CoachesListClient } from "./CoachesListClient";

import { redirect } from "next/navigation";
import { getTranslations } from "@/lib/i18n";

export const dynamic = 'force-dynamic';

async function getCoaches() {
  const data = await db.query.coaches.findMany({
    orderBy: [asc(coachesSchema.name)]
  });
  return { coaches: data };
}

export default async function CoachesPage() {
  const [data, user, dict] = await Promise.all([
    getCoaches(),
    getCurrentUserProfile(),
    getTranslations()
  ]);

  if (!user) {
    redirect("/login");
  }

  const canCreate = hasPermission(user, 'create_coach');
  const canEdit = hasPermission(user, 'edit_coach');
  const canDelete = hasPermission(user, 'delete_coach');

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {dict.nav.coaches}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {dict.common.manageCoachesDescription || 'Manage your academy instructors and their details.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {canCreate && <AddCoachDialog />}
        </div>
      </div>

      <CoachesListClient 
        coaches={data.coaches}
        canEdit={canEdit}
        canDelete={canDelete}
        dict={dict}
      />
    </>
  );
}
