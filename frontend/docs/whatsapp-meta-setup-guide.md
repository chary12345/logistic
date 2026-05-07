# 📱 WhatsApp Cloud API — Meta Developer Setup Guide

> **Goal:** Send WhatsApp messages from your **own phone number** using Meta's official
> WhatsApp Cloud API — **Free to set up, no monthly fees.**

---

## 📊 Twilio vs Meta Cloud API — Quick Comparison

| Feature                  | Twilio (Free/Sandbox)     | Twilio (Paid/BYON)        | Meta Cloud API (Direct) ✅ |
|--------------------------|---------------------------|---------------------------|---------------------------|
| Own Number               | ❌ Shared number only     | ✅ Yes                    | ✅ Yes                    |
| Setup Fee                | ✅ Free                   | ❌ Paid                   | ✅ Free                   |
| Monthly Fee              | ✅ Free                   | ❌ Paid (~$1.15+/mo)      | ✅ Free                   |
| Per Message Cost         | ❌ Yes                    | ❌ Yes ($0.005+/msg)      | ✅ 1000 free/month        |
| Best For                 | Testing only              | Production (paid)         | ✅ Best Choice            |

---

## ⚠️ Before You Start — Important Notes

1. **Your personal WhatsApp number CANNOT be used while active on the WhatsApp app.**
   - If you want to use a number already on WhatsApp, go to WhatsApp App → Settings → Account → **Delete Account** first.
2. **Use a dedicated number** (a SIM not actively used on WhatsApp) for best results.
3. **Permanent Access Token** is shown **only once** — save it immediately.
4. **Outbound template messages** must be pre-approved by Meta before sending.

---

## ✅ Quick Checklist

- [ ] Facebook account created
- [ ] Registered as Meta Developer
- [ ] Meta Business Account created & email verified
- [ ] App created with type **"Business"**
- [ ] WhatsApp product added to app
- [ ] Own phone number added & OTP verified
- [ ] System User created with permanent token saved
- [ ] Test message sent successfully

---

## 🚀 Step-by-Step Setup

---

### Step 1 — Sign Up / Log In to Meta for Developers

**Link:** https://developers.facebook.com

- Click **"Get Started"** (top right corner)
- Log in with your **Facebook account** (personal account is fine)
- If you don't have a Facebook account:
  - **Create one here:** https://www.facebook.com/r.php

---

### Step 2 — Register as a Developer

- After login, you will be prompted to **accept Meta Platform Policies**
- Click **"Next"**
- Verify your account via **phone number or email**
- Click **"Done"**
- ✅ You are now a registered Meta Developer

---

### Step 3 — Create a Meta Business Account *(Required for WhatsApp)*

**Link:** https://business.facebook.com

- Click **"Create Account"**
- Fill in the following details:
  - **Business Name** — e.g., `Your Company Name`
  - **Your Name**
  - **Business Email**
- Click **Submit**
- **Verify your email** by clicking the link sent to your inbox

> ⚠️ This **Meta Business Account** is **mandatory** to use WhatsApp Business API
> with your own number.

---

### Step 4 — Create Your First App on Meta Developer Console

**Link:** https://developers.facebook.com/apps

- Click **"Create App"**
- **Choose use case** → Select **"Other"** → Click **Next**
- **Select App Type** → Select **"Business"** → Click **Next**
- Fill in:
  - **App Name** — e.g., `LogisticWhatsApp`
  - **App Contact Email** — your email
  - **Business Account** → Select the one you created in Step 3
- Click **"Create App"**

---

### Step 5 — Add WhatsApp Product to Your App

- After app is created, you will see the **"Add Products to Your App"** screen
- Find **"WhatsApp"** → Click **"Set Up"**
- You will be taken to the **WhatsApp Getting Started** page

---

### Step 6 — Get Your Test Credentials

On the **WhatsApp → Getting Started** page, you will see:

| Item                        | Description                              |
|-----------------------------|------------------------------------------|
| **Phone Number ID**         | Your test sender ID                      |
| **WhatsApp Business Account ID** | Your WABA ID                        |
| **Temporary Access Token**  | Valid for 24 hours (for testing only)    |

- Under **"Send and receive messages"**, add your personal number as a test recipient
- Click **"Send Message"** to verify the setup is working

---

### Step 7 — Add Your Own Phone Number

**Path in Console:** WhatsApp → Phone Numbers → Add Phone Number

- Click **"Add Phone Number"**
- Enter the following:
  - **Display Name** — e.g., `Logistic Services` *(must match your business)*
  - **Category** — e.g., `Logistics & Delivery`
  - **Phone Number** — must NOT be linked to any WhatsApp account
- Choose verification method: **SMS or Voice Call**
- Enter the OTP received on that number
- Click **Verify**

> ⚠️ If the number is currently on WhatsApp:
> Open WhatsApp app → Settings → Account → **Delete Account** → then use it here.

---

### Step 8 — Generate a Permanent Access Token

**Link:** https://business.facebook.com/settings/system-users

- Click **"Add"**
- Create a **System User**:
  - Name: `whatsapp-api-user`
  - Role: **Admin**
- Click **"Generate Token"**
- Select your App (created in Step 4)
- Enable the following permissions:
  - ✅ `whatsapp_business_messaging`
  - ✅ `whatsapp_business_management`
- Click **"Generate Token"**
- 🔴 **Copy and save immediately** — it is shown only **once**!

---

### Step 9 — Set Up Webhook (Optional but Recommended)

A webhook lets Meta notify your server of incoming messages and delivery status.

**Path in Console:** WhatsApp → Configuration → Webhook

- **Callback URL:** `https://your-domain.com/webhook/whatsapp`
- **Verify Token:** any string you define (e.g., `my_secret_token`)
- Subscribe to fields:
  - ✅ `messages`
  - ✅ `message_deliveries`
  - ✅ `message_reads`

> For local development, use **ngrok**: https://ngrok.com to expose your local server.

---

### Step 10 — Test Your Setup via cURL

Replace the placeholders and run this command:

```bash
curl -X POST https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer YOUR_PERMANENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "91XXXXXXXXXX",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": { "code": "en_US" }
    }
  }'
```

**Expected Response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "91XXXXXXXXXX", "wa_id": "91XXXXXXXXXX" }],
  "messages": [{ "id": "wamid.XXXXXXXXXXXX" }]
}
```

---

### Step 11 — Create & Submit Your Own Message Templates

**Path in Console:** WhatsApp → Message Templates → Create Template

- Click **"Create Template"**
- Fill in:
  - **Category** — Marketing / Utility / Authentication
  - **Name** — e.g., `lr_booking_confirmation`
  - **Language** — English (or your preferred language)
- Add **Header** (optional): Text or Document/Image/Video
- Add **Body** with variables e.g.:

```
Hello {{1}}, your LR No. {{2}} has been booked successfully.
From: {{3}} → To: {{4}}
Total Amount: ₹{{5}}
Thank you for choosing our service!
```

- Add **Footer** (optional): e.g., `Powered by Logistic Services`
- Add **Buttons** (optional): Quick Reply or Call to Action
- Click **Submit** → Meta reviews within **a few minutes to 24 hours**

---

## 🔗 All Important Links

| Resource                        | Link                                                                 |
|---------------------------------|----------------------------------------------------------------------|
| Meta Developers Home            | https://developers.facebook.com                                      |
| Create Facebook Account         | https://www.facebook.com/r.php                                       |
| Meta Business Manager           | https://business.facebook.com                                        |
| My Apps Dashboard               | https://developers.facebook.com/apps                                 |
| System Users (Permanent Token)  | https://business.facebook.com/settings/system-users                  |
| WhatsApp Cloud API Quickstart   | https://developers.facebook.com/docs/whatsapp/cloud-api/get-started  |
| WhatsApp API Reference          | https://developers.facebook.com/docs/whatsapp/cloud-api/reference    |
| WhatsApp Pricing                | https://developers.facebook.com/docs/whatsapp/pricing                |
| Message Templates Guide         | https://developers.facebook.com/docs/whatsapp/message-templates      |
| Webhook Setup                   | https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks     |
| ngrok (Local Webhook Testing)   | https://ngrok.com                                                     |

---

## 💰 Pricing Summary (as of 2025)

| Conversation Type   | Description                                     | Cost            |
|---------------------|-------------------------------------------------|-----------------|
| **Service**         | Customer replies within 24hr window             | ✅ Free          |
| **Utility**         | Order updates, booking confirmations            | Paid (per msg)  |
| **Marketing**       | Promotions, offers                              | Paid (per msg)  |
| **Authentication**  | OTPs, verification codes                        | Paid (per msg)  |
| **Free Tier**       | 1,000 service conversations/month              | ✅ Free          |
| **Click-to-WhatsApp Ads** | Customer initiates via FB/IG ad          | 72hr free window|

> Exact per-message rates vary by **country** and **volume**.
> Check: https://developers.facebook.com/docs/whatsapp/pricing

---

## 🔧 Spring Boot Integration — Environment Variables

Add these to your `application.properties` or environment:

```properties
# Meta WhatsApp Cloud API Config
whatsapp.api.url=https://graph.facebook.com/v19.0
whatsapp.api.phone-number-id=YOUR_PHONE_NUMBER_ID
whatsapp.api.access-token=YOUR_PERMANENT_ACCESS_TOKEN
whatsapp.api.waba-id=YOUR_WHATSAPP_BUSINESS_ACCOUNT_ID
```

---

## 📋 Common Errors & Fixes

| Error Code | Message                        | Fix                                                   |
|------------|--------------------------------|-------------------------------------------------------|
| `100`      | Invalid parameter              | Check Phone Number ID or token                        |
| `131030`   | Recipient not in allowlist     | Add recipient number in test allowlist (sandbox mode) |
| `132001`   | Template not found             | Check template name and language code                 |
| `132007`   | Template text mismatch         | Body text must match approved template exactly        |
| `190`      | Invalid/Expired token          | Regenerate permanent token via System Users           |

---

*Guide created: May 2026 | For use with Logistic Spring Boot Project*
*Reference: https://developers.facebook.com/docs/whatsapp/cloud-api*
