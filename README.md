# 1UNIQ TRANS Logistics Portal

## 🚀 Overview
The **1UNIQ TRANS Logistics Portal** is an enterprise-grade logistics and transport management system. Engineered as a seamless Mono-repo utilizing **Spring Boot 3.4** and **Angular 17**, it provides an intuitive, high-performance web interface natively coupled with a highly scalable, secure Java backend.

## ✨ Key Features
- **Booking Management (LR):** Create and track LRs (Lorry Receipts) seamlessly by capturing Consignors, Consignees, and Articles (Weight/Fix) with dynamic, real-time GST (CGST/SGST/IGST) and freight auto-calculations.
- **Dispatch Operations:** Robust tools to handle vehicle loading workflows, dispatch monitoring, and regional assignments.
- **Extensive MIS Reporting:** Lightning-fast data grids for generating Booking Reports, Dispatch Reports, and Statements, equipped with one-click **PDF** and **Excel** export mechanisms.
- **Enterprise Administration:** Full CRUD functionality to securely manage Branches, Employees, and Vehicles powered by strict Role-Based Access Control (RBAC).
- **Automated Notifications:** Native **Twilio SMS** API integration to autonomously alert customers and stakeholders via text messages.

## 🛠 Tech Stack Summary

### Backend Architecture
- **Core Framework:** Java 17, Spring Boot 3.4.3
- **Data & Caching:** Spring Data JPA, Hibernate, MySQL, **Redis** (Spring Cache wrapper)
- **Logging:** Log4j2 (High-throughput structured application logging)
- **Integrations:** Twilio SMS SDK (v9.0.0)
- **View Resolution:** Custom `SpaController` & Thymeleaf for deeply-linked SPA fallback routing.

### Frontend Architecture
- **Framework:** Angular 17.3
- **UI Toolkit:** Angular Material 17 + SCSS (Modern glassmorphism and Material 3 inspired aesthetics)
- **State & Routing:** RxJS, standalone components architecture.
- **Security:** AES payload encryption (`crypto-js`) for secure data transmissions.
- **Exports:** `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS)
- **Build Operations:** Configured Webpack budgets and CommonJS ESM whitelisting for strict performance limits.

## 📁 Repository Structure
```text
logistic/
├── backend/            # Spring Boot REST API & Business Logic
│   ├── src/main/java   # Java Controllers, Services, Entities & Repositories
│   ├── src/main/resources # application.properties, log4j2 configs, compiled static content
│   └── pom.xml         # Maven configuration
├── frontend/           # Angular 17 Single Page Application
│   ├── src/app         # Core, Features, Shared UI modules
│   ├── angular.json    # Build configuration strictly mapped to backend's /static dir
│   └── package.json    # Node dependencies
└── README.md           # Project Documentation
```

## ⚙️ Getting Started (Local Development)

### Prerequisites
- **Java 17** & Maven
- **Node.js** (v18 or higher) & NPM
- **MySQL** (Running locally on port `3306`)
- **Redis Server** (Running locally on port `6379` for optimization caches)

### 1. Start the Backend
Open a terminal in the `backend/` folder and boot the Spring application:
```bash
cd backend
./mvnw spring-boot:run
```
*(The backend REST API will power on at `http://localhost:8080`)*

### 2. Start the Frontend
Open a new terminal in the `frontend/` folder to serve the UI:
```bash
cd frontend
npm install
npm start
```
*(The frontend proxy maps `/api` requests to `localhost:8080`, rendering the UI seamlessly over `http://localhost:4200`)*

## 📦 Production Build & Deployment

This mono-repo is strategically configured so the frontend compiles its final production bundles directly into the backend's static directory. This avoids messy CORS complications and yields a single, highly distributable FAT JAR.

1. **Compile the Angular Application:**
   Open a terminal in `frontend/` and execute the production build pipeline:
   ```bash
   npm run build
   ```
   *This executes `ng build`, meticulously optimizing JS/CSS chunks and securely injecting them directly into `../backend/src/main/resources/static`.*

2. **Package the Spring Boot Executable JAR:**
   Navigate back to the `backend/` directory and run Maven to encapsulate the entire application:
   ```bash
   cd ../backend
   ./mvnw clean package -DskipTests
   ```

3. **Deploy & Run in Production:**
   ```bash
   java -jar target/logistic-1.7.jar
   ```
   *The entire unified platform (Frontend + APIs) is now securely running from `http://localhost:8080`.* 

> **Routing Integrity:** Attempting to navigate or hard-refresh straight into a deep link (like `http://localhost:8080/dashboard/booking`) is seamlessly intercepted over regex by the Java `SpaController` fallback, gracefully returning `index.html` so the Angular routing engine takes over instantly.

## 🔒 Security & Performance Best Practices Implemented
- **AES Payload Encryption:** Interceptors inherently encrypt/decrypt critical operational payloads between client and server via AES standards.
- **Intelligent Caching:** Heavy configuration datasets leverage pure Redis caching thresholds avoiding repetitive database hits.
- **Strict Bundle Budgets:** Angular CLI triggers `budget` warnings locally if SCSS payload sizes deviate outside of highly optimized constraints, ensuring Lighthouse performance standards hold strong.
- **Zero-Shift Error Validations:** Inputs dynamically preserve subscript spacing eliminating layout jumping on aggressive form error triggerings.
