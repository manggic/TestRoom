import { Button } from "@/components/ui/button";

export function Controls() {
  const handleSave = (status: "Draft" | "Published") => {
  const form = JSON.parse(localStorage.getItem("mcq_form") || "[]");
  const json = JSON.parse(localStorage.getItem("mcq_json") || "[]");
  const testName = (document.getElementById("test-name-input") as HTMLInputElement)?.value;
  const duration = +(document.getElementById("duration") as HTMLInputElement)?.value;
  const questions = [...form, ...json];

  if (!testName) return alert("Please enter test name");
  if (!duration || questions.length === 0) return alert("Please enter duration and at least one question");

  const testData = { name: testName, duration, questions, status };

  // Save to localStorage
  const existingTests = JSON.parse(localStorage.getItem("all_tests") || "[]");
  const updatedTests = [...existingTests, testData];
  localStorage.setItem("all_tests", JSON.stringify(updatedTests));

  alert(`✅ Test saved as ${status}`);
};

 return (
  <div className="mt-6 flex gap-4">
    <Button
      onClick={() => handleSave("Draft")}
      variant="outline"
      className="text-zinc-900 dark:text-white"
    >
      Save as Draft
    </Button>

    <Button
      onClick={() => handleSave("Published")}
      className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white gap-2"
    >
      Publish Test
    </Button>
  </div>
);

}
