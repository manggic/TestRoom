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
    -   createdBy ( object ) - ( name , id )
    -   status ( string ) - ( draft / published )
    -   highestScore ( number )
    -   attempts ( number )
    -   totalMarks ( number )
    -   createdAt
    -   updatedAt
    -   lastUpdatedBy ( object ) - ( name , id )

```json
{
    "testName": "Class 10 Science - Cells",
    "description": "This test covers structure and function of cell organelles.",
    "questions": ["q1", "q2", "q3"],
    "durationMinutes": 30,
    "createdBy": {
        "id": "uid_neha123",
        "name": "Neha Sharma"
    },
    "status": "published",
    "highestScore": 19,
    "attempts": 42,
    "totalMarks": 20,
    "createdAt": "2025-06-21T15:00:00.000Z",
    "updatedAt": "2025-06-26T12:30:00.000Z"
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

test these feature
-  create Test
-  Edit Test


Issue 
- data in db is not added in sort format
- fix ts error

feature 
- toast position fix
- while editing we can add question using json format


