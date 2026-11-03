import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageSquareQuote, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { API, useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const activitiesList = [
  'Campus Feeding',
  'Emergency Rescue',
  'Pet Adoption',
  'Vaccination Camps',
  'Awareness Programs',
  'Tree Plantation',
  'General Club Query'
];

const queryTypes = [
  { value: 'Emergency Rescue / Animal Distress', label: '🚨 Emergency Rescue / Animal Distress' },
  { value: 'Feeding Schedule & Spots', label: '🥣 Feeding Schedule & Spots' },
  { value: 'Vaccination Camp Inquiry', label: '💉 Vaccination Camp Inquiry' },
  { value: 'Adoption & Fostering', label: '🐾 Adoption & Fostering' },
  { value: 'Volunteer Query', label: '🤝 Volunteer Query' },
  { value: 'General Question & Feedback', label: '💬 General Question & Feedback' },
];

const urgencies = [
  { value: 'low', label: 'Low - General question (reply in 2-3 days)' },
  { value: 'medium', label: 'Medium - Need info this week' },
  { value: 'high', label: 'High - Time-sensitive matter (today)' },
  { value: 'critical', label: 'Critical - Injured animal emergency' },
];

const Queries = () => {
  const [searchParams] = useSearchParams();
  const initialActivity = searchParams.get('activity') || '';
  const { user } = useAuth();
  const { toast } = useToast();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState(null);
  const [filterActivity, setFilterActivity] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine'

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    activity_title: initialActivity || 'Campus Feeding',
    query_type: initialActivity === 'Emergency Rescue' ? 'Emergency Rescue / Animal Distress' : 'General Question & Feedback',
    subject: '',
    description: '',
    location: '',
    urgency: initialActivity === 'Emergency Rescue' ? 'high' : 'medium',
  });

  // Keep user profile populated if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Sync initialActivity from URL query param if present
  useEffect(() => {
    if (initialActivity) {
      setFormData((prev) => ({
        ...prev,
        activity_title: initialActivity,
        query_type: initialActivity === 'Emergency Rescue' ? 'Emergency Rescue / Animal Distress' : prev.query_type,
        urgency: initialActivity === 'Emergency Rescue' ? 'high' : prev.urgency,
      }));
    }
  }, [initialActivity]);

  const loadQueries = () => {
    axios.get(`${API}/queries`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setQueries(res.data);
        }
      })
      .catch((err) => console.error('Failed to load queries:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueries();
    const interval = setInterval(loadQueries, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (field) => (e) => {
    const val = typeof e === 'string' ? e : e?.target?.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await axios.post(`${API}/queries`, formData);
      setSubmittedQuery(res.data);
      toast({
        title: 'Query Submitted Successfully!',
        description: 'Our AWC coordinator team has received your query and will reply promptly.',
      });
      // Refresh queries list
      loadQueries();
      // Reset form fields
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        activity_title: formData.activity_title,
        query_type: 'General Question & Feedback',
        subject: '',
        description: '',
        location: '',
        urgency: 'medium',
      });
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err?.response?.data?.detail || 'Could not submit your query. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const filteredQueries = queries.filter((q) => {
    const matchActivity = filterActivity === 'All' || q.activity_title === filterActivity;
    const matchSearch = !searchKeyword || 
      q.subject?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      q.location?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    if (activeTab === 'mine') {
      const matchMine = user && (q.user_id === user.id || (q.email && q.email.toLowerCase() === user.email.toLowerCase()));
      return matchMine && matchActivity && matchSearch;
    }
    return matchActivity && matchSearch;
  });

  return (
    <div className="pt-32 pb-24">
      {/* Header section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-10 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e3a2a]/10 text-[#1e3a2a] text-xs font-semibold tracking-wider uppercase mb-4">
          <HelpCircle size={14} className="text-[#e89670]" /> Activities Help & Queries Desk
        </div>
        <h1 className="font-serif-display text-[46px] md:text-[76px] leading-[1.02] text-[#1e3a2a]">
          Have a question or <span className="italic-serif text-[#e89670]">report?</span>
        </h1>
        <p className="mt-5 text-[17px] md:text-[18px] text-[#1e3a2a]/75 max-w-2xl leading-relaxed">
          Need details about our daily feeding spots, vaccination camps, tree drives, or spotted an injured animal on campus? Ask your queries and report field updates directly to our student coordinators.
        </p>

        {/* Emergency Alert Banner */}
        <div className="mt-8 p-5 bg-[#e89670]/15 border border-[#e89670]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={24} className="text-[#e89670] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1e3a2a] text-[15px]">Urgent Stray Animal Emergency on Campus?</div>
              <div className="text-[13.5px] text-[#1e3a2a]/80">
                For life-threatening injuries or immediate transport, call the AWC 24/7 rescue line: <strong>+91 98421 AWC-PSG</strong> or mark urgency as <em>Critical</em> below.
              </div>
            </div>
          </div>
          <a
            href="tel:+919842129274"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a2a] text-[#efe6cf] rounded-full text-xs font-medium hover:bg-[#284d3a] transition-colors flex-shrink-0"
          >
            <Phone size={13} /> Call Rescue Team
          </a>
        </div>
      </section>

      {/* Main Grid: Form on left, Query Tracker on right */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-6">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Submission Form */}
          <div className="lg:col-span-5 bg-[#efe6cf] border border-[#1e3a2a]/15 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e3a2a]/10">
              <div>
                <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Submit Query / Report</h2>
                <p className="text-xs text-[#1e3a2a]/65 mt-0.5">We review and respond to all student submissions.</p>
              </div>
              <MessageSquareQuote size={24} className="text-[#e89670]" />
            </div>

            {submittedQuery && (
              <div className="my-5 p-4 bg-[#1e3a2a]/10 border border-[#1e3a2a]/20 rounded-2xl text-xs text-[#1e3a2a] flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#1e3a2a] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Query #{submittedQuery.id} recorded!</strong>
                  <p className="mt-1 text-[#1e3a2a]/80">Subject: "{submittedQuery.subject}". Our coordinator team will review this shortly.</p>
                  <button 
                    onClick={() => setSubmittedQuery(null)} 
                    className="mt-2 text-[#e89670] underline font-medium hover:text-[#1e3a2a]"
                  >
                    Ask another query
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                  Related Activity / Initiative *
                </Label>
                <Select value={formData.activity_title} onValueChange={handleChange('activity_title')}>
                  <SelectTrigger className="bg-white/80 border-[#1e3a2a]/20 h-11 rounded-xl text-sm">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activitiesList.map((act) => (
                      <SelectItem key={act} value={act}>{act}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                  Query Category *
                </Label>
                <Select value={formData.query_type} onValueChange={handleChange('query_type')}>
                  <SelectTrigger className="bg-white/80 border-[#1e3a2a]/20 h-11 rounded-xl text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {queryTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                  Subject / Summary *
                </Label>
                <Input
                  required
                  placeholder="e.g., Question about Saturday feeding slot"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  className="bg-white/80 border-[#1e3a2a]/20 h-11 rounded-xl text-sm"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                  Detailed Query / Incident Notes *
                </Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Describe your query, sighting, or report in detail..."
                  value={formData.description}
                  onChange={handleChange('description')}
                  className="bg-white/80 border-[#1e3a2a]/20 rounded-xl text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                    Campus Location
                  </Label>
                  <Input
                    placeholder="e.g. Mech lab / Hostel B"
                    value={formData.location}
                    onChange={handleChange('location')}
                    className="bg-white/80 border-[#1e3a2a]/20 h-11 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-[#1e3a2a]/70 font-semibold mb-1.5 block">
                    Urgency Level
                  </Label>
                  <Select value={formData.urgency} onValueChange={handleChange('urgency')}>
                    <SelectTrigger className="bg-white/80 border-[#1e3a2a]/20 h-11 rounded-xl text-sm">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencies.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1e3a2a]/10 space-y-3">
                <div className="text-[11.5px] text-[#1e3a2a]/60">Your Contact Details for replies:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange('name')}
                      className="bg-white/80 border-[#1e3a2a]/20 h-10 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="bg-white/80 border-[#1e3a2a]/20 h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    placeholder="Phone / WhatsApp (optional for quick response)"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="bg-white/80 border-[#1e3a2a]/20 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a2a] text-[#efe6cf] hover:bg-[#284d3a] disabled:opacity-60 px-5 py-3 rounded-full text-sm font-medium transition-all shadow-md"
                >
                  {busy ? 'Submitting query…' : (
                    <>
                      Submit Query / Report <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Queries & Responses Tracker */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#efe6cf]/60 border border-[#1e3a2a]/10 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e3a2a]/10">
                <div>
                  <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Live Query & Report Feed</h2>
                  <p className="text-xs text-[#1e3a2a]/65">Community inquiries and official AWC responses</p>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#1e3a2a]/10 rounded-full text-xs">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                      activeTab === 'all' ? 'bg-[#1e3a2a] text-[#efe6cf]' : 'text-[#1e3a2a]/70 hover:text-[#1e3a2a]'
                    }`}
                  >
                    All Queries ({queries.length})
                  </button>
                  {user && (
                    <button
                      onClick={() => setActiveTab('mine')}
                      className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                        activeTab === 'mine' ? 'bg-[#1e3a2a] text-[#efe6cf]' : 'text-[#1e3a2a]/70 hover:text-[#1e3a2a]'
                      }`}
                    >
                      My Queries
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e3a2a]/40" />
                  <input
                    type="text"
                    placeholder="Search queries, locations, questions…"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/70 border border-[#1e3a2a]/15 rounded-xl text-xs text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={filterActivity}
                    onChange={(e) => setFilterActivity(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-white/70 border border-[#1e3a2a]/15 rounded-xl text-xs text-[#1e3a2a] focus:outline-none"
                  >
                    <option value="All">All Activities</option>
                    {activitiesList.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Query list */}
              <div className="mt-5 space-y-4">
                {loading && (
                  <div className="py-12 text-center text-xs text-[#1e3a2a]/50">Loading queries…</div>
                )}

                {!loading && filteredQueries.length === 0 && (
                  <div className="py-12 text-center">
                    <HelpCircle size={32} className="mx-auto text-[#1e3a2a]/25 mb-2" />
                    <p className="text-sm text-[#1e3a2a]/70 font-medium">No queries match your current filter.</p>
                    <p className="text-xs text-[#1e3a2a]/50 mt-1">Be the first to submit a question or report using the form on the left!</p>
                  </div>
                )}

                {filteredQueries.map((q) => {
                  const isResolved = q.status === 'resolved';
                  const isInProgress = q.status === 'in_progress';
                  const isUrgent = q.urgency === 'critical' || q.urgency === 'high';

                  return (
                    <article
                      key={q.id}
                      className="p-5 rounded-2xl bg-[#efe6cf] border border-[#1e3a2a]/15 hover:border-[#1e3a2a]/30 transition-all shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1e3a2a] text-[#efe6cf]">
                            {q.activity_title}
                          </span>
                          <span className="text-xs text-[#1e3a2a]/60">
                            {q.query_type}
                          </span>
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e89670] text-white animate-pulse">
                              {q.urgency.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Status pill */}
                        <div className="flex items-center gap-1.5 text-xs">
                          {isResolved ? (
                            <span className="inline-flex items-center gap-1 text-[#285c3e] font-semibold bg-[#285c3e]/10 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 text-[#c46f4a] font-semibold bg-[#c46f4a]/10 px-2.5 py-1 rounded-full">
                              <Clock size={12} /> In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#1e3a2a]/70 font-medium bg-[#1e3a2a]/5 px-2.5 py-1 rounded-full">
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif-display text-lg text-[#1e3a2a] mt-3">
                        {q.subject}
                      </h3>

                      <p className="text-sm text-[#1e3a2a]/80 mt-1.5 leading-relaxed whitespace-pre-line">
                        {q.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-[#1e3a2a]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#1e3a2a]/60">
                        <div className="flex items-center gap-3">
                          {q.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} className="text-[#e89670]" /> {q.location}
                            </span>
                          )}
                          <span>By: {q.name || 'Student'}</span>
                        </div>
                        <div>
                          {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      {/* Official AWC Coordinator Reply if available */}
                      {q.reply && (
                        <div className="mt-4 p-4 rounded-xl bg-[#e8dfc4] border-l-4 border-[#1e3a2a] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1e3a2a] flex items-center gap-1.5">
                              <Sparkles size={13} className="text-[#e89670]" /> Official AWC Response:
                            </span>
                            {q.replied_at && (
                              <span className="text-[10px] text-[#1e3a2a]/50">
                                {new Date(q.replied_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[#1e3a2a]/85 leading-relaxed text-[12.5px]">
                            {q.reply}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Queries;
