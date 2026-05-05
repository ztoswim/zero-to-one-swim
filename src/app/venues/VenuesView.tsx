'use client';

import React, { useState, useMemo } from 'react';
import { Container } from '@/components/Container';
import { MapPin, Plus, Trash2, Search, Map as MapIcon, Clock, Navigation, ExternalLink, ShieldCheck, Pencil } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { addVenueAction, deleteVenueAction, updateVenueAction, addRouteAction, deleteRouteAction } from './actions';
import { useRouter } from 'next/navigation';

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
    <Container>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-2">
              Swim <span className="text-primary-500">Venues</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Facility & Location Database</p>
              {isSuperAdmin && (
                <div className="px-2 py-0.5 bg-gray-900 text-[9px] text-white font-black rounded flex items-center gap-1 uppercase tracking-widest">
                  <ShieldCheck className="w-2.5 h-2.5 text-primary-400" /> Super Admin Access
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search venues..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all w-64 shadow-sm"
            />
          </div>
          {isSuperAdmin && (
            <button onClick={() => setIsVenueModalOpen(true)} className="btn btn-primary px-8 h-14 shadow-xl shadow-primary-200 flex items-center gap-2 font-black">
              Add Location <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '0.1s' }}>
        {filteredVenues.map((venue) => (
          <div key={venue.id} className="bg-white rounded-[3rem] p-8 border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all flex gap-3">
              {venue.googleMapsUrl && (
                <a 
                  href={venue.googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 px-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-sm border border-blue-100 font-black text-[10px] tracking-widest"
                >
                  <MapIcon className="w-4 h-4" /> GOOGLE
                </a>
              )}
              {venue.wazeUrl && (
                <a 
                  href={venue.wazeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 px-4 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all flex items-center gap-2 shadow-sm border border-cyan-100 font-black text-[10px] tracking-widest"
                >
                  <Navigation className="w-4 h-4" /> WAZE
                </a>
              )}
              {isSuperAdmin && (
                <div className="flex gap-2 ml-2">
                  <button onClick={() => setEditingVenue(venue)} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-green-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if(confirm('Delete venue?')) deleteVenueAction(venue.id).then(() => router.refresh()) }} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform"><MapPin className="w-8 h-8" /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">{venue.name}</h3>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
               {venue.googleMapsUrl ? (
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg">Google Linked</span>
               ) : (
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg">No Google</span>
               )}
               {venue.wazeUrl ? (
                 <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest px-2 py-1 bg-cyan-50 rounded-lg">Waze Linked</span>
               ) : (
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg">No Waze</span>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
        <div className="space-y-8 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Manual Route Library</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Commute time records</p></div>
            {isSuperAdmin && (
              <button onClick={() => setIsRouteModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-gray-200"><Plus className="w-4 h-4" /> Add Route</button>
            )}
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50/50 border-b border-gray-50"><th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Route</th><th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration</th><th className="px-6 py-4 text-right"></th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {routes.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-xs font-bold text-gray-300 italic uppercase">No routes recorded yet</td></tr>
                )}
                {routes.map(route => (
                  <tr key={route.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 font-black text-gray-900 text-sm">
                        <span className="text-gray-400">{route.fromVenue?.name}</span>
                        <Navigation className="w-3 h-3 text-primary-500 rotate-90" />
                        <span className="text-gray-900">{route.toVenue?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-black w-fit"><Clock className="w-3 h-3" /> {route.durationMinutes}m</div></td>
                    <td className="px-6 py-5 text-right">
                      {isSuperAdmin && (
                        <button onClick={() => { if(confirm('Delete route?')) deleteRouteAction(route.id).then(() => router.refresh()) }} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden h-fit animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-12 opacity-5"><MapIcon className="w-64 h-64 rotate-12" /></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-2 tracking-tighter">Route <span className="text-primary-500">Estimator</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Instant check from manual records</p>
            <TravelTimeCalculator venues={initialVenues} routes={routes} />
          </div>
        </div>
      </div>

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

      {/* EDIT MODAL */}
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
    </Container>
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
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">From Location</label><div className="relative"><select value={from} onChange={(e) => setFrom(e.target.value)} onWheel={(e) => handleSelectWheel(e, setFrom)} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm"><option value="" className="text-gray-900">Starting Point</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">To Destination</label><div className="relative"><select value={to} onChange={(e) => setTo(e.target.value)} onWheel={(e) => handleSelectWheel(e, setTo)} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm"><option value="" className="text-gray-900">Destination</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
      </div>
      <div className="min-h-[100px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-8 bg-black/20">
        {matchedRoute ? (
          <div className="flex items-center gap-10 animate-in zoom-in-95">
            <div><div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Commute Time</div><div className="text-5xl font-black text-white tracking-tighter">{matchedRoute.durationMinutes}<span className="text-sm ml-1 opacity-50">MINS</span></div></div>
            {matchedRoute.distanceKm && (<><div className="w-px h-12 bg-white/10"></div><div><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Distance</div><div className="text-3xl font-black text-white">{matchedRoute.distanceKm}<span className="text-sm ml-1 opacity-50">KM</span></div></div></>)}
          </div>
        ) : (
          <div className="text-center">
            {(!from || !to) ? (<p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Select two points to check commute</p>) : (<div className="space-y-4"><p className="text-primary-400 font-bold uppercase tracking-widest text-[10px]">No commute record found</p><p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Add this route in the library to see results</p></div>)}
          </div>
        )}
      </div>
    </div>
  );
}
