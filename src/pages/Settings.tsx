import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSettingsData } from "@/hooks/useSettingsData";
import ProfileSection from "@/components/settings/ProfileSection";
import SecuritySection from "@/components/settings/SecuritySection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import PreferencesSection from "@/components/settings/PreferencesSection";

export default function SettingsPage() {
  const { settings, isLoading, isError, update } = useSettingsData();
  if (isLoading) return <div>Loading...</div>;
  if (isError || !settings) return <div className="text-red-600">Failed to load settings.</div>;

  return (
    <Card>
      <CardHeader className="space-y-1.5 p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Settings</CardTitle>
          <p className="text-sm text-muted-foreground">App configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => update.mutate({})}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6 pt-0">
        <section>
          <h3 className="font-semibold mb-2">Profile</h3>
          <ProfileSection
            brandLogoUrl={(settings as any).brandLogoUrl}
            contactEmail={(settings as any).contactEmail}
            contactPhone={(settings as any).contactPhone}
            onUpdate={(p) => update.mutate(p)}
          />
        </section>
        <Separator />
        <section>
          <h3 className="font-semibold mb-2">Security</h3>
          <SecuritySection onChangePassword={async () => { /* no-op */ }} />
        </section>
        <Separator />
        <section>
          <h3 className="font-semibold mb-2">Notifications</h3>
          <NotificationsSection
            emailEnabled={(settings as any).emailEnabled}
            smsEnabled={(settings as any).smsEnabled}
            pushEnabled={(settings as any).pushEnabled}
            onUpdate={(p) => update.mutate(p)}
          />
        </section>
        <Separator />
        <section>
          <h3 className="font-semibold mb-2">Preferences</h3>
          <PreferencesSection
            currency={settings.currency}
            locale={settings.locale}
            theme={settings.theme}
            onUpdate={(p) => update.mutate(p)}
          />
        </section>
        <div>
          <p className="text-xs text-muted-foreground">Changes are saved on blur or selection.</p>
        </div>
      </CardContent>
    </Card>
  );
}


