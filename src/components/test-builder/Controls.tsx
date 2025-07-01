import { Button } from "@/components/ui/button";

export function Controls({ handleSave }) {
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
