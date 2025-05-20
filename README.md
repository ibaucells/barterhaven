# BarterHaven

BarterHaven is a web application that enables users to exchange products through bartering — no money involved. Users can register, publish their items, explore products added by others, and propose trades. It’s a community-driven, sustainable alternative to traditional marketplaces.

---

## Tech Stack

- **Frontend**: Vue.js + Vuetify (for UI styling)
- **Backend**: Node.js (with minimal Express usage)
- **Database**: MongoDB
- **Style**: Vuetify and custom CSS

---

## Getting Started

Follow the steps below to run the project locally:

### 1. Clone the repository

```bash
git clone git@github.com:ibaucells/barterhaven.git
cd barterhaven
``` 

### 2. Start MongoDB
Make sure MongoDB is installed and running on your system.

```bash
sudo systemctl start mongod
```
If mongod is not recognized, ensure MongoDB is properly installed.


### 3. Install dependencies
Install Node dependencies:

```bash
npm install
```

### 4. Start the backend server
This serves API endpoints and uploaded images.

```bash
node backend/server.js
```

### 5. Start the frontend
Open a second terminal and run:

```bash
npm run dev
```

This will launch the frontend at: `http://localhost:3000`. Open it in your browser and enjoy exploring BarterHaven!