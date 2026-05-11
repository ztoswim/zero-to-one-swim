import { Container } from "@/components/Container";
import { db } from "@/db";
import { students, packages, coaches, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CreateInvoiceForm } from "./CreateInvoiceForm";
import { BackButton } from "@/components/BackButton";
import { getTranslation } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const studentsData = await db.query.students.findMany({ 
      where: eq(students.status, "active"),
      orderBy: [desc(students.createdAt)],
      with: {
        fixedSlots: true
      }
    });
    const packagesData = await db.query.packages.findMany();
    const coachesData = await db.query.coaches.findMany();
    const lessonsData = await db.query.lessons.findMany();
    const lastInvoices = await db.query.invoices.findMany({
      limit: 1,
      orderBy: [desc(invoices.createdAt)]
    });

    // Generate Invoice Number
    const d = new Date();
    const datePart = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    let invNumber = `INV${datePart}-0001`;

    if (lastInvoices.length > 0) {
      const lastInv = lastInvoices[0].invoiceNumber;
      const match = lastInv.match(/INV(\d+)-(\d+)/);
      if (match) {
        const lastDatePart = match[1];
        if (lastDatePart === datePart) {
          const nextNum = String(parseInt(match[2]) + 1).padStart(4, '0');
          invNumber = `INV${datePart}-${nextNum}`;
        }
      }
    }

    return { 
      students: studentsData, 
      packages: packagesData, 
      coaches: coachesData,
      lessons: lessonsData,
      initialInvNumber: invNumber
    };
  } catch (e) {
    console.error("Error fetching data:", e);
    return { students: [], packages: [], coaches: [], lessons: [], initialInvNumber: "INV-ERROR", error: "Database connection needed." };
  }
}

export default async function CreateInvoicePage() {
  const { t } = await getTranslation();
  const data = await getInitialData();

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('common.createInvoice')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('common.invoiceSubtitle')}
          </p>
        </div>
        <BackButton 
          className="btn bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-100 px-8 h-12 shadow-sm font-bold rounded-xl transition-all"
        >
          {t('common.discardAndBack')}
        </BackButton>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run database push.
        </div>
      )}

      <CreateInvoiceForm 
        students={data.students} 
        packages={data.packages} 
        coaches={data.coaches} 
        lessons={data.lessons}
        initialInvNumber={data.initialInvNumber} 
      />
    </>
  );
}
