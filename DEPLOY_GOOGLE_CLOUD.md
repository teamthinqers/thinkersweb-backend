# Deploy DotSpark Backend to Google Cloud Run

## Prerequisites
1. Google Cloud account
2. Google Cloud CLI installed on your computer
3. Docker installed (for local testing - optional)

---

## Step 1: Install Google Cloud CLI

### On Mac:
```bash
brew install --cask google-cloud-sdk
```

### On Windows:
Download from: https://cloud.google.com/sdk/docs/install

### On Linux:
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

---

## Step 2: Login & Setup Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create dotspark-backend --name="DotSpark Backend"

# Set the project
gcloud config set project dotspark-backend

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## Step 3: Set Up Environment Variables

Create these secrets in Google Cloud:

```bash
# Database URL (from Replit/Neon)
gcloud secrets create DATABASE_URL --data-file=-
# Then paste your DATABASE_URL and press Ctrl+D

# Firebase credentials
gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

# Other secrets as needed
gcloud secrets create OPENAI_API_KEY --data-file=-
gcloud secrets create PINECONE_API_KEY --data-file=-
```

---

## Step 4: Deploy to Cloud Run

### Option A: Deploy from Source (Easiest)
```bash
# From your project directory
gcloud run deploy dotspark-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,FRONTEND_URL=https://www.thinqers.in" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest"
```

### Option B: Build & Deploy (More Control)
```bash
# Build the container
gcloud builds submit --tag gcr.io/dotspark-backend/dotspark-api

# Deploy to Cloud Run
gcloud run deploy dotspark-api \
  --image gcr.io/dotspark-backend/dotspark-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production,FRONTEND_URL=https://www.thinqers.in"
```

---

## Step 5: Get Your Backend URL

After deployment, you'll get a URL like:
```
https://dotspark-api-xxxxx-uc.a.run.app
```

This is your new backend URL!

---

## Step 6: Update Frontend Environment

Update your Firebase-hosted frontend to use the new backend:

1. Create/update `.env.production`:
```
VITE_API_BASE_URL=https://dotspark-api-xxxxx-uc.a.run.app
```

2. Rebuild and redeploy frontend:
```bash
npm run build
firebase deploy --only hosting
```

---

## Step 7: Update External Services

### WhatsApp Webhook (Meta):
- Old: `https://your-replit-url/api/whatsapp/webhook`
- New: `https://dotspark-api-xxxxx-uc.a.run.app/api/whatsapp/webhook`

### LinkedIn OAuth Callback:
- New: `https://dotspark-api-xxxxx-uc.a.run.app/api/auth/linkedin/callback`

### Firebase Authorized Domains:
Add: `dotspark-api-xxxxx-uc.a.run.app`

---

## Useful Commands

```bash
# View logs
gcloud run services logs read dotspark-api --region us-central1

# Update environment variables
gcloud run services update dotspark-api --set-env-vars="KEY=VALUE"

# Get service URL
gcloud run services describe dotspark-api --region us-central1 --format="value(status.url)"

# Delete service (if needed)
gcloud run services delete dotspark-api --region us-central1
```

---

## Cost Estimate

Google Cloud Run pricing:
- **Free tier**: 2 million requests/month, 360,000 GB-seconds of memory
- **Pay as you go**: ~$0.00002400/request + memory/CPU usage
- **Estimated monthly cost for moderate usage**: $5-20/month

---

## Troubleshooting

### Build fails:
```bash
# Check build logs
gcloud builds list
gcloud builds log BUILD_ID
```

### Service not responding:
```bash
# Check service status
gcloud run services describe dotspark-api --region us-central1

# Check logs for errors
gcloud run services logs read dotspark-api --limit 50
```

### CORS issues:
- Verify FRONTEND_URL environment variable is set correctly
- Check that www.thinqers.in is in the allowed origins
