# Future Merge Steps - Complete Project Integration Documentation

## Overview

This document outlines the complete process for merging the Sentinel productivity application with Gmail/Calendar integration functionality. The merge will enhance Sentinel with real Google services integration while maintaining the modern React + FastAPI + Supabase architecture. The plan is to cleanly merge with prototype's to do list branch.

## Pre-Merge Status Check

### Sentinel - Ready State

✅ Session middleware added and configured

✅ Compatible dependencies installed

✅ Request objects available in all routes

✅ Environment variables prepared

✅ Directory structure aligned

✅ Authentication system flexible for hybrid approach

### Prototype Integration Points

📧 Gmail OAuth authentication flow (auth.py)

📧 Email fetching, parsing, and cleaning (emails.py)

📅 Calendar OAuth and event syncing (calendar_api.py)

🔧 Session-based authentication system

🗄️ SQLite database operations

🎨 Jinja2 template rendering (to be replaced)

## Phase 1: Core Integration

### 1.1 Authentication System Merge
- **Objective**: Combine JWT-based auth with Google OAuth
- **Implementation**:
  - Extend `auth_utils.py` to handle Google OAuth tokens
  - Add Google OAuth endpoints to `routers/auth.py`
  - Update session management to store Google credentials
  - Maintain backward compatibility with existing JWT system

### 1.2 Database Schema Updates
- **Objective**: Add Google service integration tables
- **Implementation**:
  - Create migration for Google account connections
  - Add OAuth token storage with encryption
  - Create sync status tracking tables
  - Maintain Supabase RLS policies for new tables

### 1.3 Environment Configuration
- **Objective**: Add Google API credentials
- **Implementation**:
  - Update `.env.example` with Google OAuth variables
  - Add Google API client configuration
  - Configure OAuth redirect URIs
  - Set up API quota monitoring

## Phase 2: Gmail Integration

### 2.1 Gmail OAuth Setup
- **Objective**: Enable Gmail account connection
- **Implementation**:
  - Add Gmail OAuth scope configuration
  - Create Gmail connection endpoints
  - Implement token refresh mechanism
  - Add connection status indicators in UI

### 2.2 Email Fetching & Parsing
- **Objective**: Replace mock email data with real Gmail API
- **Implementation**:
  - Replace `generate_mock_emails()` in `routers/emails.py`
  - Implement Gmail API client
  - Add email parsing and cleaning logic
  - Create background sync tasks

### 2.3 Task Suggestion Enhancement
- **Objective**: Improve AI-powered task suggestions from real emails
- **Implementation**:
  - Enhance email content analysis
  - Improve task suggestion algorithms
  - Add email-to-task conversion UI
  - Implement suggestion acceptance/dismissal

### 2.4 Frontend Gmail Integration
- **Objective**: Update React components for Gmail features
- **Implementation**:
  - Add Gmail connection UI components
  - Update email sync indicators
  - Enhance email display with real data
  - Add Gmail-specific actions (archive, label, etc.)

## Phase 3: Calendar Integration

### 3.1 Google Calendar OAuth
- **Objective**: Enable Calendar account connection
- **Implementation**:
  - Add Calendar OAuth scope configuration
  - Create Calendar connection endpoints
  - Implement Calendar API client
  - Add calendar selection UI

### 3.2 Calendar Event Syncing
- **Objective**: Replace mock calendar data with real Google Calendar
- **Implementation**:
  - Replace hardcoded events in `src/store.ts`
  - Implement Calendar API integration
  - Add two-way sync capabilities
  - Create event-to-task conversion logic

### 3.3 Calendar UI Enhancement
- **Objective**: Enhance calendar components with real data
- **Implementation**:
  - Update `src/pages/Calendar.tsx` for real events
  - Add calendar management UI
  - Implement event creation/editing
  - Add calendar sync status indicators

## Phase 4: Advanced Features

### 4.1 Real-time Sync
- **Objective**: Implement live data synchronization
- **Implementation**:
  - Add WebSocket support for real-time updates
  - Implement Gmail push notifications
  - Add Calendar change notifications
  - Create sync conflict resolution

### 4.2 Enhanced AI Integration
- **Objective**: Improve intelligent features with real data
- **Implementation**:
  - Integrate Google Gemini LLM for Sentinel AI
  - Enhance email parsing with AI
  - Add smart scheduling suggestions
  - Implement productivity insights

### 4.3 Advanced Task Management
- **Objective**: Enhance task features with Google integration
- **Implementation**:
  - Add task-to-calendar event creation
  - Implement smart due date suggestions
  - Add location-based task reminders
  - Create task templates from email patterns

## Phase 5: Testing & Polish

### 5.1 Comprehensive Testing
- **Objective**: Ensure reliability and performance
- **Implementation**:
  - Add unit tests for Google API integration
  - Create integration tests for OAuth flows
  - Implement end-to-end testing
  - Add performance benchmarking

### 5.2 Error Handling & Recovery
- **Objective**: Robust error handling for external services
- **Implementation**:
  - Add comprehensive error handling for API failures
  - Implement retry mechanisms with exponential backoff
  - Create user-friendly error messages
  - Add offline mode capabilities

### 5.3 Security Hardening
- **Objective**: Ensure secure handling of Google credentials
- **Implementation**:
  - Implement secure token storage
  - Add token encryption at rest
  - Create audit logging for sensitive operations
  - Implement rate limiting and abuse prevention

## Technical Merge Strategy

### File Integration Approach

#### Backend Files to Merge
```
prototype/auth.py → backend/routers/auth.py (extend existing)
prototype/emails.py → backend/routers/emails.py (replace mock functions)
prototype/calendar_api.py → backend/routers/calendar.py (new file)
prototype/database.py → backend/database.py (merge database operations)
```

#### Frontend Files to Update
```
src/services/api.ts (add Google API endpoints)
src/store.ts (replace mock data with API calls)
src/pages/Calendar.tsx (integrate real calendar data)
src/pages/Inbox.tsx (integrate real email data)
src/components/ (add Google connection components)
```

### Dependency Management
```python
# New backend dependencies to add
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.108.0
```

```json
// New frontend dependencies (if needed)
{
  "@google-cloud/local-auth": "^2.1.0",
  "googleapis": "^128.0.0"
}
```

## Environment Configuration for Merge

### Backend Environment Variables
```env
# Existing Supabase configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# New Google API configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Gmail API configuration
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly
GMAIL_BATCH_SIZE=50

# Calendar API configuration
CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly
CALENDAR_SYNC_INTERVAL=300

# Session configuration (already present)
SESSION_SECRET_KEY=your-session-secret-key-min-32-chars-long
```

### Frontend Environment Variables
```env
# Existing configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api

# New Google integration
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Database Migrations

### New Tables for Google Integration
```sql
-- Google account connections
CREATE TABLE IF NOT EXISTS google_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_user_id text NOT NULL,
  email text NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scopes text[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gmail sync status
CREATE TABLE IF NOT EXISTS gmail_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES google_connections(id) ON DELETE CASCADE,
  last_sync_at timestamptz,
  last_message_id text,
  sync_status text DEFAULT 'pending',
  error_message text,
  messages_synced integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calendar sync status
CREATE TABLE IF NOT EXISTS calendar_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES google_connections(id) ON DELETE CASCADE,
  calendar_id text NOT NULL,
  calendar_name text NOT NULL,
  last_sync_at timestamptz,
  sync_token text,
  sync_status text DEFAULT 'pending',
  error_message text,
  events_synced integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_status ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage own Google connections" ON google_connections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own Gmail sync status" ON gmail_sync_status
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM google_connections 
    WHERE google_connections.id = gmail_sync_status.connection_id 
    AND google_connections.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own Calendar sync status" ON calendar_sync_status
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM google_connections 
    WHERE google_connections.id = calendar_sync_status.connection_id 
    AND google_connections.user_id = auth.uid()
  ));
```

## API Documentation Updates

### New Endpoints to Add

#### Google Authentication
```
POST /api/auth/google/connect - Initiate Google OAuth flow
GET /api/auth/google/callback - Handle OAuth callback
POST /api/auth/google/disconnect - Disconnect Google account
GET /api/auth/google/status - Check connection status
```

#### Gmail Integration
```
GET /api/gmail/messages - Fetch Gmail messages
POST /api/gmail/sync - Trigger Gmail sync
GET /api/gmail/sync/status - Check sync status
POST /api/gmail/messages/{id}/create-task - Convert email to task
```

#### Calendar Integration
```
GET /api/calendar/calendars - List user's calendars
GET /api/calendar/events - Fetch calendar events
POST /api/calendar/sync - Trigger calendar sync
GET /api/calendar/sync/status - Check sync status
POST /api/calendar/events/{id}/create-task - Convert event to task
```

## Testing Strategy

### Unit Testing
```python
# Test Google API integration
def test_gmail_oauth_flow():
    # Test OAuth initiation and callback handling
    pass

def test_gmail_message_parsing():
    # Test email parsing and task suggestion generation
    pass

def test_calendar_event_sync():
    # Test calendar event fetching and processing
    pass
```

### Integration Testing
```python
# Test end-to-end flows
def test_gmail_to_task_workflow():
    # Test complete flow from Gmail sync to task creation
    pass

def test_calendar_to_task_workflow():
    # Test complete flow from calendar sync to task creation
    pass
```

### Frontend Testing
```typescript
// Test Google integration components
describe('GoogleConnectionButton', () => {
  it('should initiate OAuth flow', () => {
    // Test OAuth initiation
  });
});

describe('EmailToTaskConverter', () => {
  it('should convert email to task', () => {
    // Test email-to-task conversion
  });
});
```

## Deployment Considerations

### Production Environment Setup
- Configure Google Cloud Console project
- Set up OAuth consent screen
- Configure production redirect URIs
- Set up API quotas and monitoring
- Implement secure token storage

### Security Considerations
- Encrypt OAuth tokens at rest
- Implement token rotation
- Add rate limiting for API calls
- Monitor for suspicious activity
- Implement audit logging

### Performance Optimization
- Implement efficient sync strategies
- Add caching for frequently accessed data
- Optimize database queries
- Implement background job processing
- Monitor API usage and costs

## Success Metrics

### Functional Goals

✅ Users can connect Gmail accounts

✅ Users can connect Google Calendar

✅ Emails automatically sync and parse correctly

✅ Tasks can be generated from emails

✅ Calendar events display alongside tasks

✅ Real-time sync indicators and error handling work as intended

✅ Smooth hybrid authentication with JWT + Google OAuth

### Performance Goals

⚡ Efficient API usage to avoid rate limits

⚡ Minimal latency in Gmail and Calendar sync

⚡ Optimized database queries with Supabase

### User Experience Goals

🎯 One-click email → task and event → task conversion

🎯 Clear progress and error feedback

🎯 Seamless onboarding for connecting Google services

🎯 Consistent look and feel across all UI components

## Post-Merge Next Steps

### Code Review & Refactoring
- Ensure coding style consistency
- Remove obsolete files and dependencies
- Consolidate duplicated logic

### Documentation Updates
- Update README with Google integration setup
- Add instructions for OAuth configuration
- Extend developer onboarding guide

### Monitoring & Analytics
- Track Gmail/Calendar sync usage
- Monitor API quotas and error logs
- Add performance metrics (sync times, email parse speed)

### User Feedback Loop
- Collect feedback on Gmail/Calendar usability
- Identify pain points in email-to-task and event-to-task flow
- Prioritize enhancements based on feedback

### Future Extensions
- Explore two-way sync for tasks ↔ Google Calendar
- Enhance email AI parsing with smarter categorization
- Add support for Google Drive integration (optional expansion)

## Final Outcome

✅ **Sentinel will operate as a unified productivity application with Gmail and Calendar seamlessly integrated into its task management system, maintaining architectural integrity while offering advanced, real-world Google service features.**

---

This merge plan ensures a systematic, well-tested integration that enhances Sentinel's capabilities while preserving its modern architecture and user experience.