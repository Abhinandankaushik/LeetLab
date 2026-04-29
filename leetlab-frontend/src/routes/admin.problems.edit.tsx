import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { problemsApi, LANGUAGES } from "@/lib/api";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";

export function EditProblemPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const monacoTheme = theme === "dark" ? "vs-dark" : "light";
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [defficulty, setDefficulty] = React.useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [tags, setTags] = React.useState("");
  const [constraints, setConstraints] = React.useState("");
  const [hints, setHints] = React.useState("");
  const [editorial, setEditorial] = React.useState("");
  const [examples, setExamples] = React.useState("[]");
  const [testcases, setTestcases] = React.useState("[]");
  const [codeSnippets, setCodeSnippets] = React.useState("{}");
  const [referenceSolutions, setReferenceSolutions] = React.useState("{}");

  React.useEffect(() => {
    if (!problemId) return;
    problemsApi.get(problemId).then((res: any) => {
      const p = res.problem || res.data;
      setTitle(p.title || "");
      setDescription(p.description || "");
      setDefficulty(p.defficulty || "EASY");
      setTags((p.tags || []).join(", "));
      setConstraints(p.constraints || "");
      setHints(p.hints || "");
      setEditorial(p.editorial || "");
      setExamples(JSON.stringify(Array.isArray(p.examples) ? p.examples : [], null, 2));
      setTestcases(JSON.stringify(Array.isArray(p.testcases) ? p.testcases : [], null, 2));
      setCodeSnippets(JSON.stringify(p.codeSnippets || {}, null, 2));
      setReferenceSolutions(JSON.stringify(p.referenceSolutions || {}, null, 2));
    }).catch((e: any) => toast.error(e.message || "Failed to load problem"))
      .finally(() => setLoading(false));
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemId) return;
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        defficulty,
        tags: tags.split(",").map(s => s.trim()).filter(Boolean),
        constraints,
        hints: hints || null,
        editorial: editorial || null,
        examples: JSON.parse(examples || "[]"),
        testcases: JSON.parse(testcases || "[]"),
        codeSnippets: JSON.parse(codeSnippets || "{}"),
        referenceSolutions: JSON.parse(referenceSolutions || "{}"),
      };
      await problemsApi.update(problemId, payload);
      toast.success("Problem updated successfully!");
      navigate("/admin/problems/list");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update — check JSON fields");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button
        onClick={() => navigate("/admin/problems/list")}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to problems
      </button>

      <div className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">/ admin / problems</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Edit Problem</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">ID: {problemId}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1.5" />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <div className="mt-1.5 h-52 overflow-hidden rounded-md border border-border">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={monacoTheme}
                value={description}
                onChange={v => setDescription(v || "")}
                options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on", padding: { top: 8 } }}
              />
            </div>
          </div>

          {/* Difficulty + Tags */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Difficulty</Label>
              <select
                className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={defficulty}
                onChange={e => setDefficulty(e.target.value as any)}
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1.5" value={tags} onChange={e => setTags(e.target.value)} placeholder="Array, Hash Table" />
            </div>
          </div>

          {/* Constraints */}
          <div>
            <Label>Constraints</Label>
            <Textarea className="mt-1.5 font-mono text-xs" rows={3} value={constraints} onChange={e => setConstraints(e.target.value)} />
          </div>

          {/* Hints */}
          <div>
            <Label>Hints (optional)</Label>
            <Textarea className="mt-1.5" rows={2} value={hints} onChange={e => setHints(e.target.value)} />
          </div>

          {/* Editorial */}
          <div>
            <Label>Editorial (optional)</Label>
            <div className="mt-1.5 h-40 overflow-hidden rounded-md border border-border">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={monacoTheme}
                value={editorial}
                onChange={v => setEditorial(v || "")}
                options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on", padding: { top: 8 } }}
              />
            </div>
          </div>

          {/* Examples JSON */}
          <div>
            <Label>Examples (JSON array)</Label>
            <Textarea className="mt-1.5 font-mono text-xs" rows={5} value={examples} onChange={e => setExamples(e.target.value)} />
          </div>

          {/* Testcases JSON */}
          <div>
            <Label>Testcases (JSON array)</Label>
            <Textarea className="mt-1.5 font-mono text-xs" rows={5} value={testcases} onChange={e => setTestcases(e.target.value)} />
          </div>

          {/* Code Snippets JSON */}
          <div>
            <Label>Code snippets per language (JSON)</Label>
            <Textarea className="mt-1.5 font-mono text-xs" rows={7} value={codeSnippets} onChange={e => setCodeSnippets(e.target.value)} />
          </div>

          {/* Reference Solutions JSON */}
          <div>
            <Label>Reference solutions per language (JSON)</Label>
            <Textarea className="mt-1.5 font-mono text-xs" rows={7} value={referenceSolutions} onChange={e => setReferenceSolutions(e.target.value)} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2 glow-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? "Saving changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
