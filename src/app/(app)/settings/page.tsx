import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Configure your TradeMind experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page coming in a future phase. You&apos;ll be able to configure:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>Profile information</li>
            <li>Timezone preferences</li>
            <li>Discipline score goals</li>
            <li>Tilt alert settings</li>
            <li>Notification preferences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
