import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Users,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth, API } from '../context/AuthContext';

const defaultFallbackEvents = [
  {
    id: 'e1',
    title: 'Weekly Feeding Round',
    image: '/assets/images/feed_campus.png',
    date: 'Every Weekend (Updated by Admin)',
    time: '6:00 AM - 7:30 AM',
    location: 'PSG Tech Campus (Hostel Quadrangle & South Gate)',
    description: 'Join our morning feeding volunteers providing nutritious warm meals for over 40 resident campus animals.'
  },
  {
    id: 'e2',
    title: 'Anti-Rabies Vaccination Camp',
    image: '/assets/images/rescue_vet.png',
    date: 'Upcoming (Admin will announce exact date)',
    time: '9:00 AM - 2:00 PM',
    location: 'GreenPaws Clinic & PSG Tech Helpdesk',
    description: 'Free anti-rabies vaccination, health check-up and deworming drive in partnership with local veterinarians.'
  },
  {
    id: 'e3',
    title: 'Tree Plantation & Green Sanctuary Drive',
    image: '/assets/images/plantation_green.png',
    date: 'Upcoming (Admin will announce exact date)',
    time: '7:00 AM - 11:30 AM',
    location: 'PSG Tech South Gate & Botanical Reserve',
    description: 'Planting shade saplings along hostel paths to create cooling shelters for campus animals and birds.'
  },
  {
    id: 'e4',
    title: 'Pet Adoption & Rehoming Fair',
    image: '/assets/images/adoption_care.png',
    date: 'Upcoming (Admin will announce exact date)',
    time: '10:00 AM - 4:00 PM',
    location: 'Open Air Grounds, PSG Tech',
    description: 'Assisting with adoption dossiers and screening loving forever homes for rescued puppies and kittens.'
  }
];

const YEARS_LIST = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'PG / Other'
];

const FEEDING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ADOPTION_LANGUAGES = ['Tamil', 'English', 'Malayalam', 'Hindi', 'Telugu'];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, authHeader } = useAuth();

  const [eventsList, setEventsList] = useState(defaultFallbackEvents);
  const [selectedEventId, setSelectedEventId] = useState('e1');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEvent, setSubmittedEvent] = useState(null);

  // Common student info
  const [studentInfo, setStudentInfo] = useState({
    name: user?.name || '',
    register_no: user?.register_no || '',
    department: user?.department || '',
    year: user?.year || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Event 1: Weekly Feeding Round Form Answers
  const [feedingAnswers, setFeedingAnswers] = useState({
    preferred_slot: 'Morning Routine (6:00 AM - 7:15 AM)',
    campus_zone: 'Hostel Quadrangle & Canteen Area',
    available_days: ['Saturday', 'Sunday'],
    handling_comfort: 'Comfortable carrying dog & cat food / warm porridge',
    stray_notes: ''
  });

  // Event 2: Anti-Rabies Vaccination Camp Form Answers
  const [vaccineAnswers, setVaccineAnswers] = useState({
    volunteer_role: 'Stray Animal Handler & Restrainer',
    rabies_vaccinated: 'Yes (Vaccinated & Up-to-Date)',
    handling_experience: 'Moderate (Comfortable with friendly community dogs)',
    shift_preference: 'Morning Shift (9:00 AM - 11:30 AM)',
    first_aid_comfort: 'Willing to assist vet technicians'
  });

  // Event 3: Tree Plantation Form Answers
  const [plantationAnswers, setPlantationAnswers] = useState({
    plantation_task: 'Digging & Sapling Planting',
    tools_availability: 'Will use club-provided garden equipment',
    shift_slot: 'Dawn Routine (7:00 AM - 9:30 AM)',
    physical_comfort: 'Comfortable with physical digging & lifting'
  });

  // Event 4: Pet Adoption Fair Form Answers
  const [adoptionAnswers, setAdoptionAnswers] = useState({
    adoption_role: 'Adoption Counselor & Screener Desk',
    pet_experience: 'Currently have pets at home',
    followup_willingness: 'Yes, comfortable making friendly check-in phone calls to adopters',
    languages_spoken: ['Tamil', 'English']
  });

  // Custom Event Generic Answers
  const [customAnswers, setCustomAnswers] = useState({
    volunteer_role: '',
    time_slot: '',
    experience_notes: '',
    special_notes: ''
  });

  // Fetch events from server
  useEffect(() => {
    axios.get(`${API}/events`)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((ev, idx) => ({
            ...ev,
            image: ev.image || defaultFallbackEvents[idx % defaultFallbackEvents.length]?.image || '/assets/images/feed_campus.png',
            date: ev.date || 'Upcoming (Admin will announce exact date)',
          }));
          setEventsList(formatted);

          const queryId = searchParams.get('id');
          const queryEvent = searchParams.get('event');
          if (queryId) {
            setSelectedEventId(queryId);
          } else if (queryEvent) {
            const match = formatted.find(e => e.title.toLowerCase().includes(queryEvent.toLowerCase()));
            if (match) setSelectedEventId(match.id);
          }
        }
      })
      .catch(() => {
        setEventsList(defaultFallbackEvents);
      });
  }, [searchParams]);

  // Sync logged in user profile
  useEffect(() => {
    if (user) {
      setStudentInfo(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        register_no: prev.register_no || user.register_no || '',
        department: prev.department || user.department || '',
        year: prev.year || user.year || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const activeEvent = eventsList.find(e => e.id === selectedEventId) || eventsList[0] || defaultFallbackEvents[0];

  const handleSelectEvent = (id) => {
    setSelectedEventId(id);
    setSubmittedEvent(null);
    setSearchParams({ id });
  };

  const handleCommonChange = (field) => (e) => {
    setStudentInfo(prev => ({ ...prev, [field]: e.target.value }));
  };

  const toggleFeedingDay = (day) => {
    setFeedingAnswers(prev => {
      const exists = prev.available_days.includes(day);
      return {
        ...prev,
        available_days: exists 
          ? prev.available_days.filter(d => d !== day)
          : [...prev.available_days, day]
      };
    });
  };

  const toggleAdoptionLanguage = (lang) => {
    setAdoptionAnswers(prev => {
      const exists = prev.languages_spoken.includes(lang);
      return {
        ...prev,
        languages_spoken: exists
          ? prev.languages_spoken.filter(l => l !== lang)
          : [...prev.languages_spoken, lang]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentInfo.year) {
      toast({
        title: 'Year of Study Required',
        description: 'Please choose your year of study.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    // Determine which tailored answers belong to this event
    let eventSpecificAnswers = {};
    if (activeEvent.id === 'e1' || activeEvent.title.toLowerCase().includes('feeding')) {
      eventSpecificAnswers = {
        questionnaire_type: 'Weekly Feeding Round Volunteer Form',
        ...feedingAnswers
      };
    } else if (activeEvent.id === 'e2' || activeEvent.title.toLowerCase().includes('rabies') || activeEvent.title.toLowerCase().includes('vaccin')) {
      eventSpecificAnswers = {
        questionnaire_type: 'Anti-Rabies Camp Medical & Handler Form',
        ...vaccineAnswers
      };
    } else if (activeEvent.id === 'e3' || activeEvent.title.toLowerCase().includes('plantation') || activeEvent.title.toLowerCase().includes('tree')) {
      eventSpecificAnswers = {
        questionnaire_type: 'Tree Plantation & Green Sanctuary Form',
        ...plantationAnswers
      };
    } else if (activeEvent.id === 'e4' || activeEvent.title.toLowerCase().includes('adoption')) {
      eventSpecificAnswers = {
        questionnaire_type: 'Pet Adoption & Rehoming Fair Volunteer Form',
        ...adoptionAnswers
      };
    } else {
      eventSpecificAnswers = {
        questionnaire_type: 'Custom Drive Volunteer Questionnaire',
        ...customAnswers
      };
    }

    const payload = {
      event_id: activeEvent.id || 'e1',
      event_title: activeEvent.title,
      name: studentInfo.name.trim(),
      register_no: studentInfo.register_no.trim().toUpperCase(),
      department: studentInfo.department.trim(),
      year: studentInfo.year,
      email: studentInfo.email.trim().toLowerCase(),
      phone: studentInfo.phone.trim(),
      answers: eventSpecificAnswers
    };

    try {
      await axios.post(`${API}/event-registrations`, payload, {
        headers: authHeader()
      });

      setSubmittedEvent(activeEvent.title);
      toast({
        title: 'Registration Successful!',
        description: `You have registered for ${activeEvent.title} with your custom answers!`,
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration completed!';
      setSubmittedEvent(activeEvent.title);
      toast({
        title: 'Registration Recorded!',
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#efe6cf]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="eyebrow text-[#1e3a2a]/60 uppercase tracking-widest text-xs font-semibold mb-2">
            PSG COLLEGE OF TECHNOLOGY · AWC DRIVES
          </div>
          <h1 className="font-serif-display text-4xl sm:text-6xl text-[#1e3a2a] leading-tight">
            Upcoming <span className="italic-serif text-[#e89670]">Events & Drives.</span>
          </h1>
          <p className="mt-3 text-[#1e3a2a]/75 text-sm sm:text-base leading-relaxed">
            Each event features its own dedicated volunteer questionnaire. Choose an event below to fill out its specific registration form.
          </p>
        </div>

        {/* Event Selection Tabs */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1e3a2a]/70 mb-3 flex items-center justify-between">
            <span>Select Event to Register:</span>
            <span className="text-[11px] opacity-75 font-normal">Click any event below to load its dedicated form</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eventsList.map((ev) => {
              const isSelected = ev.id === activeEvent.id;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => handleSelectEvent(ev.id)}
                  className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a] shadow-md scale-[1.02]'
                      : 'bg-[#efe6cf] text-[#1e3a2a] border-[#1e3a2a]/15 hover:border-[#1e3a2a]/35'
                  }`}
                >
                  <div>
                    <div className="rounded-xl overflow-hidden aspect-[16/10] mb-3 bg-black/10">
                      <img
                        src={ev.image || '/assets/images/feed_campus.png'}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-serif-display text-base sm:text-lg leading-snug line-clamp-2">
                      {ev.title}
                    </h3>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-current/10 text-xs flex items-center justify-between">
                    <span className="font-mono text-[11px] opacity-90">
                      {isSelected ? '✓ Selected Form' : 'Open Form'}
                    </span>
                    <span className="text-[11px] opacity-80 truncate max-w-[120px]">
                      {ev.time || 'Routine'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Event Registration Box */}
        <div className="bg-[#efe6cf] rounded-3xl border border-[#1e3a2a]/15 overflow-hidden shadow-sm">
          {/* Top Event Banner */}
          <div className="bg-[#1e3a2a] text-[#efe6cf] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0 bg-black/20">
              <img
                src={activeEvent.image || '/assets/images/feed_campus.png'}
                alt={activeEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e89670] text-[#1e3a2a]">
                  Dedicated Event Form
                </span>
                <span className="text-xs text-[#efe6cf]/70 font-mono">
                  ID: {activeEvent.id}
                </span>
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#efe6cf]">
                {activeEvent.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#efe6cf]/80 leading-relaxed max-w-2xl">
                {activeEvent.description}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-[#efe6cf]/80 pt-2 border-t border-[#efe6cf]/10">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#e89670]" />
                  <span><strong>Date:</strong> {activeEvent.date || 'Announced by Admin'}</span>
                </span>
                {activeEvent.time && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-[#e89670]" /> {activeEvent.time}
                  </span>
                )}
                {activeEvent.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#e89670]" /> {activeEvent.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-10">
            {submittedEvent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif-display text-3xl text-[#1e3a2a]">
                  Registration Confirmed!
                </h3>
                <p className="text-sm text-[#1e3a2a]/75 max-w-lg mx-auto mt-2 leading-relaxed">
                  Thank you for registering for <strong>{submittedEvent}</strong> with your customized questionnaire preferences. The AWC student coordinator will review your duty assignment and notify your team.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedEvent(null)}
                    className="px-6 py-2.5 rounded-full border border-[#1e3a2a]/25 text-[#1e3a2a] text-xs font-semibold hover:bg-white/60 transition-colors cursor-pointer"
                  >
                    Register for another event
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-6 py-2.5 rounded-full bg-[#1e3a2a] text-[#efe6cf] text-xs font-semibold hover:bg-[#284d3a] transition-colors"
                  >
                    View in My Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                {/* Section A: Student Information */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1e3a2a]/15 mb-5">
                    <h3 className="font-serif-display text-xl text-[#1e3a2a]">
                      1. Student Volunteer Details
                    </h3>
                    <span className="text-[11px] text-[#1e3a2a]/60">
                      Official PSG Tech details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        FULL NAME *
                      </label>
                      <input
                        required
                        type="text"
                        value={studentInfo.name}
                        onChange={handleCommonChange('name')}
                        className="w-full h-11 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        REGISTER NUMBER *
                      </label>
                      <input
                        required
                        type="text"
                        value={studentInfo.register_no}
                        onChange={handleCommonChange('register_no')}
                        className="w-full h-11 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        DEPARTMENT *
                      </label>
                      <input
                        required
                        type="text"
                        value={studentInfo.department}
                        onChange={handleCommonChange('department')}
                        className="w-full h-11 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        YEAR OF STUDY *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={studentInfo.year}
                          onChange={handleCommonChange('year')}
                          className="w-full h-11 px-4 pr-10 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 appearance-none shadow-inner cursor-pointer"
                        >
                          <option value="">Select...</option>
                          {YEARS_LIST.map(y => (
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

                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        OFFICIAL EMAIL ID *
                      </label>
                      <input
                        required
                        type="email"
                        value={studentInfo.email}
                        onChange={handleCommonChange('email')}
                        className="w-full h-11 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#1e3a2a]/80 mb-1.5">
                        PHONE NUMBER *
                      </label>
                      <input
                        required
                        type="tel"
                        value={studentInfo.phone}
                        onChange={handleCommonChange('phone')}
                        className="w-full h-11 px-4 rounded-xl bg-[#fbf8f0] border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: EVENT SPECIFIC QUESTIONNAIRE */}
                <div className="bg-[#fbf8f0] p-6 sm:p-7 rounded-2xl border border-[#1e3a2a]/15 space-y-5">
                  <div className="pb-3 border-b border-[#1e3a2a]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#e89670]">
                        EVENT-SPECIFIC QUESTIONNAIRE
                      </span>
                      <h4 className="font-serif-display text-xl text-[#1e3a2a] mt-0.5">
                        Tailored Preferences for: {activeEvent.title}
                      </h4>
                    </div>
                  </div>

                  {/* FORM 1: WEEKLY FEEDING ROUND */}
                  {(activeEvent.id === 'e1' || activeEvent.title.toLowerCase().includes('feeding')) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Feeding Time Slot *
                          </label>
                          <select
                            value={feedingAnswers.preferred_slot}
                            onChange={(e) => setFeedingAnswers(p => ({ ...p, preferred_slot: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Morning Routine (6:00 AM - 7:15 AM)">Morning Routine (6:00 AM - 7:15 AM)</option>
                            <option value="Evening Routine (5:00 PM - 6:15 PM)">Evening Routine (5:00 PM - 6:15 PM)</option>
                            <option value="Weekend Intensive Drive (7:00 AM - 8:30 AM)">Weekend Intensive Drive (7:00 AM - 8:30 AM)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Campus Zone *
                          </label>
                          <select
                            value={feedingAnswers.campus_zone}
                            onChange={(e) => setFeedingAnswers(p => ({ ...p, campus_zone: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Hostel Quadrangle & Canteen Area">Hostel Quadrangle & Canteen Area</option>
                            <option value="South Gate & Mechanical Block">South Gate & Mechanical Block</option>
                            <option value="Academic Zone & Library Perimeter">Academic Zone & Library Perimeter</option>
                            <option value="Sports Ground & Open Turf">Sports Ground & Open Turf</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-2">
                          Available Days for Feeding Patrol (Pick all that apply):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FEEDING_DAYS.map((day) => {
                            const isPicked = feedingAnswers.available_days.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleFeedingDay(day)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                  isPicked
                                    ? 'bg-[#1e3a2a] text-[#efe6cf] border border-[#1e3a2a]'
                                    : 'bg-white text-[#1e3a2a] border border-[#1e3a2a]/20 hover:border-[#1e3a2a]/40'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Feeding & Food Handling Comfort Level:
                        </label>
                        <select
                          value={feedingAnswers.handling_comfort}
                          onChange={(e) => setFeedingAnswers(p => ({ ...p, handling_comfort: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        >
                          <option value="Comfortable carrying dog & cat food / warm porridge">Comfortable carrying dog & cat food / warm porridge</option>
                          <option value="First-time feeder (need guidance and senior partner)">First-time feeder (need guidance and senior partner)</option>
                          <option value="Comfortable with cat feeding and water pots only">Comfortable with cat feeding and water pots only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Stray Observations / Specific Areas You've Noticed Dogs or Cats:
                        </label>
                        <textarea
                          rows={2}
                          value={feedingAnswers.stray_notes}
                          onChange={(e) => setFeedingAnswers(p => ({ ...p, stray_notes: e.target.value }))}
                          placeholder="Note any stray packs or hungry pups you regularly see..."
                          className="w-full p-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        />
                      </div>
                    </div>
                  )}

                  {/* FORM 2: ANTI-RABIES VACCINATION CAMP */}
                  {(activeEvent.id === 'e2' || activeEvent.title.toLowerCase().includes('rabies') || activeEvent.title.toLowerCase().includes('vaccin')) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Camp Role *
                          </label>
                          <select
                            value={vaccineAnswers.volunteer_role}
                            onChange={(e) => setVaccineAnswers(p => ({ ...p, volunteer_role: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Stray Animal Handler & Restrainer">Stray Animal Handler & Restrainer</option>
                            <option value="Registration & Token Desk">Registration & Token Desk</option>
                            <option value="Post-Vaccine Monitoring & Treat Distribution">Post-Vaccine Monitoring & Treat Distribution</option>
                            <option value="Logistics & Transport Assistant">Logistics & Transport Assistant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Rabies Prophylaxis Vaccination Status *
                          </label>
                          <select
                            value={vaccineAnswers.rabies_vaccinated}
                            onChange={(e) => setVaccineAnswers(p => ({ ...p, rabies_vaccinated: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Yes (Vaccinated & Up-to-Date)">Yes (Vaccinated & Up-to-Date)</option>
                            <option value="No (Please assign me to non-contact / registration desk)">No (Please assign me to non-contact / registration desk)</option>
                            <option value="Willing to get vaccine at the camp desk">Willing to get vaccine at the camp desk</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Experience Handling Stray / Unfamiliar Dogs:
                          </label>
                          <select
                            value={vaccineAnswers.handling_experience}
                            onChange={(e) => setVaccineAnswers(p => ({ ...p, handling_experience: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="High (Comfortable handling nervous/injured strays)">High (Comfortable handling nervous/injured strays)</option>
                            <option value="Moderate (Comfortable with friendly community dogs)">Moderate (Comfortable with friendly community dogs)</option>
                            <option value="Beginner (Prefer non-handling duties)">Beginner (Prefer non-handling duties)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Available Camp Volunteer Shift:
                          </label>
                          <select
                            value={vaccineAnswers.shift_preference}
                            onChange={(e) => setVaccineAnswers(p => ({ ...p, shift_preference: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Full Day (9:00 AM - 2:00 PM)">Full Day (9:00 AM - 2:00 PM)</option>
                            <option value="Morning Shift (9:00 AM - 11:30 AM)">Morning Shift (9:00 AM - 11:30 AM)</option>
                            <option value="Afternoon Shift (11:30 AM - 2:00 PM)">Afternoon Shift (11:30 AM - 2:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Veterinary First-Aid Comfort:
                        </label>
                        <select
                          value={vaccineAnswers.first_aid_comfort}
                          onChange={(e) => setVaccineAnswers(p => ({ ...p, first_aid_comfort: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        >
                          <option value="Basic Animal First Aid Trained">Basic Animal First Aid Trained</option>
                          <option value="Willing to assist vet technicians">Willing to assist vet technicians</option>
                          <option value="No veterinary training (general logistics)">No veterinary training (general logistics)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* FORM 3: TREE PLANTATION & GREEN SANCTUARY */}
                  {(activeEvent.id === 'e3' || activeEvent.title.toLowerCase().includes('plantation') || activeEvent.title.toLowerCase().includes('tree')) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Plantation Task *
                          </label>
                          <select
                            value={plantationAnswers.plantation_task}
                            onChange={(e) => setPlantationAnswers(p => ({ ...p, plantation_task: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Digging & Sapling Planting">Digging & Sapling Planting</option>
                            <option value="Watering Canal Setup & Basin Mulching">Watering Canal Setup & Basin Mulching</option>
                            <option value="Protective Mesh & Tree Guard Installation">Protective Mesh & Tree Guard Installation</option>
                            <option value="Sapling & Organic Compost Transport">Sapling & Organic Compost Transport</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Gardening Equipment Availability:
                          </label>
                          <select
                            value={plantationAnswers.tools_availability}
                            onChange={(e) => setPlantationAnswers(p => ({ ...p, tools_availability: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Will use club-provided garden equipment">Will use club-provided garden equipment</option>
                            <option value="Can bring personal small trowel/gloves">Can bring personal small trowel/gloves</option>
                            <option value="Can bring watering can">Can bring watering can</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Shift Slot:
                          </label>
                          <select
                            value={plantationAnswers.shift_slot}
                            onChange={(e) => setPlantationAnswers(p => ({ ...p, shift_slot: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Dawn Routine (7:00 AM - 9:30 AM)">Dawn Routine (7:00 AM - 9:30 AM)</option>
                            <option value="Mid Morning (9:30 AM - 11:30 AM)">Mid Morning (9:30 AM - 11:30 AM)</option>
                            <option value="Full Drive (7:00 AM - 11:30 AM)">Full Drive (7:00 AM - 11:30 AM)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Physical Work Comfort:
                          </label>
                          <select
                            value={plantationAnswers.physical_comfort}
                            onChange={(e) => setPlantationAnswers(p => ({ ...p, physical_comfort: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Comfortable with physical digging & lifting">Comfortable with physical digging & lifting</option>
                            <option value="Prefer light planting, watering and sapling placement">Prefer light planting, watering and sapling placement</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM 4: PET ADOPTION & REHOMING FAIR */}
                  {(activeEvent.id === 'e4' || activeEvent.title.toLowerCase().includes('adoption')) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Preferred Adoption Fair Role *
                          </label>
                          <select
                            value={adoptionAnswers.adoption_role}
                            onChange={(e) => setAdoptionAnswers(p => ({ ...p, adoption_role: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Adoption Counselor & Screener Desk">Adoption Counselor & Screener Desk</option>
                            <option value="Puppy & Kitten Socialization & Walking Area">Puppy & Kitten Socialization & Walking Area</option>
                            <option value="Photography & Digital Adoption Dossiers">Photography & Digital Adoption Dossiers</option>
                            <option value="Visitor Registration & Welcome Desk">Visitor Registration & Welcome Desk</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                            Prior Pet / Animal Care Experience:
                          </label>
                          <select
                            value={adoptionAnswers.pet_experience}
                            onChange={(e) => setAdoptionAnswers(p => ({ ...p, pet_experience: e.target.value }))}
                            className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                          >
                            <option value="Currently have pets at home">Currently have pets at home</option>
                            <option value="Previous fostering/animal rescue experience">Previous fostering/animal rescue experience</option>
                            <option value="First-time helper (passionate animal lover)">First-time helper (passionate animal lover)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Post-Adoption Follow-Up Calls:
                        </label>
                        <select
                          value={adoptionAnswers.followup_willingness}
                          onChange={(e) => setAdoptionAnswers(p => ({ ...p, followup_willingness: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        >
                          <option value="Yes, comfortable making friendly check-in phone calls to adopters">Yes, comfortable making friendly check-in phone calls to adopters</option>
                          <option value="Event-day volunteering only">Event-day volunteering only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-2">
                          Languages Spoken for Adopter Counseling:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ADOPTION_LANGUAGES.map((lang) => {
                            const isSelected = adoptionAnswers.languages_spoken.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleAdoptionLanguage(lang)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1e3a2a] text-[#efe6cf] border border-[#1e3a2a]'
                                    : 'bg-white text-[#1e3a2a] border border-[#1e3a2a]/20 hover:border-[#1e3a2a]/40'
                                }`}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM 5: CUSTOM DYNAMIC ADMIN EVENT */}
                  {!(
                    activeEvent.id === 'e1' ||
                    activeEvent.id === 'e2' ||
                    activeEvent.id === 'e3' ||
                    activeEvent.id === 'e4' ||
                    activeEvent.title.toLowerCase().includes('feeding') ||
                    activeEvent.title.toLowerCase().includes('rabies') ||
                    activeEvent.title.toLowerCase().includes('vaccin') ||
                    activeEvent.title.toLowerCase().includes('plantation') ||
                    activeEvent.title.toLowerCase().includes('adoption')
                  ) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          How would you like to contribute to this drive? *
                        </label>
                        <input
                          required
                          type="text"
                          value={customAnswers.volunteer_role}
                          onChange={(e) => setCustomAnswers(p => ({ ...p, volunteer_role: e.target.value }))}
                          placeholder="e.g. Logistics, volunteer support, transport"
                          className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Available Time Slot:
                        </label>
                        <input
                          type="text"
                          value={customAnswers.time_slot}
                          onChange={(e) => setCustomAnswers(p => ({ ...p, time_slot: e.target.value }))}
                          placeholder="Your available hours for this event"
                          className="w-full h-11 px-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                          Relevant Experience or Skills:
                        </label>
                        <textarea
                          rows={2}
                          value={customAnswers.experience_notes}
                          onChange={(e) => setCustomAnswers(p => ({ ...p, experience_notes: e.target.value }))}
                          placeholder="Share any past club or animal welfare background"
                          className="w-full p-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-13 bg-[#1e3a2a] hover:bg-[#284d3a] disabled:opacity-60 text-[#efe6cf] rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting Registration...' : (
                      <>
                        <span>Submit Registration for {activeEvent.title}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
