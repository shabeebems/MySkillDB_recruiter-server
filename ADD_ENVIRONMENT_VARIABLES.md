# Adding Environment Variables to CI/CD and Cloud Run

This guide shows you how to add new environment variables to your Cloud Run deployment via CI/CD.

## Overview

When adding new environment variables, you need to:
1. Add to `.env.example` (with sample/placeholder values)
2. Create secrets in GCP Secret Manager (for sensitive data) OR add to workflow (for non-sensitive)
3. Update GitHub Actions workflow
4. Grant Cloud Run access to secrets
5. Deploy and verify

---

## Example: Adding Cloudinary Variables

This example demonstrates adding Cloudinary environment variables with different values for staging and production.

### Step 1: Update `.env.example`

Add the new variables with placeholder values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Note**: Use placeholder values in `.env.example` - never commit actual credentials!

### Step 2: Determine Variable Type

**Sensitive Data (API Keys, Secrets, Passwords)?**
- ✅ Store in **GCP Secret Manager**
- Examples: `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`

**Non-Sensitive Data (URLs, IDs, Feature Flags)?**
- ✅ Use **Regular Environment Variables** in workflow
- Examples: `CLOUDINARY_CLOUD_NAME` (if not sensitive)

For this example, we'll store all Cloudinary variables as secrets since they're API credentials.

### Step 3: Create Secrets in GCP Secret Manager

#### For Staging Environment:

```bash
# Replace with your actual staging values
echo -n "your-staging-cloud-name" | gcloud secrets create CLOUDINARY_CLOUD_NAME_STAGING --data-file=-
echo -n "your-staging-api-key" | gcloud secrets create CLOUDINARY_API_KEY_STAGING --data-file=-
echo -n "your-staging-api-secret" | gcloud secrets create CLOUDINARY_API_SECRET_STAGING --data-file=-
```

#### For Production Environment:

```bash
# Replace with your actual production values
echo -n "your-production-cloud-name" | gcloud secrets create CLOUDINARY_CLOUD_NAME_PROD --data-file=-
echo -n "your-production-api-key" | gcloud secrets create CLOUDINARY_API_KEY_PROD --data-file=-
echo -n "your-production-api-secret" | gcloud secrets create CLOUDINARY_API_SECRET_PROD --data-file=-
```

### Step 4: Grant Cloud Run Access to Secrets

```bash
# Get project number and service account
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to staging secrets
gcloud secrets add-iam-policy-binding CLOUDINARY_CLOUD_NAME_STAGING \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding CLOUDINARY_API_KEY_STAGING \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding CLOUDINARY_API_SECRET_STAGING \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Grant access to production secrets
gcloud secrets add-iam-policy-binding CLOUDINARY_CLOUD_NAME_PROD \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding CLOUDINARY_API_KEY_PROD \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding CLOUDINARY_API_SECRET_PROD \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

**Or use a loop for efficiency:**

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in CLOUDINARY_CLOUD_NAME_STAGING CLOUDINARY_API_KEY_STAGING CLOUDINARY_API_SECRET_STAGING \
              CLOUDINARY_CLOUD_NAME_PROD CLOUDINARY_API_KEY_PROD CLOUDINARY_API_SECRET_PROD; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 5: Update GitHub Actions Workflow

Edit `.github/workflows/deploy-cloud-run.yml`:

#### 5.1: Add to "Set deployment variables" step

Find the section around line 52-85 and add your secret mappings:

```yaml
- name: Set deployment variables
  id: vars
  run: |
    if [ "${{ steps.env.outputs.environment }}" == "production" ]; then
      # ... existing variables ...
      echo "cloudinary_cloud_name_secret=CLOUDINARY_CLOUD_NAME_PROD" >> $GITHUB_OUTPUT
      echo "cloudinary_api_key_secret=CLOUDINARY_API_KEY_PROD" >> $GITHUB_OUTPUT
      echo "cloudinary_api_secret_secret=CLOUDINARY_API_SECRET_PROD" >> $GITHUB_OUTPUT
    else
      # ... existing variables ...
      echo "cloudinary_cloud_name_secret=CLOUDINARY_CLOUD_NAME_STAGING" >> $GITHUB_OUTPUT
      echo "cloudinary_api_key_secret=CLOUDINARY_API_KEY_STAGING" >> $GITHUB_OUTPUT
      echo "cloudinary_api_secret_secret=CLOUDINARY_API_SECRET_STAGING" >> $GITHUB_OUTPUT
    fi
```

#### 5.2: Update "Deploy to Cloud Run" step

Find the `--set-secrets` flag (around line 134) and add your secrets:

```yaml
--set-secrets "MONGO_URI=${{ steps.vars.outputs.mongo_secret }}:latest,\
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET:latest,\
REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SECRET:latest,\
FRONTEND_URL=${{ steps.vars.outputs.frontend_secret }}:latest,\
GOOGLE_PRIVATE_KEY=${{ steps.vars.outputs.google_private_key_secret }}:latest,\
CLOUDINARY_CLOUD_NAME=${{ steps.vars.outputs.cloudinary_cloud_name_secret }}:latest,\
CLOUDINARY_API_KEY=${{ steps.vars.outputs.cloudinary_api_key_secret }}:latest,\
CLOUDINARY_API_SECRET=${{ steps.vars.outputs.cloudinary_api_secret_secret }}:latest"
```

### Step 6: Test Locally

Add the variables to your local `.env` file for testing:

```bash
# Add to your local .env file (use actual values, not placeholders)
cat >> .env << 'EOF'

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
EOF

# Test locally
npm run dev
```

### Step 7: Commit and Deploy

```bash
# Stage changes
git add .env.example .github/workflows/deploy-cloud-run.yml

# Commit
git commit -m "Add Cloudinary environment variables"

# Push to staging first (to test)
git push origin staging

# After verifying staging works, push to master for production
git push origin master
```

### Step 8: Verify Deployment

```bash
# Check that secrets are configured in Cloud Run
gcloud run services describe myskilldb-server-staging \
  --region asia-south1 \
  --format="value(spec.template.spec.containers[0].env)"

# Check logs to ensure everything is working
gcloud run services logs read myskilldb-server-staging \
  --region asia-south1 \
  --limit 50
```

---

## General Pattern for Adding Any Environment Variable

### For Sensitive Variables (Secrets)

1. **Add to `.env.example`** with placeholder
2. **Create secrets** in GCP Secret Manager (separate for staging/production)
3. **Grant access** to Cloud Run service account
4. **Update workflow**: Add to "Set deployment variables" step
5. **Update workflow**: Add to `--set-secrets` flag
6. **Deploy** and verify

### For Non-Sensitive Variables

1. **Add to `.env.example`** with placeholder
2. **Update workflow**: Add to "Set deployment variables" step with actual values
3. **Update workflow**: Add to `--set-env-vars` flag
4. **Deploy** and verify

---

## Quick Reference: Workflow Structure

### Adding a Secret Variable

```yaml
# In "Set deployment variables" step:
echo "your_secret_name=YOUR_SECRET_NAME_STAGING" >> $GITHUB_OUTPUT  # for staging
echo "your_secret_name=YOUR_SECRET_NAME_PROD" >> $GITHUB_OUTPUT     # for production

# In "Deploy to Cloud Run" step:
--set-secrets "...,YOUR_ENV_VAR_NAME=${{ steps.vars.outputs.your_secret_name }}:latest"
```

### Adding a Regular Environment Variable

```yaml
# In "Set deployment variables" step:
echo "your_var_value=your-actual-value" >> $GITHUB_OUTPUT

# In "Deploy to Cloud Run" step:
--set-env-vars "...,YOUR_ENV_VAR_NAME=${{ steps.vars.outputs.your_var_value }}"
```

---

## Checklist

When adding a new environment variable:

- [ ] Add to `.env.example` with placeholder value
- [ ] Determine if sensitive (Secret Manager) or non-sensitive (env var)
- [ ] Create secrets in GCP Secret Manager (if sensitive)
- [ ] Grant Cloud Run access to secrets (if sensitive)
- [ ] Update workflow: Add to "Set deployment variables" step
- [ ] Update workflow: Add to `--set-secrets` or `--set-env-vars` flag
- [ ] Test locally with `.env` file
- [ ] Commit changes
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Deploy to production (if staging works)

---

## Using Variables in Your Code

Variables are available as `process.env.VARIABLE_NAME`:

```typescript
// Example: Using Cloudinary variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary configuration is missing");
}
```

---

## Troubleshooting

### Secret Not Found Error

```bash
# Verify secret exists
gcloud secrets list | grep YOUR_SECRET_NAME

# Check IAM permissions
gcloud secrets get-iam-policy YOUR_SECRET_NAME_STAGING
```

### Variable Not Available in Container

1. Check workflow file syntax
2. Verify secret names match exactly (case-sensitive)
3. Ensure service was redeployed after changes
4. Check Cloud Run service configuration:

```bash
gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format="yaml(spec.template.spec.containers[0].env)"
```

### Secret Access Denied

Re-grant access:

```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding YOUR_SECRET_NAME \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Security Best Practices

1. ✅ **Never commit** actual credentials to git
2. ✅ Use **placeholder values** in `.env.example`
3. ✅ Store **sensitive data** in GCP Secret Manager
4. ✅ Use **separate secrets** for staging and production
5. ✅ **Rotate secrets** periodically
6. ✅ **Review access** regularly
7. ✅ Use **least privilege** principle

---

## Summary

This guide provides a template for adding any environment variable to your Cloud Run deployment. Follow the same pattern for future variables:

1. Document in `.env.example`
2. Store securely (Secret Manager for sensitive data)
3. Update CI/CD workflow
4. Test and deploy
5. Verify functionality

For questions or issues, refer to the troubleshooting section above.

