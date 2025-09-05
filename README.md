# ALX Polly - Secure Polling Application

A modern, secure polling application built with Next.js, Supabase, and TypeScript. This application allows users to create, share, and vote on polls with comprehensive security measures in place.

## 🚨 Security Audit & Fixes

This codebase has undergone a comprehensive security audit and remediation. The following critical vulnerabilities were discovered and fixed:

### Critical Security Flaws Discovered

#### 1. **CRITICAL: Missing Authorization Checks**
- **Issue**: The `deletePoll` function allowed any authenticated user to delete ANY poll
- **Impact**: Complete data loss, unauthorized access to other users' data
- **Location**: `app/lib/actions/poll-actions.ts:99-105`
- **Fix**: Added user ownership verification before deletion

#### 2. **CRITICAL: Admin Panel Data Exposure**
- **Issue**: Admin page exposed all user data without access controls
- **Impact**: Complete data breach, privacy violation
- **Location**: `app/(dashboard)/admin/page.tsx:32-44`
- **Fix**: Added admin role verification and access controls

#### 3. **HIGH: XSS Vulnerabilities**
- **Issue**: User input was not sanitized before display
- **Impact**: Stored XSS attacks, session hijacking, data theft
- **Locations**: Multiple components rendering user data
- **Fix**: Implemented comprehensive input sanitization

#### 4. **HIGH: Missing Input Validation**
- **Issue**: No validation on user inputs, allowing malicious data
- **Impact**: Data corruption, potential security bypasses
- **Fix**: Added comprehensive validation using custom security utilities

#### 5. **MEDIUM: Insecure Error Handling**
- **Issue**: Error messages leaked sensitive information
- **Impact**: Information disclosure
- **Fix**: Implemented generic error messages

### Security Measures Implemented

#### Input Validation & Sanitization
- **File**: `lib/security.ts`
- **Features**:
  - XSS prevention through HTML escaping
  - Input length validation
  - Duplicate option prevention
  - Email and password strength validation
  - Name validation with character restrictions

#### Authorization Controls
- **File**: `app/lib/actions/poll-actions.ts`
- **Features**:
  - User ownership verification for all poll operations
  - Authentication checks for sensitive operations
  - Admin access control with role verification

#### Security Headers
- **File**: `next.config.ts`
- **Headers Implemented**:
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
  - `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
  - `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
  - `Permissions-Policy` - Restricts browser features
  - `Strict-Transport-Security` - Enforces HTTPS

#### Rate Limiting
- **Files**: `lib/rate-limit.ts`, `lib/middleware/rate-limit.ts`
- **Limits**:
  - Authentication: 5 attempts per 15 minutes
  - Poll creation: 3 polls per minute
  - General API: 30 requests per minute

#### Environment Validation
- **File**: `lib/env.ts`
- **Features**:
  - Required variables validation
  - Format validation for Supabase credentials
  - Runtime configuration validation

## 🛠️ Technology Stack

- **Framework**: Next.js 15.4.1 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS with shadcn/ui
- **Language**: TypeScript
- **State Management**: Server Components + React Context

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alx-polly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SECRET_KEY=your_supabase_secret_key
   ```

4. **Set up Supabase database**
   Create the following tables in your Supabase database:
   ```sql
   -- Polls table
   CREATE TABLE polls (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     question TEXT NOT NULL,
     options TEXT[] NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Votes table
   CREATE TABLE votes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     option_index INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security (recommended)
   ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
   ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

   -- Create policies (example)
   CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
   CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own polls" ON polls FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Security Testing

### Run Security Tests
```bash
node scripts/security-test.js
```

### Manual Security Checklist
- [ ] Try to delete another user's poll (should fail)
- [ ] Try to access admin panel without admin privileges (should be denied)
- [ ] Submit XSS payloads in poll questions (should be sanitized)
- [ ] Submit extremely long inputs (should be rejected)
- [ ] Try to create duplicate poll options (should be rejected)
- [ ] Test rate limiting by making rapid requests
- [ ] Verify security headers are present in responses

## 📁 Project Structure

```
alx-polly/
├── app/
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Protected dashboard pages
│   ├── components/             # Reusable components
│   ├── lib/
│   │   ├── actions/            # Server actions
│   │   ├── context/            # React context
│   │   └── types/              # TypeScript types
│   └── globals.css
├── components/ui/              # shadcn/ui components
├── lib/
│   ├── supabase/              # Supabase configuration
│   ├── security.ts            # Security utilities
│   ├── rate-limit.ts          # Rate limiting
│   └── env.ts                 # Environment validation
├── scripts/
│   └── security-test.js       # Security testing
├── SECURITY.md                # Detailed security documentation
└── README.md                  # This file
```

## 🔒 Security Features

### Authentication & Authorization
- Supabase authentication with email/password
- User session management
- Protected routes with middleware
- Admin role verification

### Input Security
- Comprehensive input validation
- XSS prevention through sanitization
- SQL injection prevention (Supabase handles this)
- CSRF protection through SameSite cookies

### Data Protection
- User data isolation
- Secure error handling
- Input length limits
- Duplicate prevention

### Infrastructure Security
- Security headers
- Rate limiting
- Environment variable validation
- HTTPS enforcement

## 🚨 Security Considerations

### Current Limitations
1. **Rate Limiting**: Uses in-memory storage (not suitable for multiple server instances)
2. **Admin Access**: Hardcoded admin email (consider implementing role-based access)
3. **Audit Logging**: Not implemented (consider adding for production)
4. **CSRF Protection**: Basic implementation (consider adding CSRF tokens)

### Recommended Production Enhancements
1. **Implement Row Level Security (RLS)** in Supabase
2. **Add comprehensive audit logging**
3. **Implement Content Security Policy (CSP)**
4. **Add two-factor authentication**
5. **Implement proper admin role management**
6. **Use Redis for rate limiting in production**

## 📊 Security Audit Results

| Vulnerability | Severity | Status | Fix Location |
|---------------|----------|--------|--------------|
| Missing Authorization | Critical | ✅ Fixed | `poll-actions.ts` |
| Admin Data Exposure | Critical | ✅ Fixed | `admin/page.tsx` |
| XSS Vulnerabilities | High | ✅ Fixed | `lib/security.ts` |
| Input Validation | High | ✅ Fixed | `lib/security.ts` |
| Error Information Leakage | Medium | ✅ Fixed | `auth-actions.ts` |
| Missing Security Headers | Low | ✅ Fixed | `next.config.ts` |

**Overall Security Rating**: B+ (Major vulnerabilities fixed, production-ready with monitoring)

## 🤝 Contributing

When contributing to this project:

1. **Follow security best practices**
2. **Use the provided security utilities** (`lib/security.ts`)
3. **Always validate and sanitize user input**
4. **Implement proper authorization checks**
5. **Test for security vulnerabilities**
6. **Update security documentation** if needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For security-related questions or to report vulnerabilities:
- Create an issue in the repository
- Contact the development team
- Follow responsible disclosure practices

---

**Last Security Audit**: December 2024  
**Security Status**: ✅ Critical vulnerabilities addressed  
**Production Ready**: Yes (with monitoring)