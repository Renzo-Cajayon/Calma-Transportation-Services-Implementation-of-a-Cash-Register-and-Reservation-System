import { useState, useEffect } from 'react';

// Define ang structure ng props para sa TypeScript
interface BookingModalProps {
  car: { 
    id: number; 
    name: string; 
    brand: string; 
    price_per_day: number; 
  };
  onClose: () => void;
}

export default function BookingModal({ car, onClose }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Pick-up");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [duration, setDuration] = useState(1);
  const [total, setTotal] = useState(Number(car.price_per_day));

  // Logic para sa real-time total amount calculation
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate difference in time (milliseconds)
      const diffInTime = end.getTime() - start.getTime();
      // Convert to days
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

      if (diffInDays > 0) {
        setDuration(diffInDays);
        setTotal(diffInDays * Number(car.price_per_day));
      } else {
        setDuration(1);
        setTotal(Number(car.price_per_day));
      }
    }
  }, [startDate, endDate, car.price_per_day]);

  const handleConfirm = async () => {
    // 1. Kunin ang logged-in User ID mula sa localStorage
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert("Please login first to reserve a vehicle!");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select both Pick-up and Return dates.");
      return;
    }

    // 2. Prepare data
    const bookingData = {
      userId: userId,
      carId: car.id,          
      carName: car.name,      
      startDate: startDate,
      endDate: endDate,
      total: total,
      paymentMethod: paymentMethod,
      referenceNumber: paymentMethod === "GCash" ? referenceNumber : "N/A"
    };

    try {
      // 3. I-send ang request sa Backend
      const response = await fetch('http://localhost:5000/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert("✅ Reservation Successful! Your booking is now pending for approval.");
        onClose();
        // INAYOS: '/reservations' na ang gagamitin na URL route
        window.location.href = "/reservations"; 
      } else {
        const errorData = await response.json();
        alert(`Booking failed: ${errorData.message || "Please check your connection."}`);
      }
    } catch (err) {
      console.error("Reservation Error:", err);
      alert("Server error. Siguraduhin na ang backend (Node.js) ay running.");
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg p-2" style={{ borderRadius: '24px' }}>
          
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title font-weight-bold" style={{ color: '#104494' }}>
              Rent {car.brand} {car.name}
            </h4>
            <button type="button" className="close" onClick={onClose} style={{ fontSize: '30px' }}>&times;</button>
          </div>
          
          <div className="modal-body p-4">
            <p className="text-muted small mb-4">Kumpletuhin ang detalye sa ibaba para sa iyong reservation.</p>
            
            <div className="row mb-3">
              <div className="col-6">
                <label className="small font-weight-bold text-dark">Pick-up Date</label>
                <input 
                  type="date" 
                  className="form-control border-0 bg-light py-4" 
                  style={{ borderRadius: '12px' }}
                  onChange={(e) => setStartDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="col-6">
                <label className="small font-weight-bold text-dark">Return Date</label>
                <input 
                  type="date" 
                  className="form-control border-0 bg-light py-4" 
                  style={{ borderRadius: '12px' }}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]} 
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="small font-weight-bold text-dark">Payment Method</label>
              <select 
                className="form-control border-0 bg-light" 
                style={{ height: '50px', borderRadius: '12px' }}
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash on Pick-up">Cash on Pick-up</option>
                <option value="GCash">GCash</option>
              </select>
            </div>

            {/* GCash Reference Field */}
            {paymentMethod === "GCash" && (
              <div className="mb-4 animate__animated animate__fadeIn">
                <label className="small font-weight-bold text-primary">GCash Reference No.</label>
                <input 
                  type="text" 
                  className="form-control border-0 bg-light py-4" 
                  style={{ borderRadius: '12px' }}
                  placeholder="Enter 13-digit number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            )}

            {/* Summary Box */}
            <div className="p-4 mb-4" style={{ backgroundColor: '#F0F7FF', borderRadius: '16px', borderLeft: '6px solid #104494' }}>
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Rental Duration:</span>
                <span className="font-weight-bold text-dark">{duration} Day/s</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-weight-bold text-dark">Total Amount:</span>
                <h3 className="font-weight-bold mb-0" style={{ color: '#104494' }}>
                  ₱{total.toLocaleString()}
                </h3>
              </div>
            </div>

            <button 
              onClick={handleConfirm} 
              className="btn btn-primary btn-block py-3 font-weight-bold rounded-pill shadow-lg" 
              style={{ backgroundColor: '#104494', border: 'none', letterSpacing: '1px' }}
            >
              CONFIRM RESERVATION
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}