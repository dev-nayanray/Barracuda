# Blitz API Integration Plan

## Information Gathered
- Current contact form submits to local backend API at `/api/contact`
- Backend stores contacts locally in memory
- Admin panel displays contacts from local storage
- Blitz API requires specific fields: first_name, last_name, password, email, funnel, source, aff_sub, affid
- Credentials: Aff ID: 148, Token: wuX4oS1IU7m2J48qGuFl
- Need to fire FTD check after successful lead submission

## Plan
1. **Update Backend Contact Route** - Integrate Blitz API for lead posting
2. **Add FTD Check Functionality** - Check for first time deposits after lead submission
3. **Update Admin Panel** - Show Blitz API integration status and FTD data
4. **Update Frontend Form** - Handle Blitz API responses and success states
5. **Add Environment Variables** - Store Blitz API credentials securely

## Dependent Files to be Edited
- `backend/routes/contact.js` - Add Blitz API integration
- `frontend/components/sections/ContactForm.jsx` - Update form submission logic
- `frontend/app/admin/contacts/page.jsx` - Add Blitz status and FTD display
- `backend/.env` - Add Blitz API credentials
- `frontend/lib/admin-api.js` - Add FTD checking endpoints

## Followup Steps
- Test lead submission to Blitz API
- Verify FTD checking works
- Update admin panel with integration status
- Add error handling for API failures
