import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  brandLogoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  onUpdate: (partial: { brandLogoUrl?: string; contactEmail?: string; contactPhone?: string }) => void;
}

export default function ProfileSection({ brandLogoUrl, contactEmail, contactPhone, onUpdate }: ProfileSectionProps) {
  const [logo, setLogo] = useState<string | undefined>(brandLogoUrl);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const dataUrl = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(f); });
    setLogo(dataUrl); onUpdate({ brandLogoUrl: dataUrl });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label>Brand Logo</Label>
        <div className="mt-2 flex items-center gap-3">
          {logo ? <img src={logo} alt="Brand" className="h-12 w-12 rounded bg-white object-cover border" /> : <div className="h-12 w-12 rounded bg-gray-100 border" />}
          <Input type="file" accept="image/*" onChange={handleLogo} />
        </div>
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input id="contactEmail" defaultValue={contactEmail} onBlur={(e) => onUpdate({ contactEmail: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input id="contactPhone" defaultValue={contactPhone} onBlur={(e) => onUpdate({ contactPhone: e.target.value })} />
      </div>
    </div>
  );
}


