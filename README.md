
# Full-Stack Job Tracker (Rust + React + MongoDB)

This is a full-stack web application that uses a modern, high-performance tech stack: a **Rust** backend API, a **React** frontend, and a **MongoDB** database.

The app allows a user to create, view, update, and delete job application entries in a clean, interactive dashboard.



---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Rust (with Axum & Tokio) |
| **Frontend** | React (with Vite) |
| **Database** | MongoDB |
| **UI Library** | Ant Design (AntD) |
| **API Style** | REST |

---

## Features

* **Full CRUD Functionality:**
    * **Create:** A modal form lets you add new jobs. It uses smart components like a `DatePicker` for the application date and searchable `Select` dropdowns for "Status" and "Place."
    * **Read:** All jobs are displayed in a clean, card-based list on the main page.
    * **Update:** A "View" button opens a modal showing all job details. An "Edit" button inside the modal instantly flips it into an editable form, pre-filled with the job's data.
    * **Delete:** A "Delete" button with a confirmation pop-up prevents accidental deletions.
* **Detailed Data Model:** Tracks key info like `Title`, `Company`, `Status`, `Source`, `Date Applied`, `Place`, and `Salary`.
* **Clean UI:** Uses the Ant Design library for a professional and responsive user interface, including forms, modals, and user notifications.

---

## How to Run

This project is split into two parts: a `backend` and a `frontend`. You must run both at the same time in two separate terminals.

### Prerequisites

* [Rust & Cargo](https://www.rust-lang.org/tools/install)
* [Node.js & npm](https://nodejs.org/en)
* [MongoDB Community Server](httpsS://www.mongodb.com/try/download/community)

### Terminal 1: Run the Backend (Rust)

```powershell
# 1. Go to the backend folder
cd backend

# 2. Run the Rust server
cargo run
```
```powershell
# 1. Go to the frontend folder
cd frontend

# 2. Install dependencies (only the first time)
npm install

# 3. Run the React dev server
npm run dev
```
