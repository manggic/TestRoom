import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config"; // your Firestore config



export async function getAllTests() {
  try {
    const testsRef = collection(db, "tests");
    const snapshot = await getDocs(testsRef);

    const tests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const testId = docSnap.id;
        const testData = docSnap.data();

        // Fetch subcollection "questions"
        const questionsRef = collection(db, "tests", testId, "questions");
        const questionsSnap = await getDocs(questionsRef);
        const questions = questionsSnap.docs.map((qDoc) => ({
          id: qDoc.id,
          ...qDoc.data(),
        }));

        return {
          id: testId,
          ...testData,
          questions, // Include questions array
        };
      })
    );

    return tests;
  } catch (error) {
    console.error("🔥 Failed to fetch all tests with questions:", error);
    return [];
  }
}

// export async function getAllTests() {
//     const testsRef = collection(db, "tests");
//     const snapshot = await getDocs(testsRef);

//     const tests = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//     }));

//     return tests;
// }


export async function getMyTest(teacherId: string) {
  try {
    const q = query(
      collection(db, "tests"),
      where("createdBy.id", "==", teacherId)
    );
    const snapshot = await getDocs(q);

    const teacherTests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const testId = docSnap.id;
        const testData = docSnap.data();

        // Fetch questions subcollection
        const questionsRef = collection(db, "tests", testId, "questions");
        const questionsSnap = await getDocs(questionsRef);
        const questions = questionsSnap.docs.map((qDoc) => ({
          id: qDoc.id,
          ...qDoc.data(),
        }));

        return {
          id: testId,
          ...testData,
          questions, // Include questions
        };
      })
    );

    console.log({ teacherTests });
    return teacherTests || [];
  } catch (error) {
    console.error("🔥 Failed to fetch teacher tests with questions:", error);
    return [];
  }
}


// export async function getMyTest(teacherId: string) {
//     const q = query(
//         collection(db, "tests"),
//         where("createdBy.id", "==", teacherId)
//     );
//     const snapshot = await getDocs(q);

//     const teacherTests = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//     }));

//     console.log({ teacherTests });
//     return teacherTests || [];
// }
