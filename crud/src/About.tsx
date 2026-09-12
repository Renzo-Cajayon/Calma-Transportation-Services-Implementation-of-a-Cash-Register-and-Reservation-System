import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', paddingBottom: '80px' }}>
      
      {/* HERO SECTION */}
      <div className="position-relative py-5 text-center" style={{ 
        backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        paddingTop: '100px',
        paddingBottom: '100px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div className="container">
          <span className="badge bg-primary text-white px-3 py-2 rounded-pill mb-3 font-weight-bold" style={{ backgroundColor: '#38bdf8 !important', fontSize: '12px', letterSpacing: '1px' }}>
            ABOUT CALMA TRANSPORTATION
          </span>
          <h1 className="display-4 font-weight-bold mb-3">Driven by Excellence & Safety</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Your premier partner for luxury, reliability, and seamless car rentals. We connect travelers with top-tier vehicles for any journey.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container mt-5">
        
        {/* WHO WE ARE ROW */}
        <div className="row align-items-center mb-5 pb-5" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h2 className="font-weight-bold mb-4" style={{ color: '#f8fafc' }}>
              Redefining the Way You <span style={{ color: '#38bdf8' }}>Travel</span>
            </h2>
            <p className="text-muted" style={{ lineHeight: '1.8' }}>
              Founded with a passion for mobility and top-notch customer service, **Calma Transportation (CarBook)** offers a streamlined platform designed to make vehicle rentals effortless. Whether you need a fuel-efficient compact car for city driving, a rugged SUV for family adventures, or an executive ride for business meetings, we've got you covered.
            </p>
            <p className="text-muted" style={{ lineHeight: '1.8' }}>
              Our mission is to provide transparent pricing, well-maintained fleets, and 24/7 customer support ensuring that every mile you drive is safe, comfortable, and memorable.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="position-relative shadow-lg rounded-lg overflow-hidden" style={{ borderRadius: '20px' }}>
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000" 
                alt="Luxury Car Fleet" 
                className="w-100" 
                style={{ height: '350px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* CORE VALUES / FEATURES CARDS */}
        <div className="text-center mb-5">
          <h3 className="font-weight-bold mb-2">Why Choose Us?</h3>
          <p className="text-muted small">We take pride in delivering exceptional value to all our clients.</p>
        </div>

        <div className="row text-center mb-5">
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ backgroundColor: '#1e293b', borderRadius: '16px' }}>
              <div className="mb-3 text-primary" style={{ fontSize: '32px' }}>🛡️</div>
              <h5 className="font-weight-bold text-white mb-2">Verified & Safe Fleet</h5>
              <p className="text-muted small mb-0">Every vehicle undergoes rigorous maintenance checks and sanitation before and after every rental period.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ backgroundColor: '#1e293b', borderRadius: '16px' }}>
              <div className="mb-3 text-primary" style={{ fontSize: '32px' }}>⚡</div>
              <h5 className="font-weight-bold text-white mb-2">Instant Booking</h5>
              <p className="text-muted small mb-0">Our streamlined platform lets you browse, choose, and secure your ride in just a few clicks.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ backgroundColor: '#1e293b', borderRadius: '16px' }}>
              <div className="mb-3 text-primary" style={{ fontSize: '32px' }}>💬</div>
              <h5 className="font-weight-bold text-white mb-2">24/7 Support & AI Assistance</h5>
              <p className="text-muted small mb-0">Have questions about your rental? Our integrated assistant and support team are always ready to help.</p>
            </div>
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="card border-0 shadow-lg text-center p-5" style={{ backgroundColor: '#1e293b', borderRadius: '24px', backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.95))' }}>
          <h3 className="font-weight-bold text-white mb-3">Ready to Hit the Road?</h3>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            Explore our wide selection of cars and book your next trip with Calma Transportation today.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-primary px-4 py-3 font-weight-bold shadow-sm rounded-pill" style={{ backgroundColor: '#38bdf8', border: 'none', color: '#0f172a' }}>
              Browse Available Cars
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}