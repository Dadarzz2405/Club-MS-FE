import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/api/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/api/client";
import { Loader2, Camera, Lock } from "lucide-react";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const handlePfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await profileApi.uploadPicture(file);
      await refreshUser();
      toast({ title: "Profile picture updated" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      await profileApi.changePassword({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword });
      toast({ title: "Password updated" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast({ title: "Error", description: err instanceof ApiError ? err.message : "Failed", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profileApi.getPictureUrl(user.id)}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a7a5c&color=fff&size=80`;
                }}
              />
              <label className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handlePfpUpload} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                {user.class_name && <Badge variant="secondary">{user.class_name}</Badge>}
                {user.pic_name && <Badge variant="secondary">{user.pic_name}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Lock className="h-4 w-4" />Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={pwLoading}>
              {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
