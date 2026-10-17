import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.inline) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 text-center">
            <div className="max-w-md w-full bg-white rounded-xl border border-rose-200 shadow-sm p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {this.props.fallbackTitle || 'Section Display Error'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {this.props.fallbackMessage || 'A problem occurred displaying this section.'}
                </p>
              </div>
              {this.state.error?.message && (
                <div className="p-2.5 bg-rose-50 rounded border border-rose-100 text-left font-mono text-[11px] text-rose-800 break-words max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {this.props.fallbackTitle || 'Something Went Wrong'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {this.props.fallbackMessage || 'An unexpected error occurred while loading this page.'}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left font-mono text-[11px] text-rose-300 break-words max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
