import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  FileCode,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  Save,
  Layout,
  MessageSquare,
  Upload,
  Code2,
  ChevronRight,
  Info
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { useNavigate, useLocation } from "react-router-dom";
import { problemsApi, LANGUAGES } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const problemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  defficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  tags: z.any().optional(),
  constraints: z.string().optional(),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testcases: z.any().optional(),
  examples: z.any().optional(),
  codeSnippets: z.any().optional(),
  referenceSolutions: z.any().optional(),
});

type FormValues = z.infer<typeof problemSchema>;

interface CreateProblemFormProps {
  problemId?: string;
}

export default function CreateProblemForm({ problemId }: CreateProblemFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [jsonInput, setJsonInput] = React.useState("");
  const [showJsonMode, setShowJsonMode] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      defficulty: "MEDIUM",
      tags: [""],
      testcases: [{ input: "", output: "" }],
      codeSnippets: { JAVASCRIPT: "" },
      referenceSolutions: { JAVASCRIPT: "" },
      examples: {},
      visibility: "PUBLIC"
    },
  });

  // Watch snippets to determine active languages
  const codeSnippets = watch("codeSnippets");
  const availableLangs = React.useMemo(() => Object.keys(codeSnippets || {}), [codeSnippets]);
  const [activeLang, setActiveLang] = React.useState("JAVASCRIPT");

  // Handle AI Pre-fill or JSON Pre-fill
  React.useEffect(() => {
    const aiData = location.state?.aiGeneratedProblem;
    if (aiData) {
      reset(aiData);
      if (Object.keys(aiData.codeSnippets || {}).length > 0) {
        setActiveLang(Object.keys(aiData.codeSnippets)[0]);
      }
    }
  }, [location.state, reset]);

  // Fetch problem data for editing
  React.useEffect(() => {
    if (problemId) {
      setIsLoading(true);
      problemsApi.get(problemId)
        .then((res) => {
          const problem = res.problem;
          reset({
            title: problem.title || "",
            description: problem.description || "",
            defficulty: problem.defficulty as "EASY" | "MEDIUM" | "HARD",
            visibility: problem.visibility as "PUBLIC" | "PRIVATE",
            tags: Array.isArray(problem.tags) ? problem.tags : [""],
            constraints: problem.constraints || "",
            hints: problem.hints || "",
            editorial: problem.editorial || "",
            testcases: Array.isArray(problem.testcases) ? problem.testcases : [{ input: "", output: "" }],
            examples: problem.examples || {},
            codeSnippets: problem.codeSnippets || {},
            referenceSolutions: problem.referenceSolutions || {},
          });
          if (problem.codeSnippets && Object.keys(problem.codeSnippets).length > 0) {
            setActiveLang(Object.keys(problem.codeSnippets)[0]);
          }
        })
        .catch((err) => {
          toast.error("Failed to fetch problem data");
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [problemId, reset]);

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase } = useFieldArray({
    control,
    name: "testcases",
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: "tags",
  });

  const handleJsonImport = () => {
    try {
      const raw = JSON.parse(jsonInput);
      
      // Normalize field names (e.g. expectedOutput -> output)
      const data = { ...raw };
      
      if (Array.isArray(data.testcases)) {
        data.testcases = data.testcases.map((tc: any) => ({
          input: tc.input ?? "",
          output: tc.output ?? tc.expectedOutput ?? tc.expected_output ?? ""
        }));
      }

      // Normalize snippets (e.g. python -> PYTHON)
      if (data.codeSnippets) {
        const normalized: any = {};
        Object.entries(data.codeSnippets).forEach(([k, v]) => {
          normalized[k.toUpperCase()] = v;
        });
        data.codeSnippets = normalized;
      }
      
      if (data.referenceSolutions) {
        const normalized: any = {};
        Object.entries(data.referenceSolutions).forEach(([k, v]) => {
          normalized[k.toUpperCase()] = v;
        });
        data.referenceSolutions = normalized;
      }

      // Basic validation for essential fields
      if (!data.title || !data.testcases || !data.codeSnippets) {
        throw new Error("Invalid JSON format. Missing required fields (title, testcases, codeSnippets).");
      }

      reset(data);
      if (Object.keys(data.codeSnippets || {}).length > 0) {
        setActiveLang(Object.keys(data.codeSnippets)[0]);
      }
      setShowJsonMode(false);
      toast.success("JSON data imported and normalized successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to parse JSON");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      // Logic for examples: if not provided, use first testcase
      const finalData = {
        ...values,
        examples: values.examples && Object.keys(values.examples).length > 0 
          ? values.examples 
          : {
              [activeLang]: {
                input: values.testcases[0].input || "",
                output: values.testcases[0].output,
                explanation: "Auto-generated from first testcase"
              }
            }
      };
      
      if (problemId) {
        await problemsApi.update(problemId, finalData);
        toast.success("Problem updated successfully");
      } else {
        await problemsApi.create(finalData);
        toast.success("Problem created successfully");
      }
      navigate("/admin");
    } catch (error: any) {
      console.error("Submit Error:", error);
      const msg = error.response?.data?.error || error.message || "Failed to create problem";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Log validation errors to toast if submit is blocked
  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(`Validation Error: ${firstError.message}`);
    } else {
      toast.error("Please check the form for errors");
    }
    console.log("Form Validation Errors:", errors);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileCode className="h-8 w-8 text-primary" /> 
            {problemId ? "Edit Problem" : location.state?.aiGeneratedProblem ? "Review AI Problem" : "Create Problem"}
          </h1>
          <p className="text-muted-foreground text-sm">Define your challenge or import a bulk JSON payload.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowJsonMode(!showJsonMode)} className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 mr-2" />
            {showJsonMode ? "Form" : "Bulk JSON"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate("/admin")} className="flex-1 sm:flex-none">Cancel</Button>
          <Button onClick={() => onSubmit(watch())} size="sm" disabled={isLoading} className="btn-shine flex-1 sm:flex-none">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {showJsonMode ? (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" /> JSON Import
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              Follow Prisma Problem model structure
            </div>
          </div>
          <div className="h-[600px] rounded-md border border-border overflow-hidden">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={jsonInput}
              onChange={(v) => setJsonInput(v || "")}
              options={{ minimap: { enabled: false }, fontSize: 13 }}
            />
          </div>
          <Button onClick={handleJsonImport} className="w-full">
            Process JSON Data
          </Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3 animate-in fade-in">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" /> Core Details
              </h2>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Title</label>
                <Input {...register("title")} placeholder="e.g. Longest Palindromic Substring" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[200px] focus:ring-1 ring-primary"
                  placeholder="Markdown supported description..."
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Difficulty</label>
                  <select 
                    {...register("defficulty")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Visibility</label>
                  <select 
                    {...register("visibility")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PUBLIC">PUBLIC (Everyone can see)</option>
                    <option value="PRIVATE">PRIVATE (Admins & Contestants only)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Constraints</label>
                  <textarea
                    {...register("constraints")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                    placeholder="e.g. 1 <= n <= 10^5"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Logic & Languages
                </h2>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const lang = prompt("Enter language key (e.g. PYTHON, JAVA, CPP):");
                    if (lang) {
                      const key = lang.toUpperCase();
                      setValue(`codeSnippets.${key}`, "");
                      setValue(`referenceSolutions.${key}`, "");
                      setActiveLang(key);
                    }
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Language
                </Button>
              </div>
              
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-2 border-b border-border/40">
                {availableLangs.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      "px-4 py-2 text-[10px] md:text-xs font-mono uppercase tracking-widest rounded-md transition-all border shrink-0",
                      activeLang === lang 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {activeLang && (
                <div className="grid gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Starter Snippet ({activeLang})</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          const news = { ...codeSnippets };
                          delete news[activeLang];
                          setValue("codeSnippets", news);
                          const refs = { ...watch("referenceSolutions") };
                          delete refs[activeLang];
                          setValue("referenceSolutions", refs);
                          if (availableLangs.length > 1) setActiveLang(availableLangs.find(l => l !== activeLang)!);
                        }}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        Remove Language
                      </button>
                    </div>
                    <div className="h-60 rounded-md border border-border overflow-hidden">
                      <Controller
                        control={control}
                        name={`codeSnippets.${activeLang}`}
                        render={({ field }) => (
                          <Editor
                            height="100%"
                            language={LANGUAGES.find(l => l.key === activeLang)?.monaco || "javascript"}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Reference Solution ({activeLang})</label>
                    <div className="h-60 rounded-md border border-border overflow-hidden">
                      <Controller
                        control={control}
                        name={`referenceSolutions.${activeLang}`}
                        render={({ field }) => (
                          <Editor
                            height="100%"
                            language={LANGUAGES.find(l => l.key === activeLang)?.monaco || "javascript"}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Tags
              </h2>
              <div className="space-y-2">
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 group">
                    <Input {...register(`tags.${index}`)} placeholder="Tag" className="h-9" />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeTag(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full border-dashed" onClick={() => appendTag("")}>
                  <Plus className="h-3 w-3 mr-1" /> Add Tag
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Testcases
                </h2>
                <div className="text-xs text-muted-foreground">{testCaseFields.length} total</div>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {testCaseFields.map((field, index) => (
                  <div key={field.id} className="p-3 sm:p-4 rounded-md border border-border space-y-3 relative group bg-muted/20">
                    <div className="absolute top-2 right-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => removeTestCase(index)} className="p-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Input <ChevronRight className="h-2 w-2" />
                      </label>
                      <textarea 
                        {...register(`testcases.${index}.input`)}
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono min-h-[40px] focus:ring-1 ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Output <ChevronRight className="h-2 w-2" />
                      </label>
                      <textarea 
                        {...register(`testcases.${index}.output`)}
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono min-h-[40px] focus:ring-1 ring-primary"
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full border-dashed" onClick={() => appendTestCase({ input: "", output: "" })}>
                  <Plus className="h-3 w-3 mr-1" /> Add Case
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Resources
              </h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Hints</label>
                  <textarea {...register("hints")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs min-h-[60px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Editorial</label>
                  <textarea {...register("editorial")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs min-h-[100px]" />
                </div>
              </div>
            </section>
          </div>
        </form>
      )}
    </div>
  );
}
