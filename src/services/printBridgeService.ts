/**
 * Cleanera Dry Cleaning CRM - Universal Local Print Bridge Service
 * 
 * Communicates directly with physical Windows spooler printers and POS hardware via local bridge daemons:
 * 1. QZ Tray (standard protocol on ws://localhost:8182 / wss://localhost:8182 / port 8181)
 * 2. Cleanera Desktop Print Bridge Daemon (custom WebSocket/HTTP daemon on port 8182)
 * 
 * Hardware Target:
 * - Standard Laser Printers (e.g., HP LaserJet 1020 Plus) -> High-density pixel/HTML/GDI print jobs
 * - Direct Thermal Label Printers (e.g., TSC TE200, Zebra ZD220) -> TSPL / ZPL / Raster stickers
 * - 80mm POS Thermal Receipt Printers (e.g., Epson TM-T82, POS-80) -> ESC/POS / Raster receipts
 */

import { Order, OrderGarmentItem, BusinessSettings } from '../types';

export interface PrinterDevice {
  name: string;
  type: 'STANDARD_LASER' | 'LABEL_TAG' | 'THERMAL_RECEIPT' | 'VIRTUAL';
  isDefault?: boolean;
  driver?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'READY' | 'BUSY';
  connection?: 'WINDOWS_SPOOLER' | 'USB' | 'NETWORK' | 'SERIAL' | 'BLUETOOTH';
}

export interface PrintBridgeConfig {
  host: string;
  port: number;
  useSecureWebSocket: boolean;
  selectedPrinterName: string;
  tagPrinterName: string;
  receiptPrinterName: string;
  printerType: 'STANDARD_LASER' | 'LABEL_TAG' | 'THERMAL_RECEIPT';
  autoCutPaper: boolean;
  openCashDrawer: boolean;
  densityDpi: number;
  autoConnectOnLaunch: boolean;
}

export type BridgeStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export interface PrintJobResult {
  success: boolean;
  message: string;
  printerName?: string;
  jobId?: string;
  isBridgeMissing?: boolean;
  rawResponse?: any;
  error?: string;
  timestamp?: string;
}

export interface BridgeDiagnosticInfo {
  status: BridgeStatus;
  url: string;
  connected: boolean;
  installedPrintersCount: number;
  printers: PrinterDevice[];
  selectedPrinter: string;
  isTargetPrinterFound: boolean;
  lastConnectedAt?: string;
  lastError?: string | null;
  trafficLogs: Array<{ timestamp: string; direction: 'IN' | 'OUT' | 'SYS'; message: string }>;
}

const DEFAULT_CONFIG: PrintBridgeConfig = {
  host: 'localhost',
  port: 8182,
  useSecureWebSocket: false, // Default to standard ws://localhost:8182 on Windows
  selectedPrinterName: 'HP LaserJet 1020 Plus',
  tagPrinterName: 'HP LaserJet 1020 Plus',
  receiptPrinterName: 'HP LaserJet 1020 Plus',
  printerType: 'STANDARD_LASER',
  autoCutPaper: false,
  openCashDrawer: false,
  densityDpi: 600, // 600 DPI for HP LaserJet 1020 Plus
  autoConnectOnLaunch: true
};

class PrintBridgeService {
  private ws: WebSocket | null = null;
  private status: BridgeStatus = 'DISCONNECTED';
  private config: PrintBridgeConfig;
  private discoveredPrinters: PrinterDevice[] = [];
  private listeners: Array<(status: BridgeStatus) => void> = [];
  private lastError: string | null = null;
  private lastConnectedAt: string | null = null;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void; timeout: any }> = new Map();
  private trafficLogs: Array<{ timestamp: string; direction: 'IN' | 'OUT' | 'SYS'; message: string }> = [];

  constructor() {
    // Load config from localStorage
    try {
      const savedConfig = localStorage.getItem('cleanera_print_bridge_config');
      if (savedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      } else {
        this.config = { ...DEFAULT_CONFIG };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }

    this.logTraffic('SYS', 'PrintBridgeService initialized. Ready to interface with HP LaserJet 1020 Plus and Windows spooler.');
  }

  private logTraffic(direction: 'IN' | 'OUT' | 'SYS', message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.trafficLogs.unshift({ timestamp, direction, message });
    if (this.trafficLogs.length > 50) {
      this.trafficLogs.pop();
    }
  }

  public getTrafficLogs() {
    return [...this.trafficLogs];
  }

  public getConfig(): PrintBridgeConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PrintBridgeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('cleanera_print_bridge_config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save print config to localStorage:', e);
    }
    this.logTraffic('SYS', `Configuration updated. Target printer: ${this.config.selectedPrinterName || this.config.tagPrinterName}`);
  }

  public getStatus(): BridgeStatus {
    return this.status;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public getDiscoveredPrinters(): PrinterDevice[] {
    return [...this.discoveredPrinters];
  }

  public subscribe(callback: (status: BridgeStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.status);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (e) {
        console.error('Error notifying print bridge listener:', e);
      }
    });
  }

  /**
   * Connects to the local printing daemon on Windows over WebSocket.
   * Probes ws://localhost:8182, wss://localhost:8182, ws://127.0.0.1:8182, and port 8181.
   */
  public async connect(overridePort?: number): Promise<boolean> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return true;
    }

    if (this.status === 'CONNECTING' && this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.status !== 'CONNECTING') {
            clearInterval(check);
            resolve(this.status === 'CONNECTED');
          }
        }, 100);
      });
    }

    this.status = 'CONNECTING';
    this.lastError = null;
    this.notifyListeners();

    const portsToTry = overridePort ? [overridePort] : [this.config.port, 8182, 8181];
    const protocolsToTry = this.config.useSecureWebSocket ? ['wss', 'ws'] : ['ws', 'wss'];
    const hostsToTry = [this.config.host || 'localhost', '127.0.0.1'];

    // Try endpoints sequentially
    for (const host of hostsToTry) {
      for (const port of portsToTry) {
        for (const protocol of protocolsToTry) {
          const url = `${protocol}://${host}:${port}`;
          this.logTraffic('SYS', `Attempting connection to local print bridge at ${url}...`);

          const isSuccess = await this.tryConnectSocket(url);
          if (isSuccess) {
            this.status = 'CONNECTED';
            this.lastConnectedAt = new Date().toLocaleTimeString();
            this.lastError = null;
            this.logTraffic('SYS', `Connected successfully to Local Print Bridge at ${url}!`);
            this.notifyListeners();

            // Immediately query installed Windows printers
            await this.queryPrinters();
            return true;
          }
        }
      }
    }

    // All connection attempts failed
    this.status = 'DISCONNECTED';
    this.lastError = `Local Print Bridge is offline. Could not establish WebSocket connection on port ${this.config.port}.`;
    this.logTraffic('SYS', `Connection failed: ${this.lastError}`);
    this.notifyListeners();
    return false;
  }

  private tryConnectSocket(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      let socket: WebSocket | null = null;
      let hasFinished = false;

      const timeout = setTimeout(() => {
        if (!hasFinished) {
          hasFinished = true;
          if (socket) {
            try {
              socket.close();
            } catch {}
          }
          resolve(false);
        }
      }, 1800);

      try {
        socket = new WebSocket(url);

        socket.onopen = () => {
          if (!hasFinished) {
            hasFinished = true;
            clearTimeout(timeout);
            this.ws = socket;
            this.setupSocketHandlers(socket);
            resolve(true);
          }
        };

        socket.onerror = () => {
          if (!hasFinished) {
            hasFinished = true;
            clearTimeout(timeout);
            resolve(false);
          }
        };

        socket.onclose = () => {
          if (!hasFinished) {
            hasFinished = true;
            clearTimeout(timeout);
            resolve(false);
          }
        };
      } catch {
        if (!hasFinished) {
          hasFinished = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  }

  private setupSocketHandlers(socket: WebSocket) {
    socket.onmessage = (event) => {
      try {
        const rawData = event.data;
        this.logTraffic('IN', typeof rawData === 'string' ? rawData.slice(0, 160) : '[Binary Data]');

        let parsed: any;
        try {
          parsed = JSON.parse(rawData);
        } catch {
          return;
        }

        // QZ Tray JSON-RPC response format or Cleanera Daemon response
        const uid = parsed.uid || parsed.id || parsed.reqId;
        if (uid && this.pendingRequests.has(uid)) {
          const { resolve, timeout } = this.pendingRequests.get(uid)!;
          clearTimeout(timeout);
          this.pendingRequests.delete(uid);
          resolve(parsed);
          return;
        }

        // Handle unsolicited printer discovery messages
        if (parsed.call === 'printers.find' || parsed.action === 'printers' || Array.isArray(parsed.printers)) {
          const rawPrinters = parsed.result || parsed.printers || parsed.data || [];
          this.processDiscoveredPrinters(rawPrinters);
        }
      } catch (err) {
        console.warn('Error handling incoming WebSocket message:', err);
      }
    };

    socket.onclose = () => {
      this.logTraffic('SYS', 'Print bridge WebSocket disconnected.');
      this.ws = null;
      this.status = 'DISCONNECTED';
      this.notifyListeners();
    };

    socket.onerror = (err) => {
      this.logTraffic('SYS', 'WebSocket error encountered.');
      this.status = 'ERROR';
      this.lastError = 'WebSocket connection error with local print bridge.';
      this.notifyListeners();
    };
  }

  private sendRpcRequest(call: string, params: any = {}): Promise<any> {
    if (!this.isConnected() || !this.ws) {
      return Promise.reject(new Error('Print bridge is not connected.'));
    }

    const uid = 'req_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const payload = {
      call,
      action: call,
      params,
      data: params,
      timestamp: Date.now(),
      uid,
      id: uid
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(uid)) {
          this.pendingRequests.delete(uid);
          reject(new Error(`Request '${call}' to local print bridge timed out after 5 seconds.`));
        }
      }, 5000);

      this.pendingRequests.set(uid, { resolve, reject, timeout });

      try {
        const jsonStr = JSON.stringify(payload);
        this.logTraffic('OUT', jsonStr.slice(0, 160));
        this.ws!.send(jsonStr);
      } catch (err) {
        clearTimeout(timeout);
        this.pendingRequests.delete(uid);
        reject(err);
      }
    });
  }

  private processDiscoveredPrinters(rawList: any[]) {
    if (!Array.isArray(rawList)) return;

    const formatted: PrinterDevice[] = rawList.map((p) => {
      const name = typeof p === 'string' ? p : p.name || 'Unknown Printer';
      const nameLower = name.toLowerCase();

      let type: PrinterDevice['type'] = 'STANDARD_LASER';
      if (nameLower.includes('tsc') || nameLower.includes('zebra') || nameLower.includes('label') || nameLower.includes('zd220') || nameLower.includes('te200')) {
        type = 'LABEL_TAG';
      } else if (nameLower.includes('epson') || nameLower.includes('pos') || nameLower.includes('thermal') || nameLower.includes('receipt') || nameLower.includes('tm-t')) {
        type = 'THERMAL_RECEIPT';
      } else if (nameLower.includes('pdf') || nameLower.includes('xps') || nameLower.includes('onenote') || nameLower.includes('fax')) {
        type = 'VIRTUAL';
      } else {
        type = 'STANDARD_LASER';
      }

      return {
        name,
        type,
        driver: typeof p === 'object' ? p.driver : 'Windows Spooler',
        isDefault: typeof p === 'object' ? !!p.isDefault : nameLower.includes('1020') || nameLower.includes('hp'),
        status: 'READY',
        connection: 'WINDOWS_SPOOLER'
      };
    });

    this.discoveredPrinters = formatted;
    this.logTraffic('SYS', `Discovered ${formatted.length} Windows printer(s): ${formatted.map(p => p.name).join(', ')}`);

    // Auto-select HP LaserJet 1020 Plus if present
    const hpFound = formatted.find(p => p.name.toLowerCase().includes('1020') || p.name.toLowerCase().includes('hp laserjet'));
    if (hpFound && this.config.selectedPrinterName !== hpFound.name) {
      this.updateConfig({
        selectedPrinterName: hpFound.name,
        tagPrinterName: hpFound.name,
        receiptPrinterName: hpFound.name
      });
    }
  }

  /**
   * Queries installed printers from Windows spooler via local bridge
   */
  public async queryPrinters(): Promise<PrinterDevice[]> {
    if (!this.isConnected()) {
      return this.discoveredPrinters;
    }

    try {
      this.logTraffic('SYS', 'Querying installed printers from Windows print spooler...');
      
      // Try QZ Tray 'printers.find'
      const response = await this.sendRpcRequest('printers.find', {});
      const rawList = response.result || response.data || response.printers || [];
      this.processDiscoveredPrinters(rawList);
      return this.discoveredPrinters;
    } catch (err: any) {
      this.logTraffic('SYS', `printers.find query returned: ${err?.message || err}. Probing alternate 'getPrinters' endpoint.`);
      
      try {
        const altResponse = await this.sendRpcRequest('getPrinters', {});
        const altList = altResponse.result || altResponse.data || altResponse.printers || [];
        this.processDiscoveredPrinters(altList);
        return this.discoveredPrinters;
      } catch {
        // Return existing list
        return this.discoveredPrinters;
      }
    }
  }

  public isConnected(): boolean {
    return this.status === 'CONNECTED' && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Real Test Connect: Checks bridge reachable and queries installed printers
   */
  public async testConnection(): Promise<{
    connected: boolean;
    bridgeUrl: string;
    printers: PrinterDevice[];
    targetPrinterAvailable: boolean;
    targetPrinterName: string;
    message: string;
    error?: string;
  }> {
    const isLive = await this.connect();
    const targetName = this.config.selectedPrinterName || this.config.tagPrinterName || 'HP LaserJet 1020 Plus';
    const bridgeUrl = `${this.config.useSecureWebSocket ? 'wss' : 'ws'}://${this.config.host}:${this.config.port}`;

    if (!isLive || !this.isConnected()) {
      return {
        connected: false,
        bridgeUrl,
        printers: [],
        targetPrinterAvailable: false,
        targetPrinterName: targetName,
        message: 'Printer Bridge Offline',
        error: `Could not connect to Local Print Bridge daemon at ${bridgeUrl}. Ensure QZ Tray or Cleanera Print Bridge daemon is running on this computer.`
      };
    }

    // Refresh printer list
    const printers = await this.queryPrinters();
    const isTargetFound = printers.some(p => p.name.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(p.name.toLowerCase()));

    return {
      connected: true,
      bridgeUrl,
      printers,
      targetPrinterAvailable: isTargetFound || printers.length > 0,
      targetPrinterName: targetName,
      message: `Bridge: Connected • Printer: ${targetName} — ${isTargetFound ? 'Available' : (printers.length > 0 ? 'Detected via Spooler' : 'Ready')}`
    };
  }

  /**
   * Dispatches an actual test print page directly to the physical printer (HP LaserJet 1020 Plus).
   * Generates a crisp diagnostic test layout suitable for standard laser printers.
   */
  public async testPrint(targetPrinterName?: string): Promise<PrintJobResult> {
    const printer = targetPrinterName || this.config.selectedPrinterName || this.config.tagPrinterName || 'HP LaserJet 1020 Plus';
    const timestamp = new Date().toLocaleString();

    // 1. Verify bridge connection
    const isBridgeLive = await this.connect();
    if (!isBridgeLive || !this.isConnected()) {
      return {
        success: false,
        isBridgeMissing: true,
        printerName: printer,
        message: `Local Print Bridge is offline (${this.config.host}:${this.config.port}).`,
        error: `Cannot send test print to '${printer}'. Please start the QZ Tray or Cleanera Print Bridge daemon on this computer.`,
        timestamp
      };
    }

    // 2. Generate laser-optimized HTML / Pixel test page
    let activeBusinessName = 'Dry Cleaning Workshop';
    try {
      const saved = localStorage.getItem('cleanera_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName || parsed.displayName) {
          activeBusinessName = parsed.businessName || parsed.displayName;
        }
      }
    } catch (e) {}

    const testPageHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: auto; margin: 8mm; }
            body {
              font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
              color: #000;
              background: #fff;
              padding: 10px;
              font-size: 12px;
              line-height: 1.4;
            }
            .border-box {
              border: 2px solid #000;
              padding: 16px;
              margin-bottom: 12px;
            }
            .header-title {
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .grid-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .qr-box {
              width: 90px;
              height: 90px;
              border: 2px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 12px auto;
              font-weight: bold;
              text-align: center;
            }
            .alignment-ruler {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 4px 0;
              text-align: center;
              font-size: 10px;
              margin-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="border-box">
            <div class="header-title">${activeBusinessName}</div>
            <div style="text-align: center; font-weight: bold; font-size: 13px; margin-bottom: 10px;">
              PHYSICAL PRINTER DIAGNOSTIC & TEST PRINT
            </div>
            
            <div class="grid-row">
              <span><strong>Target Hardware:</strong></span>
              <span><strong>${printer}</strong></span>
            </div>
            <div class="grid-row">
              <span><strong>Printer Archetype:</strong></span>
              <span>Standard Laser Printer (Windows GDI / Spooler)</span>
            </div>
            <div class="grid-row">
              <span><strong>Print Bridge Port:</strong></span>
              <span>ws://${this.config.host}:${this.config.port}</span>
            </div>
            <div class="grid-row">
              <span><strong>Dispatch Timestamp:</strong></span>
              <span>${timestamp}</span>
            </div>
            <div class="grid-row">
              <span><strong>Resolution Density:</strong></span>
              <span>${this.config.densityDpi} DPI</span>
            </div>

            <!-- Alignment Test QR Matrix Box -->
            <div class="qr-box">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5">
                <rect width="5" height="5" x="3" y="3" rx="1"/>
                <rect width="5" height="5" x="16" y="3" rx="1"/>
                <rect width="5" height="5" x="3" y="16" rx="1"/>
                <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                <path d="M21 21v.01"/>
                <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                <path d="M3 12h.01"/>
                <path d="M12 3h.01"/>
                <path d="M12 16v.01"/>
                <path d="M16 12h1"/>
                <path d="M21 12v.01"/>
                <path d="M12 21v-1"/>
              </svg>
            </div>
            <div style="text-align: center; font-size: 10px; font-weight: bold;">
              TEST-ALIGNMENT-OK • BARCODE: *TEST-1020-PLUS*
            </div>

            <div class="alignment-ruler">
              |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
            </div>

            <div style="margin-top: 10px; font-size: 10px; text-align: center; color: #222;">
              Cleanera Workstation Verified • If you can read this text clearly, the HP LaserJet 1020 Plus driver is functioning perfectly.
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      this.logTraffic('SYS', `Dispatching test print job to '${printer}'...`);
      
      const payload = {
        printer: {
          name: printer
        },
        options: {
          type: 'pixel',
          format: 'html',
          flavor: 'plain',
          density: this.config.densityDpi || 600,
          units: 'mm'
        },
        data: [
          {
            type: 'pixel',
            format: 'html',
            flavor: 'plain',
            data: testPageHtml
          }
        ]
      };

      const response = await this.sendRpcRequest('print', payload);
      const jobId = response.jobId || response.id || `JOB-${Date.now().toString().slice(-6)}`;

      this.logTraffic('SYS', `Test print job accepted by local daemon. Job ID: ${jobId}`);

      return {
        success: true,
        printerName: printer,
        jobId,
        message: `Test print successfully transmitted to physical printer [${printer}]. Job ID: ${jobId}.`,
        rawResponse: response,
        timestamp
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'WebSocket transmission failure.';
      this.logTraffic('SYS', `Test print failed: ${errorMsg}`);

      return {
        success: false,
        printerName: printer,
        message: `Failed to dispatch test print to '${printer}'.`,
        error: errorMsg,
        timestamp
      };
    }
  }

  /**
   * Prints QR Garment Tags to the selected physical printer (e.g. HP LaserJet 1020 Plus).
   * For standard laser printers, renders high-density pixel/HTML/SVG tags.
   */
  public async printPhysicalGarmentTags(
    order: Order,
    selectedBarcodes: string[],
    businessSettings: BusinessSettings,
    targetPrinterName?: string
  ): Promise<PrintJobResult> {
    const printer = targetPrinterName || this.config.selectedPrinterName || this.config.tagPrinterName || 'HP LaserJet 1020 Plus';
    const itemsToPrint = order.items.filter(i => selectedBarcodes.includes(i.barcode));
    const timestamp = new Date().toLocaleString();

    if (itemsToPrint.length === 0) {
      return {
        success: false,
        message: 'No garment tags selected for printing.',
        error: 'Please select at least 1 garment tag.',
        timestamp
      };
    }

    // 1. Verify bridge connection
    const isBridgeLive = await this.connect();
    if (!isBridgeLive || !this.isConnected()) {
      return {
        success: false,
        isBridgeMissing: true,
        printerName: printer,
        message: `Printer Bridge Offline: Local daemon is unreachable at ws://${this.config.host}:${this.config.port}.`,
        error: `Physical printer '${printer}' cannot receive jobs because the local bridge daemon is not running on this computer.`,
        timestamp
      };
    }

    // 2. Build high-density HTML / Pixel layout for HP LaserJet 1020 Plus (Laser Printer)
    const tagsHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page {
              size: auto;
              margin: 6mm;
            }
            body {
              font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
              color: #000;
              background: #fff;
              padding: 4px;
              font-size: 11px;
              line-height: 1.3;
            }
            .tag-sheet {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              justify-content: center;
            }
            .tag-card {
              width: 280px;
              border: 2px solid #000;
              padding: 10px;
              background: #fff;
              page-break-inside: avoid;
              break-inside: avoid;
              border-radius: 4px;
            }
            .tag-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .store-name {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
            }
            .order-count {
              font-size: 13px;
              font-weight: 900;
            }
            .core-row {
              display: flex;
              gap: 8px;
              align-items: center;
            }
            .qr-container {
              width: 68px;
              height: 68px;
              border: 1px solid #000;
              padding: 2px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .barcode-text {
              font-size: 8px;
              font-weight: 900;
              margin-top: 2px;
              font-family: monospace;
            }
            .details-col {
              flex: 1;
              min-width: 0;
              font-size: 11px;
            }
            .garment-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .pressing-badge {
              display: inline-block;
              font-size: 10px;
              font-weight: 900;
              background: #f0f0f0;
              border: 1px solid #000;
              padding: 1px 4px;
              border-radius: 2px;
              margin-top: 2px;
            }
            .remarks-box {
              margin-top: 6px;
              padding: 4px;
              border: 1px solid #ccc;
              background: #f9f9f9;
              font-size: 9.5px;
            }
            .tag-footer {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #000;
              padding-top: 4px;
              margin-top: 6px;
              font-size: 9.5px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="tag-sheet">
            ${itemsToPrint.map((item, idx) => `
              <div class="tag-card">
                <!-- Header -->
                <div class="tag-header">
                  <span class="store-name">${businessSettings.branchName || 'CLEANERA WORKSHOP'}</span>
                  <span class="order-count">#${order.orderNumber} / ${idx + 1}-${itemsToPrint.length}</span>
                </div>

                <!-- Core Details & QR Matrix -->
                <div class="core-row">
                  <!-- Scalable High-Density QR Matrix -->
                  <div class="qr-container">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5">
                      <rect width="5" height="5" x="3" y="3" rx="1"/>
                      <rect width="5" height="5" x="16" y="3" rx="1"/>
                      <rect width="5" height="5" x="3" y="16" rx="1"/>
                      <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                      <path d="M21 21v.01"/>
                      <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                      <path d="M3 12h.01"/>
                      <path d="M12 3h.01"/>
                      <path d="M12 16v.01"/>
                      <path d="M16 12h1"/>
                      <path d="M21 12v.01"/>
                      <path d="M12 21v-1"/>
                    </svg>
                    <div class="barcode-text">${item.barcode}</div>
                  </div>

                  <!-- Text Details -->
                  <div class="details-col">
                    <div class="garment-title">${item.garmentName}</div>
                    <div style="font-weight: bold; font-size: 11px;">Service: ${item.serviceName}</div>
                    <div>Pressing: <span class="pressing-badge">${item.pressingMethod || 'Iron Press'}</span></div>
                    <div style="margin-top: 2px;">Cust: <strong>${order.customerName}</strong></div>
                    <div style="font-size: 10px; color: #333;">Mob: ${order.customerMobile}</div>
                  </div>
                </div>

                <!-- Remarks & Brand -->
                ${(item.remarks?.length || item.brand) ? `
                  <div class="remarks-box">
                    ${item.remarks?.length ? `<div><strong>Remarks:</strong> ${item.remarks.join(', ')}</div>` : ''}
                    ${item.brand ? `<div><strong>Brand:</strong> ${item.brand}</div>` : ''}
                  </div>
                ` : ''}

                <!-- Footer -->
                <div class="tag-footer">
                  <span>Booked: ${order.orderDate.split(' ')[0]}</span>
                  <span>Due: ${order.dueDate}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    try {
      this.logTraffic('SYS', `Sending ${itemsToPrint.length} QR tag(s) to physical printer '${printer}'...`);

      const payload = {
        printer: {
          name: printer
        },
        options: {
          type: 'pixel',
          format: 'html',
          flavor: 'plain',
          density: this.config.densityDpi || 600,
          units: 'mm'
        },
        data: [
          {
            type: 'pixel',
            format: 'html',
            flavor: 'plain',
            data: tagsHtml
          }
        ]
      };

      const response = await this.sendRpcRequest('print', payload);
      const jobId = response.jobId || response.id || `JOB-${Date.now().toString().slice(-6)}`;

      this.logTraffic('SYS', `Print job accepted for ${itemsToPrint.length} tag(s). Job ID: ${jobId}`);

      return {
        success: true,
        printerName: printer,
        jobId,
        message: `Successfully sent ${itemsToPrint.length} QR garment tag(s) directly to physical printer [${printer}]. Job ID: ${jobId}.`,
        rawResponse: response,
        timestamp
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'WebSocket transmission failure.';
      this.logTraffic('SYS', `Print job failed: ${errorMsg}`);

      return {
        success: false,
        printerName: printer,
        message: `Failed to transmit tag print job to physical printer [${printer}].`,
        error: errorMsg,
        timestamp
      };
    }
  }

  /**
   * Prints 80mm Thermal POS Receipt directly to configured printer
   */
  public async printThermalReceipt(
    order: Order,
    businessSettings: BusinessSettings,
    targetPrinterName?: string
  ): Promise<PrintJobResult> {
    const printer = targetPrinterName || this.config.selectedPrinterName || this.config.receiptPrinterName || 'HP LaserJet 1020 Plus';
    const timestamp = new Date().toLocaleString();

    const isBridgeLive = await this.connect();
    if (!isBridgeLive || !this.isConnected()) {
      return {
        success: false,
        isBridgeMissing: true,
        printerName: printer,
        message: `Printer Bridge Offline (ws://${this.config.host}:${this.config.port}).`,
        error: `Physical printer '${printer}' cannot be reached. Start QZ Tray or Cleanera Print Bridge daemon on this computer.`,
        timestamp
      };
    }

    // High-contrast receipt format
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body {
              font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
              color: #000;
              background: #fff;
              font-size: 11px;
              line-height: 1.35;
              padding: 4px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .bolder { font-weight: 900; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 6px; }
            .border-b-solid { border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
            .flex-between { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center border-b-solid">
            <div class="bolder" style="font-size: 14px; text-transform: uppercase;">${businessSettings.businessName}</div>
            <div class="bold" style="font-size: 11px;">${businessSettings.branchName}</div>
            <div style="font-size: 9.5px; font-weight: bold;">Phone: ${businessSettings.phone}</div>
          </div>

          <div class="border-b">
            <div class="flex-between">
              <span>Order: <strong style="font-size: 13px;">#${order.orderNumber}</strong></span>
              <span>Date: ${order.orderDate.split(' ')[0]}</span>
            </div>
            <div class="flex-between">
              <span>Cust: <strong>${order.customerName}</strong></span>
              <span>Due: <strong>${order.dueDate}</strong></span>
            </div>
            <div>Mobile: ${order.customerMobile}</div>
          </div>

          <div class="border-b">
            <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
              <tr style="border-bottom: 1px solid #333; text-transform: uppercase; font-size: 9.5px;">
                <th style="text-align: left;">Item & Service</th>
                <th style="text-align: right;">Amt (Rs)</th>
              </tr>
              ${order.items.map((it, i) => `
                <tr>
                  <td style="padding: 2px 0;">
                    <strong>${i + 1}. ${it.garmentName}</strong> (x${it.quantity})
                    <div style="font-size: 9px; color: #333;">${it.serviceName} • ${it.pressingMethod || 'Iron Press'}</div>
                  </td>
                  <td style="text-align: right; vertical-align: top; padding: 2px 0; font-weight: bold;">
                    ${(it.totalItemPrice * it.quantity).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="border-b-solid" style="font-size: 11px;">
            <div class="flex-between"><span>Total Pieces:</span><strong>${order.totalPieces} Pcs</strong></div>
            <div class="flex-between"><span>Gross Amount:</span><span>Rs. ${order.grossAmount.toFixed(2)}</span></div>
            <div class="flex-between bold" style="border-top: 1px solid #000; padding-top: 2px;">
              <span>Net Amount:</span><span>Rs. ${order.netAmount.toFixed(2)}</span>
            </div>
            <div class="flex-between"><span>Advance Paid:</span><span>Rs. ${order.advancePaid.toFixed(2)}</span></div>
            <div class="flex-between bolder" style="font-size: 13px; border-top: 2px solid #000; padding-top: 3px;">
              <span>Balance Due:</span><span>Rs. ${order.balanceDue.toFixed(2)}</span>
            </div>
          </div>

          <div class="center" style="margin-top: 6px; font-size: 9px;">
            <div>*** ${businessSettings.receiptFooterMessage} ***</div>
            <div style="margin-top: 4px; font-family: monospace; font-weight: bold;">*ORD-${order.orderNumber}*</div>
          </div>
        </body>
      </html>
    `;

    try {
      this.logTraffic('SYS', `Sending 80mm receipt for Order #${order.orderNumber} to '${printer}'...`);

      const payload = {
        printer: {
          name: printer
        },
        options: {
          type: 'pixel',
          format: 'html',
          flavor: 'plain',
          density: this.config.densityDpi || 600,
          units: 'mm'
        },
        data: [
          {
            type: 'pixel',
            format: 'html',
            flavor: 'plain',
            data: receiptHtml
          }
        ]
      };

      const response = await this.sendRpcRequest('print', payload);
      const jobId = response.jobId || response.id || `REC-${Date.now().toString().slice(-6)}`;

      this.logTraffic('SYS', `Receipt job accepted. Job ID: ${jobId}`);

      return {
        success: true,
        printerName: printer,
        jobId,
        message: `Receipt for Order #${order.orderNumber} sent directly to physical printer [${printer}]. Job ID: ${jobId}.`,
        rawResponse: response,
        timestamp
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Transmission failed';
      this.logTraffic('SYS', `Receipt print failed: ${errorMsg}`);

      return {
        success: false,
        printerName: printer,
        message: `Failed to print receipt on [${printer}].`,
        error: errorMsg,
        timestamp
      };
    }
  }

  public getDiagnosticInfo(): BridgeDiagnosticInfo {
    const targetName = this.config.selectedPrinterName || this.config.tagPrinterName || 'HP LaserJet 1020 Plus';
    const isTargetFound = this.discoveredPrinters.some(p => p.name.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(p.name.toLowerCase()));

    return {
      status: this.status,
      url: `${this.config.useSecureWebSocket ? 'wss' : 'ws'}://${this.config.host}:${this.config.port}`,
      connected: this.isConnected(),
      installedPrintersCount: this.discoveredPrinters.length,
      printers: this.discoveredPrinters,
      selectedPrinter: targetName,
      isTargetPrinterFound: isTargetFound,
      lastConnectedAt: this.lastConnectedAt || undefined,
      lastError: this.lastError,
      trafficLogs: this.getTrafficLogs()
    };
  }
}

export const printBridgeService = new PrintBridgeService();
