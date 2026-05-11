import { Container } from "@/components/Container";
import { db } from "@/db";
import { invoices, students, lessons, packages, coaches } from "@/db/schema";
import { desc } from "drizzle-orm";
import { InvoicesList } from "./InvoicesList";
import { getTranslations } from "@/lib/i18n";
import { getCurrentUserProfile } from "@/app/staff-access/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getInvoicesData() {
  try {
    const invoicesData = await db.query.invoices.findMany({
      with: {
        student: true,
        package: true,
        lessons: true,
      },
      orderBy: [desc(invoices.createdAt)],
    });

    const studentsData = await db.query.students.findMany();
    const packagesData = await db.query.packages.findMany();
    const coachesData = await db.query.coaches.findMany();

    return { 
      invoices: invoicesData,
      students: studentsData,
      packages: packagesData,
      coaches: coachesData
    };
  } catch (e) {
    console.error("Error fetching invoices:", e);
    return { invoices: [], students: [], packages: [], coaches: [], error: "Database connection needed." };
  }
}

export default async function InvoicesPage() {
  const [data, user, dict] = await Promise.all([
    getInvoicesData(),
    getCurrentUserProfile(),
    getTranslations()
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {dict.nav.invoices}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {dict.common.reviewAcademyInvoices}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <a 
            href="/create-invoice" 
            className="btn btn-primary px-8 h-12 shadow-xl shadow-primary-200 flex items-center gap-2 rounded-xl whitespace-nowrap"
          >
            {dict.common.newInvoice} <span className="text-xl">+</span>
          </a>
        </div>
      </div>

      <InvoicesList initialInvoices={data.invoices} students={data.students} packages={data.packages} coaches={data.coaches} />
    </>
  );
}
