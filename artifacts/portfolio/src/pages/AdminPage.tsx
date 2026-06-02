import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Save, RotateCcw, ArrowLeft, ChevronDown, ChevronUp, Check,
  LogOut, Mail, MessageSquare, Settings, Monitor, Cpu, Eye, EyeOff, Lock,
  RefreshCw, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { loadSiteData, saveSiteData, defaultData, type SiteData, type Service, type Project } from "@/lib/siteData";
import { getIcon, ICON_OPTIONS } from "@/lib/icons";

const inputClass = "bg-background/50 border-white/10 focus-visible:ring-primary h-11 text-white placeholder:text-muted-foreground/50";
const textareaClass = "bg-background/50 border-white/10 focus-visible:ring-primary resize-none text-white placeholder:text-muted-foreground/50";

function SectionCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-8 py-5 text-left hover:bg-white/[0.02] transition-colors">
        <span className="text-white font-semibold text-lg">{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-8 pb-8 pt-2 border-t border-white/5">{children}</div>}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

interface Technology {
  id: number;
  name: string;
  iconKey: string;
  displayOrder: number;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface SmtpData {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  toEmail: string;
}

interface Quote {
  id: number;
  text: string;
  author: string;
  title: string;
  displayOrder: number;
  isActive: boolean;
}

type Tab = "content" | "technologies" | "messages" | "quotes" | "settings";

function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { username?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Giriş başarısız."); return; }
      onLogin(data.username!);
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="text-3xl font-bold font-mono tracking-tighter text-white mb-2">
            <span className="text-primary">&lt;</span>ND<span className="text-primary">/&gt;</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
          <p className="text-muted-foreground mt-2">Devam etmek için giriş yapın</p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup label="Kullanıcı Adı">
              <Input
                className={inputClass}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                required
              />
            </FieldGroup>
            <FieldGroup label="Şifre">
              <div className="relative">
                <Input
                  className={inputClass + " pr-12"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldGroup>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 glow-primary" disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              <span className="ml-2">{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</span>
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-6">Varsayılan: admin / admin123</p>
      </motion.div>
    </div>
  );
}

function ContentTab() {
  const { toast } = useToast();
  const [data, setData] = useState<SiteData>(loadSiteData());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveSiteData(data);
    setSaved(true);
    toast({ title: "Kaydedildi!", description: "Değişiklikler ana sayfaya yansıtıldı." });
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!confirm("Tüm değişiklikler sıfırlanacak. Emin misiniz?")) return;
    saveSiteData(defaultData);
    setData(defaultData);
    toast({ title: "Sıfırlandı", description: "Veriler varsayılan değerlere döndürüldü." });
  }

  function updateHero(field: keyof SiteData["hero"], value: string) {
    setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  }
  function updateAbout(field: keyof SiteData["about"], value: string | string[]) {
    setData(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));
  }
  function updateSkill(index: number, value: string) {
    const skills = [...data.about.skills]; skills[index] = value; updateAbout("skills", skills);
  }
  function addSkill() { updateAbout("skills", [...data.about.skills, "Yeni Yetkinlik"]); }
  function removeSkill(index: number) { updateAbout("skills", data.about.skills.filter((_, i) => i !== index)); }
  function updateService(index: number, field: keyof Service, value: string) {
    setData(prev => ({ ...prev, services: prev.services.map((s, i) => i === index ? { ...s, [field]: value } : s) }));
  }
  function addService() {
    setData(prev => ({ ...prev, services: [...prev.services, { title: "Yeni Hizmet", description: "Hizmet açıklaması." }] }));
  }
  function removeService(index: number) {
    setData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  }
  function updateProject(index: number, field: keyof Project, value: string) {
    setData(prev => ({ ...prev, projects: prev.projects.map((p, i) => i === index ? { ...p, [field]: value } : p) }));
  }
  function addProject() {
    setData(prev => ({ ...prev, projects: [...prev.projects, { title: "Yeni Proje", description: "Proje açıklaması.", tags: "", demoLink: "#", githubLink: "#" }] }));
  }
  function removeProject(index: number) {
    setData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  }
  function updateContact(field: keyof SiteData["contact"], value: string) {
    setData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Site İçeriği</h2>
          <p className="text-muted-foreground mt-1">Düzenleyip Kaydet'e basın — değişiklikler anında ana sayfaya yansır.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white gap-2" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
          </Button>
          <Button size="sm" className={`gap-2 ${saved ? "bg-green-600 hover:bg-green-700" : "glow-primary"}`} onClick={handleSave}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Kaydedildi" : "Kaydet"}
          </Button>
        </div>
      </div>

      <SectionCard title="Hero — Ana Giriş Bölümü" defaultOpen>
        <div className="grid md:grid-cols-2 gap-5 mt-4">
          <FieldGroup label="Ad Soyad">
            <Input className={inputClass} value={data.hero.name} onChange={e => updateHero("name", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Durum Metni">
            <Input className={inputClass} value={data.hero.statusText} onChange={e => updateHero("statusText", e.target.value)} />
          </FieldGroup>
          <div className="md:col-span-2">
            <FieldGroup label="Alt Başlık">
              <Input className={inputClass} value={data.hero.subtitle} onChange={e => updateHero("subtitle", e.target.value)} />
            </FieldGroup>
          </div>
          <div className="md:col-span-2">
            <FieldGroup label="Açıklama">
              <Textarea className={textareaClass} rows={3} value={data.hero.description} onChange={e => updateHero("description", e.target.value)} />
            </FieldGroup>
          </div>
          <FieldGroup label="1. Buton">
            <Input className={inputClass} value={data.hero.btn1} onChange={e => updateHero("btn1", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="2. Buton">
            <Input className={inputClass} value={data.hero.btn2} onChange={e => updateHero("btn2", e.target.value)} />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Hakkımda">
        <div className="space-y-5 mt-4">
          <FieldGroup label="Başlık">
            <Input className={inputClass} value={data.about.heading} onChange={e => updateAbout("heading", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="1. Paragraf">
            <Textarea className={textareaClass} rows={3} value={data.about.bio1} onChange={e => updateAbout("bio1", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="2. Paragraf">
            <Textarea className={textareaClass} rows={3} value={data.about.bio2} onChange={e => updateAbout("bio2", e.target.value)} />
          </FieldGroup>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-muted-foreground">Yetkinlikler</label>
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 gap-1.5 text-xs" onClick={addSkill}>
                <Plus className="h-3.5 w-3.5" /> Ekle
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.about.skills.map((skill, i) => (
                <div key={i} className="flex gap-2">
                  <Input className={inputClass + " flex-1"} value={skill} onChange={e => updateSkill(i, e.target.value)} />
                  <button onClick={() => removeSkill(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hizmetlerim">
        <div className="space-y-4 mt-4">
          {data.services.map((service, i) => (
            <div key={i} className="bg-background/30 border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/70">#{i + 1}</span>
                <button onClick={() => removeService(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FieldGroup label="Hizmet Adı">
                <Input className={inputClass} value={service.title} onChange={e => updateService(i, "title", e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Açıklama">
                <Textarea className={textareaClass} rows={2} value={service.description} onChange={e => updateService(i, "description", e.target.value)} />
              </FieldGroup>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed border-white/10 hover:bg-white/5 gap-2 text-muted-foreground" onClick={addService}>
            <Plus className="h-4 w-4" /> Yeni Hizmet Ekle
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Projelerim">
        <div className="space-y-4 mt-4">
          {data.projects.map((project, i) => (
            <div key={i} className="bg-background/30 border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/70">#{i + 1}</span>
                <button onClick={() => removeProject(i)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <FieldGroup label="Proje Adı">
                  <Input className={inputClass} value={project.title} onChange={e => updateProject(i, "title", e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Teknolojiler (virgülle)">
                  <Input className={inputClass} value={project.tags} onChange={e => updateProject(i, "tags", e.target.value)} placeholder="React, Node.js" />
                </FieldGroup>
              </div>
              <FieldGroup label="Açıklama">
                <Textarea className={textareaClass} rows={2} value={project.description} onChange={e => updateProject(i, "description", e.target.value)} />
              </FieldGroup>
              <div className="grid md:grid-cols-2 gap-3">
                <FieldGroup label="Demo Linki">
                  <Input className={inputClass} value={project.demoLink} onChange={e => updateProject(i, "demoLink", e.target.value)} />
                </FieldGroup>
                <FieldGroup label="GitHub Linki">
                  <Input className={inputClass} value={project.githubLink} onChange={e => updateProject(i, "githubLink", e.target.value)} />
                </FieldGroup>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed border-white/10 hover:bg-white/5 gap-2 text-muted-foreground" onClick={addProject}>
            <Plus className="h-4 w-4" /> Yeni Proje Ekle
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="İletişim Bilgileri">
        <div className="grid md:grid-cols-2 gap-5 mt-4">
          <FieldGroup label="E-posta">
            <Input className={inputClass} value={data.contact.email} onChange={e => updateContact("email", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Telefon">
            <Input className={inputClass} value={data.contact.phone} onChange={e => updateContact("phone", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Konum">
            <Input className={inputClass} value={data.contact.location} onChange={e => updateContact("location", e.target.value)} />
          </FieldGroup>
          <FieldGroup label="GitHub URL">
            <Input className={inputClass} value={data.contact.githubUrl} onChange={e => updateContact("githubUrl", e.target.value)} />
          </FieldGroup>
          <div className="md:col-span-2">
            <FieldGroup label="LinkedIn URL">
              <Input className={inputClass} value={data.contact.linkedinUrl} onChange={e => updateContact("linkedinUrl", e.target.value)} />
            </FieldGroup>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3 pt-4 pb-10">
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white gap-2" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Sıfırla
        </Button>
        <Button className={`gap-2 px-8 ${saved ? "bg-green-600 hover:bg-green-700" : "glow-primary"}`} onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  );
}

function TechnologiesTab() {
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newIconKey, setNewIconKey] = useState("SiReact");
  const [adding, setAdding] = useState(false);

  const loadTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/technologies", { credentials: "same-origin" });
      const data = await res.json() as Technology[];
      setTechnologies(data);
    } catch {
      toast({ title: "Hata", description: "Teknolojiler yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadTechs(); }, [loadTechs]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: newName.trim(), iconKey: newIconKey }),
      });
      if (!res.ok) throw new Error();
      setNewName("");
      await loadTechs();
      toast({ title: "Eklendi!" });
    } catch {
      toast({ title: "Hata", description: "Teknoloji eklenemedi.", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu teknolojiyi silmek istediğinizden emin misiniz?")) return;
    try {
      await fetch(`/api/admin/technologies/${id}`, { method: "DELETE", credentials: "same-origin" });
      await loadTechs();
      toast({ title: "Silindi." });
    } catch {
      toast({ title: "Hata", description: "Silinemedi.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Kullandığım Teknolojiler</h2>
        <p className="text-muted-foreground mt-1">Ana sayfadaki teknoloji ızgarasını buradan yönetin.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Yeni Teknoloji Ekle</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            className={inputClass + " flex-1"}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="React, Docker, Python…"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newIconKey}
            onChange={e => setNewIconKey(e.target.value)}
            className="bg-background/50 border border-white/10 text-white rounded-md px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
          >
            {ICON_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <Button onClick={handleAdd} disabled={adding || !newName.trim()} className="glow-primary gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Ekle
          </Button>
        </div>

        {newIconKey && (() => {
          const Icon = getIcon(newIconKey);
          return Icon ? (
            <div className="mt-3 flex items-center gap-2 text-muted-foreground text-sm">
              <Icon size={20} /> <span>Önizleme: {newName || "—"}</span>
            </div>
          ) : null;
        })()}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Yükleniyor…
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {technologies.map(tech => {
            const Icon = getIcon(tech.iconKey);
            return (
              <div key={tech.id} className="bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  {Icon ? <Icon size={22} className="text-primary" /> : <Cpu className="h-5 w-5 text-primary" />}
                  <span className="text-sm font-medium text-white truncate">{tech.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(tech.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {technologies.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Henüz teknoloji eklenmemiş.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuotesTab() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [form, setForm] = useState({ text: "", author: "", title: "" });
  const [saving, setSaving] = useState(false);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotes", { credentials: "same-origin" });
      const data = await res.json() as Quote[];
      setQuotes(data);
    } catch {
      toast({ title: "Hata", description: "Alıntılar yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  function startEdit(quote: Quote) {
    setEditing(quote);
    setForm({ text: quote.text, author: quote.author, title: quote.title ?? "" });
  }

  function startNew() {
    setEditing({ id: 0, text: "", author: "", title: "", displayOrder: 0, isActive: true });
    setForm({ text: "", author: "", title: "" });
  }

  function cancelEdit() { setEditing(null); }

  async function handleSave() {
    if (!form.text.trim() || !form.author.trim()) {
      toast({ title: "Hata", description: "Alıntı metni ve yazar zorunludur.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isNew = editing!.id === 0;
      const res = await fetch(
        isNew ? "/api/admin/quotes" : `/api/admin/quotes/${editing!.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ text: form.text.trim(), author: form.author.trim(), title: form.title.trim() }),
        }
      );
      if (!res.ok) throw new Error();
      await loadQuotes();
      setEditing(null);
      toast({ title: isNew ? "Alıntı eklendi!" : "Alıntı güncellendi!" });
    } catch {
      toast({ title: "Hata", description: "Kaydedilemedi.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(quote: Quote) {
    try {
      await fetch(`/api/admin/quotes/${quote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ isActive: !quote.isActive }),
      });
      await loadQuotes();
    } catch {
      toast({ title: "Hata", description: "Durum değiştirilemedi.", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu alıntıyı silmek istediğinizden emin misiniz?")) return;
    try {
      await fetch(`/api/admin/quotes/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (editing?.id === id) setEditing(null);
      await loadQuotes();
      toast({ title: "Alıntı silindi." });
    } catch {
      toast({ title: "Hata", description: "Silinemedi.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">İlham Veren Alıntılar</h2>
          <p className="text-muted-foreground mt-1">Ana sayfanın alt kısmındaki alıntı bölümünü buradan yönetin.</p>
        </div>
        <Button onClick={startNew} className="glow-primary gap-2">
          <Plus className="h-4 w-4" /> Yeni Alıntı
        </Button>
      </div>

      {editing !== null && (
        <div className="bg-card border border-primary/20 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">{editing.id === 0 ? "Yeni Alıntı Ekle" : "Alıntıyı Düzenle"}</h3>
          <FieldGroup label="Alıntı Metni">
            <Textarea
              className={textareaClass}
              rows={4}
              value={form.text}
              onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              placeholder="Alıntı metnini buraya yazın…"
            />
          </FieldGroup>
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Yazar">
              <Input
                className={inputClass}
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Martin Fowler"
              />
            </FieldGroup>
            <FieldGroup label="Unvan / Açıklama (isteğe bağlı)">
              <Input
                className={inputClass}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Yazılım Mühendisi"
              />
            </FieldGroup>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white" onClick={cancelEdit}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="glow-primary gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Yükleniyor…
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-2xl py-20 flex flex-col items-center text-muted-foreground">
          <div className="text-6xl font-serif text-white/10 mb-4">&ldquo;</div>
          <p>Henüz alıntı eklenmemiş.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className={`bg-card border rounded-2xl p-5 transition-all ${quote.isActive ? "border-white/5" : "border-white/5 opacity-50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                    <span className="text-primary/60 font-serif text-xl mr-1">&ldquo;</span>{quote.text}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{quote.author}</span>
                    {quote.title && <span className="text-xs text-primary/70 font-mono">— {quote.title}</span>}
                    {!quote.isActive && <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">Gizli</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(quote)}
                    className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title={quote.isActive ? "Gizle" : "Göster"}
                  >
                    {quote.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(quote)}
                    className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title="Düzenle"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages", { credentials: "same-origin" });
      const data = await res.json() as ContactMessage[];
      setMessages(data);
    } catch {
      toast({ title: "Hata", description: "Mesajlar yüklenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function markRead(id: number) {
    await fetch(`/api/admin/messages/${id}/read`, { method: "PATCH", credentials: "same-origin" });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (selected?.id === id) setSelected(null);
      await loadMessages();
      toast({ title: "Mesaj silindi." });
    } catch {
      toast({ title: "Hata", description: "Silinemedi.", variant: "destructive" });
    }
  }

  function handleSelect(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Gelen Mesajlar
            {unreadCount > 0 && (
              <span className="text-xs font-mono bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount} yeni</span>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">İletişim formundan gelen mesajlar burada görünür.</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 gap-2" onClick={loadMessages}>
          <RefreshCw className="h-3.5 w-3.5" /> Yenile
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Yükleniyor…
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-2xl py-20 flex flex-col items-center text-muted-foreground">
          <Inbox className="h-12 w-12 mb-4 opacity-30" />
          <p>Henüz mesaj yok.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4 items-start">
          <div className="lg:col-span-2 space-y-2">
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left bg-card border rounded-xl p-4 transition-all ${selected?.id === msg.id ? "border-primary/50 bg-primary/5" : "border-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-0.5" />}
                      <span className={`font-medium truncate ${msg.isRead ? "text-muted-foreground" : "text-white"}`}>{msg.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/50 shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-card border border-white/5 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selected.subject}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {selected.name}</span>
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${selected.email}`} className="hover:text-primary transition-colors">{selected.email}</a>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-background/50 rounded-xl p-5 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
                <div className="mt-4 text-xs text-muted-foreground/50">
                  {new Date(selected.createdAt).toLocaleString("tr-TR")}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-white/5 rounded-2xl h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Okumak için bir mesaj seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ username }: { username: string }) {
  const { toast } = useToast();

  const [smtp, setSmtp] = useState<SmtpData>({ host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "", fromEmail: "", toEmail: "" });
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpSaving, setSmtpSaving] = useState(false);

  const [creds, setCreds] = useState({ newUsername: username, currentPassword: "", newPassword: "", confirmPassword: "" });
  const [credsSaving, setCredsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetch("/api/admin/smtp", { credentials: "same-origin" })
      .then(r => r.json())
      .then((data: SmtpData | null) => { if (data) setSmtp(data); })
      .catch(() => {})
      .finally(() => setSmtpLoading(false));
  }, []);

  async function saveSmtp() {
    setSmtpSaving(true);
    try {
      const res = await fetch("/api/admin/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(smtp),
      });
      if (!res.ok) throw new Error();
      toast({ title: "SMTP ayarları kaydedildi!" });
    } catch {
      toast({ title: "Hata", description: "SMTP ayarları kaydedilemedi.", variant: "destructive" });
    } finally {
      setSmtpSaving(false);
    }
  }

  async function saveCredentials() {
    if (!creds.currentPassword) {
      toast({ title: "Hata", description: "Mevcut şifre zorunludur.", variant: "destructive" });
      return;
    }
    if (creds.newPassword && creds.newPassword !== creds.confirmPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor.", variant: "destructive" });
      return;
    }
    setCredsSaving(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          username: creds.newUsername || undefined,
          currentPassword: creds.currentPassword,
          newPassword: creds.newPassword || undefined,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { toast({ title: "Hata", description: data.error, variant: "destructive" }); return; }
      toast({ title: "Kimlik bilgileri güncellendi!" });
      setCreds(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch {
      toast({ title: "Hata", description: "Güncellenemedi.", variant: "destructive" });
    } finally {
      setCredsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Ayarlar</h2>
        <p className="text-muted-foreground mt-1">SMTP e-posta ayarları ve admin giriş bilgileri.</p>
      </div>

      <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Google SMTP Ayarları</h3>
            <p className="text-xs text-muted-foreground">İletişim formundan gelen mesajlar bu adrese iletilir.</p>
          </div>
        </div>

        {smtpLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4"><RefreshCw className="h-4 w-4 animate-spin" /> Yükleniyor…</div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FieldGroup label="SMTP Sunucusu">
                  <Input className={inputClass} value={smtp.host} onChange={e => setSmtp(p => ({ ...p, host: e.target.value }))} placeholder="smtp.gmail.com" />
                </FieldGroup>
              </div>
              <FieldGroup label="Port">
                <Input className={inputClass} type="number" value={smtp.port} onChange={e => setSmtp(p => ({ ...p, port: Number(e.target.value) }))} placeholder="587" />
              </FieldGroup>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FieldGroup label="Gmail Adresi (Kullanıcı)">
                <Input className={inputClass} value={smtp.user} onChange={e => setSmtp(p => ({ ...p, user: e.target.value }))} placeholder="ornek@gmail.com" />
              </FieldGroup>
              <FieldGroup label="Uygulama Şifresi">
                <Input className={inputClass} type="password" value={smtp.password} onChange={e => setSmtp(p => ({ ...p, password: e.target.value }))} placeholder="Gmail Uygulama Şifresi" />
              </FieldGroup>
              <FieldGroup label="Gönderen Adres (From)">
                <Input className={inputClass} value={smtp.fromEmail} onChange={e => setSmtp(p => ({ ...p, fromEmail: e.target.value }))} placeholder="ornek@gmail.com" />
              </FieldGroup>
              <FieldGroup label="Alıcı Adres (To)">
                <Input className={inputClass} value={smtp.toEmail} onChange={e => setSmtp(p => ({ ...p, toEmail: e.target.value }))} placeholder="sizin@email.com" />
              </FieldGroup>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="secure"
                checked={smtp.secure}
                onChange={e => setSmtp(p => ({ ...p, secure: e.target.checked }))}
                className="rounded border-white/10"
              />
              <label htmlFor="secure" className="text-sm text-muted-foreground">SSL/TLS Güvenli Bağlantı (Port 465 için)</label>
            </div>
            <div className="bg-background/30 border border-white/5 rounded-lg p-4 text-xs text-muted-foreground">
              <strong className="text-white">Google SMTP için:</strong> Gmail hesabınızda 2 Adımlı Doğrulama'yı etkinleştirin, ardından Google Hesabı &gt; Güvenlik &gt; Uygulama Şifreleri'nden bir şifre oluşturun. Port 587 ve TLS kullanmanız önerilir.
            </div>
            <Button onClick={saveSmtp} disabled={smtpSaving} className="glow-primary gap-2">
              {smtpSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              SMTP Ayarlarını Kaydet
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Giriş Bilgilerini Değiştir</h3>
            <p className="text-xs text-muted-foreground">Kullanıcı adı ve/veya şifrenizi güncelleyin.</p>
          </div>
        </div>

        <div className="space-y-4">
          <FieldGroup label="Kullanıcı Adı">
            <Input className={inputClass} value={creds.newUsername} onChange={e => setCreds(p => ({ ...p, newUsername: e.target.value }))} />
          </FieldGroup>
          <div className="grid md:grid-cols-2 gap-4">
            <FieldGroup label="Mevcut Şifre (zorunlu)">
              <div className="relative">
                <Input
                  className={inputClass + " pr-12"}
                  type={showPasswords ? "text" : "password"}
                  value={creds.currentPassword}
                  onChange={e => setCreds(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FieldGroup>
            <div />
            <FieldGroup label="Yeni Şifre">
              <Input className={inputClass} type={showPasswords ? "text" : "password"} value={creds.newPassword} onChange={e => setCreds(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 karakter" />
            </FieldGroup>
            <FieldGroup label="Yeni Şifre (Tekrar)">
              <Input className={inputClass} type={showPasswords ? "text" : "password"} value={creds.confirmPassword} onChange={e => setCreds(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
            </FieldGroup>
          </div>
          <Button onClick={saveCredentials} disabled={credsSaving} className="glow-primary gap-2">
            {credsSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Bilgileri Güncelle
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [currentUser, setCurrentUser] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("content");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(r => r.json())
      .then((data: { username?: string; error?: string }) => {
        if (data.username) { setCurrentUser(data.username); setAuthState("authenticated"); }
        else setAuthState("unauthenticated");
      })
      .catch(() => setAuthState("unauthenticated"));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setAuthState("unauthenticated");
    setCurrentUser("");
  }

  if (authState === "loading") {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <>
        <LoginForm onLogin={(u) => { setCurrentUser(u); setAuthState("authenticated"); }} />
        <Toaster />
      </>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "content", label: "Site İçeriği", icon: <Monitor className="h-4 w-4" /> },
    { key: "technologies", label: "Teknolojiler", icon: <Cpu className="h-4 w-4" /> },
    { key: "messages", label: "Mesajlar", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "quotes", label: "Alıntılar", icon: <Mail className="h-4 w-4" /> },
    { key: "settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" /> Ana Sayfa
            </button>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono tracking-tighter text-white">
                <span className="text-primary">&lt;</span>ND<span className="text-primary">/&gt;</span>
              </span>
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{currentUser}</span>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white gap-2" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </Button>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 md:px-12 max-w-6xl flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 max-w-6xl py-10">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === "content" && <ContentTab />}
          {activeTab === "technologies" && <TechnologiesTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "quotes" && <QuotesTab />}
          {activeTab === "settings" && <SettingsTab username={currentUser} />}
        </motion.div>
      </main>

      <Toaster />
    </div>
  );
}
