import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  QrCode, 
  CheckSquare, 
  Square, 
  Search, 
  Calendar, 
  X, 
  Tag, 
  Sparkles,
  Shirt,
  Info,
  CheckCircle,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { 
  PieceTagData, 
  generatePieceTagsForOrder, 
  printPiece2RTags, 
  generate2RMatrixSVG 
} from '../../utils/pieceTagUtils';

export const GarmentTagPrintModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    selectedOrder, 
    orders, 
    businessSettings, 
    showToast 
  } = useApp();

  const order = selectedOrder || orders[0];

  // Generate expanded piece tags for the active order
  const pieceTags: PieceTagData[] = useMemo(() => {
    if (!order) return [];
    return generatePieceTagsForOrder(order, businessSettings);
  }, [order, businessSettings]);

  // Selected piece tag IDs for printing (default to all selected)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [activePreviewTagId, setActivePreviewTagId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'THERMAL_ROLL' | 'A4_SHEET_GRID'>('THERMAL_ROLL');

  // Initialize selection when order changes
  React.useEffect(() => {
    if (pieceTags.length > 0) {
      setSelectedTagIds(pieceTags.map(t => t.id));
      setActivePreviewTagId(pieceTags[0].id);
    } else {
      setSelectedTagIds([]);
      setActivePreviewTagId('');
    }
  }, [pieceTags]);

  if (!isOpen || !order) return null;

  const toggleSelectTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter(t => t !== id));
    } else {
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTagIds.length === pieceTags.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(pieceTags.map(t => t.id));
    }
  };

  const filteredTags = pieceTags.filter(tag => {
    const q = searchFilter.toLowerCase();
    return (
      tag.clientCode.toLowerCase().includes(q) ||
      tag.garmentName.toLowerCase().includes(q) ||
      tag.clientName.toLowerCase().includes(q) ||
      tag.code.toLowerCase().includes(q) ||
      tag.uniqueSecretCode.toLowerCase().includes(q)
    );
  });

  const currentPreviewTag = pieceTags.find(t => t.id === activePreviewTagId) || pieceTags[0];

  // Handler: Print Selected or All Piece Tags
  const handlePrintTags = (singleTagId?: string) => {
    const targetIds = singleTagId ? [singleTagId] : selectedTagIds;

    if (targetIds.length === 0) {
      showToast('Please select at least 1 piece tag to print.', 'warning');
      return;
    }

    const success = printPiece2RTags(
      order,
      businessSettings,
      targetIds,
      layoutMode
    );

    if (success) {
      showToast(`Dispatched ${targetIds.length} piece tag(s) to system print dialog.`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">2R Code / Piece Tag Printing</h3>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-sky-500/30">
                  Order #{order.orderNumber}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  {pieceTags.length} Total Piece{pieceTags.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Compact Garment Tag Size: <strong className="text-white font-mono">1.5" × 1.12" (38mm × 28mm)</strong> • Individual piece identification & verification
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rule Highlight Notice Bar */}
        <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-950">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Delivery Date Rule:</strong> Tag date shows <strong className="text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold">{currentPreviewTag?.tagDeliveryDate}</strong> (Calculated as 1 day earlier than CRM Due Date: <em>{order.dueDate}</em>).
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span>Customer: <strong className="text-slate-900">{order.customerName}</strong></span>
            <span>•</span>
            <span>Order Code: <strong className="font-mono text-slate-900">{currentPreviewTag?.code}</strong></span>
          </div>
        </div>

        {/* Main Content Area: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Piece Tags List & Selection */}
          <div className="md:col-span-7 border-r border-slate-200 flex flex-col overflow-hidden bg-slate-50">
            {/* List Controls */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter pieces by code, garment, client..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition shrink-0"
              >
                {selectedTagIds.length === pieceTags.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All ({pieceTags.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrollable Piece List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                const isPreviewing = currentPreviewTag?.id === tag.id;

                return (
                  <div
                    key={tag.id}
                    onClick={() => setActivePreviewTagId(tag.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isPreviewing 
                        ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-300' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectTag(tag.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Shirt className="w-3.5 h-3.5 text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {tag.garmentName}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded border border-slate-200">
                            {tag.clientCode}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Piece {tag.pieceIndex}/{tag.totalPieces}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{tag.serviceName} ({tag.pressingMethod || 'Iron'})</span>
                          <span>•</span>
                          <span className="text-sky-800 font-semibold font-mono text-[10px]">
                            Tag Due: {tag.tagDeliveryDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintTags(tag.id);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 text-[10.5px] font-bold rounded border border-slate-200 hover:border-sky-600 transition flex items-center gap-1"
                        title="Print this single piece tag"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTags.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No piece tags matching "{searchFilter}".
                </div>
              )}
            </div>

            {/* List Footer Stats */}
            <div className="p-2.5 bg-white border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Selected: <strong className="text-slate-900">{selectedTagIds.length}</strong> of {pieceTags.length} piece tags</span>
              <span className="text-[11px] text-slate-500 font-mono">Secret Code Hash Active</span>
            </div>
          </div>

          {/* Right Column: High-Fidelity 1.5" x 1.12" Tag Live Preview & Print Settings */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between overflow-y-auto bg-slate-100/60">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-sky-600" />
                  <span>Physical Tag Live Preview</span>
                </span>
                <span className="text-[10.5px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                  1.5" × 1.12"
                </span>
              </div>

              {/* Physical Garment Tag Simulator (Exact Real-World Rendering) */}
              {currentPreviewTag && (
                <div className="flex flex-col items-center">
                  <div className="relative p-1 bg-slate-300/60 rounded-md shadow-inner">
                    {/* The 1.5" x 1.12" Scaled Physical Tag Container */}
                    <div 
                      className="bg-white border-2 border-black rounded-xs shadow-md flex flex-col justify-between select-text"
                      style={{
                        width: '210px',
                        height: '155px',
                        padding: '6px 7px 5px 7px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Header Row: Business Name & Code */}
                      <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1">
                        <div className="font-black text-[12px] uppercase tracking-wide text-black truncate max-w-[125px]">
                          {currentPreviewTag.businessName}
                        </div>
                        <div className="font-mono font-black text-[11.5px] bg-black text-white px-1.5 py-0.2 rounded-xs leading-none">
                          {currentPreviewTag.code}
                        </div>
                      </div>

                      {/* Middle Details + 2R QR Matrix */}
                      <div className="flex items-start justify-between gap-1.5 flex-1">
                        {/* Text Fields */}
                        <div className="flex-1 flex flex-col justify-between h-full text-[10px] leading-tight">
                          <div className="truncate">
                            <span className="font-semibold text-slate-600">Client: </span>
                            <strong className="font-extrabold text-black">{currentPreviewTag.clientName}</strong>
                          </div>

                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="font-semibold text-slate-600">Piece: </span>
                            <span className="font-mono font-black text-[11.5px] text-black bg-slate-100 border border-black px-1.5 py-0.2 rounded-xs">
                              {currentPreviewTag.clientCode}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-500">
                              ({currentPreviewTag.pieceIndex}/{currentPreviewTag.totalPieces})
                            </span>
                          </div>

                          <div className="font-extrabold text-[10px] text-black truncate mt-0.5">
                            {currentPreviewTag.garmentName} • <span className="font-semibold">{currentPreviewTag.serviceCode}</span>
                          </div>

                          {/* Delivery Date Highlight */}
                          <div className="mt-1 pt-0.5 border-t border-dashed border-slate-400 flex items-center justify-between">
                            <span className="font-bold text-[9px] text-slate-700">Delivery Date:</span>
                            <strong className="font-black text-[10.5px] text-black tracking-tight underline">
                              {currentPreviewTag.tagDeliveryDate}
                            </strong>
                          </div>
                        </div>

                        {/* QR Code / 2R Matrix Box */}
                        <div className="w-[58px] flex flex-col items-center justify-center shrink-0">
                          <div 
                            className="p-1 border border-black bg-white flex items-center justify-center"
                            dangerouslySetInnerHTML={{
                              __html: generate2RMatrixSVG(currentPreviewTag.uniqueSecretCode, 50)
                            }}
                          />
                          <div className="font-mono font-black text-[8px] text-black mt-0.5 tracking-wider">
                            {currentPreviewTag.clientCode}
                          </div>
                        </div>
                      </div>

                      {/* Secret Code Tracking Footer */}
                      <div className="border-t border-slate-400 pt-0.5 mt-1 flex items-center justify-between font-mono text-[7.5px] text-slate-600">
                        <span className="truncate max-w-[130px]">{currentPreviewTag.uniqueSecretCode}</span>
                        <span>{currentPreviewTag.pressingMethod || 'Iron'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-500 mt-1.5">
                    Viewing Piece Tag <strong>{currentPreviewTag.pieceIndex} of {currentPreviewTag.totalPieces}</strong> ({currentPreviewTag.clientCode})
                  </span>
                </div>
              )}

              {/* Tag Breakdown Spec Card */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Spec & Data Confirmation</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-500">Business:</span>
                    <div className="font-bold text-slate-800 truncate">{currentPreviewTag?.businessName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Code:</span>
                    <div className="font-mono font-bold text-slate-800">{currentPreviewTag?.code}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Client:</span>
                    <div className="font-bold text-slate-800 truncate">{currentPreviewTag?.clientName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Client/Piece Code:</span>
                    <div className="font-mono font-bold text-sky-700">{currentPreviewTag?.clientCode}</div>
                  </div>
                  <div className="col-span-2 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Tag Delivery Date:</span>
                      <strong className="text-emerald-900 font-bold font-mono">{currentPreviewTag?.tagDeliveryDate}</strong>
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      ✓ Automatically set 1 day earlier than CRM Due Date ({order.dueDate})
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Option Selector */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <label className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Media Layout:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('THERMAL_ROLL')}
                    className={`p-2 rounded border text-left transition ${
                      layoutMode === 'THERMAL_ROLL'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">Thermal Tag Roll</div>
                    <div className="text-[10px] text-slate-500 font-normal">1.5" × 1.12" Continuous</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode('A4_SHEET_GRID')}
                    className={`p-2 rounded border text-left transition ${
                      layoutMode === 'A4_SHEET_GRID'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">Multi-Tag Sheet</div>
                    <div className="text-[10px] text-slate-500 font-normal">A4 Sticker Label Grid</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Print Action Buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handlePrintTags()}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-[0.99]"
              >
                <Printer className="w-4 h-4" />
                <span>
                  Print {selectedTagIds.length} 2R Piece Tag{selectedTagIds.length !== 1 ? 's' : ''}
                </span>
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintTags(currentPreviewTag?.id)}
                  className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-semibold text-xs transition flex items-center justify-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Active Tag ({currentPreviewTag?.clientCode})</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
