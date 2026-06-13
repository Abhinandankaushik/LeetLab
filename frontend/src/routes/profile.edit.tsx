import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { usersApi, type SocialLink } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/empty-state";


export default function EditProfilePage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [skillInput, setSkillInput] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [socials, setSocials] = React.useState<SocialLink[]>([]);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setBio(user.bio || "");
    setCountry(user.country || "");
    setWebsite(user.websiteUrl || "");
    setCompany(user.company || "");
    setJobTitle(user.jobTitle || "");
    setSkills(user.skills || []);
    setSocials(user.socials || []);
    setImagePreview(user.image || null);
  }, [user]);

  if (loading) return <FormSkeleton />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Sign in required</h1>
        <Link to="/login" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.includes(v)) { setSkillInput(""); return; }
    setSkills([...skills, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));
  const addSocial = () => setSocials([...socials, { platform: "GitHub", url: "" }]);
  const updateSocial = (i: number, patch: Partial<SocialLink>) => {
    setSocials(socials.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  };
  const removeSocial = (i: number) => setSocials(socials.filter((_, idx) => idx !== i));

  const onAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("Image must be under 4MB"); return; }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      await usersApi.uploadAvatar(file);
      await refresh();
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err?.message || "Avatar upload failed (backend endpoint may not exist yet)");
    } finally { setUploading(false); }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        name, bio, country, websiteUrl: website, company, jobTitle, skills, socials});
      await refresh();
      toast.success("Profile saved");
      navigate("/profile");
    } catch (e: any) {
      toast.error(e?.message || "Save failed (backend endpoint may not exist yet)");
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 stagger">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground story-link">
        <ArrowLeft className="h-3 w-3" /> back to profile
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Edit Profile</h1>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 hover-glow">
        <div className="flex items-center gap-5">
          {imagePreview ? (
            <img src={imagePreview} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary/30" alt="" />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-primary text-3xl font-bold uppercase text-primary-foreground">
              {(name || user.email).slice(0, 2)}
            </div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarSelect} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} variant="outline" size="sm" disabled={uploading}>
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Upload avatar
            </Button>
            <p className="mt-2 font-mono text-xs text-muted-foreground">PNG / JPG · Max 4MB</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{bio.length}/280</p>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
          <Field label="Website"><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></Field>
          <Field label="Company"><Input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
          <Field label="Job title"><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></Field>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Skills</h2>
        <p className="mt-1 text-sm text-muted-foreground">Add the topics & technologies you know.</p>
        <div className="mt-3 flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="e.g. Dynamic Programming"
          />
          <Button onClick={addSkill} variant="outline"><Plus className="h-3 w-3" /></Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs">
              {s}
              <button onClick={() => removeSkill(s)} className="opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </section>

      {/* Socials */}
      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Social Links</h2>
          <Button onClick={addSocial} variant="outline" size="sm"><Plus className="h-3 w-3" /> add</Button>
        </div>
        <div className="mt-3 space-y-2">
          {socials.length === 0 && <p className="text-sm text-muted-foreground">No socials added yet.</p>}
          {socials.map((s, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={s.platform}
                onChange={(e) => updateSocial(i, { platform: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {["GitHub", "LinkedIn", "Twitter", "Website", "YouTube", "Discord"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <Input value={s.url} onChange={(e) => updateSocial(i, { url: e.target.value })} placeholder="https://..." className="flex-1" />
              <Button onClick={() => removeSocial(i)} variant="ghost" size="icon"><X className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/profile")}>Cancel</Button>
        <Button onClick={onSave} disabled={saving} className="btn-shine">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Save changes
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
