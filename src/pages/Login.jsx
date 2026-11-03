import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, AlertCircle, User, KeyRound, Building2, Hash, Mail, Phone, Calendar } from 'lucide-react';
import { AwcLogoMark } from '../components/AwcLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

const DEPARTMENTS = [
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering (EEE)',
  'Electronics & Communication Engineering (ECE)',
  'Biotechnology',
  'Biomedical Engineering',
  'Civil Engineering',
  'Production Engineering',
  'Metallurgical Engineering',
  'Fashion Technology',
  'Robotics and Automation',
  'Applied Science / Mathematics',
  'Other Department'
];

const STUDY_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Research Scholar'
];

const Login = () => {
  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  
  // Sign in fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Student Registration fields
  const [studentForm, setStudentForm] = useState({
    name: '',
    register_no: '',
    department: 'Computer Science and Engineering (CSE)',
    custom_department: '',
    year: '1st Year',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setError('Please enter your Email, Roll Number or Username.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your Password.');
      return;
    }

    setBusy(true);

    try {
      const u = await login(cleanId, cleanPass);
      toast({
        title: 'Welcome!',
        description: `Logged in successfully as ${u.name || u.email}.`,
      });
      if (u.role === 'admin') {
        navigate('/admin');
      } else {
        const redirect = location.state?.from || '/dashboard';
        navigate(redirect);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Invalid credentials. Please verify your details.';
      setError(msg);
      toast({
        title: 'Sign In Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const { name, register_no, department, custom_department, year, email, phone, password: regPass, confirm_password } = studentForm;

    if (!name.trim()) {
      setError('Please enter your Student Name.');
      return;
    }
    if (!register_no.trim()) {
      setError('Please enter your Roll No / Register No.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your Email ID.');
      return;
    }
    if (!regPass) {
      setError('Please enter a password.');
      return;
    }
    if (regPass.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (regPass !== confirm_password) {
      setError('Passwords do not match. Please verify your passwords.');
      return;
    }

    const finalDepartment = department === 'Other Department' && custom_department.trim() 
      ? custom_department.trim() 
      : department;

    const payload = {
      name: name.trim(),
      register_no: register_no.trim().toUpperCase(),
      department: finalDepartment,
      year,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: regPass
    };

    setBusy(true);

    try {
      const newUser = await register(payload);
      toast({
        title: 'Account Registered! 🎉',
        description: `Welcome to Animal Welfare Club, ${newUser.name}!`,
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Registration failed. Please check your information.';
      setError(msg);
      toast({
        title: 'Sign Up Failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen w-full bg-[#efe6cf] text-[#1e3a2a] flex flex-col justify-center items-center px-4 sm:px-6">
      <div className="w-full max-w-lg mx-auto">
        {/* Main Card */}
        <div className="bg-[#efe6cf] rounded-3xl border border-[#1e3a2a]/20 p-6 sm:p-8 shadow-sm">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <AwcLogoMark size={72} className="drop-shadow-sm mb-3" />
            <h1 className="font-serif-display text-2xl sm:text-3xl text-[#1e3a2a]">
              Animal Welfare Club
            </h1>
            <p className="text-[11px] text-[#1e3a2a]/60 uppercase tracking-widest font-semibold mt-1">
              PSG College of Technology
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-[#e4dac0] rounded-xl mb-6 border border-[#1e3a2a]/15">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#1e3a2a] text-[#efe6cf] shadow-sm'
                  : 'text-[#1e3a2a]/70 hover:text-[#1e3a2a] hover:bg-black/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#1e3a2a] text-[#efe6cf] shadow-sm'
                  : 'text-[#1e3a2a]/70 hover:text-[#1e3a2a] hover:bg-black/5'
              }`}
            >
              Student Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-100/80 border border-red-300 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span className="font-medium leading-snug">{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5 flex items-center gap-1.5">
                  <User size={13} /> Email, Roll Number or Username
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1.5 flex items-center gap-1.5">
                  <KeyRound size={13} /> Password
                </label>
                <input
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                />
              </div>

              <button
                disabled={busy}
                type="submit"
                className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-[#1e3a2a] hover:bg-[#284d3a] disabled:opacity-60 text-[#efe6cf] px-6 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-98"
              >
                {busy ? 'Verifying…' : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-[#1e3a2a]/70">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-xs font-bold text-[#1e3a2a] underline cursor-pointer hover:text-[#284d3a]"
                >
                  Create Student Account
                </button>
              </div>
            </form>
          )}

          {/* STUDENT SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} noValidate className="space-y-3.5">
              {/* Name & Roll No */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <User size={13} /> Student Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={studentForm.name}
                    onChange={(e) => { setStudentForm({ ...studentForm, name: e.target.value }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <Hash size={13} /> Roll No / Register No <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={studentForm.register_no}
                    onChange={(e) => { setStudentForm({ ...studentForm, register_no: e.target.value.toUpperCase() }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                  <Building2 size={13} /> Department (Dep) <span className="text-red-600">*</span>
                </label>
                <select
                  value={studentForm.department}
                  onChange={(e) => { setStudentForm({ ...studentForm, department: e.target.value }); setError(''); }}
                  className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {studentForm.department === 'Other Department' && (
                  <input
                    type="text"
                    placeholder=""
                    value={studentForm.custom_department}
                    onChange={(e) => { setStudentForm({ ...studentForm, custom_department: e.target.value }); setError(''); }}
                    className="w-full h-10 px-3.5 mt-2 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30"
                  />
                )}
              </div>

              {/* Year & Phone */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <Calendar size={13} /> Year of Study <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => { setStudentForm({ ...studentForm, year: e.target.value }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all cursor-pointer"
                  >
                    {STUDY_YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <Phone size={13} /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder=""
                    value={studentForm.phone}
                    onChange={(e) => { setStudentForm({ ...studentForm, phone: e.target.value }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                  <Mail size={13} /> Email ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder=""
                  value={studentForm.email}
                  onChange={(e) => { setStudentForm({ ...studentForm, email: e.target.value }); setError(''); }}
                  className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <KeyRound size={13} /> Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder=""
                    value={studentForm.password}
                    onChange={(e) => { setStudentForm({ ...studentForm, password: e.target.value }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e3a2a]/80 mb-1 flex items-center gap-1.5">
                    <KeyRound size={13} /> Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder=""
                    value={studentForm.confirm_password}
                    onChange={(e) => { setStudentForm({ ...studentForm, confirm_password: e.target.value }); setError(''); }}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#1e3a2a]/20 text-[#1e3a2a] text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a2a]/30 transition-all"
                  />
                </div>
              </div>

              <button
                disabled={busy}
                type="submit"
                className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-[#1e3a2a] hover:bg-[#284d3a] disabled:opacity-60 text-[#efe6cf] px-6 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-98"
              >
                {busy ? 'Creating Student Profile…' : (
                  <>Create Student Account <ArrowRight size={15} /></>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-[#1e3a2a]/70">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-xs font-bold text-[#1e3a2a] underline cursor-pointer hover:text-[#284d3a]"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#1e3a2a]/70 hover:text-[#1e3a2a] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
