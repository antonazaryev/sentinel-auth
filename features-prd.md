# Auth Platform – Features PRD  
*Version 0.3 (2025‑05‑03) – Draft*

---

## 1 · Objective  
Provide a **complete, abuse‑resilient sign‑in lifecycle** (email/password + social IdPs) that is secure and friction‑free for end‑users and easy to integrate for client applications.

---

## 2 · Scope  

### Must‑have (MVP)  
1. **Sign Up** – Email + password (zxcvbn meter)  
2. **Login** – Email/password, Access/Refresh cookies  
3. **Logout** – Current session & “all devices”  
4. **Forgot Password** – Request reset link  
5. **Reset Password** – Token‑based flow  
6. **Verify Email / Phone** – OTP or magic link / SMS code  
7. **Change Email / Phone** – double‑opt‑in verification  
8. **Social Login** – Google, LinkedIn, Apple, X (Twitter), Meta (Facebook)  
9. **Anti‑Spam Protection** – Rate‑limiting & CAPTCHA fallback for high‑risk endpoints

### Nice‑to‑have (post‑MVP)  
* Remember device / Trusted‑device list  
* MFA (TOTP, WebAuthn)  
* Account deletion / export for GDPR  

---

## 3 · Personas  

| Persona | Needs | Pain points |
|---------|-------|-------------|
| **End User** | one‑click login, spam‑free inbox | slow email delivery, CAPTCHA loops |
| **Admin** | revoke compromised sessions | no abuse dashboard |
| **Developer** | drop‑in SDK, predictable errors | inconsistent error codes |

---

## 4 · User Stories & Acceptance Criteria  

### 4.1 · Sign Up  
| AC ID | Acceptance Criteria |
|-------|---------------------|
| SU‑1 | `POST /auth/register` returns **201** and sets cookies. |
| SU‑2 | Password policy: ≥ 12 chars, zxcvbn ≥ 3. |
| SU‑3 | Verification email link single‑use, 24 h TTL. |
| SU‑4 | > 3 register attempts / IP / min triggers CAPTCHA. |

### 4.2 · Login  
| AC ID | Acceptance Criteria |
|-------|---------------------|
| LI‑1 | Valid credentials → **200** and cookies. |
| LI‑2 | 5 failed attempts / 10 min → CAPTCHA gate. |
| LI‑3 | If email not verified → **403** `ERR_EMAIL_NOT_VERIFIED`. |
| LI‑4 | CSP headers present (strict‑dynamic). |

### 4.3 · Forgot / Reset Password  
| AC | Criteria |
|----|----------|
| FP‑1 | Enumeration‑safe 202 response. |
| FP‑2 | > 20 forgot requests / hour / account→ CAPTCHA required. |
| RP‑1 | Reset token single‑use, 30 min TTL; success revokes all refresh tokens. |

### 4.4 · Verify Email / Phone  
| AC | Criteria |
|----|----------|
| VE‑1 | OTP length 6; 3 sms / min limit. |
| VE‑2 | Masked contact info in responses. |

### 4.5 · Change Email / Phone  
| AC | Criteria |
|----|----------|
| CE‑1 | Requires re‑auth ≤ 5 min old. |
| CE‑2 | New contact must be verified before switch. |

### 4.6 · Social Login  
| AC | Criteria |
|----|----------|
| SL‑1 | Uses OAuth 2.1 PKCE; state param signed. |
| SL‑2 | Auto‑link by verified email. |
| SL‑3 | After 10 failed provider callbacks / IP → provider‑level login is blocked for 1 h. |

---

## 5 · Non‑Functional Requirements  

| Area | Requirement |
|------|-------------|
| Security | OWASP ASVS v4 L2; rotating refresh tokens; CSP strict‑dynamic |
| Abuse Protection | Redis token‑bucket; hCaptcha fallback; IP quarantine 30 min |
| Accessibility | WCAG 2.2 AA |
| Localisation | EN, HE, RU |
| Performance | Sign‑in ≤ 1.2 s median on 3G |
| Hardening | Helmet, zxcvbn meter, Playwright component tests |

---

## 6 · Telemetry & Success Metrics  

| Metric | Target |
|--------|--------|
| Legit sign‑ins / Attempts | ≥ 92 % |
| Password reset completion | ≥ 70 % within 24 h |
| CAPTCHA solve success | ≥ 85 % (signals low false positives) |
| Social login share | ≥ 40 % of new sign‑ups |

---

## 7 · Dependencies  

* Email – AWS SES / SendGrid  
* SMS – Twilio / Vonage  
* CAPTCHA – **hCaptcha Enterprise** (fallback reCAPTCHA v3)  
* OAuth – Keys from Google, LinkedIn, Apple, X, Meta  
* Redis – rate‑limits & blacklist  

---

## 8 · Risks & Mitigations  

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Email deliverability issues | Users blocked | Warm‑up IPs, backup SMTP |
| IdP policy changes | Social login fails | nightly smoke tests |
| CAPTCHA provider outage | Users blocked | switch to reCAPTCHA v3 |

---

## 9 · Release Plan  

| Sprint | Features | Notes |
|--------|----------|-------|
| **0** | Skeleton endpoints, Zod schemas, abuse middleware | |
| **1** | Sign Up / Login / Logout + rate‑limit + CAPTCHA | |
| **2** | Forgot / Reset password, Email verification | |
| **3** | Social Login (Google, LinkedIn) | |
| **4** | Phone verify + change contact | |
| **5** | Apple, X, Meta login | |
