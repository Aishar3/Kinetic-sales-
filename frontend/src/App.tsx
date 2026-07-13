import { useState, useEffect } from 'react';
import './App.css';

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  estimatedValue: number;
  source: string | null;
  createdAt: string;
}

interface Task {
  id: string;
  leadId: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  dueDate: string | null;
  createdAt: string;
}

interface SimulatorMessage {
  sender: 'ai' | 'customer';
  text: string;
}

export default function App() {
  const API_URL = 'http://localhost:3001/api/v1';

  // ─── AUTHENTICATION STATE ───
  const [token, setToken] = useState<string | null>(localStorage.getItem('kinetic_token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('kinetic_user_email'));
  
  // Login/Signup Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // ─── DASHBOARD BUSINESS STATE (Fetched from Backend DB) ───
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'pipeline' | 'tasks'>('dashboard');
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Add Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    estimatedValue: '',
    source: 'Manual Entry'
  });

  // ─── SIMULATOR STATE (For Marketing Page) ───
  const [simMessages, setSimMessages] = useState<SimulatorMessage[]>([
    { sender: 'ai', text: 'Hi! I am the Kinetic Sales Copilot. Try typing your budget!' }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simName, setSimName] = useState('New Visitor');
  const [simBudget, setSimBudget] = useState(0);
  const [simStatus, setSimStatus] = useState('new');
  const [simTasks, setSimTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Analyze website visitor behavior', done: true }
  ]);

  // ─── FETCH DATA FROM REAL BACKEND DATABASE ───
  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      // 1. Fetch leads
      const leadsRes = await fetch(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      }

      // 2. Fetch tasks
      const tasksRes = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // ─── HANDLERS FOR AUTH ───
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      if (authMode === 'login') {
        const sessionToken = data.session.accessToken;
        localStorage.setItem('kinetic_token', sessionToken);
        localStorage.setItem('kinetic_user_email', data.user.email);
        setToken(sessionToken);
        setUserEmail(data.user.email);
        setShowAuthModal(false);
      } else {
        setAuthSuccess('Signup successful! Check your email for a verification link.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kinetic_token');
    localStorage.removeItem('kinetic_user_email');
    setToken(null);
    setUserEmail(null);
    setLeads([]);
    setTasks([]);
  };

  // ─── HANDLERS FOR DASHBOARD (DB mutations) ───
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newLeadForm.name,
          company: newLeadForm.company,
          email: newLeadForm.email,
          phone: newLeadForm.phone,
          estimatedValue: Number(newLeadForm.estimatedValue) * 100, // convert to cents
          source: newLeadForm.source
        })
      });

      if (res.ok) {
        setIsAddLeadOpen(false);
        setNewLeadForm({ name: '', company: '', email: '', phone: '', estimatedValue: '', source: 'Manual Entry' });
        fetchDashboardData(); // Refresh list from database
      }
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleMoveLead = async (leadId: string, currentStatus: Lead['status'], direction: 'forward' | 'backward') => {
    if (!token) return;
    const statusOrder: Lead['status'][] = ['new', 'contacted', 'qualified', 'won', 'lost'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    let newIndex = currentIndex;

    if (direction === 'forward' && currentIndex < statusOrder.length - 1) {
      newIndex += 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      newIndex -= 1;
    }

    if (newIndex === currentIndex) return;

    try {
      const res = await fetch(`${API_URL}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusOrder[newIndex] })
      });

      if (res.ok) {
        fetchDashboardData(); // Refresh list from DB
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: Task['status']) => {
    if (!token) return;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchDashboardData(); // Refresh list from DB
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // ─── SIMULATOR INTERACTION LOGIC (Marketing view) ───
  const handleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim()) return;

    const userText = simInput;
    setSimMessages((prev) => [...prev, { sender: 'customer', text: userText }]);
    setSimInput('');

    setTimeout(() => {
      let reply = "I've logged that! Ask me about budgets or try typing your name.";

      if (userText.toLowerCase().includes('budget') || userText.includes('$')) {
        const numbers = userText.match(/\d+/g);
        if (numbers) {
          const budget = parseInt(numbers[0]);
          setSimBudget(budget);
          setSimStatus('qualified');
          reply = `I have logged your project budget of $${budget.toLocaleString()}! A task has been added to our dashboard pipeline.`;
          setSimTasks((prev) => [
            ...prev,
            { id: String(prev.length + 1), text: `Create proposal for $${budget.toLocaleString()}`, done: false }
          ]);
        }
      } else if (userText.toLowerCase().includes('name is') || userText.toLowerCase().includes('i am')) {
        const words = userText.split(' ');
        const name = words[words.length - 1];
        setSimName(name);
        setSimStatus('contacted');
        reply = `Nice to meet you, ${name}! Your contact profile is now registered on the live dashboard.`;
      }

      setSimMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  // Dashboard calculations
  const totalValue = leads
    .filter((l) => l.status !== 'lost')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const activeLeadsCount = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeadsCount = leads.filter((l) => l.status === 'won').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  // Render Currency Helper
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-[#03000a] text-slate-100 font-sans relative selection:bg-purple-500/30 overflow-hidden">
      
      {/* ─── STATE A: RENDERS FULL ADMIN DASHBOARD (IF LOGGED IN) ─── */}
      {token ? (
        <div className="flex min-h-screen app-layout animate-fade-in relative z-10">
          
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="logo-container">
              <div className="logo-icon">K</div>
              <div className="logo-text">Kinetic</div>
            </div>

            <nav className="nav-links">
              <button
                onClick={() => setDashboardTab('dashboard')}
                className={`nav-item ${dashboardTab === 'dashboard' ? 'active' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
                Dashboard Overview
              </button>

              <button
                onClick={() => setDashboardTab('pipeline')}
                className={`nav-item ${dashboardTab === 'pipeline' ? 'active' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M5 17V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v12" /><path d="M9 8h6M9 12h6" /></svg>
                Leads Pipeline
              </button>

              <button
                onClick={() => setDashboardTab('tasks')}
                className={`nav-item ${dashboardTab === 'tasks' ? 'active' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Tasks Checklist
              </button>
            </nav>

            <div className="sidebar-footer">
              <div className="flex items-center justify-between">
                <div className="user-profile">
                  <div className="user-avatar">AD</div>
                  <div className="user-info">
                    <span className="user-name">Admin</span>
                    <span className="user-role">{userEmail}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 rounded bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:text-white transition-all text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Window */}
          <main className="main-content">
            <header className="header">
              <div className="header-title">
                <h1>
                  {dashboardTab === 'dashboard' && 'Sales Performance'}
                  {dashboardTab === 'pipeline' && 'Live Database Pipeline'}
                  {dashboardTab === 'tasks' && 'Follow-up checklist'}
                </h1>
                <p>
                  {dashboardTab === 'dashboard' && 'Real-time sales numbers fetched securely from PostgreSQL'}
                  {dashboardTab === 'pipeline' && 'Move customer cards to change statuses live in the database'}
                  {dashboardTab === 'tasks' && 'Sales action items registered by your AI system'}
                </p>
              </div>

              <div className="header-actions">
                <button className="btn btn-secondary" onClick={fetchDashboardData}>
                  Refresh Data
                </button>
                <button className="btn btn-primary" onClick={() => setIsAddLeadOpen(true)}>
                  Add New Lead
                </button>
              </div>
            </header>

            {/* View A: Stats Cards Grid */}
            {dashboardTab === 'dashboard' && (
              <div className="space-y-12">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div>
                      <span className="stat-title">Real Deal Pipeline</span>
                      <div className="stat-value">{formatCurrency(totalValue)}</div>
                      <span className="stat-change up">Active Value</span>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)' }}>
                      $
                    </div>
                  </div>

                  <div className="stat-card">
                    <div>
                      <span className="stat-title">Active AI Chats</span>
                      <div className="stat-value">{activeLeadsCount}</div>
                      <span className="stat-change up">Unclosed Leads</span>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)' }}>
                      👤
                    </div>
                  </div>

                  <div className="stat-card">
                    <div>
                      <span className="stat-title">Deals Closed Won</span>
                      <div className="stat-value">{wonLeadsCount}</div>
                      <span className="stat-change up">Sales Won</span>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                      ✓
                    </div>
                  </div>

                  <div className="stat-card">
                    <div>
                      <span className="stat-title">Actions Pending</span>
                      <div className="stat-value">{pendingTasksCount}</div>
                      <span className="stat-change down">Open Tasks</span>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                      📋
                    </div>
                  </div>
                </div>

                {/* Leads Table */}
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'left' }}>Database Records</h2>
                <div style={{ background: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Name</th>
                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Company</th>
                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Value</th>
                        <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{lead.name}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{lead.company || 'N/A'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{lead.email || 'N/A'}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{formatCurrency(lead.estimatedValue)}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: 
                                lead.status === 'won' ? 'rgba(16, 185, 129, 0.1)' :
                                lead.status === 'lost' ? 'rgba(239, 68, 68, 0.1)' :
                                lead.status === 'qualified' ? 'rgba(139, 92, 246, 0.1)' :
                                'rgba(245, 158, 11, 0.1)',
                              color: 
                                lead.status === 'won' ? 'var(--color-success)' :
                                lead.status === 'lost' ? 'var(--color-danger)' :
                                lead.status === 'qualified' ? 'var(--color-primary)' :
                                'var(--color-warning)'
                            }}>
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No customer records found. Add a lead using the button in the top right!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View B: Kanban Board */}
            {dashboardTab === 'pipeline' && (
              <div className="kanban-container">
                {(['new', 'contacted', 'qualified', 'won', 'lost'] as const).map((colName) => {
                  const columnLeads = leads.filter((l) => l.status === colName);
                  const columnColor = 
                    colName === 'new' ? 'var(--color-secondary)' :
                    colName === 'contacted' ? 'var(--color-warning)' :
                    colName === 'qualified' ? 'var(--color-primary)' :
                    colName === 'won' ? 'var(--color-success)' : 'var(--color-danger)';
                  
                  return (
                    <div className="kanban-column" key={colName}>
                      <div className="column-header">
                        <span className="column-title">
                          <span className="column-dot" style={{ backgroundColor: columnColor }} />
                          {colName}
                        </span>
                        <span className="column-count">{columnLeads.length}</span>
                      </div>

                      <div className="kanban-cards-list">
                        {columnLeads.map((lead) => (
                          <div className="kanban-card" key={lead.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span className="card-lead-name">{lead.name}</span>
                              <div style={{ display: 'flex', gap: '0.15rem' }}>
                                <button 
                                  onClick={() => handleMoveLead(lead.id, lead.status, 'backward')}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}
                                >
                                  ‹
                                </button>
                                <button 
                                  onClick={() => handleMoveLead(lead.id, lead.status, 'forward')}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}
                                >
                                  ›
                                </button>
                              </div>
                            </div>
                            <span className="card-company">{lead.company || 'No Company'}</span>
                            <span className="card-value">{formatCurrency(lead.estimatedValue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View C: Task List */}
            {dashboardTab === 'tasks' && (
              <div className="tasks-panel text-left">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Tasks</h2>
                <div className="task-list">
                  {tasks.map((task) => (
                    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`} key={task.id}>
                      <div 
                        className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task.id, task.status)}
                      >
                        {task.status === 'completed' && '✓'}
                      </div>
                      <div className="task-details">
                        <span className="task-title">{task.title}</span>
                        <span className="task-desc">{task.description || 'No description provided.'}</span>
                        {task.dueDate && <span className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>No actions pending.</p>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Add Lead Modal */}
          {isAddLeadOpen && (
            <div className="modal-overlay">
              <div className="modal-content text-left">
                <div className="modal-header">
                  <h2>Add Customer Record</h2>
                  <button className="modal-close-btn" onClick={() => setIsAddLeadOpen(false)}>×</button>
                </div>

                <form onSubmit={handleAddLead}>
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Connor"
                      value={newLeadForm.name}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      placeholder="Cyberdyne"
                      value={newLeadForm.company}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="sarah@cyberdyne.io"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="555-0199"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Deal Value ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="12000"
                      value={newLeadForm.estimatedValue}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddLeadOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ─── STATE B: RENDERS PUBLIC MARKETING WEBSITE (IF NOT LOGGED IN) ─── */
        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-white/5 bg-[#03000a]/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                  K
                </div>
                <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  KINETIC
                </span>
              </div>
              
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#simulator" className="hover:text-cyan-400 transition-colors">Interactive Demo</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              </nav>

              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="relative group overflow-hidden px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-white border border-purple-500/30 bg-purple-950/20 hover:border-purple-400/60 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </header>

          {/* Hero & Simulator */}
          <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-6 text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-semibold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Next-Gen Sales automation
                </div>
                
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white">
                  Automate Your Sales From Capture to Close
                </h1>
                
                <p className="text-lg text-slate-400 font-light leading-relaxed max-w-xl">
                  The premium AI-powered Sales Operating System that captures, qualifies, and nurtures leads 24/7. Try the simulator on the right!
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <a 
                    href="#simulator" 
                    className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-102 transition-all active:scale-98 flex items-center gap-2"
                  >
                    Try Live Simulator
                  </a>
                  <button 
                    onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    className="px-8 py-4 rounded-xl font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Simulator Playground */}
              <div id="simulator" className="lg:col-span-6 w-full flex flex-col md:flex-row gap-6 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-2xl rounded-3xl opacity-50 pointer-events-none" />
                
                {/* Phone Panel */}
                <div className="w-full md:w-[260px] h-[400px] border border-white/10 bg-[#090614]/90 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl">
                  <div className="bg-[#0f0c22] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Kinetic Assistant</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  </div>

                  <div className="flex-grow p-3 overflow-y-auto space-y-3 flex flex-col">
                    {simMessages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                          m.sender === 'ai' 
                            ? 'bg-slate-900 border border-white/5 text-slate-200 self-start' 
                            : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white self-end'
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSimSubmit} className="p-2 border-t border-white/5 bg-[#090614]">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type name or budget..."
                        value={simInput}
                        onChange={(e) => setSimInput(e.target.value)}
                        className="flex-grow bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <button className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all">
                        Send
                      </button>
                    </div>
                  </form>
                </div>

                {/* Dashboard Card */}
                <div className="flex-grow border border-white/10 bg-[#070510]/80 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live CRM Database</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">Connected</span>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="bg-white/3 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">Lead Contact</p>
                          <p className="text-sm font-bold text-white">{simName}</p>
                        </div>
                        <span className="text-xs capitalize font-bold text-cyan-400">{simStatus}</span>
                      </div>

                      <div className="bg-white/3 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">Qualified Budget</p>
                          <p className="text-sm font-bold text-green-400">
                            {simBudget === 0 ? 'Analyzing...' : `$${simBudget.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-left space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">AI Task Trigger</p>
                      {simTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-xs text-slate-300 bg-white/2 p-2 rounded border border-white/5">
                          <span className={`w-3 h-3 rounded flex items-center justify-center text-[8px] border ${task.done ? 'bg-purple-600 border-purple-600' : 'border-white/20'}`}>
                            {task.done && '✓'}
                          </span>
                          <span className={task.done ? 'line-through text-slate-600' : ''}>{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-24 bg-[#05020c] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
              <div className="space-y-4 max-w-xl mx-auto">
                <h2 className="font-display text-4xl font-extrabold text-white">Built for Scale, Fueled by Intelligence</h2>
                <p className="text-slate-400 font-light">Kinetic automates your entire pipeline so you can focus on building relationships.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {['Capture Leads 24/7', 'Automate Qualification', 'Auto-Book Consultations', 'Accelerate Deals'].map((title, i) => (
                  <div key={i} className="p-8 rounded-2xl border border-white/5 bg-[#090614] hover:bg-slate-950 hover:border-purple-500/30 transition-all duration-300 flex flex-col items-start text-left space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl">✓</div>
                    <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">
                      {i === 0 && 'Never miss a late-night website visitor with our instant-response AI receptionist.'}
                      {i === 1 && 'Instantly filter out low-budget queries and identify high-value buyers.'}
                      {i === 2 && 'Let qualified leads schedule consultations directly onto your calendar.'}
                      {i === 3 && 'Nurture prospects with automated email and SMS follow-ups.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-16 text-center opacity-30">
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
              <span className="font-display text-2xl font-bold text-white">VERCEL</span>
              <span className="font-display text-2xl font-extrabold text-white">stripe</span>
              <span className="font-display text-2xl font-bold text-white">SUPABASE</span>
              <span className="font-display text-2xl font-semibold text-white">retool</span>
              <span className="font-display text-2xl font-bold text-white">LINEAR</span>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5">
            <div className="text-center space-y-16">
              <h2 className="font-display text-4xl font-extrabold text-white">Smarter Pricing For Scalable Growth</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
                {/* Starter */}
                <div className="p-8 rounded-2xl border border-white/5 bg-[#090614]/50 flex flex-col justify-between text-left space-y-8">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Starter</h3>
                    <p className="text-xs text-slate-500 mt-2">Freelancers and small businesses starting automation.</p>
                    <div className="py-6 text-3xl font-extrabold text-white">Contact Sales</div>
                    <ul className="space-y-3.5 text-sm text-slate-400">
                      {['Lead Management', 'Contact Database', 'Sales Pipeline', 'Appointment Booking', 'Email Support'].map((f) => (
                        <li key={f} className="flex items-center gap-2">✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-3.5 rounded-xl border border-white/10 bg-slate-950 text-slate-300 hover:text-white transition-all text-sm font-bold">
                    Get Started
                  </button>
                </div>

                {/* Growth */}
                <div className="p-8 rounded-3xl border-2 border-purple-500 bg-[#0d071c] flex flex-col justify-between text-left space-y-8 relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-xs font-bold uppercase tracking-widest shadow-md">Most Popular</div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Growth</h3>
                    <p className="text-xs text-slate-300 mt-2">Growing agencies and service businesses looking to scale.</p>
                    <div className="py-6 text-3xl font-extrabold text-white">Book a Demo</div>
                    <ul className="space-y-3.5 text-sm text-slate-300">
                      {['Everything in Starter', 'AI Lead Qualification', 'Automated Follow-ups', 'Workflow Automation', 'CRM Integrations', 'Analytics Dashboard', 'Multi-user Access', 'Priority Support'].map((f) => (
                        <li key={f} className="flex items-center gap-2">✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-95 transition-all text-sm font-bold shadow-lg shadow-purple-500/20">
                    Get Started
                  </button>
                </div>

                {/* Enterprise */}
                <div className="p-8 rounded-2xl border border-white/5 bg-[#090614]/50 flex flex-col justify-between text-left space-y-8">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Enterprise</h3>
                    <p className="text-xs text-slate-500 mt-2">High-growth companies with advanced sales operations.</p>
                    <div className="py-6 text-3xl font-extrabold text-white">Custom Pricing</div>
                    <ul className="space-y-3.5 text-sm text-slate-400">
                      {['Everything in Growth', 'Unlimited Contacts', 'Unlimited Automations', 'AI Sales Agents', 'API Access', 'White Label', 'Dedicated Account Manager'].map((f) => (
                        <li key={f} className="flex items-center gap-2">✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="w-full py-3.5 rounded-xl border border-white/10 bg-slate-950 text-slate-300 hover:text-white transition-all text-sm font-bold">
                    Get Started
                  </button>
                </div>
              </div>

              <div className="pt-8">
                <p className="text-sm text-slate-500 italic">"No long-term contracts. Personalized onboarding. Built to help you scale your sales with confidence."</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/5 py-8 bg-[#03000a] text-center">
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Kinetic Inc. All rights reserved.</p>
          </footer>
        </div>
      )}

      {/* ─── AUTHENTICATION POPUP MODAL (LOGIN / SIGNUP) ─── */}
      {showAuthModal && (
        <div className="modal-overlay z-[100]">
          <div className="modal-content text-left max-w-sm w-full bg-[#0d0a1b] border border-white/10 p-8 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {authMode === 'login' ? 'Sign In to Kinetic' : 'Create Admin Account'}
              </h2>
              <button 
                onClick={() => { setShowAuthModal(false); setAuthError(''); setAuthSuccess(''); }}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@kinetic.io"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {authError && <p className="text-xs font-semibold text-red-400">{authError}</p>}
              {authSuccess && <p className="text-xs font-semibold text-green-400">{authSuccess}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-95 transition-all text-sm font-bold shadow-lg shadow-purple-500/20"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
