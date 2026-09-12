import { useState } from 'react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignup ? 'http://localhost:5000/api/register' : 'http://localhost:5000/api/login';
    const bodyData = isSignup ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
          alert('Registration successful! Please login now.');
          setIsSignup(false);
          setName('');
          setPassword('');
        } else {
          onLogin(data.user);
        }
      } else {
        setError(data.message || data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 p-0" style={{ backgroundColor: '#0f172a', overflow: 'hidden' }}>
      <div className="row h-100 m-0">
        
        {/* LEFT SIDE: Hero Image Banner with Zoom Effect */}
        <div className="col-lg-7 d-none d-lg-block p-0 position-relative overflow-hidden">
          <div className="w-100 h-100" style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            animation: 'zoomEffect 20s infinite alternate',
            transition: 'all 1s ease'
          }}></div>
          <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-end p-5" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', top: 0, left: 0 }}>
            <h1 className="text-white font-weight-bold display-4 mb-2" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>CALMA TRANSPORTATION</h1>
            <p className="text-white-50 lead mb-5" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Experience luxury driving and seamless car rentals at your fingertips.</p>
          </div>
        </div>

        {/* RIGHT SIDE: Login / Sign Up Form with Fade Animation */}
        <div className="col-lg-5 col-md-12 d-flex align-items-center justify-content-center p-4 p-md-5" style={{ backgroundColor: '#0f172a' }}>
          <div className="card border-0 shadow-lg p-4 p-md-5 w-100" style={{ 
            maxWidth: '440px', 
            borderRadius: '20px', 
            backgroundColor: '#1e293b', 
            color: '#f8fafc',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            
            <div className="text-center mb-4">
              <h2 className="font-weight-bold mb-1" style={{ letterSpacing: '1px' }}>
                CAR<span style={{ color: '#38bdf8' }}>BOOK</span>
              </h2>
              <p className="text-muted small">
                {isSignup ? 'Create an account to start booking' : 'Sign in to manage your bookings'}
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center shadow-sm" style={{ borderRadius: '10px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <div className="form-group mb-3" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label className="small font-weight-bold text-muted">FULL NAME</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-0 py-2 shadow-none"
                    style={{ borderRadius: '10px', transition: 'all 0.3s' }}
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group mb-3">
                <label className="small font-weight-bold text-muted">EMAIL ADDRESS</label>
                <input
                  type="email"
                  className="form-control bg-dark text-white border-0 py-2 shadow-none"
                  style={{ borderRadius: '10px', transition: 'all 0.3s' }}
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="small font-weight-bold text-muted">PASSWORD</label>
                <input
                  type="password"
                  className="form-control bg-dark text-white border-0 py-2 shadow-none"
                  style={{ borderRadius: '10px', transition: 'all 0.3s' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-block py-3 font-weight-bold text-white shadow-lg"
                style={{ 
                  backgroundColor: '#38bdf8', 
                  border: 'none', 
                  borderRadius: '10px', 
                  transition: 'transform 0.2s, background-color 0.2s' 
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isSignup ? 'REGISTER ACCOUNT' : 'LOGIN')}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="small text-muted mb-0">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  className="btn btn-link p-0 font-weight-bold"
                  style={{ color: '#38bdf8', textDecoration: 'none', transition: 'opacity 0.2s' }}
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                >
                  {isSignup ? 'Login here' : 'Sign up here'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomEffect {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        input.form-control:focus {
          background-color: #0f172a !important;
          box-shadow: 0 0 0 2px #38bdf8 !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}