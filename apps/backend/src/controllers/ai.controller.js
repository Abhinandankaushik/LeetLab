import { db } from "@repo/db";

export const getCodeReview = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: { problem: true },
    });

    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    // In a real scenario, you'd call an LLM (Gemini/GPT) here.
    // For now, we'll return a structured AI review simulation.
    
    const review = {
      overall: "The code is functional and passes all test cases. However, there are opportunities for optimization in time complexity.",
      optimizations: [
        {
          title: "Time Complexity",
          description: "Currently using nested loops which results in O(n^2). Consider using a Hash Map for O(n).",
        },
        {
          title: "Memory Usage",
          description: "Memory usage is efficient, but you can avoid creating unnecessary temporary arrays.",
        }
      ],
      score: 85,
      suggestions: "Try to implement the solution using a single pass approach."
    };

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateProblem = async (req, res) => {
  try {
    const { problemName } = req.body;
    if (!problemName) return res.status(400).json({ success: false, message: "Problem name is required" });

    // In a real scenario, you'd prompt an LLM here with the problem name.
    // The prompt would ask for a complete JSON following the Problem schema.
    
    // Simulating AI generation for a few common problems or a generic template
    const isMock = true;
    let problemData = {};

    if (problemName.toLowerCase().includes("reverse") && problemName.toLowerCase().includes("string")) {
      problemData = {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array **in-place** with `O(1)` extra memory.",
        defficulty: "EASY",
        tags: ["String", "Two Pointers"],
        constraints: "- `1 <= s.length <= 10^5`\n- `s[i]` is a printable ascii character.",
        hints: "The entire logic revolves around swapping characters from both ends.",
        editorial: "Use two pointers, one at the start and one at the end, and swap them as they move towards each other.",
        examples: {
          JAVASCRIPT: {
            input: 's = ["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]',
            explanation: "The input array is modified in-place."
          }
        },
        testcases: [
          { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
          { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
        ],
        codeSnippets: {
          JAVASCRIPT: "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nvar reverseString = function(s) {\n    \n};",
          PYTHON: "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        \"\"\"\n        Do not return anything, modify s in-place instead.\n        \"\"\"\n        ",
          CPP: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
        },
        referenceSolutions: {
          JAVASCRIPT: "var reverseString = function(s) {\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        [s[left], s[right]] = [s[right], s[left]];\n        left++;\n        right--;\n    }\n};",
          PYTHON: "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        s.reverse()",
          CPP: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int n = s.size();\n        for (int i = 0; i < n / 2; i++) {\n            swap(s[i], s[n - i - 1]);\n        }\n    }\n};"
        }
      };
    } else {
      // Generic template for other problems
      problemData = {
        title: problemName,
        description: `Implement the logic for ${problemName}. Ensure optimal time and space complexity.`,
        defficulty: "MEDIUM",
        tags: ["General", "Algorithm"],
        constraints: "Standard constraints apply.",
        hints: "Think about edge cases.",
        testcases: [{ input: "1", output: "1" }],
        examples: { JAVASCRIPT: { input: "1", output: "1", explanation: "Sample output" } },
        codeSnippets: { JAVASCRIPT: "function solve() {\n\n}" },
        referenceSolutions: { JAVASCRIPT: "function solve() {\n  return 1;\n}" }
      };
    }

    res.status(200).json({ success: true, problem: problemData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
