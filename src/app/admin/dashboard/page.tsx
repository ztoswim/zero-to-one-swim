import { Container } from "@/components/Container";
import { logout } from "@/app/login/actions";
import { db } from "@/db";
import { students, invoices } from "@/db/schema";
import { sql, count, sum, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getAdminStats() {
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

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <Container>
      <div className="py-20 animate-in">
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
          Admin <span className="text-primary-500">Dashboard</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-10">Full system management access</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">Total Invoices</h3>
            <p className="text-6xl font-black text-primary-500 tracking-tighter">{stats.invoices}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">Active Students</h3>
            <p className="text-6xl font-black text-primary-500 tracking-tighter">{stats.students}</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">Total Revenue</h3>
            <p className="text-6xl font-black text-primary-500 tracking-tighter">RM{Number(stats.revenue).toLocaleString()}</p>
          </div>
        </div>

        <form action={logout} className="mt-20">
          <button className="btn btn-primary px-10 h-16 rounded-2xl shadow-xl shadow-primary-100">Sign Out</button>
        </form>
      </div>
    </Container>
  );
}
