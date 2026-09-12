import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone_number: '', address: '' });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/user/profile/${userId}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        alert("Profile successfully updated!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error connecting to server.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <section className="ftco-section bg-light" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 style={{ fontWeight: '800', color: '#104494' }}>My Profile</h2>
            <p className="text-muted small">Update your personal account information and delivery details.</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
          <form onSubmit={handleUpdate}>
            
            <div className="form-group mb-3">
              <label className="small font-weight-bold text-muted">Full Name</label>
              <input 
                type="text" 
                className="form-control bg-light border-0 py-2" 
                value={user.name || ''} 
                onChange={e => setUser({...user, name: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group mb-3">
              <label className="small font-weight-bold text-muted">Email Address (Read-only)</label>
              <input 
                type="email" 
                className="form-control bg-light border-0 py-2 text-muted" 
                value={user.email || ''} 
                disabled 
              />
            </div>

            <div className="form-group mb-3">
              <label className="small font-weight-bold text-muted">Phone Number</label>
              <input 
                type="text" 
                className="form-control bg-light border-0 py-2" 
                value={user.phone_number || ''} 
                onChange={e => setUser({...user, phone_number: e.target.value})} 
                placeholder="e.g., 09123456789"
              />
            </div>

            <div className="form-group mb-4">
              <label className="small font-weight-bold text-muted">Home Address</label>
              <textarea 
                className="form-control bg-light border-0 py-2" 
                rows={3} 
                style={{ borderRadius: '10px' }}
                value={user.address || ''} 
                onChange={e => setUser({...user, address: e.target.value})} 
                placeholder="Enter your complete address"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill font-weight-bold shadow-sm" style={{ backgroundColor: '#104494', border: 'none' }}>
              Save Changes
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}