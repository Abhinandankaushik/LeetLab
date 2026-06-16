import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import CreateProblemForm from "@/components/CreateProblemForm";
import { FormSkeleton } from "@/components/empty-state";

export default function NewProblemPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <FormSkeleton />;
  
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need admin role to access this dashboard.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Admin Dashboard
        </Link>
        <Link 
          to="/admin/problems/ai" 
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-primary hover:underline group"
        >
          <Sparkles className="h-4 w-4" /> 
          Use AI Architect Instead
        </Link>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-8 md:p-12 shadow-2xl">
        <CreateProblemForm />
      </div>
    </div>
  );
}
