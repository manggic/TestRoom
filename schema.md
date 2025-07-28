# 🧩 Database Schema – Test Room

This document describes the Supabase schema structure for the **Test Room** project.

---

## 👤 Users

Stores all user accounts across different roles (admin, teacher, student).

### Fields

- `id`: `uuid` – Unique user ID
- `name`: `string` – Full name
- `email`: `string` – Unique email address
- `created_at`: `timestamp`
- `updated_at`: `timestamp`
- `role`: `string` – One of: `admin`, `student`, `teacher`
- `attempted_tests_count`: `number` – How many tests the student has attempted
- `is_active`: `boolean` – Whether the account is currently active

### Example

```json
{
  "id": "01e3587d-562e-4952-9dc7-6642ef682c1f",
  "name": "Aarav Mehta",
  "email": "aarav.mehta@example.com",
  "created_at": "2025-07-09 17:32:40.934+00",
  "updated_at": "2025-07-11 18:13:33+00",
  "role": "student",
  "attempted_tests_count": 3,
  "is_active": true
}
````

---

## 📝 Tests

Represents MCQ tests created by teachers.

### Fields

* `id`: `uuid` – Unique test ID
* `test_name`: `string`
* `description`: `string`
* `duration_minutes`: `number` – Duration of the test
* `created_by`: `uuid` – User ID of the test creator
* `status`: `string` – One of: `draft`, `published`
* `highest_score`: `number`
* `attempts`: `number` – Total number of attempts on the test
* `total_marks`: `number`
* `created_at`: `timestamp`
* `updated_at`: `timestamp`
* `last_updated_by`: `uuid` – User ID of last editor

### Example

```json
{
  "id": "d5cbbc05-59b2-4e65-8d2e-526f903851f5",
  "test_name": "Maths",
  "description": "",
  "duration_minutes": 20,
  "created_by": "a267d7b1-03ca-4675-b1a6-8ff957529297",
  "status": "published",
  "highest_score": 30,
  "attempts": 2,
  "total_marks": 40,
  "created_at": "2025-07-11 14:59:36.035+00",
  "updated_at": "2025-07-11 14:59:36.035+00",
  "last_updated_by": "a267d7b1-03ca-4675-b1a6-8ff957529297"
}
```

---

## ❓ Questions

Holds the actual MCQ questions associated with each test.

### Fields

* `id`: `uuid`
* `question_text`: `string`
* `options`: `object` – Options in key-value format (a, b, c, d)
* `correct_answer`: `string` – e.g. `a`, `b`, `c`, `d`
* `marks`: `number`
* `created_at`: `timestamp`
* `updated_at`: `timestamp`
* `test_id`: `uuid` – Reference to related test

### Example

```json
{
  "id": "00382d8e-7786-482f-9dd5-b6b2f7e13cf2",
  "question_text": "What is the capital of Australia?",
  "options": {
    "a": "Sydney",
    "b": "Melbourne",
    "c": "Canberra",
    "d": "Perth"
  },
  "marks": 2,
  "correct_answer": "c",
  "created_at": "2025-07-11 14:59:36.035+00",
  "updated_at": "2025-07-11 14:59:36.035+00",
  "test_id": "d5cbbc05-59b2-4e65-8d2e-526f903851f5"
}
```

---

## 📊 Test Attempts

Tracks each test attempt made by a student.

### Fields

* `id`: `uuid`
* `test_id`: `uuid`
* `student_id`: `uuid`
* `start_time`: `timestamp`
* `end_time`: `timestamp`
* `status`: `string` – e.g. `completed`
* `score_achieved`: `number`
* `time_taken_seconds`: `number`
* `total_questions`: `number`
* `correct_answer_count`: `number`
* `answers`: `object` – Mapping of question keys to selected answers
* `created_at`: `timestamp`
* `updated_at`: `timestamp`

### Example

```json
{
  "id": "00382d8e-7786-482f-9dd5-b6b2f7e13cf2",
  "test_id": "d5cbbc05-59b2-4e65-8d2e-526f903851f5",
  "student_id": "01e3587d-562e-4952-9dc7-6642ef682c1f",
  "start_time": "2025-07-11 14:59:36.035+00",
  "end_time": "2025-07-11 14:59:36.035+00",
  "created_at": "2025-07-11 14:59:36.035+00",
  "updated_at": "2025-07-11 14:59:36.035+00",
  "score_achieved": 21,
  "total_questions": 10,
  "correct_answer_count": 6,
  "answers": {
    "q0": "a",
    "q1": "c",
    "q2": "d",
    "q3": "d",
    "q4": "c"
  },
  "status": "completed",
  "time_taken_seconds": 45
}
```

---

## ✅ Notes

* All foreign key relationships are **by UUID**.
* Timestamps are stored in UTC with timezone offset.
* All test logic (scoring, attempt limits, validation) is handled in the frontend/backend layer, not enforced directly by the schema.

