import { Button } from "@/components/ui/button";

type ControlsProps = {
    handleSave: (status: "draft" | "published") => Promise<void>;
};

export function Controls({ handleSave }: ControlsProps) {
    return (
        <div className="mt-6 flex gap-4">
            {/* <Button
                onClick={() => handleSave("Draft")}
                variant="outline"
                className="text-zinc-900 dark:text-white"
            >
                Save as Draft
            </Button> */}

            <Button
                onClick={() => handleSave("published")}
                className="bg-zinc-900 cursor-pointer hover:bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white gap-2"
            >
                Publish Test
            </Button>
        </div>
    );
}
