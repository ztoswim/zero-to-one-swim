'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PackageModal } from './PackageModal';
import { deletePackage } from './actions';
import { Search, Plus, Edit2, Trash2, Clock, DollarSign, ListOrdered, Users, MapPin } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface PackagesViewProps {
  initialPackages: any[];
}

export function PackagesView({ initialPackages }: PackagesViewProps) {
  const { t } = useTranslation();
  const [packages, setPackages] = useState(initialPackages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('Private');

  const categories = [
    { id: 'Private', label: t('packages.catPrivate') },
    { id: 'Door to Door', label: t('packages.catD2D') },
    { id: 'Private Training', label: t('packages.catPrivateTraining') },
    { id: 'D2D Training', label: t('packages.catD2DTraining') },
    { id: 'Group', label: t('packages.catGroup') }
  ];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Private Training logic
    if (selectedType === 'Private Training') {
      return matchesSearch && pkg.type === 'Private' && pkg.name.includes('Training');
    }
    
    // D2D Training logic
    if (selectedType === 'D2D Training') {
      return matchesSearch && pkg.type === 'Door to Door' && pkg.name.includes('Training');
    }
    
    // Regular Private (Exclude Training)
    if (selectedType === 'Private') {
      return matchesSearch && pkg.type === 'Private' && !pkg.name.includes('Training');
    }
    
    // Regular Door to Door (Exclude Training)
    if (selectedType === 'Door to Door') {
      return matchesSearch && pkg.type === 'Door to Door' && !pkg.name.includes('Training');
    }

    const matchesType = selectedType === 'All' || pkg.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Group by Pax
  const groupedPackages = filteredPackages.reduce((acc: any, pkg) => {
    const pax = pkg.pax || 1;
    if (!acc[pax]) acc[pax] = [];
    acc[pax].push(pkg);
    return acc;
  }, {});

  // Sort by lessonCount within each group
  Object.keys(groupedPackages).forEach(pax => {
    groupedPackages[pax].sort((a: any, b: any) => a.lessonCount - b.lessonCount);
  });

  const sortedPaxGroups = Object.keys(groupedPackages).sort((a, b) => Number(a) - Number(b));

  const handleAdd = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pkg: any) => {
    setPackageToDelete(pkg);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;
    setIsDeleting(true);
    const result = await deletePackage(packageToDelete.id);
    if (result.success) {
      setPackages(prev => prev.filter(p => p.id !== packageToDelete.id));
      setDeleteConfirmOpen(false);
    }
    setIsDeleting(false);
  };

  const handleSave = (savedPkg: any) => {
    setPackages(prev => {
      const exists = prev.find(p => p.id === savedPkg.id);
      if (exists) {
        return prev.map(p => p.id === savedPkg.id ? savedPkg : p);
      }
      return [savedPkg, ...prev];
    });
  };

  return (
    <>
      {/* HEADER SECTION (Venue Style) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t('packages.title')}
            </h1>
          </div>
          <p className="text-gray-400 font-medium tracking-wide">
            {t('packages.subtitle')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="btn btn-primary h-12 px-8 flex items-center gap-2 shadow-xl shadow-primary-200 w-full md:w-auto rounded-xl whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {t('packages.addPackage')}
          </button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-2 mb-12 animate-in" style={{ animationDelay: '0.1s' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedType(cat.id)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedType === cat.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                : 'bg-white text-gray-400 border border-gray-100 hover:border-primary-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* LIST BY PAX GROUPS */}
      <div className="space-y-16 animate-in" style={{ animationDelay: '0.2s' }}>
        {sortedPaxGroups.map((pax) => (
          <div key={pax} className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                  {Number(pax) === 1 
                    ? t('packages.studentCount', { count: pax }) 
                    : t('packages.studentsCount', { count: pax })}
                </span>
              </div>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="space-y-3">
              {groupedPackages[pax].map((pkg: any) => {
                const isTraining = pkg.name.includes('Training');
                const unitPrice = pkg.lessonCount > 0 ? (pkg.price / pkg.lessonCount).toFixed(2) : '0.00';
                const perStudentPrice = pkg.pax > 0 ? (Number(unitPrice) / pkg.pax).toFixed(2) : unitPrice;

                return (
                  <div 
                    key={pkg.id}
                    className="group bg-white rounded-3xl p-4 md:p-6 border border-gray-50 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-300 flex flex-col md:flex-row items-center gap-6"
                  >
                    {/* LEFT: INFO */}
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                        <DollarSign className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                            {pkg.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            isTraining ? 'bg-orange-100 text-orange-600' : 'bg-primary-100 text-primary-600'
                          }`}>
                            {pkg.type === 'Private' ? t('packages.catPrivate') : (pkg.type === 'Door to Door' ? t('packages.catD2D') : pkg.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">{pkg.lessonCount} {t('common.sessions')}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">{t('packages.pax', { pax })}</span>
                          </div>
                          {Number(pkg.transportFee) > 0 && (
                            <>
                              <div className="w-1 h-1 rounded-full bg-primary-200" />
                              <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-2.5 py-1 rounded-xl border border-primary-100">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-black uppercase tracking-tight">RM{pkg.transportFee}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* MIDDLE: PRICING */}
                    <div className="flex items-center gap-8 px-8 border-x border-gray-50 h-16 w-full md:w-auto">
                      <div>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-0.5">{t('packages.totalPrice')}</span>
                        <p className="text-2xl font-black text-gray-900 leading-none">
                          <span className="text-xs mr-0.5 font-bold">RM</span>
                          {(parseFloat(pkg.price.toString()) + parseFloat((pkg.transportFee || 0).toString())).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-0.5">{t('packages.perStudentClass')}</span>
                        <p className="text-lg font-black text-primary-600 leading-none">
                          RM {((parseFloat(pkg.price.toString()) + parseFloat((pkg.transportFee || 0).toString())) / (pkg.lessonCount || 1) / (pkg.pax || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(pkg)}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-primary-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(pkg)}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <PackageModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pkg={selectedPackage}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={t('common.delete')}
        message={t('packages.deleteConfirm', { name: packageToDelete?.name })}
        loading={isDeleting}
      />
    </>
  );
}
