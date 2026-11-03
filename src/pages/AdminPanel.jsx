import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, Save, X, LayoutGrid, Users, Image as ImageIcon, MessageSquareQuote, Calendar, Megaphone, ClipboardList, BarChart3, Mail, HelpCircle, UserCheck, CheckCircle2, MapPin, Send, ShieldCheck, KeyRound, Search, GraduationCap, RefreshCw } from 'lucide-react';
import { LOGO } from '../mock';
import { useToast } from '../hooks/use-toast';

const tabs = [
  { key: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
  { key: 'activities', label: 'Activities', icon: <LayoutGrid size={16} /> },
  { key: 'queries', label: 'Queries & Reports', icon: <HelpCircle size={16} /> },
  { key: 'registrations', label: 'Event Registrations', icon: <UserCheck size={16} /> },
  { key: 'users', label: 'Registered Students', icon: <GraduationCap size={16} /> },
  { key: 'gallery', label: 'Gallery', icon: <ImageIcon size={16} /> },
  { key: 'team', label: 'Team', icon: <Users size={16} /> },
  { key: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={16} /> },
  { key: 'events', label: 'Events', icon: <Calendar size={16} /> },
  { key: 'announcements', label: 'Announcements', icon: <Megaphone size={16} /> },
  { key: 'applications', label: 'Applications', icon: <ClipboardList size={16} /> },
  { key: 'admin_settings', label: 'Admin Credentials & Security', icon: <ShieldCheck size={16} /> },
];

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Low Note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // High Note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.5);
  } catch (e) {
    console.log("Audio feedback blocked or unsupported", e);
  }
};

const AdminPanel = () => {
  const { user, authHeader, loading } = useAuth();
  const [tab, setTab] = useState('stats');
  const [apps, setApps] = useState([]);
  const [prevPendingIds, setPrevPendingIds] = useState(null);
  const { toast } = useToast();

  const loadApps = () => {
    if (!user || user.role !== 'admin') return;
    axios.get(`${API}/applications`, { headers: authHeader() })
      .then((r) => {
        const list = r.data || [];
        setApps(list);
        
        const pendingApps = list.filter(a => a.status === 'pending');
        const pendingIds = pendingApps.map(a => a.id);

        if (prevPendingIds !== null) {
          // Check for any new pending applications that weren't in previous set
          const newPendingCount = pendingIds.filter(id => !prevPendingIds.includes(id)).length;
          if (newPendingCount > 0) {
            playChime();
            toast({
              title: "🔔 New Application Received!",
              description: `A student has filled out a volunteer form! Check "Applications" tab to review.`,
              variant: "default",
            });
          }
        }
        setPrevPendingIds(pendingIds);
      })
      .catch(err => console.error("Failed to load apps:", err));
  };

  useEffect(() => {
    loadApps();
    const interval = setInterval(loadApps, 3500);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <div className="pt-40 text-center text-[#1e3a2a]/60">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const pendingAppsCount = apps.filter(a => a.status === 'pending').length;

  return (
    <div className="pt-32 pb-24">
      <section className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <img src={LOGO} alt="" className="w-14 h-14 rounded-full" />
          <div>
            <div className="eyebrow text-[#1e3a2a]/55">Admin panel</div>
            <h1 className="font-serif-display text-4xl md:text-5xl text-[#1e3a2a]">Content <span className="italic-serif text-[#e89670]">control.</span></h1>
          </div>
        </div>

        {pendingAppsCount > 0 && (
          <div className="mb-6 p-4 bg-[#e89670]/10 border border-[#e89670]/30 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e89670] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e89670]"></span>
              </span>
              <div className="text-sm text-[#1e3a2a] font-medium">
                You have <strong className="text-[#e89670]">{pendingAppsCount} pending student application(s)</strong> waiting for your approval!
              </div>
            </div>
            <button 
              onClick={() => setTab('applications')} 
              className="text-xs font-semibold uppercase tracking-wider text-[#e89670] hover:underline"
            >
              Review Now →
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => {
            const isApps = t.key === 'applications';
            const badgeCount = isApps ? pendingAppsCount : 0;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] border transition-colors ${
                  tab === t.key 
                    ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]' 
                    : 'bg-[#efe6cf] text-[#1e3a2a] border-[#1e3a2a]/20 hover:bg-[#e8dfc4]'
                }`}
              >
                {t.icon} 
                <span>{t.label}</span>
                {badgeCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#e89670] text-white rounded-full">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === 'stats' && <StatsEditor authHeader={authHeader} />}
        {tab === 'activities' && <CollectionEditor coll="activities" fields={activityFields} authHeader={authHeader} />}
        {tab === 'queries' && <QueriesAdmin authHeader={authHeader} />}
        {tab === 'registrations' && <EventRegistrationsAdmin authHeader={authHeader} />}
        {tab === 'users' && <RegisteredStudentsAdmin authHeader={authHeader} />}
        {tab === 'gallery' && <CollectionEditor coll="gallery" fields={galleryFields} authHeader={authHeader} />}
        {tab === 'team' && <CollectionEditor coll="team" fields={teamFields} authHeader={authHeader} />}
        {tab === 'testimonials' && <CollectionEditor coll="testimonials" fields={testimonialFields} authHeader={authHeader} />}
        {tab === 'events' && <CollectionEditor coll="events" fields={eventFields} authHeader={authHeader} />}
        {tab === 'announcements' && <CollectionEditor coll="announcements" fields={announcementFields} authHeader={authHeader} />}
        {tab === 'applications' && <ApplicationsList authHeader={authHeader} apps={apps} loadApps={loadApps} />}
        {tab === 'admin_settings' && <AdminSettingsAdmin authHeader={authHeader} />}
      </section>
    </div>
  );
};

const activityFields = [
  { k: 'num', l: 'Number', ph: '01' },
  { k: 'tag', l: 'Tag', ph: 'Daily · Campus-wide' },
  { k: 'title', l: 'Title', ph: 'Campus Feeding' },
  { k: 'image', l: 'Image URL', ph: 'https://...' },
  { k: 'description', l: 'Description', ph: '...', textarea: true },
];
const galleryFields = [
  { k: 'image', l: 'Image URL or Upload', ph: '/assets/images/rescue_vet.png or https://...' },
  { k: 'caption', l: 'Caption', ph: 'AWC team at Humane Animal Society partnership drive' },
  { k: 'category', l: 'Category', ph: 'Events / Rescue / Dogs' },
  { k: 'description', l: 'Description / Archive notes', ph: 'Details of treatment and campus care...', textarea: true },
];
const teamFields = [
  { k: 'image', l: 'Photo URL', ph: 'https://...' },
  { k: 'initials', l: 'Initials (Fallback if no photo)', ph: 'AK' },
  { k: 'role', l: 'Role', ph: 'Secretary' },
  { k: 'name', l: 'Name', ph: 'Ananya K.' },
  { k: 'dept', l: 'Dept.', ph: 'CSE · Final Year' },
  { k: 'bio', l: 'Bio', ph: 'optional', textarea: true },
  { k: 'is_faculty', l: 'Faculty? (true/false)', ph: 'false' },
];

const testimonialFields = [
  { k: 'quote', l: 'Quote', textarea: true },
  { k: 'name', l: 'Name' },
  { k: 'role', l: 'Role/Affiliation' },
];
const eventFields = [
  { k: 'title', l: 'Title' },
  { k: 'image', l: 'Image URL', ph: 'https://...' },
  { k: 'date', l: 'Date (YYYY-MM-DD)' },
  { k: 'time', l: 'Time' },
  { k: 'location', l: 'Location' },
  { k: 'description', l: 'Description', textarea: true },
];
const announcementFields = [
  { k: 'title', l: 'Title' },
  { k: 'date', l: 'Date (YYYY-MM-DD)' },
  { k: 'body', l: 'Body', textarea: true },
];

const StatsEditor = ({ authHeader }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState([]);
  const load = () => axios.get(`${API}/content/stats`).then((r) => setStats(r.data.value || []));
  useEffect(() => { load(); }, []);

  const update = (i, k, v) => setStats(stats.map((s, idx) => idx === i ? { ...s, [k]: k === 'value' ? Number(v) : v } : s));
  const save = async () => {
    await axios.put(`${API}/content/stats`, { value: stats }, { headers: authHeader() });
    toast({ title: 'Stats saved' });
  };

  return (
    <div className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-6">
      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/50 border border-[#1e3a2a]/10">
            <div className="grid grid-cols-3 gap-2">
              <FieldInput label="Value" value={s.value} onChange={(v) => update(i, 'value', v)} />
              <FieldInput label="Suffix" value={s.suffix} onChange={(v) => update(i, 'suffix', v)} />
              <div className="col-span-3"><FieldInput label="Label" value={s.label} onChange={(v) => update(i, 'label', v)} /></div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} className="mt-4 inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px]">
        <Save size={14} /> Save stats
      </button>
    </div>
  );
};

const CollectionEditor = ({ coll, fields, authHeader }) => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    const r = await axios.get(`${API}/${coll}`);
    setItems(r.data);
    setDeletingId(null);
  };
  useEffect(() => { load(); }, [coll]);

  const startNew = () => { setEditing('new'); setForm({}); };
  const startEdit = (it) => { setEditing(it.id); setForm({ ...it }); };
  const cancel = () => { setEditing(null); setForm({}); };

  const save = async () => {
    try {
      const payload = { ...form };
      if ('is_faculty' in payload && typeof payload.is_faculty === 'string') payload.is_faculty = payload.is_faculty === 'true';
      if (editing === 'new') {
        await axios.post(`${API}/${coll}`, payload, { headers: authHeader() });
      } else {
        await axios.put(`${API}/${coll}/${editing}`, payload, { headers: authHeader() });
      }
      toast({ title: 'Saved' });
      cancel(); load();
    } catch (e) {
      toast({ title: 'Save failed', description: e?.response?.data?.detail || 'Try again', variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${API}/${coll}/${id}`, { headers: authHeader() });
      toast({ title: 'Deleted successfully' });
      setDeletingId(null);
      load();
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.response?.data?.detail || 'Try again', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="eyebrow text-[#1e3a2a]/55">{items.length} items</div>
        <button onClick={startNew} className="inline-flex items-center gap-1.5 bg-[#1e3a2a] text-[#efe6cf] px-4 py-2 rounded-full text-[13px]"><Plus size={14} /> New</button>
      </div>

      {editing && (
        <div className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.k} className={f.textarea ? 'md:col-span-2' : ''}>
                <FieldInput 
                  label={f.l} 
                  value={form[f.k] ?? ''} 
                  onChange={(v) => setForm({ ...form, [f.k]: v })} 
                  textarea={f.textarea} 
                  placeholder={f.ph} 
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="inline-flex items-center gap-1.5 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px]"><Save size={14} /> Save</button>
            <button onClick={cancel} className="inline-flex items-center gap-1.5 border border-[#1e3a2a]/30 text-[#1e3a2a] px-5 py-2.5 rounded-full text-[13px]"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-5">
            {it.image && <img src={it.image} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />}
            <div className="font-serif-display text-xl text-[#1e3a2a] truncate">{it.title || it.name || it.caption || it.quote?.slice(0, 40)}</div>
            <div className="text-[12.5px] text-[#1e3a2a]/60 mt-1 line-clamp-2">{it.description || it.body || it.role || it.dept || it.category}</div>
            
            {deletingId === it.id ? (
              <div className="flex gap-1.5 mt-4 items-center bg-red-50/50 p-2 rounded-xl border border-red-100">
                <span className="text-[11px] text-red-700 font-semibold mr-1">Confirm delete?</span>
                <button onClick={() => remove(it.id)} className="bg-red-600 text-[#efe6cf] px-3 py-1 rounded-full text-[11px] hover:bg-red-700 transition-colors">Yes</button>
                <button onClick={() => setDeletingId(null)} className="bg-white border border-[#1e3a2a]/20 px-3 py-1 rounded-full text-[11px] text-[#1e3a2a] hover:bg-gray-50 transition-colors">No</button>
              </div>
            ) : (
              <div className="flex gap-2 mt-4">
                <button onClick={() => startEdit(it)} className="inline-flex items-center gap-1 border border-[#1e3a2a]/25 px-3 py-1.5 rounded-full text-[12px] text-[#1e3a2a]"><Edit3 size={12} /> Edit</button>
                <button onClick={() => setDeletingId(it.id)} className="inline-flex items-center gap-1 border border-red-300 text-red-600 px-3 py-1.5 rounded-full text-[12px]"><Trash2 size={12} /> Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ApplicationsList = ({ authHeader, apps, loadApps }) => {
  const [actionLoading, setActionLoading] = useState({});
  const { toast } = useToast();
  const setStatus = async (id, s) => {
    if (actionLoading[id]) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(`${API}/applications/${id}/status?status_val=${s}`, {}, { headers: authHeader() });
      toast({ title: `Marked application ${s} successfully!` });
      await loadApps();
    } catch (err) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };
  return (
    <div className="space-y-3">
      {apps.length === 0 && <div className="text-[#1e3a2a]/60 text-[14px]">No applications yet.</div>}
      {apps.map((a) => {
        const isPending = a.status === 'pending';
        const isLoading = !!actionLoading[a.id];
        return (
          <div key={a.id} className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-serif-display text-xl text-[#1e3a2a]">{a.full_name}</div>
                <div className="text-[13px] text-[#1e3a2a]/70">{a.department} · {a.year} · {a.register_no}</div>
                <div className="text-[13px] text-[#1e3a2a]/70 mt-1">{a.email} · {a.phone}</div>
                <div className="text-[13px] text-[#1e3a2a]/70 mt-1">Interests: {(a.interests || []).join(', ')}</div>
                {a.reason && <p className="text-[13.5px] text-[#1e3a2a]/80 mt-2 max-w-xl">“{a.reason}”</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${a.status === 'approved' ? 'bg-[#1e3a2a]/15 text-[#1e3a2a]' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-[#e89670]/20 text-[#c46f4a]'}`}>{a.status.toUpperCase()}</span>
                <div className="flex gap-1.5">
                  <button 
                    disabled={!isPending || isLoading}
                    onClick={() => setStatus(a.id, 'approved')} 
                    className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                      a.status === 'approved'
                        ? 'bg-[#1e3a2a] text-[#efe6cf]/50 cursor-not-allowed opacity-50'
                        : !isPending
                          ? 'bg-[#1e3a2a]/5 text-[#1e3a2a]/20 cursor-not-allowed'
                          : isLoading
                            ? 'bg-[#1e3a2a]/40 text-[#efe6cf]/70 cursor-wait'
                            : 'bg-[#1e3a2a] text-[#efe6cf] hover:bg-[#284d3a] active:scale-95 shadow-sm'
                    }`}
                  >
                    {a.status === 'approved' ? '✓ Approved' : isLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    disabled={!isPending || isLoading}
                    onClick={() => setStatus(a.id, 'rejected')} 
                    className={`text-[11px] px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                      a.status === 'rejected'
                        ? 'border-red-200 text-red-300 cursor-not-allowed opacity-50'
                        : !isPending
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : isLoading
                            ? 'border-gray-200 text-gray-400 cursor-wait'
                            : 'border-red-300 text-red-600 hover:bg-red-50 active:scale-95 shadow-sm'
                    }`}
                  >
                    {a.status === 'rejected' ? '✗ Rejected' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const FieldInput = ({ label, value, onChange, textarea, placeholder }) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);
  const isImageField = label.toLowerCase().includes('image') || label.toLowerCase().includes('photo') || label.toLowerCase().includes('logo');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: "Image file size is too large. Please select an image under 5MB.", 
          variant: "destructive" 
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isBase64 = typeof value === 'string' && value.startsWith('data:image');

  return (
    <label className="block">
      <div className="eyebrow text-[#1e3a2a]/60 mb-1.5 flex justify-between items-center">
        <span>{label}</span>
      </div>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg bg-white/60 border border-[#1e3a2a]/15 text-[14px] text-[#1e3a2a] focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/25" />
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              value={isBase64 ? "[Embedded Image Uploaded]" : value} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder={placeholder}
              disabled={isBase64}
              className="w-full h-10 px-3 rounded-lg bg-white/60 border border-[#1e3a2a]/15 text-[14px] text-[#1e3a2a] focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/25 disabled:bg-[#1e3a2a]/5 disabled:text-[#1e3a2a]/60" 
            />
            
            {isImageField && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isBase64 || value) {
                      onChange('');
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`px-4 h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border shrink-0 ${
                    (isBase64 || value) 
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                      : 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a] hover:bg-[#284d3a]'
                  }`}
                >
                  {(isBase64 || value) ? 'Clear Image' : 'Upload File'}
                </button>
              </>
            )}
          </div>

          {isImageField && value && (
            <div className="flex items-center gap-3 p-2 bg-white/40 border border-[#1e3a2a]/5 rounded-xl">
              <img 
                src={value} 
                alt="Preview" 
                className="w-16 h-16 rounded-lg object-cover border border-[#1e3a2a]/15"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="text-xs text-[#1e3a2a]/70">
                <span className="font-semibold block text-[#1e3a2a]">Image Preview</span>
                {isBase64 ? 'Local file uploaded successfully' : 'Linked image URL'}
              </div>
            </div>
          )}
        </div>
      )}
    </label>
  );
};

const EmailLogs = ({ authHeader }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    axios.get(`${API}/emails`, { headers: authHeader() })
      .then((r) => {
        setEmails(r.data);
        // If there's an active selected email, update its reference to keep any new data or selection alive
        if (selectedEmail) {
          const updated = r.data.find((e) => e.id === selectedEmail.id);
          if (updated) setSelectedEmail(updated);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#1e3a2a]/5 border border-[#1e3a2a]/10 rounded-2xl p-6 text-[#1e3a2a] flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#1e3a2a] text-[#efe6cf] flex items-center justify-center flex-shrink-0">
          <Mail size={22} />
        </div>
        <div>
          <h3 className="font-serif-display text-xl">Real-time Automated Dispatch</h3>
          <p className="text-[14px] text-[#1e3a2a]/85 mt-1 max-w-xl">
            When you approve or hold applications, students receive beautifully composed emails in real time. 
            Below are the logs of all emails sent by the system.
          </p>
          <button onClick={load} className="mt-4 px-4 py-1.5 bg-[#1e3a2a] text-[#efe6cf] rounded-full text-xs font-semibold hover:bg-[#284d3a] transition-colors">
            Refresh Outbox
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#1e3a2a]/60 font-medium">Loading logs...</div>
      ) : emails.length === 0 ? (
        <div className="bg-[#efe6cf] border border-[#1e3a2a]/10 rounded-2xl p-8 text-center text-[#1e3a2a]/60">
          No automated emails have been sent yet. Approve an application to trigger one!
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Logs List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="eyebrow text-[#1e3a2a]/55 px-1">Sent Messages ({emails.length})</div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {emails.map((e) => {
                const active = selectedEmail?.id === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEmail(e)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      active
                        ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a] shadow-md'
                        : 'bg-[#efe6cf] hover:bg-[#e8dfc4] border-[#1e3a2a]/10 text-[#1e3a2a]'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        e.status === 'sent' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : e.status === 'simulated' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {e.status === 'sent' ? '✓ SENT' : e.status === 'simulated' ? '★ OUTBOX' : '⚠ FAILED'}
                      </span>
                      <span className={`text-[10px] ${active ? 'text-[#efe6cf]/70' : 'text-[#1e3a2a]/60'}`}>
                        {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-serif-display text-base truncate w-full">{e.studentName}</div>
                    <div className={`text-[11px] truncate w-full ${active ? 'text-[#efe6cf]/80' : 'text-[#1e3a2a]/70'}`}>{e.to}</div>
                    <p className={`text-[12px] truncate w-full ${active ? 'text-[#efe6cf]/90' : 'text-[#1e3a2a]/80'}`}>{e.subject}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Preview Panel */}
          <div className="lg:col-span-2">
            <div className="eyebrow text-[#1e3a2a]/55 px-1 mb-3">Live Mailbox Preview</div>
            {selectedEmail ? (
              <div className="bg-white rounded-2xl border border-[#1e3a2a]/10 p-6 shadow-sm overflow-hidden flex flex-col h-full min-h-[480px]">
                <div className="border-b border-gray-100 pb-4 mb-4 space-y-1 text-sm text-gray-600">
                  <div><strong className="text-[#1e3a2a]">From:</strong> Animal Welfare Club &lt;system@awc.psgtech.ac.in&gt;</div>
                  <div><strong className="text-[#1e3a2a]">To:</strong> {selectedEmail.studentName} &lt;{selectedEmail.to}&gt;</div>
                  <div><strong className="text-[#1e3a2a]">Subject:</strong> {selectedEmail.subject}</div>
                  <div><strong className="text-[#1e3a2a]">Date:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex-1 bg-[#efe6cf]/20 p-4 rounded-xl border border-dashed border-gray-200 overflow-y-auto max-h-[450px]">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} />
                </div>
              </div>
            ) : (
              <div className="bg-[#efe6cf]/30 border border-dashed border-[#1e3a2a]/20 rounded-2xl p-12 text-center text-[#1e3a2a]/55 h-full flex flex-col items-center justify-center min-h-[400px]">
                <Mail size={32} className="text-[#1e3a2a]/30 mb-3" />
                <p className="text-[14px]">Select an email from the left log to open the live simulation viewer.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SmtpSettings = ({ authHeader }) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({ host: '', port: '', user: '', pass: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  useEffect(() => {
    axios.get(`${API}/smtp-config`, { headers: authHeader() })
      .then(r => setConfig(r.data))
      .catch(err => console.error("Failed to load SMTP config:", err));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);
    try {
      await axios.put(`${API}/smtp-config`, config, { headers: authHeader() });
      toast({ title: 'SMTP configuration updated successfully!' });
    } catch (err) {
      toast({ title: 'Failed to save configuration', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.host || !config.port || !config.user || !config.pass) {
      toast({ 
        title: 'Missing Fields', 
        description: 'Please fill in all SMTP fields before testing.', 
        variant: 'destructive' 
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post(`${API}/smtp-test`, config, { headers: authHeader() });
      setTestResult({ success: true, message: res.data.message });
      toast({ title: 'SMTP Connected!', description: 'Test email successfully sent!' });
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Unknown SMTP error occurred.';
      setTestResult({ success: false, message: errMsg });
      toast({ 
        title: 'SMTP Connection Failed', 
        description: 'Check the error message below for details.', 
        variant: 'destructive' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-6 max-w-xl animate-fade-in">
      <div className="mb-4">
        <h3 className="font-serif-display text-xl text-[#1e3a2a]">SMTP Mail Configuration</h3>
        <p className="text-[12.5px] text-[#1e3a2a]/60 mt-1">
          Configure your SMTP server credentials to automatically dispatch real selection emails to students in real-time when they are approved.
        </p>
      </div>

      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1e3a2a]/70 mb-1">SMTP Host</label>
            <input 
              type="text" 
              placeholder="e.g. smtp.gmail.com" 
              value={config.host || ''} 
              onChange={e => setConfig({ ...config, host: e.target.value })} 
              className="w-full h-10 px-3 bg-white/50 border border-[#1e3a2a]/10 rounded-lg text-xs font-medium text-[#1e3a2a] focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/40"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1e3a2a]/70 mb-1">SMTP Port</label>
            <input 
              type="text" 
              placeholder="e.g. 465 or 587" 
              value={config.port || ''} 
              onChange={e => setConfig({ ...config, port: e.target.value })} 
              className="w-full h-10 px-3 bg-white/50 border border-[#1e3a2a]/10 rounded-lg text-xs font-medium text-[#1e3a2a] focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/40"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1e3a2a]/70 mb-1">SMTP Username / Email Address</label>
          <input 
            type="email" 
            placeholder="e.g. awcpsgtech@gmail.com" 
            value={config.user || ''} 
            onChange={e => setConfig({ ...config, user: e.target.value })} 
            className="w-full h-10 px-3 bg-white/50 border border-[#1e3a2a]/10 rounded-lg text-xs font-medium text-[#1e3a2a] focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1e3a2a]/70 mb-1">SMTP Password / App Password</label>
          <input 
            type="password" 
            placeholder={config.pass ? "********" : "Enter SMTP Password or GMail App Password"} 
            value={config.pass || ''} 
            onChange={e => setConfig({ ...config, pass: e.target.value })} 
            className="w-full h-10 px-3 bg-white/50 border border-[#1e3a2a]/10 rounded-lg text-xs font-medium text-[#1e3a2a] focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]/40"
            required
          />
          <p className="text-[10.5px] text-[#1e3a2a]/50 mt-1.5 leading-normal">
            💡 <strong>Note for GMail:</strong> Please use a 16-character <strong>App Password</strong> generated from your Google Account settings (with 2-Step Verification active). Do not enter your main Google password.
          </p>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            testResult.success 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <span className="font-bold block mb-1">
              {testResult.success ? '✓ SMTP Verification Successful' : '✗ SMTP Verification Failed'}
            </span>
            <p className="font-mono break-all">{testResult.message}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button 
            type="submit" 
            disabled={saving || testing}
            className="inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px] hover:bg-[#284d3a] transition-all font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button 
            type="button" 
            onClick={testConnection}
            disabled={saving || testing}
            className="inline-flex items-center gap-2 bg-white text-[#1e3a2a] border border-[#1e3a2a]/20 px-5 py-2.5 rounded-full text-[13px] hover:bg-white/80 transition-all font-medium"
          >
            {testing ? 'Testing SMTP...' : 'Test Connection'}
          </button>
        </div>
      </form>
    </div>
  );
};

const QueriesAdmin = ({ authHeader }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [replies, setReplies] = useState({});
  const [savingId, setSavingId] = useState(null);
  const { toast } = useToast();

  const loadQueries = () => {
    axios.get(`${API}/queries`)
      .then((r) => {
        if (Array.isArray(r.data)) {
          setQueries(r.data);
          // Initialize reply drafts
          const map = {};
          r.data.forEach((q) => { map[q.id] = q.reply || ''; });
          setReplies(map);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueries();
    const interval = setInterval(loadQueries, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReplyChange = (id, text) => {
    setReplies((prev) => ({ ...prev, [id]: text }));
  };

  const handleUpdate = async (id, status) => {
    setSavingId(id);
    try {
      await axios.put(
        `${API}/queries/${id}/reply`,
        { reply: replies[id] || '', status },
        { headers: authHeader() }
      );
      toast({
        title: 'Query Updated',
        description: `Status updated to ${status} and official reply saved!`,
      });
      loadQueries();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.detail || 'Could not update query',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await axios.delete(`${API}/queries/${id}`, { headers: authHeader() });
      toast({ title: 'Query deleted' });
      loadQueries();
    } catch (err) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const filtered = queries.filter((q) => {
    if (filterStatus === 'all') return true;
    return q.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#efe6cf] p-6 rounded-2xl border border-[#1e3a2a]/10">
        <div>
          <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Student Queries & Activity Reports</h2>
          <p className="text-xs text-[#1e3a2a]/70 mt-1">Review student questions and incident reports submitted from activities, and post coordinator replies.</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'pending', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${
                filterStatus === st
                  ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]'
                  : 'bg-white/70 text-[#1e3a2a] border-[#1e3a2a]/15 hover:bg-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-center py-10 text-xs text-[#1e3a2a]/50">Loading queries…</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-[#efe6cf]/50 rounded-2xl border border-[#1e3a2a]/10 text-sm text-[#1e3a2a]/60">
          No queries matching this filter.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((q) => (
          <div key={q.id} className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/15 p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a2a] text-[#efe6cf]">
                  {q.activity_title}
                </span>
                <span className="text-xs text-[#1e3a2a]/65 font-medium">{q.query_type}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  q.urgency === 'critical' || q.urgency === 'high' ? 'bg-[#e89670] text-white' : 'bg-gray-200 text-gray-800'
                }`}>
                  {q.urgency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  q.status === 'resolved' ? 'bg-green-100 text-green-800' : q.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {q.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete query"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-serif-display text-xl text-[#1e3a2a]">{q.subject}</h3>
              <p className="text-sm text-[#1e3a2a]/80 mt-1.5 whitespace-pre-line leading-relaxed">{q.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#1e3a2a]/70 bg-white/50 p-3 rounded-xl border border-[#1e3a2a]/10">
              <div><strong>By:</strong> {q.name} ({q.email || 'No email'})</div>
              <div><strong>Phone:</strong> {q.phone || '—'}</div>
              <div><strong>Location:</strong> {q.location || 'PSG Tech Campus'}</div>
            </div>

            {/* Coordinator Reply Box */}
            <div className="pt-2 border-t border-[#1e3a2a]/10 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#1e3a2a]/70 block">
                Official AWC Response / Update to Student:
              </label>
              <textarea
                rows={2}
                value={replies[q.id] || ''}
                onChange={(e) => handleReplyChange(q.id, e.target.value)}
                placeholder="Type reply to address query, explain schedule, or update rescue status..."
                className="w-full p-3 rounded-xl bg-white border border-[#1e3a2a]/20 text-xs text-[#1e3a2a] focus:outline-none focus:ring-1 focus:ring-[#1e3a2a]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-[#1e3a2a]/55">
                  {q.replied_at ? `Last updated: ${new Date(q.replied_at).toLocaleString()}` : 'Not yet responded'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={savingId === q.id}
                    onClick={() => handleUpdate(q.id, 'in_progress')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#1e3a2a]/25 text-[#1e3a2a] hover:bg-[#1e3a2a]/10 transition-colors"
                  >
                    Mark In Progress
                  </button>
                  <button
                    disabled={savingId === q.id}
                    onClick={() => handleUpdate(q.id, 'resolved')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#1e3a2a] text-[#efe6cf] hover:bg-[#284d3a] transition-colors"
                  >
                    <CheckCircle2 size={13} /> {savingId === q.id ? 'Saving…' : 'Save & Mark Resolved'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventRegistrationsAdmin = ({ authHeader }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState('All');
  const { toast } = useToast();

  const loadRegs = () => {
    axios.get(`${API}/event-registrations`, { headers: authHeader() })
      .then((r) => {
        if (Array.isArray(r.data)) setRegistrations(r.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRegs();
    const interval = setInterval(loadRegs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel and remove this event registration?')) return;
    try {
      await axios.delete(`${API}/event-registrations/${id}`, { headers: authHeader() });
      toast({ title: 'Registration removed' });
      loadRegs();
    } catch (err) {
      toast({ title: 'Failed to delete registration', variant: 'destructive' });
    }
  };

  const uniqueEvents = Array.from(new Set(registrations.map((r) => r.event_title)));

  const filtered = filterEvent === 'All'
    ? registrations
    : registrations.filter((r) => r.event_title === filterEvent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#efe6cf] p-6 rounded-2xl border border-[#1e3a2a]/10">
        <div>
          <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Event-Specific Registrations</h2>
          <p className="text-xs text-[#1e3a2a]/70 mt-1">Review student registrations with their tailored answers for each event or drive.</p>
        </div>
        <div>
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white/80 border border-[#1e3a2a]/20 text-xs font-medium text-[#1e3a2a] focus:outline-none"
          >
            <option value="All">All Events ({registrations.length})</option>
            {uniqueEvents.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-xs text-[#1e3a2a]/50">Loading registrations…</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-[#efe6cf]/50 rounded-2xl border border-[#1e3a2a]/10 text-sm text-[#1e3a2a]/60">
          No registrations recorded for this event yet.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((reg) => (
          <div key={reg.id} className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/15 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a2a]/10 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e89670]">{reg.event_title}</span>
                <div className="font-serif-display text-xl text-[#1e3a2a]">{reg.name}</div>
                <div className="text-xs text-[#1e3a2a]/70">
                  {reg.department} · {reg.year} · Reg No: <span className="font-mono font-semibold">{reg.register_no || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a2a] text-[#efe6cf] uppercase">
                  {reg.status || 'Confirmed'}
                </span>
                <button
                  onClick={() => handleDelete(reg.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove registration"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/60 p-3.5 rounded-xl border border-[#1e3a2a]/10 text-[#1e3a2a]">
              <div><strong>Email:</strong> {reg.email}</div>
              <div><strong>Phone:</strong> {reg.phone || '—'}</div>
              <div><strong>Registered:</strong> {new Date(reg.created_at).toLocaleDateString()}</div>
            </div>

            {/* Event Specific Responses */}
            {reg.answers && Object.keys(reg.answers).length > 0 && (
              <div className="bg-[#e8dfc4]/60 p-4 rounded-xl border border-[#1e3a2a]/10 text-xs space-y-1.5">
                <div className="font-bold text-[#1e3a2a] text-[11.5px] uppercase tracking-wider pb-1">Event-Specific Questionnaire Responses:</div>
                {Object.entries(reg.answers).map(([key, val]) => (
                  <div key={key} className="flex flex-wrap gap-2 text-[#1e3a2a]">
                    <span className="font-semibold capitalize text-[#1e3a2a]/70">{key.replace(/_/g, ' ')}:</span>
                    <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- REGISTERED STUDENTS COMPONENT ---
const RegisteredStudentsAdmin = ({ authHeader }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const loadUsers = () => {
    setLoading(true);
    axios.get(`${API}/users`, { headers: authHeader() })
      .then((r) => setUsers(r.data || []))
      .catch((err) => {
        console.error('Failed to load students:', err);
        toast({ title: 'Failed to load registered students', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (id, name) => {
    try {
      await axios.delete(`${API}/users/${id}`, { headers: authHeader() });
      toast({ title: 'Student Removed', description: `${name} has been removed from registered accounts.` });
      setDeletingId(null);
      loadUsers();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not remove student account', variant: 'destructive' });
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.register_no && u.register_no.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-[#efe6cf] p-6 rounded-2xl border border-[#1e3a2a]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Registered Student Members</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1e3a2a] text-[#efe6cf]">
              {users.length} Students
            </span>
          </div>
          <p className="text-xs text-[#1e3a2a]/70 mt-1">
            Complete list of students registered with their Student Name, Roll No, Department, Year, Email, and Phone number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1e3a2a]/40" />
            <input
              type="text"
              placeholder="Search name, roll no, dep…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl bg-white/80 border border-[#1e3a2a]/20 text-xs text-[#1e3a2a] placeholder-[#1e3a2a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20 w-64"
            />
          </div>
          <button
            onClick={loadUsers}
            className="p-2 rounded-xl bg-white/80 border border-[#1e3a2a]/20 text-[#1e3a2a] hover:bg-[#e8dfc4] transition-colors"
            title="Refresh student list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-xs text-[#1e3a2a]/50">Loading student profiles…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-[#efe6cf]/50 rounded-2xl border border-[#1e3a2a]/10 text-sm text-[#1e3a2a]/60">
          {search ? `No student accounts matched "${search}".` : 'No registered students found yet.'}
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((st) => (
          <div
            key={st.id}
            className="bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/15 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-[#1e3a2a]/10 pb-3 mb-3">
                <div>
                  <h3 className="font-serif-display text-lg text-[#1e3a2a] leading-tight">{st.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#1e3a2a] text-[#efe6cf] font-mono text-[11px] font-bold rounded-md">
                      {st.register_no}
                    </span>
                    <span className="text-[11px] text-[#1e3a2a]/60 font-medium">
                      {st.year}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-[#e89670]/20 text-[#c46f4a]">
                    Volunteer
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#1e3a2a]/80">
                <div className="flex items-center gap-2">
                  <span className="text-[#1e3a2a]/50 font-semibold w-12">Dept:</span>
                  <span className="font-medium truncate" title={st.department}>{st.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1e3a2a]/50 font-semibold w-12">Email:</span>
                  <span className="truncate" title={st.email}>{st.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1e3a2a]/50 font-semibold w-12">Phone:</span>
                  <span>{st.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1e3a2a]/50 font-semibold w-12">Joined:</span>
                  <span className="text-[11px] text-[#1e3a2a]/60">
                    {st.created_at ? new Date(st.created_at).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-[#1e3a2a]/10 flex items-center justify-between">
              <span className="text-[10px] text-[#1e3a2a]/40 font-mono">ID: {st.id.slice(-8)}</span>
              {deletingId === st.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-red-600 font-semibold">Confirm?</span>
                  <button
                    onClick={() => handleDeleteUser(st.id, st.name)}
                    className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="px-2 py-1 bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] rounded-lg text-xs"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(st.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove student member"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ADMIN CREDENTIALS & SECURITY SETTINGS ---
const AdminSettingsAdmin = ({ authHeader }) => {
  const { toast } = useToast();
  const [adminData, setAdminData] = useState({
    username: '',
    name: '',
    email: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/credentials`, { headers: authHeader() })
      .then((r) => {
        if (r.data) {
          setAdminData({
            username: r.data.username || '',
            name: r.data.name || '',
            email: r.data.email || '',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load admin credentials', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 4) {
      toast({
        title: 'Invalid Password',
        description: 'New password must be at least 4 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    try {
      const payload = {
        username: adminData.username.trim(),
        name: adminData.name.trim(),
        email: adminData.email.trim(),
        current_password: currentPassword.trim(),
        new_password: newPassword.trim() || undefined,
      };

      const res = await axios.put(`${API}/admin/credentials`, payload, { headers: authHeader() });
      toast({
        title: 'Credentials Updated! ✅',
        description: res.data?.message || 'Admin username, email and password saved successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to update admin credentials. Check current password.';
      toast({
        title: 'Update Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-[#1e3a2a]/50">Loading security settings…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[#efe6cf] p-6 rounded-2xl border border-[#1e3a2a]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e3a2a] text-[#efe6cf] flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-serif-display text-2xl text-[#1e3a2a]">Admin Credentials & Security</h2>
            <p className="text-xs text-[#1e3a2a]/70 mt-0.5">
              Change your administrative username, display name, and password anytime. These credentials control full administrative rights across the entire website.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5 flex items-center gap-1.5">
                <Users size={13} /> Admin Username <span className="text-red-600">*</span>
              </label>
              <input
                required
                type="text"
                placeholder=""
                value={adminData.username}
                onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5 flex items-center gap-1.5">
                <Users size={13} /> Coordinator Display Name
              </label>
              <input
                type="text"
                placeholder=""
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5 flex items-center gap-1.5">
              <Mail size={13} /> Admin Official Email <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="email"
              placeholder=""
              value={adminData.email}
              onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
            />
          </div>

          <div className="pt-3 border-t border-[#1e3a2a]/10">
            <h3 className="font-serif-display text-lg text-[#1e3a2a] mb-3 flex items-center gap-2">
              <KeyRound size={16} /> Update Password
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                  Current Password (required to authorize changes)
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/15 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <p className="text-[11.5px] text-[#1e3a2a]/60">
              🔒 Changes are persisted immediately to the secure server database.
            </p>
            <button
              disabled={busy}
              type="submit"
              className="inline-flex items-center gap-2 bg-[#1e3a2a] hover:bg-[#284d3a] disabled:opacity-60 text-[#efe6cf] px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-98"
            >
              {busy ? 'Saving…' : <><Save size={14} /> Save New Credentials</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;

