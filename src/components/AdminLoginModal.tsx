import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  HelpCircle, 
  Copy, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AdminMFAConfig, ClubConfig } from '../types';
import { 
  verifyTOTP, 
  generateTOTP, 
  getOTPAuthURL, 
  getRemainingSeconds 
} from '../utils/totp';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mfaConfig: AdminMFAConfig;
  clubConfig: ClubConfig;
  onUpdateMFAConfig: (config: AdminMFAConfig) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mfaConfig,
  clubConfig,
  onUpdateMFAConfig,
}) => {
  const [step, setStep] = useState<'password' | 'mfa' | 'setup_app' | 'backup_code'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds());

  // Timer countdown for TOTP 30s window
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR Code when in setup mode or open
  useEffect(() => {
    if (mfaConfig.totpSecret) {
      const url = getOTPAuthURL(
        mfaConfig.adminEmail || 'admin@risorjujutsu.no',
        clubConfig.clubName || 'Risør Ju Jutsu klubb',
        mfaConfig.totpSecret
      );
      QRCode.toDataURL(url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrCodeDataUrl(dataUrl))
        .catch(() => {});
    }
  }, [mfaConfig.totpSecret, mfaConfig.adminEmail, clubConfig.clubName]);

  // Keyboard shortcut (Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setStep('password');
    setPassword('');
    setTotpCode('');
    setBackupCodeInput('');
    setErrorMsg('');
    setEmailCodeSent(false);
    onClose();
  };

  // Step 1: Submit Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password === mfaConfig.password || password === 'risorjujutsu2026') {
      // Password correct, proceed to MFA
      setStep('mfa');
    } else {
      setErrorMsg('Feil admin-passord. Prøv igjen.');
    }
  };

  // Step 2: Submit TOTP Code
  const handleTOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = totpCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      setErrorMsg('Vennligst oppgi en 6-sifret kode.');
      return;
    }

    // Check TOTP with ±30s drift window
    const isValid = verifyTOTP(cleanCode, mfaConfig.totpSecret);
    
    // Also allow email code if sent
    const isEmailValid = emailCodeSent && simulatedEmailCode && cleanCode === simulatedEmailCode;

    if (isValid || isEmailValid) {
      onSuccess();
      handleResetAndClose();
    } else {
      setErrorMsg('Ugyldig eller utløpt engangskode. Sjekk koden i appen og prøv på nytt.');
    }
  };

  // Backup Code Submit
  const handleBackupCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const clean = backupCodeInput.trim();
    const codes = mfaConfig?.backupCodes || ['4829-1094', '9912-3841', '7521-6643', '2019-8472'];
    if (codes.includes(clean)) {
      // Consume the backup code
      const remainingCodes = codes.filter((c) => c !== clean);
      onUpdateMFAConfig({
        ...mfaConfig,
        backupCodes: remainingCodes,
      });

      onSuccess();
      handleResetAndClose();
    } else {
      setErrorMsg('Ugyldig nød-reservekode. Sjekk formatet (f.eks. 4829-1094).');
    }
  };

  // Send simulated email code to club leader
  const handleSendEmailCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedEmailCode(code);
    setEmailCodeSent(true);
    setErrorMsg('');
  };

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(mfaConfig.totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Fill current demo TOTP for testing convenience
  const handleDemoAutofill = () => {
    const currentCode = generateTOTP(mfaConfig.totpSecret);
    setTotpCode(currentCode);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-auth-title"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="admin-auth-title" className="font-heading font-bold text-sm text-white">
                Admin-sikkerhet: 2-faktor (MFA)
              </h3>
              <p className="text-[11px] text-stone-400">{clubConfig.clubName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-all border border-stone-700 text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            aria-label="Lukk"
          >
            <span>Lukk</span>
            <X className="w-4 h-4 text-stone-300" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* STEP 1: PASSWORD */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-stone-900 mt-2">
                  Trinn 1: Hovedpassord
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Logg inn for å vedlikeholde klubben, instruktører, sommerleir og Vipps-innstillinger.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Admin-passord:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Tast inn passord..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Helper tip */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 space-y-1">
                <span className="font-bold text-stone-800 block">Standard passord:</span>
                <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                  risorjujutsu2026
                </span>
                <p className="text-stone-500 text-[10px] pt-1">
                  (Du kan endre dette passordet når du er innlogget).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Fortsett til Faktor 2 (MFA)</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: TOTP (AUTHENTICATOR APP) */}
          {step === 'mfa' && (
            <form onSubmit={handleTOTPSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                  <Smartphone className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-heading font-bold text-lg text-stone-900 mt-2">
                  Trinn 2: Autentiseringskode
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Åpne <strong>Google Authenticator</strong> eller <strong>Microsoft Authenticator</strong> på mobilen og oppgi den 6-sifrede koden.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 6-digit TOTP Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    6-sifret kode fra app:
                  </label>
                  <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                    Ny kode om {remainingSeconds}s
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center py-3 tracking-[0.5em] font-mono text-2xl font-extrabold rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Demo test helper */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block text-[11px]">Rask test / Demo:</span>
                  <span className="text-[10px] text-stone-600">Klikk for å hente koden automatisk</span>
                </div>
                <button
                  type="button"
                  onClick={handleDemoAutofill}
                  className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fyll aktiv kode</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bekreft og åpne admin</span>
                </button>

                <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep('setup_app')}
                    className="p-2 text-center text-amber-700 hover:text-amber-800 font-semibold bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Vis QR-kode / Sett opp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('backup_code')}
                    className="p-2 text-center text-stone-600 hover:text-stone-900 font-semibold bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Nød-reservekode</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Tilbake til passord</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SETUP AUTHENTICATOR APP (QR CODE) */}
          {step === 'setup_app' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Gratis & Sikker 2FA
                </span>
                <h4 className="font-heading font-bold text-lg text-stone-900 mt-1">
                  Koble til Google Authenticator
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Bruk en valgfri autentiseringsapp på telefonen din (Google Authenticator, Microsoft Authenticator eller Apple Passwords).
                </p>
              </div>

              {/* Scannable QR Code */}
              <div className="flex justify-center p-3 bg-white rounded-2xl border-2 border-dashed border-stone-300">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="2FA QR Code"
                    className="w-48 h-48 rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                    Laster QR-kode...
                  </div>
                )}
              </div>

              {/* Step instructions */}
              <div className="text-xs text-stone-600 space-y-1.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <p className="font-bold text-stone-900 text-xs">Slik gjør du:</p>
                <p>1. Åpne Google Authenticator på mobilen.</p>
                <p>2. Trykk på <strong>+</strong> og velg <strong>«Skann QR-kode»</strong>.</p>
                <p>3. Skann ruten over. Klubben legges inn umiddelbart.</p>
              </div>

              {/* Manual Base32 Key */}
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Eller tast inn hemmelig nøkkel manuelt:
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-stone-900 tracking-wider">
                    {mfaConfig.totpSecret}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecretKey}
                    className="px-2 py-1 text-[11px] bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Kopiert' : 'Kopier'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setStep('mfa')}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Jeg har skannet koden → Skriv inn 6 siffer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('mfa')}
                  className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BACKUP / EMERGENCY CODES & EMAIL */}
          {step === 'backup_code' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-stone-100 text-stone-700 rounded-2xl flex items-center justify-center mx-auto border border-stone-200">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-stone-900 mt-2">
                  Nød-reservekode
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Har du mistet eller glemt telefonen? Tast inn en av klubbens forhåndsgenererte engangskoder.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleBackupCodeSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nød-reservekode:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="f.eks. 4829-1094"
                    value={backupCodeInput}
                    onChange={(e) => setBackupCodeInput(e.target.value)}
                    className="w-full text-center py-2.5 font-mono text-base font-bold rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Logg inn med reservekode</span>
                </button>
              </form>

              {/* Email backup option */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Motta kode på klubbleders e-post</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Send engangskode til <strong>{mfaConfig.adminEmail || 'kittel@risorjujutsu.no'}</strong>.
                </p>

                {emailCodeSent ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kode sendt til {mfaConfig.adminEmail}:
                    </span>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-base font-black text-stone-900 tracking-wider">
                        {simulatedEmailCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTotpCode(simulatedEmailCode);
                          setStep('mfa');
                        }}
                        className="px-2 py-1 text-xs bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800"
                      >
                        Bruk kode
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Send kode til e-post
                  </button>
                )}
              </div>

              {/* Show active backup codes hint */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-stone-600">
                <span className="font-bold text-amber-900 block">Klubbens aktive reservekoder:</span>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs text-stone-800 pt-1">
                  {(mfaConfig?.backupCodes || ['4829-1094', '9912-3841', '7521-6643', '2019-8472']).map((code, idx) => (
                    <span
                      key={idx}
                      onClick={() => setBackupCodeInput(code)}
                      className="cursor-pointer hover:text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200 inline-block text-center"
                      title="Klikk for å sette inn"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('mfa')}
                  className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Tilbake til autentiseringsapp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
