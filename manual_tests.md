# Manual Testing Guide for PC-FlowerShopWeb

## Overview
This document outlines manual tests that should be performed on the flower shop web application and explains how edge cases and validation are handled in the codebase.

## Table of Contents
1. [User Authentication Tests](#user-authentication-tests)
2. [Product Management Tests](#product-management-tests)
3. [Order Processing Tests](#order-processing-tests)
4. [Input Validation Tests](#input-validation-tests)
5. [File Upload Tests](#file-upload-tests)
6. [Security Tests](#security-tests)
7. [UI/UX Tests](#uiux-tests)

---

## User Authentication Tests

### Test 1: User Registration with Invalid Data
**Test Scenario**: Register with invalid email format, empty fields, or duplicate credentials.

**Manual Test Steps**:
1. Navigate to `/register`
2. Try submitting form with empty name field
3. Try submitting with invalid email format (e.g., "notanemail")
4. Try registering with an existing email/username

**Code Handling**: 
- **Frontend**: `AuthPage.jsx` uses HTML5 validation (`required` attribute) for basic validation
- **Backend**: `UserController.cs` (lines 119-128) checks for existing users:
```csharp
var existingUser = await _mongoDbService.Database
    .GetCollection<User>("users")
    .Find(Builders<User>.Filter.Or(
        Builders<User>.Filter.Eq(u => u.UserName, user.UserName),
        Builders<User>.Filter.Eq(u => u.Email, user.Email)
    ))
    .FirstOrDefaultAsync();

if (existingUser != null)
    return Conflict("User already exists");
```

### Test 2: Login with Invalid Credentials
**Test Scenario**: Login with wrong password, non-existent email, or empty fields.

**Manual Test Steps**:
1. Navigate to `/login`
2. Try login with wrong password
3. Try login with non-existent email
4. Submit empty form

**Code Handling**:
- **Backend**: `LoginController.cs` (lines 98-105) validates credentials:
```csharp
var user = await collection.Find(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password).FirstOrDefaultAsync();

if (user == null)
{
    return Unauthorized("Invalid email or password.");
}
```

---

## Product Management Tests

### Test 3: Create Product with Negative Price
**Test Scenario**: Attempt to create a product with negative or zero price.

**Manual Test Steps**:
1. Login as seller (`vanzator` role)
2. Navigate to profile page
3. Enter negative price (e.g., -10.50)
4. Try to submit the form

**Code Handling**:
- **Frontend**: `ProfilePage.jsx` (line 555) has HTML5 validation:
```jsx
<input
  type="number"
  name="price"
  value={product.price}
  onChange={handleInputChange}
  min="0"
  step="0.01"
  required
/>
```
- **Backend**: `Product.cs` entity defines price as `required float` but lacks explicit validation
- **Recommendation**: Add server-side validation for positive prices

### Test 4: Create Product with Invalid Stock Values
**Test Scenario**: Create product with negative stock or extremely large values.

**Manual Test Steps**:
1. Login as seller
2. Try creating product with stock = -5
3. Try creating product with stock = 999999999

**Code Handling**:
- **Frontend**: `ProfilePage.jsx` (line 571) has minimum validation:
```jsx
<input
  type="number"
  name="stock"
  value={product.stock}
  onChange={handleInputChange}
  min="0"
  step="1"
  required
/>
```
- **Backend**: Stock updates in `ProductController.cs` (line 90) don't explicitly validate range
- **Current Issue**: No maximum stock validation implemented

### Test 5: Update Stock with Invalid Values
**Test Scenario**: Update existing product stock to negative or invalid values.

**Manual Test Steps**:
1. Login as seller
2. Go to "My Products" section
3. Click "Edit Stock" on any product
4. Enter negative value or extremely large number
5. Save changes

**Code Handling**:
- **Frontend**: `ProfilePage.jsx` (line 446) validates minimum:
```jsx
<input
  id={`stock-${product.id}`}
  type="number"
  min="0"
  value={editingStock[product.id]}
  onChange={(e) => handleStockInputChange(product.id, e.target.value)}
  className="stock-input"
/>
```
- **Backend**: `ProductController.cs` UpdateProductStock doesn't validate stock range

---

## Order Processing Tests

### Test 6: Order with Insufficient Stock
**Test Scenario**: Attempt to order more items than available in stock.

**Manual Test Steps**:
1. Login as customer
2. Add product to cart with quantity exceeding available stock
3. Proceed to checkout
4. Complete order form and submit

**Code Handling**:
- **Backend**: `OrderController.cs` (lines 27-38) validates stock before order creation:
```csharp
foreach (var item in orderDto.Products)
{
    var product = await productCollection.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
    
    if (product == null)
    {
        return BadRequest($"Product with ID {item.ProductId} not found");
    }
    
    if (product.Stock < item.Quantity)
    {
        return BadRequest($"Insufficient stock for product {product.Nume}. Available: {product.Stock}, Requested: {item.Quantity}");
    }
}
```

### Test 7: Order with Invalid Total Amount
**Test Scenario**: Manipulate order total to be inconsistent with cart contents.

**Manual Test Steps**:
1. Add items to cart
2. Using browser dev tools, modify the total amount before checkout
3. Submit order

**Code Handling**:
- **Current Issue**: No server-side total validation implemented
- **Backend**: `OrderController.cs` accepts `TotalAmount` from client without verification
- **Recommendation**: Calculate total server-side based on products and quantities

---

## Input Validation Tests

### Test 8: Product Creation with Special Characters/Scripts
**Test Scenario**: Create products with XSS payloads, SQL injection attempts, or special characters.

**Manual Test Steps**:
1. Login as seller
2. Try creating product with name: `<script>alert('XSS')</script>`
3. Try description with SQL injection: `'; DROP TABLE products; --`
4. Test with Unicode characters and emojis

**Code Handling**:
- **Frontend**: No explicit XSS sanitization visible
- **Backend**: Uses MongoDB (NoSQL) which provides some SQL injection protection
- **Recommendation**: Implement input sanitization and validation

### Test 9: Checkout Form Validation
**Test Scenario**: Test all delivery address validation rules.

**Manual Test Steps**:
1. Proceed to checkout with items in cart
2. Leave required fields empty
3. Enter invalid phone number format
4. Test boundary conditions for text lengths

**Code Handling**:
- **Frontend**: `CheckoutPage.jsx` (lines 25-56) implements validation:
```jsx
const validateForm = () => {
  const newErrors = {};
  
  if (!deliveryAddress.fullName.trim()) {
    newErrors.fullName = 'Numele complet este obligatoriu';
  }
  
  if (!deliveryAddress.phoneNumber.trim()) {
    newErrors.phoneNumber = 'Numărul de telefon este obligatoriu';
  } else if (!/^[0-9+\-\s()]+$/.test(deliveryAddress.phoneNumber)) {
    newErrors.phoneNumber = 'Numărul de telefon nu este valid';
  }
  
  // ... other validations
}
```

---

## File Upload Tests

### Test 10: Product Image Upload Edge Cases
**Test Scenario**: Test various file upload scenarios.

**Manual Test Steps**:
1. Try uploading non-image files (.txt, .exe, .pdf)
2. Upload extremely large image files (>10MB)
3. Upload images with special characters in filename
4. Try uploading without selecting any file

**Code Handling**:
- **Frontend**: `ProfilePage.jsx` (line 576) has basic file type validation:
```jsx
<input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  required
/>
```
- **Backend**: `ProductController.cs` (line 293) saves images without explicit validation:
```csharp
private async Task<string> SaveImage(IFormFile imageFile)
{
    // No file size or type validation visible
    var uploadsFolder = Path.Combine("wwwroot", "uploads");
    // ... file saving logic
}
```
- **Current Issue**: No server-side file size or type validation

---

## Security Tests

### Test 11: Unauthorized Access Attempts
**Test Scenario**: Try accessing protected endpoints without authentication or with wrong role.

**Manual Test Steps**:
1. Try accessing `/product/my-products` without login
2. Login as customer and try accessing seller-only features
3. Try manipulating JWT tokens
4. Attempt CSRF attacks

**Code Handling**:
- **Backend**: Uses `[Authorize]` and `[Authorize(Roles = "vanzator")]` attributes:
```csharp
[HttpPost]
[Authorize(Roles = "vanzator")]
public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDto productDto)
```

### Test 12: Data Ownership Validation
**Test Scenario**: Try accessing/modifying other users' data.

**Manual Test Steps**:
1. Login as seller A
2. Try to delete/modify products belonging to seller B
3. Try accessing other users' orders

**Code Handling**:
- **Backend**: `ProductController.cs` (lines 90-108) validates ownership:
```csharp
if (product.VanzatorId != userId)
{
    return Forbid("You can only update stock for your own products");
}
```

---

## UI/UX Tests

### Test 13: Responsive Design and Browser Compatibility
**Test Scenario**: Test application across different devices and browsers.

**Manual Test Steps**:
1. Test on mobile devices (portrait/landscape)
2. Test on tablets
3. Test on different browsers (Chrome, Firefox, Safari, Edge)
4. Test with different screen resolutions

### Test 14: Cart Persistence and Management
**Test Scenario**: Test cart functionality edge cases.

**Manual Test Steps**:
1. Add items to cart and refresh page
2. Try adding same product multiple times
3. Test cart with browser back/forward buttons
4. Clear cart and verify all items removed

**Code Handling**:
- **Frontend**: `CartContext.jsx` manages cart state in React context
- **Current Issue**: Cart data is not persisted across browser sessions

---

## Summary of Validation Gaps Found

### Critical Issues:
1. **No server-side price validation** - Can create products with negative prices
2. **No order total verification** - Client-sent totals are trusted without validation
3. **Missing file upload validation** - No size/type restrictions on server
4. **No maximum stock limits** - Can set unrealistic stock values

### Recommendations:
1. Add server-side validation for all numeric inputs (price, stock, quantities)
2. Implement order total calculation and verification on server
3. Add comprehensive file upload validation (size, type, malware scanning)
4. Implement input sanitization to prevent XSS attacks
5. Add rate limiting for API endpoints
6. Implement proper error logging and monitoring

### Well-Implemented Security Features:
1. JWT-based authentication with role-based access control
2. Data ownership validation for CRUD operations
3. Stock availability checking before order processing
4. Basic input validation on frontend forms
5. CORS configuration for API security 