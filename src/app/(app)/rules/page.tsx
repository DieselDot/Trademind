import { getRules } from "./actions";
import { RulesList } from "@/components/rules/rules-list";

export default async function RulesPage() {
  const { data: rules, error } = await getRules();

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-destructive">Error loading rules</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RulesList initialRules={rules || []} />
    </div>
  );
}
