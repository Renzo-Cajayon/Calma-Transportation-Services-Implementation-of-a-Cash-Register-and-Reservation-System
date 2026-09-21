import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface AdminCarsProps {
  onLogout: () => void;
}

// 🚗 MGA PRESET NA SASAKYAN (May kasamang de-kalidad na larawan at detalye)
const CAR_PRESETS = [
  {
    name: 'Vios',
    brand: 'Toyota',
    model: '2026',
    price_per_day: '1500',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    seats: '5',
    description: 'Reliable, fuel-efficient, and perfect for city driving and daily commutes.',
    image_url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800'
  },
  {
    name: 'Tesla Model S',
    brand: 'Tesla',
    model: '2026',
    price_per_day: '5000',
    transmission: 'Automatic',
    fuel: 'Gasoline', // o Electric
    seats: '5',
    description: 'All-electric luxury sedan with autopilot capabilities and futuristic interior.',
    image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800'
  },
  {
    name: 'Civic',
    brand: 'Honda',
    model: '2025',
    price_per_day: '2200',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    seats: '5',
    description: 'Sporty compact sedan featuring modern styling and dynamic performance.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800'
  },
  {
    name: 'Montero Sport',
    brand: 'Mitsubishi',
    model: '2026',
    price_per_day: '3500',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: '7',
    description: 'Rugged 7-seater SUV built for family out-of-town trips and rough terrain.',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800'
  },
  {
    name: 'Hilux Conquest',
    brand: 'Toyota',
    model: '2026',
    price_per_day: '3000',
    transmission: 'Manual',
    fuel: 'Diesel',
    seats: '5',
    description: 'Powerful utility pickup truck designed for heavy-duty tasks and adventure.',
    image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800'
  }
];

export default function AdminCars({ onLogout }: AdminCarsProps) {
  // 1. States
  const [cars, setCars] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '', 
    brand: '', 
    model: '', 
    price_per_day: '',
    status: 'Available', 
    transmission: 'Automatic', 
    fuel: 'Gasoline', 
    seats: '5', 
    description: '', 
    image_url: ''
  });

  // 2. Fetch Data Logic (Cars & Reservations)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [carRes, resRes] = await Promise.all([
        fetch('https://calma-transportation-services.onrender.com/api/cars'),
        fetch('https://calma-transportation-services.onrender.com/api/reservations')
      ]);

      if (!carRes.ok) throw new Error("Failed to fetch cars");
      const carData = await carRes.json();
      setCars(carData);

      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData);
      }
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // 3. Computed Stats
  const totalCars = cars.length;
  const availableCars = cars.filter((car: any) => String(car.status).toLowerCase() === 'available').length;
  const priceAverage = cars.length > 0 
    ? cars.reduce((acc: number, car: any) => acc + Number(car.price_per_day), 0) / cars.length 
    : 0;

  // 📊 Analytics Computation para sa bawat sasakyan
  const carStats: { [key: string]: { rentals: number; revenue: number } } = {};
  reservations.forEach((r: any) => {
    const resCarName = String(r.car_name || '').trim().toLowerCase();
    if (resCarName) {
      if (!carStats[resCarName]) {
        carStats[resCarName] = { rentals: 0, revenue: 0 };
      }
      carStats[resCarName].rentals += 1;
      const st = String(r.status || '').toLowerCase();
      if (st === 'paid' || st === 'completed') {
        carStats[resCarName].revenue += Number(r.total_price) || 0;
      }
    }
  });

  // 4. Filtering Logic
  const filteredCars = cars.filter((car: any) => 
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    car.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🛠️ SMART STATUS TOGGLE HANDLER
  const handleToggleStatus = async (carId: number, currentStatus: string) => {
    const statusLower = String(currentStatus || '').toLowerCase().trim();
    
    if (statusLower === 'rented') {
      alert("Cannot set status to Maintenance while the car is currently RENTED.");
      return;
    }

    let newStatus = 'Available';
    if (statusLower === 'available') {
      newStatus = 'Maintenance';
    } else if (statusLower === 'maintenance') {
      newStatus = 'Available';
    }

    try {
      const res = await fetch(`https://calma-transportation-services.onrender.com/api/cars/status/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(`Failed to update status: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      alert("Error connecting to backend server on port 5000.");
    }
  };

  // 5. CRUD Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId 
      ? `https://calma-transportation-services.onrender.com/api/cars/${editingId}` 
      : 'https://calma-transportation-services.onrender.com/api/cars';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert(editingId ? "Vehicle updated!" : "Vehicle registered!");
        setFormData({ 
          name:'', brand:'', model:'', price_per_day:'', 
          status:'Available', transmission:'Automatic', fuel:'Gasoline', 
          seats:'5', description:'', image_url:'' 
        });
        setEditingId(null);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Server error: ${errorData.message || 'Failed to save data'}`);
      }
    } catch (err) { 
      alert("Error saving vehicle. Check your network or backend connection."); 
    }
  };

  const handleDelete = async (id: number) => {
    if(window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const res = await fetch(`https://calma-transportation-services.onrender.com/api/cars/${id}`, { method: 'DELETE' });
        if(res.ok) fetchData();
      } catch (err) {
        alert("Error deleting vehicle");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100vw', backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <div className="font-weight-bold text-muted">Loading Inventory...</div>
        </div>
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
          <Link to="/admin/cars" className="nav-link active text-white bg-primary p-3 rounded mb-1 shadow-sm">
            <i className="fa fa-car mr-2"></i> Car Inventory
          </Link>
          <Link to="/admin/reservations" className="nav-link text-white-50 p-3 rounded mb-1">
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

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ marginLeft: '280px', width: 'calc(100% - 280px)', padding: '40px' }}>
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="font-weight-bold text-dark mb-0">Car Inventory & Analytics</h2>
            <p className="text-muted small">Manage fleet pricing and track performance.</p>
          </div>
          <div className="input-group" style={{ width: '350px' }}>
            <span className="input-group-text bg-white border-0 shadow-sm" style={{ borderRadius: '15px 0 0 15px' }}>
              <i className="fa fa-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-0 shadow-sm px-3" 
              placeholder="Search car brand or name..." 
              style={{ borderRadius: '0 15px 15px 0', height: '45px' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="row mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #3B82F6' }}>
              <small className="text-muted font-weight-bold text-uppercase">Total Units</small>
              <h1 className="font-weight-bold mb-0 mt-2 text-dark">{totalCars}</h1>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #10B981' }}>
              <small className="text-muted font-weight-bold text-uppercase">Available</small>
              <h1 className="font-weight-bold mb-0 mt-2 text-success">{availableCars}</h1>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px', borderLeft: '8px solid #F59E0B' }}>
              <small className="text-muted font-weight-bold text-uppercase">Avg. Rate</small>
              <h1 className="font-weight-bold mb-0 mt-2 text-dark">₱{Math.round(priceAverage).toLocaleString()}</h1>
            </div>
          </div>
        </div>

        <div className="row">
          {/* LEFT: Add/Edit Form */}
          <div className="col-xl-4 col-lg-5 mb-4">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', position: 'sticky', top: '40px' }}>
              <h5 className="font-weight-bold mb-3 text-dark">
                {editingId ? <span className="text-primary"><i className="fa fa-edit mr-2"></i>Edit Vehicle</span> : <span><i className="fa fa-plus-circle mr-2"></i>Add New Unit</span>}
              </h5>

              {/* ⚡ QUICK PRESET SELECTOR (Para hindi na maghanap ng image url) */}
              {!editingId && (
                <div className="mb-4 p-3 bg-light rounded-lg border border-primary-subtle" style={{ borderRadius: '12px' }}>
                  <label className="small font-weight-bold text-primary mb-2 d-block">
                    <i className="fa fa-bolt mr-1"></i> Quick Preset Selector:
                  </label>
                  <select 
                    className="form-control form-control-sm border-0 shadow-sm bg-white font-weight-medium"
                    onChange={(e) => {
                      const selectedPreset = CAR_PRESETS.find(p => p.name === e.target.value);
                      if (selectedPreset) {
                        setFormData({
                          name: selectedPreset.name,
                          brand: selectedPreset.brand,
                          model: selectedPreset.model,
                          price_per_day: selectedPreset.price_per_day,
                          status: 'Available',
                          transmission: selectedPreset.transmission,
                          fuel: selectedPreset.fuel,
                          seats: selectedPreset.seats,
                          description: selectedPreset.description,
                          image_url: selectedPreset.image_url
                        });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pili ng preset na sasakyan --</option>
                    {CAR_PRESETS.map((p, idx) => (
                      <option key={idx} value={p.name}>{p.brand} {p.name} ({p.model})</option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="small font-weight-bold text-muted">Unit Name</label>
                  <input type="text" className="form-control bg-light border-0 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g., Vios" />
                </div>
                <div className="mb-3">
                  <label className="small font-weight-bold text-muted">Brand</label>
                  <input type="text" className="form-control bg-light border-0 py-2" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required placeholder="e.g., Toyota" />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="small font-weight-bold text-muted">Model Year</label>
                    <input type="text" className="form-control bg-light border-0 py-2" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required placeholder="2026" />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="small font-weight-bold text-muted">Price/Day</label>
                    <input type="number" className="form-control bg-light border-0 py-2" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} required placeholder="1500" />
                  </div>
                </div>

                {/* Specs Dropdowns */}
                <div className="row">
                  <div className="col-4 mb-3">
                    <label className="small font-weight-bold text-muted">Gearbox</label>
                    <select className="form-control bg-light border-0 py-2 text-truncate" style={{ fontSize: '13px' }} value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="col-4 mb-3">
                    <label className="small font-weight-bold text-muted">Fuel</label>
                    <select className="form-control bg-light border-0 py-2 text-truncate" style={{ fontSize: '13px' }} value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})}>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div className="col-4 mb-3">
                    <label className="small font-weight-bold text-muted">Seats</label>
                    <select className="form-control bg-light border-0 py-2 text-truncate" style={{ fontSize: '13px' }} value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})}>
                      <option value="4">4 Seats</option>
                      <option value="5">5 Seats</option>
                      <option value="7">7 Seats</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="small font-weight-bold text-muted">Vehicle Description</label>
                  <textarea 
                    className="form-control bg-light border-0 py-2" 
                    rows={3} 
                    style={{ fontSize: '14px', borderRadius: '10px' }}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="e.g., Smooth executive driving, premium leather styling, cold air conditioning."
                  />
                </div>

                {/* Image Picker / URL */}
                <div className="mb-3">
                  <label className="small font-weight-bold text-muted">Vehicle Image URL or Upload</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 py-2 mb-2" 
                    style={{ fontSize: '13px' }}
                    value={formData.image_url} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})} 
                    placeholder="https://... or select preset above" 
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control bg-light border-0 py-2" 
                    style={{ height: 'auto', fontSize: '12px' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setFormData({ ...formData, image_url: base64String });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {formData.image_url && (
                    <div className="mt-2 text-center">
                      <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                      <small className="text-success d-block mt-1 font-weight-bold">
                        <i className="fa fa-check-circle mr-1"></i> Image Active
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="small font-weight-bold text-muted">Unit Status</label>
                  <select className="form-control bg-light border-0 py-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill font-weight-bold shadow-sm">
                  {editingId ? 'Update Vehicle Details' : 'Register Vehicle'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-link w-100 text-muted small mt-2" onClick={() => { setEditingId(null); setFormData({ name:'', brand:'', model:'', price_per_day:'', status:'Available', transmission:'Automatic', fuel:'Gasoline', seats:'5', description:'', image_url:'' }); }}>
                    Cancel Editing
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT: Inventory Table with Analytics Column */}
          <div className="col-xl-8 col-lg-7">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="p-4 border-0">Vehicle Details</th>
                      <th className="p-4 border-0">Model</th>
                      <th className="p-4 border-0">Performance</th>
                      <th className="p-4 border-0">Status</th>
                      <th className="p-4 border-0 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.length > 0 ? filteredCars.map((car: any) => {
                      const statusLower = String(car.status || '').toLowerCase().trim();
                      const isMaintenance = statusLower === 'maintenance';
                      const isAvailable = statusLower === 'available';
                      const isRented = statusLower === 'rented';

                      const lookupKey = `${car.brand} ${car.name}`.trim().toLowerCase();
                      const stats = carStats[lookupKey] || carStats[String(car.name).trim().toLowerCase()] || { rentals: 0, revenue: 0 };

                      return (
                        <tr key={car.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td className="p-4">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle p-1 mr-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '55px', height: '55px', backgroundColor: '#eef2ff', overflow: 'hidden', flexShrink: 0 }}>
                                {car.image_url ? (
                                  <img src={car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                  <i className="fa fa-car text-primary" style={{ fontSize: '20px' }}></i>
                                )}
                              </div>
                              <div>
                                <div className="font-weight-bold text-dark">{car.brand} {car.name}</div>
                                <div className="d-flex gap-1 mt-1 flex-wrap">
                                  <span className="badge bg-secondary text-white mr-1" style={{ fontSize: '9px' }}>{car.transmission || 'Automatic'}</span>
                                  <span className="badge bg-info text-white mr-1" style={{ fontSize: '9px' }}>{car.fuel || 'Gasoline'}</span>
                                  <span className="badge bg-dark text-white" style={{ fontSize: '9px' }}>👤 {car.seats || '5'} Seats</span>
                                </div>
                                <small className="text-primary font-weight-bold d-block mt-2">₱{Number(car.price_per_day).toLocaleString()} / day</small>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted font-weight-bold">{car.model}</td>
                          
                          <td className="p-4">
                            <div className="small font-weight-bold text-dark">{stats.rentals} time/s rented</div>
                            <div className="small text-primary font-weight-bold">₱{stats.revenue.toLocaleString()} revenue</div>
                          </td>
                          
                          <td className="p-4">
                            <span 
                              onClick={() => handleToggleStatus(car.id, car.status)}
                              className="badge border-0 py-2 px-3" 
                              style={{ 
                                fontSize: '11px', 
                                borderRadius: '20px',
                                cursor: isRented ? 'not-allowed' : 'pointer',
                                backgroundColor: 
                                  isAvailable ? '#DCFCE7' : 
                                  isRented ? '#FEE2E2' : 
                                  isMaintenance ? '#FEF3C7' : '#E2E8F0',
                                color: 
                                  isAvailable ? '#166534' : 
                                  isRented ? '#991B1B' : 
                                  isMaintenance ? '#92400E' : '#334155'
                              }}
                              title={isRented ? 'Rented cars cannot be toggled' : 'Click to change status'}
                            >
                              {isMaintenance ? '🔧 MAINTENANCE' : (car.status && car.status !== 'SET STATUS' ? String(car.status).toUpperCase() : 'SET STATUS')}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <div className="d-flex justify-content-center gap-2 align-items-center">
                              <button 
                                onClick={() => {
                                  setEditingId(car.id); 
                                  setFormData({ 
                                    name: car.name, 
                                    brand: car.brand, 
                                    model: car.model, 
                                    price_per_day: car.price_per_day, 
                                    status: car.status || 'Available', 
                                    transmission: car.transmission || 'Automatic', 
                                    fuel: car.fuel || 'Gasoline', 
                                    seats: car.seats || '5', 
                                    description: car.description || '', 
                                    image_url: car.image_url || '' 
                                  });
                                }} 
                                className="btn btn-sm btn-outline-primary font-weight-bold px-3 py-1 mr-2" 
                                style={{ borderRadius: '8px', fontSize: '12px' }}
                                title="Edit Vehicle"
                              >
                                ✏️ Edit
                              </button>

                              <button 
                                onClick={() => handleDelete(car.id)} 
                                className="btn btn-sm btn-outline-danger font-weight-bold px-3 py-1" 
                                style={{ borderRadius: '8px', fontSize: '12px' }}
                                title="Delete Vehicle"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="text-center p-5 text-muted">
                          <i className="fa fa-search mb-3 d-block opacity-25" style={{ fontSize: '40px' }}></i>
                          No vehicles found in your inventory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
