# Database Setup for TestRoom Application

This document explains how to set up the database schema for the TestRoom application in Supabase.

## Prerequisites

1. A Supabase project created
2. Supabase CLI installed (optional, for local development)

## Database Schema

The application uses the following tables:

### 1. Users Table
Stores user profiles and authentication data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Tests Table
Stores test information created by teachers.

```sql
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    attempts INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_by UUID REFERENCES users(id)
);
```

### 3. Questions Table
Stores individual questions for each test.

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- {a: "option1", b: "option2", c: "option3", d: "option4"}
    correct_answer VARCHAR(10) NOT NULL, -- 'a', 'b', 'c', or 'd'
    marks INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Test Attempts Table (NEW)
Stores student test attempts with detailed tracking.

```sql
CREATE TABLE test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE, -- nullable, set when test is completed or timed out
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
    score_achieved INTEGER, -- nullable, calculated when test is completed
    answers JSONB DEFAULT '{}', -- stores student responses as {q0: "a", q1: "b", ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the entire content from `database_schema.sql`**
4. **Run the SQL script**

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

## Key Features of the Schema

### 1. Test Attempt Tracking
- **Start Time**: When student begins the test
- **End Time**: When test is completed or timed out
- **Status**: `in_progress`, `completed`, or `timed_out`
- **Score Achieved**: Calculated score when test is completed
- **Answers**: JSON object storing student responses

### 2. Row Level Security (RLS)
The schema includes comprehensive RLS policies:
- Students can only view their own test attempts
- Teachers can view attempts for tests they created
- Students can only view published tests
- Teachers can create and manage their own tests

### 3. Automatic Timestamps
Triggers automatically update `updated_at` columns when records are modified.

### 4. Performance Indexes
Indexes are created on frequently queried columns for better performance.

## Environment Variables

Make sure to set these environment variables in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## Testing the Setup

After setting up the database:

1. **Create a test user** with role 'teacher'
2. **Create a test** using the teacher dashboard
3. **Create a student user** with role 'student'
4. **Attempt the test** using the student dashboard
5. **Verify** that the test attempt is recorded in the database

## Troubleshooting

### Common Issues

1. **RLS Policies**: Make sure RLS is enabled and policies are correctly applied
2. **Foreign Key Constraints**: Ensure all referenced tables exist before creating foreign keys
3. **JSONB Columns**: Verify that your Supabase instance supports JSONB data type
4. **UUID Extension**: Ensure the `uuid-ossp` extension is enabled for UUID generation

### Verification Queries

Run these queries to verify your setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tests', 'questions', 'test_attempts');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Next Steps

After setting up the database:

1. **Test the application** with different user roles
2. **Monitor performance** using Supabase Analytics
3. **Set up backups** if needed
4. **Configure additional security** policies as required

The database schema is now ready to support the full TestRoom application with proper test attempt tracking and role-based access control. 