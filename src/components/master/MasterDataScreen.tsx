import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Tag, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Save, 
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import { garmentCatalog, serviceDefinitions } from '../../data/initialData';
import { GarmentMaster, ServiceDefinition, GarmentCategory } from '../../types';
import { PdfPriceListImportModal } from './PdfPriceListImportModal';

const MASTER_GARMENTS_STORAGE_KEY = 'cleanera_master_garments';

const CATEGORY_OPTIONS: GarmentCategory[] = [
  'MEN',
  'WOMEN',
  'KIDS',
  'HOUSEHOLD',
  'OTHERS',
  'SHOES',
  'INSTITUTIONAL',
  'COMMON',
  'ECO_WASH',
  'SPECIAL'
];

const MASTER_SERVICE_OPTIONS = [
  'Dry Clean',
  'Steam Iron',
  'Starching',
  'Starching DC',
  'Shoe Cleaning',
  'Laundry',
  'Alteration',
  'Leather Care',
  'Mending',
  'Hanger Add-on'
];

export const MasterDataScreen: React.FC = () => {
  const { currentRole, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'GARMENTS' | 'SERVICES' | 'SUB_SERVICES' | 'DEFECTS'>('GARMENTS');

  // Top-up services / sub-services rates
  const [topUpRates, setTopUpRates] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('trendera_topup_rates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ST: 50,
      SP: 50,
      ALT: 40
    };
  });

  const handleSaveSubServiceRates = () => {
    if (currentRole !== 'ADMIN') {
      showToast('ANTI-FRAUD: Manager role is restricted from altering master catalog rates.', 'error');
      return;
    }
    try {
      localStorage.setItem('trendera_topup_rates', JSON.stringify(topUpRates));
      window.dispatchEvent(new Event('trendera_topup_rates_updated'));
      showToast('Sub-services & top-up rates updated successfully!', 'success');
    } catch (e) {
      showToast('Failed to save top-up rates', 'error');
    }
  };
  
  // Safely load initial garments with localStorage persistence
  const [garments, setGarments] = useState<GarmentMaster[]>(() => {
    try {
      const saved = localStorage.getItem(MASTER_GARMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved items with all imported PDF price list items without duplicates
          const savedIds = new Set(parsed.map((p: GarmentMaster) => p.id));
          const savedKeys = new Set(
            parsed.map((p: GarmentMaster) => `${(p.service || '').toLowerCase()}::${p.category.toLowerCase()}::${p.name.toLowerCase()}::${(p.itemCode || p.code || '').toLowerCase()}`)
          );
          const missingCatalogItems = garmentCatalog.filter(c => {
            const key = `${(c.service || '').toLowerCase()}::${c.category.toLowerCase()}::${c.name.toLowerCase()}::${(c.itemCode || c.code || '').toLowerCase()}`;
            return !savedIds.has(c.id) && !savedKeys.has(key);
          });
          return [...parsed, ...missingCatalogItems];
        }
      }
    } catch (e) {
      console.error('Failed to load saved master garments:', e);
    }
    return garmentCatalog;
  });

  const [services, setServices] = useState<ServiceDefinition[]>(serviceDefinitions);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Persist garments to localStorage whenever updated
  const saveGarmentsToStorage = (updated: GarmentMaster[]) => {
    setGarments(updated);
    try {
      localStorage.setItem(MASTER_GARMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist garments to localStorage:', e);
    }
  };

  // Add Garment Modal (5 Fields)
  const [isAddGarmentOpen, setIsAddGarmentOpen] = useState(false);
  const [newGarmentService, setNewGarmentService] = useState('Dry Cleaning');
  const [newGarmentCategory, setNewGarmentCategory] = useState<GarmentCategory>('MEN');
  const [newGarmentName, setNewGarmentName] = useState('');
  const [newGarmentItemCode, setNewGarmentItemCode] = useState('');
  const [newGarmentPrice, setNewGarmentPrice] = useState('120');

  // Edit Garment Modal (5 Fields)
  const [editingGarment, setEditingGarment] = useState<GarmentMaster | null>(null);
  const [editService, setEditService] = useState('Dry Cleaning');
  const [editCategory, setEditCategory] = useState<GarmentCategory>('MEN');
  const [editName, setEditName] = useState('');
  const [editItemCode, setEditItemCode] = useState('');
  const [editPrice, setEditPrice] = useState('120');

  // PDF Import Modal State
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false);

  const handleImportFromPdfComplete = (
    updatedGarmentsList: GarmentMaster[],
    updatedCount: number,
    newCount: number
  ) => {
    saveGarmentsToStorage(updatedGarmentsList);
    setActiveTab('GARMENTS');
    showToast(
      `Catalog updated from PDF: ${newCount} new items added, ${updatedCount} existing item prices updated.`,
      'success'
    );
  };

  const filteredGarments = garments.filter(g => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const serviceName = (g.service || 'Dry Cleaning').toLowerCase();
    const itemCode = (g.itemCode || g.code || '').toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      serviceName.includes(q) ||
      itemCode.includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredGarments.length / pageSize));
  const paginatedGarments = filteredGarments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveGarment = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'MANAGER') {
      showToast('ANTI-FRAUD: Manager role is restricted from altering master catalog.', 'error');
      return;
    }

    if (!newGarmentName.trim()) {
      showToast('Please enter garment name.', 'warning');
      return;
    }

    // Do NOT create duplicate garments if the same item already exists
    const isDuplicate = garments.some(g => 
      (g.service || 'Dry Clean').toLowerCase() === newGarmentService.toLowerCase() &&
      g.category.toLowerCase() === newGarmentCategory.toLowerCase() &&
      g.name.toLowerCase() === newGarmentName.trim().toLowerCase() &&
      ((g.itemCode || g.code || '').toLowerCase() === newGarmentItemCode.trim().toLowerCase())
    );

    if (isDuplicate) {
      showToast(`Garment "${newGarmentName.trim()}" already exists under ${newGarmentService} (${newGarmentCategory}).`, 'warning');
      return;
    }

    const priceVal = parseFloat(newGarmentPrice) || 0;
    const srvDef = services.find(s => s.name === newGarmentService);

    const newG: GarmentMaster = {
      id: `g-${Date.now()}`,
      service: newGarmentService,
      serviceCode: srvDef?.code || 'DC',
      category: newGarmentCategory,
      name: newGarmentName.trim(),
      itemCode: newGarmentItemCode.trim().toUpperCase() || undefined,
      code: newGarmentItemCode.trim().toUpperCase() || undefined,
      price: priceVal,
      defaultPrice: priceVal,
      icon: 'Shirt'
    };

    const updated = [newG, ...garments];
    saveGarmentsToStorage(updated);
    setIsAddGarmentOpen(false);
    setNewGarmentName('');
    setNewGarmentItemCode('');
    setNewGarmentPrice('120');
    showToast(`Added ${newG.name} (${newG.service} - ₹${newG.defaultPrice}) to Master Catalog.`, 'success');
  };

  const handleOpenEditModal = (g: GarmentMaster) => {
    if (currentRole === 'MANAGER') {
      showToast('ANTI-FRAUD: Manager cannot modify master data. Contact Admin.', 'error');
      return;
    }
    setEditingGarment(g);
    setEditService(g.service || 'Dry Cleaning');
    setEditCategory(g.category);
    setEditName(g.name);
    setEditItemCode(g.itemCode || g.code || '');
    setEditPrice((g.price ?? g.defaultPrice).toString());
  };

  const handleSaveEditedGarment = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'MANAGER') {
      showToast('ANTI-FRAUD: Manager cannot modify master prices. Contact Admin.', 'error');
      return;
    }
    if (!editingGarment) return;

    if (!editName.trim()) {
      showToast('Please enter garment name.', 'warning');
      return;
    }

    // Check for duplicate with other garments
    const isDuplicate = garments.some(g => 
      g.id !== editingGarment.id &&
      (g.service || 'Dry Clean').toLowerCase() === editService.toLowerCase() &&
      g.category.toLowerCase() === editCategory.toLowerCase() &&
      g.name.toLowerCase() === editName.trim().toLowerCase() &&
      ((g.itemCode || g.code || '').toLowerCase() === editItemCode.trim().toLowerCase())
    );

    if (isDuplicate) {
      showToast(`Another garment with these exact details already exists.`, 'warning');
      return;
    }

    const priceVal = parseFloat(editPrice) || 0;
    const srvDef = services.find(s => s.name === editService);

    const updated = garments.map(g => {
      if (g.id === editingGarment.id) {
        return {
          ...g,
          service: editService,
          serviceCode: srvDef?.code || g.serviceCode || 'DC',
          category: editCategory,
          name: editName.trim(),
          itemCode: editItemCode.trim().toUpperCase() || undefined,
          code: editItemCode.trim().toUpperCase() || g.code,
          price: priceVal,
          defaultPrice: priceVal
        };
      }
      return g;
    });

    saveGarmentsToStorage(updated);
    setEditingGarment(null);
    showToast(`Updated ${editName.trim()} in Master Data.`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Master Data & Price Catalog</span>
              {currentRole === 'ADMIN' ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin Unlocked
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Manager Read-Only
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Configure garments, standard price matrices, service multipliers, and defect tags.
            </p>
          </div>
        </div>

        {currentRole === 'ADMIN' && (
          <div className="flex items-center gap-2.5">
            <button
              id="btn-import-from-pdf"
              onClick={() => setIsPdfImportOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Import from PDF</span>
            </button>

            <button
              id="btn-add-master-garment"
              onClick={() => setIsAddGarmentOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Garment</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <button
              onClick={() => setActiveTab('GARMENTS')}
              className={`px-3.5 py-1.5 rounded-md transition ${
                activeTab === 'GARMENTS'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Garments & Base Rates ({garments.length})
            </button>

            <button
              onClick={() => setActiveTab('SERVICES')}
              className={`px-3.5 py-1.5 rounded-md transition ${
                activeTab === 'SERVICES'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Services & Multipliers ({services.length})
            </button>

            <button
              onClick={() => setActiveTab('SUB_SERVICES')}
              className={`px-3.5 py-1.5 rounded-md transition ${
                activeTab === 'SUB_SERVICES'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Add-ons & Finishing
            </button>

            <button
              onClick={() => setActiveTab('DEFECTS')}
              className={`px-3.5 py-1.5 rounded-md transition ${
                activeTab === 'DEFECTS'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Defect Remarks Dictionary
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search catalog items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {activeTab === 'GARMENTS' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 uppercase text-[11px] z-10">
                    <tr>
                      <th className="p-3">Service</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Garment Item</th>
                      <th className="p-3">Item Code</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-center w-24">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedGarments.map(g => {
                      const serviceName = g.service || 'Dry Clean';
                      const itemCode = g.itemCode || g.code || '-';
                      const displayPrice = g.price ?? g.defaultPrice;

                      return (
                        <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                          {/* 1. Service */}
                          <td className="p-3 font-semibold text-slate-800">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              {serviceName}
                            </span>
                          </td>

                          {/* 2. Category */}
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {g.category}
                            </span>
                          </td>

                          {/* 3. Garment Item */}
                          <td className="p-3 font-bold text-slate-900">{g.name}</td>

                          {/* 4. Item Code */}
                          <td className="p-3 font-mono font-bold text-xs text-slate-600">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {itemCode}
                            </span>
                          </td>

                          {/* 5. Price */}
                          <td className="p-3 font-mono font-bold text-slate-900 text-sm">
                            ₹{displayPrice.toFixed(2)}
                          </td>

                          {/* 6. Edit */}
                          <td className="p-3 text-center">
                            {currentRole === 'ADMIN' ? (
                              <button
                                onClick={() => handleOpenEditModal(g)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded border border-slate-200 hover:border-sky-300 font-semibold text-xs transition active:scale-95 cursor-pointer"
                                title="Edit Garment"
                              >
                                <Edit2 className="w-3 h-3 text-sky-600" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredGarments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No master garments found matching "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredGarments.length > 0 && (
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="font-medium">
                    Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredGarments.length)}</span> of <span className="font-bold text-slate-900">{filteredGarments.length}</span> garments
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Prev
                      </button>
                      <span className="px-1.5 font-semibold text-slate-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SERVICES' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              {services.map(srv => (
                <div key={srv.code} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{srv.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${srv.iconBgColor}`}>
                      Code: {srv.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{srv.description}</div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Base Price Multiplier:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{srv.baseMultiplier}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SUB_SERVICES' && (
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Default Sub-Services & Top-Up Rates</div>
                  <div className="text-[11px] text-slate-500">Edit base rates applied when adding top-up services in POS intake.</div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSubServiceRates}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Top-Up Rates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-purple-200 bg-purple-50/50 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-purple-900 text-sm">Starch & Crisp Finishing (ST)</div>
                    <div className="text-[11px] text-slate-600 mt-1">Standard premium starching for cotton shirts and kurtas.</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-purple-200/60 flex items-center justify-between">
                    <span className="font-semibold text-purple-900">Rate / pc:</span>
                    <div className="flex items-center gap-1 bg-white border border-purple-300 rounded px-2 py-1">
                      <span className="font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={topUpRates.ST ?? 50}
                        onChange={(e) => setTopUpRates({ ...topUpRates, ST: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-16 text-right font-mono font-bold text-purple-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-orange-200 bg-orange-50/50 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-orange-900 text-sm">Steam Press & Ironing (SP)</div>
                    <div className="text-[11px] text-slate-600 mt-1">High-pressure vacuum steam finish.</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-orange-200/60 flex items-center justify-between">
                    <span className="font-semibold text-orange-900">Rate / pc:</span>
                    <div className="flex items-center gap-1 bg-white border border-orange-300 rounded px-2 py-1">
                      <span className="font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={topUpRates.SP ?? 50}
                        onChange={(e) => setTopUpRates({ ...topUpRates, SP: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-16 text-right font-mono font-bold text-orange-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-rose-200 bg-rose-50/50 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-rose-900 text-sm">Alteration & Minor Stitching (ALT)</div>
                    <div className="text-[11px] text-slate-600 mt-1">Hem repair, button stitching, seam adjustment.</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-rose-200/60 flex items-center justify-between">
                    <span className="font-semibold text-rose-900">Rate / pc:</span>
                    <div className="flex items-center gap-1 bg-white border border-rose-300 rounded px-2 py-1">
                      <span className="font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={topUpRates.ALT ?? 40}
                        onChange={(e) => setTopUpRates({ ...topUpRates, ALT: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-16 text-right font-mono font-bold text-rose-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DEFECTS' && (
            <div className="p-4 overflow-y-auto text-xs">
              <h3 className="font-bold text-slate-800 mb-2">Standard Intake Remark Dictionary</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'On Hanger',
                  'Folded Packaging',
                  'Stain on Collar',
                  'Stain on Lapel',
                  'Ink Stain',
                  'Oil / Grease Stain',
                  'Color Bleed Risk',
                  'Torn Hem / Seam',
                  'Missing Button',
                  'Heavy Embroidery',
                  'Delicate Silk',
                  'Customer Risk Accepted'
                ].map((defect, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{defect}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Garment Modal (5 Fields) */}
      {isAddGarmentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Add New Garment to Master Catalog</h3>
                <p className="text-[11px] text-slate-400">Configure item according to price-list structure</p>
              </div>
              <button onClick={() => setIsAddGarmentOpen(false)} className="text-slate-400 hover:text-white p-1 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGarment} className="p-6 space-y-3.5 text-xs">
              {/* Field 1: Service */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Service</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newGarmentService}
                  onChange={(e) => setNewGarmentService(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {MASTER_SERVICE_OPTIONS.map(srv => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Category</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newGarmentCategory}
                  onChange={(e) => setNewGarmentCategory(e.target.value as GarmentCategory)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Garment Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Garment Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Kurta, Blazer 2 Pcs, Bed Sheet"
                  value={newGarmentName}
                  onChange={(e) => setNewGarmentName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none text-slate-800 font-medium focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Field 4: Item Code */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Item Code</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional identifier</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SK-01, KT, BLZ"
                  value={newGarmentItemCode}
                  onChange={(e) => setNewGarmentItemCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none font-mono text-slate-800 uppercase focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Field 5: Price */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Price</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="e.g. 150"
                  value={newGarmentPrice}
                  onChange={(e) => setNewGarmentPrice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-sm text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddGarmentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow-xs transition"
                >
                  Save to Master Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Garment Modal (5 Fields) */}
      {editingGarment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Edit Master Garment</h3>
                <p className="text-[11px] text-slate-400">Update item details and rate</p>
              </div>
              <button onClick={() => setEditingGarment(null)} className="text-slate-400 hover:text-white p-1 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedGarment} className="p-6 space-y-3.5 text-xs">
              {/* Field 1: Service */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Service</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {MASTER_SERVICE_OPTIONS.map(srv => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Category</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as GarmentCategory)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Garment Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Garment Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none text-slate-800 font-medium focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Field 4: Item Code */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Item Code</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional identifier</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SK-01, KT, BLZ"
                  value={editItemCode}
                  onChange={(e) => setEditItemCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none font-mono text-slate-800 uppercase focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Field 5: Price */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>Price</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-sm text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingGarment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Price-List Auto-Import Modal */}
      <PdfPriceListImportModal
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        existingGarments={garments}
        onImportComplete={handleImportFromPdfComplete}
        showToast={showToast}
      />
    </div>
  );
};
