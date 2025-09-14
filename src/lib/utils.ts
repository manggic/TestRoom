import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { roles } from "./constants";
import validator from "validator";
import jsPDF from "jspdf";

type ErrorHandler<T = unknown> = {
    success: boolean;
    message: string;
    data: T;
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function errorHandler<T>(error: unknown): ErrorHandler<T> {
    const defaultError = "Something went wrong";
    let errorMessage = "";

    console.log("ERROR occurred ---------- ", error);

    if (error instanceof Error) {
        errorMessage = error.message;
    }

    return {
        success: false,
        message: errorMessage || defaultError,
        data: [] as T,
    };
}

export function handleResponse(data, error) {
    if (error) {
        return {
            success: false,
            message: error,
            data: [],
        };
    } else {
        return {
            success: true,
            data,
        };
    }
}

// export const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//     });
// };

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return `${day} ${month} ${year}, ${time}`;
};

export const validateSignUpForm = (
    formData,
    setErrors,
    additionChecks = { role: false }
) => {
    const newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (!formData.name.trim()) {
        newErrors.name = "Name is required";
        isValid = false;
    }

    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
        newErrors.email = "Invalid email address";
        isValid = false;
    }

    if (!formData.password) {
        newErrors.password = "Password is required";
        isValid = false;
    } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
    }

    if (additionChecks.role) {
        if (!formData.role || !roles.includes(formData.role)) {
            newErrors.password = "Role is invalid";
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
};

export const validateOrgRegistration = ({ formData }) => {
    const {
        password,
        owner_name,
        email,
    } = formData;

    // Initialize response object
    const response = {
        isValid: true,
        message: "",
    };

  


    if (
        !owner_name ||
        typeof owner_name !== "string" ||
        owner_name.trim().length === 0
    ) {
        response.isValid = false;
        response.message = "Owner name is required";
        return response;
    }

    if (!email || !validator.isEmail(email)) {
        response.isValid = false;
        response.message = "Invalid email address";
        return response;
    }

    const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password || !strongPasswordRegex.test(password)) {
    response.isValid = false;
    response.message =
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (@ $ ! % * ? &).";
    return response;
  }

    // All validations passed
    return response;
};

export const downloadPDF = ({
    data, // testData or attempt
    answers, // answers object { q0: 'a', q1: 'b' }
    currentUser, // current logged in user object
    timeLeft = 0, // remaining seconds
    logoBase64 = "", // optional logo in base64
}) => {
    console.log({ timeLeft });

    if (!data) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;
    let y = 60;
    let total = 0,
        obtained = 0,
        correctCount = 0;

    // ===== Watermark =====
    doc.setTextColor(230);
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45,
    });
    doc.setTextColor(0);

    // ===== Logo =====
    // if (logoBase64) {
    //     doc.addImage(logoBase64, "PNG", margin, 20, 50, 50);
    //     y += 10;
    // }

    // ===== Header =====
    doc.setFont("helvetica", "bold").setFontSize(20);
    doc.text(
        `${data.test_name} - Result Summary`,
        margin + (logoBase64 ? 60 : 0),
        y
    );
    y += 26;
    doc.setFontSize(12).setFont("helvetica", "normal");
    doc.text(`Student: ${currentUser?.user?.name || ""}`, margin, y);
    y += 18;
    doc.text(`Test Duration: ${data.duration_minutes} min`, margin, y);
    y += 18;
    doc.text(`Total Questions: ${data.questions.length}`, margin, y);
    y += 18;
    const now = new Date();
    doc.text(
        `Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        margin,
        y
    );
    y += 20;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    // ===== Summary Stats =====
    data.questions.forEach((q, i) => {
        const selected = answers[`q${i}`];
        const correct = q.correct_answer;
        const marks = selected === correct ? q.marks : 0;
        total += q.marks;
        obtained += marks;
        if (selected === correct) correctCount++;
    });
    const mins = Math.floor((data.duration_minutes * 60 - timeLeft) / 60);
    const secs = (data.duration_minutes * 60 - timeLeft) % 60;

    doc.setFont("helvetica", "bold");
    doc.text(`Score: ${obtained} / ${total}`, margin, y);
    doc.text(
        `Correct: ${correctCount} / ${data.questions.length}`,
        margin + 180,
        y
    );
    doc.text(`Time: ${mins}m ${secs}s`, margin + 350, y);
    y += 20;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    // ===== Table Header =====
    const colQ = margin + 2;
    const colQuestion = margin + 30;
    const colYour = margin + 230;
    const colCorrect = margin + 370;
    const colMarks = margin + 500;
    const rowHeight = 18;

    doc.setFont("helvetica", "bold");
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y - 12, pageWidth - margin * 2, rowHeight, "F");
    doc.text("Q#", colQ, y);
    doc.text("Question", colQuestion, y);
    doc.text("Your Answer", colYour, y);
    doc.text("Correct", colCorrect, y);
    doc.text("Marks", colMarks, y);
    y += rowHeight;
    doc.setFont("helvetica", "normal");

    // ===== Table Rows =====
    data.questions.forEach((q, i) => {
        const selected = answers[`q${i}`];
        const correct = q.correct_answer;
        const marks = selected === correct ? q.marks : 0;
        const yourAns =
            selected && q.options[selected]
                ? `${selected.toUpperCase()}. ${q.options[selected]}`
                : "Not Answered";
        const correctAns =
            correct && q.options[correct]
                ? `${correct.toUpperCase()}. ${q.options[correct]}`
                : "";
        const markStr = marks > 0 ? `+${marks}` : "0";

        const questionLines = doc.splitTextToSize(
            q.question_text,
            colYour - colQuestion - 10
        );
        const maxLines = Math.max(1, questionLines.length);

        // Row background
        if (selected === correct) doc.setFillColor(220, 255, 220);
        else if (selected) doc.setFillColor(255, 220, 220);
        else doc.setFillColor(240, 240, 240);

        doc.rect(
            margin,
            y - 12,
            pageWidth - margin * 2,
            rowHeight * maxLines,
            "F"
        );

        doc.text(`${i + 1}`, colQ, y);
        doc.text(questionLines, colQuestion, y);
        doc.text(
            doc.splitTextToSize(yourAns, colCorrect - colYour - 10),
            colYour,
            y
        );
        doc.text(
            doc.splitTextToSize(correctAns, colMarks - colCorrect - 10),
            colCorrect,
            y
        );
        doc.text(markStr, colMarks, y);

        y += rowHeight * maxLines;

        // Row separator
        doc.setDrawColor(200);
        doc.line(margin, y - 12, pageWidth - margin, y - 12);

        // Page break
        if (y > pageHeight - 80) {
            doc.setFontSize(10).setTextColor(120);
            doc.text(
                `Page ${doc.internal.getNumberOfPages()}`,
                pageWidth / 2,
                pageHeight - 20,
                { align: "center" }
            );
            doc.addPage();
            y = 60;
            doc.setFontSize(12).setTextColor(0);
        }
    });

    // ===== Footer =====
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Marks: ${obtained} / ${total}`, margin, y);

    const finalPageNum = doc.internal.getNumberOfPages();
    doc.setFontSize(10).setTextColor(120);
    doc.text(`Page ${finalPageNum}`, pageWidth / 2, pageHeight - 20, {
        align: "center",
    });

    doc.save(`${data.test_name}-Result.pdf`);
};

// TODO: Replace all Firestore logic with Supabase equivalents if needed.
