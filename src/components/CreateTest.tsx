// src/components/createTest.tsx
import { useEffect, useState } from "react";
import { FormInput } from "./test-builder/FormInput";
import { ModeToggle } from "./test-builder/ModeToggle";
import { QuestionPreview } from "./test-builder/QuestionPreview";
import { Controls } from "./test-builder/Controls";
import { JsonInput } from "./test-builder/JsonInput";

export default function CreateTest() {
    const [theme, setTheme] = useState("light");
    const [useJSON, setUseJSON] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    return (
        <div className="min-h-screen px-4 py-8 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Create MCQ Test</h2>
                    <ModeToggle theme={theme} setTheme={setTheme} />
                </div>

                <div className="flex justify-between gap-6 mb-6">
                    <div className="flex items-center">
                        <label className="block font-medium mb-1">
                            Total Test Time (minutes)
                        </label>
                        <input
                            type="number"
                            id="duration"
                            className="border rounded-md px-3 ml-1 py-2 bg-white dark:bg-zinc-700"
                            placeholder="e.g. 10"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">JSON Mode</span>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={!useJSON}
                            onClick={() => setUseJSON((prev) => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                useJSON ? "bg-gray-300" : "bg-blue-600"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    useJSON ? "translate-x-1" : "translate-x-6"
                                }`}
                            />
                        </button>

                        <span className="text-sm font-medium">Form Mode</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block font-medium mb-1">
                        Enter Test Name
                    </label>
                    <input
                        type="text"
                        id="test-name-input"
                        className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
                        placeholder="e.g. Science Test"
                    />
                </div>

                {useJSON ? <JsonInput /> : <FormInput />}

                <QuestionPreview />

                <Controls />
            </div>
        </div>
    );
}
