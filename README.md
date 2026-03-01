


# Lazarus 🚀  
*A Creator Economy & Brand Collaboration Platform*

Lazarus is a full-stack web application designed to connect **brands** with **creators**, enabling campaign management, funding, payouts, and performance tracking in one place.

---

## ✨ Features

### 👤 Authentication
- Firebase Authentication (Email/Password)
- Role-based access (Brand / Creator)

### 🏢 Brand Dashboard
- Create & manage campaigns
- View creators participating in campaigns
- Track funding, revenue & payouts

### 🎨 Creator Dashboard
- Browse available campaigns
- Participate in brand campaigns
- Track earnings and performance

### 💰 Campaign & Funding
- Campaign-wise fund allocation
- Track total raised amount
- Revenue & payout management

### 📊 Data Management
- PostgreSQL database for persistent storage
- REST APIs for secure data flow

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Firebase Authentication
- CSS / Tailwind (if applicable)

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database
- PostgreSQL

### Tools & Platforms
- Git & GitHub
- Firebase
- VS Code
- Postman

---

## 📂 Project Structure
Lazarus/ │ ├── frontend/ │   ├── src/ │   │   ├── pages/ │   │   ├── components/ │   │   ├── firebase.js │   │   └── App.js │ ├── backend/ │   ├── server.js │   ├── routes/ │   ├── controllers/ │   └── db/ │ ├── README.md └── package.json
Copy code

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/devensonawane007/Lazarus.git
cd Lazarus
2️⃣ Frontend Setup
Copy code
Bash
cd frontend
npm install
npm start
3️⃣ Backend Setup
Copy code
Bash
cd backend
npm install
node server.js
⚠️ Make sure PostgreSQL is running and database credentials are configured correctly.
🔐 Environment Variables
Create a .env file in backend:
Copy code
Env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lazarus
DB_PORT=5432
📸 Screenshots
(Add screenshots of dashboards and UI here)
🚧 Future Enhancements
Payment gateway integration
Campaign analytics dashboard
Messaging system (Brand ↔ Creator)
Admin panel
Mobile app support
🤝 Contributing
Contributions are welcome!
Feel free to fork the repository and submit a pull request.
📜 License
This project is licensed under the MIT License.
👨‍💻 Author
Deven Sonawane
GitHub: @devensonawane007�
⭐ If you like this project, don’t forget to star the repo!
Copy code

---


