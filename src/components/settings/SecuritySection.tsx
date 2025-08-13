import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SecuritySectionProps {
  onChangePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void> | void;
}

export default function SecuritySection({ onChangePassword }: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    try { setSaving(true); await onChangePassword({ currentPassword, newPassword }); } finally { setSaving(false); setCurrentPassword(""); setNewPassword(""); }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="current">Current Password</Label>
        <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="new">New Password</Label>
        <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button onClick={submit} disabled={saving || !currentPassword || !newPassword}>Change Password</Button>
      </div>
    </div>
  );
}


