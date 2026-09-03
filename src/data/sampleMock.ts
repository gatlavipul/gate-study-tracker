export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'

export interface MockQuestion {
  id: string
  subject: string
  type: QuestionType
  text: string
  options?: string[] // For MCQ/MSQ
  correctAnswer: string | string[] // string for MCQ/NAT, string[] for MSQ
  marks: number
  negativeMarks: number
}

export const sampleMockQuestions: MockQuestion[] = [
  {
    id: "q1",
    subject: "Programming",
    type: "MCQ",
    text: "Consider the following C program:\n\n```c\n#include <stdio.h>\nint main() {\n  int arr[] = {10, 20, 30, 40, 50};\n  int *ptr = arr;\n  printf(\"%d\\n\", *(ptr + 2) + 1);\n  return 0;\n}\n```\nWhat is the output?",
    options: ["21", "30", "31", "40"],
    correctAnswer: "31",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    id: "q2",
    subject: "Programming",
    type: "NAT",
    text: "An algorithm takes O(N log N) time. For N=1000, it takes 10 seconds. Assuming the constant of proportionality remains the same, how many seconds will it take for N=2000? (Round off to 1 decimal place)",
    correctAnswer: "21.9",
    marks: 2,
    negativeMarks: 0
  },
  {
    id: "q3",
    subject: "OS",
    type: "MSQ",
    text: "Which of the following conditions are strictly necessary for a deadlock to occur?\n(A) Mutual Exclusion\n(B) Preemption\n(C) Hold and Wait\n(D) Circular Wait",
    options: ["Mutual Exclusion", "Preemption", "Hold and Wait", "Circular Wait"],
    correctAnswer: ["Mutual Exclusion", "Hold and Wait", "Circular Wait"],
    marks: 2,
    negativeMarks: 0
  },
  {
    id: "q4",
    subject: "Networks",
    type: "MCQ",
    text: "In the TCP/IP model, which layer is responsible for end-to-end communication and reliability?",
    options: ["Network Layer", "Transport Layer", "Data Link Layer", "Application Layer"],
    correctAnswer: "Transport Layer",
    marks: 1,
    negativeMarks: 0.33
  },
  {
    id: "q5",
    subject: "Math",
    type: "MCQ",
    text: "A graph G has 10 vertices and 15 edges. The sum of the degrees of all vertices in G is:",
    options: ["15", "20", "30", "45"],
    correctAnswer: "30",
    marks: 1,
    negativeMarks: 0.33
  }
]
