import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  Search
} from 'lucide-react';

export default function LandingPage({ onGoToAdmin, onGoToStudent }) {
  const [stats, setStats] = useState({ totalBooks: 6, availableCopies: 16, totalMembers: 4 });

  useEffect(() => {
    async function fetchPreviewStats() {
      try {
        const [books, members] = await Promise.all([
          bookService.getBooks(),
          memberService.getMembers()
        ]);
        const avail = books.reduce((sum, b) => sum + (b.available_copies || 0), 0);
        setStats({
          totalBooks: books.length || 6,
          availableCopies: avail || 16,
          totalMembers: members.length || 4
        });
      } catch (e) {
        console.warn('Could not fetch preview stats:', e);
      }
    }
    fetchPreviewStats();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.3)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Libra<span style={{ color: '#2563eb' }}>X</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Online Library System
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onGoToStudent}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={onGoToAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px 0 rgba(30, 58, 138, 0.2)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e3a8a'; }}
            >
              <ShieldCheck size={16} />
              <span>Admin / Librarian</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 1.5rem 3.5rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        flex: 1
      }}>
        {/* Modern Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: '#1e40af',
          marginBottom: '1.75rem'
        }}>
          <Sparkles size={15} color="#2563eb" />
          <span>Next-Generation Automated Library Platform</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.15',
          color: '#0f172a',
          maxWidth: '880px',
          margin: '0 auto 1.25rem auto'
        }}>
          Manage Catalog, Circulation &amp; Overdues with <span style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Total Precision</span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#475569',
          maxWidth: '720px',
          margin: '0 auto 2.5rem auto',
          lineHeight: '1.6'
        }}>
          Automated real-time inventory tracking, 1-click student book reservations,
          smart overdue penalty calculation, and live Supabase PostgreSQL persistence.
        </p>

        {/* Cool Dual Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '3.5rem'
        }}>
          {/* Student Portal Card Button */}
          <button
            type="button"
            onClick={onGoToStudent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '1rem 1.75rem',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '2px solid #2563eb',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              minWidth: '270px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 20px -3px rgba(37, 99, 235, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.1)';
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                Student / Patron
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Browse Catalog &amp; Book Books &rarr;
              </div>
            </div>
          </button>

          {/* Librarian / Admin Button */}
          <button
            type="button"
            onClick={onGoToAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '1rem 1.75rem',
              borderRadius: '12px',
              backgroundColor: '#1e3a8a',
              border: '2px solid #1e3a8a',
              boxShadow: '0 10px 20px -3px rgba(30, 58, 138, 0.25)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              minWidth: '270px',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#1e3a8a';
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                Librarian Admin
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#bfdbfe' }}>
                Dashboard, Issues &amp; Returns &rarr;
              </div>
            </div>
          </button>
        </div>

        {/* Live Metrics Preview Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem 2rem',
          maxWidth: '900px',
          margin: '0 auto 4rem auto',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3a8a' }}>
              {stats.totalBooks} Titles
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500', marginTop: '0.25rem' }}>
              Catalog Inventory
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#166534' }}>
              {stats.availableCopies} Copies
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500', marginTop: '0.25rem' }}>
              Available for Loan
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb' }}>
              {stats.totalMembers} Members
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500', marginTop: '0.25rem' }}>
              Registered Patrons
            </div>
          </div>
        </div>

        {/* Core Capabilities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
              Live Stock Telemetry
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
              Instant copy counting. Available copies automatically decrease on issue and restore on return. Never oversell a physical book.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Clock size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
              Automated Overdue Detection
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
              Dynamic penalty calculations based on centralized business rules. Calculates days late and exact fine collection at return time.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <GraduationCap size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
              Student Self-Booking
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
              Patrons can search library titles, inspect availability, self-book titles with 1 click, and monitor their personalized due dates.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>LibraX</strong> — Online Library Management System &bull; Hackathon Edition
          </div>
          <div>
            Built with React &bull; Supabase PostgreSQL &bull; Pure CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
