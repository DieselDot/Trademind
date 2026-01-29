import { getJournalEntries } from "./actions";
import { JournalList } from "@/components/journal/journal-list";
import { JournalForm } from "@/components/journal/journal-form";
import { Button } from "@/components/ui/button";

export default async function JournalPage() {
  const { data: entries, error } = await getJournalEntries();

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-destructive">Error loading journal</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your trading journey and document your insights.
          </p>
        </div>
        <JournalForm>
          <Button className="transition-all duration-200 hover:scale-105">
            New Entry
          </Button>
        </JournalForm>
      </div>

      {/* Journal Entries */}
      {entries && entries.length > 0 ? (
        <JournalList entries={entries} />
      ) : (
        <div className="text-center py-12 px-4 rounded-lg border border-dashed">
          <h3 className="text-lg font-semibold">No journal entries yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Start documenting your trading journey. Write about your thoughts, lessons learned, and attach chart screenshots.
          </p>
          <div className="mt-6">
            <JournalForm>
              <Button>Write Your First Entry</Button>
            </JournalForm>
          </div>
        </div>
      )}
    </div>
  );
}
