<<<<<<< HEAD
import React from 'react'
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import {
    Plus,
    Trash2,
    Code2,
    FileText,
    Lightbulb,
    BookOpen,
    CheckCircle2,
    Download,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useState } from 'react';
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const problemSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    defficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    constraints: z.string().min(1, "Constraints are required"),
    hints: z.string().optional(),
    editorial: z.string().optional(),
    testcases: z
        .array(
            z.object({
                input: z.string().min(1, "Input is required"),
                output: z.string().min(1, "Output is required"),
            })
        )
        .min(1, "At least one test case is required"),
    examples: z.object({
        JAVASCRIPT: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
        PYTHON: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
        JAVA: z.object({
            input: z.string().min(1, "Input is required"),
            output: z.string().min(1, "Output is required"),
            explanation: z.string().optional(),
        }),
    }),
    codeSnippets: z.object({
        JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
        PYTHON: z.string().min(1, "Python code snippet is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),
    referenceSolutions: z.object({
        JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
        PYTHON: z.string().min(1, "Python solution is required"),
        JAVA: z.string().min(1, "Java solution is required"),
    }),
});


const sampledpData = {
    title: "Climbing Stairs",
    category: "dp", // Dynamic Programming
    description:
        "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    defficulty: "EASY",
    tags: ["Dynamic Programming", "Math", "Memoization"],
    constraints: "1 <= n <= 45",
    hints:
        "To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.",
    editorial:
        "This is a classic dynamic programming problem. The number of ways to reach the nth step is the sum of the number of ways to reach the (n-1)th step and the (n-2)th step, forming a Fibonacci-like sequence.",
    testcases: [
        {
            input: "2",
            output: "2",
        },
        {
            input: "3",
            output: "3",
        },
        {
            input: "4",
            output: "5",
        },
    ],
    examples: {
        JAVASCRIPT: {
            input: "n = 2",
            output: "2",
            explanation:
                "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps",
        },
        PYTHON: {
            input: "n = 3",
            output: "3",
            explanation:
                "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
        },
        JAVA: {
            input: "n = 4",
            output: "5",
            explanation:
                "There are five ways to climb to the top:\n1. 1 step + 1 step + 1 step + 1 step\n2. 1 step + 1 step + 2 steps\n3. 1 step + 2 steps + 1 step\n4. 2 steps + 1 step + 1 step\n5. 2 steps + 2 steps",
        },
    },
    codeSnippets: {
        JAVASCRIPT: `/**
* @param {number} n
* @return {number}
*/
function climbStairs(n) {
// Write your code here
=======
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Code2, FileText, Lightbulb, BookOpen, CheckCircle2, Download, Brain } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const problemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  defficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  constraints: z.string().min(1, 'Constraints are required'),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testcases: z
    .array(
      z.object({
        input: z.string().min(1, 'Input is required'),
        output: z.string().min(1, 'Output is required'),
      })
    )
    .min(1, 'At least one test case is required'),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().optional(),
    }),
    JAVA: z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, 'JavaScript code snippet is required'),
    PYTHON: z.string().min(1, 'Python code snippet is required'),
    JAVA: z.string().min(1, 'Java solution is required'),
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, 'JavaScript solution is required'),
    PYTHON: z.string().min(1, 'Python solution is required'),
    JAVA: z.string().min(1, 'Java solution is required'),
  }),
});

const sampledpData = {
  title: 'Climbing Stairs',
  category: 'dp',
  description:
    'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
  defficulty: 'EASY',
  tags: ['Dynamic Programming', 'Math', 'Memoization'],
  constraints: '1 <= n <= 45',
  hints: 'To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.',
  editorial:
    'This is a classic dynamic programming problem. The number of ways to reach the nth step is the sum of the number of ways to reach the (n-1)th step and the (n-2)th step, forming a Fibonacci-like sequence.',
  testcases: [
    { input: '2', output: '2' },
    { input: '3', output: '3' },
    { input: '4', output: '5' },
  ],
  examples: {
    JAVASCRIPT: {
      input: 'n = 2',
      output: '2',
      explanation: 'There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps',
    },
    PYTHON: {
      input: 'n = 3',
      output: '3',
      explanation:
        'There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step',
    },
    JAVA: {
      input: 'n = 4',
      output: '5',
      explanation:
        'There are five ways to climb to the top:\n1. 1 step + 1 step + 1 step + 1 step\n2. 1 step + 1 step + 2 steps\n3. 1 step + 2 steps + 1 step\n4. 2 steps + 1 step + 1 step\n5. 2 steps + 2 steps',
    },
  },
  codeSnippets: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your code here
>>>>>>> fabcf1d (added homepage,dashboard)
}

// Parse input and execute
const readline = require('readline');
const rl = readline.createInterface({
<<<<<<< HEAD
input: process.stdin,
output: process.stdout,
terminal: false
});

rl.on('line', (line) => {
const n = parseInt(line.trim());
const result = climbStairs(n);

console.log(result);
rl.close();
});`,
        PYTHON: `class Solution:
  def climbStairs(self, n: int) -> int:
      # Write your code here
      pass

# Input parsing
if __name__ == "__main__":
  import sys
  
  # Parse input
  n = int(sys.stdin.readline().strip())
  
  # Solve
  sol = Solution()
  result = sol.climbStairs(n)
  
  # Print result
  print(result)`,
        JAVA: `import java.util.Scanner;

class Main {
  public int climbStairs(int n) {
      // Write your code here
      return 0;
  }
  
  public static void main(String[] args) {
      Scanner scanner = new Scanner(System.in);
      int n = Integer.parseInt(scanner.nextLine().trim());
      
      // Use Main class instead of Solution
      Main main = new Main();
      int result = main.climbStairs(n);
      
      System.out.println(result);
      scanner.close();
  }
}`,
    },
    referenceSolutions: {
        JAVASCRIPT: `/**
* @param {number} n
* @return {number}
*/
function climbStairs(n) {
// Base cases
if (n <= 2) {
  return n;
}

// Dynamic programming approach
let dp = new Array(n + 1);
dp[1] = 1;
dp[2] = 2;

for (let i = 3; i <= n; i++) {
  dp[i] = dp[i - 1] + dp[i - 2];
}

return dp[n];

/* Alternative approach with O(1) space
let a = 1; // ways to climb 1 step
let b = 2; // ways to climb 2 steps

for (let i = 3; i <= n; i++) {
  let temp = a + b;
  a = b;
  b = temp;
}

return n === 1 ? a : b;
*/
=======
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const n = parseInt(line.trim());
  const result = climbStairs(n);

  console.log(result);
  rl.close();
});`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass

# Input parsing
if __name__ == "__main__":
    import sys
    
    # Parse input
    n = int(sys.stdin.readline().strip())
    
    # Solve
    sol = Solution()
    result = sol.climbStairs(n)
    
    # Print result
    print(result)`,
    JAVA: `import java.util.Scanner;

class Main {
    public int climbStairs(int n) {
        // Write your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        
        // Use Main class instead of Solution
        Main main = new Main();
        int result = main.climbStairs(n);
        
        System.out.println(result);
        scanner.close();
    }
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Base cases
  if (n <= 2) {
    return n;
  }

  // Dynamic programming approach
  let dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
>>>>>>> fabcf1d (added homepage,dashboard)
}

// Parse input and execute
const readline = require('readline');
const rl = readline.createInterface({
<<<<<<< HEAD
input: process.stdin,
output: process.stdout,
terminal: false
});

rl.on('line', (line) => {
const n = parseInt(line.trim());
const result = climbStairs(n);

console.log(result);
rl.close();
});`,
        PYTHON: `class Solution:
  def climbStairs(self, n: int) -> int:
      # Base cases
      if n <= 2:
          return n
      
      # Dynamic programming approach
      dp = [0] * (n + 1)
      dp[1] = 1
      dp[2] = 2
      
      for i in range(3, n + 1):
          dp[i] = dp[i - 1] + dp[i - 2]
      
      return dp[n]
      
      # Alternative approach with O(1) space
      # a, b = 1, 2
      # 
      # for i in range(3, n + 1):
      #     a, b = b, a + b
      # 
      # return a if n == 1 else b

# Input parsing
if __name__ == "__main__":
  import sys
  
  # Parse input
  n = int(sys.stdin.readline().strip())
  
  # Solve
  sol = Solution()
  result = sol.climbStairs(n)
  
  # Print result
  print(result)`,
        JAVA: `import java.util.Scanner;

class Main {
  public int climbStairs(int n) {
      // Base cases
      if (n <= 2) {
          return n;
      }
      
      // Dynamic programming approach
      int[] dp = new int[n + 1];
      dp[1] = 1;
      dp[2] = 2;
      
      for (int i = 3; i <= n; i++) {
          dp[i] = dp[i - 1] + dp[i - 2];
      }
      
      return dp[n];
      
      /* Alternative approach with O(1) space
      int a = 1; // ways to climb 1 step
      int b = 2; // ways to climb 2 steps
      
      for (int i = 3; i <= n; i++) {
          int temp = a + b;
          a = b;
          b = temp;
      }
      
      return n == 1 ? a : b;
      */
  }
  
  public static void main(String[] args) {
      Scanner scanner = new Scanner(System.in);
      int n = Integer.parseInt(scanner.nextLine().trim());
      
      // Use Main class instead of Solution
      Main main = new Main();
      int result = main.climbStairs(n);
      
      System.out.println(result);
      scanner.close();
  }
}`,
    },
};

// Sample problem data for another type of question
const sampleStringProblem = {
    title: "Valid Palindrome",
    description:
        "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
    defficulty: "EASY",
    tags: ["String", "Two Pointers"],
    constraints:
        "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
    hints:
        "Consider using two pointers, one from the start and one from the end, moving towards the center.",
    editorial:
        "We can use two pointers approach to check if the string is a palindrome. One pointer starts from the beginning and the other from the end, moving towards each other.",
    testcases: [
        {
            input: "A man, a plan, a canal: Panama",
            output: "true",
        },
        {
            input: "race a car",
            output: "false",
        },
        {
            input: " ",
            output: "true",
        },
    ],
    examples: {
        JAVASCRIPT: {
            input: 's = "A man, a plan, a canal: Panama"',
            output: "true",
            explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
        PYTHON: {
            input: 's = "A man, a plan, a canal: Panama"',
            output: "true",
            explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
        JAVA: {
            input: 's = "A man, a plan, a canal: Panama"',
            output: "true",
            explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
    },
    codeSnippets: {
        JAVASCRIPT: `/**
=======
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const n = parseInt(line.trim());
  const result = climbStairs(n);

  console.log(result);
  rl.close();
});`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Base cases
        if n <= 2:
            return n
        
        # Dynamic programming approach
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        
        return dp[n]

# Input parsing
if __name__ == "__main__":
    import sys
    
    # Parse input
    n = int(sys.stdin.readline().strip())
    
    # Solve
    sol = Solution()
    result = sol.climbStairs(n)
    
    # Print result
    print(result)`,
    JAVA: `import java.util.Scanner;

class Main {
    public int climbStairs(int n) {
        // Base cases
        if (n <= 2) {
            return n;
        }
        
        // Dynamic programming approach
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        return dp[n];
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        
        // Use Main class instead of Solution
        Main main = new Main();
        int result = main.climbStairs(n);
        
        System.out.println(result);
        scanner.close();
    }
}`,
  },
};

const sampleStringProblem = {
  title: 'Valid Palindrome',
  description:
    'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.',
  defficulty: 'EASY',
  tags: ['String', 'Two Pointers'],
  constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
  hints: 'Consider using two pointers, one from the start and one from the end, moving towards the center.',
  editorial:
    'We can use two pointers approach to check if the string is a palindrome. One pointer starts from the beginning and the other from the end, moving towards each other.',
  testcases: [
    { input: 'A man, a plan, a canal: Panama', output: 'true' },
    { input: 'race a car', output: 'false' },
    { input: ' ', output: 'true' },
  ],
  examples: {
    JAVASCRIPT: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: 'true',
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    PYTHON: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: 'true',
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    JAVA: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: 'true',
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
  },
  codeSnippets: {
    JAVASCRIPT: `/**
>>>>>>> fabcf1d (added homepage,dashboard)
   * @param {string} s
   * @return {boolean}
   */
  function isPalindrome(s) {
    // Write your code here
  }
  
  // Add readline for dynamic input handling
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  // Process input line
  rl.on('line', (line) => {
    // Call solution with the input string
    const result = isPalindrome(line);
    
    // Output the result
    console.log(result ? "true" : "false");
    rl.close();
  });`,
<<<<<<< HEAD
        PYTHON: `class Solution:
      def isPalindrome(self, s: str) -> bool:
          # Write your code here
          pass
  
  # Input parsing
  if __name__ == "__main__":
      import sys
      # Read the input string
      s = sys.stdin.readline().strip()
      
      # Call solution
      sol = Solution()
      result = sol.isPalindrome(s)
      
      # Output result
      print(str(result).lower())  # Convert True/False to lowercase true/false`,
        JAVA: `import java.util.Scanner;
=======
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        pass

# Input parsing
if __name__ == "__main__":
    import sys
    # Read the input string
    s = sys.stdin.readline().strip()
    
    # Call solution
    sol = Solution()
    result = sol.isPalindrome(s)
    
    # Output result
    print(str(result).lower())`,
    JAVA: `import java.util.Scanner;
>>>>>>> fabcf1d (added homepage,dashboard)

public class Main {
    public static String preprocess(String s) {
        return s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public static boolean isPalindrome(String s) {
       
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();

        boolean result = isPalindrome(input);
        System.out.println(result ? "true" : "false");
    }
<<<<<<< HEAD
}
`,
    },
    referenceSolutions: {
        JAVASCRIPT: `/**
=======
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `/**
>>>>>>> fabcf1d (added homepage,dashboard)
   * @param {string} s
   * @return {boolean}
   */
  function isPalindrome(s) {
    // Convert to lowercase and remove non-alphanumeric characters
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if it's a palindrome
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
      if (s[left] !== s[right]) {
        return false;
      }
      left++;
      right--;
    }
    
    return true;
  }
  
  // Add readline for dynamic input handling
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  // Process input line
  rl.on('line', (line) => {
    // Call solution with the input string
    const result = isPalindrome(line);
    
    // Output the result
    console.log(result ? "true" : "false");
    rl.close();
  });`,
<<<<<<< HEAD
        PYTHON: `class Solution:
      def isPalindrome(self, s: str) -> bool:
          # Convert to lowercase and keep only alphanumeric characters
          filtered_chars = [c.lower() for c in s if c.isalnum()]
          
          # Check if it's a palindrome
          return filtered_chars == filtered_chars[::-1]
  
  # Input parsing
  if __name__ == "__main__":
      import sys
      # Read the input string
      s = sys.stdin.readline().strip()
      
      # Call solution
      sol = Solution()
      result = sol.isPalindrome(s)
      
      # Output result
      print(str(result).lower())  # Convert True/False to lowercase true/false`,
        JAVA: `import java.util.Scanner;
=======
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Convert to lowercase and keep only alphanumeric characters
        filtered_chars = [c.lower() for c in s if c.isalnum()]
        
        # Check if it's a palindrome
        return filtered_chars == filtered_chars[::-1]

# Input parsing
if __name__ == "__main__":
    import sys
    # Read the input string
    s = sys.stdin.readline().strip()
    
    # Call solution
    sol = Solution()
    result = sol.isPalindrome(s)
    
    # Output result
    print(str(result).lower())`,
    JAVA: `import java.util.Scanner;
>>>>>>> fabcf1d (added homepage,dashboard)

public class Main {
    public static String preprocess(String s) {
        return s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public static boolean isPalindrome(String s) {
        s = preprocess(s);
        int left = 0, right = s.length() - 1;

        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;
            left++;
            right--;
        }

        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();

        boolean result = isPalindrome(input);
        System.out.println(result ? "true" : "false");
    }
<<<<<<< HEAD
}
`,
    },
};

const CreateProblemForm = () => {
    const [sampleType, setSampleType] = useState("DP")
    const navigation = useNavigate();
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm(
        {
            resolver: zodResolver(problemSchema),
            defaultValues: {
                testcases: [{ input: "", output: "" }],
                tags: [""],
                examples: {
                    JAVASCRIPT: { input: "", output: "", explanation: "" },
                    PYTHON: { input: "", output: "", explanation: "" },
                    JAVA: { input: "", output: "", explanation: "" },
                },
                codeSnippets: {
                    JAVASCRIPT: "function solution() {\n  // Write your code here\n}",
                    PYTHON: "def solution():\n    # Write your code here\n    pass",
                    JAVA: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
                },
                referenceSolutions: {
                    JAVASCRIPT: "// Add your reference solution here",
                    PYTHON: "# Add your reference solution here",
                    JAVA: "// Add your reference solution here",
                },
            }
        }
    )

    const {
        fields: testCaseFields,
        append: appendTestCase,
        remove: removeTestCase,
        replace: replacetestcases,
    } = useFieldArray({
        control,
        name: "testcases",
    });

    const {
        fields: tagFields,
        append: appendTag,
        remove: removeTag,
        replace: replaceTags,
    } = useFieldArray({
        control,
        name: "tags",
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (value) => {
        try {
            setIsLoading(true)
            const res = await axiosInstance.post("/problems/create-problem", value)
            console.log(res.data);
            toast.success(res.data.message || "Problem Created successfully⚡");
            navigation("/");

        } catch (error) {
            console.log(error);
            toast.error("Error creating problem")
        }
        finally {
            setIsLoading(false);
        }
    }

    const loadSampleData = () => {
        const sampleData = sampleType === "DP" ? sampledpData : sampleStringProblem

        replaceTags(sampleData.tags.map((tag) => tag));
        replacetestcases(sampleData.testcases.map((tc) => tc));

        // Reset the form with sample data
        reset(sampleData);
    }

    return (
        <div className='container mx-auto py-8 px-4 max-w-7xl'>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b">
                        <h2 className="card-title text-2xl md:text-3xl flex items-center gap-3">
                            <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                            Create Problem
                        </h2>

                        <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
                            <div className="join">
                                <button
                                    type="button"
                                    className={`btn join-item ${sampleType === "DP" ? "btn-active" : ""
                                        }`}
                                    onClick={() => setSampleType("DP")}
                                >
                                    DP Problem
                                </button>
                                <button
                                    type="button"
                                    className={`btn join-item ${sampleType === "string" ? "btn-active" : ""
                                        }`}
                                    onClick={() => setSampleType("string")}
                                >
                                    String Problem
                                </button>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary gap-2"
                                onClick={loadSampleData}
                            >
                                <Download className="w-4 h-4" />
                                Load Sample
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text text-base md:text-lg font-semibold">
                                        Title
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full text-base md:text-lg"
                                    {...register("title")}
                                    placeholder="Enter problem title"
                                />
                                {errors.title && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.title.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text text-base md:text-lg font-semibold">
                                        Description
                                    </span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered min-h-32 w-full text-base md:text-lg p-4 resize-y"
                                    {...register("description")}
                                    placeholder="Enter problem description"
                                />
                                {errors.description && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.description.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base md:text-lg font-semibold">
                                        Defficulty
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full text-base md:text-lg"
                                    {...register("defficulty")}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                                {errors.defficulty && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.defficulty.message}
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="card bg-base-200 p-4 md:p-6 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Tags
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => appendTag("")}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Tag
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tagFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            className="input input-bordered flex-1"
                                            {...register(`tags.${index}`)}
                                            placeholder="Enter tag"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-square btn-sm"
                                            onClick={() => removeTag(index)}
                                            disabled={tagFields.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4 text-error" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {errors.tags && (
                                <div className="mt-2">
                                    <span className="text-error text-sm">
                                        {errors.tags.message}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Test Cases */}
                        <div className="card bg-base-200 p-4 md:p-6 shadow-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Test Cases
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => appendTestCase({ input: "", output: "" })}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Test Case
                                </button>
                            </div>
                            <div className="space-y-6">
                                {testCaseFields.map((field, index) => (
                                    <div key={field.id} className="card bg-base-100 shadow-md">
                                        <div className="card-body p-4 md:p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-base md:text-lg font-semibold">
                                                    Test Case #{index + 1}
                                                </h4>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm text-error"
                                                    onClick={() => removeTestCase(index)}
                                                    disabled={testCaseFields.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">
                                                            Input
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                                        {...register(`testcases.${index}.input`)}
                                                        placeholder="Enter test case input"
                                                    />
                                                    {errors.testcases?.[index]?.input && (
                                                        <label className="label">
                                                            <span className="label-text-alt text-error">
                                                                {errors.testcases[index].input.message}
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text font-medium">
                                                            Expected Output
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                                        {...register(`testcases.${index}.output`)}
                                                        placeholder="Enter expected output"
                                                    />
                                                    {errors.testcases?.[index]?.output && (
                                                        <label className="label">
                                                            <span className="label-text-alt text-error">
                                                                {errors.testcases[index].output.message}
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.testcases && !Array.isArray(errors.testcases) && (
                                <div className="mt-2">
                                    <span className="text-error text-sm">
                                        {errors.testcases.message}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Code Editor Sections */}
                        <div className="space-y-8">
                            {["JAVASCRIPT", "PYTHON", "JAVA"].map((language) => (
                                <div
                                    key={language}
                                    className="card bg-base-200 p-4 md:p-6 shadow-md"
                                >
                                    <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                                        <Code2 className="w-5 h-5" />
                                        {language}
                                    </h3>

                                    <div className="space-y-6">
                                        {/* Starter Code */}
                                        <div className="card bg-base-100 shadow-md">
                                            <div className="card-body p-4 md:p-6">
                                                <h4 className="font-semibold text-base md:text-lg mb-4">
                                                    Starter Code Template
                                                </h4>
                                                <div className="border rounded-md overflow-hidden">
                                                    <Controller
                                                        name={`codeSnippets.${language}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Editor
                                                                height="300px"
                                                                language={language.toLowerCase()}
                                                                theme="vs-dark"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                options={{
                                                                    minimap: { enabled: false },
                                                                    fontSize: 14,
                                                                    lineNumbers: "on",
                                                                    roundedSelection: false,
                                                                    scrollBeyondLastLine: false,
                                                                    automaticLayout: true,
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.codeSnippets?.[language] && (
                                                    <div className="mt-2">
                                                        <span className="text-error text-sm">
                                                            {errors.codeSnippets[language].message}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reference Solution */}
                                        <div className="card bg-base-100 shadow-md">
                                            <div className="card-body p-4 md:p-6">
                                                <h4 className="font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                                    Reference Solution
                                                </h4>
                                                <div className="border rounded-md overflow-hidden">
                                                    <Controller
                                                        name={`referenceSolutions.${language}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Editor
                                                                height="300px"
                                                                language={language.toLowerCase()}
                                                                theme="vs-dark"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                options={{
                                                                    minimap: { enabled: false },
                                                                    fontSize: 14,
                                                                    lineNumbers: "on",
                                                                    roundedSelection: false,
                                                                    scrollBeyondLastLine: false,
                                                                    automaticLayout: true,
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.referenceSolutions?.[language] && (
                                                    <div className="mt-2">
                                                        <span className="text-error text-sm">
                                                            {errors.referenceSolutions[language].message}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Examples */}
                                        <div className="card bg-base-100 shadow-md">
                                            <div className="card-body p-4 md:p-6">
                                                <h4 className="font-semibold text-base md:text-lg mb-4">
                                                    Example
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text font-medium">
                                                                Input
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            className="textarea textarea-bordered min-h-20 w-full p-3 resize-y"
                                                            {...register(`examples.${language}.input`)}
                                                            placeholder="Example input"
                                                        />
                                                        {errors.examples?.[language]?.input && (
                                                            <label className="label">
                                                                <span className="label-text-alt text-error">
                                                                    {errors.examples[language].input.message}
                                                                </span>
                                                            </label>
                                                        )}
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label">
                                                            <span className="label-text font-medium">
                                                                Output
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            className="textarea textarea-bordered min-h-20 w-full p-3 resize-y"
                                                            {...register(`examples.${language}.output`)}
                                                            placeholder="Example output"
                                                        />
                                                        {errors.examples?.[language]?.output && (
                                                            <label className="label">
                                                                <span className="label-text-alt text-error">
                                                                    {errors.examples[language].output.message}
                                                                </span>
                                                            </label>
                                                        )}
                                                    </div>
                                                    <div className="form-control md:col-span-2">
                                                        <label className="label">
                                                            <span className="label-text font-medium">
                                                                Explanation
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                                            {...register(`examples.${language}.explanation`)}
                                                            placeholder="Explain the example"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Information */}
                        <div className="card bg-base-200 p-4 md:p-6 shadow-md">
                            <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-warning" />
                                Additional Information
                            </h3>
                            <div className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Constraints</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                        {...register("constraints")}
                                        placeholder="Enter problem constraints"
                                    />
                                    {errors.constraints && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.constraints.message}
                                            </span>
                                        </label>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">
                                            Hints (Optional)
                                        </span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered min-h-24 w-full p-3 resize-y"
                                        {...register("hints")}
                                        placeholder="Enter hints for solving the problem"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">
                                            Editorial (Optional)
                                        </span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered min-h-32 w-full p-3 resize-y"
                                        {...register("editorial")}
                                        placeholder="Enter problem editorial/solution explanation"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card-actions justify-end pt-4 border-t">
                            <button type="submit" className="btn btn-primary btn-lg gap-2">
                                {isLoading ? (
                                    <span className="loading loading-spinner text-white"></span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Create Problem
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateProblemForm
=======
}`,
  },
};

const CreateProblemForm = () => {
  const [sampleType, setSampleType] = useState('DP');
  const [aiProblemName, setAiProblemName] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      testcases: [{ input: '', output: '' }],
      tags: [''],
      examples: {
        JAVASCRIPT: { input: '', output: '', explanation: '' },
        PYTHON: { input: '', output: '', explanation: '' },
        JAVA: { input: '', output: '', explanation: '' },
      },
      codeSnippets: {
        JAVASCRIPT: 'function solution() {\n  // Write your code here\n}',
        PYTHON: 'def solution():\n    # Write your code here\n    pass',
        JAVA: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
      },
      referenceSolutions: {
        JAVASCRIPT: '// Add your reference solution here',
        PYTHON: '# Add your reference solution here',
        JAVA: '// Add your reference solution here',
      },
    },
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
    replace: replacetestcases,
  } = useFieldArray({
    control,
    name: 'testcases',
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
    replace: replaceTags,
  } = useFieldArray({
    control,
    name: 'tags',
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (value) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post('/problems/create-problem', value);
      toast.success(res.data.message || 'Problem Created successfully ⚡');
      navigate('/');
    } catch (error) {
      toast.error('Error creating problem');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = sampleType === 'DP' ? sampledpData : sampleStringProblem;
    replaceTags(sampleData.tags.map((tag) => tag));
    replacetestcases(sampleData.testcases.map((tc) => tc));
    reset(sampleData);
  };

  const loadAiProblem = async () => {
    if (!aiProblemName.trim()) {
      toast.error('Please enter a valid LeetCode problem name');
      return;
    }

    setIsAiLoading(true);
    try {
      // Mock API call to fetch LeetCode problem data
      // In a real implementation, this would call an API or scraper
      const response = await axiosInstance.get(`/leetcode/problem/${encodeURIComponent(aiProblemName)}`);
      const problemData = response.data;

      // Map LeetCode data to form schema (mocked transformation)
      const mappedData = {
        title: problemData.title || aiProblemName,
        description: problemData.description || '',
        defficulty: problemData.difficulty?.toUpperCase() || 'MEDIUM',
        tags: problemData.topics || ['Unknown'],
        constraints: problemData.constraints?.join('\n') || 'No constraints provided',
        hints: problemData.hints?.join('\n') || '',
        editorial: problemData.editorial || '',
        testcases: problemData.testCases || [{ input: '', output: '' }],
        examples: {
          JAVASCRIPT: problemData.examples?.JAVASCRIPT || { input: '', output: '', explanation: '' },
          PYTHON: problemData.examples?.PYTHON || { input: '', output: '', explanation: '' },
          JAVA: problemData.examples?.JAVA || { input: '', output: '', explanation: '' },
        },
        codeSnippets: {
          JAVASCRIPT: problemData.codeSnippets?.JAVASCRIPT || 'function solution() {\n  // Write your code here\n}',
          PYTHON: problemData.codeSnippets?.PYTHON || 'def solution():\n    # Write your code here\n    pass',
          JAVA: problemData.codeSnippets?.JAVA || 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
        },
        referenceSolutions: {
          JAVASCRIPT: problemData.referenceSolutions?.JAVASCRIPT || '// Add your reference solution here',
          PYTHON: problemData.referenceSolutions?.PYTHON || '# Add your reference solution here',
          JAVA: problemData.referenceSolutions?.JAVA || '// Add your reference solution here',
        },
      };

      replaceTags(mappedData.tags);
      replacetestcases(mappedData.testcases);
      reset(mappedData);
      toast.success(`Successfully loaded "${aiProblemName}" from LeetCode`);
    } catch (error) {
      toast.error(`Failed to load problem "${aiProblemName}". Please try again.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="container mx-auto py-12 px-4 max-w-7xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ scrollBehavior: 'smooth' }}
    >
      <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300" variants={itemVariants}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3" variants={itemVariants}>
            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Create Problem
          </motion.h2>
          <motion.div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0" variants={itemVariants}>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                  sampleType === 'DP'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSampleType('DP')}
              >
                DP Problem
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                  sampleType === 'string'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSampleType('string')}
              >
                String Problem
              </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
              onClick={loadSampleData}
            >
              <Download className="w-4 h-4 mr-2" />
              Load Sample
            </button>
          </motion.div>
        </div>

        <motion.div
          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md mb-8"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Problem Loader
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              placeholder="Enter LeetCode problem name (e.g., Two Sum)"
              value={aiProblemName}
              onChange={(e) => setAiProblemName(e.target.value)}
            />
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
              onClick={loadAiProblem}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Load from LeetCode
            </button>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-8" variants={containerVariants}>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Title
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                {...register('title')}
                placeholder="Enter problem title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Description
              </label>
              <textarea
                className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[120px]"
                {...register('description')}
                placeholder="Enter problem description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Difficulty
              </label>
              <select
                className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                {...register('defficulty')}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              {errors.defficulty && (
                <p className="mt-1 text-sm text-red-500">{errors.defficulty.message}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Tags
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
                onClick={() => appendTag('')}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Tag
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {tagFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    className="flex gap-2 items-center"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  >
                    <input
                      type="text"
                      className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      {...register(`tags.${index}`)}
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                      onClick={() => removeTag(index)}
                      disabled={tagFields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {errors.tags && (
              <p className="mt-2 text-sm text-red-500">{errors.tags.message}</p>
            )}
          </motion.div>

          <motion.div
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Test Cases
              </h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200"
                onClick={() => appendTestCase({ input: '', output: '' })}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Test Case
              </button>
            </div>
            <div className="space-y-6">
              <AnimatePresence>
                {testCaseFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Test Case #{index + 1}
                      </h4>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                        onClick={() => removeTestCase(index)}
                        disabled={testCaseFields.length === 1}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Input
                        </label>
                        <textarea
                          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[100px]"
                          {...register(`testcases.${index}.input`)}
                          placeholder="Enter test case input"
                        />
                        {errors.testcases?.[index]?.input && (
                          <p className="mt-1 text-sm text-red-500">{errors.testcases[index].input.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Expected Output
                        </label>
                        <textarea
                          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[100px]"
                          {...register(`testcases.${index}.output`)}
                          placeholder="Enter expected output"
                        />
                        {errors.testcases?.[index]?.output && (
                          <p className="mt-1 text-sm text-red-500">{errors.testcases[index].output.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {errors.testcases && !Array.isArray(errors.testcases) && (
              <p className="mt-2 text-sm text-red-500">{errors.testcases.message}</p>
            )}
          </motion.div>

          <div className="space-y-8">
            {['JAVASCRIPT', 'PYTHON', 'JAVA'].map((language) => (
              <motion.div
                key={language}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md"
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {language}
                </h3>

                <div className="space-y-6">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    variants={itemVariants}
                  >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Starter Code Template
                    </h4>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <Controller
                        name={`codeSnippets.${language}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="300px"
                            language={language.toLowerCase()}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: 'on',
                              roundedSelection: false,
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              padding: { top: 10, bottom: 10 },
                            }}
                          />
                        )}
                      />
                    </div>
                    {errors.codeSnippets?.[language] && (
                      <p className="mt-2 text-sm text-red-500">{errors.codeSnippets[language].message}</p>
                    )}
                  </motion.div>

                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    variants={itemVariants}
                  >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Reference Solution
                    </h4>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                      <Controller
                        name={`referenceSolutions.${language}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="300px"
                            language={language.toLowerCase()}
                            theme="vs-dark"
                            value={field.value}
                            onChange={field.onChange}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: 'on',
                              roundedSelection: false,
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              padding: { top: 10, bottom: 10 },
                            }}
                          />
                        )}
                      />
                    </div>
                    {errors.referenceSolutions?.[language] && (
                      <p className="mt-2 text-sm text-red-500">{errors.referenceSolutions[language].message}</p>
                    )}
                  </motion.div>

                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    variants={itemVariants}
                  >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Example
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Input
                        </label>
                        <textarea
                          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[80px]"
                          {...register(`examples.${language}.input`)}
                          placeholder="Example input"
                        />
                        {errors.examples?.[language]?.input && (
                          <p className="mt-1 text-sm text-red-500">{errors.examples[language].input.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Output
                        </label>
                        <textarea
                          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[80px]"
                          {...register(`examples.${language}.output`)}
                          placeholder="Example output"
                        />
                        {errors.examples?.[language]?.output && (
                          <p className="mt-1 text-sm text-red-500">{errors.examples[language].output.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          Explanation
                        </label>
                        <textarea
                          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[100px]"
                          {...register(`examples.${language}.explanation`)}
                          placeholder="Explain the example"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Additional Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Constraints
                </label>
                <textarea
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[100px]"
                  {...register('constraints')}
                  placeholder="Enter problem constraints"
                />
                {errors.constraints && (
                  <p className="mt-1 text-sm text-red-500">{errors.constraints.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Hints (Optional)
                </label>
                <textarea
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[100px]"
                  {...register('hints')}
                  placeholder="Enter hints for solving the problem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Editorial (Optional)
                </label>
                <textarea
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-y min-h-[120px]"
                  {...register('editorial')}
                  placeholder="Enter problem editorial/solution explanation"
                />
              </div>
            </div>
          </motion.div>

          <motion.div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700" variants={itemVariants}>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              Create Problem
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default CreateProblemForm;
>>>>>>> fabcf1d (added homepage,dashboard)
