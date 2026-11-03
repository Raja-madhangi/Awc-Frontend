import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, MegaphoneIcon, ClipboardList, User, Clock, Mail, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { LOGO } from '../mock';

const Dashboard = () => {
  const { user, authHeader, loading } = useAuth();
  const [apps, setApps] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [emails, setEmails] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myQueries, setMyQueries] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const loadData = () => {
      axios.get(`${API}/applications/mine`, { headers: authHeader() }).then((r) => setApps(r.data)).catch(()=>{});
      axios.get(`${API}/events`).then((r) => setEvents(r.data)).catch(()=>{});
      axios.get(`${API}/announcements`).then((r) => setAnnouncements(r.data)).catch(()=>{});
      axios.get(`${API}/event-registrations/mine`, { headers: authHeader() }).then((r) => setMyRegistrations(r.data)).catch(()=>{});
      axios.get(`${API}/queries/mine`, { headers: authHeader() }).then((r) => setMyQueries(r.data)).catch(()=>{});
      axios.get(`${API}/emails`, { headers: authHeader() }).then((r) => {
        setEmails((prev) => {
          if (r.data.length > 0 && !activeEmail) {
            setActiveEmail(r.data[0]);
          }
          return r.data;
        });
      }).catch(()=>{});
    };

    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user, activeEmail]);

  if (loading) return <div className="pt-40 text-center text-[#1e3a2a]/60">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: '/dashboard' }} replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="pt-32 pb-24">
      <section className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-2">
          <img src={LOGO} alt="" className="w-14 h-14 rounded-full" />
          <div>
            <div className="eyebrow text-[#1e3a2a]/55">My dashboard</div>
            <h1 className="font-serif-display text-4xl md:text-5xl text-[#1e3a2a]">Hello, <span className="italic-serif text-[#e89670]">{user.name.split(' ')[0]}</span>.</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <StatCard icon={<CalendarDays size={18} />} label="Registered events" value={myRegistrations.length} />
          <StatCard icon={<HelpCircle size={18} />} label="My queries" value={myQueries.length} />
          <StatCard icon={<ClipboardList size={18} />} label="Club applications" value={apps.length} />
          <StatCard icon={<MegaphoneIcon size={18} />} label="Announcements" value={announcements.length} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <Panel title="Student Profile" className="lg:col-span-1">
            <Row icon={<User size={14} />} k="Name" v={user.name} />
            <Row k="Roll No" v={user.register_no || '—'} />
            <Row k="Department" v={user.department || '—'} />
            <Row k="Year" v={user.year || '—'} />
            <Row k="Email" v={user.email} />
            <Row k="Phone" v={user.phone || '—'} />
            <Row k="Membership" v={user.role === 'admin' ? 'Coordinator' : 'Student Volunteer'} />
            <div className="pt-4 mt-2 border-t border-[#1e3a2a]/10 flex flex-col gap-2">
              <Link to="/events" className="text-xs text-center py-2 px-3 rounded-full bg-[#1e3a2a] text-[#efe6cf] hover:bg-[#284d3a]">
                Browse Events & Register
              </Link>
              <Link to="/join" className="text-xs text-center py-2 px-3 rounded-full bg-[#e89670] text-[#1e3a2a] font-semibold hover:bg-[#d8825c]">
                Volunteer Membership Application
              </Link>
              <Link to="/queries" className="text-xs text-center py-2 px-3 rounded-full border border-[#1e3a2a]/20 text-[#1e3a2a] hover:bg-[#1e3a2a]/5">
                Submit an Activity Query
              </Link>
            </div>
          </Panel>

          {/* My Registered Events */}
          <Panel title="My Registered Events & Drives" className="lg:col-span-2">
            {myRegistrations.length === 0 ? (
              <div className="p-6 text-center">
                <Empty text="You haven't registered for any specific events yet." />
                <Link to="/events" className="inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px] mt-2">
                  Browse Events & Register
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myRegistrations.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#e8dfc4]/60 border border-[#1e3a2a]/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="font-serif-display text-lg text-[#1e3a2a]">{r.event_title}</div>
                      <div className="text-[12px] text-[#1e3a2a]/70 mt-1">
                        Registered on: {new Date(r.created_at).toLocaleDateString()} · ID: <span className="font-mono">{r.id}</span>
                      </div>
                      {r.answers && (
                        <div className="mt-2 text-xs text-[#1e3a2a]/80 bg-white/50 p-2.5 rounded-lg space-y-1">
                          {r.answers.notes && <div><strong>Notes:</strong> {r.answers.notes}</div>}
                          {r.answers.preferred_slot && <div><strong>Slot:</strong> {r.answers.preferred_slot}</div>}
                          {r.answers.campus_zone && <div><strong>Area:</strong> {r.answers.campus_zone}</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 self-start md:self-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1e3a2a] text-[#efe6cf] uppercase">
                        {r.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* My Queries */}
          <Panel title="My Activity Queries & Responses" className="lg:col-span-2">
            {myQueries.length === 0 ? (
              <div className="p-6 text-center">
                <Empty text="You haven't raised any activity queries or incident reports." />
                <Link to="/queries" className="inline-flex items-center gap-2 bg-[#1e3a2a] text-[#efe6cf] px-5 py-2.5 rounded-full text-[13px] mt-2">
                  Ask a Query or Report
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myQueries.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#e8dfc4]/60 border border-[#1e3a2a]/10">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-[#e89670] uppercase">{q.activity_title}</span>
                        <div className="font-serif-display text-base text-[#1e3a2a] mt-0.5">{q.subject}</div>
                        <p className="text-xs text-[#1e3a2a]/75 mt-1">{q.description}</p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                        q.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    {q.reply && (
                      <div className="mt-3 p-3 bg-white/70 rounded-lg text-xs border-l-3 border-[#1e3a2a]">
                        <span className="font-semibold text-[#1e3a2a]">AWC Coordinator Response:</span>
                        <p className="text-[#1e3a2a]/80 mt-1">{q.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Announcements" className="lg:col-span-1">
            {announcements.length === 0 && <Empty text="Nothing pinned." />}
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="pb-3 border-b border-[#1e3a2a]/10 last:border-none">
                  <div className="eyebrow text-[#e89670]">{a.date}</div>
                  <div className="font-serif-display text-lg text-[#1e3a2a] mt-1">{a.title}</div>
                  <p className="text-[13.5px] text-[#1e3a2a]/70 mt-1">{a.body}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="AWC Official Communications & Inbox" className="lg:col-span-3 mt-4">
            {emails.length === 0 ? (
              <div className="py-8 text-center text-[#1e3a2a]/60">
                <Mail size={32} className="mx-auto text-[#1e3a2a]/25 mb-2" />
                <p className="text-[13.5px]">No letters or official approval notices received yet. When the admin updates your status, you'll receive your real-time notification here!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-r border-[#1e3a2a]/10 pr-4 space-y-2">
                  <div className="eyebrow text-[#1e3a2a]/55 mb-2">My Letters ({emails.length})</div>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {emails.map((e) => {
                      const isSelected = activeEmail?.id === e.id;
                      return (
                        <button
                          key={e.id}
                          onClick={() => setActiveEmail(e)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                            isSelected
                              ? 'bg-[#1e3a2a] text-[#efe6cf] border-[#1e3a2a]'
                              : 'bg-[#e8dfc4]/50 border-[#1e3a2a]/10 text-[#1e3a2a] hover:bg-[#e8dfc4]'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold tracking-wider text-[#e89670]">OFFICIAL NOTICE</span>
                            <span className="text-[10px] opacity-60">
                              {new Date(e.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="font-serif-display text-sm truncate w-full">{e.subject}</div>
                          <div className="text-[11px] opacity-75 truncate w-full">From: system@awc.psgtech.ac.in</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2">
                  {activeEmail ? (
                    <div className="bg-white rounded-xl border border-[#1e3a2a]/10 p-5 shadow-sm">
                      <div className="border-b border-gray-100 pb-3 mb-4 space-y-1 text-xs text-gray-500">
                        <div><strong>From:</strong> PSG Tech Animal Welfare Club</div>
                        <div><strong>To:</strong> {activeEmail.to}</div>
                        <div><strong>Subject:</strong> {activeEmail.subject}</div>
                        <div><strong>Timestamp:</strong> {new Date(activeEmail.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="bg-[#efe6cf]/20 p-4 rounded-lg overflow-y-auto max-h-[350px]">
                        <div dangerouslySetInnerHTML={{ __html: activeEmail.bodyHtml }} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-[#1e3a2a]/20 rounded-xl p-8 flex flex-col items-center justify-center text-center text-[#1e3a2a]/60 min-h-[220px]">
                      <Mail size={24} className="opacity-45 mb-2" />
                      <p className="text-[13px]">Select a communication from the list to view the official letter.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="p-5 rounded-2xl bg-[#efe6cf] border border-[#1e3a2a]/10 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-[#1e3a2a] text-[#efe6cf] flex items-center justify-center">{icon}</div>
    <div>
      <div className="font-serif-display text-3xl text-[#1e3a2a]">{value}</div>
      <div className="eyebrow text-[#1e3a2a]/55">{label}</div>
    </div>
  </div>
);

const Panel = ({ title, children, className='' }) => (
  <div className={`bg-[#efe6cf] rounded-2xl border border-[#1e3a2a]/10 p-6 ${className}`}>
    <div className="eyebrow text-[#1e3a2a]/55 mb-4">{title}</div>
    {children}
  </div>
);

const Row = ({ icon, k, v }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#1e3a2a]/10 last:border-none">
    <div className="text-[13px] text-[#1e3a2a]/60 flex items-center gap-1.5">{icon}{k}</div>
    <div className="text-[13.5px] text-[#1e3a2a]">{v}</div>
  </div>
);

const Empty = ({ text }) => <div className="text-[13px] text-[#1e3a2a]/55 py-4">{text}</div>;

const StatusPill = ({ status }) => {
  const colors = { pending: 'bg-[#e89670]/20 text-[#c46f4a]', approved: 'bg-[#1e3a2a]/15 text-[#1e3a2a]', rejected: 'bg-red-100 text-red-700' };
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${colors[status] || colors.pending}`}>{status}</span>;
};

export default Dashboard;
