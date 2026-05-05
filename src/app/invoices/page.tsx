import { Container } from "@/components/Container";
import { db } from "@/db";
import { invoices, students, lessons, packages, coaches } from "@/db/schema";
import { desc } from "drizzle-orm";
import { InvoicesList } from "./InvoicesList";

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
  const data = await getInvoicesData();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Billing <span className="text-primary-500">History</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Review all academy invoices</p>
        </div>
        <a 
          href="/create-invoice" 
          className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2"
        >
          Generate New Bill <span className="text-xl">+</span>
        </a>
      </div>

      <InvoicesList initialInvoices={data.invoices} students={data.students} packages={data.packages} coaches={data.coaches} />
    </Container>
  );
}
