import { Container } from "@/components/Container";
import { logout } from "@/app/login/actions";

export default function CoachDashboard() {
  return (
    <Container>
      <div className="py-20 animate-in">
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
          Coach <span className="text-primary-500">Dashboard</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-10">Your personal schedule and income</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-black mb-2">My Classes Today</h3>
            <p className="text-5xl font-black text-primary-500 tracking-tighter">4</p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-black mb-2">This Month Earnings</h3>
            <p className="text-5xl font-black text-primary-500 tracking-tighter">RM3.5k</p>
          </div>
        </div>

        <form action={logout} className="mt-20">
          <button className="btn btn-primary px-10 h-16 rounded-2xl shadow-xl shadow-primary-100">Sign Out</button>
        </form>
      </div>
    </Container>
  );
}
