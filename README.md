# ACT365 Calendar Booking System (PoC)

##  Overview
This project is a calendar booking system built as a Proof of Concept for environments using Vanderbilt ACT365 access control workflows.

The idea is that organizations already using ACT365 (for example a billiard room, gym, shared hobby room, or any space behind an access-controlled door) can embed/link this booking system on their own website.
A customer can then reserve a time slot, and after booking they receive an email with an access code that can be used to open the door during the reserved time (based on ACT365 configuration).

---

## How It Works

### Create an Account
First, create user credentials on the site.
<img src="src/assets/1.jpg" width="250" />

### Link an ACT365 Customer Account
After creating credentials and logging in, you must link an ACT365 customer account.

You will need:

- ACT365 Account / Tenant ID
- Login credentials
- Ask the system provider / administrator for these details.

<img src="src/assets/2.jpg" width="250" />
<img src="src/assets/3.jpg" width="250" />

### Create a Calendar
You can create a calendar from the page "Luo kalenteri".

<img src="src/assets/4.jpg" width="250" />

### Fill Calendar Details
Enter the calendar information as you want.

<img src="src/assets/5.jpg" width="250" />

### Customer Books a Time Slot via Link

After the calendar is created, the customer can access it through a shareable link and make a reservation.
<img src="src/assets/6.jpg" width="250" />

### Booking Appears in ACT365
The reservation will be visible in the ACT365 system.
<img src="src/assets/7.jpg" width="250" />




## Key Features
- Create bookings with start/end time and basic metadata

- View bookings in a clear calendar-style UI

- Prevent conflicts (no overlapping reservations for the same resource)

- Resource-based bookings (e.g., room/door/resource selection)

- User/tenant based access (basic separation between organizations/tenants)

- Backend API for integration and future automation

## Tech Stack

- Backend: Node.js (TypeScript) + Express

- Database: MongoDB (Mongoose) (or your chosen DB)

- Frontend: React / React Native (Expo) (depending on your setup)

- Deployment: Heroku for backend and netlify for frontend

## Architecture

- Client app communicates with the backend via REST API

- Backend validates bookings, checks conflicts, and stores data

- Database stores tenants, users, resources, and bookings

---

## Installation (Local Development)

### Prerequisites

- Node.js (LTS recommended)
- npm
- Database access (MongoDB local or cloud)

### Steps

- Clone the repository

Install dependencies:
```bash
npm i

Build the project:

npm run build

Start the server:

npm start
```bash




