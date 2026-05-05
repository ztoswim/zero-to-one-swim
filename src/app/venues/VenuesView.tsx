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
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzMzQ0NDQyIgZD0iTTE4LjUgMTBDMTkuOSA5LjkgMjEuMiAxMC43IDIxLjUgMTIuM0MyMS44IDEzLjggMjEuMSAxNS4zIDE5LjcgMTUuN0wxOS4xIDE1LjhDMTkuMiAxNS4yIDE5LjIgMTQuNyAxOS4yIDE0LjFDMTkuMiAxMS44IDE4LjkgMTAuOCAxOC41IDEwWk04LjU1IDE4QzguNTUgMTguOCAzLjU1IDE4LjggMy41NSAxOEMzLjU1IDE3LjIgOC41NSAxNy4yIDguNTUgMThaTTE1LjQ1IDE4QzE1LjQ1IDE4LjggMTAuNDUgMTguOCAxMC40NSAxOEMxMC40NSAxNy4yIDE1LjQ1IDE3LjIgMTUuNDUgMThaTTE5LjYgMTcuNEMxOS42IDE4LjIgMTguOSAxOC45IDE4LjEgMTguOUMxNy4zIDE4LjkgMTYuNiAxOC4yIDE2LjYgMTcuNEMxNi42IDE2LjYgMTcuMyAxNS45IDE4LjEgMTUuOUMxOC45IDE1LjkgMTkuNiAxNi42IDE5LjYgMTcuNFpNOS4xIDE3LjRDOS4xIDE4LjIgOC40IDE4LjkgNy42IDE4LjlDNi44IDE4LjkgNi4xIDE4LjIgNi4xIDE3LjRDNi4xIDE2LjYgNi44IDE1LjkgNy42IDE1LjlDOC40IDE1LjkgOS4xIDE2LjYgOS4xIDE3LjRaTTExIDNDMTcuMSA0IDE4LjkgOC41IDE5IDE0LjFDMTkgMTQuNCAxOC45IDE0LjcgMTguOCAxNUMxNy44IDE0LjUgMTYuNSAxNC4zIDE1IDE0LjNDMTQuMyAxNC4zIDEzLjYgMTQuNCAxMyAxNC41QzExLjMgMTQuNyA5LjkgMTUuMyA4LjggMTUuOUM3LjcgMTUuMyA2LjMgMTQuNyA0LjYgMTQuNUM0IDE0LjQgMy4zIDE0LjMgMi42IDE0LjNDMS4xIDE0LjMgMC4xIDE0LjYgMC4xIDE1LjFDMC4xIDE1LjQgMC4xIDE1LjcgMC4xIDE2QzAuMSAxNy42IDIgMjEgNiAyMUM2LjYgMjEgNy4yIDIwLjggNy44IDIwLjVDOC40IDIwLjggOSAyMSAxMCAyMUMxMC42IDIxIDExLjIgMjAuOCAxMS44IDIwLjVDMTIuNCAyMC44IDEzIDIxIDE0IDIxQzE4IDIxIDE5LjkgMTcuNiAxOS45IDE2QzE5LjkgMTUuNyAxOS45IDE1LjQgMTkuOSAxNS4xQzE5LjkgMTQuNiAxOS45IDE0LjEgMTkuOCAxMy42QzIwLjcgMTIuNSAyMSAxMS4xIDIwLjYgOS43QzIwLjIgOC4zIDE5LjEgNy4zIDE3LjcgNi45QzE2LjIgNi41IDE0LjggNy4xIDE0IDguMkMxMy4xIDYuOSAxMS43IDYuMSA5LjkgNi4xQzguOSA2LjEgNy45IDYuMyA3IDYuN0M0LjIgOC4yIDMgMTEuNyAzIDE0LjFDMyAxNC43IDMuMSAxNS4yIDMuMiAxNS43TDIuNiAxNS43QzEuMiAxNS4zIDAuNSAxMy44IDAuOCAxMi4zQzEuMSAxMC43IDIuNCA5LjkgMy44IDEwQzMuNCAxMC44IDMuMSAxMS44IDMuMSAxNC4xQzMuMSAxNC43IDMuMSAxNS4yIDMuMiAxNS43TDkuMSAxNy40WiIvPjwvc3ZnPg==" className="w-4 h-4 lg:w-5 lg:h-5 object-contain" alt="Waze" />
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
