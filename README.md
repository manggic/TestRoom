-   Users Schema
    -   name ( string )
    -   email ( string )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )
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

    -   test_name ( string )
    -   questions ( array )
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

-   Questions Schema

    -   question_text ( string )
    -   options ( object ) - { a : "nucleus" }
    -   correct_answer ( string )
    -   marks ( number )
    -   created_at ( timestamp )
    -   updated_at ( timestamp )

-   testAttempts Schema

    -   test_id ( string )
    -   student_id ( string )
    -   start_time ( timestamp )
    -   end_time ( timestamp )
    -   status ( string ) - 'completed'
    -   score_achieved ( number )
    -   time_taken_seconds ( number )
    -   total_questions ( number )
    -   answers
    -   created_at ( timestamp )
    -   updated_at ( timestamp )

test these feature

-   create Test
-   Edit Test

Issue

-   follow proper folder structure with name conventions
-   data in db is not added in sort format
-   fix ts error

feature

-   toast position fix
-   while editing we can add question using json format

-   All api lists

// create a test

-   createTest ( done)

// update test

-   updateTest ( done )

// get all tests from db

-   getTests ( done )

// get a specific test based on id

-   getTestById ( done )

// get all tests created by teacher id

-   getTestsByTeacherId ( done )

// get all users

-   getUsers ( done )

// get a specific user

-   getUserById ( done )

// get all test attempts

-   getTestAttempts ( done )

//

-   getTestAttemptById ( done )

//

-   getTestAttemptsByStudentId ( done )

//

-   getTestAttemptsByTestId ( done )

//

-   submitTestAttempt ( done )

//

-   getTestAttemptsByTestIdAndStudentId ( done )

//

-   getUnattemptedTestsOfStudentId
