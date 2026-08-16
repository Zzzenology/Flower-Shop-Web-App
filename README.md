# PC-FlowerShopWeb

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-ASP.NET_Core_8.0-512BD4?logo=.net)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

**PC-FlowerShopWeb** is a modern, full-stack e-commerce web application tailored specifically for flower shops. It provides a comprehensive platform that serves both customers looking to purchase floral arrangements and flower sellers (vendors) needing to manage their online inventory.

---

## Table of Contents

1. [Project Overview & Features](#-project-overview--features)
2. [System Architecture](#-system-architecture)
3. [User Roles & Authentication](#-user-roles--authentication)
4. [Database Schema](#-database-schema)
5. [API Endpoints Overview](#-api-endpoints-overview)
6. [Local Setup](#local-setup)
7. [Repository Structure](#-repository-structure)

---

## Project Overview & Features

Online store:

- **For Customers:**
  - **Product Catalog:** Browse and search for flowers by categories, names, and colors.
  - **Shopping Cart:** Add products to a cart, adjust quantities, and review totals.
  - **Order Management:** Place orders securely with delivery addresses and track order status/history.
- **For Sellers (Vendors):**
  - **Vendor Dashboard:** A dedicated interface to manage their specific products.
  - **Inventory Management:** Full CRUD operations (Create, Read, Update, Delete) for floral products.
  - **Media Uploads:** Securely upload and manage product images which are stored locally on the server.

---

## System Architecture

Client-Server architecture:

- **Frontend (`/frontend`)**: A Single Page Application (SPA) built with **React 19** and **Vite**. It uses React Router for client-side routing, Axios for API communication, and Bootstrap 5 for a responsive, mobile-first design.
- **Backend (`/backend`)**: A robust RESTful API built with **C# ASP.NET Core 8.0**. It handles business logic, serves static assets (like uploaded images), and manages secure routing.
- **Database**: **MongoDB** is used for flexible, document-based data persistence, connected via the official MongoDB .NET Driver.

---

## User Roles & Authentication

Security is handled via **stateless JWT (JSON Web Tokens)**. When a user logs in, the API returns a JWT that must be passed in the `Authorization` header for protected endpoints.

The application strictly enforces Role-Based Access Control:

- `Customer` role: Can browse, manage their cart, and place orders.
- `Vanzator` (Seller) role: Has all customer privileges and the ability to manage the product catalog and upload images.

---

## Database Schema

MongoDB database, three primary collections:

1. **Users Collection**
   - Stores user credentials (hashed passwords), emails, and their assigned `role` (`customer` or `vanzator`).
2. **Products Collection**
   - Stores floral items. Includes fields: `nume` (name), `culoare` (color), `categorie` (array of categories), `price`, `pozaURL` (image path), and `vanzatorId` (reference to the user who created it).
3. **Orders Collection**
   - Stores purchase history. Contains `customerId`, an array of embedded `products` (with price and quantity snapshots at time of purchase), `totalAmount`, `orderStatus`, and a nested `deliveryAddress` object.

---

## API Endpoints Overview

Brief overview of the core controllers:

- **Authentication (`/login`, `/user/register`)**
  - Issues JWTs and handles user creation with password hashing.
- **Products (`/product`)**
  - `GET /product/all`: Retrieves the public catalog.
  - `POST /product`: (Seller only) Uploads a new product with `multipart/form-data` for the image.
  - `DELETE /product/{id}`: (Seller only) Deletes a specific product.
- **Orders (`/order`)**
  - `POST /order`: Submits a new customer order.
  - `GET /order/my-orders`: Retrieves order history for the authenticated user.

---

## Setup

### Prerequisites

- **Node.js** (v18+)
- **.NET 8.0 SDK**
- **MongoDB**

### Backend API

Navigate to the backend directory and run the ASP.NET Core server:

```bash
cd backend
# Trust the developer certificate (Required once for HTTPS)
dotnet dev-certs https --trust
# Start the API
dotnet run
```

_The API will start on `https://localhost:5001` and `http://localhost:5000`._

### Frontend Client

Open a new terminal window, navigate to the frontend directory, install packages, and start Vite:

```bash
cd frontend
npm install
npm run dev
```

_The React app will start on `http://localhost:5173`._

---

## Repository Structure

```text
PC-FlowerShopWeb/
├── backend/                # ASP.NET Core 8.0 Web API
│   ├── Controllers/        # API route handlers
│   ├── Entities/           # C# Data Models & DTOs
│   ├── Data/               # MongoDB Service configuration
│   ├── wwwroot/uploads/    # Local storage for product images
│   ├── Program.cs          # API configuration and middleware pipeline
│   └── API.csproj
├── frontend/               # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components & Pages
│   │   ├── services/       # Axios API wrapper functions
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json
│   └── vite.config.js      # Vite build & proxy configuration
├── Applicatia.sln          # Visual Studio Solution File
└── .gitignore
```
