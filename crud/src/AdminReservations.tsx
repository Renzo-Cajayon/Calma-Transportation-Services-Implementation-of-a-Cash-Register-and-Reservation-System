import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 1. Definition ng Props
interface AdminReservationsProps {
  onLogout: () => void;
}

export default function AdminReservations({ onLogout }: AdminReservationsProps) {
  // 2. States
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 3. Fetch Data Logic mula sa Backend
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://calma-transportation-services.onrender.com/api/reservations'); 
      const data = await response.json();
      
      console.log("Fetched Bookings:", data);
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
  }, []);

  // 🛠️ Overdue Status Checker & Penalty Computation Helper
  const checkOverdueStatus = (endDate: string, totalPrice: number) => {
    if (!endDate) return { status: 'NORMAL', daysLate: 0, penalty: 0 };

    const today = new Date();
    const due = new Date(endDate);
    
    // Alisin angoras para petsa lang ang ikumpara
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    if (today > due) {
      const diffTime = Math.abs(today.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Halimbawa: 20% ng total price kada araw ng pagka-late ang penalty fee
      const dailyRateEstimate = totalPrice > 0 ? totalPrice / 3 : 1000;
      const penaltyFee = diffDays * (dailyRateEstimate * 0.5); 
      
      return {
        status: 'OVERDUE',
        daysLate: diffDays,
        penalty: penaltyFee,
        badgeBg: '#FEE2E2',
        textColor: '#991B1B'
      };
    }
    
    return {
      status: 'ON-TIME',
      daysLate: 0,
      penalty: 0,
      badgeBg: '#DCFCE7',
      textColor: '#166534'
    };
  };

  // Loading State UI
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100vw', backgroundColor: '#F8FAFC' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ml-3 font-weight-bold text-muted">Loading Bookings...</span>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', width: '100vw', overflowX: 'hidden' }}>
      
      {/* --- SIDEBAR --- */}
      <div className="bg-dark text-white p-4 shadow" style={{ width: '280px', position: 'fixed', height: '100vh', zIndex: 1000, backgroundColor: '#1E293B' }}>
        <h3 className="font-weight-bold mb-5 mt-2 text-center">
          <span style={{ color: '#1a73e8' }}>CALMA</span>
          <span className="text-white">TRANSPO</span>
        </h3>
        <nav className="nav flex-column gap-2">
          <Link to="/admin" className="nav-link text-white-50 p-3 rounded mb-1">
            <i className="fa fa-th-large mr-2"></i> Dashboard
          </Link>

          <Link to="/admin/cars" className="nav-link text-white-50 p-3 mb-2 rounded hover-effect">
            <i className="fa fa-car mr-2"></i> Car Inventory
          </Link>

          <Link to="/admin/reservations" className="nav-link active text-white bg-primary p-3 rounded mb-1 shadow-sm">
            <i className="fa fa-list-alt mr-2"></i> BookingList
          </Link>

          <Link to="/admin/users" className="nav-link text-white-50 p-3 rounded mb-1">
            <i className="fa fa-users mr-2"></i> Customers
          </Link>

          <button className="nav-link text-danger border-0 bg-transparent p-3 mt-5 text-left font-weight-bold" onClick={onLogout}>
            <i className="fa fa-sign-out mr-2"></i> Logout
          </button>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '40px' }}>
        
        <div className="mb-5">
          <h2 className="font-weight-bold text-dark mb-0">Customer Reservations</h2>
          <p className="text-muted small">View, track returns, and manage late penalties.</p>
        </div>
        
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="p-4 border-0">Customer Name</th>
                  <th className="p-4 border-0">Vehicle Rented</th>
                  <th className="p-4 border-0">Rental Duration</th>
                  <th className="p-4 border-0">Total Amount</th>
                  <th className="p-4 border-0 text-center">Payment Status</th>
                  <th className="p-4 border-0 text-center">Return Notice</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map((booking: any) => {
                  const overdueCheck = checkOverdueStatus(booking.end_date, booking.total_price);

                  return (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td className="p-4 font-weight-bold text-dark">{booking.customer_name || 'Anonymous'}</td>
                      <td className="p-4">
                        <div className="d-flex align-items-center">
                          <i className="fa fa-car text-primary mr-2"></i>
                          {booking.car_name}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="small text-muted">
                          <i className="fa fa-calendar-o mr-1"></i> From: {booking.start_date}
                        </div>
                        <div className="small text-danger font-weight-bold">
                          <i className="fa fa-clock-o mr-1"></i> Due: {booking.end_date}
                        </div>
                      </td>
                      <td className="p-4 font-weight-bold text-primary">
                        ₱{Number(booking.total_price).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`badge py-2 px-3 rounded-pill`} style={{ 
                          fontSize: '11px',
                          backgroundColor: booking.status === 'Paid' ? '#DCFCE7' : 
                                           booking.status === 'Completed' ? '#E0E7FF' : '#F3F4F6',
                          color: booking.status === 'Paid' ? '#166534' : 
                                 booking.status === 'Completed' ? '#3730A3' : '#374151'
                        }}>
                          {booking.status}
                        </span>
                      </td>

                      {/* OVERDUE & PENALTY NOTICE COLUMN */}
                      <td className="p-4 text-center">
                        {overdueCheck.status === 'OVERDUE' ? (
                          <div>
                            <span className="badge py-2 px-3 rounded-pill font-weight-bold" style={{ backgroundColor: overdueCheck.badgeBg, color: overdueCheck.textColor, fontSize: '11px' }}>
                              ⚠️ OVERDUE ({overdueCheck.daysLate}d late)
                            </span>
                            <div className="text-danger small font-weight-bold mt-1">
                              Penalty: ₱{Math.round(overdueCheck.penalty).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="badge py-2 px-3 rounded-pill font-weight-bold" style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px' }}>
                            ✅ ON-TIME
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="text-center p-5 text-muted">
                      <i className="fa fa-calendar-times-o d-block mb-3" style={{ fontSize: '30px' }}></i>
                      No active reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 text-center text-muted small">
          © 2026 Calma Transportation System
        </div>
      </div>
    </div>
  );
}
