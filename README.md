-   Users Schema
    -   name ( string )
    -   email ( string )
    -   createdAt
    -   updatedAt
    -   role ( string ) - ( admin / student / teacher )
    -   attemptedTests ( number )
    -   isActive ( boolean )

```json
{
    "name": "Aarav Mehta",
    "email": "aarav.mehta@example.com",
    "createdAt": "2025-06-20T10:30:00.000Z",
    "updatedAt": "2025-06-29T18:45:00.000Z",
    "role": "student",
    "attemptedTests": 3,
    "isActive": true
}
```

-   Tests Schema
    -   testName ( string )
    -   questions ( array )
    -   description ( string )
    -   durationMinutes ( number )
    -   createdBy string (uuid)
    -   status ( string ) - ( draft / published )
    -   highestScore ( number )
    -   attempts ( number )
    -   totalMarks ( number )
    -   createdAt
    -   updatedAt
    -   lastUpdatedBy string (uuid)

```json
{
    "testName": "Class 10 Science - Cells",
    "description": "This test covers structure and function of cell organelles.",
    "questions": ["q1", "q2", "q3"],
    "durationMinutes": 30,
    "createdBy": "uid_neha123",  
    "status": "published",
    "highestScore": 19,
    "attempts": 42,
    "totalMarks": 20,
    "createdAt": "2025-06-21T15:00:00.000Z",
    "updatedAt": "2025-06-26T12:30:00.000Z",
    "lastUpdatedBy":"uid_sahu123",
}
```

-   Questions Schema
    -   questionText ( string )
    -   options ( object ) - { a : "nucleus" }
    -   correctAnswer ( string )
    -   marks ( number )
    -   createdAt
    -   updatedAt

```json
{
    "questionText": "Which organelle is known as the powerhouse of the cell?",
    "options": {
        "a": "Nucleus",
        "b": "Mitochondria",
        "c": "Ribosome",
        "d": "Chloroplast"
    },
    "correctAnswer": "b",
    "marks": 2,
    "createdAt": "2025-06-21T15:10:00.000Z",
    "updatedAt": "2025-06-21T15:10:00.000Z"
}
```

- testAttempts Schema

  - test_id ( string )
  - student_id ( string )
  - start_time ( timestamp )
  - end_time ( timestamp )
  - status ( string ) -  'completed' 
  - score_achieved ( number )
  - time_taken_seconds ( number )
  - total_questions ( number )
  - answers 
  - created_at ( timestamp )
  - updated_at ( timestamp )



test these feature
-  create Test
-  Edit Test





Issue  
- follow proper folder structure with name conventions
- data in db is not added in sort format
- fix ts error

feature 
- toast position fix
- while editing we can add question using json format




