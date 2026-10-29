import React, { useState } from 'react';
import {
  X,
  Building2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const RegisterGraveyardModal: React.FC = () => {
  const {
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    addGraveyard,
    setSelectedGraveyardId,
    showToast,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Graveyard Details Form
  const [formData, setFormData] = useState({
    name: '',
    division: 'Dhaka',
    district: 'Dhaka',
    address: '',
    lat: 23.7289,
    lng: 90.3854,
    landAreaAcre: 4.5,
    totalSlots: 800,
    contactNumber: '',

    // Step 2: Committee Admin Details
    adminName: '',
    adminPhone: '',
    adminEmail: '',
    adminDesignation: 'General Secretary',
    docUploaded: false,
    docFileName: '',

    // Step 3: Declaration
    termsAgreed: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isRegisterModalOpen) return null;

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'Graveyard Name is required';
    if (!formData.address.trim()) errs.address = 'Street Address is required';
    if (!formData.totalSlots || formData.totalSlots <= 0)
      errs.totalSlots = 'Valid estimated slots required';
    if (!formData.lat || !formData.lng) errs.coordinates = 'Valid GPS coordinates required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.adminName.trim()) errs.adminName = 'Administrator Name is required';
    if (!formData.adminPhone.trim()) errs.adminPhone = 'Contact Phone is required';
    if (!formData.adminEmail.trim()) errs.adminEmail = 'Official Email is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAgreed) {
      setErrors({ terms: 'Please certify committee authority to proceed.' });
      return;
    }

    // Dispatch to AppContext as "Pending"
    const newId = addGraveyard({
      name: formData.name,
      division: formData.division,
      district: formData.district,
      address: formData.address,
      coordinates: { lat: Number(formData.lat), lng: Number(formData.lng) },
      totalSlots: Number(formData.totalSlots),
      occupiedSlots: 0,
      status: 'Pending',
      contactNumber: formData.contactNumber || formData.adminPhone,
      landAreaAcre: Number(formData.landAreaAcre),
      adminContact: {
        name: formData.adminName,
        phone: formData.adminPhone,
        email: formData.adminEmail,
        designation: formData.adminDesignation,
      },
      registrationDocUrl: formData.docUploaded ? 'https://example.com/uploaded-doc.pdf' : undefined,
    });

    // Auto-select and show toast
    setSelectedGraveyardId(newId);
    showToast({
      title: 'Registration Submitted',
      message: `${formData.name} submitted for review with status "Pending".`,
      type: 'success',
    });

    setIsRegisterModalOpen(false);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkMuted shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-darkMuted/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accentEmerald/10 text-accentEmerald">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register Graveyard Committee
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official onboarding workflow for local cemetery trusts & municipal boards
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegisterModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-darkMuted/60 text-xs">
          <div
            className={`flex items-center gap-2 font-semibold ${
              currentStep === 1
                ? 'text-accentEmerald'
                : currentStep > 1
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep >= 1
                  ? 'bg-accentEmerald text-white font-bold'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              1
            </span>
            <span>Facility Details</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700" />

          <div
            className={`flex items-center gap-2 font-semibold ${
              currentStep === 2
                ? 'text-accentEmerald'
                : currentStep > 2
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep >= 2
                  ? 'bg-accentEmerald text-white font-bold'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              2
            </span>
            <span>Admin & Docs</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-700" />

          <div
            className={`flex items-center gap-2 font-semibold ${
              currentStep === 3 ? 'text-accentEmerald' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 3
                  ? 'bg-accentEmerald text-white font-bold'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              3
            </span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* STEP 1: Graveyard Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Graveyard Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Azimpur Historical Municipal Graveyard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:ring-1 focus:ring-accentEmerald focus:outline-none"
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Division
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Dhaka">Dhaka Division</option>
                    <option value="Chittagong">Chittagong Division</option>
                    <option value="Sylhet">Sylhet Division</option>
                    <option value="Rajshahi">Rajshahi Division</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Street Address *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lalbagh Fort Road, Azimpur, Dhaka 1205"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:ring-1 focus:ring-accentEmerald focus:outline-none"
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>
                )}
              </div>

              {/* GPS Coordinates Picker */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-darkMuted space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-accentEmerald" />
                    GPS Location Coordinates
                  </span>
                  <span className="text-[11px] text-slate-400">Lat / Lng decimal</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkBg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkBg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Land Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.landAreaAcre}
                    onChange={(e) =>
                      setFormData({ ...formData, landAreaAcre: parseFloat(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Slots Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) =>
                      setFormData({ ...formData, totalSlots: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  />
                  {errors.totalSlots && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.totalSlots}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Committee Admin & Documents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Committee Administrator Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alhaj Mawlana Md. Abdul Karim"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:ring-1 focus:ring-accentEmerald focus:outline-none"
                />
                {errors.adminName && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.adminName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Contact Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1712-345678"
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  />
                  {errors.adminPhone && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.adminPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Committee Email *
                  </label>
                  <input
                    type="email"
                    placeholder="committee@azimpur-graveyard.org"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                  />
                  {errors.adminEmail && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.adminEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role in Committee
                </label>
                <select
                  value={formData.adminDesignation}
                  onChange={(e) =>
                    setFormData({ ...formData, adminDesignation: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkMuted bg-white dark:bg-darkBg text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="President / Chairman">President / Chairman</option>
                  <option value="General Secretary">General Secretary</option>
                  <option value="Municipal Trustee">Municipal Trustee</option>
                  <option value="Waqf Estate Mutawalli">Waqf Estate Mutawalli</option>
                </select>
              </div>

              {/* Document Upload Simulator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Registration / Trust Deed Certificate
                </label>
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      docUploaded: true,
                      docFileName: 'Committee_Registration_Deed_2026.pdf',
                    })
                  }
                  className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    formData.docUploaded
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-accentEmerald'
                  }`}
                >
                  {formData.docUploaded ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="w-5 h-5" />
                      <span className="text-xs font-semibold">{formData.docFileName}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to upload Committee Deed / Government Waqf Paper
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PDF, DOCX, or Scanned Image (Max 15MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submission */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-darkMuted space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accentEmerald">
                  Application Summary
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Graveyard Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formData.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formData.district}, {formData.division}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimated Capacity:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formData.totalSlots} Slots ({formData.landAreaAcre} Acres)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Representative:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formData.adminName} ({formData.adminDesignation})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Initial Registration Status:</span>
                  <Badge variant="gold" size="sm" dot>
                    Pending Super Admin Review
                  </Badge>
                </div>
              </div>

              {/* Declaration terms */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-darkMuted cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <input
                  type="checkbox"
                  checked={formData.termsAgreed}
                  onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
                  className="mt-0.5 rounded text-accentEmerald focus:ring-accentEmerald"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I hereby declare that I am the authorized representative of the mentioned Graveyard
                  Trust / Municipal Committee, and the submitted spatial boundaries and slot counts
                  are true to the best of my knowledge.
                </span>
              </label>
              {errors.terms && <p className="text-[11px] text-rose-500">{errors.terms}</p>}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-darkMuted/60">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-darkMuted text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accentEmerald hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Committee Application</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
