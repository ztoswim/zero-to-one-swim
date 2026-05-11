import { Container } from "@/components/Container";
import { getAdmins } from "./actions";
import { getCurrentUserProfile } from "@/app/staff-access/actions";
import { CourseAdvisorStaffClient } from "./CourseAdvisorStaffClient";

export const dynamic = 'force-dynamic';

export default async function CourseAdvisorProfilesPage() {
  const [admins, profile] = await Promise.all([
    getAdmins(),
    getCurrentUserProfile()
  ]);

  return (
    <CourseAdvisorStaffClient initialAdmins={admins} currentUser={profile} />
  );
}
