'use client';

import React, { useState, useMemo } from 'react';
import { Container } from '@/components/Container';
import { MapPin, Plus, Trash2, Search, Map as MapIcon, Clock, Navigation, ExternalLink, ShieldCheck, Pencil } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { 
  addVenueAction, 
  updateVenueAction, 
  addRouteAction, 
  deleteVenueAction, 
  deleteRouteAction,
  resolveVenueCoordinatesAction 
} from '@/app/venues/actions';
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
  googleMapsUrl: string | null;
  wazeUrl: string | null;
  googleEmbed: string | null;
  wazeEmbed: string | null;
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
  const [trafficVenue, setTrafficVenue] = useState<Venue | null>(null);
  const [trafficType, setTrafficType] = useState<'waze' | 'google' | null>(null);
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

            <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-primary-600 transition-colors">{venue.name}</h3>
            {venue.address && (
              <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary-400" /> {venue.address}
              </p>
            )}
            
            <div className="flex-1" />
            
            {/* NAVIGATION BUTTONS: Bottom of card for mobile accessibility */}
            <div className="space-y-3 pt-6 border-t border-gray-50">
              {venue.wazeEmbed && (
                <button 
                  onClick={() => { setTrafficVenue(venue); setTrafficType('waze'); }}
                  className="w-full h-12 rounded-2xl bg-cyan-500 text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-cyan-100 hover:bg-cyan-600 active:scale-95"
                >
                  <Navigation className="w-4 h-4" /> View Live Traffic
                </button>
              )}

              {venue.googleEmbed && (
                <button 
                  onClick={() => { setTrafficVenue(venue); setTrafficType('google'); }}
                  className="w-full h-12 rounded-2xl bg-primary-500 text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary-100 hover:bg-primary-600 active:scale-95"
                >
                  <MapIcon className="w-4 h-4" /> View Map
                </button>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                {venue.googleMapsUrl ? (
                  <a 
                    href={venue.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-900 hover:text-blue-600 transition-all flex items-center justify-center gap-2 border border-gray-100 font-black text-[8px] tracking-widest uppercase"
                  >
                    <GoogleMapsLogo /> GOOGLE
                  </a>
                ) : (
                  <div className="h-10 rounded-xl bg-gray-50 text-gray-200 flex items-center justify-center gap-2 border border-gray-50 font-black text-[8px] uppercase tracking-widest cursor-not-allowed">
                    NO LINK
                  </div>
                )}

                {venue.wazeUrl ? (
                  <a 
                    href={venue.wazeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="h-10 rounded-xl bg-gray-50 hover:bg-cyan-50 text-gray-900 hover:text-cyan-600 transition-all flex items-center justify-center gap-2 border border-gray-100 font-black text-[8px] tracking-widest uppercase"
                  >
                    <WazeLogo /> WAZE
                  </a>
                ) : (
                  <div className="h-10 rounded-xl bg-gray-50 text-gray-200 flex items-center justify-center gap-2 border border-gray-50 font-black text-[8px] uppercase tracking-widest cursor-not-allowed">
                    NO LINK
                  </div>
                )}
              </div>
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
      <Modal 
        isOpen={!!trafficVenue} 
        onClose={() => { setTrafficVenue(null); setTrafficType(null); }} 
        title={trafficType === 'waze' ? `Live Traffic: ${trafficVenue?.name}` : `Location Map: ${trafficVenue?.name}`}
        size="large"
      >
        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative">
          {trafficType === 'waze' && trafficVenue?.wazeEmbed ? (
            <div 
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
              dangerouslySetInnerHTML={{ __html: trafficVenue.wazeEmbed }}
            />
          ) : trafficType === 'google' && trafficVenue?.googleEmbed ? (
            <div 
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
              dangerouslySetInnerHTML={{ __html: trafficVenue.googleEmbed }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase tracking-widest text-xs">
              No Embed Data Available
            </div>
          )}
        </div>
        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
           <p className="text-[10px] lg:text-xs font-bold text-primary-700 leading-relaxed">
             <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
             Showing {trafficType === 'waze' ? 'real-time traffic' : 'venue location'}. You can interact with the map to explore.
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
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Address</label>
                 <input name="address" placeholder="Full address..." className="input-field h-14" />
              </div>
             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-4 pt-4 border-t border-gray-100">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MapIcon className="w-3 h-3" /> Google Maps Embed Code
                    </label>
                    <textarea name="googleEmbed" placeholder="Paste Google iframe code..." className="input-field min-h-[80px] py-3 border-blue-100 focus:border-blue-500 font-mono text-[10px]" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Navigation className="w-3 h-3" /> Waze Embed Code
                    </label>
                    <textarea name="wazeEmbed" placeholder="Paste Waze iframe code..." className="input-field min-h-[80px] py-3 border-cyan-100 focus:border-cyan-500 font-mono text-[10px]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Google Maps URL</label>
                      <input name="googleMapsUrl" placeholder="https://maps.google.com..." className="input-field h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Waze URL</label>
                      <input name="wazeUrl" placeholder="https://waze.com/ul..." className="input-field h-12" />
                    </div>
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
              <div className="space-y-2">
                 <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Address</label>
                 <input name="address" defaultValue={editingVenue?.address || ''} placeholder="Full address..." className="input-field h-14" />
              </div>
             <div className="grid grid-cols-1 gap-4">
               <div className="space-y-4 pt-4 border-t border-gray-100">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MapIcon className="w-3 h-3" /> Google Maps Embed Code
                    </label>
                    <textarea name="googleEmbed" defaultValue={editingVenue?.googleEmbed || ''} placeholder="Paste Google iframe code..." className="input-field min-h-[80px] py-3 border-blue-100 focus:border-blue-500 font-mono text-[10px]" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-cyan-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Navigation className="w-3 h-3" /> Waze Embed Code
                    </label>
                    <textarea name="wazeEmbed" defaultValue={editingVenue?.wazeEmbed || ''} placeholder="Paste Waze iframe code..." className="input-field min-h-[80px] py-3 border-cyan-100 focus:border-cyan-500 font-mono text-[10px]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Google Maps URL</label>
                      <input name="googleMapsUrl" defaultValue={editingVenue?.googleMapsUrl || ''} placeholder="https://maps.google.com..." className="input-field h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Waze URL</label>
                      <input name="wazeUrl" defaultValue={editingVenue?.wazeUrl || ''} placeholder="https://waze.com/ul..." className="input-field h-12" />
                    </div>
                 </div>
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
