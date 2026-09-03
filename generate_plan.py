import json
import os

weeks_data = [
    {
        "week": 1,
        "title": "C Programming + Discrete Math",
        "days": [
            ["C: Variables, data types, operators", "Math: Propositions & logical operators"],
            ["C: if, else, switch", "Math: Truth tables"],
            ["C: for, while, do-while", "Math: Logical equivalence"],
            ["C: Functions, Parameters, scope", "Math: First-order logic basics"],
            ["C: Arrays (1D/2D)", "Math: Quantifiers"],
            ["C: Pointers & Recursion", "Math: Set theory basics"]
        ]
    },
    {
        "week": 2,
        "title": "Stacks, Queues, Linked Lists + Relations",
        "days": [
            ["DS: Stack operations & implementation", "Math: Relations & their properties"],
            ["DS: Stack applications (Infix, Postfix)", "Math: Equivalence relations & partitions"],
            ["DS: Queue operations (Linear, Circular)", "Math: Functions (Injective, Surjective, Bijective)"],
            ["DS: Singly Linked List", "Math: Composition & Inverse of functions"],
            ["DS: Doubly & Circular Linked Lists", "Math: Partial orders (POSET)"],
            ["DS: LL vs Arrays, Practice problems", "Math: Hasse diagrams & Lattices"]
        ]
    },
    {
        "week": 3,
        "title": "Trees, Heaps + Graph Theory/Combinatorics",
        "days": [
            ["DS: Tree terminology, Binary Trees", "Math: Graph theory basics"],
            ["DS: Tree Traversals (In, Pre, Post)", "Math: Connectivity & Bipartite graphs"],
            ["DS: Binary Search Trees (Insertion, Deletion)", "Math: Planar graphs & Graph coloring"],
            ["DS: AVL Trees basics", "Math: Matchings & Independent sets"],
            ["DS: Binary Heaps (Min/Max, Insert, Extract)", "Math: Combinatorics (Counting principles)"],
            ["DS: Heapify & Heapsort", "Math: Combinations & Recurrence relations"]
        ]
    },
    {
        "week": 4,
        "title": "Searching, Sorting, Hashing + Boolean Algebra",
        "days": [
            ["Algo: Asymptotic analysis & Time complexity", "DL: Boolean algebra axioms & theorems"],
            ["Algo: Linear & Binary Search", "DL: Logic gates & truth tables"],
            ["Algo: Bubble, Selection, Insertion Sort", "DL: SOP and POS forms, Minterms/Maxterms"],
            ["Algo: Merge Sort & Quick Sort", "DL: K-Map minimization (2, 3, 4 variables)"],
            ["Algo: Hashing functions & Collision resolution", "DL: K-Map with Don't Cares"],
            ["Algo: Chaining & Open Addressing", "DL: Tabular (Quine-McCluskey) minimization"]
        ]
    },
    {
        "week": 5,
        "title": "Divide & Conquer, Greedy + Combinational Circuits",
        "days": [
            ["Algo: Divide & Conquer recurrence relations", "DL: Half & Full Adders/Subtractors"],
            ["Algo: Greedy technique overview & Activity Selection", "DL: Multiplexers (MUX) & Demultiplexers"],
            ["Algo: Fractional Knapsack", "DL: Encoders, Decoders, Priority Encoders"],
            ["Algo: Huffman Coding", "DL: Number representation (Binary, Octal, Hex)"],
            ["Algo: Job Sequencing with Deadlines", "DL: 1's and 2's complement arithmetic"],
            ["Algo: Optimal Merge Pattern", "DL: Fixed & Floating-point representation"]
        ]
    },
    {
        "week": 6,
        "title": "DP, Graphs + Sequential Circuits",
        "days": [
            ["Algo: Dynamic Programming vs Greedy, 0/1 Knapsack", "DL: Latches vs Flip-flops, SR & D Flip-flops"],
            ["Algo: Longest Common Subsequence (LCS)", "DL: JK & T Flip-flops, Excitation tables"],
            ["Algo: Matrix Chain Multiplication", "DL: Shift Registers (SISO, SIPO, PISO, PIPO)"],
            ["Algo: Graph Traversals (BFS, DFS)", "DL: Synchronous Counters design"],
            ["Algo: Minimum Spanning Trees (Prim's & Kruskal's)", "DL: Asynchronous (Ripple) Counters"],
            ["Algo: Shortest Paths (Dijkstra, Bellman-Ford)", "DL: State diagrams & FSM basics"]
        ]
    },
    {
        "week": 7,
        "title": "Linear Algebra + Instruction Sets",
        "days": [
            ["Math: Matrix types & properties", "COA: Von Neumann architecture, CPU components"],
            ["Math: Determinants & their properties", "COA: Instruction formats (Opcode, Operands)"],
            ["Math: Inverse & Rank of a matrix", "COA: 0, 1, 2, 3-address instructions"],
            ["Math: Systems of linear equations", "COA: Instruction cycle (Fetch, Decode, Execute)"],
            ["Math: Eigenvalues & Eigenvectors", "COA: Addressing modes (Immediate, Direct, Indirect, etc.)"],
            ["Math: Cayley-Hamilton theorem, LU decomposition", "COA: Addressing modes part 2 & problem solving"]
        ]
    },
    {
        "week": 8,
        "title": "Calculus + ALU/Control Unit",
        "days": [
            ["Math: Limits & Continuity", "COA: ALU operations, Integer representation"],
            ["Math: Differentiability & Derivatives", "COA: Addition/Subtraction logic (Lookahead carry)"],
            ["Math: Maxima & Minima", "COA: Multiplication algorithms (Booth's)"],
            ["Math: Mean Value Theorems", "COA: Control Unit basics, Micro-operations"],
            ["Math: Definite & Indefinite Integrals", "COA: Hardwired Control Unit design"],
            ["Math: Applications of integrals", "COA: Microprogrammed Control Unit"]
        ]
    },
    {
        "week": 9,
        "title": "Probability + Memory & I/O, Pipelining",
        "days": [
            ["Math: Basic Probability, Axioms, Events", "COA: Memory hierarchy (Registers to Secondary)"],
            ["Math: Conditional Probability, Independence", "COA: Cache memory basics, Hit/Miss ratio"],
            ["Math: Bayes' Theorem", "COA: Cache mapping (Direct, Associative, Set-Associative)"],
            ["Math: Random variables, Mean, Variance, SD", "COA: I/O Interface, Programmed I/O, Interrupts"],
            ["Math: Probability distributions (Binomial, Poisson)", "COA: DMA (Direct Memory Access)"],
            ["Math: Normal / Uniform distribution", "COA: Pipelining basics, Throughput, Hazards"]
        ]
    },
    {
        "week": 10,
        "title": "OS Processes, Threads, Synchronization",
        "days": [
            ["OS: System calls, User vs Kernel mode", "OS: Process concept, PCB, States"],
            ["OS: Context switching, Process creation (fork/exec)", "OS: Threads, User/Kernel level threads"],
            ["OS: Inter-process Communication (IPC)", "OS: Concurrency & Race conditions"],
            ["OS: Critical Section problem", "OS: Hardware solutions (TestAndSet)"],
            ["OS: Semaphores (Counting, Binary) & Mutex", "OS: Classic problems: Producer-Consumer"],
            ["OS: Reader-Writer & Dining Philosophers", "OS: Monitors"]
        ]
    },
    {
        "week": 11,
        "title": "Deadlock & CPU/IO Scheduling",
        "days": [
            ["OS: Deadlock characterization", "OS: Deadlock Prevention"],
            ["OS: Deadlock Avoidance (Banker's Algorithm)", "OS: Deadlock Detection & Recovery"],
            ["OS: CPU Scheduling criteria", "OS: FCFS & SJF Scheduling"],
            ["OS: SRTF & Priority Scheduling", "OS: Round Robin & Multilevel Queue"],
            ["OS: I/O Subsystem & Disk structure", "OS: Disk Scheduling (FCFS, SSTF)"],
            ["OS: Disk Scheduling (SCAN, C-SCAN)", "OS: Disk Scheduling (LOOK, C-LOOK)"]
        ]
    },
    {
        "week": 12,
        "title": "Memory Mgmt, Virtual Memory + ER Model",
        "days": [
            ["OS: Contiguous memory allocation", "DBMS: Database architecture, 3-schema"],
            ["OS: Fragmentation, Paging basics", "DBMS: ER Model (Entities, Attributes, Relationships)"],
            ["OS: Page tables, TLB, Multilevel paging", "DBMS: Cardinality ratios, Participation constraints"],
            ["OS: Segmentation", "DBMS: Weak entities, Enhanced ER"],
            ["OS: Virtual Memory, Demand Paging", "DBMS: Relational Model concepts, Keys"],
            ["OS: Page Replacement (FIFO, LRU, Optimal)", "DBMS: ER to Relational mapping"]
        ]
    },
    {
        "week": 13,
        "title": "Relational Algebra, SQL, Normalization",
        "days": [
            ["DBMS: Relational Algebra basic operators", "DBMS: Relational Algebra Set operations"],
            ["DBMS: Joins (Natural, Equi, Outer, Theta)", "DBMS: Tuple Relational Calculus (TRC)"],
            ["DBMS: SQL Basics, DDL, DML", "DBMS: SQL Aggregate functions, GROUP BY"],
            ["DBMS: SQL Subqueries", "DBMS: Integrity Constraints, Triggers"],
            ["DBMS: Functional Dependencies (FDs)", "DBMS: Equivalence of FDs, Minimal Cover"],
            ["DBMS: Normalization: 1NF, 2NF, 3NF, BCNF", "DBMS: Lossless Join, Dependency Preservation"]
        ]
    },
    {
        "week": 14,
        "title": "Indexing, Transactions, Concurrency",
        "days": [
            ["DBMS: File organization", "DBMS: Indexing basics, Primary vs Secondary"],
            ["DBMS: Dense vs Sparse, Multilevel Indexing", "DBMS: B-Trees (Insertion, Deletion, Structure)"],
            ["DBMS: B+ Trees (Differences, Operations)", "DBMS: Transaction concept, ACID properties"],
            ["DBMS: Schedules, Serializability", "DBMS: View Serializability, Recoverability"],
            ["DBMS: Concurrency Control: 2PL", "DBMS: Strict 2PL, Rigorous 2PL"],
            ["DBMS: Timestamp-based protocols, Deadlock", "DBMS: Database Recovery (Log-based, Checkpointing)"]
        ]
    },
    {
        "week": 15,
        "title": "CN Layers, Switching, Data Link",
        "days": [
            ["CN: OSI vs TCP/IP Reference Models", "CN: Layer functions, Network topologies"],
            ["CN: Physical layer, Transmission media", "CN: Switching (Circuit vs Packet)"],
            ["CN: Data Link Layer basics, Framing", "CN: Error Detection (Parity, Checksum)"],
            ["CN: Cyclic Redundancy Check (CRC)", "CN: Flow Control: Stop-and-Wait ARQ"],
            ["CN: Sliding Window (Go-Back-N, Selective Repeat)", "CN: Medium Access Control (MAC), CSMA/CD"],
            ["CN: Ethernet frame format", "CN: LAN Devices (Hub, Switch, Bridge)"]
        ]
    },
    {
        "week": 16,
        "title": "Routing, IPv4, TCP, Application Layer",
        "days": [
            ["CN: Network Layer basics, IP addressing", "CN: Subnetting, Supernetting"],
            ["CN: Classless Inter-Domain Routing (CIDR)", "CN: IPv4 header format, Fragmentation"],
            ["CN: Routing algorithms (Distance Vector)", "CN: Link State Routing, ARP, NAT, ICMP"],
            ["CN: Transport Layer: UDP header & features", "CN: TCP header, Connection establishment"],
            ["CN: TCP Flow Control & Congestion Control", "CN: Application Layer basics, Client-Server model"],
            ["CN: DNS, HTTP, FTP, SMTP protocols", "CN: Socket concepts, Ports"]
        ]
    },
    {
        "week": 17,
        "title": "Regex, DFA/NFA, CFG, PDA",
        "days": [
            ["TOC: Alphabets, Strings, Languages", "TOC: Regular Expressions (RE)"],
            ["TOC: Deterministic FA (DFA)", "TOC: Designing DFAs, State minimization"],
            ["TOC: Non-Deterministic FA (NFA)", "TOC: NFA to DFA conversion"],
            ["TOC: NFA with Epsilon-transitions", "TOC: Moore and Mealy Machines"],
            ["TOC: Context-Free Grammars (CFG)", "TOC: Ambiguity in Grammars, Simplification of CFG"],
            ["TOC: Chomsky Normal Form (CNF)", "TOC: Pushdown Automata (PDA)"]
        ]
    },
    {
        "week": 18,
        "title": "Languages, Turing Machines, Undecidability",
        "days": [
            ["TOC: Regular Languages closure properties", "TOC: Pumping Lemma for Regular Languages"],
            ["TOC: Context-Free Languages (CFL) closure properties", "TOC: Pumping Lemma for CFLs"],
            ["TOC: Turning Machines (TM) basics", "TOC: Recursively Enumerable (RE) languages"],
            ["TOC: Chomsky Hierarchy", "TOC: Closure properties of all languages"],
            ["TOC: Decidability vs Undecidability basics", "TOC: Halting Problem, Universal TM"],
            ["TOC: Rice's Theorem, PCP", "TOC: Undecidability table review"]
        ]
    },
    {
        "week": 19,
        "title": "Compiler Design",
        "days": [
            ["CD: Phases of a compiler, Passes", "CD: Lexical Analysis, Tokens"],
            ["CD: Parsing basics, Top-down vs Bottom-up", "CD: LL(1) Parsing, FIRST and FOLLOW sets"],
            ["CD: Shift-Reduce, LR(0) items", "CD: SLR(1), LALR(1), CLR(1) Parsing tables"],
            ["CD: Syntax-Directed Translation (SDT)", "CD: Abstract Syntax Trees, DAGs"],
            ["CD: Intermediate Code Generation", "CD: Runtime Environments, Activation Records"],
            ["CD: Code Optimization (Local, Loop)", "CD: Data Flow Analysis, Target Code Generation"]
        ]
    },
    {
        "week": 20,
        "title": "Revision Phase 1: Math, Logic, COA, DS/Prog",
        "days": [
            ["Revise: Math Formulas & Discrete Math", "Practice: Math PYQs (2015-2023)"],
            ["Revise: Digital Logic concepts & short notes", "Practice: Digital Logic PYQs"],
            ["Revise: COA (Cache, Pipelining, Instructions)", "Practice: COA PYQs"],
            ["Revise: C Programming", "Practice: C Programming PYQs"],
            ["Revise: Data Structures", "Practice: DS PYQs"],
            ["Full Mock Test 1", "Analyze Mock Test 1: Update mistake log"]
        ]
    },
    {
        "week": 21,
        "title": "Revision Phase 2: Algo, OS, DBMS, CN",
        "days": [
            ["Revise: Algorithms (DP, Greedy, Graphs)", "Practice: Algo PYQs"],
            ["Revise: Operating Systems", "Practice: OS PYQs"],
            ["Revise: DBMS (SQL, Normalization, Txns)", "Practice: DBMS PYQs"],
            ["Revise: Computer Networks", "Practice: CN PYQs"],
            ["Revise: TOC & Compiler Design", "Practice: TOC & CD PYQs"],
            ["Full Mock Test 2", "Analyze Mock Test 2: Deep dive into weak areas"]
        ]
    },
    {
        "week": 22,
        "title": "Final Mocks & Mental Prep",
        "days": [
            ["Full Mock Test 3", "Analyze Mock Test 3 + Error log review"],
            ["Revise weak areas", "General Aptitude PYQs & Practice"],
            ["Full Mock Test 4", "Analyze Mock Test 4 + Error log review"],
            ["Subject-wise formula sheet revision", "Solve recent GATE paper (2024 or 2025)"],
            ["Full Mock Test 5 (Final Mock)", "Analyze Mock Test 5 + Complete Error log review"],
            ["Light skim of formula sheet", "REST - Do not study new concepts"]
        ]
    }
]

days_out = []
md_out = "# GATE 2027: Complete 154-Day Study Plan\n\nThis checklist expands the 22-week plan into daily targets.\n\n"
day_num = 1
for week in weeks_data:
    w = week["week"]
    md_out += f"## Week {w}: {week['title']}\n\n"
    for i, day in enumerate(week["days"]):
        title = f"Day {day_num}: {day[0]} & {day[1]}"
        revision = f"Morning: Revise Day {day_num-1} concepts" if day_num > 1 else "Morning: Setup study space & review plan"
        md_out += f"### {title}\n"
        md_out += f"- **Topics**: {day[0]}, {day[1]}\n"
        md_out += f"- **Practice**: 15-20 practice questions on today's topics\n"
        md_out += f"- **Aptitude**: 15 min General Aptitude (Quant/Verbal)\n"
        md_out += f"- **Revision**: {revision}\n\n"
        
        days_out.append({
            "day": day_num,
            "week": w,
            "title": title,
            "topics": [day[0], day[1]],
            "practice": "15-20 practice questions on today's topics",
            "aptitude": "15 min General Aptitude",
            "revision": revision,
            "test": False
        })
        day_num += 1
    # Day 7
    title = f"Day {day_num}: Weekly Test & Consolidation"
    revision = f"1-2 hours revising Week {w} topics"
    md_out += f"### {title}\n"
    md_out += f"- **Topics**: Weekly Revision, Mistake Log Update\n"
    md_out += f"- **Practice**: 30-45 mixed practice questions from this week\n"
    md_out += f"- **Aptitude**: Skip (Focus on weekly test)\n"
    md_out += f"- **Revision**: {revision}\n\n"
    
    days_out.append({
        "day": day_num,
        "week": w,
        "title": title,
        "topics": ["Weekly Revision", "Mistake Log Update"],
        "practice": "30-45 mixed practice questions from this week",
        "aptitude": "Skip (Focus on weekly test)",
        "revision": revision,
        "test": True
    })
    day_num += 1

os.makedirs('src/data', exist_ok=True)

with open('src/data/gate2027_plan.ts', 'w') as f:
    f.write("export const gatePlan = " + json.dumps(days_out, indent=2) + ";\n")

with open('gate_2027_daily_plan.md', 'w') as f:
    f.write(md_out)

print("Generated src/data/gate2027_plan.ts and gate_2027_daily_plan.md successfully!")
