import { logout } from "@/app/login/actions";
import { getTranslations } from "@/lib/i18n";

export default async function CoachDashboard() {
  const t = await getTranslations();

  return (
    <div className="py-20 animate-in">
      <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
        {t.dashboard.coachTitle.split(' ')[0]} <span className="text-primary-500">{t.dashboard.coachTitle.split(' ')[1]}</span>
      </h1>
      <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-10">{t.dashboard.coachDesc}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">{t.dashboard.myClassesToday}</h3>
          <p className="text-5xl font-black text-primary-500 tracking-tighter">4</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
          <h3 className="text-2xl font-black mb-2 text-gray-400 uppercase tracking-widest text-xs">{t.dashboard.thisMonthEarnings}</h3>
          <p className="text-5xl font-black text-primary-500 tracking-tighter">RM3.5k</p>
        </div>
      </div>

      <form action={logout} className="mt-20">
        <button className="btn btn-primary px-10 h-16 rounded-2xl shadow-xl shadow-primary-100">{t.common.signOut}</button>
      </form>
    </div>
  );
}
