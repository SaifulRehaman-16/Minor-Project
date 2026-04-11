import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, FileText, Camera, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setForm({
            display_name: data.display_name || "",
            phone: data.phone || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          });
        } else {
          // Profile doesn't exist yet, pre-fill from auth metadata
          setForm((f) => ({
            ...f,
            display_name: (user?.user_metadata?.full_name as string) || "",
            avatar_url: (user?.user_metadata?.avatar_url as string) || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: form.display_name.trim(),
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          avatar_url: form.avatar_url.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Also update auth user metadata for immediate sync across the app
      await supabase.auth.updateUser({
        data: { full_name: form.display_name.trim() }
      });

      toast({ title: t('profile.success_title'), description: t('profile.success_desc') });
    } catch (error) {
      console.error(error);
      toast({ title: t('profile.error_title'), description: t('profile.error_desc'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avatarUrl = form.avatar_url || (user?.user_metadata?.avatar_url as string | undefined);
  const initials = (form.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto max-w-xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            {t('profile.account')}
          </span>
          <h1 className="mb-3 font-display text-4xl font-bold text-foreground">
            {t('profile.edit_title')}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSave}
          className="card-travel space-y-8"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={form.display_name}
                  className="h-24 w-24 rounded-full border-4 border-primary/20 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* Display Name */}
          <div>
            <Label className="mb-2 flex items-center gap-2 font-body text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" /> {t('profile.display_name')}
            </Label>
            <Input
              placeholder={t('profile.name_placeholder')}
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label className="mb-2 flex items-center gap-2 font-body text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" /> {t('profile.email')}
            </Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="mb-2 flex items-center gap-2 font-body text-sm font-medium text-foreground">
              <Phone className="h-4 w-4 text-primary" /> {t('profile.phone')}
            </Label>
            <Input
              placeholder={t('profile.phone_placeholder')}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Bio */}
          <div>
            <Label className="mb-2 flex items-center gap-2 font-body text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-primary" /> {t('profile.bio')}
            </Label>
            <Textarea
              placeholder={t('profile.bio_placeholder')}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="min-h-[100px] bg-background"
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="btn-hero w-full !rounded-xl disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('profile.saving_btn')}</>
            ) : (
              <><Save className="mr-2 h-5 w-5" /> {t('profile.save_btn')}</>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default Profile;
