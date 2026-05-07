# 📧 Email Integration Reference — Branch & Employee Creation

> **Project:** 1UNIQ Transport Logistics | **Stack:** Spring Boot 3.4.3 + Angular 17 | **Service:** Gmail SMTP

---

## 🔧 What Was Integrated

Automatic **HTML welcome emails** sent via Gmail SMTP when:
- Admin **creates a new Branch** → email to branch's email field
- Admin **creates a new Employee** → email to employee's email field + CC to admin

---

## 📁 Files Changed

### Backend
| File | Change |
|---|---|
| `pom.xml` | Added `spring-boot-starter-mail` dependency |
| `src/main/resources/application.properties` | Added Gmail SMTP config |
| `LogisticApplication.java` | Added `@EnableAsync` annotation |
| `model/User.java` | Added `plainPassword` + `adminEmail` transient fields |
| **`service/EmailService.java`** | **NEW** — HTML email builder for Branch + Employee |
| `service/EmployyeServiceImpl.java` | Injected `EmailService` + `BranchRepo` + `CompanyRegisterrepo`; calls email after save |
| `service/CompanyRegisterServiceImpl.java` | Injected `EmailService`; calls email after branch save |

### Frontend
| File | Change |
|---|---|
| `employee-manage.component.ts` | Sends `plainPassword` + `adminEmail` in payload; shows email toast |
| `branch-manage.component.ts` | Adds `branchCreatedBy` to payload; shows email-sent toast |

---

## ⚙️ Configuration (`application.properties`)

```properties
# Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=1uniq.transport@gmail.com
spring.mail.password=tuyr fssq rjgk rxqj
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
app.company.name=1UNIQ Transport
app.company.support.email=1uniq.transport@gmail.com
```

---

## 📬 Email Details

### Branch Welcome Email
| Field | Value |
|---|---|
| **From** | `1uniq.transport@gmail.com` |
| **To** | Branch email field (entered during branch create) |
| **Subject** | `1UNIQ Transport — New Branch Setup Confirmation: {BranchName}` |
| **Content** | Branch Code, Name, Type, Company Code, State, City, Address, Postal Code, Phone(s), GSTIN, Contact Person, Created By |
| **Theme** | 🟢 Green header gradient |

### Employee Welcome Email
| Field | Value |
|---|---|
| **From** | `1uniq.transport@gmail.com` |
| **To** | Employee email field (entered during employee create) |
| **CC** | Logged-in admin's email (from `sessionStorage → user.email`) |
| **Subject** | `Welcome to 1UNIQ Transport — Your Account Credentials` |
| **Content** | Username (plain, no company code), Password (plain), Role, Phone, Company, Company Code, Branch Name, Branch Code |
| **Theme** | 🔵 Blue header gradient |

---

## 🔑 Key Design Decisions

### 1. Plain Password (`plainPassword` field)
Angular AES-encrypts the password before sending to the backend. A separate `plainPassword` field (transient, never stored in DB) carries the readable password for the email.

```typescript
// Angular side (employee-manage.component.ts)
const plainPwd = v.password || '';
payload = {
  password: this.encryptPassword(plainPwd),  // AES encrypted → stored in DB
  plainPassword: plainPwd,                    // plain → used only for email
  ...
}
```

### 2. Admin Email for CC (`adminEmail` field)
Pulled from Angular `AuthService.currentUser.email` session, sent as transient field.

```typescript
adminEmail: this.auth.currentUser?.email || ''
```

### 3. Async Email (`@Async`)
Email is sent on a **separate thread** — API response returns instantly, email sends in background.

```java
@Async
public void sendEmployeeWelcomeEmail(...) { ... }
```

Requires `@EnableAsync` on `LogisticApplication.java`.

### 4. Branch Name Resolution
Branch name is fetched from DB inside `EmployyeServiceImpl` using `BranchRepo.getBranchBybranchCode()` — not passed from Angular — ensuring accuracy.

### 5. Company Name Resolution
Company full name is fetched from DB using `CompanyRegisterrepo.getCompanyByID()`.

---

## ❌ Email Failure Scenario — Q&A

### Q1: What happens when email sending fails?

```
Timeline:
1. Admin submits form
2. API: POST /addEmployee or /createBranch
3. Backend: Employee/Branch SAVED to DB ← happens FIRST
4. status = "SUCCESS" returned to Angular ← API succeeds
5. Async thread: EmailService.send() → FAILS (SMTP error, timeout, etc.)
6. Exception is CAUGHT inside try-catch → logged to server console
7. Async thread exits silently — no impact on main thread
```

**Result:** Employee/Branch is created successfully. Email silently fails in the background.

### Q2: Do users get a toast notification about email failure?

**No.** Since the email is sent asynchronously AFTER the API returns `"SUCCESS"`, the frontend has already shown the success toast. The email failure happens server-side in a background thread — it never reaches Angular.

The email-sent toast shown in the UI:
```
"Welcome email sent to abc@gmail.com"
```
is **optimistic** — it shows because the API succeeded, not because the email was confirmed delivered.

### Q3: Does Branch/Employee creation still work if email fails?

✅ **YES, absolutely.** The `userRepository.save()` / `branchRepo.save()` happens **before** the email call. The email runs on a **different async thread** with its own try-catch. A failure there has **zero impact** on the creation.

```java
userRepository.save(userDTO);   // ← Saved first (synchronous)
status = "SUCCESS";             // ← Returned regardless of email
emailService.sendEmail(...);    // ← Async, fires-and-forgets
```

### Q4: Where is the email failure logged?

In the Spring Boot **server console/logs**:
```
ERROR - Failed to send employee welcome email to xyz@gmail.com: <error message>
```
(via `logger.error()` in `EmailService.java`)

### Q5: Common failure causes & fixes

| Cause | Fix |
|---|---|
| Wrong App Password | Regenerate at myaccount.google.com/apppasswords |
| 2FA disabled on Gmail | Enable 2-Step Verification |
| SMTP timeout (slow network) | Timeouts already set to 5s each in config |
| Employee email field empty | Email is skipped gracefully (null check in service) |
| Gmail daily limit exceeded | 500/day for Gmail, 2000/day for Workspace — unlikely for internal use |

---

## 🍞 Toast Notifications Summary

| Scenario | Toast 1 | Toast 2 (600ms delay) |
|---|---|---|
| Employee created, email field filled | ✅ `"Employee created successfully!"` | ✅ `"Welcome email sent to {email}"` |
| Employee created, no email | ✅ `"Employee created successfully!"` | *(none)* |
| Branch created (Add mode), email filled | ✅ `"Branch created successfully!"` | ✅ `"Branch setup email sent to {email}"` |
| Branch updated (Edit mode) | ✅ `"Branch updated successfully!"` | *(none — email only on create)* |
| Creation fails | ❌ Error toast with server message | *(none)* |

---

## 🔄 Flow Diagram

```
EMPLOYEE CREATION FLOW
─────────────────────
Angular Form Submit
  │
  ├─ payload includes: password (AES), plainPassword, adminEmail
  │
  └─→ POST /addEmployee
          │
          ├─ Validate username uniqueness
          ├─ Check employee/admin limits
          ├─ Save UserDto to USER_DATA table ◄─── DB WRITE
          ├─ Fetch company name from company_dto
          ├─ Fetch branch name from branch_data
          ├─ return "SUCCESS" ──────────────────→ Angular shows toast x2
          │
          └─ [ASYNC THREAD] EmailService.sendEmployeeWelcomeEmail()
                  │
                  ├─ Build HTML email
                  ├─ JavaMailSender.send() → Gmail SMTP → Employee inbox
                  └─ CC → Admin inbox
                  (failure here: logged only, user unaffected)

BRANCH CREATION FLOW
────────────────────
Angular Form Submit
  │
  ├─ payload includes: branchCreatedBy (admin full name)
  │
  └─→ POST /createBranch
          │
          ├─ Save BranchDTO to branch_data ◄──── DB WRITE
          ├─ Save AddressDto to address table ◄── DB WRITE
          ├─ Save RegionMaster ◄────────────────── DB WRITE
          ├─ return "SUCCESS" ──────────────────→ Angular shows toast x2
          │
          └─ [ASYNC THREAD] EmailService.sendBranchWelcomeEmail()
                  │
                  └─ JavaMailSender.send() → Gmail SMTP → Branch email inbox
```

---

*Last updated: May 2025 | For support: 1uniq.transport@gmail.com*
