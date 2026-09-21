import { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// Page Components
import About from './About'; 
import Services from './Services';
import Cars from './Cars';
import Contact from './Contact';
import Login from './Login';
import MyReservations from './MyReservations';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminCars from './AdminCars';
import AdminReservations from './AdminReservations';
import LiveChatWidget from './LiveChatWidget'; // ✅ Live Chat Widget

export default function App() {
  const location = useLocation();
  
  // 1. Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('userRole') || 'user';
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('userId') || '';
  });

  const isAdminPath = location.pathname.toLowerCase().startsWith('/admin');

  // --- HANDLERS ---
  const handleLogin = (user: any) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
    const idAsString = String(user.id);
    setUserId(idAsString); 
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', idAsString);
    localStorage.setItem('userEmail', user.email);

    if (user.role === 'admin') {
      window.location.href = '/admin'; 
    } else {
      window.location.href = '/';
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    setUserId('');
    localStorage.clear();
    window.location.href = '/login';
  };

  // --- RENDER LOGIC ---

  // A. AUTH GATEKEEPER
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // B. ADMIN VIEW
  if (isAdminPath && userRole === 'admin') {
    return (
      <div className="admin-layout-wrapper">
        <Routes>
          <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
          <Route path="/admin/users" element={<AdminUsers onLogout={handleLogout} />} />
          <Route path="/admin/cars" element={<AdminCars onLogout={handleLogout} />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/reservations" element={<AdminReservations onLogout={handleLogout} />} />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
  }

  // C. USER VIEW
  return (
    <div className="user-layout-wrapper d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* USER NAVBAR - MODERN DARK THEME */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top shadow" style={{ backgroundColor: '#0f172a', padding: '15px 0', borderBottom: '1px solid #1e293b', zIndex: 1050 }}>
        <div className="container">
          <Link to="/" className="navbar-brand font-weight-bold" style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>
            CAR<span style={{ color: '#38bdf8' }}>BOOK</span>
          </Link>
          
          <button
            className="navbar-toggler mobile-nav-toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(prev => !prev)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${mobileNavOpen ? 'show' : ''}`} id="userNav">
            <ul className="navbar-nav ml-auto align-items-center mobile-user-nav" style={{ gap: '5px' }}>
              <li className="nav-item"><Link to="/" onClick={() => setMobileNavOpen(false)} className="nav-link text-white px-3 font-weight-medium">Home</Link></li>
              <li className="nav-item"><Link to="/cars" onClick={() => setMobileNavOpen(false)} className="nav-link text-white px-3 font-weight-medium">Cars</Link></li>
              <li className="nav-item"><Link to="/reservations" onClick={() => setMobileNavOpen(false)} className="nav-link text-white px-3 font-weight-medium">My Bookings</Link></li>
              <li className="nav-item"><Link to="/profile" onClick={() => setMobileNavOpen(false)} className="nav-link text-white px-3 font-weight-medium">Profile</Link></li>
              <li className="nav-item"><Link to="/about" onClick={() => setMobileNavOpen(false)} className="nav-link text-white px-3 font-weight-medium">About</Link></li>
              
              {userRole === 'admin' && (
                <li className="nav-item ml-2">
                  <Link to="/admin" onClick={() => setMobileNavOpen(false)} className="nav-link text-dark font-weight-bold px-3 py-2 bg-warning rounded-pill shadow-sm" style={{ fontSize: '13px' }}>
                    <i className="fa fa-user-shield mr-1"></i> ADMIN PANEL
                  </Link>
                </li>
              )}

              <li className="nav-item ml-lg-3">
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm font-weight-bold px-4 py-2 rounded-pill shadow-sm" style={{ fontSize: '13px', transition: 'all 0.3s' }}>
                  <i className="fa fa-sign-out-alt mr-1"></i> LOGOUT
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Routes>
          {/* HOME PAGE: HERO CAROUSEL */}
          <Route path="/" element={
            <div className="hero-carousel-wrapper" style={{ minHeight: '100vh', position: 'relative' }}>
              <div id="homeCarCarousel" className="carousel slide carousel-fade" data-ride="carousel" data-interval="4000" style={{ height: '100vh' }}>
                
                <ol className="carousel-indicators">
                  <li data-target="#homeCarCarousel" data-slide-to="0" className="active"></li>
                  <li data-target="#homeCarCarousel" data-slide-to="1"></li>
                  <li data-target="#homeCarCarousel" data-slide-to="2"></li>
                </ol>

                <div className="carousel-inner" style={{ height: '100vh' }}>
                  
                  {/* Slide 1 */}
                  <div className="carousel-item active" style={{ height: '100vh' }}>
                    <div className="d-block w-100 h-100" style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920')", 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}></div>
                    <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', bottom: 0, left: 0, right: 0, top: 0, position: 'absolute' }}>
                      <h1 style={{ fontSize: '3.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        Calma Transportation
                      </h1>
                      <p className="lead mb-5" style={{ fontSize: '1.4rem', opacity: 0.9 }}>
                        Experience premium comfort and reliable car rentals for your next journey.
                      </p>
                      <Link to="/cars" className="btn btn-lg px-5 py-3 shadow-lg rounded-pill font-weight-bold text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', fontSize: '1.1rem' }}>
                        Book Your Car Now <i className="fa fa-arrow-right ml-2"></i>
                      </Link>
                    </div>
                  </div>

                  {/* Slide 2 */}
                  <div className="carousel-item" style={{ height: '100vh' }}>
                    <div className="d-block w-100 h-100" style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1920')", 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}></div>
                    <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', bottom: 0, left: 0, right: 0, top: 0, position: 'absolute' }}>
                      <h1 style={{ fontSize: '3.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        Luxury & Modern Fleet
                      </h1>
                      <p className="lead mb-5" style={{ fontSize: '1.4rem', opacity: 0.9 }}>
                        Drive the latest models equipped with top-tier technology and safety.
                      </p>
                      <Link to="/cars" className="btn btn-lg px-5 py-3 shadow-lg rounded-pill font-weight-bold text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', fontSize: '1.1rem' }}>
                        Explore Our Fleet <i className="fa fa-arrow-right ml-2"></i>
                      </Link>
                    </div>
                  </div>

                  {/* Slide 3 */}
                  <div className="carousel-item" style={{ height: '100vh' }}>
                    <div className="d-block w-100 h-100" style={{ 
                      backgroundImage: "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920')", 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}></div>
                    <div className="carousel-caption d-flex flex-column align-items-center justify-content-center h-100" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', bottom: 0, left: 0, right: 0, top: 0, position: 'absolute' }}>
                      <h1 style={{ fontSize: '3.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        Fast & Easy Booking
                      </h1>
                      <p className="lead mb-5" style={{ fontSize: '1.4rem', opacity: 0.9 }}>
                        Reserve your ride in just a few clicks with our hassle-free system.
                      </p>
                      <Link to="/cars" className="btn btn-lg px-5 py-3 shadow-lg rounded-pill font-weight-bold text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', fontSize: '1.1rem' }}>
                        Get Started <i className="fa fa-arrow-right ml-2"></i>
                      </Link>
                    </div>
                  </div>

                </div>

                <a className="carousel-control-prev" href="#homeCarCarousel" role="button" data-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="sr-only">Previous</span>
                </a>
                <a className="carousel-control-next" href="#homeCarCarousel" role="button" data-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="sr-only">Next</span>
                </a>
              </div>
            </div>
          } />
          
          <Route path="/cars" element={<Cars />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* USER FOOTER - MODERN DARK THEME */}
      <footer className="py-4 mt-auto border-top" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <div className="container text-center text-white">
          <p className="mb-1 font-weight-bold">CALMA <span style={{ color: '#38bdf8' }}>TRANSPORTATION</span></p>
          <p className="mb-0 small opacity-50">
            User ID: {userId} | Session: Active | © 2026 CarBook System
          </p>
        </div>
      </footer>

      {/* 💬 LIVE CHAT SUPPORT WIDGET */}
      <LiveChatWidget />
    </div>
  );
}