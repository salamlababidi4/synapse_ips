const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8000;
const SECRET_KEY = "synapse_secret_key";

app.use(cors());
app.use(express.json());

// temporary login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "synapse123") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}

// protected alerts endpoint
app.get("/api/alerts", authenticateToken, (req, res) => {
  res.json({
    total_alerts: 45,
    critical_alerts: 6,
    blocked_ips: 12,
    recent_alerts: [
      {
        time: "20:14",
        source_ip: "185.23.66.12",
        severity: "High",
        description: "Port scan detected"
      },
      {
        time: "20:11",
        source_ip: "91.211.54.77",
        severity: "Critical",
        description: "Brute force attack blocked"
      },
      {
        time: "20:08",
        source_ip: "172.16.1.44",
        severity: "Medium",
        description: "Suspicious traffic pattern"
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Synapse backend running on http://localhost:${PORT}`);
});