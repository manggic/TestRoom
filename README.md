-   Users Schema
    -   id - uuid ( string )
    -   name ( string )
    -   email ( string )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )
    -   role ( string ) - ( admin / student / teacher )
    -   attempted_tests_count ( number )
    -   is_active ( boolean )

```json
{
    "id": "01e3587d-562e-4952-9dc7-6642ef682c1f",
    "name": "Aarav Mehta",
    "email": "aarav.mehta@example.com",
    "createdAt": "2025-07-09 17:32:40.934+00",
    "updatedAt": "2025-07-11 18:13:33+00",
    "role": "student",
    "attempted_tests_count": 3,
    "is_active": true
}
```

-   Tests Schema

    -   id
    -   test_name ( string )
    -   description ( string )
    -   duration_minutes ( number )
    -   created_by string (uuid)
    -   status ( string ) - ( draft / published )
    -   highest_score ( number )
    -   attempts ( number )
    -   total_marks ( number )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )
    -   last_updated_by string (uuid)

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

-   Questions Schema

    -   id
    -   question_text ( string )
    -   options ( object ) - { a : "nucleus" }
    -   correct_answer ( string )
    -   marks ( number )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )
    -   test_id ( string ) - uuid

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

-   testAttempts Schema
    -   id
    -   test_id ( string )
    -   student_id ( string )
    -   start_time ( timestamp )
    -   end_time ( timestamp )
    -   status ( string ) - 'completed'
    -   score_achieved ( number )
    -   time_taken_seconds ( number )
    -   total_questions ( number )
    -   answers ( object )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )
    -   correct_answer_count ( number )

```json
{
    "id": "00382d8e-7786-482f-9dd5-b6b2f7e13cf2",
    "test_id": "What is the capital of Australia?",
    "student_id": "d5cbbc05-59b2-4e65-8d2e-526f903851f5",
    "start_time": "2025-07-11 14:59:36.035+00",
    "end_time": "2025-07-11 14:59:36.035+00",
    "created_at": "2025-07-11 14:59:36.035+00",
    "updated_at": "2025-07-11 14:59:36.035+00",
    "score_achieved": 21,
    "total_questions": 10,
    "answers": { "q0": "a", "q1": "c", "q2": "d", "q3": "d", "q4": "c" },
    "status": "completed",
    "time_taken_seconds": 45
}
```


Issue
-  fix ts error

feature

-  toast position fix
-  while editing we can add question using json format

