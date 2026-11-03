import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const API = '/api';

const AuthContext = createContext(null);

const DEFAULT_REGISTERED_USERS = [
  {
    id: 'usr_admin_01',
    name: 'AWC Core Coordinator',
    email: 'admin@awcpsg.org',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    department: 'PSG Animal Welfare Committee',
    year: 'Faculty & Core Committee',
    register_no: 'AWC-CORE-01',
    phone: '98421 54321'
  },
  {
    id: 'usr_student_demo',
    name: 'Karthik Raja',
    email: 'student@psgtech.ac.in',
    username: 'karthik',
    password: 'student123',
    role: 'student',
    department: 'Mechanical Engineering',
    year: 'Third Year',
    register_no: '22L101',
    phone: '98401 12345'
  }
];

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('awc_registered_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read registered users', e);
  }
  localStorage.setItem('awc_registered_users', JSON.stringify(DEFAULT_REGISTERED_USERS));
  return DEFAULT_REGISTERED_USERS;
};

const saveStoredUsers = (users) => {
  try {
    localStorage.setItem('awc_registered_users', JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save registered users', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('awc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('awc_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStoredUsers(); // Ensure pre-seeded accounts exist

    const t = localStorage.getItem('awc_token');
    const u = localStorage.getItem('awc_user');

    if (t && u) {
      try {
        setUser(JSON.parse(u));
        setToken(t);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Standard student login - requires pre-existing registration!
  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Please enter both email and password.');
    }

    // Check for admin credentials directly
    const isAdminId = cleanEmail === 'admin' || cleanEmail === 'admin@awcpsg.org' || cleanEmail === 'admin@awc.psgtech.ac.in';
    const isAdminPass = cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'PSGawc@2024';
    if (isAdminId && isAdminPass) {
      return await adminLogin(cleanEmail, cleanPass);
    }

    // Try backend
    try {
      const r = await axios.post(`${API}/auth/login`, { email: cleanEmail, password: cleanPass }, { timeout: 5000 });
      if (r?.data?.user) {
        localStorage.setItem('awc_token', r.data.access_token);
        localStorage.setItem('awc_user', JSON.stringify(r.data.user));
        setToken(r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        throw new Error(err.response?.data?.detail || 'Invalid email/roll number or password.');
      }
      // Fall through to local verification if network error
    }

    // Strict local verification: User MUST be registered first!
    const users = getStoredUsers();
    const foundUser = users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.username && u.username.toLowerCase() === cleanEmail) ||
      (u.register_no && u.register_no.toLowerCase() === cleanEmail)
    );

    if (!foundUser) {
      throw new Error('Account not found. Please click "Student Sign Up" to register.');
    }

    // If registered admin in local storage
    if (foundUser.role === 'admin') {
      return await adminLogin(cleanEmail, cleanPass);
    }

    // Password verification
    if (foundUser.password && foundUser.password !== cleanPass) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: 'student',
      department: foundUser.department || 'PSG College of Technology',
      year: foundUser.year || 'Student Volunteer',
      register_no: foundUser.register_no || '',
      phone: foundUser.phone || '',
    };

    const sessionToken = 'jwt_student_' + Date.now();
    localStorage.setItem('awc_token', sessionToken);
    localStorage.setItem('awc_user', JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
    return sessionUser;
  };

  // Dedicated Admin Login with specific admin credentials
  const adminLogin = async (usernameOrEmail, password) => {
    const cleanId = (usernameOrEmail || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Please enter both Admin username/email and administrative password.');
    }

    try {
      const r = await axios.post(`${API}/auth/login`, { email: cleanId, password: cleanPass }, { timeout: 5000 });
      if (r?.data?.user && r?.data?.user?.role === 'admin') {
        localStorage.setItem('awc_token', r.data.access_token);
        localStorage.setItem('awc_user', JSON.stringify(r.data.user));
        setToken(r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        throw new Error(err.response?.data?.detail || 'Invalid Admin credentials.');
      }
    }

    const users = getStoredUsers();
    const adminUser = users.find(u => 
      u.role === 'admin' && 
      (u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId))
    );

    const isIdMatch = (cleanId === 'admin' || cleanId === 'admin@awcpsg.org' || (adminUser && (adminUser.email.toLowerCase() === cleanId || adminUser.username === cleanId)));
    const isPassMatch = (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'PSGawc@2024' || (adminUser && adminUser.password === cleanPass));

    if (!isIdMatch || !isPassMatch) {
      throw new Error('Invalid Admin credentials! Access to the Admin Panel is restricted to authorized PSG Tech AWC Coordinators.');
    }

    const currentAdmin = adminUser || {
      id: 'usr_admin_01',
      name: 'AWC Core Coordinator',
      email: 'admin@awcpsg.org',
      role: 'admin',
      department: 'PSG Animal Welfare Committee',
      year: 'Faculty & Core Committee',
      register_no: 'AWC-CORE-01',
      phone: '98421 54321'
    };

    const adminSession = {
      ...currentAdmin,
      role: 'admin'
    };

    const adminToken = 'jwt_admin_' + Date.now();
    localStorage.setItem('awc_token', adminToken);
    localStorage.setItem('awc_user', JSON.stringify(adminSession));
    setToken(adminToken);
    setUser(adminSession);
    return adminSession;
  };

  // User Registration
  const register = async (payload) => {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanName = (payload.name || '').trim();
    const cleanPass = (payload.password || '').trim();

    if (!cleanEmail || !cleanPass || !cleanName) {
      throw new Error('Name, Email and Password are required to create an account.');
    }

    // Try backend
    try {
      const r = await axios.post(`${API}/auth/register`, payload, { timeout: 5000 });
      if (r?.data?.user) {
        localStorage.setItem('awc_token', r.data.access_token);
        localStorage.setItem('awc_user', JSON.stringify(r.data.user));
        setToken(r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
    }

    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please Sign In instead.');
    }

    const newUser = {
      id: 'usr_' + Date.now().toString().slice(-6),
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: 'student',
      department: (payload.department || '').trim() || 'PSG College of Technology',
      year: (payload.year || '').trim() || 'Student Volunteer',
      register_no: (payload.register_no || '').trim().toUpperCase(),
      phone: (payload.phone || '').trim(),
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      year: newUser.year,
      register_no: newUser.register_no,
      phone: newUser.phone
    };

    const demoToken = 'jwt_token_' + Date.now();
    localStorage.setItem('awc_token', demoToken);
    localStorage.setItem('awc_user', JSON.stringify(sessionUser));
    setToken(demoToken);
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem('awc_token');
    localStorage.removeItem('awc_user');
    setToken(null);
    setUser(null);
  };

  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      adminLogin, 
      register, 
      logout, 
      authHeader 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
