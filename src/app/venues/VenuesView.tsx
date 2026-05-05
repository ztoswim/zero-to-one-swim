'use client';

import React, { useState, useMemo } from 'react';
import { Container } from '@/components/Container';
import { MapPin, Plus, Trash2, Search, Map as MapIcon, Clock, Navigation, ExternalLink, ShieldCheck, Pencil } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { addVenueAction, deleteVenueAction, updateVenueAction, addRouteAction, deleteRouteAction } from './actions';
import { useRouter } from 'next/navigation';

// Custom icons for Google Maps and Waze
const GoogleMapsLogo = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" className="w-4 h-4 lg:w-5 lg:h-5" alt="Google Maps" />
);

const WazeLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 lg:w-5 lg:h-5">
    <path d="M19.3444 11.6667C19.9533 11.6667 20.4468 12.1601 20.4468 12.769C20.4468 13.3779 19.9533 13.8713 19.3444 13.8713C18.7355 13.8713 18.2421 13.3779 18.2421 12.769C18.2421 12.1601 18.7355 11.6667 19.3444 11.6667ZM11.1147 11.6667C11.7236 11.6667 12.217 12.1601 12.217 12.769C12.217 13.3779 11.7236 13.8713 11.1147 13.8713C10.5058 13.8713 10.0124 13.3779 10.0124 12.769C10.0124 12.1601 10.5058 11.6667 11.1147 11.6667ZM21.9056 9.56589C21.9056 6.0717 19.0732 3.23926 15.579 3.23926C14.7171 3.23926 13.9015 3.41163 13.1558 3.72251C12.6393 3.32836 11.9961 3.09457 11.3 3.09457C10.0381 3.09457 9.01524 4.11743 9.01524 5.37929C9.01524 5.61907 9.0522 5.8499 9.12079 6.06649C7.03716 7.00977 5.58984 9.11784 5.58984 11.5659C5.58984 13.067 6.13601 14.4406 7.04279 15.5008L5.75389 16.7897C5.5312 17.0124 5.5312 17.3732 5.75389 17.5959C5.97658 17.8186 6.33737 17.8186 6.56006 17.5959L7.84896 16.307C8.90911 17.2138 10.2827 17.76 11.7838 17.76C11.9094 17.76 12.0343 17.756 12.1583 17.7483C13.2555 18.6657 14.6644 19.2159 16.2056 19.2159C16.4801 19.2159 16.751 19.2159 17.0175 19.2159L17.7725 20.7259C17.9157 21.0121 18.2718 21.1287 18.568 19.9855C18.6534 19.7431 18.625 19.4755 18.4901 19.2555C18.411 19.1265 18.3148 19.0068 18.2045 18.8995C20.4005 17.9254 21.9056 15.7176 21.9056 13.1526V12.769C21.9056 12.7006 21.9051 12.6324 21.9042 12.5643C21.9051 12.4962 21.9056 12.428 21.9056 12.3597V9.56589ZM15.579 4.34199C18.464 4.34199 20.8029 6.68087 20.8029 9.56589V12.3597C20.8029 12.4338 20.8022 12.5076 20.8009 12.5812C20.8022 12.644 20.8029 12.7067 20.8029 12.769C20.8029 15.654 18.464 17.9929 15.579 17.9929C15.1119 17.9929 14.658 17.9317 14.227 17.8172C14.0722 17.7761 13.9048 17.7946 13.7634 17.8687L13.1558 18.1873V18.1873C12.7213 18.4152 12.2519 18.5756 11.7582 18.656C11.082 18.7662 10.3808 18.7662 9.70462 18.656C8.80227 18.509 7.9546 18.1469 7.23467 17.6074L6.94595 17.8961C6.61191 18.2301 6.07068 18.2301 5.73664 17.8961C5.40259 17.562 5.40259 17.0208 5.73664 16.6868L6.02535 16.398C5.48588 15.6781 5.12379 14.8304 4.97682 13.9281C4.86659 13.2519 4.86659 12.5507 4.97682 11.8745C5.05717 11.3808 5.21759 10.9114 5.44551 10.4769V10.4769L5.76404 9.86934C5.83818 9.72793 5.85667 9.56052 5.81554 9.40578C4.79383 5.56846 7.6833 2.11584 11.5835 2.11584C12.4454 2.11584 13.261 2.28821 14.0067 2.59909V2.59909C14.7412 2.90998 15.5568 3.08235 16.4187 3.08235C19.3037 3.08235 21.6426 5.42123 21.6426 8.30625V11.1001C21.6426 11.1741 21.6419 11.248 21.6405 11.3216C21.6419 11.3844 21.6426 11.4471 21.6426 11.5094V11.5094C21.6426 14.3944 19.3037 16.7333 16.4187 16.7333" fill="#33CCFF"/>
  </svg>
);

interface Venue {
  id: string;
  name: string;
  googleMapsUrl: string | null;
  wazeUrl: string | null;
}

interface Route {
  id: string;
  fromVenueId: string;
  toVenueId: string;
  durationMinutes: number;
  distanceKm: string | null;
  fromVenue: Venue;
  toVenue: Venue;
}

interface VenuesViewProps {
  venues: Venue[];
  routes: Route[];
  userRole: string;
}

export function VenuesView({ venues: initialVenues, routes, userRole }: VenuesViewProps) {
  const router = useRouter();
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const isSuperAdmin = userRole === 'super_admin';

  const filteredVenues = initialVenues.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddVenue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addVenueAction(formData);
    if (result.success) {
      setIsVenueModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleUpdateVenue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingVenue) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateVenueAction(editingVenue.id, formData);
    if (result.success) {
      setEditingVenue(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAddRoute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addRouteAction(formData);
    if (result.success) {
      setIsRouteModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 lg:mb-16 animate-in">
        <div className="flex items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-6xl font-black text-gray-900 tracking-tighter">
              Swim <span className="text-primary-500">Venues</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-gray-400 font-bold uppercase tracking-[0.1em] lg:tracking-[0.3em] text-[9px] lg:text-xs">Location Intelligence</p>
              {isSuperAdmin && (
                <div className="px-2 py-0.5 bg-gray-900 text-[8px] lg:text-[9px] text-white font-black rounded flex items-center gap-1 uppercase tracking-widest">
                  <ShieldCheck className="w-2.5 h-2.5 text-primary-400" /> Super Admin
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all w-full lg:w-64 shadow-sm"
            />
          </div>
          {isSuperAdmin && (
            <button onClick={() => setIsVenueModalOpen(true)} className="w-12 h-12 lg:w-auto lg:h-14 lg:px-8 bg-primary-500 text-white rounded-2xl lg:rounded-3xl shadow-xl shadow-primary-200 flex items-center justify-center gap-2 font-black transition-transform active:scale-95">
              <Plus className="w-6 h-6" />
              <span className="hidden lg:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 animate-in" style={{ animationDelay: '0.1s' }}>
        {filteredVenues.map((venue) => (
          <div key={venue.id} className="bg-white rounded-[2rem] lg:rounded-[3.5rem] p-6 lg:p-10 border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all group relative flex flex-col overflow-hidden">
            {/* Action Buttons: Desktop Top-Right, Mobile Flow */}
            <div className="hidden lg:flex absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all gap-2">
              {isSuperAdmin && (
                <>
                  <button onClick={() => setEditingVenue(venue)} className="w-11 h-11 rounded-xl bg-green-50 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-green-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if(confirm('Delete venue?')) deleteVenueAction(venue.id).then(() => router.refresh()) }} className="w-11 h-11 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-red-100"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>

            <div className="flex items-start justify-between mb-6 lg:mb-10">
              <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[2rem] bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform"><MapPin className="w-7 h-7 lg:w-10 lg:h-10" /></div>
              {isSuperAdmin && (
                <div className="lg:hidden flex gap-2">
                   <button onClick={() => setEditingVenue(venue)} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center border border-green-100"><Pencil className="w-4 h-4" /></button>
                   <button onClick={() => { if(confirm('Delete venue?')) deleteVenueAction(venue.id).then(() => router.refresh()) }} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center border border-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6 tracking-tight group-hover:text-primary-600 transition-colors flex-1">{venue.name}</h3>
            
            {/* NAVIGATION BUTTONS: Bottom of card for mobile accessibility */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
              {venue.googleMapsUrl ? (
                <a 
                  href={venue.googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-12 lg:h-14 rounded-2xl bg-gray-50 hover:bg-blue-50 text-gray-900 hover:text-blue-600 transition-all flex items-center justify-center gap-3 border border-gray-100 font-black text-[10px] lg:text-xs tracking-widest uppercase shadow-sm"
                >
                  <GoogleMapsLogo /> GOOGLE
                </a>
              ) : (
                <div className="h-12 lg:h-14 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center gap-3 border border-gray-50 font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                  NO LINK
                </div>
              )}

              {venue.wazeUrl ? (
                <a 
                  href={venue.wazeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-12 lg:h-14 rounded-2xl bg-gray-50 hover:bg-cyan-50 text-gray-900 hover:text-cyan-600 transition-all flex items-center justify-center gap-3 border border-gray-100 font-black text-[10px] lg:text-xs tracking-widest uppercase shadow-sm"
                >
                  <WazeLogo /> WAZE
                </a>
              ) : (
                <div className="h-12 lg:h-14 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center gap-3 border border-gray-50 font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                  NO LINK
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Route Library - Refined */}
      <div className="mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-8 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tight">Route Library</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saved commute times</p></div>
            {isSuperAdmin && (
              <button onClick={() => setIsRouteModalOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200"><Plus className="w-4 h-4" /> New Record</button>
            )}
          </div>
          <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[500px] lg:min-w-0">
              <thead><tr className="bg-gray-50/50 border-b border-gray-50"><th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Route Path</th><th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Est. Time</th><th className="px-6 py-5 text-right"></th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {routes.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-16 text-center text-xs font-bold text-gray-300 italic uppercase">No records created</td></tr>
                )}
                {routes.map(route => (
                  <tr key={route.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 font-black text-gray-900 text-xs lg:text-base">
                        <span className="text-gray-400">{route.fromVenue?.name}</span>
                        <Navigation className="w-3 h-3 text-primary-500 rotate-90 shrink-0" />
                        <span className="text-gray-900">{route.toVenue?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs lg:text-sm font-black w-fit"><Clock className="w-4 h-4" /> {route.durationMinutes}m</div></td>
                    <td className="px-6 py-6 text-right">
                      {isSuperAdmin && (
                        <button onClick={() => { if(confirm('Delete route?')) deleteRouteAction(route.id).then(() => router.refresh()) }} className="p-3 text-gray-300 hover:text-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-[2.5rem] lg:rounded-[4rem] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden h-fit animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-12 opacity-5"><MapIcon className="w-64 h-64 rotate-12" /></div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tighter">Route <span className="text-primary-500">Estimator</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-12">Lookup travel time from records</p>
            <TravelTimeCalculator venues={initialVenues} routes={routes} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={isVenueModalOpen} onClose={() => setIsVenueModalOpen(false)} title="New Swim Venue" size="default">
        <form onSubmit={handleAddVenue} className="space-y-6 bg-gray-50/50 -m-8 p-8">
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue Name *</label>
                <input name="name" required placeholder="e.g. Park City Swimming Pool" className="input-field h-14" />
             </div>
             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapIcon className="w-3 h-3" /> Google Maps Link
                  </label>
                  <input name="googleMapsUrl" placeholder="Paste link..." className="input-field h-14 border-blue-100 focus:border-blue-500" />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Navigation className="w-3 h-3" /> Waze Link
                  </label>
                  <input name="wazeUrl" placeholder="Paste link..." className="input-field h-14 border-cyan-100 focus:border-cyan-500" />
               </div>
             </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl font-black shadow-xl shadow-primary-200 mt-4 rounded-3xl">{loading ? 'SAVING...' : 'SAVE LOCATION'}</button>
        </form>
      </Modal>

      <Modal isOpen={!!editingVenue} onClose={() => setEditingVenue(null)} title="Edit Swim Venue" size="default">
        <form onSubmit={handleUpdateVenue} className="space-y-6 bg-gray-50/50 -m-8 p-8">
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue Name *</label>
                <input name="name" required defaultValue={editingVenue?.name} className="input-field h-14" />
             </div>
             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapIcon className="w-3 h-3" /> Google Maps Link
                  </label>
                  <input name="googleMapsUrl" defaultValue={editingVenue?.googleMapsUrl || ''} placeholder="Paste link..." className="input-field h-14 border-blue-100 focus:border-blue-500" />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Navigation className="w-3 h-3" /> Waze Link
                  </label>
                  <input name="wazeUrl" defaultValue={editingVenue?.wazeUrl || ''} placeholder="Paste link..." className="input-field h-14 border-cyan-100 focus:border-cyan-500" />
               </div>
             </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl font-black shadow-xl shadow-primary-200 mt-4 rounded-3xl">{loading ? 'UPDATING...' : 'UPDATE LOCATION'}</button>
        </form>
      </Modal>

      <Modal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} title="Add Commute Record" size="default">
        <form onSubmit={handleAddRoute} className="space-y-6 bg-gray-50/50 -m-8 p-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">From</label><select name="fromVenueId" required className="input-field h-14">{initialVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">To</label><select name="toVenueId" required className="input-field h-14">{initialVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (mins)</label><input name="duration" type="number" required step="5" className="input-field h-14 font-black" /></div>
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Distance (km)</label><input name="distance" type="number" step="0.1" className="input-field h-14 font-black" /></div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl font-black shadow-xl shadow-primary-200 mt-4 rounded-3xl">{loading ? 'SAVING...' : 'SAVE ROUTE'}</button>
        </form>
      </Modal>
    </div>
  );
}

function TravelTimeCalculator({ venues, routes }: { venues: Venue[], routes: Route[] }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const matchedRoute = useMemo(() => {
    if (!from || !to) return null;
    return routes.find(r => 
      (r.fromVenueId === from && r.toVenueId === to) || 
      (r.fromVenueId === to && r.toVenueId === from)
    );
  }, [from, to, routes]);

  const handleSelectWheel = (e: React.WheelEvent<HTMLSelectElement>, onChange: (val: string) => void) => {
    e.preventDefault();
    const select = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(select.options.length - 1, select.selectedIndex + delta));
    if (newIndex !== select.selectedIndex) {
      onChange(select.options[newIndex].value);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">From</label><div className="relative"><select value={from} onChange={(e) => setFrom(e.target.value)} onWheel={(e) => handleSelectWheel(e, setFrom)} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm"><option value="" className="text-gray-900">Starting Point</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">To</label><div className="relative"><select value={to} onChange={(e) => setTo(e.target.value)} onWheel={(e) => handleSelectWheel(e, setTo)} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm"><option value="" className="text-gray-900">Destination</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
      </div>
      <div className="min-h-[100px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] p-8 bg-black/20">
        {matchedRoute ? (
          <div className="flex items-center gap-10 animate-in zoom-in-95">
            <div><div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Time</div><div className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{matchedRoute.durationMinutes}<span className="text-xs ml-1 opacity-50">MINS</span></div></div>
            {matchedRoute.distanceKm && (<><div className="w-px h-12 bg-white/10"></div><div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Dist</div><div className="text-2xl lg:text-3xl font-black text-white">{matchedRoute.distanceKm}<span className="text-xs ml-1 opacity-50">KM</span></div></div></>)}
          </div>
        ) : (
          <div className="text-center">
            {(!from || !to) ? (<p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Select routes</p>) : (<p className="text-primary-400 font-bold uppercase tracking-widest text-[9px]">No records</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
