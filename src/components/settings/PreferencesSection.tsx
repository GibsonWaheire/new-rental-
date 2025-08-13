import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppSettings } from "@/types/entities";

interface PreferencesSectionProps {
  currency: string;
  locale: string;
  theme: AppSettings["theme"];
  onUpdate: (partial: Partial<Pick<AppSettings, "currency" | "locale" | "theme">>) => void;
}

export default function PreferencesSection({ currency, locale, theme, onUpdate }: PreferencesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" defaultValue={currency} onBlur={(e) => onUpdate({ currency: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="locale">Locale</Label>
        <Input id="locale" defaultValue={locale} onBlur={(e) => onUpdate({ locale: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="theme">Theme</Label>
        <Select defaultValue={theme} onValueChange={(v) => onUpdate({ theme: v as AppSettings["theme"] })}>
          <SelectTrigger id="theme"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


