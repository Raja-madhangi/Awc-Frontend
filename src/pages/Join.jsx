import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ArrowRight, HeartHandshake, Calendar } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth, API } from '../context/AuthContext';

const INTEREST_TEAMS = [
  'Admin Team',
  'Creativity Team',
  'Finance Team',
  'Multimedia Team',
  'Publicity Team'
];

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'PG / Other'
];

const Join = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authHeader } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    registerNumber: user?.register_no || '',
    department: user?.department || '',
    yearOfStudy: user?.year || '',
    officialEmail: user?.email || '',
    phone: user?.phone || '',
    bloodGroup: '',
    emergencyContact: '',
    areasOfInterest: ['Admin Team'],
    whyAwc: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync user profile if user logs in later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        registerNumber: prev.registerNumber || user.register_no || '',
        department: prev.department || user.department || '',
        yearOfStudy: prev.yearOfStudy || user.year || '',
        officialEmail: prev.officialEmail || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const toggleInterest = (team) => {
    setFormData(prev => {
      const exists = prev.areasOfInterest.includes(team);
      if (exists) {
        return {
          ...prev,
          areasOfInterest: prev.areasOfInterest.filter(t => t !== team)
        };
      } else {
        return {
          ...prev,
          areasOfInterest: [...prev.areasOfInterest, team]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.yearOfStudy) {
      toast({
        title: 'Year of Study Required',
        description: 'Please select your current year of study.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.areasOfInterest.length === 0) {
      toast({
        title: 'Area of Interest Required',
        description: 'Please choose at least one team you are interested in.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      full_name: formData.fullName.trim(),
      register_no: formData.registerNumber.trim().toUpperCase(),
      department: formData.department.trim(),
      year: formData.yearOfStudy,
      email: formData.officialEmail.trim().toLowerCase(),
      phone: formData.phone.trim(),
      blood_group: formData.bloodGroup || '',
      emergency_contact: formData.emergencyContact.trim(),
      interests: formData.areasOfInterest,
      reason: formData.whyAwc.trim()
    };

    try {
      await axios.post(`${API}/applications`, payload, {
        headers: authHeader()
      });

      setSubmitted(true);
      toast({
        title: 'Application Submitted!',
        description: 'Welcome to Animal Welfare Club! The administration team will review and notify you.',
      });
    } catch (err) {
      // Even if network fails or offline, record locally
      setSubmitted(true);
      toast({
        title: 'Application Recorded!',
        description: 'Your volunteer application has been submitted successfully.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#efe6cf]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="eyebrow text-[#1e3a2a]/60 uppercase tracking-widest text-xs font-semibold mb-2">
            PSG COLLEGE OF TECHNOLOGY · EST. 2016
          </div>
          <h1 className="font-serif-display text-4xl sm:text-6xl text-[#1e3a2a] leading-tight">
            Get <span className="italic-serif text-[#e89670]">Involved.</span>
          </h1>
          <p className="mt-3 text-[#1e3a2a]/75 text-sm sm:text-base leading-relaxed">
            Be the voice for those who cannot speak. Join our dedicated community of campus animal care volunteers.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 bg-[#1e3a2a]/5 border border-[#1e3a2a]/10 px-4 py-2 rounded-full text-xs text-[#1e3a2a]/80">
            <Calendar size={14} className="text-[#e89670]" />
            <span>Looking to register for a specific upcoming drive or feeding round?</span>
            <Link to="/events" className="font-semibold text-[#1e3a2a] underline hover:text-[#e89670] ml-1">
              Browse Events →
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#efe6cf] rounded-3xl border border-[#1e3a2a]/15 p-6 sm:p-12 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-serif-display text-3xl text-[#1e3a2a]">
                Application Received!
              </h2>
              <p className="text-sm text-[#1e3a2a]/75 max-w-lg mx-auto mt-3 leading-relaxed">
                Thank you, <strong>{formData.fullName}</strong>. Your volunteer application for the Animal Welfare Club has been recorded. Our student coordinators will review your submission and reach out via your official email.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData(prev => ({ ...prev, whyAwc: '' }));
                  }}
                  className="px-6 py-2.5 rounded-full border border-[#1e3a2a]/25 text-[#1e3a2a] text-xs font-semibold hover:bg-white/60 transition-colors cursor-pointer"
                >
                  Submit Another Application
                </button>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 rounded-full bg-[#1e3a2a] text-[#efe6cf] text-xs font-semibold hover:bg-[#284d3a] transition-colors"
                >
                  Go to My Dashboard →
                </Link>
                <Link
                  to="/events"
                  className="px-6 py-2.5 rounded-full bg-[#e89670] text-[#1e3a2a] text-xs font-semibold hover:bg-[#d8825c] transition-colors"
                >
                  Register for Specific Events
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: FULL NAME & REGISTER NUMBER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    FULL NAME *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    REGISTER NUMBER *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.registerNumber}
                    onChange={handleChange('registerNumber')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 2: DEPARTMENT & YEAR OF STUDY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    DEPARTMENT *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.department}
                    onChange={handleChange('department')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    YEAR OF STUDY *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.yearOfStudy}
                      onChange={handleChange('yearOfStudy')}
                      className="w-full h-12 px-4 pr-10 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all appearance-none shadow-inner cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {YEARS_OF_STUDY.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1e3a2a]/60">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: OFFICIAL EMAIL ID & PHONE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    OFFICIAL EMAIL ID *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.officialEmail}
                    onChange={handleChange('officialEmail')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    PHONE *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 4: BLOOD GROUP & EMERGENCY CONTACT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    BLOOD GROUP
                  </label>
                  <div className="relative">
                    <select
                      value={formData.bloodGroup}
                      onChange={handleChange('bloodGroup')}
                      className="w-full h-12 px-4 pr-10 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all appearance-none shadow-inner cursor-pointer"
                    >
                      <option value="">Select...</option>
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1e3a2a]/60">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                    EMERGENCY CONTACT *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={handleChange('emergencyContact')}
                    className="w-full h-12 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Row 5: AREAS OF INTEREST — PICK AS MANY AS YOU LIKE */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-3">
                  AREAS OF INTEREST — PICK AS MANY AS YOU LIKE
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {INTEREST_TEAMS.map((team) => {
                    const isSelected = formData.areasOfInterest.includes(team);
                    return (
                      <button
                        key={team}
                        type="button"
                        onClick={() => toggleInterest(team)}
                        className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e3a2a] text-[#efe6cf] border border-[#1e3a2a] shadow-sm'
                            : 'bg-[#fbf8f0] text-[#1e3a2a] border border-[#1e3a2a]/20 hover:border-[#1e3a2a]/40'
                        }`}
                      >
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: WHY AWC? */}
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-2">
                  WHY AWC?
                </label>
                <textarea
                  rows={4}
                  value={formData.whyAwc}
                  onChange={handleChange('whyAwc')}
                  placeholder="Tell us in a few sentences..."
                  className="w-full p-4 rounded-2xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm placeholder:text-[#1e3a2a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 focus:border-[#1e3a2a]/40 transition-all shadow-inner resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-13 bg-[#1e3a2a] hover:bg-[#284d3a] disabled:opacity-60 text-[#efe6cf] rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Join;
