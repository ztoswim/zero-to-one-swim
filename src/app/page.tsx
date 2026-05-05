import { Container } from "@/components/Container";
import { db } from "@/db";
import { invoices, lessons, students } from "@/db/schema";
import { desc, eq, gte, lte, and } from "drizzle-orm";
import { TrendingUp, Calendar, AlertCircle, User, MessageSquare, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch this month's invoices for income
    const monthlyInvoices = await db.query.invoices.findMany({
      where: and(
        gte(invoices.paymentDate, firstDayOfMonth.toISOString().split('T')[0]),
        lte(invoices.paymentDate, lastDayOfMonth.toISOString().split('T')[0]),
        eq(invoices.status, "paid")
      ),
    });

    const monthIncome = monthlyInvoices.reduce((sum: any, inv: any) => sum + Number(inv.totalAmount || 0), 0);
    const monthProfit = Math.round(monthIncome * 0.4);

    // Total lessons
    const lessonCountResult = await db.select({ count: lessons.id }).from(lessons);
    const totalLessons = lessonCountResult.length;

    // Low balance alerts
    const allStudents = await db.query.students.findMany({
      where: eq(students.status, "active"),
      with: {
        invoices: {
          where: eq(invoices.status, "paid"),
        },
        lessons: {
          where: (lessons, { inArray }) => inArray(lessons.status, ["attended", "absent"]),
        },
      },
    });

    const lowBalanceList = allStudents.map((s: any) => {
      const used = s.lessons.length;
      const totalPurchased = s.invoices.reduce((sum: any, inv: any) => sum + inv.lessonsRemaining, 0) + used;
      const rem = totalPurchased - used;
      
      return { ...s, rem };
    }).filter((s: any) => s.rem <= 2).sort((a: any, b: any) => a.rem - b.rem);

    return { monthIncome, monthProfit, totalLessons, lowBalanceList };
  } catch (e) {
    console.error("Database connection failed", e);
    return {
      monthIncome: 0,
      monthProfit: 0,
      totalLessons: 0,
      lowBalanceList: [],
      error: "Database connection needed.",
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <Container>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Performance <span className="text-primary-500">Hub</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Real-time academy overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/create-invoice" className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2">
            New Invoice <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run database push.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in" style={{ animationDelay: '0.1s' }}>
        {/* Income */}
        <div className="metric-card">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black rotate-12">RM</div>
          <div className="relative z-10">
            <p className="stat-label">Monthly Income</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-primary-500 opacity-60">RM</span>
              <span className="stat-value">{data.monthIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="metric-card">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black -rotate-12 flex justify-center">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="stat-label">Monthly Profit</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-green-500 opacity-60">RM</span>
              <span className="stat-value text-green-600">{data.monthProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="metric-card">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black rotate-45 flex justify-center">
            <Calendar className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="stat-label">Total Lessons</p>
            <span className="stat-value">{data.totalLessons}</span>
          </div>
        </div>

        {/* Alerts */}
        <div className={`metric-card ${data.lowBalanceList.length > 0 ? 'bg-red-50 border-red-100' : ''}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black -rotate-12 flex justify-center">
            <AlertCircle className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="stat-label">Renewal Alerts</p>
            <span className={`stat-value ${data.lowBalanceList.length > 0 ? 'text-red-600' : ''}`}>
              {data.lowBalanceList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      {data.lowBalanceList.length > 0 ? (
        <section className="animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
              Low Balance <span className="text-red-500">Alerts</span>
            </h2>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.lowBalanceList.map((s: any) => (
              <div key={s.id} className="alert-card shadow-sm hover:shadow-xl group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 leading-none">{s.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{s.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-black leading-none ${s.rem <= 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {s.rem}
                    </div>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rem</div>
                  </div>
                  <a href={`https://wa.me/${s.phone?.replace(/\D/g, '')}?text=Hi%20${s.name},%20you%20have%20${s.rem}%20lessons%20remaining.`} target="_blank" rel="noreferrer"
                     className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200 hover:scale-110 transition-all active:scale-90">
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-6xl mb-4 text-success flex justify-center">
            <CheckCircle className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">All Clear</h3>
          <p className="text-gray-400 font-bold text-sm">No students need renewal at this moment.</p>
        </section>
      )}
    </Container>
  );
}
