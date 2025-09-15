# API Documentation

This document describes the REST API endpoints for the Sentinel Todo App.

## Base URL

- **Production**: `https://todolistprototype.onrender.com/api`
- **Development**: `http://localhost:8000/api`

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Sign Out
```http
POST /auth/signout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

### Tasks

#### List Tasks
```http
GET /tasks/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_id",
      "user_id": "user_id",
      "title": "Task title",
      "status": "pending",
      "dueAt": "2024-01-01T00:00:00Z",
      "isStarred": false,
      "category": "Work",
      "parent_id": null,
      "inserted_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Tasks retrieved successfully"
}
```

#### Create Task
```http
POST /tasks/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New task",
  "dueAt": "2024-01-01T00:00:00Z",
  "category": "Work",
  "isStarred": false,
  "parentId": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "user_id": "user_id",
    "title": "New task",
    "status": "pending",
    "dueAt": "2024-01-01T00:00:00Z",
    "isStarred": false,
    "category": "Work",
    "parent_id": null,
    "inserted_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Task created successfully"
}
```

#### Update Task
```http
PUT /tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "done",
  "dueAt": "2024-01-02T00:00:00Z",
  "isStarred": true,
  "category": "Personal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "user_id": "user_id",
    "title": "Updated task title",
    "status": "done",
    "dueAt": "2024-01-02T00:00:00Z",
    "isStarred": true,
    "category": "Personal",
    "parent_id": null,
    "inserted_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Task updated successfully"
}
```

#### Delete Task
```http
DELETE /tasks/{task_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully"
}
```

### Categories

#### List Categories
```http
GET /categories/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category_id",
      "user_id": "user_id",
      "name": "Work",
      "color": "#3B82F6",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Categories retrieved successfully"
}
```

#### Create Category
```http
POST /categories/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Category",
  "color": "#FF5733"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "category_id",
    "user_id": "user_id",
    "name": "New Category",
    "color": "#FF5733",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Category created successfully"
}
```

#### Update Category
```http
PUT /categories/{category_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Category",
  "color": "#00FF00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "category_id",
    "user_id": "user_id",
    "name": "Updated Category",
    "color": "#00FF00",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  "message": "Category updated successfully"
}
```

#### Delete Category
```http
DELETE /categories/{category_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Category deleted successfully"
}
```

### Emails

#### Sync Emails
```http
POST /emails/sync
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": "email_id",
      "subject": "Email subject",
      "body": "Email body content",
      "received_at": "2024-01-01T00:00:00Z"
    }
  ],
  "suggestions": [
    {
      "id": "suggestion_id",
      "title": "Suggested task",
      "dueAt": "2024-01-01T00:00:00Z",
      "category": "Work",
      "linkedEmailId": "email_id",
      "emailSubject": "Email subject"
    }
  ],
  "message": "Emails synced successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Data Models

### Task
```typescript
interface Task {
  id: string;
  user_id: string;
  title: string;
  status: 'pending' | 'done';
  dueAt?: string | null;
  isStarred: boolean;
  category?: string | null;
  parent_id?: string | null;
  inserted_at: string;
  updated_at: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 5 requests per minute per IP
- **Other endpoints**: 100 requests per minute per user

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://todolistprototype-henna.vercel.app` (production)

## Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "sentinel-api"
}
```

### Example cURL Commands

#### Sign In
```bash
curl -X POST https://todolistprototype.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### Create Task
```bash
curl -X POST https://todolistprototype.onrender.com/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "New task", "category": "Work"}'
```

#### List Tasks
```bash
curl -X GET https://todolistprototype.onrender.com/api/tasks/ \
  -H "Authorization: Bearer <token>"
```

## SDK Usage

The frontend uses a custom API service (`src/services/api.ts`) that handles:
- Authentication token management
- Request/response formatting
- Error handling
- Fallback mechanisms

Example usage:
```typescript
import { apiService } from './services/api';

// Set authentication token
apiService.setToken('your_jwt_token');

// Create a task
const task = await apiService.createTask({
  title: 'New task',
  category: 'Work'
});

// List tasks
const tasks = await apiService.getTasks();
```

---

This API provides a complete backend for the Sentinel Todo App with proper authentication, data validation, and error handling.
