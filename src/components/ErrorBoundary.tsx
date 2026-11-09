import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Risør Ju Jutsu application:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt session keys if needed
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-white">
                Noe gikk galt under visningen
              </h2>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                Det oppstod en uventet feil i visningsmotoren. Dataene dine er trygge.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-900 rounded-xl text-left font-mono text-[11px] text-amber-300 border border-stone-800 break-all max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Gjenopprett og last siden på nytt</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
