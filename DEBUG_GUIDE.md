# Debugging Guide - Payment & Subscription Issues

## ✅ What Was Fixed

### 1. Payment Success Page (React Error 310)
- **File**: `/app/payment/success/page.tsx`
- **Issue**: Hooks called after conditional return
- **Fix**: Moved all hooks to top of component

### 2. Dodo Callback Not Saving Subscription
- **File**: `/api/payment/dodo/callback/route.ts`
- **Issue**: Payment confirmed but subscription not saved to MongoDB
- **Fix**: Now saves subscription when `status=active` and `subscription_id` received

### 3. Dashboard Loading - Subscription Detection
- **Files**: 
  - `/app/dashboard/overview/page.tsx`
  - `/app/dashboard/layout.tsx`
- **Issue**: Subscription state not set before rendering
- **Fix**: Now fetches `/api/auth/me` FIRST and uses subscription from response

---

## 🔍 How to Debug

### Check User in Database

```bash
node -e "
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://nshuti:nyamata123@cluster0.ocwbtwt.mongodb.net/clipvobooster?retryWrites=true&w=majority&ssl=true&tls=true';
async function check(email) {
  const client = new MongoClient(uri);
  await client.connect();
  const user = await client.db().collection('users').findOne({ email });
  console.log('User:', {
    email: user?.email,
    name: user?.name,
    subscription: user?.subscription
  });
  await client.close();
}
check('USER_EMAIL_HERE');
"
```

### Browser Console Debugging

After deploying, open browser console (F12) and look for:

1. **✅ Green checkmarks** - Subscription loaded successfully
2. **⚠️ Warning icons** - Subscription not found, using fallback

Expected console output when dashboard loads:
```
✅ Subscription loaded from /api/auth/me: { plan: 'starter', planName: 'Starter', ... }
✅ Dashboard layout: Subscription loaded from /api/auth/me: { ... }
```

---

## 🧪 Testing Payment Flow

### Step 1: Create New Test Account
1. Go to https://clipvo.site/signup
2. Create account with new email
3. Verify you can log in

### Step 2: Make Payment
1. Click "Get Started" on pricing page
2. Complete Dodo payment
3. Watch browser console for:
   - Redirect to `/api/payment/dodo/callback`
   - Console logs showing subscription saved

### Step 3: Verify Dashboard
1. Should redirect to `/payment/success`
2. Shows "Payment Successful!" message
3. Auto-redirects to `/dashboard/overview`
4. **Should NOT see pricing overlay**
5. **Should see actual user name, not "User"**

---

## 🐛 Common Issues & Solutions

### Issue 1: Still Seeing Pricing After Payment

**Symptoms:**
- Payment successful
- Redirected to dashboard
- Pricing overlay appears

**Debug Steps:**
1. Open browser console (F12)
2. Look for subscription loading logs
3. Check if `/api/auth/me` returns subscription

**Check Database:**
```bash
# Run the check script above
```

**If subscription is NULL in database:**
- Dodo callback didn't save it
- Check `/api/payment/dodo/callback` logs
- Verify Dodo is sending correct parameters

**If subscription EXISTS in database:**
- Frontend not loading it properly
- Check browser console for errors
- Clear browser cache and cookies
- Try incognito mode

---

### Issue 2: User Name Shows as "User"

**Symptoms:**
- Dashboard shows "Welcome back, User!"
- No email displayed

**Cause:**
- `/api/auth/me` not returning user data properly
- JWT token missing or invalid

**Debug:**
```bash
# Check if user exists in database
node -e "
const { MongoClient } = require('mongodb');
const uri = 'YOUR_MONGO_URI';
async function check() {
  const client = new MongoClient(uri);
  await client.connect();
  const users = client.db().collection('users');
  const count = await users.estimatedDocumentCount();
  console.log('Total users:', count);
  const user = await users.findOne({}, { projection: { email: 1, name: 1 } });
  console.log('First user:', user);
  await client.close();
}
check();
"
```

**Solution:**
- Re-login to refresh JWT token
- Check `/api/auth/me` endpoint response
- Verify JWT_SECRET is correct

---

### Issue 3: 401 Errors on /api/auth/me

**Symptoms:**
- Console shows 401 Unauthorized
- Redirected to login page

**Causes:**
1. Token expired
2. Token not in cookies
3. JWT_SECRET mismatch

**Debug:**
1. Open Application tab in DevTools
2. Check Cookies → `token` exists
3. Try logging in again

---

## 📊 Your Account Status

**Email:** elissanshuti1@gmail.com  
**Name:** Nshuti Elissa  
**Plan:** Starter ($15/month)  
**Status:** ✅ Active  
**Subscription ID:** sub_0Najmy0EKeOLm1E7Wr71E

Your account is properly configured in the database. If you're still seeing issues:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Clear cookies** for clipvo.site
3. **Logout and login again**
4. **Check browser console** for errors

---

## 🚀 Deployment Checklist

After pushing to production:

- [ ] Build completes successfully
- [ ] Deployment finishes without errors
- [ ] Can access homepage
- [ ] Can log in
- [ ] Dashboard loads (no pricing overlay)
- [ ] User name displays correctly
- [ ] Subscription badge shows in sidebar
- [ ] Can access all dashboard pages

---

## 📝 Key Files Modified

| File | Purpose |
|------|---------|
| `/app/payment/success/page.tsx` | Fixed React hooks order |
| `/api/payment/dodo/callback/route.ts` | Saves subscription to MongoDB |
| `/app/dashboard/overview/page.tsx` | Loads subscription from auth endpoint |
| `/app/dashboard/layout.tsx` | Loads subscription from auth endpoint |
| `/api/auth/me/route.ts` | Returns user data with subscription |

---

## 🆘 Emergency Manual Fix

If payment completed but subscription not saved:

```bash
# Edit fix-subscription.js with user email
node fix-subscription.js
```

This will manually activate subscription in database.

---

## 📞 Support

If issues persist after all fixes:

1. Check MongoDB connection
2. Verify Dodo API keys
3. Check JWT_SECRET configuration
4. Review server logs for errors
5. Test in incognito mode
6. Clear all browser data
