import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config"; // your Firestore config
import { apiHandler } from "../utils";

type TEST_DATA_TO_CREATE = {
    testName: string;
    durationMinutes: number;
    status: string;
    questions: any;
    createdBy: { id: string; name: string };
};

export async function createTest(testDataToCreate: TEST_DATA_TO_CREATE) {
    try {
        const { testName, durationMinutes, createdBy, questions, status } =
            testDataToCreate;

        // ✅ Dynamically calculate totalMarks
        const totalMarks = (questions || []).reduce(
            (sum, q) => sum + (Number(q.marks) || 0),
            0
        );

        const properData = {
            testName,
            durationMinutes,
            description: "",
            createdBy,
            status,
            highestScore: 0,
            attempts: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            totalMarks, // ✅ dynamic
        };

        // ✅ Add test doc
        const testRef = await addDoc(collection(db, "tests"), properData);

        // ✅ Add questions to subcollection
        const questionsRef = collection(testRef, "questions");
        for (const q of questions || []) {
            await addDoc(questionsRef, {
                ...q,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        console.log("✅ Test and questions added successfully!");
    } catch (error) {
        console.log(error);
        apiHandler(error);
    }
}

export async function getAllTests() {
    try {
        const testsRef = collection(db, "tests");
        const snapshot = await getDocs(testsRef);

        const tests = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const testId = docSnap.id;
                const testData = docSnap.data();

                // Fetch subcollection "questions"
                const questionsRef = collection(
                    db,
                    "tests",
                    testId,
                    "questions"
                );
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
                const questionsRef = collection(
                    db,
                    "tests",
                    testId,
                    "questions"
                );
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
        console.error(
            "🔥 Failed to fetch teacher tests with questions:",
            error
        );
        return [];
    }
}
