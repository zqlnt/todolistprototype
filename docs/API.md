# Sentinel API Documentation

## Overview

This document describes the FastAPI backend API for the Sentinel productivity application. The API provides endpoints for user authentication, task management, email synchronization, and more.

## Base URL

- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-backend-domain.com/api`

## Authentication

The API uses JWT (JSON Web Token) based authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

### Token Management
- Tokens are obtained through the `/auth/signin` or `/auth/signup` endpoints
- Tokens should be included in all subsequent API requests
- Tokens expire and need to be refreshed (handled automatically by the frontend)

## API Documentation

### Interactive Documentation
With the FastAPI backend running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Authentication Endpoints

### Sign In
```http
POST /api/auth/signin
```

Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Authentication successful
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Invalid request format

### Sign Up
```http
POST /api/auth/signup
```

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "newuser@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Registration successful
- `400 Bad Request` - Registration failed (email already exists, invalid format, etc.)

### Sign Out
```http
POST /api/auth/signout
```

Sign out the current user (invalidate session).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

**Status Codes:**
- `200 OK` - Sign out successful
- `401 Unauthorized` - Invalid or missing token

### Get User
```http
GET /api/auth/user?token=<jwt_token>
```

Get user information from a JWT token.

**Query Parameters:**
- `token` (string, required) - JWT token to validate

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Token valid, user information returned
- `401 Unauthorized` - Invalid token

## Task Management Endpoints

### List Tasks
```http
GET /api/tasks/
```

Get all tasks for the authenticated user.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "user_id": "user-uuid",
      "title": "Complete project proposal",
      "status": "pending",
      "dueAt": "2024-01-15T10:00:00Z",
      "isStarred": true,
      "category": "Work",
      "parentId": null,
      "inserted_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": null
}
```

**Status Codes:**
- `200 OK` - Tasks retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Database error

### Create Task
```http
POST /api/tasks/
```

Create a new task for the authenticated user.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New task title",
  "dueAt": "2024-01-15T10:00:00Z",
  "isStarred": false,
  "category": "Personal",
  "parentId": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-task-uuid",
    "user_id": "user-uuid",
    "title": "New task title",
    "status": "pending",
    "dueAt": "2024-01-15T10:00:00Z",
    "isStarred": false,
    "category": "Personal",
    "parentId": null,
    "inserted_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Task created successfully"
}
```

**Status Codes:**
- `200 OK` - Task created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Database error

### Update Task
```http
PUT /api/tasks/{task_id}
```

Update an existing task.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `task_id` (string, required) - UUID of the task to update

**Request Body:**
```json
{
  "title": "Updated task title",
  "status": "done",
  "dueAt": "2024-01-16T10:00:00Z",
  "isStarred": true,
  "category": "Work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "user_id": "user-uuid",
    "title": "Updated task title",
    "status": "done",
    "dueAt": "2024-01-16T10:00:00Z",
    "isStarred": true,
    "category": "Work",
    "parentId": null,
    "inserted_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Task updated successfully"
}
```

**Status Codes:**
- `200 OK` - Task updated successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Database error

### Delete Task
```http
DELETE /api/tasks/{task_id}
```

Delete a task and all its subtasks.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id` (string, required) - UUID of the task to delete

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Task deleted successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Database error

### Toggle Task Status
```http
PUT /api/tasks/{task_id}/status
```

Toggle a task's completion status between 'pending' and 'done'.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id` (string, required) - UUID of the task to toggle

**Response:**
```json
{
  "success": true,
  "message": "Task status updated to done"
}
```

**Status Codes:**
- `200 OK` - Status toggled successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Database error

### Toggle Task Star
```http
PUT /api/tasks/{task_id}/star
```

Toggle a task's priority star status.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id` (string, required) - UUID of the task to toggle

**Response:**
```json
{
  "success": true,
  "message": "Task starred"
}
```

**Status Codes:**
- `200 OK` - Star status toggled successfully
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Database error

## Email Integration Endpoints

### Get Emails
```http
GET /api/emails/
```

Get user's emails (currently returns mock data).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "email-uuid",
    "subject": "Your BA Flight BA143 – London→Dubai – 2 Sep 12:40",
    "body": "Flight confirmation for BA143 departing London Heathrow...",
    "received_at": "2024-01-01T10:00:00Z",
    "sender": "British Airways <noreply@britishairways.com>",
    "recipient": "user@example.com"
  }
]
```

**Status Codes:**
- `200 OK` - Emails retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Service error

### Sync Emails
```http
POST /api/emails/sync
```

Sync emails and generate task suggestions.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "email-uuid",
      "subject": "Flight Confirmation",
      "body": "Your flight is confirmed...",
      "received_at": "2024-01-01T10:00:00Z",
      "sender": "airline@example.com",
      "recipient": "user@example.com"
    }
  ],
  "suggestions": [
    {
      "id": "suggestion-uuid",
      "title": "Check in for flight BA143",
      "dueAt": "2024-01-02T12:00:00Z",
      "category": "Travel",
      "linkedEmailId": "email-uuid",
      "emailSubject": "Flight Confirmation"
    }
  ],
  "message": "Synced 4 emails, found 3 suggestions"
}
```

**Status Codes:**
- `200 OK` - Sync completed successfully
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Sync failed

### Get Email Suggestions
```http
GET /api/emails/suggestions
```

Get task suggestions generated from emails.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "suggestion-uuid",
    "title": "Check in for flight BA143",
    "dueAt": "2024-01-02T12:00:00Z",
    "category": "Travel",
    "linkedEmailId": "email-uuid",
    "emailSubject": "Flight Confirmation"
  }
]
```

**Status Codes:**
- `200 OK` - Suggestions retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Service error

## Data Models

### User Model
```typescript
interface User {
  id: string;           // UUID
  email: string;        // Email address
  created_at: string;   // ISO datetime string
}
```

### Task Model
```typescript
interface Task {
  id: string;                    // UUID primary key
  user_id: string;              // Foreign key to user
  title: string;                // Task description
  status: 'pending' | 'done';   // Completion status
  dueAt?: string | null;        // ISO datetime string
  isStarred: boolean;           // Priority flag
  category?: string | null;     // Category/folder
  parentId?: string | null;     // Parent task for subtasks
  inserted_at: string;          // Creation timestamp
  updated_at: string;           // Last modified timestamp
}
```

### Email Model
```typescript
interface Email {
  id: string;           // UUID
  subject: string;      // Email subject line
  body: string;         // Email content
  received_at: string;  // ISO datetime string
  sender?: string;      // Sender email address
  recipient?: string;   // Recipient email address
}
```

### Suggested Task Model
```typescript
interface SuggestedTask {
  id: string;                   // UUID
  title: string;                // Suggested task title
  dueAt?: string;              // Suggested due date
  category?: string;           // Suggested category
  linkedEmailId?: string;      // Source email ID
  emailSubject?: string;       // Source email subject
}
```

## Error Handling

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

#### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully

#### Client Error Codes
- `400 Bad Request` - Invalid request format or data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

#### Server Error Codes
- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - Service temporarily unavailable

### Error Examples

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "detail": "Invalid authentication credentials"
}
```

**Not Found Error (404):**
```json
{
  "detail": "Task not found"
}
```

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production deployments.

**Future Implementation:**
- 100 requests per minute per user for authenticated endpoints
- 10 requests per minute per IP for authentication endpoints

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)

For production, update the CORS origins in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Request/Response Examples

### Complete Task Creation Flow

1. **Authenticate User:**
```bash
curl -X POST "http://localhost:8000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

2. **Create Task:**
```bash
curl -X POST "http://localhost:8000/api/tasks/" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "dueAt": "2024-01-15T17:00:00Z",
    "isStarred": true,
    "category": "Work"
  }'
```

3. **Update Task Status:**
```bash
curl -X PUT "http://localhost:8000/api/tasks/{task_id}/status" \
  -H "Authorization: Bearer <jwt_token>"
```

### Email Sync Flow

1. **Sync Emails:**
```bash
curl -X POST "http://localhost:8000/api/emails/sync" \
  -H "Authorization: Bearer <jwt_token>"
```

2. **Create Task from Suggestion:**
```bash
curl -X POST "http://localhost:8000/api/tasks/" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Check in for flight BA143",
    "dueAt": "2024-01-02T12:00:00Z",
    "category": "Travel"
  }'
```

## Development and Testing

### Using Swagger UI

1. Start the FastAPI backend: `python backend/run.py`
2. Open `http://localhost:8000/docs` in your browser
3. Click "Authorize" and enter a JWT token (obtain from `/auth/signin`)
4. Test endpoints interactively

### Using curl

**Get all tasks:**
```bash
curl -X GET "http://localhost:8000/api/tasks/" \
  -H "Authorization: Bearer <jwt_token>"
```

**Create a subtask:**
```bash
curl -X POST "http://localhost:8000/api/tasks/" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research competitors",
    "parentId": "parent-task-uuid",
    "category": "Work"
  }'
```

### Testing with Python

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api"

# Authenticate
auth_response = requests.post(f"{BASE_URL}/auth/signin", json={
    "email": "user@example.com",
    "password": "password123"
})
token = auth_response.json()["access_token"]

# Headers for authenticated requests
headers = {"Authorization": f"Bearer {token}"}

# Create task
task_response = requests.post(f"{BASE_URL}/tasks/", 
    headers=headers,
    json={
        "title": "Test task from Python",
        "isStarred": True
    }
)
print(task_response.json())

# List tasks
tasks_response = requests.get(f"{BASE_URL}/tasks/", headers=headers)
print(tasks_response.json())
```

## Security Considerations

### Authentication Security
- JWT tokens are validated on every protected endpoint
- Tokens are issued by Supabase Auth with proper expiration
- No sensitive data is stored in JWT payload

### Data Security
- All database queries are filtered by authenticated user ID
- Row Level Security (RLS) enforced at database level
- Input validation performed by Pydantic models
- SQL injection prevented by parameterized queries

### API Security
- CORS properly configured for allowed origins
- Request size limits enforced
- Error messages don't leak sensitive information
- HTTPS required in production

## Future Enhancements

### Planned API Features
- **Real-time WebSocket endpoints** for live updates
- **File upload endpoints** for task attachments
- **Bulk operations** for multiple tasks
- **Advanced filtering** with query parameters
- **API versioning** for backward compatibility
- **Rate limiting** for production use
- **Caching** for improved performance

### Integration Endpoints
- **Calendar sync** endpoints for external calendar providers
- **Email provider** integration (Gmail, Outlook)
- **AI chat** endpoints for LLM integration
- **Webhook** endpoints for external service notifications

This comprehensive API documentation provides all the information needed to integrate with the Sentinel FastAPI backend, from basic authentication through advanced task management and email synchronization features.