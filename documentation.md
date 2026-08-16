# PC-FlowerShopWeb Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Setup and Installation](#setup-and-installation)
6. [Configuration](#configuration)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Database Schema](#database-schema)
10. [Authentication & Authorization](#authentication--authorization)
11. [Usage Guide](#usage-guide)
12. [Development](#development)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

## Project Overview

PC-FlowerShopWeb is a full-stack e-commerce web application designed for a flower shop. The application provides a comprehensive platform for flower sellers to manage their products and for customers to browse, purchase, and track flower orders.

### Key Features
- **User Management**: Registration, login, and role-based access control
- **Product Catalog**: Browse and search flower products by category and color
- **Shopping Cart**: Add, remove, and manage items before purchase
- **Order Management**: Place orders, track order status, and view order history
- **Seller Dashboard**: Vendors can add, edit, and delete their flower products
- **Image Upload**: Support for product image uploads and management
- **Responsive Design**: Modern, mobile-friendly user interface

### User Roles
- **Customer**: Can browse products, place orders, and manage their profile
- **Seller (Vanzator)**: Can manage their own products in addition to customer features

## Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────┐    HTTP/HTTPS    ┌──────────────────┐    MongoDB    ┌─────────────┐
│   React SPA     │◄─────────────────┤  ASP.NET Core    │◄──────────────┤   MongoDB   │
│   (Frontend)    │     REST API     │     Web API      │   Database    │  Database   │
│                 │                  │   (Backend)      │   Queries     │             │
└─────────────────┘                  └──────────────────┘               └─────────────┘
```

### Component Communication
- **Frontend ↔ Backend**: RESTful API calls with JSON payloads
- **Backend ↔ Database**: MongoDB driver for .NET with LINQ queries
- **Authentication**: JWT tokens for stateless authentication
- **File Storage**: Local file system for product images

## Technologies Used

### Backend
- **Framework**: ASP.NET Core 9.0
- **Database**: MongoDB 3.4.0
- **Authentication**: JWT Bearer tokens
- **File Upload**: IFormFile with local storage
- **CORS**: Configured for React development server

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 7.6.2
- **HTTP Client**: Axios 1.9.0
- **UI Framework**: Bootstrap 5.3.6
- **Icons**: React Icons 5.5.0

### Development Tools
- **Linting**: ESLint 9.22.0
- **IDE Support**: Visual Studio Code configuration included

## Project Structure

```
PC-FlowerShopWeb/
├── Csharp_project/
│   └── Applicatia/
│       ├── API/                          # Backend ASP.NET Core API
│       │   ├── Controllers/              # API Controllers
│       │   │   ├── UserController.cs     # User management endpoints
│       │   │   ├── ProductController.cs  # Product CRUD operations
│       │   │   ├── OrderController.cs    # Order management
│       │   │   └── LoginController.cs    # Authentication endpoints
│       │   ├── Entities/                 # Data models
│       │   │   ├── User.cs              # User entity
│       │   │   ├── Product.cs           # Product entity
│       │   │   ├── Order.cs             # Order entity
│       │   │   ├── JWTSettings.cs       # JWT configuration
│       │   │   └── LoginRequest.cs      # Login DTO
│       │   ├── Data/                     # Database layer
│       │   │   └── MongoDbServices.cs   # MongoDB service
│       │   ├── Properties/               # Project properties
│       │   ├── wwwroot/                  # Static files (uploads)
│       │   ├── Front_client/             # React Frontend
│       │   │   ├── src/
│       │   │   │   ├── components/       # React components
│       │   │   │   ├── services/         # API service layer
│       │   │   │   ├── assets/          # Static assets
│       │   │   │   ├── App.jsx          # Main App component
│       │   │   │   └── main.jsx         # React entry point
│       │   │   ├── public/              # Public assets
│       │   │   ├── package.json         # Frontend dependencies
│       │   │   └── vite.config.js       # Vite configuration
│       │   ├── Program.cs               # API startup configuration
│       │   ├── API.csproj              # Backend project file
│       │   └── appsettings.json        # API configuration
│       ├── Applicatia.sln              # Visual Studio solution
│       └── package.json                # Root package.json
└── documentation.md                     # This documentation file
```

## Setup and Installation

### Prerequisites
- **.NET 9.0 SDK** or later
- **Node.js 18+** and npm
- **MongoDB 4.4+** (local installation or MongoDB Atlas)
- **Visual Studio 2022** or **Visual Studio Code** (recommended)

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd PC-FlowerShopWeb/Csharp_project/Applicatia/API
   ```

2. **Restore NuGet packages**:
   ```bash
   dotnet restore
   ```

3. **Configure MongoDB connection** in `appsettings.json`:
   ```json
   {
     "MongoDbSettings": {
       "ConnectionString": "mongodb://localhost:27017",
       "DatabaseName": "FlowerShopDB"
     }
   }
   ```

4. **Run the API**:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5000` and `https://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd PC-FlowerShopWeb/Csharp_project/Applicatia/API/Front_client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Database Setup

The application will automatically create the required MongoDB collections on first run. Ensure MongoDB is running and accessible via the connection string in `appsettings.json`.

## Configuration

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-here-must-be-at-least-32-characters",
    "Issuer": "FlowerShopAPI",
    "Audience": "FlowerShopUsers",
    "ExpirationInMinutes": 60
  }
}
```

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `https://localhost:5173`
- `http://localhost:5000`
- `https://localhost:5001`

## API Documentation

### Authentication Endpoints

#### POST /login
**Description**: Authenticate user and receive JWT token
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "userName": "username",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### User Endpoints

#### POST /user/register
**Description**: Register a new user
**Request Body**:
```json
{
  "userName": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "customer"
}
```

#### GET /user/profile
**Description**: Get current user profile (requires authentication)
**Headers**: `Authorization: Bearer <token>`

### Product Endpoints

#### GET /product/all
**Description**: Get all products
**Response**:
```json
[
  {
    "id": "product-id",
    "nume": "Red Rose",
    "culoare": "Red",
    "categorie": ["Roses", "Valentine"],
    "pozaURL": "/uploads/image.jpg",
    "price": 25.99,
    "vanzatorId": "seller-id",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /product
**Description**: Create new product (requires seller role)
**Headers**: `Authorization: Bearer <token>`
**Content-Type**: `multipart/form-data`
**Form Data**:
- `nume`: Product name
- `culoare`: Color
- `categorie`: Array of categories
- `price`: Price
- `poza`: Image file

#### GET /product/my-products
**Description**: Get seller's products (requires seller role)
**Headers**: `Authorization: Bearer <token>`

#### DELETE /product/{id}
**Description**: Delete product (requires seller role, own products only)
**Headers**: `Authorization: Bearer <token>`

### Order Endpoints

#### POST /order
**Description**: Create new order (requires authentication)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "products": [
    {
      "productId": "product-id",
      "productName": "Red Rose",
      "price": 25.99,
      "quantity": 2
    }
  ],
  "totalAmount": 51.98,
  "deliveryAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "Bucharest",
    "postalCode": "012345",
    "country": "Romania",
    "phoneNumber": "+40123456789"
  }
}
```

#### GET /order/my-orders
**Description**: Get user's orders (requires authentication)
**Headers**: `Authorization: Bearer <token>`

## Frontend Components

### Core Components

#### App.jsx
Main application component with routing configuration. Implements:
- React Router for navigation
- Private routes for authenticated pages
- Cart context provider
- JWT token validation

#### Navbar.jsx
Navigation component with:
- Brand logo and navigation links
- Authentication status display
- Cart icon with item count
- User menu with logout functionality

### Page Components

#### HomePage.jsx
Landing page with:
- Hero section
- Featured products
- Category highlights
- Call-to-action buttons

#### CatalogPage.jsx
Product catalog with:
- Product grid display
- Category filtering
- Search functionality
- Product cards with images and prices

#### ProductPage.jsx
Individual product details:
- Large product image
- Product information
- Add to cart functionality
- Seller information

#### CartPage.jsx
Shopping cart management:
- Cart items list
- Quantity adjustment
- Remove items
- Total calculation
- Checkout button

#### CheckoutPage.jsx
Order placement:
- Delivery address form
- Order summary
- Payment processing
- Order confirmation

#### ProfilePage.jsx
User profile management:
- Personal information
- Order history
- For sellers: product management
- Account settings

### Context Providers

#### CartContext.jsx
Global cart state management:
- Add/remove items
- Update quantities
- Cart persistence
- Total calculation

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  role: String, // "customer" or "vanzator"
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  nume: String,
  culoare: String,
  categorie: [String],
  pozaURL: String,
  vanzatorId: String, // Reference to Users
  price: Number,
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  customerId: String, // Reference to Users
  customerEmail: String,
  products: [
    {
      productId: String,
      productName: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  deliveryAddress: {
    fullName: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
    phoneNumber: String,
    additionalInfo: String
  },
  orderStatus: String, // "Pending", "Processing", "Shipped", "Delivered"
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication & Authorization

### JWT Token Structure
- **Issuer**: FlowerShopAPI
- **Audience**: FlowerShopUsers
- **Claims**: User ID, email, role
- **Expiration**: 60 minutes (configurable)

### Role-Based Access Control
- **Public**: Product viewing, user registration
- **Authenticated**: Cart operations, order placement, profile access
- **Seller Role**: Product management (CRUD operations)

### Security Features
- Password hashing (implementation in UserController)
- JWT token validation on protected endpoints
- CORS policy restricting frontend origins
- Input validation and sanitization

## Usage Guide

### For Customers

1. **Registration/Login**:
   - Navigate to registration page
   - Fill in username, email, password
   - Select "customer" role
   - Login with credentials

2. **Browse Products**:
   - Visit catalog page
   - Use category filters
   - Search by product name
   - View product details

3. **Shopping Cart**:
   - Add products to cart
   - Adjust quantities
   - Remove unwanted items
   - Proceed to checkout

4. **Place Order**:
   - Fill delivery address
   - Review order summary
   - Confirm order placement
   - Receive order confirmation

5. **Track Orders**:
   - Visit orders page
   - View order status
   - Check delivery details

### For Sellers

1. **Registration**:
   - Register with "vanzator" role
   - Login to access seller features

2. **Product Management**:
   - Access profile page
   - Add new products with images
   - Edit existing products
   - Delete products
   - View sales analytics

3. **Order Management**:
   - View orders containing your products
   - Update order status
   - Manage inventory

## Development

### Running in Development Mode

1. **Backend**:
   ```bash
   cd API
   dotnet watch run
   ```

2. **Frontend**:
   ```bash
   cd API/Front_client
   npm run dev
   ```

### Building for Production

1. **Frontend**:
   ```bash
   cd API/Front_client
   npm run build
   ```

2. **Backend**:
   ```bash
   cd API
   dotnet publish -c Release
   ```

### Code Style and Linting

- **Frontend**: ESLint configuration included
- **Backend**: Follow C# coding conventions
- **Database**: MongoDB naming conventions

### Adding New Features

1. **Backend**:
   - Add entity models in `Entities/`
   - Create controllers in `Controllers/`
   - Extend MongoDB service in `Data/`
   - Update authorization policies if needed

2. **Frontend**:
   - Create components in `components/`
   - Add routes in `App.jsx`
   - Implement API calls in `services/`
   - Update navigation in `Navbar.jsx`

## Deployment

### Production Considerations

1. **Environment Variables**:
   - Use secure JWT secret keys
   - Configure production MongoDB connection
   - Set appropriate CORS origins

2. **Security**:
   - Enable HTTPS in production
   - Implement rate limiting
   - Add input validation
   - Use secure cookie settings

3. **Performance**:
   - Implement caching strategies
   - Optimize MongoDB queries
   - Use CDN for static assets
   - Enable gzip compression

### Deployment Options

1. **Self-Hosted**:
   - IIS for ASP.NET Core API
   - Nginx for static file serving
   - MongoDB on dedicated server

2. **Cloud Deployment**:
   - Azure App Service for API
   - Azure Static Web Apps for frontend
   - MongoDB Atlas for database

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Verify frontend URL in CORS policy
   - Check development server ports
   - Ensure credentials are included in requests

2. **Authentication Issues**:
   - Verify JWT secret key configuration
   - Check token expiration
   - Ensure Authorization header format

3. **Database Connection**:
   - Verify MongoDB service is running
   - Check connection string format
   - Ensure database permissions

4. **File Upload Issues**:
   - Check wwwroot directory permissions
   - Verify file size limits
   - Ensure supported file formats

### Debug Mode

Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Performance Monitoring

- Monitor MongoDB query performance
- Track API response times
- Analyze frontend bundle size
- Monitor memory usage

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Authors**: Development Team  
**License**: [Specify License] 