import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { FileText, Plus, User, Package, Calendar } from "lucide-react";

async function getInvoiceData() {
  try {
    const students = await prisma.student.findMany({ where: { status: "active" } });
    const packages = await prisma.package.findMany();
    return { students, packages };
  } catch (e) {
    return { students: [], packages: [], error: "Database connection needed." };
  }
}

export default async function CreateInvoicePage() {
  const data = await getInvoiceData();

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 animate-in">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
            Create <span className="text-primary-500">Invoice</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">New Billing Entry</p>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-bold border border-red-100">
          ⚠️ {data.error} Please set DATABASE_URL in .env and run Prisma migrations.
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm animate-in" style={{ animationDelay: '0.1s' }}>
        <form className="space-y-8 max-w-2xl">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Select Student</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer">
                <option value="">Choose a student...</option>
                {data.students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Select Package</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer">
                <option value="">Choose a package...</option>
                {data.packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - RM {p.price.toString()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button type="button" className="btn btn-primary px-10 h-14 shadow-xl shadow-primary-200 text-lg">
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}
