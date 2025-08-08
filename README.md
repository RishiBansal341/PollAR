# 📊 PollAR – Location-Based Polling Web App

PollAR is a **React + Firebase** web application that lets users create, view, and vote on polls based on their **current location** or **specific localities**.
It’s designed to bring **community-driven decision-making** to life by making polls more relevant, localized, and engaging.

---

## 🚀 Features

* **🔑 Authentication**

  * Google Sign-In via Firebase Authentication.
* **🗳 Poll Creation**

  * Create polls with title, options, and automatic geolocation.
  * NLP-powered suggestions for poll questions & options.
  * Voice-enabled poll creation.
* **📍 Location Features**

  * Auto-detect current location using HTML5 Geolocation.
  * Filter polls within a given radius (e.g., 1km, 5km).
  * Search by specific localities (e.g., Malviya Nagar, Jagatpura) using OpenCage API.
  * Map view & heatmap visualization of poll activity.
* **📊 Data Visualization**

  * Real-time vote counts.
  * Pie chart visualization using Recharts.
* **🔒 Anti-Spam**

  * Invisible reCAPTCHA on poll creation.
* **🌐 Multi-language Support**

  * Create and view polls in multiple languages.

---

## 🛠 Tech Stack

* **Frontend:** React.js + Tailwind CSS
* **Backend & Auth:** Firebase Authentication, Firestore Database
* **Geolocation & Mapping:** HTML5 Geolocation API, Leaflet.js, leaflet.heat
* **APIs:** OpenCage Geocoding API
* **Charts:** Recharts
* **Security:** Google reCAPTCHA v3
* **AI & NLP:** OpenAI API for poll suggestion generation

---

## 📂 Project Structure

```
PollAR/
│── public/
│── src/
│   ├── App.jsx
│   ├── firebase.js
│   ├── components/
│   ├── styles/
│── package.json
│── README.md
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YourUsername/PollAR.git
   cd PollAR
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add Firebase & API Keys**

   * Create a `.env` file in the root directory:

     ```env
     REACT_APP_FIREBASE_API_KEY=your_firebase_key
     REACT_APP_OPENCAGE_API_KEY=your_opencage_key
     REACT_APP_OPENAI_API_KEY=your_openai_key
     REACT_APP_RECAPTCHA_KEY=your_recaptcha_key
     ```

4. **Run the project**

   ```bash
   npm start
   ```

---

## 📌 Future Enhancements

* Location-based notifications for new polls nearby.
* Advanced analytics dashboard for poll creators.
* AI-driven trend detection in poll responses.

---

## 📷 Screenshots

| Home Page                     | Captcha Verification                        | Heatmap View                        |
| ----------------------------- | ------------------------------------------- | ----------------------------------- |
| ![Home](screenshots/home.png) | ![Create Poll](screenshots/captcha.png) | ![Heatmap](screenshots/heatmap.png) |

---

## 👨‍💻 Author

**Rishi Bansal**
[GitHub](https://github.com/YourUsername) | [LinkedIn](https://linkedin.com/in/your-linkedin)
