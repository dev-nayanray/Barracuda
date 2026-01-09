
# Barracuda Marketing - Casino Affiliate Network Website

## Admin Panel Access
- **URL**: `/admin`
- **Default Credentials**: admin / admin123 (change in production)

## Quick Start

### Installation
```bash
# Install all dependencies
npm run install:all

# OR install individually:
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Development
```bash
# Start both frontend and backend
npm run dev

# Frontend only (runs on port 3002)
cd frontend && npm run dev

# Backend only (runs on port 5000)
cd backend && npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

## Project Structure

```
affiiate/
├── backend/
│   ├── server.js          # Express server
│   ├── routes/
│   │   └── contact.js     # Contact form API
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── layout.js      # Root layout with SEO
│   │   ├── page.js        # Homepage
│   │   ├── globals.css    # Global styles
│   │   └── admin/         # Admin panel routes
│   ├── components/
│   │   ├── sections/      # Page sections
│   │   ├── ui/            # UI components
│   │   └── layout/        # Layout components
│   ├── package.json
│   └── tailwind.config.js
└── package.json
```

## Site Configuration

Update these files for custom domain:

### 1. frontend/next.config.js
Change `metadataBase.url` to your domain

### 2. frontend/app/layout.js
Update `metadata` for SEO

### 3. backend/routes/contact.js
Update email notifications for form submissions

## Environment Variables

Create `.env` file in backend:
```env
PORT=5000
NODE_ENV=development
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
```

## Deployment

### Vercel (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `frontend/out`
4. Deploy

### Render/Railway (Backend)
1. Connect repository
2. Set start command: `npm start`
3. Deploy

### Netlify (Frontend + Functions)
1. Build: `cd frontend && npm run build`
2. Publish: `frontend/out`
3. Add backend as separate service

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: Express.js, REST API
- **Database**: In-memory (replace with MongoDB/PostgreSQL for production)

## Features

- Modern casino/iGaming dark theme
- Responsive design
- SEO optimized
- Contact form with validation
- Admin panel for managing submissions
- Animated sections
- Team member cards
- Conference section
- Testimonials slider

## License

MIT

=======
# Barracuda
>>>>>>> 6fc53f32cb102fd2309fbfe1e80b72cc67761df7
