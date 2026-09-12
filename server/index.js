const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 1. DATABASE CONNECTION ---
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'car_rental',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined
});

db.connect(err => {
    if (err) {
        console.error("❌ DB Connection Error:", err);
    } else {
        console.log("✅ MySQL Connected successfully!");
    }
});

// --- 2. AUTHENTICATION APIS ---
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const checkEmail = "SELECT * FROM users WHERE email = ?";
        db.query(checkEmail, [email], async (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (result.length > 0) return res.status(400).json({ message: "Email already exists!" });

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";
            db.query(sql, [name, email, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: "Failed to create account" });
                return res.status(200).json({ message: "User registered successfully!" });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Hashing error" });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Server Error" });
        if (result.length > 0) {
            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ message: "Success", user: user });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ message: "User not found" });
        }
    });
});

// --- 3. USER PROFILE MANAGEMENT ---
app.get('/api/user/profile/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id, name, email, phone_number, address FROM users WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(result[0]);
    });
});

app.put('/api/user/profile/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone_number, address } = req.body;
    const sql = "UPDATE users SET name = ?, phone_number = ?, address = ? WHERE id = ?";
    db.query(sql, [name, phone_number, address, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to update profile" });
        res.status(200).json({ message: "Profile updated successfully!" });
    });
});

// --- 4. CAR INVENTORY CRUD ---
app.get('/api/cars', (req, res) => {
    const sql = "SELECT id, name, brand, model, price_per_day, status, transmission, fuel, seats, image_url FROM cars ORDER BY id DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post('/api/cars', (req, res) => {
    const name = req.body.name;
    const brand = req.body.brand || name || 'Generic';
    const model = req.body.model || '2026';
    const price_per_day = req.body.price_per_day || req.body.price;
    const status = req.body.status || 'Available';
    const transmission = req.body.transmission || req.body.gearbox || 'Automatic';
    const fuel = req.body.fuel || 'Gasoline';
    const seats = req.body.seats || 5;
    const image_url = req.body.image_url || req.body.image || '';

    const sql = "INSERT INTO cars (name, brand, model, price_per_day, status, transmission, fuel, seats, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, brand, model, price_per_day, status, transmission, fuel, seats, image_url], (err) => {
        if (err) {
            console.error("❌ SQL Insert Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Vehicle added successfully!" });
    });
});

app.put('/api/cars/:id', (req, res) => {
    const { id } = req.params;
    const { name, brand, model, price_per_day, status, transmission, fuel, seats, image_url } = req.body;
    const sql = "UPDATE cars SET name = ?, brand = ?, model = ?, price_per_day = ?, status = ?, transmission = ?, fuel = ?, seats = ?, image_url = ? WHERE id = ?";
    db.query(sql, [name, brand, model, price_per_day, status, transmission, fuel, seats, image_url, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Vehicle updated successfully!" });
    });
});

// 🛠️ DIRECT STATUS UPDATE ROUTE
app.put('/api/cars/status/:id', (req, res) => {
    const carId = req.params.id;
    let { status } = req.body;

    if (!status || status === 'SET STATUS') {
        status = 'Available';
    }

    const sql = "UPDATE cars SET status = ? WHERE id = ?";
    db.query(sql, [status, carId], (err, result) => {
        if (err) {
            console.error("❌ SQL Status Update Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Success: Car ID ${carId} status updated to ${status}`);
        res.status(200).json({ message: "Status updated successfully" });
    });
});

app.delete('/api/cars/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM cars WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Vehicle deleted successfully!" });
    });
});

// --- 5. RESERVATION SYSTEM ---
app.post('/api/reserve', (req, res) => {
    const { userId, carName, startDate, endDate, total, paymentMethod, referenceNumber } = req.body;
    const sql = `INSERT INTO reservations (user_id, car_name, start_date, end_date, total_price, status, payment_method, reference_number) 
                 VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)`;
    db.query(sql, [userId, carName, startDate, endDate, total, paymentMethod, referenceNumber], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to save reservation" });
        
        const updateCarSql = "UPDATE cars SET status = 'Rented' WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(name)), '%') OR LOWER(TRIM(name)) = LOWER(TRIM(?))";
        db.query(updateCarSql, [carName, carName], (updateErr) => {
            if (updateErr) console.error("Error updating car status:", updateErr);
            res.json({ message: "Success", id: result.insertId });
        });
    });
});

app.get('/api/reservations', (req, res) => {
    const sql = `SELECT r.*, u.name AS customer_name FROM reservations r JOIN users u ON r.user_id = u.id ORDER BY r.id DESC`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.get('/api/my-reservations/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const sql = "SELECT * FROM reservations WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(result); 
    });
});

app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body || {};
    const updatedStatus = body.status || 'Paid';
    const getCarSql = "SELECT car_name FROM reservations WHERE id = ?";
    db.query(getCarSql, [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Reservation not found" });
        const carName = rows[0].car_name;
        db.query("UPDATE reservations SET status = ? WHERE id = ?", [updatedStatus, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const updateCarSql = "UPDATE cars SET status = 'Rented' WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(name)), '%') OR LOWER(TRIM(name)) = LOWER(TRIM(?))";
            db.query(updateCarSql, [carName, carName], () => {
                res.status(200).json({ message: "Verified!" });
            });
        });
    });
});

app.put('/api/reservations/return/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT car_name FROM reservations WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Error" });
        const carName = rows[0].car_name;
        db.query("UPDATE reservations SET status = 'Completed' WHERE id = ?", [id], () => {
            
            const updateCarSql = "UPDATE cars SET status = 'Available' WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(name)), '%') OR LOWER(TRIM(name)) = LOWER(TRIM(?))";
            db.query(updateCarSql, [carName, carName], () => {
                res.status(200).json({ message: "Car returned!" });
            });
        });
    });
});

app.put('/api/reservations/cancel/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT car_name FROM reservations WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Reservation not found" });
        const carName = rows[0].car_name;

        db.query("UPDATE reservations SET status = 'Cancelled' WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const updateCarSql = "UPDATE cars SET status = 'Available' WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(name)), '%') OR LOWER(TRIM(name)) = LOWER(TRIM(?))";
            db.query(updateCarSql, [carName, carName], () => {
                res.status(200).json({ message: "Reservation cancelled successfully!" });
            });
        });
    });
});

app.put('/api/reservations/reject/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT car_name FROM reservations WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Reservation not found" });
        const carName = rows[0].car_name;

        db.query("UPDATE reservations SET status = 'Rejected' WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const updateCarSql = "UPDATE cars SET status = 'Available' WHERE LOWER(?) LIKE CONCAT('%', LOWER(TRIM(name)), '%') OR LOWER(TRIM(name)) = LOWER(TRIM(?))";
            db.query(updateCarSql, [carName, carName], () => {
                res.status(200).json({ message: "Reservation rejected." });
            });
        });
    });
});

// --- 6. ADMIN DASHBOARD STATS & CHARTS ---
app.get('/api/admin/stats', (req, res) => {
    const sql = `
        SELECT 
            COALESCE(SUM(CASE WHEN LOWER(TRIM(status)) IN ('paid', 'completed') THEN total_price ELSE 0 END), 0) AS totalRevenue,
            COUNT(CASE WHEN LOWER(TRIM(status)) IN ('paid', 'completed') THEN 1 END) AS confirmedBookings,
            COUNT(CASE WHEN LOWER(TRIM(status)) = 'pending' THEN 1 END) AS pendingBookings,
            (SELECT COUNT(*) FROM cars) AS totalCars
        FROM reservations;
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Stats SQL Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const data = result[0];
        res.json({
            totalRevenue: Number(data.totalRevenue) || 0,
            confirmedBookings: Number(data.confirmedBookings) || 0,
            totalBookings: Number(data.confirmedBookings) || 0,
            pendingBookings: Number(data.pendingBookings) || 0,
            totalCars: Number(data.totalCars) || 0
        });
    });
});

app.get('/api/admin/chart-data', (req, res) => {
    const sql = `
        SELECT 
            MONTH(created_at) AS month_num,
            MONTHNAME(created_at) AS month_name,
            COALESCE(SUM(CASE WHEN LOWER(TRIM(status)) IN ('paid', 'completed') THEN total_price ELSE 0 END), 0) AS monthly_revenue,
            COUNT(CASE WHEN LOWER(TRIM(status)) IN ('paid', 'completed') THEN 1 END) AS monthly_bookings
        FROM reservations
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        GROUP BY MONTH(created_at), MONTHNAME(created_at)
        ORDER BY month_num ASC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Chart SQL Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- 7. CUSTOMER MANAGEMENT API ---
app.get('/api/admin/users', (req, res) => {
    const sql = "SELECT * FROM users WHERE LOWER(role) = 'user' OR role IS NULL ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ SQL Fetch Users Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- 8. AI CHAT ASSISTANT API ---
app.post('/api/ai-chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Walang mensaheng natanggap.' });
        }

        const lowerMsg = message.toLowerCase();
        let reply = "Salamat sa iyong pagtatanong sa Calma Transportation! May maitutulong ba ako tungkol sa pag-rent ng kotse o sa iyong mga booking?";

        if (lowerMsg.includes('vios') || lowerMsg.includes('tesla') || lowerMsg.includes('car') || lowerMsg.includes('kotse')) {
            reply = `Ang aming mga sasakyan ay available para sa iyong biyahe. Maaari mong i-check ang "Cars" page para makita ang mga iba't ibang modelo, transmission, at presyo kada araw.`;
        } else if (lowerMsg.includes('magkano') || lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('cost')) {
            reply = `Ang halaga ng renta ay nakadepende sa napili mong sasakyan at tagal ng araw. Makikita mo ang eksaktong kabuuang presyo sa booking summary bago mo i-submit ang reservation.`;
        } else if (lowerMsg.includes('cancel') || lowerMsg.includes('kanselahin')) {
            reply = `Maaari mong i-cancel ang iyong booking habang ito ay "Pending" pa lamang sa pamamagitan ng pagpunta sa iyong "My Bookings" page at pag-click sa "Cancel" button.`;
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('bayad') || lowerMsg.includes('gcash') || lowerMsg.includes('receipt') || lowerMsg.includes('resibo')) {
            reply = `Maaari mong i-check ang status ng iyong bayad o mag-print ng opisyal na resibo sa pamamagitan ng pag-click sa "Receipt" button sa iyong "My Bookings" page.`;
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('magandang') || lowerMsg.includes('kumusta')) {
            reply = `Hello! Maligayang pagdating sa Calma Transportation. Anong sasakyan ang gusto mong i-book ngayon?`;
        }

        res.status(200).json({ reply });

    } catch (err) {
        console.error("❌ AI Chat Error:", err);
        res.status(500).json({ error: 'May error sa server.' });
    }
});

// --- 9. SERVER START ---
// --- 9. SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
});