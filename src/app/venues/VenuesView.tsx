'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Container } from '@/components/Container';
import { MapPin, Plus, Trash2, Search, Map as MapIcon, Clock, Navigation, ExternalLink, ShieldCheck, Pencil, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { addVenueAction, deleteVenueAction, updateVenueAction, addRouteAction, deleteRouteAction } from '@/app/venues/actions';
import { useRouter } from 'next/navigation';

// Custom icons for Google Maps and Waze
const GoogleMapsLogo = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" className="w-4 h-4 lg:w-5 lg:h-5" alt="Google Maps" />
);

const WazeLogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 lg:w-6 lg:h-6" fill="#33CCFF">
    <title>Waze</title>
    <path d="M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z"/>
  </svg>
);

interface Venue {
  id: string;
  name: string;
  address: string | null;
  googleMapsUrl: string | null;
  wazeUrl: string | null;
  googleEmbedCode: string | null;
  wazeEmbedCode: string | null;
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
  const [previewEmbed, setPreviewEmbed] = useState<{ code: string, title: string } | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');

  const isSuperAdmin = userRole === 'super_admin';

  const filteredVenues = initialVenues.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleWheel = (e: React.WheelEvent<HTMLSelectElement | HTMLInputElement>) => {
    // Logic remains for value switching
    const target = e.currentTarget;
    const delta = e.deltaY > 0 ? 1 : -1;
    
    if (target instanceof HTMLSelectElement) {
      const newIndex = Math.max(0, Math.min(target.options.length - 1, target.selectedIndex + delta));
      if (newIndex !== target.selectedIndex) {
        target.selectedIndex = newIndex;
        const event = new Event('change', { bubbles: true });
        target.dispatchEvent(event);
      }
    } else if (target instanceof HTMLInputElement && target.type === 'number') {
      const step = parseFloat(target.step) || 1;
      const currentVal = parseFloat(target.value) || 0;
      const newVal = currentVal - (delta * step);
      target.value = newVal.toString();
      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
    }
  };

  // NATIVE SCROLL PREVENTION: Force non-passive behavior
  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      // If pointing at a wheel-control element, kill the page scroll
      if ((e.target as HTMLElement).closest('.wheel-control')) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleNativeWheel);
  }, []);

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
            <div className="flex gap-2">
              <button onClick={() => setIsRouteModalOpen(true)} className="h-12 lg:h-14 px-5 lg:px-8 bg-blue-500 text-white rounded-2xl lg:rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 font-black transition-transform active:scale-95 text-sm lg:text-base">
                <Clock className="w-5 h-5" />
                <span className="hidden sm:inline">Add Record</span>
              </button>
              <button onClick={() => setIsVenueModalOpen(true)} className="w-12 h-12 lg:w-auto lg:h-14 lg:px-8 bg-primary-500 text-white rounded-2xl lg:rounded-3xl shadow-xl shadow-primary-200 flex items-center justify-center gap-2 font-black transition-transform active:scale-95">
                <Plus className="w-6 h-6" />
                <span className="hidden lg:inline">Add Venue</span>
              </button>
            </div>
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

            <div className="flex-1">
              <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">{venue.name}</h3>
              {venue.address && (
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary-500" /> {venue.address}
                </p>
              )}
              
              {/* DATA COMPLETENESS AUDIT: Uni-directional check */}
              {(() => {
                const missing = initialVenues
                  .filter(v => v.id !== venue.id)
                  .filter(v => !routes.some(r => 
                    r.fromVenueId === venue.id && r.toVenueId === v.id
                  ));
                
                if (missing.length === 0) return null;
                
                return (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl mb-6 group/audit cursor-help relative" title={`Missing outgoing routes to: ${missing.map(m => m.name).join(', ')}`}>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                      Missing {missing.length} OUTGOING connections
                    </span>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[8px] font-bold rounded-lg opacity-0 group-hover/audit:opacity-100 transition-all pointer-events-none z-20 shadow-xl">
                      Required OUTGOING routes to:
                      <div className="mt-1 text-primary-300">
                        {missing.map(m => m.name).join(' • ')}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* NAVIGATION BUTTONS: Fused Pill Design */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                {venue.googleMapsUrl ? (
                    <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-full p-1 group/pill hover:shadow-md transition-all shadow-sm">
                      <a 
                        href={venue.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 h-full flex items-center justify-center gap-2 px-4 text-gray-900 hover:text-blue-600 transition-colors font-black text-[9px] tracking-widest uppercase"
                      >
                        <GoogleMapsLogo /> GOOGLE
                      </a>
                      {venue.googleEmbedCode && (
                        <button 
                          onClick={() => setPreviewEmbed({ code: venue.googleEmbedCode!, title: `Google Live: ${venue.name}` })}
                          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all group/live cursor-pointer"
                          title="Live Preview"
                        >
                          <MapIcon className="w-4 h-4 group-hover/live:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                ) : (
                  <div className="h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center gap-2 border border-gray-50 font-black text-[9px] uppercase tracking-widest cursor-not-allowed">
                    NO LINK
                  </div>
                )}

                {venue.wazeUrl ? (
                    <div className="flex items-center h-12 bg-gray-50 border border-gray-100 rounded-full p-1 group/pill hover:shadow-md transition-all shadow-sm">
                      <a 
                        href={venue.wazeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 h-full flex items-center justify-center gap-2 px-4 text-gray-900 hover:text-cyan-600 transition-colors font-black text-[9px] tracking-widest uppercase"
                      >
                        <WazeLogo /> WAZE
                      </a>
                      {venue.wazeEmbedCode && (
                        <button 
                          onClick={() => setPreviewEmbed({ code: venue.wazeEmbedCode!, title: `Waze Live: ${venue.name}` })}
                          className="w-10 h-10 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-200 active:scale-90 transition-all group/live cursor-pointer"
                          title="Live Preview"
                        >
                          <Navigation className="w-4 h-4 group-hover/live:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                ) : (
                  <div className="h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center gap-2 border border-gray-50 font-black text-[9px] uppercase tracking-widest cursor-not-allowed">
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
            <TravelTimeCalculator venues={initialVenues} routes={routes} onWheel={handleWheel} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={!!previewEmbed} onClose={() => setPreviewEmbed(null)} title={previewEmbed?.title || 'Map Preview'} size="wide">
        <div className="w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative">
          <div 
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            dangerouslySetInnerHTML={{ __html: previewEmbed?.code || '' }}
          />
        </div>
        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
           <p className="text-[10px] lg:text-xs font-bold text-primary-700 leading-relaxed">
             <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
             Showing custom interactive map. You can interact with the view to explore the area.
           </p>
        </div>
      </Modal>

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
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1">Google Embed Code (Iframe)</label>
                    <textarea name="googleEmbedCode" placeholder="Paste Google iframe..." className="input-field min-h-[80px] py-3 border-blue-50 font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1">Waze Embed Code (Iframe)</label>
                    <textarea name="wazeEmbedCode" placeholder="Paste Waze iframe..." className="input-field min-h-[80px] py-3 border-cyan-50 font-mono text-[10px]" />
                  </div>
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
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1">Google Embed Code (Iframe)</label>
                    <textarea name="googleEmbedCode" defaultValue={editingVenue?.googleEmbedCode || ''} placeholder="Paste Google iframe..." className="input-field min-h-[80px] py-3 border-blue-50 font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1">Waze Embed Code (Iframe)</label>
                    <textarea name="wazeEmbedCode" defaultValue={editingVenue?.wazeEmbedCode || ''} placeholder="Paste Waze iframe..." className="input-field min-h-[80px] py-3 border-cyan-50 font-mono text-[10px]" />
                  </div>
               </div>
             </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl font-black shadow-xl shadow-primary-200 mt-4 rounded-3xl">{loading ? 'UPDATING...' : 'UPDATE LOCATION'}</button>
        </form>
      </Modal>

      <Modal isOpen={isRouteModalOpen} onClose={() => { setIsRouteModalOpen(false); setRouteFrom(''); setRouteTo(''); }} title="Add Commute Record" size="default">
        <form onSubmit={handleAddRoute} className="space-y-6 bg-gray-50/50 -m-8 p-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">From</label>
              <select 
                name="fromVenueId" 
                required 
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                onWheel={(e) => { handleWheel(e); setRouteFrom(e.currentTarget.value); }} 
                className="input-field h-14 wheel-control"
              >
                <option value="">Select From</option>
                {initialVenues
                  .filter(v => {
                    // Only show venues that have at least one missing destination
                    const otherVenues = initialVenues.filter(ov => ov.id !== v.id);
                    return otherVenues.some(ov => !routes.some(r => r.fromVenueId === v.id && r.toVenueId === ov.id));
                  })
                  .map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))
                }
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">To</label>
              <select 
                name="toVenueId" 
                required 
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                onWheel={(e) => { handleWheel(e); setRouteTo(e.currentTarget.value); }}
                className="input-field h-14 wheel-control"
              >
                <option value="">Select To</option>
                {initialVenues
                  .filter(v => v.id !== routeFrom) // Don't allow same venue
                  .filter(v => !routes.some(r => r.fromVenueId === routeFrom && r.toVenueId === v.id)) // Filter out existing routes
                  .map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (mins)</label><input name="duration" type="number" required step="5" onWheel={handleWheel} className="input-field h-14 font-black wheel-control" /></div>
            <div className="space-y-2"><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Distance (km)</label><input name="distance" type="number" step="0.1" onWheel={handleWheel} className="input-field h-14 font-black wheel-control" /></div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-5 text-xl font-black shadow-xl shadow-primary-200 mt-4 rounded-3xl">{loading ? 'SAVING...' : 'SAVE ROUTE'}</button>
        </form>
      </Modal>
    </div>
  );
}

function TravelTimeCalculator({ venues, routes, onWheel }: { venues: Venue[], routes: Route[], onWheel: (e: React.WheelEvent<HTMLSelectElement | HTMLInputElement>) => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const matchedRoute = useMemo(() => {
    if (!from || !to) return null;
    return routes.find(r => 
      r.fromVenueId === from && r.toVenueId === to
    );
  }, [from, to, routes]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">From</label><div className="relative"><select value={from} onChange={(e) => setFrom(e.target.value)} onWheel={onWheel} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm wheel-control"><option value="" className="text-gray-900">Starting Point</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
        <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">To</label><div className="relative"><select value={to} onChange={(e) => setTo(e.target.value)} onWheel={onWheel} className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl font-black text-white outline-none focus:border-primary-500 transition-all appearance-none text-sm wheel-control"><option value="" className="text-gray-900">Destination</option>{venues.map(v => <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-[10px]">▼</div></div></div>
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
