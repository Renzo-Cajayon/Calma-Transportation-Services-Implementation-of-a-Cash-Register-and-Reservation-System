import { useState, useEffect } from 'react';
import BookingModal from './BookingModal';

export default function Cars() {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [carList, setCarList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // --- KUKUNIN ANG DATA MULA SA BACKEND/DATABASE ---
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        const data = await response.json();
        
        setCarList(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading fleet:", err);
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Helper function para sa intelligent automatic category mapping
  const getCategoryTag = (brand: string, name: string) => {
    const fullText = `${brand || ''} ${name || ''}`.toLowerCase();
    if (fullText.includes('mustang') || fullText.includes('ferrari')) return 'Sports Luxury';
    if (fullText.includes('hilux') || fullText.includes('ranger') || fullText.includes('pickup')) return 'Utility Pickup';
    if (fullText.includes('vios') || fullText.includes('civic') || fullText.includes('sedan')) return 'Premium Sedan';
    return 'Standard Fleet';
  };

  return (
    <section className="ftco-section bg-light" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-md-7 text-center heading-section">
            <span className="subheading" style={{ color: '#104494', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Our Fleet</span>
            <h2 className="mb-3" style={{ fontWeight: '800', color: '#1E293B' }}>Choose Your Car</h2>
            <p className="text-muted">Real-time inventory from our corporate database.</p>
          </div>
        </div>

        <div className="row">
          {loading ? (
            <div className="col-12 text-center p-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Checking available units...</p>
            </div>
          ) : carList.length > 0 ? (
            carList.map((car) => {
              const statusLower = String(car.status || '').toLowerCase().trim();
              const isAvailable = statusLower === 'available';
              const isMaintenance = statusLower === 'maintenance';

              return (
                <div key={car.id} className="col-md-4 mb-4">
                  <div 
                    className="car-wrap rounded bg-white overflow-hidden border-0 h-100 position-relative"
                    style={{
                      boxShadow: '0 10px 30px -15px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      borderRadius: '16px',
                      opacity: isAvailable ? 1 : 0.85
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable) {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(16,68,148,0.18)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px -15px rgba(0,0,0,0.08)';
                    }}
                  >
                    
                    {/* Premium Showroom Studio Image Box Wrapper */}
                    <div 
                      className="position-relative overflow-hidden" 
                      style={{ 
                        height: '220px', 
                        backgroundColor: '#F1F5F9',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      {/* Image rendering component */}
                      <img 
                        src={car.image_url || '/images/default-car.jpg'} 
                        alt={`${car.brand} ${car.name}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          zIndex: 1,
                          filter: isAvailable ? 'none' : 'grayscale(30%)'
                        }}
                      />

                      {/* BADGES ROW LAYOUT */}
                      <div 
                        className="position-absolute start-0 end-0 p-3 d-flex justify-content-between align-items-center" 
                        style={{ top: '0', zIndex: 10, width: '100%' }}
                      >
                        {/* Intelligent Category Tag */}
                        <span 
                          className="badge bg-dark px-2.5 py-1.5 font-weight-bold text-white"
                          style={{ 
                            fontSize: '10px', 
                            borderRadius: '6px', 
                            letterSpacing: '0.5px', 
                            textTransform: 'uppercase', 
                            opacity: 0.95,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.25)' 
                          }}
                        >
                          {getCategoryTag(car.brand, car.name)}
                        </span>

                        {/* ✅ INAYOS: Dynamic Badge Status Display (GREEN=AVAILABLE, DILAW=MAINTENANCE, PULA=RENTED) */}
                        <span 
                          className={`badge px-3 py-2 font-weight-bold ${
                            isAvailable ? 'bg-success text-white' : 
                            isMaintenance ? 'bg-warning text-dark' : 'bg-danger text-white'
                          }`} 
                          style={{ 
                            borderRadius: '50px', 
                            fontSize: '11px', 
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {isAvailable ? 'AVAILABLE' : isMaintenance ? '🔧 MAINTENANCE' : 'RENTED'}
                        </span>
                      </div>

                      {/* Shadow Plate Effect sa Ilalim ng Sasakyan */}
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '15%',
                          right: '15%',
                          height: '6px',
                          background: 'rgba(0, 0, 0, 0.06)',
                          borderRadius: '50%',
                          filter: 'blur(3px)',
                          zIndex: 1
                        }}
                      ></div>
                    </div>

                    {/* Corporate Styling Details Panel */}
                    <div className="text p-4 text-center">
                      <span className="text-uppercase text-muted font-weight-bold" style={{ fontSize: '11px', letterSpacing: '1.2px' }}>
                        {car.brand}
                      </span>
                      <h3 className="mb-0 mt-1" style={{ fontSize: '21px', fontWeight: '700', color: '#1E293B', textTransform: 'capitalize' }}>
                        {car.name}
                      </h3>
                      
                      <div className="my-2">
                        <span className="text-muted small">Model Year: {car.model}</span>
                      </div>

                      {/* Custom Description text alignment block */}
                      <p className="text-muted small px-2 mt-2 mb-3 text-truncate-2" style={{ minHeight: '40px', fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {car.description || "Experience top-tier driving comfort and unmatched executive business luxury with this premium vehicle."}
                      </p>

                      {/* Fully Dynamic Specs & Features Badges Line */}
                      <div className="d-flex justify-content-center gap-2 align-items-center flex-wrap my-3 pt-2 pb-2 border-top border-bottom">
                        <span className="text-slate-600 small" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', fontWeight: '500' }}>
                          👤 {car.seats || '5'} Seats
                        </span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>•</span>
                        <span className="text-slate-600 small" style={{ fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                          ⚙️ {car.transmission || 'Automatic'}
                        </span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>•</span>
                        <span className="text-slate-600 small" style={{ fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                          Public {car.fuel || 'Gasoline'}
                        </span>
                      </div>
                      
                      <div className="d-flex justify-content-center mb-3">
                        <p className="price mb-0" style={{ fontSize: '20px', color: '#104494', fontWeight: '800' }}>
                          ₱{Number(car.price_per_day).toLocaleString()} 
                          <span className="text-muted" style={{ fontSize: '13px', fontWeight: '400' }}> / day</span>
                        </p>
                      </div>

                      {/* Dynamic Action Button */}
                      <button 
                        disabled={!isAvailable}
                        onClick={() => setSelectedCar({
                          id: car.id,
                          name: car.name,
                          brand: car.brand,
                          price_per_day: car.price_per_day
                        })} 
                        className="btn w-100 font-weight-bold shadow-sm" 
                        style={{ 
                          backgroundColor: isAvailable ? '#104494' : isMaintenance ? '#D97706' : '#64748B', 
                          color: 'white',
                          border: 'none', 
                          padding: '12px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          cursor: isAvailable ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isAvailable 
                          ? 'Instant Booking' 
                          : isMaintenance 
                          ? 'Under Maintenance' 
                          : 'Not Available (Rented)'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center p-5">
              <h5 className="text-muted">No cars found in our fleet.</h5>
            </div>
          )}
        </div>
      </div>

      {selectedCar && (
        <BookingModal 
          car={selectedCar} 
          onClose={() => setSelectedCar(null)} 
        />
      )}
    </section>
  );
}