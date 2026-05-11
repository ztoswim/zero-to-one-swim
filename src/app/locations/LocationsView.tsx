'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Container } from '@/components/Container';
import { MapPin, Plus, Trash2, Search, Map as MapIcon, Clock, Navigation, ExternalLink, ShieldCheck, Pencil, AlertTriangle } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { Modal } from '@/components/Modal';
import { addLocationAction, deleteLocationAction, updateLocationAction, addRouteAction, deleteRouteAction, updateRouteAction } from '@/app/locations/actions';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useTranslation } from '@/lib/i18n/useTranslation';


// Custom icons for Google Maps and Waze
const GoogleMapsLogo = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" className="w-4 h-4 lg:w-5 lg:h-5" alt="Google Maps" />
);

const WazeLogo = ({ className = "w-5 h-5 lg:w-6 lg:h-6" }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#33CCFF">
    <title>Waze</title>
    <path d="M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z"/>
  </svg>
);

interface Location {
  id: string;
  name: string;
  googleMapsUrl: string | null;
  wazeUrl: string | null;
  googleEmbedCode: string | null;
  wazeEmbedCode: string | null;
}

interface Route {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  durationMinutes: number;
  fromLocation: Location;
  toLocation: Location;
}

interface LocationsViewProps {
  locations: Location[];
  routes: Route[];
  user: any;
}

export function LocationsView({ locations: initialLocations, routes, user }: LocationsViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routePrefill, setRoutePrefill] = useState<{fromId: string, toId: string} | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [previewEmbed, setPreviewEmbed] = useState<{ code: string, title: string } | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');

  // Custom Confirm Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  const canCreate = hasPermission(user, 'create_location');
  const canEdit = hasPermission(user, 'edit_location');
  const canDelete = hasPermission(user, 'delete_location');
  const isRoot = user?.role === 'root' || user?.role === 'super_admin';

  const filteredLocations = initialLocations.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleWheel = (e: React.WheelEvent<HTMLSelectElement | HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.disabled) return;
    
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

  async function handleAddLocation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addLocationAction(formData);
    if (result.success) {
      setIsLocationModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleUpdateLocation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingLocation) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateLocationAction(editingLocation.id, formData);
    if (result.success) {
      setEditingLocation(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleAddRoute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = editingRoute 
      ? await updateRouteAction(editingRoute.id, formData)
      : await addRouteAction(formData);
      
    if (result.success) {
      setIsRouteModalOpen(false);
      setEditingRoute(null);
      setRoutePrefill(null);
      setRouteFrom('');
      setRouteTo('');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('nav.locations')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('locations.locationIntelligence')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {canCreate && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setEditingLocation(null); setIsLocationModalOpen(true); }}
                className="btn btn-primary px-8 h-12 shadow-lg shadow-primary-200 flex items-center gap-2 rounded-xl whitespace-nowrap"
              >
                {t('common.add')} {t('nav.locations')} <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden animate-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.locationInfo')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('common.googleNav')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('common.wazeNav')}</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLocations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{t('common.noRecords')}</p>
                  </td>
                </tr>
              )}
              {filteredLocations.map((location) => (
                <tr key={location.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center border-2 border-primary-100 text-primary-500 shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight">{location.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const missing = initialLocations
                              .filter(v => v.id !== location.id)
                              .filter(v => !routes.some(r => 
                                r.fromLocationId === location.id && r.toLocationId === v.id
                              ));
                            if (missing.length > 0) {
                              return (
                                <div className="relative group/audit">
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[9px] font-black text-amber-600 uppercase tracking-widest border border-amber-100 flex items-center gap-1 cursor-help">
                                    <AlertTriangle className="w-3 h-3" /> {missing.length} {t('common.missingRoutes')}
                                  </span>
                                  
                                  {/* Tooltip: Shown on hover with 'hover bridge' */}
                                  <div className="absolute bottom-full left-0 pb-4 opacity-0 group-hover/audit:opacity-100 transition-all pointer-events-none group-hover/audit:pointer-events-auto z-50 translate-y-2 group-hover/audit:translate-y-0">
                                    <div className="w-64 p-4 bg-white border border-gray-100 text-gray-900 text-[10px] font-bold rounded-2xl shadow-2xl shadow-amber-200/20 relative">
                                      <div className="text-[9px] text-amber-600 uppercase tracking-widest mb-3 pb-2 border-b border-amber-50">{t('common.quickFill')}</div>
                                      <div className="space-y-1.5">
                                        {missing.map(m => (
                                          <button 
                                            key={m.id} 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setRouteFrom(location.id);
                                              setRouteTo(m.id);
                                              setRoutePrefill({ fromId: location.id, toId: m.id });
                                              setIsRouteModalOpen(true);
                                            }}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 transition-all group/item border border-transparent hover:border-amber-100 text-left"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                              <span className="text-gray-900 font-black truncate">{m.name}</span>
                                            </div>
                                            <Plus className="w-3 h-3 text-amber-500 opacity-0 group-hover/item:opacity-100 transition-all" />
                                          </button>
                                        ))}
                                      </div>
                                      {/* Arrow */}
                                      <div className="absolute top-full left-6 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45 -translate-y-1.5" />
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {location.googleMapsUrl ? (
                      <div className="flex items-center h-12 bg-slate-50 border-2 border-slate-200 rounded-full p-1 group/pill hover:shadow-md transition-all shadow-sm max-w-[200px] mx-auto">
                        <a 
                          href={location.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 h-full flex items-center justify-center gap-2 px-4 text-gray-900 hover:text-blue-600 transition-colors font-black text-[9px] tracking-widest uppercase"
                        >
                          <GoogleMapsLogo /> GOOGLE
                        </a>
                        {location.googleEmbedCode && (
                          <button 
                            onClick={() => setPreviewEmbed({ code: location.googleEmbedCode!, title: `Google ${t('locations.livePreview')}: ${location.name}` })}
                            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all group/live cursor-pointer"
                            title={t('locations.livePreview')}
                          >
                            <MapIcon className="w-4 h-4 group-hover/live:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 rounded-full bg-slate-50 text-gray-300 flex items-center justify-center gap-2 border-2 border-slate-200 font-black text-[9px] uppercase tracking-widest cursor-not-allowed max-w-[200px] mx-auto">
                        NO LINK
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {location.wazeUrl ? (
                      <div className="flex items-center h-12 bg-slate-50 border-2 border-slate-200 rounded-full p-1 group/pill hover:shadow-md transition-all shadow-sm max-w-[200px] mx-auto">
                        <a 
                          href={location.wazeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 h-full flex items-center justify-center gap-2 px-4 text-gray-900 hover:text-cyan-600 transition-colors font-black text-[9px] tracking-widest uppercase"
                        >
                          <WazeLogo className="w-4 h-4 lg:w-4 lg:h-4" /> WAZE
                        </a>
                        {location.wazeEmbedCode && (
                          <button 
                            onClick={() => setPreviewEmbed({ code: location.wazeEmbedCode!, title: `Waze ${t('locations.livePreview')}: ${location.name}` })}
                            className="w-10 h-10 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-lg shadow-cyan-200 active:scale-90 transition-all group/live cursor-pointer"
                            title={t('locations.livePreview')}
                          >
                            <Navigation className="w-4 h-4 group-hover/live:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 rounded-full bg-slate-50 text-gray-300 flex items-center justify-center gap-2 border-2 border-slate-200 font-black text-[9px] uppercase tracking-widest cursor-not-allowed max-w-[200px] mx-auto">
                        NO LINK
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {canEdit && (
                        <button 
                          onClick={() => setEditingLocation(location)} 
                          className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all"
                          title={t('common.edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: t('common.delete') + ' ' + t('nav.locations'),
                              message: t('locations.deleteConfirm', { name: location.name }),
                              variant: 'danger',
                              onConfirm: () => {
                                setLoading(true);
                                deleteLocationAction(location.id).then(() => {
                                  router.refresh();
                                  setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                  setLoading(false);
                                });
                              }
                            });
                          }} 
                          className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Route Library - Refined */}
      <div className="mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-8 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tight">{t('common.routeLibrary')}</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('common.savedCommuteTimes')}</p></div>
          </div>
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[500px] lg:min-w-0">
              <thead>
                <tr className="bg-slate-50/50 border-b-2 border-slate-200">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.routePath')}</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t('common.estTime')}</th>
                  <th className="px-8 py-6 text-right px-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {routes.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-16 text-center text-xs font-bold text-gray-300 italic uppercase">{t('common.noRecords')}</td></tr>
                )}
                {routes.map(route => (
                  <tr key={route.id} className="group hover:bg-slate-50/50 transition-all border-b border-gray-100/50 last:border-0 relative">
                    <td className="px-8 py-8">
                      <div className="flex items-start gap-6">
                        {/* THE VERTICAL PATH VISUAL */}
                        <div className="flex flex-col items-center py-1 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white" />
                          <div className="w-px flex-1 border-l-2 border-dashed border-slate-200 my-1 min-h-[20px]" />
                          <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest w-8">{t('common.from')}</span>
                            <span className="text-slate-500 font-bold text-sm">{route.fromLocation?.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest w-8">{t('common.to')}</span>
                            <span className="text-slate-900 font-black text-base lg:text-lg tracking-tighter">{route.toLocation?.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center align-middle">
                      <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm lg:text-lg shadow-xl shadow-slate-200">
                        <Clock className="w-4 h-4 text-primary-400" />
                        {route.durationMinutes}
                        <span className="text-[10px] text-slate-400 uppercase">{t('common.mins')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {canEdit && (
                          <button 
                            onClick={() => {
                              setEditingRoute(route);
                              setRouteFrom(route.fromLocationId);
                              setRouteTo(route.toLocationId);
                              setIsRouteModalOpen(true);
                            }}
                            className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all"
                            title={t('common.edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => {
                              setConfirmConfig({
                                isOpen: true,
                                title: t('common.delete') + ' ' + t('common.routePath'),
                                message: t('locations.deleteRouteConfirm'),
                                variant: 'danger',
                                onConfirm: () => {
                                  setLoading(true);
                                  deleteRouteAction(route.id).then(() => {
                                    router.refresh();
                                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                    setLoading(false);
                                  });
                                }
                              });
                            }} 
                            className="w-9 h-9 rounded-xl bg-white text-gray-400 flex items-center justify-center border border-gray-100 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
            <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tighter">{t('common.routeEstimator')}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-12">{t('common.lookupTravelTime')}</p>
            <TravelTimeCalculator locations={initialLocations} routes={routes} onWheel={handleWheel} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={!!previewEmbed} onClose={() => setPreviewEmbed(null)} title={previewEmbed?.title || t('locations.mapPreview')} size="wide">
        <div className="w-full h-[350px] md:h-[500px] rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-2xl relative">
          <div 
            className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
            dangerouslySetInnerHTML={{ __html: previewEmbed?.code || '' }}
          />
        </div>
        <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
           <p className="text-[10px] lg:text-xs font-bold text-primary-700 leading-relaxed">
             <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
             {t('locations.showingCustomMap')}
           </p>
        </div>
      </Modal>

      <Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title={t('common.newLocation')} size="wide">
        <form onSubmit={handleAddLocation} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Core Info */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.locationProfile')}</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">{t('common.officialName')} *</label>
                  <input name="name" required placeholder={t('locations.locationNamePlaceholder')} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
              </div>
            </div>

            {/* Right Column: Direct Navigation */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center"><ExternalLink className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.googleMapsLink')}</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <GoogleMapsLogo /> {t('common.googleMapsLink')}
                  </label>
                  <input name="googleMapsUrl" placeholder={t('locations.pasteLink')} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-cyan-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <WazeLogo className="w-3.5 h-3.5" /> {t('common.wazeLink')}
                  </label>
                  <input name="wazeUrl" placeholder={t('locations.pasteLink')} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Map Embeds */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
            <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><MapIcon className="w-5 h-5" /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.liveMapEmbeds')} ({t('common.internalUseOnly')})</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapIcon className="w-3.5 h-3.5" /> {t('common.googleEmbed')}
                </label>
                <textarea name="googleEmbedCode" placeholder={t('locations.pasteIframe')} className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 h-24 resize-none text-[10px] font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-cyan-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> {t('common.wazeEmbed')}
                </label>
                <textarea name="wazeEmbedCode" placeholder={t('locations.pasteIframe')} className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 h-24 resize-none text-[10px] font-mono" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-20 h-14 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto uppercase">
              {loading ? t('common.loading') : t('common.saveLocation')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingLocation} onClose={() => setEditingLocation(null)} title={t('common.editLocation')} size="wide">
        <form onSubmit={handleUpdateLocation} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.locationProfile')}</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">{t('common.officialName')} *</label>
                  <input name="name" required defaultValue={editingLocation?.name} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center"><ExternalLink className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.googleMapsLink')}</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <GoogleMapsLogo /> {t('common.googleMapsLink')}
                  </label>
                  <input name="googleMapsUrl" defaultValue={editingLocation?.googleMapsUrl || ''} placeholder={t('locations.pasteLink')} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-cyan-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <WazeLogo className="w-3.5 h-3.5" /> {t('common.wazeLink')}
                  </label>
                  <input name="wazeUrl" defaultValue={editingLocation?.wazeUrl || ''} placeholder={t('locations.pasteLink')} className="w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
            <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><MapIcon className="w-5 h-5" /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.liveMapEmbeds')} ({t('common.internalUseOnly')})</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapIcon className="w-3.5 h-3.5" /> {t('common.googleEmbed')}
                </label>
                <textarea name="googleEmbedCode" defaultValue={editingLocation?.googleEmbedCode || ''} placeholder={t('locations.pasteIframe')} className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 h-24 resize-none text-[10px] font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-cyan-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> {t('common.wazeEmbed')}
                </label>
                <textarea name="wazeEmbedCode" defaultValue={editingLocation?.wazeEmbedCode || ''} placeholder={t('locations.pasteIframe')} className="w-full px-5 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 h-24 resize-none text-[10px] font-mono" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-20 h-14 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto uppercase">
              {loading ? t('common.loading') : t('common.updateLocation')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isRouteModalOpen} 
        onClose={() => {
          setIsRouteModalOpen(false);
          setRoutePrefill(null);
          setEditingRoute(null);
          setRouteFrom('');
          setRouteTo('');
        }} 
        title={editingRoute ? t('common.editRoute') : t('common.addRoute')} 
        size="wide"
      >
        <form onSubmit={handleAddRoute} className="bg-gray-100/30 -m-8 p-8 space-y-6">
          {/* Hidden inputs to ensure data is sent when selects are disabled */}
          {(!!routePrefill || !!editingRoute) && (
            <>
              <input type="hidden" name="fromLocationId" value={routeFrom} />
              <input type="hidden" name="toLocationId" value={routeTo} />
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Path Selection */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"><Navigation className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.selectPath')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.origin')}</label>
                  <select 
                    name={!(!!routePrefill || !!editingRoute) ? "fromLocationId" : undefined}
                    required 
                    value={routeFrom}
                    disabled={!!routePrefill || !!editingRoute}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    onWheel={handleWheel}
                    className={`w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm wheel-control appearance-none ${
                      (!!routePrefill || !!editingRoute) 
                        ? 'opacity-80 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500' 
                        : ''
                    }`}
                  >
                    <option value="">{t('common.selectStaff')}</option>
                    {initialLocations.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.destination')}</label>
                  <select 
                    name={!(!!routePrefill || !!editingRoute) ? "toLocationId" : undefined}
                    required 
                    value={routeTo}
                    disabled={!!routePrefill || !!editingRoute}
                    onChange={(e) => setRouteTo(e.target.value)}
                    onWheel={handleWheel}
                    className={`w-full px-5 py-3.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-primary-500 text-sm wheel-control appearance-none ${
                      (!!routePrefill || !!editingRoute) 
                        ? 'opacity-80 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-500' 
                        : ''
                    }`}
                  >
                    <option value="">{t('common.selectStaff')}</option>
                    {initialLocations
                      .filter(v => v.id !== routeFrom)
                      .map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              {(!!routePrefill || !!editingRoute) && (
                <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 p-3 rounded-xl border border-primary-100 flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3" /> {t('locations.lockedForAccuracy')}
                </p>
              )}
            </div>

            {/* Travel Time */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-200 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('common.estTime')}</h3>
              </div>
              <div className="space-y-6 flex flex-col justify-center py-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.durationMins')}</label>
                  <input 
                    name="duration" 
                    type="number" 
                    required 
                    step="5" 
                    defaultValue={editingRoute?.durationMinutes}
                    onWheel={handleWheel} 
                    placeholder="15"
                    className="w-full px-5 py-6 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-4xl text-center outline-none focus:border-amber-500 transition-all wheel-control"
                    autoFocus={!!routeFrom && !!routeTo} 
                  />
                </div>
                <p className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">{t('common.adjustWheel')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-20 h-14 text-lg font-black tracking-tighter shadow-xl shadow-primary-200 rounded-2xl w-full lg:w-auto uppercase">
              {loading ? t('common.loading') : editingRoute ? t('common.saveChanges') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        loading={loading}
        confirmText={t('locations.deletePermanently')}
      />
    </>
  );
}

function TravelTimeCalculator({ locations, routes, onWheel }: { locations: Location[], routes: Route[], onWheel: (e: React.WheelEvent<HTMLSelectElement | HTMLInputElement>) => void }) {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const matchedRoute = useMemo(() => {
    if (!from || !to) return null;
    return routes.find(r => 
      r.fromLocationId === from && r.toLocationId === to
    );
  }, [from, to, routes]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.from')}</label>
          <select 
            value={from} 
            onChange={(e) => setFrom(e.target.value)}
            onWheel={onWheel}
            className="w-full h-14 px-6 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white outline-none focus:border-primary-500 transition-all wheel-control appearance-none"
          >
            <option value="">{t('common.origin')}</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.to')}</label>
          <select 
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            onWheel={onWheel}
            className="w-full h-14 px-6 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white outline-none focus:border-primary-500 transition-all wheel-control appearance-none"
          >
            <option value="">{t('common.destination')}</option>
            {locations.filter(l => l.id !== from).map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-8 bg-slate-800/50 border-2 border-slate-700 rounded-3xl min-h-[140px] flex items-center justify-center relative overflow-hidden">
        {matchedRoute ? (
          <div className="text-center animate-in">
            <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2">{t('common.estTime')}</div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-7xl font-black tracking-tighter">{matchedRoute.durationMinutes}</span>
              <span className="text-xl font-bold text-slate-400 uppercase">{t('common.mins')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <Navigation className="w-10 h-10 mx-auto mb-3 text-slate-500" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {from && to ? t('common.noRouteFound') : t('common.selectLocationsToEstimate')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
