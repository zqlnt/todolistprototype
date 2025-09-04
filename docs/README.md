# Sentinel - Smart Productivity Application

## Overview

Sentinel is a modern, intelligent productivity application built with React, TypeScript, and Supabase. It combines traditional task management with AI-powered insights and multi-platform data synchronization.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── lib/                # External service configurations
├── services/           # API service functions
├── types.ts            # TypeScript type definitions
├── store.ts            # Global state management
├── rules.ts            # Business logic and data processing
└── main.tsx           # Application entry point
```

## Core Features

### 1. Authentication System
- **Email/Password Authentication** via Supabase Auth
- **Session Management** with automatic token refresh
- **User Profile** management with persistent storage
- **Protected Routes** - unauthenticated users see login screen

### 2. Task Management
- **Hierarchical Tasks** - Tasks can have unlimited subtasks
- **Smart Categorization** - Tasks organized by categories and time sections
- **Priority System** - Star important tasks for priority filtering
- **Due Date Management** - Tasks with optional due dates and time tracking
- **Status Tracking** - Pending/Done status with visual indicators

### 3. Multi-Platform Integration
- **Email Sync** - Fetch emails and generate task suggestions
- **Calendar Integration** - View tasks alongside calendar events
- **Contact Management** - Store and organize contacts
- **Chat System** - Messaging interface with unread indicators
- **Notifications** - System-wide notification management

### 4. Intelligent Features
- **AI Assistant** - Sentinel AI for productivity insights
- **Task Suggestions** - Auto-generate tasks from emails
- **Smart Grouping** - Organize tasks by time or category
- **Priority Detection** - Automatic priority scoring

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  dueAt timestamptz,
  isStarred boolean DEFAULT false,
  category text,
  parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  inserted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Key Features:
- **Row Level Security (RLS)** - Users can only access their own tasks
- **Hierarchical Structure** - `parent_id` enables subtasks
- **Automatic Timestamps** - `inserted_at` and `updated_at` tracking
- **Cascade Deletion** - Subtasks deleted when parent is deleted

## State Management

### Zustand Store Structure
The application uses Zustand for state management with the following key sections:

#### Data State
- `tasks[]` - All user tasks from database
- `suggestedTasks[]` - AI-generated task suggestions
- `emails[]` - Synced email data
- `contacts[]` - User contacts
- `chats[]` - Chat conversations
- `notifications[]` - System notifications

#### UI State
- `currentPage` - Active page/view
- `sectionFilter` - Task filtering (Today, Tomorrow, etc.)
- `showPriorityOnly` - Priority filter toggle
- `viewMode` - List or grid view
- `taskGroupingMode` - Group by time or category

#### Authentication State
- `session` - Supabase session object
- `user` - Current user data
- `authStatus` - Loading/authenticated/unauthenticated
- `userProfile` - User preferences and profile data

### Persistence
- **Local Storage** - UI preferences and non-sensitive data
- **Supabase** - Tasks, user data, and authentication state
- **Selective Persistence** - Only specific state slices are persisted locally

## Component Architecture

### Page Components
- **Dashboard** - Overview with widgets and quick actions
- **TodoList** - Main task management interface
- **Auth** - Login/signup forms
- **Calendar** - Calendar view with events and tasks
- **Inbox** - Email management and sync
- **SentinelAI** - AI chat interface
- **Contacts** - Contact management
- **Chats** - Messaging interface
- **Notifications** - Notification center
- **Connections** - Brand/service connections

### Shared Components
- **Sidebar** - Navigation and category management
- **Header** - Page title, search, and controls
- **BottomNav** - Mobile navigation
- **TodoCard** - Main task list container
- **TaskItem** - Individual task with subtask support

## Task Hierarchy System

### Parent-Child Relationships
```typescript
interface Task {
  id: string;
  parent_id?: string | null;  // Links to parent task
  // ... other properties
}
```

### Rendering Logic
1. **Top-level tasks** (no `parent_id`) are displayed in main sections
2. **Subtasks** are rendered recursively under their parents
3. **Visual hierarchy** uses indentation and connecting lines
4. **Progress tracking** shows completion ratios for parent tasks

### Subtask Features
- **Independent completion** - Subtasks can be completed separately
- **Nested editing** - Edit subtasks inline
- **Cascade operations** - Deleting parent removes all subtasks
- **Category inheritance** - Subtasks can inherit or override parent category

## Business Logic (rules.ts)

### Task Grouping
```typescript
function groupTasksBySection(tasks: Task[]): Record<TaskSection, Task[]>
function groupTasksByCategory(tasks: Task[]): Record<string, Task[]>
```

### Time-based Sections
- **Today** - Due today or overdue
- **Tomorrow** - Due tomorrow
- **This Week** - Due within 7 days
- **Upcoming** - Due later or no due date

### Sorting Priority
1. **Starred tasks** first
2. **Due date** ascending
3. **Creation date** for tasks without due dates

## API Services

### Task Operations
```typescript
// services/tasks.ts
listTasks()           // Fetch all user tasks
createTask(input)     // Create new task with optional parent
setStatus(id, status) // Update task completion status
toggleStar(id, current) // Toggle task priority
```

### Supabase Integration
- **Automatic user filtering** - RLS ensures data isolation
- **Real-time updates** - Changes sync across sessions
- **Optimistic updates** - UI updates immediately, syncs in background
- **Error handling** - Graceful fallbacks for network issues

## Responsive Design

### Breakpoint Strategy
- **Mobile-first** - Base styles for mobile devices
- **sm:** - Small tablets (640px+)
- **lg:** - Desktop (1024px+)

### Layout Adaptations
- **Sidebar** - Hidden on mobile, persistent on desktop
- **Bottom Navigation** - Mobile only
- **Card sizing** - Responsive max-widths
- **Touch targets** - Larger buttons on mobile

## Security Implementation

### Authentication
- **Supabase Auth** - Industry-standard authentication
- **JWT tokens** - Secure session management
- **Automatic refresh** - Seamless token renewal

### Data Protection
- **Row Level Security** - Database-level access control
- **User isolation** - Users can only access their own data
- **Encrypted transit** - All data encrypted in transmission

## Performance Optimizations

### State Management
- **Selective persistence** - Only necessary data stored locally
- **Optimistic updates** - Immediate UI feedback
- **Efficient re-renders** - Zustand's shallow comparison

### Database Queries
- **Indexed columns** - Fast lookups on user_id and parent_id
- **Selective fetching** - Only fetch necessary columns
- **Batch operations** - Minimize database round trips

## Development Workflow

### File Organization
- **Single responsibility** - Each file has one clear purpose
- **Modular architecture** - Clean separation of concerns
- **TypeScript strict mode** - Full type safety
- **Import/export structure** - Clear dependency management

### Code Quality
- **ESLint configuration** - Consistent code style
- **TypeScript strict mode** - Compile-time error catching
- **Component composition** - Reusable, testable components
- **Error boundaries** - Graceful error handling

## Future Enhancements

### Planned Features
1. **Intelligent Subtask Generation** - Auto-create relevant subtasks
2. **LLM Integration** - Real AI responses in Sentinel AI
3. **Real Email Sync** - Connect to actual email providers
4. **Calendar Sync** - Two-way calendar integration
5. **Collaboration** - Share tasks and projects
6. **Mobile App** - Native iOS/Android applications

### Technical Improvements
- **Offline support** - Work without internet connection
- **Real-time collaboration** - Live updates across users
- **Advanced search** - Full-text search across all data
- **Data export** - Backup and migration tools
- **API endpoints** - RESTful API for third-party integrations

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Modern web browser

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Supabase environment variables
4. Run development server: `npm run dev`
5. Create account and start managing tasks

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

### Code Standards
- Follow TypeScript strict mode
- Use Tailwind for all styling
- Maintain component modularity
- Write descriptive commit messages
- Test authentication flows
- Verify responsive design

### Testing
- Test all authentication flows
- Verify task CRUD operations
- Check responsive layouts
- Validate data persistence
- Test error scenarios
