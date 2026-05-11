import { logout } from "@/app/login/actions";
import { db } from "@/db";
import { students, invoices } from "@/db/schema";
import { sql, count, sum, eq } from "drizzle-orm";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function getCourseAdvisorStats() {
  try {
    const studentsCount = await db.select({ value: count() }).from(students).where(eq(students.status, 'active'));
    const invoicesCount = await db.select({ value: count() }).from(invoices);
    const revenueSum = await db.select({ value: sum(invoices.totalAmount) }).from(invoices);

    return {
      students: studentsCount[0]?.value || 0,
      invoices: invoicesCount[0]?.value || 0,
      revenue: revenueSum[0]?.value || 0
    };
  } catch (e) {
    console.error("Error fetching stats:", e);
    return { students: 0, invoices: 0, revenue: 0 };
  }
}

export default async function CourseAdvisorDashboard() {
  const stats = await getCourseAdvisorStats();
  const t = await getTranslations();

  return (
    <div className="py-20 animate-in">
      <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
        {t.dashboard.adminTitle}
      </h1>
      <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-10">{t.dashboard.adminDesc}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">{t.dashboard.totalInvoices}</h3>
          <p className="text-6xl font-black text-primary-500 tracking-tighter">{stats.invoices}</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">{t.dashboard.activeStudents}</h3>
          <p className="text-6xl font-black text-primary-500 tracking-tighter">{stats.students}</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">{t.dashboard.totalRevenue}</h3>
          <p className="text-6xl font-black text-primary-500 tracking-tighter">RM{Number(stats.revenue).toLocaleString()}</p>
        </div>
      </div>

      <form action={logout} className="mt-20">
        <button className="btn btn-primary px-10 h-16 rounded-2xl shadow-xl shadow-primary-100">{t.common.signOut}</button>
      </form>
    </div>
  );
}
