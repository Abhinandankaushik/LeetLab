import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const EditProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    defficulty: 'EASY',
    tags: '',
    constraints: '',
    hints: '',
    editorial: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/problems/get-problem/${id}`);
        const p = res.data.problem;
        setForm({
          title: p.title || '',
          description: p.description || '',
          defficulty: p.defficulty || 'EASY',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          constraints: p.constraints || '',
          hints: p.hints || '',
          editorial: p.editorial || '',
        });
      } catch {
        toast.error('Unable to load problem');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put(`/problems/update-problem/${id}`, {
        title: form.title,
        description: form.description,
        defficulty: form.defficulty,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        constraints: form.constraints,
        hints: form.hints || null,
        editorial: form.editorial || null,
      });

      toast.success('Problem updated');
      navigate(`/problem/${id}`);
    } catch {
      toast.error('Failed to update problem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <section className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg">
        <h1 className="text-3xl font-black tracking-tight">Edit Problem</h1>
      </section>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-base-300 bg-base-100 p-6 shadow">
        <input className="input input-bordered w-full" value={form.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Title" />
        <textarea className="textarea textarea-bordered w-full min-h-32" value={form.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Description" />

        <div className="grid gap-4 md:grid-cols-2">
          <select className="select select-bordered" value={form.defficulty} onChange={(e) => onChange('defficulty', e.target.value)}>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
          <input className="input input-bordered" value={form.tags} onChange={(e) => onChange('tags', e.target.value)} placeholder="tag1, tag2" />
        </div>

        <textarea className="textarea textarea-bordered w-full" value={form.constraints} onChange={(e) => onChange('constraints', e.target.value)} placeholder="Constraints" />
        <textarea className="textarea textarea-bordered w-full" value={form.hints} onChange={(e) => onChange('hints', e.target.value)} placeholder="Hints" />
        <textarea className="textarea textarea-bordered w-full" value={form.editorial} onChange={(e) => onChange('editorial', e.target.value)} placeholder="Editorial" />

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Back</button>
          <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditProblemPage;
