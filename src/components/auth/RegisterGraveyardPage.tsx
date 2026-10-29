import React, { useState } from 'react';
import {
  Building2,
  User,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RegisterGraveyardPage: React.FC = () => {
  const { registerGraveyardWithAdmin, setActiveView } = useApp();

  const [graveyardName, setGraveyardName] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('23.8103');
  const [lng, setLng] = useState('90.4125');
  const [totalSlots, setTotalSlots] = useState(500);
  const [landAreaAcre, setLandAreaAcre] = useState(5.0);
  const [establishedYear, setEstablishedYear] = useState(2020);

  // Committee Admin Account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [designation, setDesignation] = useState('Cemetery General Secretary');

  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedGraveyardId, setSubmittedGraveyardId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!graveyardName || !address || !adminName || !adminEmail || !adminPassword || !adminPhone) {
      setErrorMsg('Please complete all required fields for both the facility and admin account.');
      return;
    }

    const res = registerGraveyardWithAdmin(
      {
        name: graveyardName,
        division,
        district,
        address,
        coordinates: {
          lat: parseFloat(lat) || 23.8103,
          lng: parseFloat(lng) || 90.4125,
        },
        totalSlots: Number(totalSlots) || 500,
        occupiedSlots: 0,
        status: 'Pending',
        landAreaAcre: Number(landAreaAcre) || 5.0,
        establishedYear: Number(establishedYear) || 2020,
        contactNumber: adminPhone,
      },
      {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
      }
    );

    if (res.success && res.graveyardId) {
      setSubmittedGraveyardId(res.graveyardId);
      setIsSubmitted(true);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-200">
        <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-emerald-300 dark:border-emerald-800 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-accentEmerald flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/80">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-accentEmerald font-bold block">
              Accreditation Docket Submitted • {submittedGraveyardId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Registration Submitted Successfully!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your cemetery committee onboarding dossier for <strong className="text-slate-900 dark:text-white">{graveyardName}</strong> has been transmitted to the Ministry of Local Government & Super Admin Directorate for vetting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Awaiting Super Admin Approval</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              Your administrator account (<span className="font-mono font-semibold">{adminEmail}</span>) has been created with status <strong className="font-bold">Pending</strong>. You will be able to sign in as Graveyard Admin as soon as Super Admin reviews and accredits your registration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveView('directory')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              Browse Directory Map
            </button>
            <button
              onClick={() => setActiveView('login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in duration-200">
      {/* Return to Directory */}
      <button
        onClick={() => setActiveView('directory')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-accentEmerald transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to National Directory</span>
      </button>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-900/50 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5 text-accentEmerald" />
          <span>Municipal Cemetery Accreditation Petition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Register Graveyard <span className="text-accentEmerald">Facility</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Onboard a community or municipal cemetery into the national multi-occupancy spatial tracking ledger and digital registry.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Onboarding Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkMuted shadow-sm space-y-6"
      >
        {/* SECTION 1: Graveyard Particulars */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-darkMuted/60 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            1. Graveyard Facility Particulars
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Official Graveyard Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Uttara Sector 12 Municipal Cemetery"
              value={graveyardName}
              onChange={(e) => setGraveyardName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Division *
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Khulna">Khulna</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                District / Thana *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dhaka (Uttara)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Physical Road Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sector 12 Avenue 4, Uttara, Dhaka 1230"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Latitude
              </label>
              <input
                type="text"
                placeholder="23.8741"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Longitude
              </label>
              <input
                type="text"
                placeholder="90.3862"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Total Plots
              </label>
              <input
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Land Area (Acre)
              </label>
              <input
                type="number"
                step="0.1"
                value={landAreaAcre}
                onChange={(e) => setLandAreaAcre(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Founded Year
              </label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(Number(e.target.value) || 2020)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Cemetery Committee Admin Account */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-darkMuted/60">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-darkMuted/60 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            2. Committee Administrator Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Admin Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alhaj Nurul Huda"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Designation in Committee
              </label>
              <input
                type="text"
                placeholder="e.g. Cemetery Committee Convener"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Official Admin Email *
              </label>
              <input
                type="email"
                required
                placeholder="admin.uttara@graveyard.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+880 1819-..."
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Create Admin Password *
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters (e.g. Pending@123)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-darkMuted bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accentEmerald"
            />
          </div>
        </div>

        {/* SECTION 3: Committee Accreditation Documents Placeholder */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-darkMuted/60">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            3. Verification & Accreditation Documentation
          </h2>

          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors block">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {fileName ? fileName : 'Upload Committee Registration or Waqf Certificate (PDF/JPG)'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              City Corporation resolution, Gazette decree, or Waqf Estate deed
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileName(e.target.files[0].name);
                }
              }}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
        >
          <span>Submit for Super Admin Accreditation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
