import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login({ onBackToHome }) {
  const { login, register, isConfigured } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password, name || 'Librarian', 'librarian');
        setSuccessMsg('Account registered successfully! You can now log in.');
        setIsRegistering(false);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-page)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.25rem'
      }}>
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            &larr; Back to Home
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            marginBottom: '0.875rem'
          }}>
            <BookOpen size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)' }}>
            LibraX
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Online Library Management System
          </p>
        </div>

        {/* Configuration Notice if not set */}
        {!isConfigured && (
          <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Setup Notice:</strong> Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file to connect your database.
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="alert alert-danger" style={{ fontSize: '0.8125rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ fontSize: '0.8125rem' }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="librarian@campus.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {loading ? (
              <>
                <span className="loader-spinner" style={{ width: '1rem', height: '1rem' }}></span>
                Processing...
              </>
            ) : (
              isRegistering ? 'Register as Librarian' : 'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Toggle Register / Sign In */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              First time setting up?{' '}
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}
              >
                Create Librarian Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
