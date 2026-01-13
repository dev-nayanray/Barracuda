# Barracuda Affiliate Contact Form - Testing Guide

## Overview

This document provides comprehensive testing instructions for the Barracuda/iREV affiliate contact form integration. The form captures URL parameters, submits to local API for record keeping, and registers affiliates with the Hooplaseft iREV system.

---

## Test Environment Setup

### 1. Start the Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend (development mode)
cd frontend
npm install
npm run dev
```

### 2. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

---

## URL Parameter Testing

### Test 1: Basic URL with Affiliate ID

**URL to test:**
```
http://localhost:3000/?affiliate_id=123
```

**Expected behavior:**
- Form should auto-populate Affiliate ID field with "123"
- A tracking badge should appear showing "Tracking Detected: Affiliate ID: 123"
- The tracking link should include the affiliate_id parameter

**Verification:**
1. Open the URL in browser
2. Verify the "Affiliate ID" field shows "123"
3. Fill out the form and submit
4. Check server logs for: `affiliate_id: 123`

### Test 2: URL with Affiliate ID and Click ID (sub1)

**URL to test:**
```
http://localhost:3000/?affiliate_id=456&sub1=click_789
```

**Expected behavior:**
- Affiliate ID field auto-populated with "456"
- Click ID (sub1) field auto-populated with "click_789"
- Tracking badge shows both parameters
- Generated tracking link includes sub1 parameter

**Verification:**
1. Verify both fields are auto-populated
2. Submit form
3. Check stored contact has `sub1: "click_789"`
4. Verify tracking link contains `sub1=click_789`

### Test 3: URL with All Tracking Parameters

**URL to test:**
```
http://localhost:3000/?affiliate_id=100&sub1=traffic_source_abc&url_id=2&source=facebook
```

**Expected behavior:**
- All parameters captured and displayed
- Form pre-fills with provided values
- Tracking link includes all parameters

---

## Form Submission Testing

### Test 4: Successful Affiliate Registration

**Steps:**
1. Navigate to: `http://localhost:3000/?affiliate_id=999&sub1=test_click`
2. Fill out the form:
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Company: "Test Company LLC"
   - Type: "Affiliate / Publisher"
   - Messenger: "Telegram"
   - Username: "@johndoe"
   - Message: "Testing affiliate registration"
3. Click "Apply as Affiliate"

**Expected behavior:**
- Form shows loading state with "Submitting..."
- After success, shows success message
- API status shows "Successfully registered in affiliate network"
- Tracking link is generated and can be copied
- "Register Another Affiliate" button resets form

**Verification:**
- Check backend console for: `📬 New Contact Submission`
- Check stored contact in `backend/data/store.js`
- Verify contact has:
  ```javascript
  {
    affiliate_id: "999",
    sub1: "test_click",
    url_id: "2",
    type: "affiliate",
    status: "new"
  }
  ```

### Test 5: Form Validation

**Test invalid email:**
1. Enter email without @ symbol
2. Click submit
3. Verify error message: "Please enter a valid email address"

**Test missing required fields:**
1. Leave name field empty
2. Click submit
3. Verify error: "Name is required"

**Test messenger without username:**
1. Select "WhatsApp" as messenger
2. Leave username empty
3. Click submit
4. Verify error: "Username is required when messenger is selected"

### Test 6: Error Handling

**Test API failure:**
1. Temporarily modify backend URL to invalid endpoint
2. Submit form
3. Verify error message: "Unable to connect to server. Please try again later."

**Expected behavior:**
- Form shows error state
- Error message displayed in red alert box
- Can retry submission after fixing issue

---

## API Endpoint Testing

### Test 7: POST /api/contact

**Request:**
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Affiliate",
    "email": "test@affiliate.com",
    "company": "Test Corp",
    "type": "affiliate",
    "messenger": "telegram",
    "username": "@testuser",
    "message": "API test",
    "affiliate_id": "555",
    "sub1": "api_test_click",
    "trackingSource": "api_test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Your affiliate application has been submitted successfully! Our team will contact you within 24 hours.",
  "data": {
    "contactId": 1,
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "registrationType": "affiliate",
    "affiliatePosted": true,
    "trackingLink": "https://hooplaseft.com/api/v3/offer/2?affiliate_id=555&url_id=2&source=api_test&sub1=api_test_click"
  }
}
```

### Test 8: GET /api/contact (List All)

```bash
curl http://localhost:5000/api/contact
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...contacts array...],
  "total": 1
}
```

### Test 9: POST /api/contact/tracking-link

```bash
curl -X POST http://localhost:5000/api/contact/tracking-link \
  -H "Content-Type: application/json" \
  -d '{
    "affiliateId": "777",
    "urlId": "2",
    "sub1": "test_click_id",
    "source": "email",
    "name": "Test",
    "email": "test@example.com",
    "company": "Test Co"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "trackingLink": "https://hooplaseft.com/api/v3/offer/2?affiliate_id=777&url_id=2&source=email&sub1=test_click_id&name=Test&email=test%40example.com&company=Test%20Co"
  }
}
```

### Test 10: POST /api/contact/verify

```bash
curl -X POST http://localhost:5000/api/contact/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@affiliate.com"}'
```

---

## Hooplaseft Dashboard Verification

### Test 11: Affiliate Dashboard Update

**Prerequisites:**
1. Complete an affiliate registration
2. Note the email used

**Steps:**
1. Log into Hooplaseft admin dashboard at: https://hooplaseft.com/admin
2. Navigate to Affiliates section
3. Search for the registered email
4. Verify affiliate status shows as "pending" or "registered"

**Expected fields in dashboard:**
- Affiliate ID (should match URL parameter or default)
- Name (from form)
- Email (from form)
- Company (from form)
- Traffic Source (from trackingSource field)
- Sub1/Click ID (if provided in URL)
- Registration Date

### Test 12: Postback Verification

**Setup:**
1. Configure Hooplaseft postback URL in your affiliate dashboard
2. Use format: `https://yoursite.com/api/postback?click_id={click_id}&affiliate_id={affiliate_id}`

**Test:**
1. Complete affiliate registration with sub1 parameter
2. Wait for postback callback (if configured)
3. Verify postback contains correct parameters

**Manual postback test:**
```bash
curl "http://localhost:5000/api/postback?click_id=test_123&affiliate_id=555&event=registration"
```

---

## Production Deployment Testing

### Test 13: Production Build Test

```bash
cd frontend
npm run build
npm run start
```

**Verify:**
1. Form loads correctly
2. URL parameters are captured
3. Form submission works
4. Tracking link generation works

### Test 14: Environment Variables

Create `.env` file in backend directory:
```env
PORT=5000
HOOPLASEFT_API_KEY=your_api_key_here
NODE_ENV=production
```

**Verify API key is used in Authorization header:**
```javascript
// Backend logs should show:
'Authorization': 'Bearer your_api_key_here'
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| URL params not captured | Using direct URL without query string | Test with `?affiliate_id=123` |
| Form not submitting | CORS issues | Check backend CORS config |
| Hooplaseft API error | Invalid API key | Verify HOOPLASEFT_API_KEY |
| Tracking link broken | Missing URL encoding | Check URL encoding in backend |
| Contact not stored | Backend not running | Start backend server |

### Debug Mode

Enable debug logging:
```javascript
// In backend/routes/contact.js
const DEBUG = true;

if (DEBUG) {
  console.log('Form data:', JSON.stringify(formData, null, 2));
}
```

### Check Backend Logs

```bash
# Watch backend logs
tail -f backend/logs/app.log

# Or check console output
# Look for:
# 📬 New Contact Submission
# 🚀 Registering affiliate in hooplaseft platform
# ✅ Affiliate registered successfully
```

---

## Test Checklist

- [ ] URL parameters captured correctly
- [ ] Form validation works
- [ ] Form submission succeeds
- [ ] API status displays correctly
- [ ] Tracking link generated
- [ ] Form resets after success
- [ ] Error handling works
- [ ] Backend stores contacts
- [ ] Hooplaseft receives registration
- [ ] Dashboard shows new affiliate
- [ ] Production build works

---

## Support

For issues with:
- **Frontend**: Check browser console for JavaScript errors
- **Backend**: Check server logs for detailed error messages
- **Hooplaseft API**: Contact Hooplaseft support or check their documentation

