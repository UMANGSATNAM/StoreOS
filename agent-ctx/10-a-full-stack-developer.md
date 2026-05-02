# Task 10-a: Seed Data Script and API Route

## Agent: full-stack-developer

## Summary

Created the seed API route and "Try Demo" quick-login mechanism for StoreOS.

## Files Created/Modified

### Created:
- `/home/z/my-project/src/app/api/seed/route.ts` - POST API route for seeding demo data

### Modified:
- `/home/z/my-project/src/components/landing/LandingPage.tsx` - Added "Try Demo" button with loading state
- `/home/z/my-project/worklog.md` - Appended task log

## Seed Data Details

| Entity | Count | Details |
|--------|-------|---------|
| Users | 2 | Demo (demo@storeos.in / demo123) + Admin (admin@storeos.in / admin123) |
| Subscription | 1 | Basic plan, active, 14-day trial |
| Store | 1 | Sharma's Kitchen, restaurant, Mumbai |
| Categories | 5 | Starters 🥗, Main Course 🍛, Breads 🫓, Beverages 🥤, Desserts 🍨 |
| Products | 25 | Realistic Indian restaurant items with SKUs, stock levels |
| Customers | 10 | Indian names, phone numbers, loyalty points |
| Staff | 5 | Admin, Cashier, Manager roles with shifts |
| Tables | 8 | Indoor/Outdoor/VIP sections, mixed statuses |
| Orders | 5 | Completed orders with items and 5% GST |

## Key Features

1. **Idempotent**: Safe to call multiple times - deletes existing demo data before re-seeding
2. **Password hashing**: Uses crypto.createHash('sha256') consistent with auth routes
3. **Low stock alerts**: Some products have stock below alert threshold (Prawn Masala: 2, Mushroom Manchurian: 3)
4. **Try Demo button**: Amber-colored CTA in hero section + mobile menu, with loading spinner
5. **Quick-login flow**: POST /api/seed → set Zustand user/store/subscription → navigate to dashboard

## Testing

- ✅ Seed API returns 200 with correct counts
- ✅ Idempotent re-seed works correctly
- ✅ Lint passes with no errors
