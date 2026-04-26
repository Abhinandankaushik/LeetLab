import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ language = 'javascript', code = '' }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md">
      <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/70">{language}</span>
        <button type="button" onClick={onCopy} className="btn btn-xs btn-ghost" aria-label="Copy code">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Editor
        height="280px"
        language={language}
        theme="vs-dark"
        value={code}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeBlock;
