import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://calma-transportation-services.onrender.com/api/reservations');
      if (!res.ok) throw new Error("Failed to fetch reservations");
      const data = await res.json();
      setAllBookings(data);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Automations & Overdue Calculations
  const totalRevenue = allBookings
    .filter((b) => {
      const st = String(b.status || '').toLowerCase().trim();
      return st === 'paid' || st === 'completed';
    })
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

  const confirmedBookings = allBookings.filter((b) => {
    const st = String(b.status || '').toLowerCase().trim();
    return st === 'paid' || st === 'completed';
  }).length;

  const pendingBookings = allBookings.filter((b) => {
    const st = String(b.status || '').toLowerCase().trim();
    return st === 'pending' || st === '';
  }).length;

  // Filter para sa Overdue Alert Box
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueList = allBookings.filter((item: any) => {
    if (!item.end_date) return false;
    const due = new Date(item.end_date);
    due.setHours(0, 0, 0, 0);
    const st = String(item.status || '').toLowerCase().trim();
    return today > due && st !== 'completed' && st !== 'rejected' && st !== 'cancelled';
  });

  // 3. Action Handlers
  const handleUpdate = async (id: number) => {
    try {
      const res = await fetch(`https://calma-transportation-services.onrender.com/api/reservations/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' }) 
      });
      if (res.ok) {
        alert("Payment Verified! Car is now marked as Rented.");
        fetchData();
      }
    } catch (err) {
      alert("Error verifying payment");
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm("Are you sure you want to decline/reject this reservation?")) {
      try {
        const res = await fetch(`https://calma-transportation-services.onrender.com/api/reservations/reject/${id}`, { method: 'PUT' });
        if (res.ok) {
          alert("Reservation rejected. Car set back to Available.");
          fetchData();
        }
      } catch (err) {
        alert("Error rejecting reservation");
      }
    }
  };

  const handleReturn = async (id: number) => {
    if (window.confirm("Mark this car as returned and available for next customer?")) {
      try {
        const res = await fetch(`https://calma-transportation-services.onrender.com/api/reservations/return/${id}`, { method: 'PUT' });
        if (res.ok) {
          alert("Car returned! Fleet status updated to Available.");
          fetchData();
        }
      } catch (err) {
        alert("Error returning car");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await fetch(`https://calma-transportation-services.onrender.com/api/reservations/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        alert("Error deleting record");
      }
    }
  };

  // 4. CSV Export
  const exportToCSV = () => {
    if (allBookings.length === 0) return alert("No transactions to export!");
    
    const headers = ["ID,Vehicle,Amount,Payment Method,Reference No,Status\n"];
    const rows = allBookings.map((b: any) => 
      `${b.id},"${b.car_name}",${b.total_price},${b.payment_method || 'Cash'},"${b.reference_number || 'N/A'}",${b.status}`
    );

    const blob = new Blob([headers.join("") + rows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredBookings = allBookings.filter((b: any) =>
    (b.car_name && b.car_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.reference_number && b.reference_number.includes(searchTerm))
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#F8FAFC', overflowX: 'hidden' }}>
      
      {/* --- SIDEBAR --- */}
      <div className="bg-dark text-white p-4 shadow" style={{ width: '280px', position: 'fixed', height: '100vh', zIndex: 1000, backgroundColor: '#1E293B' }}>
        <h3 className="font-weight-bold mb-5 mt-2 text-center">
          <span style={{ color: '#1a73e8' }}>CALMA</span>
          <span className="text-white">TRANSPO</span>
        </h3>
        
        <nav className="nav flex-column gap-2">
          <Link to="/admin" className="nav-link text-white bg-primary rounded p-3 mb-2 shadow-sm">
            <i className="fa fa-th-large mr-2"></i> Dashboard
          </Link>

          <Link to="/admin/cars" className="nav-link text-white-50 p-3 mb-2 rounded hover-effect">
            <i className="fa fa-car mr-2"></i> Car Inventory
          </Link> 

          <Link to="/admin/reservations" className="nav-link text-white-50 p-3 mb-2 rounded hover-effect">
            <i className="fa fa-list-alt mr-2"></i> BookingList
          </Link>

          <Link to="/admin/users" className="nav-link text-white-50 p-3 mb-2 rounded hover-effect">
            <i className="fa fa-users mr-2"></i> Customers
          </Link>

          <button 
            className="nav-link text-danger border-0 bg-transparent p-3 mt-5 text-left font-weight-bold" 
            onClick={onLogout}
          >
            <i className="fa fa-sign-out mr-2"></i> Logout
          </button>
        </nav>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="font-weight-bold m-0 text-dark">Admin Command Center</h2>
            <p className="text-muted small">Manage your business operations and earnings.</p>
          </div>

          <button onClick={exportToCSV} className="btn btn-outline-primary rounded-pill px-4 shadow-sm font-weight-bold bg-white">
            <i className="fa fa-download mr-2"></i> Export Sales Report
          </button>
        </div>

        {/* --- OVERDUE RENTALS ALERT BOX --- */}
        {overdueList.length > 0 && (
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #DC2626' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle p-3 mr-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', width: '45px', height: '45px' }}>
                  <i className="fa fa-exclamation-triangle fa-lg"></i>
                </div>
                <div>
                  <h5 className="font-weight-bold text-danger mb-0">Overdue Rentals Alert</h5>
                  <small className="text-muted">May {overdueList.length} kliyente ang lumampas na sa itinakdang petsa ng pagsauli.</small>
                </div>
              </div>
              <Link to="/admin/reservations" className="btn btn-sm btn-outline-danger font-weight-bold px-3 rounded-pill">
                Tignan sa BookingList →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="text-muted small">
                  <tr>
                    <th>Customer Name</th>
                    <th>Vehicle</th>
                    <th>Due Date</th>
                    <th className="text-right">Action Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueList.map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-weight-bold text-dark">{item.customer_name || 'Anonymous'}</td>
                      <td className="text-muted">{item.car_name}</td>
                      <td className="text-danger font-weight-bold">{item.end_date}</td>
                      <td className="text-right">
                        <span className="badge bg-danger text-white px-2 py-1" style={{ fontSize: '10px', borderRadius: '8px' }}>
                          Overdue / Penalty Applied
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- STATS CARDS --- */}
        <div className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm p-4 text-white" style={{ background: 'linear-gradient(45deg, #104494, #1a73e8)', borderRadius: '20px' }}>
              <h6 className="text-uppercase small font-weight-bold opacity-75">Total Revenue (Verified)</h6>
              <h1 className="font-weight-bold m-0">₱{totalRevenue.toLocaleString()}</h1>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #28a745' }}>
              <h6 className="text-uppercase small font-weight-bold text-muted">Confirmed Bookings</h6>
              <h1 className="font-weight-bold m-0 text-success">{confirmedBookings}</h1>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #ffc107' }}>
              <h6 className="text-uppercase small font-weight-bold text-muted">Pending Approvals</h6>
              <h1 className="font-weight-bold m-0 text-warning">{pendingBookings}</h1>
            </div>
          </div>
        </div>

        {/* --- PURE SVG LINE CHART + RATIO SECTION --- */}
        <div className="row mb-5">
          {/* PURE SVG AREA / LINE CHART */}
          <div className="col-lg-7 mb-4">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="font-weight-bold m-0 text-dark">
                  <i className="fa fa-chart-line text-primary mr-2"></i> Revenue Performance
                </h5>
                <span className="badge bg-primary text-white px-3 py-1 font-weight-bold" style={{ borderRadius: '12px' }}>
                  ₱{totalRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-muted small mb-4">Real-time breakdown of confirmed earnings</p>
              
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <svg viewBox="0 0 500 150" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#104494" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#104494" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeDasharray="4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" />

                  <path d="M 20 120 C 100 110, 180 90, 260 60 T 480 20 L 480 120 L 20 120 Z" fill="url(#revenueGrad)" />
                  <path d="M 20 120 C 100 110, 180 90, 260 60 T 480 20" fill="none" stroke="#104494" strokeWidth="4" />

                  <circle cx="20" cy="120" r="4" fill="#104494" />
                  <circle cx="135" cy="102" r="4" fill="#104494" />
                  <circle cx="250" cy="65" r="4" fill="#104494" />
                  <circle cx="365" cy="40" r="4" fill="#104494" />
                  <circle cx="480" cy="20" r="6" fill="#104494" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                <div className="d-flex justify-content-between text-muted small mt-2 font-weight-bold px-1" style={{ fontSize: '11px' }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>

            </div>
          </div>

          {/* BOOKING RATIO */}
          <div className="col-lg-5 mb-4">
            <div className="card border-0 shadow-sm p-4 bg-white d-flex flex-column justify-content-between" style={{ borderRadius: '20px', minHeight: '300px' }}>
              <div>
                <h5 className="font-weight-bold mb-2 text-dark"><i className="fa fa-chart-bar text-success mr-2"></i> Booking Ratio</h5>
                <p className="text-muted small mb-4">Comparison of confirmed vs pending</p>
              </div>

              <div className="d-flex justify-content-around text-center my-auto">
                <div>
                  <h2 className="font-weight-bold text-success mb-0">{confirmedBookings}</h2>
                  <small className="text-muted font-weight-bold">Confirmed</small>
                </div>
                <div style={{ width: '1px', backgroundColor: '#CBD5E1', height: '50px' }}></div>
                <div>
                  <h2 className="font-weight-bold text-warning mb-0">{pendingBookings}</h2>
                  <small className="text-muted font-weight-bold">Pending</small>
                </div>
              </div>

              <div className="p-3 bg-light rounded-lg mt-3 text-center">
                <small className="text-muted">Total Activity: <strong>{allBookings.length}</strong> Reservations</small>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="font-weight-bold m-0 text-dark">Recent Transactions</h5>
            <div className="input-group w-50">
              <input 
                type="text" 
                className="form-control border-0 bg-light rounded-pill px-4 py-2" 
                placeholder="Search car or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="text-muted small text-uppercase bg-light">
                <tr>
                  <th className="py-3 px-4 border-0">Vehicle</th>
                  <th className="py-3 border-0">Amount</th>
                  <th className="py-3 border-0">Payment</th>
                  <th className="py-3 border-0">Reference</th>
                  <th className="py-3 border-0 text-center">Status</th>
                  <th className="py-3 border-0 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">Loading transactions...</td>
                  </tr>
                ) : filteredBookings.length > 0 ? filteredBookings.map((b: any) => {
                  const statusLower = String(b.status || '').toLowerCase().trim();

                  return (
                    <tr key={b.id}>
                      <td className="py-4 px-4 font-weight-bold text-dark">{b.car_name}</td>
                      <td className="py-4 text-primary font-weight-bold">₱{Number(b.total_price).toLocaleString()}</td>
                      
                      <td className="py-4">
                        <span className={`badge px-3 py-2 ${
                          b.payment_method === 'GCash' ? 'bg-info text-white' : 'bg-light text-dark border'
                        }`} style={{ borderRadius: '10px' }}>
                          <i className={`fa ${b.payment_method === 'GCash' ? 'fa-mobile-alt' : 'fa-money-bill-wave'} mr-2`}></i>
                          {b.payment_method || 'Cash'}
                        </span>
                      </td>

                      <td className="py-4 text-muted small">
                        {b.payment_method === 'GCash' ? (
                          <code className="text-primary font-weight-bold">{b.reference_number}</code>
                        ) : (
                          <span className="opacity-50">—</span>
                        )}
                      </td>

                      <td className="py-4 text-center">
                        <span className={`badge px-3 py-2 rounded-pill ${
                          statusLower === 'paid' ? 'badge-success' : 
                          statusLower === 'completed' ? 'badge-dark' : 
                          statusLower === 'rejected' || statusLower === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {b.status || 'Pending'}
                        </span>
                      </td>

                      <td className="py-4 text-center">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {(statusLower === 'pending' || !b.status) && (
                            <>
                              <button onClick={() => handleUpdate(b.id)} className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm mr-2">Verify</button>
                              <button onClick={() => handleReject(b.id)} className="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm mr-2">Decline</button>
                            </>
                          )}
                          
                          {statusLower === 'paid' && (
                            <button onClick={() => handleReturn(b.id)} className="btn btn-sm btn-success rounded-pill px-3 shadow-sm mr-2">
                              <i className="fa fa-undo mr-1"></i> Return
                            </button>
                          )}

                          {(statusLower === 'completed' || statusLower === 'rejected' || statusLower === 'cancelled') && (
                            <span className="text-muted small mr-2 font-italic"><i className="fa fa-archive"></i> Archived</span>
                          )}

                          <button onClick={() => handleDelete(b.id)} className="btn btn-sm text-danger border-0 bg-transparent hover-danger">
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">No transactions found matching your search.</td>
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
