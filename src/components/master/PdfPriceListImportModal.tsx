import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  RefreshCw,
  FileCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { GarmentMaster, GarmentCategory } from '../../types';

export interface ExtractedPriceItem {
  id: string;
  service: string;
  category: GarmentCategory;
  garmentItem: string;
  itemCode: string;
  price: number;
  selected: boolean;
  isExisting: boolean;
  existingPrice?: number;
}

interface PdfPriceListImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGarments: GarmentMaster[];
  onImportComplete: (importedGarments: GarmentMaster[], updatedCount: number, newCount: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const KNOWN_SERVICES = [
  'Dry Clean',
  'Steam Iron',
  'Laundry',
  'Starching',
  'Starching DC',
  'Shoe Cleaning',
  'Alteration',
  'Leather Care',
  'Mending',
  'Hanger Add-on'
];

const CATEGORY_LIST: GarmentCategory[] = [
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

export const PdfPriceListImportModal: React.FC<PdfPriceListImportModalProps> = ({
  isOpen,
  onClose,
  existingGarments,
  onImportComplete,
  showToast
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Preview State
  const [previewItems, setPreviewItems] = useState<ExtractedPriceItem[]>([]);
  const [isExtracted, setIsExtracted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');
  const [updateExistingPrices, setUpdateExistingPrices] = useState(true);
  const [extractionMethod, setExtractionMethod] = useState<'gemini' | 'heuristic' | 'sample'>('heuristic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setFileName('');
    setFileSize('');
    setIsProcessing(false);
    setProcessingStatus('');
    setPreviewItems([]);
    setIsExtracted(false);
    setSearchQuery('');
    setSelectedCategoryFilter('ALL');
    setSelectedServiceFilter('ALL');
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        processPdfFile(droppedFile);
      } else {
        showToast('Please upload a valid PDF document (.pdf)', 'warning');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        processPdfFile(selectedFile);
      } else {
        showToast('Please select a valid PDF file.', 'warning');
      }
    }
  };

  // Process the uploaded PDF file
  const processPdfFile = async (pdfFile: File) => {
    setFile(pdfFile);
    setFileName(pdfFile.name);
    setFileSize(formatFileSize(pdfFile.size));
    setIsProcessing(true);
    setProcessingStatus('Reading PDF file structure & data...');

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const cleanBase64 = res.replace(/^data:application\/pdf;base64,/, '').trim();
          resolve(cleanBase64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(pdfFile);
      });

      setProcessingStatus('Analyzing price list with AI & extracting Service, Category, Garment, Code, and Price...');

      // Call server extraction API
      const response = await fetch('/api/extract-price-list-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64Data,
          fileName: pdfFile.name
        })
      });

      const result = await response.json();

      if (result && result.success && Array.isArray(result.items) && result.items.length > 0) {
        populatePreviewItems(result.items, result.method || 'heuristic');
      } else {
        // Fallback: If server returned no items, try sample extraction or notify user
        showToast(result?.error || 'No price items could be detected in this PDF. Please verify the document layout.', 'error');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Error extracting PDF:', err);
      showToast(err?.message || 'Failed to extract price list from PDF.', 'error');
      setIsProcessing(false);
    }
  };

  // Quick load sample PDF
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setFileName('Trendera-Master-Price-Catalog-2026.pdf');
    setFileSize('3.5 KB');
    setProcessingStatus('Loading Trendera Master Price List sample PDF...');

    try {
      const resp = await fetch('/sample-price-list.pdf');
      if (!resp.ok) {
        throw new Error('Could not load sample PDF.');
      }
      const blob = await resp.blob();
      const sampleFile = new File([blob], 'Trendera-Master-Price-Catalog-2026.pdf', { type: 'application/pdf' });
      await processPdfFile(sampleFile);
    } catch (err: any) {
      console.error('Failed to load sample PDF:', err);
      showToast('Could not load sample PDF file.', 'error');
      setIsProcessing(false);
    }
  };

  // Convert raw extracted items to preview items mapped against existing catalog
  const populatePreviewItems = (rawItems: any[], method: 'gemini' | 'heuristic' | 'sample') => {
    setExtractionMethod(method);

    const mapped: ExtractedPriceItem[] = rawItems.map((item, idx) => {
      const serviceName = item.service || 'Dry Clean';
      const categoryName = (item.category || 'MEN').toUpperCase() as GarmentCategory;
      const itemName = (item.garmentItem || item.name || '').trim();
      const itemCode = (item.itemCode || item.code || '').trim().toUpperCase();
      const price = Number(item.price) || 0;

      // Check if already in existing catalog
      const existingMatch = existingGarments.find(g => {
        const sameService = (g.service || 'Dry Clean').toLowerCase() === serviceName.toLowerCase();
        const sameCategory = g.category.toLowerCase() === categoryName.toLowerCase();
        const sameName = g.name.toLowerCase().trim() === itemName.toLowerCase().trim();
        const sameCode = itemCode && ((g.itemCode || g.code || '').toLowerCase().trim() === itemCode.toLowerCase().trim());

        return (sameService && sameCategory && sameName) || (sameService && sameCode);
      });

      return {
        id: `extracted-${Date.now()}-${idx}`,
        service: serviceName,
        category: CATEGORY_LIST.includes(categoryName) ? categoryName : 'MEN',
        garmentItem: itemName || `Garment Item ${idx + 1}`,
        itemCode: itemCode || `ITM-${idx + 1}`,
        price: price,
        selected: true,
        isExisting: !!existingMatch,
        existingPrice: existingMatch ? (existingMatch.price ?? existingMatch.defaultPrice) : undefined
      };
    });

    setPreviewItems(mapped);
    setIsExtracted(true);
    setIsProcessing(false);
    showToast(`Successfully extracted ${mapped.length} price list items! Review preview below before importing.`, 'success');
  };

  // Toggle selection of single item
  const handleToggleSelectItem = (id: string) => {
    setPreviewItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  // Select all or deselect all
  const handleSelectAll = (select: boolean) => {
    setPreviewItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  // Update item field in preview
  const handleUpdateItemField = (id: string, field: keyof ExtractedPriceItem, value: any) => {
    setPreviewItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Remove item from preview
  const handleRemoveItem = (id: string) => {
    setPreviewItems(prev => prev.filter(item => item.id !== id));
  };

  // Add manual row to preview
  const handleAddPreviewRow = () => {
    const newItem: ExtractedPriceItem = {
      id: `extracted-manual-${Date.now()}`,
      service: 'Dry Clean',
      category: 'MEN',
      garmentItem: 'New Garment Item',
      itemCode: 'NEW',
      price: 150,
      selected: true,
      isExisting: false
    };
    setPreviewItems(prev => [newItem, ...prev]);
  };

  // Filter preview items
  const filteredPreview = previewItems.filter(item => {
    if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (selectedServiceFilter !== 'ALL' && item.service !== selectedServiceFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.garmentItem.toLowerCase().includes(q);
      const matchCode = item.itemCode.toLowerCase().includes(q);
      const matchService = item.service.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchName || matchCode || matchService || matchCat;
    }
    return true;
  });

  const selectedCount = previewItems.filter(i => i.selected).length;
  const newItemsCount = previewItems.filter(i => !i.isExisting).length;
  const existingItemsCount = previewItems.filter(i => i.isExisting).length;

  // Final Import Confirmation
  const handleFinalImport = () => {
    const itemsToImport = previewItems.filter(i => i.selected);
    if (itemsToImport.length === 0) {
      showToast('Please select at least one item to import.', 'warning');
      return;
    }

    let updatedCount = 0;
    let newCount = 0;
    const updatedGarmentsList = [...existingGarments];

    itemsToImport.forEach((extracted, idx) => {
      // Check if item already exists
      const existingIdx = updatedGarmentsList.findIndex(g => {
        const sameService = (g.service || 'Dry Clean').toLowerCase() === extracted.service.toLowerCase();
        const sameCategory = g.category.toLowerCase() === extracted.category.toLowerCase();
        const sameName = g.name.toLowerCase().trim() === extracted.garmentItem.toLowerCase().trim();
        const sameCode = extracted.itemCode && ((g.itemCode || g.code || '').toLowerCase().trim() === extracted.itemCode.toLowerCase().trim());
        return (sameService && sameCategory && sameName) || (sameService && sameCode);
      });

      if (existingIdx >= 0) {
        if (updateExistingPrices) {
          updatedGarmentsList[existingIdx] = {
            ...updatedGarmentsList[existingIdx],
            service: extracted.service,
            category: extracted.category,
            name: extracted.garmentItem,
            itemCode: extracted.itemCode,
            code: extracted.itemCode,
            price: extracted.price,
            defaultPrice: extracted.price
          };
          updatedCount++;
        }
      } else {
        // Add new garment master record
        const newGarment: GarmentMaster = {
          id: `g-pdf-${Date.now()}-${idx}`,
          service: extracted.service,
          serviceCode: extracted.service.substring(0, 2).toUpperCase(),
          category: extracted.category,
          name: extracted.garmentItem,
          itemCode: extracted.itemCode,
          code: extracted.itemCode,
          price: extracted.price,
          defaultPrice: extracted.price,
          icon: 'Shirt'
        };
        updatedGarmentsList.unshift(newGarment);
        newCount++;
      }
    });

    onImportComplete(updatedGarmentsList, updatedCount, newCount);
    handleModalClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">Import from PDF Price List</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Auto Extraction
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload your garment price list PDF to automatically extract Service, Category, Garment Item, Item Code, and Price.
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 flex flex-col gap-4">
          
          {/* STEP 1: Upload Dropzone (When not extracted or when re-uploading) */}
          {!isExtracted && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer select-none ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-slate-50/80'
                } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    Click to browse or Drag & Drop your Garment Price List PDF here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts standard PDF price charts, rate matrices, and store price lists (.pdf)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                    Service
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                    Category
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                    Garment Item
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                    Item Code
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                    Price (INR)
                  </span>
                </div>
              </div>

              {/* Quick Sample File Loader */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-sky-100 text-sky-700 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">No PDF file on hand?</span>
                    <span className="text-[11px] text-slate-500">
                      Test auto-extraction with Trendera Dry Cleaners' official Master Price List PDF sample.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-md border border-sky-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Price List PDF</span>
                </button>
              </div>

              {/* Processing Spinner / Status */}
              {isProcessing && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Analyzing & Extracting Garment Catalog</h4>
                    <p className="text-xs text-emerald-800 mt-1">{processingStatus}</p>
                  </div>
                  {fileName && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded border border-emerald-300">
                      File: {fileName} ({fileSize})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Extraction Preview & Verification Table */}
          {isExtracted && (
            <div className="flex flex-col gap-3">
              {/* Top Banner Stats */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Extracted {previewItems.length} items from <span className="font-mono text-emerald-700">{fileName}</span>
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                        {extractionMethod === 'gemini' ? 'Gemini 3.8 Flash' : 'Native Table Parser'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span><b className="text-emerald-700">{newItemsCount}</b> new to catalog</span>
                      <span>•</span>
                      <span><b className="text-amber-700">{existingItemsCount}</b> already exist</span>
                      <span>•</span>
                      <span><b className="text-slate-800">{selectedCount}</b> selected for import</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExtracted(false);
                      setFile(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Upload Different PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddPreviewRow}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded border border-sky-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search extracted items..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORY_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Service Filter */}
                  <select
                    value={selectedServiceFilter}
                    onChange={e => setSelectedServiceFilter(e.target.value)}
                    className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Services</option>
                    {KNOWN_SERVICES.map(srv => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
                    >
                      Deselect All
                    </button>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={updateExistingPrices}
                      onChange={e => setUpdateExistingPrices(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Update existing prices</span>
                  </label>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 select-none">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={previewItems.length > 0 && previewItems.every(i => i.selected)}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3 w-32">SERVICE</th>
                        <th className="py-2.5 px-3 w-28">CATEGORY</th>
                        <th className="py-2.5 px-3">GARMENT ITEM</th>
                        <th className="py-2.5 px-3 w-28">ITEM CODE</th>
                        <th className="py-2.5 px-3 w-32">PRICE (₹)</th>
                        <th className="py-2.5 px-3 w-24 text-center">STATUS</th>
                        <th className="py-2.5 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredPreview.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                            No extracted items match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredPreview.map((item) => (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-slate-50/80 transition ${
                              !item.selected ? 'opacity-40 bg-slate-50/40' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleToggleSelectItem(item.id)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>

                            {/* Service dropdown/edit */}
                            <td className="py-2 px-3">
                              <select
                                value={item.service}
                                onChange={e => handleUpdateItemField(item.id, 'service', e.target.value)}
                                className="w-full py-1 px-1.5 bg-sky-50 text-sky-800 font-semibold border border-sky-200 rounded text-[11px] focus:ring-1 focus:ring-sky-500"
                              >
                                {KNOWN_SERVICES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>

                            {/* Category dropdown/edit */}
                            <td className="py-2 px-3">
                              <select
                                value={item.category}
                                onChange={e => handleUpdateItemField(item.id, 'category', e.target.value as GarmentCategory)}
                                className="w-full py-1 px-1.5 bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-slate-400"
                              >
                                {CATEGORY_LIST.map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </td>

                            {/* Garment Item Name */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.garmentItem}
                                onChange={e => handleUpdateItemField(item.id, 'garmentItem', e.target.value)}
                                className="w-full py-1 px-2 font-bold text-slate-900 bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded text-xs transition"
                              />
                            </td>

                            {/* Item Code */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.itemCode}
                                onChange={e => handleUpdateItemField(item.id, 'itemCode', e.target.value.toUpperCase())}
                                className="w-full py-1 px-2 font-mono text-slate-700 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded text-[11px] uppercase transition"
                              />
                            </td>

                            {/* Price */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <span className="absolute left-2 top-1 text-slate-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={item.price}
                                  onChange={e => handleUpdateItemField(item.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-5 pr-2 py-1 font-bold text-slate-900 bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white border border-emerald-200 focus:border-emerald-500 rounded text-xs"
                                />
                              </div>
                            </td>

                            {/* Status badge */}
                            <td className="py-2 px-3 text-center">
                              {item.isExisting ? (
                                <span 
                                  title={item.existingPrice !== undefined ? `Current Catalog Price: ₹${item.existingPrice}` : undefined}
                                  className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block"
                                >
                                  EXISTS {item.existingPrice !== undefined && item.existingPrice !== item.price ? `(₹${item.existingPrice})` : ''}
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block">
                                  NEW
                                </span>
                              )}
                            </td>

                            {/* Remove action */}
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                                title="Remove from import"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    Showing {filteredPreview.length} of {previewItems.length} extracted items
                  </span>
                  <span>
                    Click any cell to edit details before confirming import.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          {isExtracted && (
            <button
              type="button"
              onClick={handleFinalImport}
              disabled={selectedCount === 0}
              className={`px-5 py-2 font-bold text-xs rounded text-white flex items-center gap-1.5 shadow-xs transition ${
                selectedCount === 0
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {selectedCount} Selected Garments</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
