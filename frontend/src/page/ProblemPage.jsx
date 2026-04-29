<<<<<<< HEAD
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import {
    Play,
    FileText,
    MessageSquare,
    Lightbulb,
    Bookmark,
    Share2,
    Clock,
    ChevronRight,
    BookOpen,
    Terminal,
    Code2,
    Users,
    ThumbsUp,
    Home,
} from "lucide-react";

import { useProblemStore } from '../store/useProblemStore';
import { useExecutionStore } from '../store/useExecutionStore';
import { getLanguageId } from "../lib/lang";
import Submission from '../components/Submission'
import { useSubmissionStore } from '../store/useSubmissionStore';
import SubmissionsList from '../components/SubmissionsList';


const ProblemPage = () => {
    const { id } = useParams()


    const { getProblemById, problem, isProblemLoading } = useProblemStore();
    const [code, setCode] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [isBookMarked, setisBookMarked] = useState(false);
    const [testCases, setTestCases] = useState([]);

    const { submission: submissions, isSubmissionLoading, submissionCount,
        getAllSubmissions, getSubmissionForProblem, getSubmissionCountForProblem } = useSubmissionStore();

    const { isExecuting, excuteCode, submission } = useExecutionStore();
    useEffect(() => {
        getProblemById(id);
        getSubmissionCountForProblem(id)
    }, [id, submission]);


    useEffect(() => {
        if (problem) {
            setCode(problem.codeSnippets?.[selectedLanguage] || "");
            setTestCases(problem.testcases?.map((tc) => ({
                input: tc.input,
                output: tc.output,
            })) || []);
        }
    }, [problem, selectedLanguage]);



    const handleLanguageChange = (e) => {
        const lagn = e.target.value
        setSelectedLanguage(lagn);
        setCode(problem.codeSnippets?.[lagn] || "");
    };

    useEffect(() => {
        if (activeTab === 'submissions') {
            getSubmissionForProblem(id);
        }
    }, [activeTab, id, submission]);

    console.log("submissions", submissions)

    const renderTabContent = () => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="prose max-w-none">
                        <p className="text-lg mb-6">{problem?.description}</p>

                        {problem?.examples && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Examples:</h3>
                                {Object.entries(problem?.examples).map(
                                    ([lang, example], idx) => (
                                        <div
                                            key={lang}
                                            className="bg-base-200 p-6 rounded-xl mb-6 font-mono"
                                        >
                                            <div className="mb-4">
                                                <div className="text-indigo-300 mb-2 text-base font-semibold">
                                                    Input:
                                                </div>
                                                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                    {example.input}
                                                </span>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-indigo-300 mb-2 text-base font-semibold">
                                                    Output:
                                                </div>
                                                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                    {example.output}
                                                </span>
                                            </div>
                                            {example.explanation && (
                                                <div>
                                                    <div className="text-emerald-300 mb-2 text-base font-semibold">
                                                        Explanation:
                                                    </div>
                                                    <p className="text-base-content/70 text-lg font-sem">
                                                        {example.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </>
                        )}

                        {problem?.constraints && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Constraints:</h3>
                                <div className="bg-base-200 p-6 rounded-xl mb-6">
                                    <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                        {problem.constraints}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                );
            case "submissions":
                return (
                    <SubmissionsList
                        submissions={submissions}
                        isSubmissionLoading={isSubmissionLoading}
                    />
                );
            case "discussion":
                return (
                    <div className="p-4 text-center text-base-content/70">
                        No discussions yet
                    </div>
                );
            case "hints":
                return (
                    <div className="p-4">
                        {problem?.hints ? (
                            <div className="bg-base-200 p-6 rounded-xl">
                                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                    {problem.hints}
                                </span>
                            </div>
                        ) : (
                            <div className="text-center text-base-content/70">
                                No hints available
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const handleRunCode = (e) => {
        e.preventDefault();
        try {

            const language_id = getLanguageId(selectedLanguage);
            const stdin = problem.testcases.map((tc) => tc.input);

            const expected_output = problem?.testcases.map((tc) => tc.output);
            excuteCode(code, language_id, stdin, expected_output, id);

        } catch (err) {
            console.log("Error Executing Code in HandleCode", err);
        }
    }


    return (

        <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200 max-w-7xl w-full">
            <nav className="navbar bg-base-100 shadow-lg px-4">
                <div className="flex-1 gap-2">
                    <Link to={"/"} className="flex items-center gap-2 text-primary">
                        <Home className="w-6 h-6" />
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <div className="mt-2">
                        <h1 className="text-xl font-bold">{problem?.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-base-content/70 mt-5">
                            <Clock className="w-4 h-4" />
                            <span>
                                Updated{" "}
                                {new Date(problem?.createdAt).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <span className="text-base-content/30">•</span>
                            <Users className="w-4 h-4" />
                            <span>{submissionCount} Submissions</span>
                            <span className="text-base-content/30">•</span>
                            <ThumbsUp className="w-4 h-4" />
                            <span>95% Success Rate</span>
                        </div>
                    </div>
                </div>
                <div className="flex-none gap-4">
                    <button
                        className={`btn btn-ghost btn-circle ${isBookMarked ? "text-primary" : ""
                            }`}
                        onClick={() => setisBookMarked(!isBookMarked)}
                    >
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-circle">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <select
                        className="select select-bordered select-primary w-40"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        {Object.keys(problem?.codeSnippets || {}).map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </nav>


            <div className='container mx-auto p-4 '>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>

                    {/* {left side part } */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-0">
                            <div className="tabs tabs-bordered">
                                <button
                                    className={`tab gap-2 ${activeTab === "description" ? "tab-active" : ""
                                        }`}
                                    onClick={() => setActiveTab("description")}
                                >
                                    <FileText className="w-4 h-4" />
                                    Description
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "submissions" ? "tab-active" : ""
                                        }`}
                                    onClick={() => setActiveTab("submissions")}
                                >
                                    <Code2 className="w-4 h-4" />
                                    Submissions
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "discussion" ? "tab-active" : ""
                                        }`}
                                    onClick={() => setActiveTab("discussion")}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Discussion
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "hints" ? "tab-active" : ""
                                        }`}
                                    onClick={() => setActiveTab("hints")}
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    Hints
                                </button>
                            </div>

                            <div className="p-6">{renderTabContent()}</div>
                        </div>
                    </div>

                    {/* {right side editor part} */}

                    <div className='card-body p-0 '>

                        <div className='tabs tabs-bordered'>
                            <button className='tab gap-3 tab-active'>
                                <Terminal className="w-4 h-4" />
                                Code Editor
                            </button>

                        </div>

                        <div className='h-[600px] w-full' >

                            {/* {monaco editor configuration} */}
                            <Editor
                                height="100%"
                                language={selectedLanguage.toLowerCase()}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 15,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    readOnly: false,
                                    automaticLayout: true,
                                }}
                            />

                        </div>

                        {/* {Run code & submit button} */}
                        <div className="p-4 border-t border-base-300 bg-base-200">
                            <div className="flex justify-between items-center">
                                <button
                                    className={`btn btn-primary gap-2 ${isExecuting ? "loading" : ""}`}
                                    onClick={handleRunCode}
                                    disabled={isExecuting}
                                >
                                    {!isExecuting && <Play className="w-4 h-4" />}
                                    Run Code
                                </button>
                                <button className="btn btn-success gap-2">
                                    Submit Solution
                                </button>
                            </div>
                        </div>


                    </div>




                </div>

                {/* {Submission part} */}
                <div className='card bg-base-100 shadow-xl mt-6'>
                    <div className='card-body'>
                        {

                            submission ? (<Submission />) :
                                (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold">Test Cases</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead>
                                                    <tr>
                                                        <th>Input</th>
                                                        <th>Expected Output</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {testCases.map((testCase, index) => (
                                                        <tr key={index}>
                                                            <td className="font-mono">{testCase.input}</td>
                                                            <td className="font-mono">{testCase.output}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )
                        }
                    </div>
                </div>

            </div>


        </div>

    )
}

export default ProblemPage





=======
import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
  Play,
  FileText,
  MessageSquare,
  Lightbulb,
  Bookmark,
  Share2,
  Clock,
  ChevronRight,
  Terminal,
  Code2,
  Users,
  ThumbsUp,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useProblemStore } from '../store/useProblemStore';
import { useExecutionStore } from '../store/useExecutionStore';
import { getLanguageId } from '../lib/lang';
import Submission from '../components/Submission';
import { useSubmissionStore } from '../store/useSubmissionStore';
import SubmissionsList from '../components/SubmissionsList';
import ProblemDiscussionPanel from '../components/ProblemDiscussionPanel';

const bookmarkKey = 'leetlab-bookmarks';

const ProblemPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isBookMarked, setisBookMarked] = useState(false);
  const [testCases, setTestCases] = useState([]);

  const {
    submission: submissions,
    isSubmissionLoading,
    submissionCount,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
  } = useSubmissionStore();

  const { isExecuting, excuteCode, submission } = useExecutionStore();

  useEffect(() => {
    if (!id) return;
    getProblemById(id);
    getSubmissionCountForProblem(id);
  }, [id, getProblemById, getSubmissionCountForProblem]);

  useEffect(() => {
    if (!id) return;

    try {
      const savedBookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
      setisBookMarked(savedBookmarks.includes(id));
    } catch {
      setisBookMarked(false);
    }
  }, [id]);

  useEffect(() => {
    if (problem?.codeSnippets) {
      const defaultLang = Object.keys(problem.codeSnippets)[0] || 'javascript';
      setSelectedLanguage((prev) => (problem.codeSnippets[prev] ? prev : defaultLang));
      setCode(problem.codeSnippets[defaultLang] || '');
      setTestCases(
        problem.testcases?.map((tc) => ({
          input: tc.input,
          output: tc.output,
        })) || []
      );
    }
  }, [problem]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab && ['description', 'submissions', 'discussion', 'hints'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'submissions' && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id, getSubmissionForProblem]);

  const handleLanguageChange = (e) => {
    const nextLanguage = e.target.value;
    setSelectedLanguage(nextLanguage);
    setCode(problem?.codeSnippets?.[nextLanguage] ?? '');
  };

  const handleBookmarkToggle = () => {
    if (!id) return;

    try {
      const savedBookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
      const nextBookmarks = isBookMarked
        ? savedBookmarks.filter((problemId) => problemId !== id)
        : Array.from(new Set([...savedBookmarks, id]));

      localStorage.setItem(bookmarkKey, JSON.stringify(nextBookmarks));
      setisBookMarked(!isBookMarked);
      toast.success(isBookMarked ? 'Removed from bookmarks' : 'Saved locally');
    } catch {
      toast.error('Could not update bookmark');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Problem link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleRunCode = (e) => {
    e.preventDefault();

    try {
      if (!problem?.testcases?.length) {
        toast.error('No test cases available for this problem');
        return;
      }

      if (!code.trim()) {
        toast.error('Write some code before running');
        return;
      }

      const language_id = getLanguageId(selectedLanguage);
      const stdin = problem.testcases.map((tc) => tc.input);
      const expected_output = problem.testcases.map((tc) => tc.output);

      excuteCode(code, language_id, stdin, expected_output, id);
    } catch (err) {
      console.log('Error Executing Code in HandleCode', err);
      toast.error('Could not execute code');
    }
  };

  if (isProblemLoading || !problem) {
    return (
      <div className="grid min-h-[calc(100vh-8rem)] place-items-center">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose max-w-none">
            <p className="mb-6 text-lg">{problem?.description}</p>

            {problem?.examples && (
              <>
                <h3 className="mb-4 text-xl font-bold">Examples:</h3>
                {Object.entries(problem.examples).map(([lang, example]) => (
                  <div key={lang} className="mb-6 rounded-xl bg-base-200 p-6 font-mono">
                    <div className="mb-4">
                      <div className="mb-2 text-base font-semibold text-indigo-300">Input:</div>
                      <span className="rounded-lg bg-black/90 px-4 py-1 font-semibold text-white">{example.input}</span>
                    </div>
                    <div className="mb-4">
                      <div className="mb-2 text-base font-semibold text-indigo-300">Output:</div>
                      <span className="rounded-lg bg-black/90 px-4 py-1 font-semibold text-white">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <div className="mb-2 text-base font-semibold text-emerald-300">Explanation:</div>
                        <p className="text-lg text-base-content/70">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {problem?.constraints && (
              <>
                <h3 className="mb-4 text-xl font-bold">Constraints:</h3>
                <div className="mb-6 rounded-xl bg-base-200 p-6">
                  <span className="rounded-lg bg-black/90 px-4 py-1 text-lg font-semibold text-white">{problem.constraints}</span>
                </div>
              </>
            )}
          </div>
        );
      case 'submissions':
        return <SubmissionsList submissions={submissions} isSubmissionLoading={isSubmissionLoading} />;
      case 'discussion':
        return <ProblemDiscussionPanel problemId={problem.id} compact />;
      case 'hints':
        return (
          <div className="p-4">
            {problem?.hints ? (
              <div className="rounded-xl bg-base-200 p-6">
                <span className="rounded-lg bg-black/90 px-4 py-1 text-lg font-semibold text-white">{problem.hints}</span>
              </div>
            ) : (
              <div className="text-center text-base-content/70">No hints available</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <nav className="mb-4 flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100/90 px-5 py-4 shadow-xl backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-primary/90 hover:text-primary">
            <Home className="h-5 w-5" />
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm font-medium">Problems</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{problem.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/65">
              <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1">
                <Clock className="h-4 w-4" />
                Updated{' '}
                {new Date(problem.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1">
                <Users className="h-4 w-4" />
                {submissionCount ?? 0} submissions
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1">
                <ThumbsUp className="h-4 w-4" />
                Ready to solve
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`btn btn-ghost btn-circle border border-base-300 ${isBookMarked ? 'text-primary' : ''}`}
            onClick={handleBookmarkToggle}
            aria-label="Bookmark problem"
            type="button"
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button className="btn btn-ghost btn-circle border border-base-300" onClick={handleShare} aria-label="Share problem" type="button">
            <Share2 className="h-5 w-5" />
          </button>
          <select className="select select-bordered select-primary min-w-40" value={selectedLanguage} onChange={handleLanguageChange}>
            {Object.keys(problem?.codeSnippets || {}).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card border border-base-300 bg-base-100/95 shadow-xl backdrop-blur">
          <div className="card-body p-0">
            <div className="tabs tabs-bordered">
              <button className={`tab gap-2 ${activeTab === 'description' ? 'tab-active' : ''}`} onClick={() => setActiveTab('description')} type="button">
                <FileText className="h-4 w-4" />
                Description
              </button>
              <button className={`tab gap-2 ${activeTab === 'submissions' ? 'tab-active' : ''}`} onClick={() => setActiveTab('submissions')} type="button">
                <Code2 className="h-4 w-4" />
                Submissions
              </button>
              <button className={`tab gap-2 ${activeTab === 'discussion' ? 'tab-active' : ''}`} onClick={() => setActiveTab('discussion')} type="button">
                <MessageSquare className="h-4 w-4" />
                Discussion
              </button>
              <button className={`tab gap-2 ${activeTab === 'hints' ? 'tab-active' : ''}`} onClick={() => setActiveTab('hints')} type="button">
                <Lightbulb className="h-4 w-4" />
                Hints
              </button>
            </div>
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100/95 shadow-xl backdrop-blur">
          <div className="card-body p-0">
            <div className="tabs tabs-bordered px-6 pt-4">
              <button className="tab gap-3 tab-active" type="button">
                <Terminal className="h-4 w-4" />
                Code Editor
              </button>
            </div>

            <div className="h-[600px] w-full">
              <Editor
                height="100%"
                language={selectedLanguage.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="border-t border-base-300 bg-base-200/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className={`btn btn-primary gap-2 ${isExecuting ? 'loading' : ''}`} onClick={handleRunCode} disabled={isExecuting} type="button">
                  {!isExecuting && <Play className="h-4 w-4" />}
                  Run Code
                </button>
                <button className="btn btn-success gap-2" onClick={handleRunCode} disabled={isExecuting} type="button">
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 border border-base-300 bg-base-100/95 shadow-xl backdrop-blur">
        <div className="card-body">
          {submission ? (
            <Submission />
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Test Cases</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Expected Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testCases.map((testCase, index) => (
                      <tr key={index}>
                        <td className="font-mono">{testCase.input}</td>
                        <td className="font-mono">{testCase.output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
>>>>>>> fabcf1d (added homepage,dashboard)
