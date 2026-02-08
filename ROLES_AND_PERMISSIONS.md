# Roles and Permissions Documentation

## Overview
The FoodHub application implements a comprehensive Role-Based Access Control (RBAC) system with **4 distinct roles**:

## Roles

### 1. **Admin** 
- **Description**: System administrator with full control
- **Permissions**:
  - ✅ Manage all food hubs (create, view, update, delete)
  - ✅ Manage all vendors (create, view, update, delete)
  - ✅ View all orders across the system
  - ✅ Access admin dashboard
  - ❌ Cannot access vendor-specific dashboard

### 2. **Vendor**
- **Description**: Restaurant/food vendor owner
- **Permissions**:
  - ✅ Manage their own vendor profile
  - ✅ Manage menu items for their restaurant
  - ✅ View and update orders for their restaurant
  - ✅ Manage staff members
  - ✅ Access vendor dashboard
  - ✅ View analytics and reports
  - ❌ Cannot access admin dashboard
  - ❌ Cannot manage other vendors

### 3. **Staff**
- **Description**: Employees working for a vendor
- **Permissions**:
  - ✅ View orders for their vendor
  - ✅ Update order status
  - ✅ Access vendor dashboard (limited view)
  - ❌ Cannot manage menu items
  - ❌ Cannot manage other staff
  - ❌ Cannot access admin dashboard
  - ❌ Cannot modify vendor settings

### 4. **Customer**
- **Description**: End users who place orders
- **Permissions**:
  - ✅ Browse vendors and menus
  - ✅ Place orders
  - ✅ Track their own orders
  - ✅ View order history
  - ❌ Cannot access any dashboard
  - ❌ Cannot manage any resources

## Implementation

### Frontend Protection

#### 1. **RoleGuard Component**
Location: `frontendfoodhub/src/components/RoleGuard.tsx`

Protects entire pages based on user roles:

```tsx
<RoleGuard allowedRoles={['admin']}>
  <AdminDashboard />
</RoleGuard>
```

#### 2. **useRoleAccess Hook**
Location: `frontendfoodhub/src/hooks/useRoleAccess.ts`

Provides role-checking utilities:

```tsx
const { isAdmin, isVendor, canManageOrders } = useRoleAccess();

if (canManageOrders) {
  // Show order management UI
}
```

#### 3. **Navbar Visibility**
- Dashboard button is **hidden** for customers
- Dashboard button is **visible** for admin, vendor, and staff
- Redirects to appropriate dashboard based on role

### Backend Protection

#### 1. **Authentication Middleware**
Location: `backend/middlewares/auth.js`

- `auth` - Verifies JWT token
- `authorize(...roles)` - Checks if user has required role

#### 2. **Protected Routes**

**Hub Routes** (`/api/v1/hubs`):
- `POST /` - Admin only
- `GET /` - Public
- `PUT /:id` - Admin only
- `DELETE /:id` - Admin only

**Vendor Routes** (`/api/v1/vendors`):
- `POST /` - Admin only
- `GET /` - Public
- `PUT /:id` - Vendor (own) or Admin
- `DELETE /:id` - Admin only

**Order Routes** (`/api/v1/orders`):
- `POST /` - Public (customers)
- `GET /` - Vendor, Staff, Admin
- `PUT /:orderId/vendor/:vendorId/status` - Vendor, Staff

**Staff Routes** (`/api/v1/staff`):
- `GET /` - Vendor, Admin
- `POST /` - Vendor, Admin

## User Registration

### Allowed Roles for Registration:
- ✅ Admin
- ✅ Vendor
- ✅ Customer
- ✅ Staff

### Registration Requirements:

**Admin:**
- Email, Password, Name

**Vendor:**
- Email, Password, Name, VendorId, HubId (optional), VendorName (optional)

**Staff:**
- Email, Password, Name, VendorId (required)

**Customer:**
- Email, Password, Name, Phone (optional)

## Security Features

1. **JWT Authentication**: All protected routes require valid JWT token
2. **Role Validation**: Backend validates user role before granting access
3. **Frontend Guards**: Prevents unauthorized UI access
4. **Automatic Redirects**: Users redirected to appropriate dashboard based on role
5. **Token Storage**: Tokens stored in localStorage and cookies

## Testing Roles

### Test Accounts:

**Admin:**
- Email: `admin@example.com`
- Password: `password123`

**Vendor:**
- Email: `burger@example.com`
- Password: `password123`

**Staff:**
- Create via vendor dashboard or admin panel

**Customer:**
- Register via signup page

## Common Use Cases

### 1. Hiding Features by Role
```tsx
const { isVendor, isStaff } = useRoleAccess();

{isVendor && !isStaff && (
  <button>Manage Staff</button>
)}
```

### 2. Protecting API Calls
```javascript
router.post('/staff', 
  auth, 
  authorize('vendor', 'admin'), 
  staffController.createStaff
);
```

### 3. Conditional Dashboard Access
```tsx
<RoleGuard allowedRoles={['vendor', 'staff']}>
  <VendorDashboard />
</RoleGuard>
```

## Troubleshooting

### Issue: User can't access dashboard
- Check user role in localStorage
- Verify JWT token is valid
- Ensure RoleGuard has correct allowedRoles

### Issue: API returns 403 Forbidden
- Check backend route authorization
- Verify user role matches required roles
- Check JWT token in request headers

### Issue: Dashboard button not showing
- Verify user role is not 'customer'
- Check Navbar.tsx role conditions
- Clear localStorage and re-login

## Future Enhancements

- [ ] Add role hierarchy (e.g., admin > vendor > staff > customer)
- [ ] Implement permission-based access (granular permissions)
- [ ] Add role management UI for admins
- [ ] Implement audit logging for role changes
- [ ] Add multi-role support (user can have multiple roles)
