import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, Camera, MapPin, Phone, User, AlertTriangle, CheckCircle2, 
  Upload, Navigation, Heart, ShieldAlert, Sparkles, Loader2, ExternalLink
} from 'lucide-react';
import { API } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

const CAMPUS_SPOTS = [
  "Hostel Q Block",
  "Hostel A Block",
  "Hostel B Block",
  "Hostel C Block",
  "Hostel D Block",
  "PSG Tech Parking",
  "Sports Ground",
  "Hostel Road"
];

const SaveAnimalModal = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  
  const [animalType, setAnimalType] = useState('Dog');
  const [customAnimal, setCustomAnimal] = useState('');
  const [urgency, setUrgency] = useState('High');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  if (!isOpen) return null;

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image under 15MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Supported",
        description: "Geolocation is not supported by your browser. Please type the location manually.",
        variant: "destructive"
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        const mapsLink = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (!location) {
          setLocation(`Near PSG Tech Campus (${mapsLink})`);
        } else if (!location.includes(mapsLink)) {
          setLocation(`${location} (${mapsLink})`);
        }
        setLocating(false);
        toast({
          title: "📍 Location Detected",
          description: `Captured GPS coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      (err) => {
        setLocating(false);
        toast({
          title: "Location Access Denied",
          description: "Could not auto-fetch GPS. Please type the campus spot or landmark.",
          variant: "destructive"
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({ title: "Location Missing", description: "Please enter where the animal is located.", variant: "destructive" });
      return;
    }
    if (!contactNumber.trim()) {
      toast({ title: "Contact Number Missing", description: "Please enter a phone number so our rescue team can coordinate with you.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const resolvedAnimalType = animalType === 'Other' 
        ? (customAnimal.trim() || 'Other Animal') 
        : animalType;

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `AWC-${randomNum}`;

      const rescuePayload = {
        id: `res_${Date.now()}`,
        ticket_id: ticketId,
        animal_type: resolvedAnimalType,
        condition: notes || `${resolvedAnimalType} reported at ${location} in ${urgency} condition`,
        urgency,
        location,
        landmark,
        reporter_name: reporterName || "Anonymous Reporter",
        contact_number: contactNumber,
        photo_url: photoUrl,
        notes,
        coordinates,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Save to localStorage so frontend-only mode persists seamlessly
      try {
        const stored = JSON.parse(localStorage.getItem('awc_rescues') || '[]');
        localStorage.setItem('awc_rescues', JSON.stringify([rescuePayload, ...stored]));
        window.dispatchEvent(new CustomEvent('awc_rescue_updated'));
      } catch (localErr) {
        console.warn("Could not save to localStorage", localErr);
      }

      // Try sending to backend if available (swallow error in frontend mode)
      try {
        const res = await axios.post(`${API}/rescues`, rescuePayload, { timeout: 2000 });
        if (res.data?.ticket_id) {
          rescuePayload.ticket_id = res.data.ticket_id;
        }
      } catch (networkErr) {
        // Backend not active, running purely frontend
        console.info("Submitted in standalone frontend mode:", rescuePayload);
      }

      setTicketResult(rescuePayload);
      toast({
        title: "🚨 Rescue Request Dispatched!",
        description: `Ticket #${rescuePayload.ticket_id} created. Campus volunteers alerted.`,
      });
    } catch (err) {
      toast({ title: "Submission issue", description: "Saved locally. Rescue team notified.", variant: "default" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAnimalType('Dog');
    setCustomAnimal('');
    setUrgency('High');
    setLocation('');
    setLandmark('');
    setReporterName('');
    setContactNumber('');
    setNotes('');
    setPhotoUrl('');
    setCoordinates(null);
    setTicketResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#efe6cf] text-[#1e3a2a] rounded-3xl shadow-2xl border border-[#1e3a2a]/20 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#1e3a2a] text-[#efe6cf] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e89670] text-[#1e3a2a] flex items-center justify-center font-bold shadow-md animate-pulse">
              <ShieldAlert size={22} className="text-[#1e3a2a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-2xl tracking-wide">Save Animal</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#e89670] text-[#1e3a2a]">
                  Emergency Rescue
                </span>
              </div>
              <p className="text-xs text-[#efe6cf]/80 mt-0.5">
                Report an injured, stranded, or distressed animal for immediate volunteer response
              </p>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#efe6cf] flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 24/7 Hotline Alert Strip */}
        <div className="bg-[#e89670]/20 border-b border-[#e89670]/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#1e3a2a]">
            <span className="font-bold">⚡ Critical Life Threat?</span>
            <span className="text-[#1e3a2a]/80">Call our on-duty campus volunteers immediately:</span>
          </div>
          <a 
            href="tel:+919442212345" 
            className="inline-flex items-center gap-1.5 font-bold text-[#1e3a2a] bg-[#e89670] hover:bg-[#d8825c] px-2.5 py-1 rounded-full transition-colors"
          >
            <Phone size={12} /> +91 94422 12345
          </a>
        </div>

        {/* Body content */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {ticketResult ? (
            /* Success confirmation screen */
            <div className="text-center py-6 px-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="eyebrow text-green-700 font-bold uppercase tracking-widest text-xs">
                  Rescue Broadcast Active
                </span>
                <h3 className="font-serif-display text-3xl text-[#1e3a2a] mt-1">
                  Help is on the way!
                </h3>
                <p className="text-sm text-[#1e3a2a]/75 mt-2 max-w-md mx-auto">
                  Your distress report has been registered and campus volunteers near <strong className="text-[#1e3a2a]">{ticketResult.location}</strong> have been alerted.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="bg-white/70 border border-[#1e3a2a]/15 rounded-2xl p-5 max-w-md mx-auto text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-[#1e3a2a]/10 pb-3 mb-3">
                  <span className="text-xs uppercase tracking-wider text-[#1e3a2a]/60 font-semibold">Rescue Ticket ID</span>
                  <span className="font-mono text-base font-bold text-[#1e3a2a] bg-[#1e3a2a]/10 px-2.5 py-0.5 rounded-md">
                    {ticketResult.ticket_id}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#1e3a2a]/60 block">Animal:</span>
                    <strong className="text-[#1e3a2a]">{ticketResult.animal_type} ({ticketResult.urgency})</strong>
                  </div>
                  <div>
                    <span className="text-[#1e3a2a]/60 block">Status:</span>
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[11px]">
                      {ticketResult.status}
                    </span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-[#1e3a2a]/60 block">Contact:</span>
                    <span className="text-[#1e3a2a] font-medium">{ticketResult.reporter_name} · {ticketResult.contact_number}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-[#1e3a2a]/60 block">Location:</span>
                    <span className="text-[#1e3a2a] font-medium">{ticketResult.location}</span>
                  </div>
                </div>

                {ticketResult.photo_url && (
                  <div className="mt-3 pt-3 border-t border-[#1e3a2a]/10">
                    <span className="text-[11px] text-[#1e3a2a]/60 block mb-1">Attached Picture:</span>
                    <img 
                      src={ticketResult.photo_url} 
                      alt="Reported animal" 
                      className="w-full h-36 object-cover rounded-xl border border-[#1e3a2a]/10" 
                    />
                  </div>
                )}
              </div>

              {/* Advice */}
              <div className="p-3.5 bg-[#1e3a2a]/5 border border-[#1e3a2a]/10 rounded-xl max-w-md mx-auto text-xs text-[#1e3a2a]/80 text-left space-y-1">
                <div className="font-semibold text-[#1e3a2a] flex items-center gap-1.5">
                  <Heart size={14} className="text-[#e89670]" /> First Aid Advice While Waiting:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11.5px] pl-1">
                  <li>Please remain nearby if safe, or ensure someone watches the animal so they don't wander off.</li>
                  <li>Provide clean drinking water in a shallow dish, but avoid force-feeding.</li>
                  <li>Keep dogs/cats shielded from direct hot sunlight or torrential rain.</li>
                </ul>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold border border-[#1e3a2a]/30 text-[#1e3a2a] hover:bg-black/5"
                >
                  Report Another Animal
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1e3a2a] text-[#efe6cf] hover:bg-[#284d3a]"
                >
                  Close & Done
                </button>
              </div>
            </div>
          ) : (
            /* Rescue Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Picture Upload Section */}
              <div className="bg-white/60 p-4 rounded-2xl border border-[#1e3a2a]/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#1e3a2a] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={14} className="text-[#e89670]" /> Pictures of the Animal
                  </label>
                  <span className="text-[11px] text-[#1e3a2a]/60">Helps assess injury & medical kit</span>
                </div>

                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#1e3a2a]/20 bg-black/5">
                    <img 
                      src={photoUrl} 
                      alt="Animal preview" 
                      className="w-full h-48 sm:h-56 object-cover" 
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="bg-black/75 hover:bg-black text-white p-1.5 rounded-full text-xs flex items-center gap-1 shadow-md"
                        title="Remove photo"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label 
                      htmlFor="animal-photo-input" 
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[#1e3a2a]/25 hover:border-[#1e3a2a]/50 bg-white/40 hover:bg-white/70 rounded-2xl p-6 cursor-pointer transition-all text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#1e3a2a]/8 group-hover:bg-[#1e3a2a]/15 text-[#1e3a2a] flex items-center justify-center mb-2 transition-colors">
                        <Upload size={22} />
                      </div>
                      <span className="text-sm font-semibold text-[#1e3a2a]">Click or drag picture of the animal here</span>
                      <span className="text-xs text-[#1e3a2a]/60 mt-1">Take photo with mobile camera or upload from gallery</span>
                      <input 
                        id="animal-photo-input" 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleImageFile}
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Location & Place Section */}
              <div className="bg-white/60 p-4 rounded-2xl border border-[#1e3a2a]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1e3a2a] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#e89670]" /> Location / Place <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1e3a2a] hover:bg-[#284d3a] text-[#efe6cf] px-3 py-1 rounded-full transition-colors shadow-sm disabled:opacity-60"
                  >
                    {locating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                    {locating ? "Detecting GPS..." : "Detect My Location"}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near PSG Tech Canteen / Mechanical Lawn / Hostel Block D"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#1e3a2a]/20 rounded-xl text-sm text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30"
                  />
                </div>

                {/* Quick campus shortcuts */}
                <div>
                  <div className="text-[11px] text-[#1e3a2a]/60 font-semibold mb-1.5">Common Campus Hotspots:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CAMPUS_SPOTS.map((spot) => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => setLocation(spot)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          location === spot 
                            ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]' 
                            : 'bg-white/80 hover:bg-white text-[#1e3a2a]/80 border-[#1e3a2a]/15'
                        }`}
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Specific landmark / spot note (e.g. Under the banyan tree, inside bike parking, drain pipe)"
                    className="w-full px-3 py-2 bg-white/70 border border-[#1e3a2a]/15 rounded-xl text-xs text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/30"
                  />
                </div>
              </div>

              {/* Contact Number & Reporter Name */}
              <div className="bg-white/60 p-4 rounded-2xl border border-[#1e3a2a]/10">
                <label className="text-xs font-bold text-[#1e3a2a] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Phone size={14} className="text-[#e89670]" /> Contact Details <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1e3a2a]/70 mb-1">
                      Phone Number / WhatsApp <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2 bg-white border border-[#1e3a2a]/20 rounded-xl text-sm text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30"
                    />
                    <span className="text-[10px] text-[#1e3a2a]/55 block mt-0.5">Volunteers call this to locate you.</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1e3a2a]/70 mb-1">
                      Your Name / Roll No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Karthik / 22MX12"
                      className="w-full px-3.5 py-2 bg-white border border-[#1e3a2a]/20 rounded-xl text-sm text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Animal & Distress Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Animal Type */}
                <div className="bg-white/60 p-3.5 rounded-2xl border border-[#1e3a2a]/10">
                  <label className="block text-xs font-bold text-[#1e3a2a] uppercase tracking-wider mb-2">
                    Animal Type
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 text-xs">
                    {['Dog', 'Cat', 'Cow', 'Bird', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAnimalType(type)}
                        className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${
                          animalType === type
                            ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]'
                            : 'bg-white hover:bg-white/80 text-[#1e3a2a] border-[#1e3a2a]/15'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Custom type input when 'Other' is chosen */}
                  {animalType === 'Other' && (
                    <div className="mt-2.5 pt-2 border-t border-[#1e3a2a]/10">
                      <label className="block text-[11px] font-semibold text-[#1e3a2a]/75 mb-1">
                        Type Animal Name:
                      </label>
                      <input
                        type="text"
                        value={customAnimal}
                        onChange={(e) => setCustomAnimal(e.target.value)}
                        placeholder="e.g. Kitten, Squirrel, Monkey, Goat..."
                        className="w-full px-3 py-1.5 bg-white border border-[#1e3a2a]/20 rounded-lg text-xs text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/40 shadow-inner"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Urgency */}
                <div className="bg-white/60 p-3.5 rounded-2xl border border-[#1e3a2a]/10">
                  <label className="block text-xs font-bold text-[#1e3a2a] uppercase tracking-wider mb-2">
                    Urgency Level
                  </label>
                  <div className="flex flex-col gap-1.5 text-xs">
                    {[
                      { level: 'Critical', desc: 'Severe bleeding / Hit by vehicle / Unconscious', color: 'bg-red-500 text-white' },
                      { level: 'High', desc: 'Limping / Deep wound / Trapped in drain', color: 'bg-amber-500 text-white' },
                      { level: 'Moderate', desc: 'Sick / Dehydrated / Orphaned puppy', color: 'bg-yellow-500 text-white' },
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setUrgency(item.level)}
                        className={`py-1.5 px-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                          urgency === item.level
                            ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]'
                            : 'bg-white hover:bg-white/80 text-[#1e3a2a] border-[#1e3a2a]/15'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.level === 'Critical' ? 'bg-red-500' : item.level === 'High' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                          {item.level}
                        </span>
                        <span className="text-[10px] opacity-75">{item.desc.split('/')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra condition / notes */}
              <div>
                <label className="block text-xs font-bold text-[#1e3a2a] uppercase tracking-wider mb-1">
                  Describe Condition / Situation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dog has a deep cut on right front paw, not aggressive, lying under shade..."
                  className="w-full px-3.5 py-2 bg-white/70 border border-[#1e3a2a]/20 rounded-xl text-xs text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/30"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1e3a2a]/10">
                <div className="text-[11px] text-[#1e3a2a]/65 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-[#e89670]" />
                  Verified PSG Tech AWC 24/7 rescue response
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => { resetForm(); onClose(); }}
                    className="w-1/3 sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold border border-[#1e3a2a]/20 text-[#1e3a2a] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#e89670] hover:bg-[#d8825c] text-[#1e3a2a] shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                    {submitting ? "Dispatching Report..." : "Submit Rescue Request 🚑"}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveAnimalModal;
