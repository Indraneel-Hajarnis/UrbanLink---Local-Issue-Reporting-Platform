# 🏙️ UrbanLink: Local Issue Reporting Platform

UrbanLink is a modern, role-based governance platform designed to bridge the gap between citizens and local authorities. It empowers residents to report civic issues directly, provides Ward Managers with tools for efficient resolution tracking, and offers the City Mayor a bird's-eye view of urban health through real-time analytics.

---

## 🚀 Key Features

### 👤 For Citizens
- **AI-Powered Reporting**: Snap a photo and let Google Gemini AI automatically categorize the issue and provide a detailed description.
- **Ward Analytics & Comparison**: 
    - **Single Ward Drilldown**: Analyze any ward's health through status distribution and category-specific charts.
    - **Multi-Ward Analysis**: Side-by-side comparison of two wards to evaluate relative resolution rates and civic efficiency.
- **Community Insight**: Access a city-wide "Community Feed" to view reported issues and track global trends in municipal health.
- **Live Tracking & History**: Maintain a personal log of all submissions with real-time status updates (Pending 🔴, In Progress 🟠, Resolved 🟢).
- **Premium Dashboard**: A sleek, high-contrast interface featuring live resolution charts and categorical summaries of personal contributions.

### 👷 For Ward Managers
- **Localized Oversight**: Access a dedicated queue containing only issues from your assigned ward.
- **Resolution Control**: Update the status of issues in real-time (Pending 🔴, In Progress 🟠, Resolved 🟢) to communicate progress to citizens.
- **Issue Details**: View high-resolution photos, detailed descriptions, and precise location data for every report.

### 🏛️ For the City Mayor
- **City-Wide Analytics**: Interactive donut charts for Status Distribution and Category Splits across all wards.
- **Governance Tools**: Create and deploy Ward Managers to specific wards to ensure no area is left unmanaged.
- **Priority Alerts**: A dynamic "Priority Banner" that highlights wards currently lacking an assigned manager.
- **Unified Vision**: Access a holistic view of the city's resolution rate and civic health.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Recharts, Vanilla CSS (Modern Aesthetics) |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (JWT-based Role Access Control) |
| **AI/ML** | Google Gemini 1.5 Flash (Image & Text Analysis) |
| **Storage** | Supabase Storage (Cloud-hosted issue photos) |

---

## 🏗️ Architecture & Security

- **Role-Based Access Control (RBAC)**: Secure redirection and API protection for `CITIZEN`, `MANAGER`, and `MAYOR` roles.
- **Ward Normalization**: Robust backend logic to handle Mumbai's complex ward naming conventions (e.g., matching "R/C" to "BMC R/C").
- **Row Level Security (RLS)**: Database-level protection ensuring managers can only modify issues within their jurisdiction.
- **Responsive Design**: Premium dark-mode aesthetics with glassmorphism effects and smooth transitions.

---

## 📦 Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Indraneel-Hajarnis/UrbanLink---Local-Issue-Reporting-Platform.git
   cd UrbanLink---Local-Issue-Reporting-Platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GEMINI_API_KEY=your_google_ai_key
   PORT=5000
   ```

4. **Run the Application**
   ```bash
   # Start the Backend Server
   npm run server

   # Start the Frontend Development Server
   npm run dev
   ```

---

## 👨‍💻 Contributors

- **Indraneel Hajarnis** | [GitHub](https://github.com/Indraneel-Hajarnis)
- **Akhil Anil** | [GitHub](https://github.com/akhil2409x)

---

## 📜 License

Created for the UrbanLink Governance Initiative. All rights reserved.
