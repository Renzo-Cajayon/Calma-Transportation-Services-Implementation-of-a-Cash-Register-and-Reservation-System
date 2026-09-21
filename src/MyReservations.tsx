import { useEffect, useState } from 'react';

export default function MyReservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null); // State para sa Receipt Modal
  
  // Kunin ang ID mula sa localStorage
  const userId = localStorage.getItem('userId');

  const fetchBookings = () => {
    if (userId) {
      fetch(`http://localhost:5000/api/my-reservations/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching bookings:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  // 🛠️ Cancel Booking Handler
  const handleCancelBooking = async (id: number, status: string) => {
    const statusLower = String(status || '').toLowerCase().trim();
    
    if (statusLower !== 'pending' && statusLower !== '') {
      alert("Hindi na maaaring kanselahin ang booking na ito dahil ito ay na-verify o tapos na.");
      return;
    }

    if (window.confirm("Sigurado ka bang gusto mong kanselahin ang reservation na ito?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/reservations/cancel/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (res.ok) {
          alert("Matagumpay na na-cancel ang iyong booking.");
          fetchBookings(); 
        } else {
          alert("Hindi matuloy ang pag-cancel ng booking.");
        }
      } catch (err) {
        console.error("Error cancelling booking:", err);
        alert("May error sa pag-konek sa server.");
      }
    }
  };

  return (
    <section className="ftco-section bg-light" style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 style={{ fontWeight: '800', color: '#104494' }}>My Bookings</h2>
            <p className="text-muted small">History of your car rentals and payment status.</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table bg-white shadow-sm rounded overflow-hidden w-100">
            <thead style={{ backgroundColor: '#104494', color: '#fff' }}>
              <tr>
                <th className="py-3 px-4">Car Model</th>
                <th className="py-3">Rental Dates</th>
                <th className="py-3">Total Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-5">Loading your bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-5">
                    <div className="py-4 text-muted">
                      <i className="fa fa-car mb-3" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                      <p className="mb-0">No reservations found in your account.</p>
                      <small>Go to our Car Fleet to make your first booking!</small>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b: any) => {
                  const statusLower = String(b.status || '').toLowerCase().trim();
                  
                  return (
                    <tr key={b.id} style={{ borderLeft: b.status === 'Paid' ? '5px solid #28a745' : '5px solid #ffc107' }}>
                      <td className="align-middle px-4">
                        <span className="font-weight-bold" style={{ color: '#333' }}>{b.car_name}</span>
                      </td>
                      <td className="align-middle">
                        <span className="text-muted small">
                          {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="align-middle font-weight-bold text-dark">
                        ₱{Number(b.total_price).toLocaleString()}
                      </td>
                      <td className="align-middle">
                        <span className={`badge px-3 py-2 ${b.status === 'Paid' ? 'badge-success' : 'badge-warning'}`} 
                            style={{ borderRadius: '20px', fontSize: '0.7rem' }}>
                          {b.status || 'Pending'}
                        </span>
                      </td>
                      
                      {/* Action Column (Receipt & Cancel Buttons) */}
                      <td className="align-middle text-center">
                        <div className="d-flex justify-content-center align-items-center" style={{ gap: '6px' }}>
                          <button 
                            onClick={() => setSelectedBooking(b)}
                            className="btn btn-sm btn-outline-info rounded-pill px-3 font-weight-bold shadow-sm"
                            style={{ fontSize: '11px' }}
                          >
                            Receipt
                          </button>

                          {(statusLower === 'pending' || !b.status) && (
                            <button 
                              onClick={() => handleCancelBooking(b.id, b.status)}
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 font-weight-bold shadow-sm"
                              style={{ fontSize: '11px' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧾 RECEIPT MODAL */}
      {selectedBooking && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
              
              {/* Receipt Header */}
              <div className="modal-header text-white" style={{ backgroundColor: '#0f172a', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <h5 className="modal-title font-weight-bold">
                  <i className="fa fa-file-invoice mr-2 text-info"></i> Official Booking Receipt
                </h5>
                <button type="button" className="close text-white" onClick={() => setSelectedBooking(null)}>
                  <span>&times;</span>
                </button>
              </div>

              {/* Receipt Body */}
              <div className="modal-body p-4 bg-white" id="printable-receipt">
                <div className="text-center mb-4">
                  <h4 className="font-weight-bold text-dark mb-0">CALMA TRANSPORTATION</h4>
                  <small className="text-muted">CarBook Official Rental Invoice</small>
                  <hr className="w-50 my-2" />
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <span className="text-muted small d-block">Booking ID:</span>
                    <strong className="text-dark">#CRB-{selectedBooking.id}</strong>
                  </div>
                  <div className="col-6 text-right">
                    <span className="text-muted small d-block">Status:</span>
                    <span className={`badge px-2 py-1 ${selectedBooking.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {selectedBooking.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-sm table-borderless bg-light rounded p-2">
                    <tbody>
                      <tr>
                        <td className="text-muted">Car Model:</td>
                        <td className="font-weight-bold text-right text-dark">{selectedBooking.car_name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Rental Dates:</td>
                        <td className="font-weight-bold text-right text-dark">
                          {new Date(selectedBooking.start_date).toLocaleDateString()} - {new Date(selectedBooking.end_date).toLocaleDateString()}
                        </td>
                      </tr>
                      <tr className="border-top">
                        <td className="text-muted pt-2">Total Amount:</td>
                        <td className="font-weight-bold text-primary text-right pt-2" style={{ fontSize: '1.2rem' }}>
                          ₱{Number(selectedBooking.total_price).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-center text-muted small mt-4">
                  <p className="mb-0">Thank you for choosing Calma Transportation!</p>
                  <small>This serves as your digital reservation receipt.</small>
                </div>
              </div>

              {/* Receipt Footer / Print Button */}
              <div className="modal-footer bg-light border-0" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-4 btn-sm" 
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-info text-white rounded-pill px-4 btn-sm font-weight-bold shadow-sm"
                  onClick={() => window.print()}
                >
                  <i className="fa fa-print mr-1"></i> Print / Save as PDF
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}