import React, { useState, useEffect } from 'react';
import { VippsProduct, ClubConfig } from '../types';
import { VippsQRCode } from './VippsQRCode';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  Copy, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VippsModalProps {
  product: VippsProduct | null;
  clubConfig: ClubConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const VippsModal: React.FC<VippsModalProps> = ({
  product,
  clubConfig,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [reference] = useState(() => 'VIPPS-' + Math.floor(100000 + Math.random() * 900000));

  const handleClose = () => {
    setPaymentStatus('idle');
    onClose();
  };

  // Keyboard shortcut (Escape) & prevent body background scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(clubConfig.vippsNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff5b24', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  const vippsPayload = `vipps://pay?recipient=${clubConfig.vippsNumber}&amount=${product.amount}&ref=${reference}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vipps-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff5b24] text-white flex items-center justify-center font-bold text-sm">
              v:
            </div>
            <div>
              <h3 id="vipps-modal-title" className="font-heading font-bold text-sm text-white">
                Betaling med Vipps
              </h3>
              <p className="text-[11px] text-stone-400">{clubConfig.clubName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-all border border-stone-700 text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            aria-label="Lukk betalingsvindu"
          >
            <span>Lukk</span>
            <X className="w-4 h-4 text-stone-300" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {paymentStatus === 'success' ? (
            /* Payment Receipt View */
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  Betaling Registrert
                </span>
                <h4 className="font-heading text-2xl font-bold text-stone-900 mt-2">
                  {product.amount.toLocaleString('no-NO')} kr
                </h4>
                <p className="text-xs text-stone-500 mt-1 font-mono">
                  Ref: {reference}
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Vare / Formål:</span>
                  <span className="font-semibold text-stone-900">{product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mottaker:</span>
                  <span className="font-semibold text-stone-900">{clubConfig.clubName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Vippsnummer:</span>
                  <span className="font-mono font-bold text-[#ff5b24]">#{clubConfig.vippsNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Dato & tid:</span>
                  <span className="text-stone-700">{new Date().toLocaleDateString('no-NO')}</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                Tusen takk for innbetalingen! Bekreftelsen er registrert hos Risør Ju Jutsu klubb.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Lukk kvittering</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal QR View */
            <div className="space-y-4">
              {/* Product Summary */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-stone-900">{product.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-stone-900 block">
                      {product.amount.toLocaleString('no-NO')} kr
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex justify-center">
                <VippsQRCode
                  value={vippsPayload}
                  size={175}
                  vippsNumber={clubConfig.vippsNumber}
                  amount={product.amount}
                  title={product.title}
                />
              </div>

              {/* Vipps number quick copy */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#ff5b24]" />
                  <span className="text-xs font-semibold text-stone-800">
                    Vippsnummer: <strong className="font-mono text-[#ff5b24]">#{clubConfig.vippsNumber}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 font-medium hover:bg-stone-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-stone-500 space-y-1 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <p>• <strong>Mobil / Skann:</strong> Åpne kameraet på telefonen eller Vipps-appen og skann koden.</p>
                <p>• <strong>Melding:</strong> Husk å merke innbetalingen med utøvers navn.</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={paymentStatus === 'processing'}
                  className="w-full py-3.5 bg-[#ff5b24] hover:bg-[#e04814] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Bekrefter med Vipps...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Simuler Betaling ({product.amount} kr)</span>
                    </>
                  )}
                </button>
                
                {/* Obvious Cancel / Close button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors border border-stone-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Avbryt og lukk vinduet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
