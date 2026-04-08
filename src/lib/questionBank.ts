export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  conceptSummary: string;
}

export const questionBank: Question[] = [
  // OPERATING SYSTEMS
  {
    id: "os_e1",
    topic: "Operating Systems",
    difficulty: "easy",
    question: "Which of the following is not a valid state of a process in standard OS design?",
    options: ["Running", "Waiting", "Blocked", "Hidden"],
    correctIndex: 3,
    explanation: "Standard process states include New, Ready, Running, Waiting (or Blocked), and Terminated. 'Hidden' is not a standard process state.",
    hint: "Think about the lifecycle of a program from start to finish. Is avoiding visibility a state?",
    conceptSummary: "Process State Machine: New → Ready → Running → Terminated. Waiting occurs during I/O operations."
  },
  {
    id: "os_m1",
    topic: "Operating Systems",
    difficulty: "medium",
    question: "Consider a system with 3 processes sharing 4 resource instances of a single type. What is the maximum resource need of each process that strictly guarantees the system is deadlock-free?",
    options: ["1 instance", "2 instances", "3 instances", "4 instances"],
    correctIndex: 1,
    explanation: "If n processes share R resources, deadlock is avoided if Sum(Max need - 1) < R. Thus, 3 * (x - 1) < 4 ➔ 3x - 3 < 4 ➔ x < 2.33. Hence, maximum need x = 2.",
    hint: "Use the formula: Sum(Max need - 1) < Total Resources. Solve for 'Max need' (x).",
    conceptSummary: "Deadlock Avoidance: A state is safe if there exists a sequence of all processes such that each process can complete its execution."
  },
  {
    id: "os_h1",
    topic: "Operating Systems",
    difficulty: "hard",
    question: "A system uses a priority scheduling algorithm where a newly arrived process preempts the currently running process if its priority is higher. Which of the following conditions can definitively cause 'Starvation'?",
    options: ["Aging is implemented", "A steady stream of higher priority processes continuously arrives", "All processes have exactly the same priority", "The system enforces a strict Round-Robin time quantum"],
    correctIndex: 1,
    explanation: "Starvation occurs when a low-priority process is indefinitely delayed because a continuous stream of higher priority processes keeps preempting the CPU. Aging is the solution to starvation.",
    hint: "What happens to a low-priority task if VIP tasks never stop coming?",
    conceptSummary: "CPU Scheduling: Starvation (indefinite blocking) is solved by Aging (gradually increasing priority of waiting processes)."
  },
  // DBMS
  {
    id: "db_e1",
    topic: "DBMS",
    difficulty: "easy",
    question: "Which of the following keys is used to uniquely identify a row in a relational database table?",
    options: ["Foreign Key", "Candidate Key", "Primary Key", "Super Key"],
    correctIndex: 2,
    explanation: "A Primary Key is explicitly chosen by the database designer to uniquely identify tuples (rows) in a relation.",
    hint: "It's the primary way we locate specific data.",
    conceptSummary: "Keys in DBMS: Super Key (any unique set) → Candidate Key (minimal super key) → Primary Key (chosen candidate)."
  },
  {
    id: "db_m1",
    topic: "DBMS",
    difficulty: "medium",
    question: "In relational normalization, Boyce-Codd Normal Form (BCNF) strictly requires that for every non-trivial functional dependency X → Y:",
    options: ["X is a superkey", "Y is a prime attribute", "X is a subset of Y", "Both X and Y are prime attributes"],
    correctIndex: 0,
    explanation: "In BCNF, every determinant must be a candidate key (or superkey). Therefore, for X → Y, X must be a superkey.",
    hint: "BCNF is stricter than 3NF. It cares entirely about the left side of the dependency arrow.",
    conceptSummary: "Normalization (BCNF): Eliminates all redundancy based on functional dependencies. Stricter than 3NF as it doesn't allow prime attributes to be functionally dependent on non-superkeys."
  }
];
