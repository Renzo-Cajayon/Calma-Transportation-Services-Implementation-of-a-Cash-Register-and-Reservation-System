import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface AdminUsersProps {
  onLogout: () => void;
}

export default function AdminUsers({ onLogout }: AdminUsersProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Fetch all bookings to extract customer profiles and history
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://calma-transportation-services.onrender.com/api/reservations');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching customer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group bookings by customer name to create a unique customer list
  const customerMap: { [key: string]: any } = {};
  bookings.forEach((b: any) => {
    const name = b.customer_name || 'Anonymous';
    if (!customerMap[name]) {
      customerMap[name] = {
        name: name,
        totalRentals: 0,
        totalSpent: 0,
        history: []
      };
    }
    customerMap[name].totalRentals += 1;
    const price = Number(b.total_price) || 0;
    const st = String(b.status || '').toLowerCase();
    if (st === 'paid' || st === 'completed') {
      customerMap[name].totalSpent += price;
    }
    customerMap[name].history.push(b);
  });

  const customers = Object.values(customerMap);

  // Get details for the currently selected customer modal
  const activeCustomerData = selectedCustomer ? customerMap[selectedCustomer] : null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100vw', backgroundColor: '#F8FAFC' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ml-3 font-weight-bold text-muted">Loading Customers...</span>
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
          <Link to="/admin/cars" className="nav-link text-white-50 p-3 mb-2 rounded">
            <i className="fa fa-car mr-2"></i> Car Inventory
          </Link>
          <Link to="/admin/reservations" className="nav-link text-white-50 p-3 rounded mb-1">
            <i className="fa fa-list-alt mr-2"></i> BookingList
          </Link>
          <Link to="/admin/users" className="nav-link active text-white bg-primary p-3 rounded mb-1 shadow-sm">
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
          <h2 className="font-weight-bold text-dark mb-0">Customer Management</h2>
          <p className="text-muted small">View registered clients and their complete rental records.</p>
        </div>
        
        <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="p-4 border-0">Customer Name</th>
                  <th className="p-4 border-0 text-center">Total Bookings</th>
                  <th className="p-4 border-0">Total Spent</th>
                  <th className="p-4 border-0 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? customers.map((c: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="p-4 font-weight-bold text-dark">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3 font-weight-bold" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td className="p-4 text-center font-weight-bold">
                      <span className="badge bg-light text-dark px-3 py-2 border" style={{ borderRadius: '10px' }}>
                        {c.totalRentals} Unit(s)
                      </span>
                    </td>
                    <td className="p-4 font-weight-bold text-primary">
                      ₱{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedCustomer(c.name)} 
                        className="btn btn-sm btn-outline-primary rounded-pill px-4 font-weight-bold shadow-sm"
                      >
                        <i className="fa fa-eye mr-1"></i> View History
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center p-5 text-muted">
                      <i className="fa fa-users d-block mb-3 opacity-25" style={{ fontSize: '40px' }}></i>
                      No customer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- CUSTOMER DETAILS MODAL --- */}
        {selectedCustomer && activeCustomerData && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                
                <div className="modal-header bg-dark text-white p-4">
                  <h5 className="modal-title font-weight-bold">
                    <i className="fa fa-user-circle mr-2 text-primary"></i> Customer Profile: {activeCustomerData.name}
                  </h5>
                  <button type="button" className="close text-white border-0 bg-transparent" onClick={() => setSelectedCustomer(null)}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body p-4 bg-light">
                  <div className="row mb-4">
                    <div className="col-md-6 mb-2">
                      <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '15px' }}>
                        <small className="text-muted font-weight-bold text-uppercase">Total Rentals</small>
                        <h3 className="font-weight-bold text-dark mt-1">{activeCustomerData.totalRentals} Transactions</h3>
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: '15px' }}>
                        <small className="text-muted font-weight-bold text-uppercase">Lifetime Spending</small>
                        <h3 className="font-weight-bold text-primary mt-1">₱{activeCustomerData.totalSpent.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>

                  <h6 className="font-weight-bold text-dark mb-3">Rental History Logs</h6>
                  <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-sm align-middle mb-0">
                      <thead className="bg-light text-muted small">
                        <tr>
                          <th className="p-3">Vehicle</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCustomerData.history.map((h: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 font-weight-bold text-dark">{h.car_name}</td>
                            <td className="p-3 small text-muted">{h.start_date} to {h.end_date}</td>
                            <td className="p-3 font-weight-bold text-primary">₱{Number(h.total_price).toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className="badge px-2 py-1" style={{ fontSize: '10px', borderRadius: '8px', backgroundColor: h.status === 'Paid' ? '#DCFCE7' : '#F3F4F6', color: h.status === 'Paid' ? '#166534' : '#374151' }}>
                                {h.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer bg-white p-3 border-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-4 font-weight-bold" onClick={() => setSelectedCustomer(null)}>
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        <div className="mt-5 text-center text-muted small">
          © 2026 Calma Transportation System
        </div>
      </div>
    </div>
  );
}
