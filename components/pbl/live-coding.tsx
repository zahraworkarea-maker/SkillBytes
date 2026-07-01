'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
  { id: 'nodejs', name: 'JavaScript', versionIndex: '4', defaultCode: 'console.log("Hello, World!");', monacoLang: 'javascript' },
  { id: 'python3', name: 'Python', versionIndex: '4', defaultCode: 'print("Hello, World!")', monacoLang: 'python' },
  { id: 'java', name: 'Java', versionIndex: '4', defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}', monacoLang: 'java' },
  { id: 'cpp', name: 'C++', versionIndex: '5', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}', monacoLang: 'cpp' },
  { id: 'php', name: 'PHP', versionIndex: '4', defaultCode: '<?php\n\necho "Hello, World!";\n', monacoLang: 'php' },
];

export function LiveCoding() {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = LANGUAGES.find((l) => l.id === e.target.value);
    if (lang) {
      setSelectedLanguage(lang);
      setCode(lang.defaultCode);
      setOutput('');
      setError(null);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError(null);
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage.id,
          versionIndex: selectedLanguage.versionIndex,
          script: code,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setOutput(result.output || 'No output');
        // JDoodle API places compilation/runtime errors in output
        // but if there's an API error, it might be in `error`
        if (result.error) {
          setError(result.error);
        }
      } else {
        setError(result.error || 'Failed to execute code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menjalankan kode');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Live Coding Editor
        </h3>
        <div className="flex gap-3">
          <select
            value={selectedLanguage.id}
            onChange={handleLanguageChange}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          <Button onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-lg overflow-hidden h-[400px]">
          <Editor
            height="100%"
            language={selectedLanguage.monacoLang}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        
        <div className="border border-slate-200 rounded-lg bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm overflow-auto h-[400px]">
          <div className="mb-2 text-slate-500 font-semibold border-b border-slate-700 pb-2">Output:</div>
          {isRunning ? (
            <div className="flex items-center text-slate-400 gap-2">
              <Loader className="w-4 h-4 animate-spin" /> Menjalankan kode...
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {output || (
                <span className="text-slate-600 italic">Belum ada output. Klik "Run Code" untuk melihat hasil.</span>
              )}
            </div>
          )}
          {error && (
            <div className="mt-4 pt-2 border-t border-red-900/50 text-red-400 whitespace-pre-wrap">
              <span className="font-bold">Error:</span>
              <br />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
