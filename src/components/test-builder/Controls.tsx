// src/components/test-builder/Controls.tsx
export function Controls() {
  const handleSave = () => {
    const form = JSON.parse(localStorage.getItem("mcq_form") || "[]");
    const json = JSON.parse(localStorage.getItem("mcq_json") || "[]");
    const testName = (document.getElementById("test-name-input") as HTMLInputElement)?.value;
    const duration = +(document.getElementById("duration") as HTMLInputElement)?.value;

    const questions = [...form, ...json];

    if (!testName) return alert("Please enter test name");
    if (!duration || questions.length === 0) return alert("Please enter duration and at least one question");

    const testData = { name: testName, duration, questions };

    localStorage.setItem("mcq_test", JSON.stringify(testData));
    alert("✅ Test saved successfully!");
  };

  return (
    <button onClick={handleSave} className="mt-6 cursor-pointer w-full bg-blue-600 hover:bg-blue-700  text-white py-2 rounded-md">
      Save Test for Students
    </button>
  );
}
