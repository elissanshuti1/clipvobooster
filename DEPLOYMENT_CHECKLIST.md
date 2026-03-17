# ClipVoBooster Deployment Checklist

## ✅ Pre-Deployment

### 1. Environment Variables (Production)
Update `.env.local` for production:

```env
# MongoDB (already set)
MONGODB_URI="mongodb+srv://..."

# JWT Auth (CHANGE THIS!)
JWT_SECRET="use-a-very-strong-random-secret-here"
JWT_EXPIRES_IN="3d"

# Google OAuth (Update redirect URI for production)
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
GOOGLE_REDIRECT_URI="https://clipvo.site/api/auth/google/callback"

# OpenRouter AI (already set)
OPENROUTER_API_KEY="sk-or-v1-..."

# App URLs (IMPORTANT!)
NEXT_PUBLIC_APP_URL="https://clipvo.site"
NEXT_PUBLIC_PROD_URL="https://clipvo.site"
```

### 2. Google Cloud Console
- [ ] Update OAuth redirect URIs to include `https://clipvo.site/api/auth/google/callback`
- [ ] Enable Gmail API
- [ ] Verify your domain with Google
- [ ] Add production domain to authorized domains

### 3. MongoDB Atlas
- [ ] Whitelist Vercel IP addresses (or use 0.0.0.0/0 for all IPs)
- [ ] Verify database user has correct permissions
- [ ] Backup existing data

### 4. Domain & SSL
- [ ] Point domain (clipvo.site) to Vercel
- [ ] SSL certificate is auto-provisioned by Vercel
- [ ] Verify DNS propagation

## 🚀 Deployment Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "Production ready: email tracking, analytics, SEO"
git push origin main
```

### Step 2: Deploy to Vercel
```bash
# If not already linked
vercel login
vercel link

# Deploy
vercel --prod
```

### Step 3: Add Environment Variables in Vercel
Go to Vercel Dashboard → Project → Settings → Environment Variables
Add all variables from `.env.local`

### Step 4: Update Metadata
In `app/layout.tsx`:
- [ ] Update Google verification code
- [ ] Add Twitter handle
- [ ] Update canonical URL if different

### Step 5: Submit to Search Engines

#### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `clipvo.site`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://clipvo.site/sitemap.xml`
5. Request indexing for main pages

#### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add site: `clipvo.site`
3. Verify ownership
4. Submit sitemap

#### IndexNow (for Bing/Yandex)
Submit your main URLs using IndexNow protocol for faster indexing.

## 📊 Post-Deployment

### 1. Test Critical Flows
- [ ] Sign up with Google
- [ ] Complete profile setup
- [ ] Send test email
- [ ] Check email tracking (open/click)
- [ ] Verify analytics update
- [ ] Test notifications

### 2. Monitor Performance
- [ ] Vercel Analytics
- [ ] Check Core Web Vitals
- [ ] Monitor error logs
- [ ] Set up alerts for failures

### 3. SEO Verification
- [ ] Check robots.txt: `https://clipvo.site/robots.txt`
- [ ] Verify sitemap: `https://clipvo.site/sitemap.xml`
- [ ] Test meta tags with Google Rich Results Test
- [ ] Check Open Graph preview (share on social media)

### 4. Email Deliverability
- [ ] Set up SPF record for domain
- [ ] Set up DKIM signing
- [ ] Set up DMARC policy
- [ ] Test with Gmail, Outlook, Yahoo

## 🔧 DNS Records

Add these to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📧 Email Authentication (Important for Deliverability)

### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

### DKIM (via Google Workspace)
Follow Google's DKIM setup guide in Admin console.

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@clipvo.site
```

## 🎯 Marketing & Launch

### 1. Product Hunt
- [ ] Prepare launch post
- [ ] Create images/screenshots
- [ ] Schedule launch date
- [ ] Prepare first comment

### 2. Social Media
- [ ] Twitter/X announcement thread
- [ ] LinkedIn post
- [ ] Reddit posts (relevant subreddits)
- [ ] Indie Hacker milestone

### 3. Content Marketing
- [ ] Blog post: "How we built ClipVoBooster"
- [ ] Tutorial: "Email marketing best practices"
- [ ] Case study: Early user success story

## 📱 Social Media Handles

Secure these handles if available:
- Twitter: @clipvobooster
- LinkedIn: ClipVoBooster
- Instagram: @clipvobooster
- TikTok: @clipvobooster

## 🆘 Support & Monitoring

### Set Up
- [ ] Error tracking (Sentry/LogRocket)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Customer support email (support@clipvo.site)
- [ ] Help documentation

### Analytics to Watch
- Daily active users
- Emails sent per day
- Open rates (average)
- Click rates (average)
- Conversion rate (signup → send)

## 📝 Legal Requirements

- [x] Privacy Policy (`/privacy`)
- [x] Terms of Service (`/terms`)
- [x] Refund Policy (`/refund`)
- [ ] Cookie consent banner (if using cookies beyond auth)
- [ ] GDPR compliance for EU users
- [ ] CCPA compliance for California users

## 🎉 Launch Day Checklist

- [ ] Final test of all features
- [ ] Monitor server logs
- [ ] Be available for user questions
- [ ] Post on all social channels
- [ ] Submit to newsletters (Product Hunt, Hacker News)
- [ ] Reach out to beta users for feedback
- [ ] Celebrate! 🚀

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Search Console**: https://search.google.com/search-console
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials

## 📞 Support

If you encounter issues during deployment:
1. Check Vercel build logs
2. Review error messages
3. Verify all environment variables
4. Test locally with production env vars
5. Check MongoDB connection

Good luck with your launch! 🚀
