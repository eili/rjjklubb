import React, { useState } from 'react';
import { VippsProduct, ClubConfig } from '../types';
import { VippsQRCode } from './VippsQRCode';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  Copy, 
  ExternalLink, 
  Receipt, 
  Sparkles,
  ArrowRight
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff5b24] text-white flex items-center justify-center font-bold text-sm">
              v:
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Betaling med Vipps</h3>
              <p className="text-[11px] text-stone-400">Risør Ju Jutsu klubb</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStatus === 'success' ? (
          /* Payment Receipt View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Betaling Fullført
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
                <span className="text-stone-500">Vare:</span>
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
              Takk for innbetalingen! Bekreftelsen er registrert. Vi gleder oss til å se deg på tatamien!
            </p>

            <button
              onClick={() => {
                setPaymentStatus('idle');
                onClose();
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Lukk kvittering
            </button>
          </div>
        ) : (
          /* Normal QR View */
          <div className="p-6 space-y-5">
            {/* Summary */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-heading font-bold text-sm text-stone-900">{product.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{product.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-stone-900">
                    {product.amount.toLocaleString('no-NO')} kr
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <VippsQRCode
                value={vippsPayload}
                size={180}
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
                onClick={handleCopyNumber}
                className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 font-medium hover:bg-stone-50 flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="text-[11px] text-stone-500 space-y-1">
              <p>• <strong>Mobil:</strong> Klikk på knappen under for å åpne Vipps, eller skann koden.</p>
              <p>• <strong>Melding:</strong> Husk å skrive inn utøvers navn i Vipps-meldingen.</p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulatePayment}
                disabled={paymentStatus === 'processing'}
                className="w-full py-3 bg-[#ff5b24] hover:bg-[#e04814] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Bekrefter med Vipps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simuler Fullført Betaling ({product.amount} kr)</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
