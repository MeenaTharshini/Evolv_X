
const lesson = (
  id,
  title,
  area,
  description,
  explanation,
  example,
  expectedOutput,
  question,
  options,
  answer,
  hint,
  extra = {}
) => ({
  id,
  title,
  area,
  type: extra.type || "concept",
  duration: extra.duration || "8 min",
  xp: extra.xp ?? 20,
  difficulty: extra.difficulty || "Beginner",

  description,
  explanation,
  example,
  expectedOutput,

  // Keep these fields for compatibility with existing lessons.
  question,
  options,
  answer,
  hint,

  // Video lessons
  videoUrl: extra.videoUrl || "",
  videoTitle: extra.videoTitle || title,

  // Concept lessons
  audioUrl: extra.audioUrl || "",
  audioText: extra.audioText || explanation,

  // Hands-on lessons
  instructions: extra.instructions || description,
  starterCode: extra.starterCode ?? example,
  solutionCode: extra.solutionCode ?? example,
  validation: extra.validation || "output",
  expectedResult: extra.expectedResult ?? expectedOutput,

  // Quiz lessons: five questions, one mark each.
  quizQuestions: extra.quizQuestions || [],

  // Activities shown within a lesson.
  activities: extra.activities || [
    {
      type: "predict",
      prompt: "Predict the output before running the code.",
      code: example,
      expectedOutput,
    },
    {
      type: "debug",
      prompt: "Try changing the example and explain what changed.",
      code: example,
    },
    {
      type: "practice",
      prompt: description,
    },
  ],
});

const pythonLessons = [
  // =========================================================
  // WORLD 1: PYTHON MEADOW
  // =========================================================
  
lesson(
  1,
  "Meet Python",
  "Python Meadow",
  "Discover Python and write your first program.",
  "Python is a programming language used to create applications, websites, automation tools, and data projects. Python code is designed to be readable.",
  'print("Hello, EVOLV!")',
  "Hello, EVOLV!",
  "Which function displays text in Python?",
  ["input()", "print()", "type()", "len()"],
  1,
  "It sends text or values to the output.",
  {
    type: "concept",
    duration: "8 min",
    xp: 20,

    // Introductory video
    videoUrl: "/videos/Meet Python.html",
    videoTitle: "Meet Python — Animated Introduction",

    quizQuestions: [
      {
        question: "Which function displays output?",
        options: ["input()", "print()", "len()", "range()"],
        answer: 1,
      },
      {
        question: "What kind of language is Python?",
        options: [
          "Programming language",
          "Database",
          "Browser",
          "Operating system",
        ],
        answer: 0,
      },
      {
        question: 'What does print("Hi") display?',
        options: ["Hi", '"Hi"', "print", "Nothing"],
        answer: 0,
      },
      {
        question: "Which file extension is commonly used for Python?",
        options: [".html", ".css", ".py", ".sql"],
        answer: 2,
      },
      {
        question: "Which is a valid Python function call?",
        options: [
          "print('Hi')",
          "print 'Hi'",
          "show('Hi')",
          "output 'Hi'",
        ],
        answer: 0,
      },
    ],
  }
),


  lesson(
    2,
    "Printing Messages",
    "Python Meadow",
    "Display messages and values using print().",
    "The print() function displays text, numbers, and expressions. You can pass multiple values separated by commas.",
    'print("Welcome")\nprint(10)\nprint("Score:", 5)',
    "Welcome\n10\nScore: 5",
    "Which statement prints the number 25?",
    ["print(25)", 'input("25")', "display = 25", "echo(25)"],
    0,
    "Use print() with the value inside parentheses.",
    { type: "hands-on" }
  ),

  lesson(
    3,
    "Variables",
    "Python Meadow",
    "Store values in named variables.",
    "A variable is a name that refers to a value. Use the assignment operator = to assign a value to a variable.",
    'name = "Meena"\nscore = 10\nprint(name)\nprint(score)',
    "Meena\n10",
    "Which symbol assigns a value to a variable?",
    ["==", "=", "!=", ":"],
    1,
    "It is the single equals sign.",
    { type: "concept" }
  ),

  lesson(
    4,
    "Numbers and Calculations",
    "Python Meadow",
    "Perform basic arithmetic in Python.",
    "Python supports addition (+), subtraction (-), multiplication (*), division (/), floor division (//), and remainder (%).",
    "a = 12\nb = 5\nprint(a + b)\nprint(a % b)",
    "17\n2",
    "Which operator finds the remainder?",
    ["//", "*", "%", "/"],
    2,
    "It is the percent symbol.",
    { type: "hands-on" }
  ),

  lesson(
    5,
    "Strings",
    "Python Meadow",
    "Work with text values.",
    "A string is a sequence of characters enclosed in single or double quotation marks. Strings can be combined using +.",
    'first = "Hello"\nsecond = "Python"\nprint(first + " " + second)',
    "Hello Python",
    "Which value is a string?",
    ["25", "3.14", '"EVOLV"', "True"],
    2,
    "Look for text enclosed in quotation marks.",
    { type: "concept" }
  ),

  lesson(
    6,
    "Getting User Input",
    "Python Meadow",
    "Accept information from the user.",
    "The input() function reads text entered by the user. Its return value is a string unless you convert it.",
    'name = input("Enter your name: ")\nprint("Hello", name)',
    "Displays a greeting using the entered name.",
    "What type of value does input() return by default?",
    ["Integer", "Float", "String", "Boolean"],
    2,
    "Even digits entered through input() initially arrive as text.",
    { type: "hands-on" }
  ),

  lesson(
    7,
    "Converting Data Types",
    "Python Meadow",
    "Convert strings into numeric values.",
    "Use int() to convert suitable values to integers and float() to convert suitable values to floating-point numbers.",
    'age = int("19")\nprint(age + 1)',
    "20",
    "Which function converts suitable text to an integer?",
    ["str()", "int()", "floatText()", "input()"],
    1,
    "The function name is short for integer.",
    { type: "concept" }
  ),

  lesson(
    8,
    "Booleans",
    "Python Meadow",
    "Understand True and False values.",
    "Boolean values represent truth states. Python uses the keywords True and False with capital first letters.",
    "is_ready = True\nprint(is_ready)\nprint(5 > 8)",
    "True\nFalse",
    "Which is a valid Python Boolean literal?",
    ["true", "FALSE", "True", "yes"],
    2,
    "Python Boolean literals are case-sensitive.",
    { type: "concept" }
  ),

  lesson(
    9,
    "Comparisons",
    "Python Meadow",
    "Compare values using comparison operators.",
    "Comparison operators include ==, !=, >, <, >=, and <=. Their results are Boolean values.",
    "print(8 > 3)\nprint(4 == 9)\nprint(5 != 2)",
    "True\nFalse\nTrue",
    "Which operator checks equality?",
    ["=", "==", "!=", ">"],
    1,
    "Equality checking uses two equals signs.",
    { type: "hands-on" }
  ),

  lesson(
    10,
    "Meadow Checkpoint",
    "Python Meadow",
    "Review Python basics with a short quiz.",
    "This checkpoint reviews output, variables, strings, numbers, input, and comparisons.",
    'name = "EVO"\npoints = 5\nprint(name, points)',
    "EVO 5",
    "What does print(2 + 3) display?",
    ["23", "5", "2 + 3", "Error"],
    1,
    "The plus operator adds numeric values.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "Which function displays output?",
          options: ["input()", "print()", "int()", "str()"],
          answer: 1,
        },
        {
          question: "Which operator assigns a value?",
          options: ["=", "==", "!=", "<"],
          answer: 0,
        },
        {
          question: 'What is the type of "Python"?',
          options: ["Integer", "String", "Boolean", "Float"],
          answer: 1,
        },
        {
          question: "What does 10 % 3 return?",
          options: ["3", "1", "0", "10"],
          answer: 1,
        },
        {
          question: "What is the result of 4 > 7?",
          options: ["True", "False", "4", "7"],
          answer: 1,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 2: LOGIC FOREST
  // =========================================================
  lesson(
    11,
    "Making Decisions with if",
    "Logic Forest",
    "Run code only when a condition is true.",
    "An if statement checks a condition. If the condition evaluates to True, Python executes the indented block.",
    "temperature = 30\nif temperature > 25:\n    print('It is warm')",
    "It is warm",
    "Which keyword starts a conditional statement?",
    ["when", "if", "check", "case"],
    1,
    "It is a two-letter keyword.",
    { type: "concept" }
  ),

  lesson(
    12,
    "if and else",
    "Logic Forest",
    "Choose between two possible paths.",
    "The else block runs when the if condition is false. Python uses indentation to identify each block.",
    "age = 16\nif age >= 18:\n    print('Adult')\nelse:\n    print('Minor')",
    "Minor",
    "When does the else block run?",
    ["Always", "When the if condition is false", "Before if", "Only in loops"],
    1,
    "It handles the alternative path.",
    { type: "hands-on" }
  ),

  lesson(
    13,
    "elif Conditions",
    "Logic Forest",
    "Check multiple conditions in sequence.",
    "Use elif to test another condition when earlier conditions are false. An if/elif/else chain selects the first matching branch.",
    "score = 75\nif score >= 90:\n    print('A')\nelif score >= 70:\n    print('B')\nelse:\n    print('C')",
    "B",
    "What does elif allow you to do?",
    ["Repeat a loop", "Check another condition", "Create a variable", "Read a file"],
    1,
    "It means an additional conditional branch.",
    { type: "concept" }
  ),

  lesson(
    14,
    "Logical Operators",
    "Logic Forest",
    "Combine conditions with and, or, and not.",
    "The and operator requires both conditions to be true. The or operator requires at least one. The not operator reverses a Boolean value.",
    "age = 20\nhas_id = True\nprint(age >= 18 and has_id)",
    "True",
    "When is A and B true?",
    ["When either is true", "When both are true", "When both are false", "Always"],
    1,
    "Think of and as requiring both conditions.",
    { type: "hands-on" }
  ),

  lesson(
    15,
    "Nested Conditions",
    "Logic Forest",
    "Place one conditional inside another.",
    "A nested if statement is an if statement inside another conditional block. Indentation shows which block contains each statement.",
    "logged_in = True\nis_admin = False\nif logged_in:\n    if is_admin:\n        print('Admin')\n    else:\n        print('Member')",
    "Member",
    "What makes an if statement nested?",
    ["It has no condition", "It is inside another block", "It has no indentation", "It uses a loop"],
    1,
    "Look at where the second if appears.",
    { type: "concept" }
  ),

  lesson(
    16,
    "Membership Operators",
    "Logic Forest",
    "Check whether a value belongs to a sequence.",
    "The in operator checks whether a value exists in a sequence such as a string, list, or tuple. not in checks the opposite.",
    'language = "Python"\nprint("Py" in language)',
    "True",
    "Which operator checks membership?",
    ["has", "in", "contains", "belongs"],
    1,
    "The operator is also an ordinary English word.",
    { type: "hands-on" }
  ),

  lesson(
    17,
    "Conditional Expressions",
    "Logic Forest",
    "Choose a value using a one-line condition.",
    "A conditional expression selects one of two values based on a condition: value_if_true if condition else value_if_false.",
    "age = 20\nstatus = 'Adult' if age >= 18 else 'Minor'\nprint(status)",
    "Adult",
    "Which keyword separates the alternative value in a conditional expression?",
    ["elif", "else", "then", "switch"],
    1,
    "It introduces the alternative branch.",
    { type: "concept" }
  ),

  lesson(
    18,
    "Truthiness",
    "Logic Forest",
    "Understand how Python interprets values in conditions.",
    "Values such as 0, an empty string, and an empty list are false-like. Many non-empty values are true-like.",
    'if "Python":\n    print("Runs")\nif 0:\n    print("Does not run")',
    "Runs",
    "Which value is false-like?",
    ['"hello"', "5", "[]", "[1]"],
    2,
    "An empty list is false-like.",
    { type: "concept" }
  ),

  lesson(
    19,
    "Decision Practice",
    "Logic Forest",
    "Build a program that chooses an outcome.",
    "Decision-making helps programs react to input. Write clear conditions and test boundary values as well as typical cases.",
    "score = 82\nif score >= 50:\n    print('Pass')\nelse:\n    print('Try again')",
    "Pass",
    "Which condition checks whether score is at least 50?",
    ["score > 50", "score >= 50", "score = 50", "score < 50"],
    1,
    "At least includes equality.",
    { type: "hands-on" }
  ),

  lesson(
    20,
    "Logic Forest Checkpoint",
    "Logic Forest",
    "Test your understanding of conditions.",
    "Review if, else, elif, logical operators, membership, and truthiness.",
    "value = 12\nif value % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')",
    "Even",
    "Which operator means logical AND?",
    ["or", "and", "not", "in"],
    1,
    "Both conditions must be true.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "Which keyword begins a conditional?",
          options: ["if", "for", "def", "return"],
          answer: 0,
        },
        {
          question: "When does else execute?",
          options: ["When if is true", "When the preceding condition is false", "Always", "Never"],
          answer: 1,
        },
        {
          question: "What does and require?",
          options: ["Both conditions true", "Either condition true", "Both false", "No conditions"],
          answer: 0,
        },
        {
          question: 'What is "a" in "cat"?',
          options: ["False", "True", "None", "Error"],
          answer: 1,
        },
        {
          question: "Which value is false-like?",
          options: ['"EVOLV"', "1", "[]", "[0]"],
          answer: 2,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 3: LOOP RIVER
  // =========================================================
  lesson(
    21,
    "Why Loops?",
    "Loop River",
    "Repeat instructions without copying code.",
    "Loops execute a block repeatedly. A for loop commonly iterates over a sequence, while a while loop repeats as long as its condition remains true.",
    "for number in range(3):\n    print(number)",
    "0\n1\n2",
    "What is the main purpose of a loop?",
    ["Store data", "Repeat instructions", "Define a class", "Import a module"],
    1,
    "It avoids writing the same instruction repeatedly.",
    { type: "concept" }
  ),

  lesson(
    22,
    "The for Loop",
    "Loop River",
    "Iterate over values in a sequence.",
    "A for loop assigns each item in an iterable to a loop variable and runs the indented block for each item.",
    "for fruit in ['apple', 'mango']:\n    print(fruit)",
    "apple\nmango",
    "Which keyword creates this kind of loop?",
    ["repeat", "for", "each", "loop"],
    1,
    "It appears before the loop variable.",
    { type: "hands-on" }
  ),

  lesson(
    23,
    "Using range()",
    "Loop River",
    "Generate a sequence of numbers for loops.",
    "range(stop) generates integers from 0 up to, but not including, stop. You can also specify a start and a step.",
    "for i in range(1, 4):\n    print(i)",
    "1\n2\n3",
    "What values does range(3) generate?",
    ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
    1,
    "The stop value is excluded.",
    { type: "concept" }
  ),

  lesson(
    24,
    "The while Loop",
    "Loop River",
    "Repeat while a condition remains true.",
    "A while loop checks its condition before each iteration. Make sure the loop can eventually stop.",
    "count = 1\nwhile count <= 3:\n    print(count)\n    count += 1",
    "1\n2\n3",
    "What should a while loop eventually do in most finite tasks?",
    ["Stop", "Restart Python", "Delete variables", "Import a library"],
    0,
    "Update the condition or loop state so it becomes false.",
    { type: "hands-on" }
  ),

  lesson(
    25,
    "break",
    "Loop River",
    "Exit a loop early.",
    "The break statement immediately exits the innermost loop in which it appears.",
    "for n in range(5):\n    if n == 3:\n        break\n    print(n)",
    "0\n1\n2",
    "What does break do?",
    ["Skips one iteration", "Exits the loop", "Restarts the loop", "Defines a function"],
    1,
    "It ends the current loop.",
    { type: "concept" }
  ),

  lesson(
    26,
    "continue",
    "Loop River",
    "Skip the rest of the current iteration.",
    "The continue statement moves to the next iteration of the innermost loop without executing the remaining statements in the current iteration.",
    "for n in range(4):\n    if n == 2:\n        continue\n    print(n)",
    "0\n1\n3",
    "What does continue do?",
    ["Ends the entire program", "Skips to the next iteration", "Deletes the loop", "Creates a list"],
    1,
    "The loop continues with its next value.",
    { type: "hands-on" }
  ),

  lesson(
    27,
    "Nested Loops",
    "Loop River",
    "Use a loop inside another loop.",
    "A nested loop executes the inner loop for each iteration of the outer loop.",
    "for row in range(2):\n    for col in range(2):\n        print(row, col)",
    "0 0\n0 1\n1 0\n1 1",
    "How many times does the inner loop run in total here?",
    ["2", "3", "4", "8"],
    2,
    "Each of two outer iterations runs two inner iterations.",
    { type: "concept" }
  ),

  lesson(
    28,
    "Looping Through Strings",
    "Loop River",
    "Process text one character at a time.",
    "Strings are iterable. A for loop can visit each character in order.",
    'for letter in "EVO":\n    print(letter)',
    "E\nV\nO",
    "What does a string loop visit?",
    ["Only numbers", "Characters in the string", "Only spaces", "File names"],
    1,
    "Each item is one character.",
    { type: "hands-on" }
  ),

  lesson(
    29,
    "Loop Patterns",
    "Loop River",
    "Use counters and accumulators in loops.",
    "A counter tracks how many times something occurs. An accumulator stores a running result, such as a sum.",
    "total = 0\nfor n in range(1, 4):\n    total += n\nprint(total)",
    "6",
    "What is an accumulator used for?",
    ["Store a running result", "Stop Python", "Create a class", "Read input only"],
    0,
    "It updates a result repeatedly.",
    { type: "hands-on" }
  ),

  lesson(
    30,
    "Loop River Checkpoint",
    "Loop River",
    "Review loops, ranges, and loop control.",
    "This checkpoint covers for, while, range, break, continue, and accumulators.",
    "total = 0\nfor n in range(1, 4):\n    total += n\nprint(total)",
    "6",
    "Which statement skips the current iteration?",
    ["break", "continue", "return", "pass"],
    1,
    "It moves to the next iteration.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "Which loop iterates through a sequence?",
          options: ["for", "class", "def", "try"],
          answer: 0,
        },
        {
          question: "What values does range(3) produce?",
          options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3"],
          answer: 1,
        },
        {
          question: "Which statement exits a loop?",
          options: ["continue", "break", "elif", "import"],
          answer: 1,
        },
        {
          question: "Which loop checks a condition before each iteration?",
          options: ["while", "class", "print", "return"],
          answer: 0,
        },
        {
          question: "What is the sum of range(1, 4)?",
          options: ["3", "4", "6", "10"],
          answer: 2,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 4: DATA KINGDOM
  // =========================================================
  lesson(
    31,
    "Lists",
    "Data Kingdom",
    "Store multiple values in one ordered collection.",
    "A list is an ordered, mutable collection. Create a list with square brackets and separate items with commas.",
    'fruits = ["apple", "mango", "grape"]\nprint(fruits[0])',
    "apple",
    "Which brackets create a list?",
    ["()", "{}", "[]", "<>"],
    2,
    "They are the square brackets.",
    { type: "concept" }
  ),

  lesson(
    32,
    "List Indexing",
    "Data Kingdom",
    "Access items using their positions.",
    "Python list indexes start at zero. Negative indexes count from the end, with -1 referring to the last item.",
    "numbers = [10, 20, 30]\nprint(numbers[1])\nprint(numbers[-1])",
    "20\n30",
    "What is the index of the first list item?",
    ["0", "1", "-1", "It has no index"],
    0,
    "Python uses zero-based indexing.",
    { type: "hands-on" }
  ),

  lesson(
    33,
    "Updating Lists",
    "Data Kingdom",
    "Change list items and add new values.",
    "Lists are mutable. You can assign to an index, append a value, or remove an item.",
    "scores = [10, 20]\nscores.append(30)\nscores[0] = 5\nprint(scores)",
    "[5, 20, 30]",
    "Which method adds an item to the end of a list?",
    ["append()", "push()", "insertEnd()", "addLast()"],
    0,
    "This method appends a value.",
    { type: "hands-on" }
  ),

  lesson(
    34,
    "Tuples",
    "Data Kingdom",
    "Store ordered values that are not changed in place.",
    "A tuple is an ordered collection that cannot be modified after creation. Tuples are commonly written with parentheses.",
    "point = (3, 4)\nprint(point[0])",
    "3",
    "Can a tuple item be reassigned in place?",
    ["Yes, always", "No", "Only strings", "Only integers"],
    1,
    "Tuples are immutable.",
    { type: "concept" }
  ),

  lesson(
    35,
    "Sets",
    "Data Kingdom",
    "Work with collections of unique values.",
    "A set stores distinct elements and supports operations such as union and intersection. Sets do not provide positional indexing.",
    "values = {1, 2, 2, 3}\nprint(len(values))",
    "3",
    "What is a key property of sets?",
    ["They preserve duplicates", "They store unique elements", "They are always sorted", "They use indexes"],
    1,
    "Repeated values are represented once.",
    { type: "concept" }
  ),

  lesson(
    36,
    "Dictionaries",
    "Data Kingdom",
    "Store values using key-value pairs.",
    "A dictionary maps keys to values. Access a value using its key, such as person['name'].",
    'person = {"name": "Meena", "age": 19}\nprint(person["name"])',
    "Meena",
    "What does a dictionary store?",
    ["Only individual characters", "Key-value pairs", "Only unique numbers", "Only ordered indexes"],
    1,
    "Each value is associated with a key.",
    { type: "hands-on" }
  ),

  lesson(
    37,
    "String Methods",
    "Data Kingdom",
    "Transform and inspect text.",
    "String methods such as lower(), upper(), strip(), and replace() return useful string results. Strings themselves are immutable.",
    'text = "  Python  "\nprint(text.strip().upper())',
    "PYTHON",
    "Which method removes surrounding whitespace?",
    ["upper()", "strip()", "append()", "sort()"],
    1,
    "It trims the beginning and end.",
    { type: "concept" }
  ),

  lesson(
    38,
    "Slicing",
    "Data Kingdom",
    "Extract a portion of a sequence.",
    "Slicing uses sequence[start:stop:step]. The stop index is excluded, and omitted values use defaults.",
    'letters = "PYTHON"\nprint(letters[1:4])',
    "YTH",
    "Is the stop index included in a slice?",
    ["Yes", "No", "Only for lists", "Only for strings"],
    1,
    "The stop position marks where extraction ends.",
    { type: "hands-on" }
  ),

  lesson(
    39,
    "Comprehensions",
    "Data Kingdom",
    "Create a list from an iterable in one expression.",
    "A list comprehension builds a new list using an expression and a for clause, with an optional condition.",
    "squares = [n * n for n in range(4)]\nprint(squares)",
    "[0, 1, 4, 9]",
    "What does a list comprehension create?",
    ["A new list", "A database", "A class only", "A file"],
    0,
    "The result is enclosed in square brackets.",
    { type: "hands-on" }
  ),

  lesson(
    40,
    "Data Kingdom Checkpoint",
    "Data Kingdom",
    "Review lists, tuples, sets, dictionaries, and strings.",
    "Choose the right collection for your task and practise accessing and transforming its values.",
    'student = {"name": "EVO", "score": 5}\nprint(student["score"])',
    "5",
    "Which collection stores key-value pairs?",
    ["List", "Tuple", "Set", "Dictionary"],
    3,
    "Use a dictionary when values are retrieved by keys.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "Which brackets create a list?",
          options: ["()", "[]", "{}", "<>"],
          answer: 1,
        },
        {
          question: "What is the first list index?",
          options: ["0", "1", "-1", "2"],
          answer: 0,
        },
        {
          question: "Which collection stores unique elements?",
          options: ["List", "Tuple", "Set", "String"],
          answer: 2,
        },
        {
          question: "Which collection uses key-value pairs?",
          options: ["Dictionary", "String", "Tuple", "Range"],
          answer: 0,
        },
        {
          question: "What does 'PYTHON'[1:4] return?",
          options: ["PYT", "YTH", "THO", "YTHO"],
          answer: 1,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 5: FUNCTION MOUNTAINS
  // =========================================================
  lesson(
    41,
    "Creating Functions",
    "Function Mountains",
    "Group reusable instructions into functions.",
    "Define a function with def, followed by its name, parentheses, and a colon. The function body is indented.",
    "def greet():\n    print('Hello!')\ngreet()",
    "Hello!",
    "Which keyword defines a function?",
    ["func", "def", "function", "make"],
    1,
    "It is a three-letter keyword.",
    { type: "hands-on" }
  ),

  lesson(
    42,
    "Function Parameters",
    "Function Mountains",
    "Pass information into a function.",
    "Parameters are names listed in a function definition. Arguments are the actual values passed when calling the function.",
    "def greet(name):\n    print('Hello', name)\ngreet('EVO')",
    "Hello EVO",
    "What does a parameter do?",
    ["Receives an argument", "Stops a loop", "Imports a module", "Creates a file"],
    0,
    "It provides a named input to a function.",
    { type: "concept" }
  ),

  lesson(
    43,
    "Returning Values",
    "Function Mountains",
    "Send a result back to the caller.",
    "The return statement ends a function call and sends a value back to the caller. A function without an explicit return returns None.",
    "def add(a, b):\n    return a + b\nprint(add(2, 3))",
    "5",
    "Which keyword sends a value back from a function?",
    ["print", "yield only", "return", "send"],
    2,
    "It gives the caller a result.",
    { type: "hands-on" }
  ),

  lesson(
    44,
    "Default Arguments",
    "Function Mountains",
    "Provide fallback values for parameters.",
    "A parameter can have a default value. If the caller omits that argument, Python uses the default.",
    "def greet(name='friend'):\n    print('Hello', name)\ngreet()",
    "Hello friend",
    "When is a default argument used?",
    ["Whenever a loop runs", "When the argument is omitted", "Only after an error", "Never"],
    1,
    "It supplies a fallback value.",
    { type: "concept" }
  ),

  lesson(
    45,
    "Keyword Arguments",
    "Function Mountains",
    "Pass arguments by parameter name.",
    "Keyword arguments specify a parameter name in the function call, which can improve readability and let arguments appear in a different order.",
    "def describe(name, age):\n    print(name, age)\ndescribe(age=19, name='EVO')",
    "EVO 19",
    "How does a keyword argument identify its parameter?",
    ["By parameter name", "By list index", "By file path", "By data type only"],
    0,
    "The call includes a name followed by =.",
    { type: "hands-on" }
  ),

  lesson(
    46,
    "Variable Scope",
    "Function Mountains",
    "Understand local and global names.",
    "A name created inside a function is normally local to that function. Names defined outside functions may be accessible within them.",
    "message = 'Outside'\ndef show():\n    message = 'Inside'\n    print(message)\nshow()\nprint(message)",
    "Inside\nOutside",
    "Where is a local variable normally accessible?",
    ["Everywhere", "Inside its defining scope", "Only in another file", "Only in a list"],
    1,
    "Its visibility is limited to its scope.",
    { type: "concept" }
  ),

  lesson(
    47,
    "Lambda Functions",
    "Function Mountains",
    "Create small anonymous functions.",
    "A lambda expression creates a small anonymous function consisting of an expression. For larger logic, use def.",
    "double = lambda n: n * 2\nprint(double(4))",
    "8",
    "Which keyword introduces a lambda expression?",
    ["def", "lambda", "return", "anonymous"],
    1,
    "It names this kind of expression.",
    { type: "concept" }
  ),

  lesson(
    48,
    "Recursion",
    "Function Mountains",
    "Understand functions that call themselves.",
    "A recursive function calls itself. It needs a base case to stop the recursion and avoid unbounded calls.",
    "def countdown(n):\n    if n == 0:\n        print('Go!')\n    else:\n        countdown(n - 1)\ncountdown(2)",
    "Go!",
    "What prevents recursion from continuing indefinitely?",
    ["A base case", "A print statement", "A string", "An import"],
    0,
    "It defines when recursion should stop.",
    { type: "concept" }
  ),

  lesson(
    49,
    "Modules and Imports",
    "Function Mountains",
    "Reuse code from Python modules.",
    "A module is a Python file or importable unit of code. The import statement makes its names available to your program.",
    "import math\nprint(math.sqrt(16))",
    "4.0",
    "Which keyword imports a module?",
    ["include", "using", "import", "require"],
    2,
    "It is followed by the module name.",
    { type: "hands-on" }
  ),

  lesson(
    50,
    "Function Mountains Checkpoint",
    "Function Mountains",
    "Review functions, parameters, returns, and modules.",
    "Practise creating reusable functions and testing their inputs and outputs.",
    "def square(n):\n    return n * n\nprint(square(4))",
    "16",
    "What does a function return if it has no return statement?",
    ["0", "False", "None", "An empty string"],
    2,
    "Python uses a special value to represent no result.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "Which keyword defines a function?",
          options: ["def", "func", "make", "class"],
          answer: 0,
        },
        {
          question: "What is an argument?",
          options: ["A value passed to a function", "A loop", "A module", "A file"],
          answer: 0,
        },
        {
          question: "Which keyword sends a result to the caller?",
          options: ["print", "return", "input", "import"],
          answer: 1,
        },
        {
          question: "What does a function without return give back?",
          options: ["0", "None", "False", "[]"],
          answer: 1,
        },
        {
          question: "Which keyword imports a module?",
          options: ["include", "import", "load", "module"],
          answer: 1,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 6: OBJECT-ORIENTED GROVE
  // =========================================================
  lesson(
    51,
    "Classes and Objects",
    "Object-Oriented Grove",
    "Model data and behavior using classes.",
    "A class defines a type with attributes and methods. An object is an instance of a class.",
    "class Dog:\n    pass\n\npet = Dog()\nprint(type(pet).__name__)",
    "Dog",
    "What is an object?",
    ["An instance of a class", "A loop", "A module only", "A comment"],
    0,
    "It is created from a class.",
    { type: "concept" }
  ),

  lesson(
    52,
    "The __init__ Method",
    "Object-Oriented Grove",
    "Initialize an object's attributes.",
    "The __init__ method initializes a new instance. Its first parameter is conventionally named self and refers to that instance.",
    "class Student:\n    def __init__(self, name):\n        self.name = name\n\nstudent = Student('EVO')\nprint(student.name)",
    "EVO",
    "What does self refer to in an instance method?",
    ["The current instance", "The parent folder", "A module", "A loop"],
    0,
    "It refers to the object being used.",
    { type: "hands-on" }
  ),

  lesson(
    53,
    "Instance Methods",
    "Object-Oriented Grove",
    "Define behavior for objects.",
    "Instance methods are defined inside a class and commonly receive self as the first parameter so they can access instance attributes.",
    "class Counter:\n    def show(self):\n        print('Ready')\n\nCounter().show()",
    "Ready",
    "Where are instance methods defined?",
    ["Inside a class", "Only inside loops", "Inside JSON", "Only in the terminal"],
    0,
    "They belong to the class definition.",
    { type: "concept" }
  ),

  lesson(
    54,
    "Inheritance",
    "Object-Oriented Grove",
    "Extend an existing class.",
    "Inheritance lets a child class derive behavior and attributes from a parent class. A child can add or override methods.",
    "class Animal:\n    def speak(self):\n        print('Sound')\n\nclass Dog(Animal):\n    pass\n\nDog().speak()",
    "Sound",
    "What is inheritance used for?",
    ["Reuse and extend class behavior", "Repeat a loop", "Convert a string", "Open a file"],
    0,
    "A child class can reuse a parent's behavior.",
    { type: "concept" }
  ),

  lesson(
    55,
    "Object-Oriented Grove Checkpoint",
    "Object-Oriented Grove",
    "Review classes, instances, methods, and inheritance.",
    "Use classes when related data and behavior belong together. Keep objects focused and give their methods clear responsibilities.",
    "class Greeter:\n    def greet(self):\n        return 'Hello'\n\nprint(Greeter().greet())",
    "Hello",
    "Which keyword defines a class?",
    ["object", "class", "defclass", "new"],
    1,
    "It introduces a class definition.",
    {
      type: "quiz",
      quizQuestions: [
        {
          question: "What is an object?",
          options: ["An instance of a class", "A keyword", "A loop", "A comment"],
          answer: 0,
        },
        {
          question: "What is self commonly used for?",
          options: ["Referring to the instance", "Importing modules", "Stopping loops", "Printing output"],
          answer: 0,
        },
        {
          question: "Which method initializes instance attributes?",
          options: ["__init__", "__start__", "__main__", "__newname__"],
          answer: 0,
        },
        {
          question: "What does inheritance support?",
          options: ["Reusing and extending class behavior", "Deleting all objects", "Only arithmetic", "Reading keyboard input"],
          answer: 0,
        },
        {
          question: "Which keyword defines a class?",
          options: ["def", "class", "object", "self"],
          answer: 1,
        },
      ],
    }
  ),

  // =========================================================
  // WORLD 7: FILES AND TOOLS / EVOLV CITADEL
  // =========================================================
  lesson(
    56,
    "Reading Files",
    "Files and Tools",
    "Read text from a file.",
    "The open() function opens a file. Using with ensures that the file is closed when the block finishes.",
    "with open('notes.txt', 'r', encoding='utf-8') as file:\n    content = file.read()\n    print(content)",
    "Displays the contents of notes.txt when the file exists.",
    "Which mode is commonly used to read a file?",
    ["'w'", "'r'", "'x'", "'a'"],
    1,
    "It stands for read.",
    {
      type: "hands-on",
      instructions: "Create notes.txt with some text, then run the example. Check that the file is in the correct working directory.",
    }
  ),

  lesson(
    57,
    "Writing Files",
    "Files and Tools",
    "Save text to a file.",
    "The write mode ('w') creates a file or replaces its existing contents. Use append mode ('a') when you want to add to the end.",
    "with open('notes.txt', 'w', encoding='utf-8') as file:\n    file.write('Hello EVOLV!')",
    "Writes Hello EVOLV! into notes.txt.",
    "Which file mode can replace existing contents?",
    ["'r'", "'w'", "'a'", "'read'"],
    1,
    "Be careful: this mode overwrites existing contents.",
    { type: "hands-on" }
  ),

  lesson(
    58,
    "Handling Exceptions",
    "Files and Tools",
    "Handle expected runtime errors safely.",
    "A try block contains code that may raise an exception. An except block handles a matching exception type.",
    "try:\n    number = int('abc')\nexcept ValueError:\n    print('Invalid number')",
    "Invalid number",
    "Which block handles a matching exception?",
    ["try", "except", "class", "for"],
    1,
    "It follows the try block.",
    { type: "concept" }
  ),

  lesson(
    59,
    "Useful Built-in Functions",
    "Files and Tools",
    "Use built-in functions to inspect and process values.",
    "Python includes functions such as len(), sum(), min(), max(), sorted(), and enumerate(). They help solve common problems without extra code.",
    "numbers = [4, 2, 8]\nprint(len(numbers))\nprint(sum(numbers))",
    "3\n14",
    "Which function returns the number of items in a sequence?",
    ["sum()", "len()", "max()", "type()"],
    1,
    "It reports the length.",
    { type: "concept" }
  ),

  lesson(
    60,
    "EVOLV Python Final Challenge",
    "EVOLV Citadel",
    "Combine Python fundamentals in one final challenge.",
    "Combine variables, conditions, loops, collections, and functions to solve a small problem. Test your program with several inputs before finishing.",
    "def total_even(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total\n\nprint(total_even([1, 2, 3, 4, 5, 6]))",
    "12",
    "What is the total of the even numbers in [1, 2, 3, 4, 5, 6]?",
    ["9", "10", "12", "21"],
    2,
    "Add 2, 4, and 6.",
    {
      type: "hands-on",
      instructions: "Complete total_even(numbers). It should return the sum of only the even numbers in the provided list.",
      starterCode: "def total_even(numbers):\n    # Write your solution here\n    pass\n\nprint(total_even([1, 2, 3, 4, 5, 6]))",
      solutionCode: "def total_even(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total\n\nprint(total_even([1, 2, 3, 4, 5, 6]))",
      expectedResult: "12",
      quizQuestions: [
        {
          question: "Which keyword defines a function?",
          options: ["def", "class", "loop", "print"],
          answer: 0,
        },
        {
          question: "Which structure stores key-value pairs?",
          options: ["List", "Dictionary", "String", "Tuple"],
          answer: 1,
        },
        {
          question: "Which statement exits a loop immediately?",
          options: ["continue", "break", "elif", "import"],
          answer: 1,
        },
        {
          question: "Which block handles an exception?",
          options: ["except", "for", "class", "with"],
          answer: 0,
        },
        {
          question: "What does len([4, 5, 6]) return?",
          options: ["2", "3", "15", "6"],
          answer: 1,
        },
      ],
    }
  ),
];


 // ---------------------------------------------------------
 // LOOKUP AND PROGRESS HELPERS
 // ---------------------------------------------------------

export const getPythonLesson = (lessonId) => {
  const id = Number(lessonId);

  return (
    pythonLessons.find((item) => item.id === id) || null
  );
};

export const getPythonLessonsByArea = (area) => {
  return pythonLessons.filter((item) => item.area === area);
};

export const getPythonLessonTypes = () => {
  return ["video", "concept", "quiz", "hands-on"];
};

export const getPythonProgress = (completedLessonIds = []) => {
  const completed = new Set(
    completedLessonIds.map(Number)
  );

  const completedLessons = pythonLessons.filter((item) =>
    completed.has(item.id)
  );

  const totalLessons = pythonLessons.length;
  const completedCount = completedLessons.length;

  return {
    totalLessons,
    completedCount,
    remainingCount: totalLessons - completedCount,
    percentage:
      totalLessons === 0
        ? 0
        : Math.round((completedCount / totalLessons) * 100),
    totalXP: completedLessons.reduce(
      (total, item) => total + item.xp,
      0
    ),
  };
};

export const getPythonAreas = () => {
  return [...new Set(pythonLessons.map((item) => item.area))];
};

// ---------------------------------------------------------
// EXPORTS
// Supports both default and named imports.
// ---------------------------------------------------------

export { pythonLessons };

export default pythonLessons;
