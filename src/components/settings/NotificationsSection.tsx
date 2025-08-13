import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationsSectionProps {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  onUpdate: (partial: { emailEnabled?: boolean; smsEnabled?: boolean; pushEnabled?: boolean }) => void;
}

export default function NotificationsSection({ emailEnabled, smsEnabled, pushEnabled, onUpdate }: NotificationsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="email">Email Notifications</Label>
        <Switch id="email" checked={!!emailEnabled} onCheckedChange={(v) => onUpdate({ emailEnabled: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="sms">SMS Notifications</Label>
        <Switch id="sms" checked={!!smsEnabled} onCheckedChange={(v) => onUpdate({ smsEnabled: v })} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="push">Push Notifications</Label>
        <Switch id="push" checked={!!pushEnabled} onCheckedChange={(v) => onUpdate({ pushEnabled: v })} />
      </div>
    </div>
  );
}


