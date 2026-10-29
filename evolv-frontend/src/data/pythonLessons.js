// src/data/pythonLessons.js

// ============================================================
// EVOLV — PYTHON LEARNING CURRICULUM
// 60 lessons | 8 worlds | Progressive difficulty
//
// Compatibility preserved:
// - Existing lesson IDs: 1–60
// - Existing world names
// - Existing lesson properties
// - Existing named/default exports
// - Existing progress and XP helper functions
//
// IMPORTANT:
// - expectedOutput describes the expected result; it does not
//   mean the frontend has executed Python.
// - File and input lessons may require special runner support.
// ============================================================

// ============================================================
// LESSON FACTORY
// ============================================================

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

  question,
  options,
  answer,
  hint,

  videoUrl: extra.videoUrl || "",
  videoTitle: extra.videoTitle || title,

  audioUrl: extra.audioUrl || "",
  audioText: extra.audioText || explanation,

  instructions: extra.instructions || description,

  starterCode: extra.starterCode ?? example,
  solutionCode: extra.solutionCode ?? example,

  validation: extra.validation || "output",
  expectedResult: extra.expectedResult ?? expectedOutput,

  quizQuestions: extra.quizQuestions || [],

  activities: extra.activities || [
    {
      type: "predict",
      prompt: `Predict the output of "${title}" before running the code.`,
      code: example,
      expectedOutput,
    },
    {
      type: "debug",
      prompt: `Modify the "${title}" example, predict the result, and test your prediction.`,
      code: example,
    },
    {
      type: "practice",
      prompt: extra.instructions || description,
      hint,
    },
  ],
});

// ============================================================
// PYTHON LESSONS
// ============================================================

const pythonLessons = [
  // ==========================================================
  // WORLD 1 — PYTHON MEADOW
  // ==========================================================

  lesson(
    1,
    "Meet Python",
    "Python Meadow",
    "Understand programs and write your first Python instructions.",
    `Python is a general-purpose programming language used in automation, web development, data analysis, and artificial intelligence. A program is a sequence of instructions. Python executes statements in order. The print() function displays values, parentheses contain its arguments, and quotation marks represent text. Python's readable syntax makes it suitable for beginners.`,
    'print("Hello, EVOLV!")\nprint("I am learning Python.")\nprint(2 + 3)',
    "Hello, EVOLV!\nI am learning Python.\n5",
    "Which function displays a value?",
    ["input()", "print()", "type()", "len()"],
    1,
    "It sends a value to the output.",
    {
      videoUrl: "/videos/Meet Python.html",
      videoTitle: "Meet Python — Animated Introduction",
      instructions:
        'Change the first greeting, add print("My first program"), and print the result of 8 + 4.',
      starterCode: 'print("Hello, EVOLV!")\nprint(2 + 3)',
      solutionCode:
        'print("Welcome to EVOLV!")\nprint("My first program")\nprint(8 + 4)',
      quizQuestions: [
        {
          question: "What is Python?",
          options: [
            "A programming language",
            "A database table",
            "A web browser",
            "An operating system",
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
          question: "What does print(2 + 3) display?",
          options: ["23", "5", "2 + 3", "An error"],
          answer: 1,
        },
        {
          question: "Which is a valid Python statement?",
          options: [
            "print('Hello')",
            "print 'Hello'",
            "show('Hello')",
            "output 'Hello'",
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
    "Display text, numbers, variables, and calculated values.",
    `print() displays the values passed to it. Multiple arguments separated by commas are normally separated by spaces in the output. Separate print() calls produce separate lines by default. A numeric value such as 10 differs from the string "10": one is a number and the other is text.`,
    'print("Welcome to EVOLV")\nprint(10)\nname = "EVO"\nprint("Hello", name)\nprint("Score:", 4 + 6)',
    "Welcome to EVOLV\n10\nHello EVO\nScore: 10",
    "Which statement prints the numeric value 25?",
    ['print("25")', "print(25)", "display = 25", "echo(25)"],
    1,
    "Use print() with the number inside its parentheses.",
    { videoUrl: "/videos/Printing Messages.html",
      videoTitle: "Meet Python — Animated Introduction",
      
      instructions:
        "Print a welcome message, a learner's name, and a score calculated from two numbers.",
      starterCode:
        'name = "EVO"\nfirst_score = 12\nsecond_score = 8\n\n# Display the name and total score',
      solutionCode:
        'name = "EVO"\nfirst_score = 12\nsecond_score = 8\nprint("Learner:", name)\nprint("Total score:", first_score + second_score)',
      quizQuestions: [
        {
          question: 'What does print("EVOLV", 10) display?',
          options: [
            "EVOLV10",
            "EVOLV 10",
            '"EVOLV", 10',
            "An error",
          ],
          answer: 1,
        },
        {
          question: "Which value is numeric?",
          options: ['"42"', "42", '"3.5"', '"hello"'],
          answer: 1,
        },
        {
          question: "What does print(7 + 3) display?",
          options: ["73", "10", "7 + 3", "7"],
          answer: 1,
        },
        {
          question: "What is the default separator between print arguments?",
          options: ["A space", "A comma", "A tab only", "No separator"],
          answer: 0,
        },
        {
          question: "What normally happens after a print() call finishes?",
          options: [
            "The next print starts on a new line",
            "Python closes",
            "All variables are deleted",
            "The next value is added to the previous number",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    3,
    "Variables",
    "Python Meadow",
    "Store and update information using meaningful variable names.",
    `A variable name refers to a value. The assignment operator = assigns a value; it does not test equality. Variable names are case-sensitive and cannot begin with a digit. Use descriptive names such as student_name or score. Reassigning a variable changes the value used by later statements.`,
    'student_name = "EVO"\nscore = 10\nscore = score + 5\nprint(student_name)\nprint(score)',
    "EVO\n15",
    "Which operator assigns a value?",
    ["==", "=", "!=", ":"],
    1,
    "Assignment uses one equals sign.",
    {
      instructions:
        "Create variables for a learner's name and points. Increase the points by five and display the updated values.",
      starterCode:
        'name = "EVO"\npoints = 10\n\n# Add five points\n# Print name and points',
      solutionCode:
        'name = "EVO"\npoints = 10\npoints = points + 5\nprint(name)\nprint(points)',
      quizQuestions: [
        {
          question: "Which is a valid variable name?",
          options: ["2score", "student_name", "student name", "class"],
          answer: 1,
        },
        {
          question: "What is the value of score after score = 10 and score = score + 5?",
          options: ["5", "10", "15", "105"],
          answer: 2,
        },
        {
          question: "Are score and Score the same variable name?",
          options: [
            "Yes, always",
            "No, Python is case-sensitive",
            "Only inside functions",
            "Only for numbers",
          ],
          answer: 1,
        },
        {
          question: "What does = mean in an assignment?",
          options: [
            "Assign a value",
            "Check equality",
            "Check inequality",
            "Start a loop",
          ],
          answer: 0,
        },
        {
          question: "Which statement updates points by two?",
          options: [
            "points == points + 2",
            "points = points + 2",
            "points +== 2",
            "update points 2",
          ],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    4,
    "Numbers and Calculations",
    "Python Meadow",
    "Perform arithmetic with Python's numeric operators.",
    `Python supports addition (+), subtraction (-), multiplication (*), division (/), floor division (//), remainder (%), and exponentiation (**). Ordinary division produces a division result, while floor division rounds down. The remainder operator is useful for divisibility checks. Parentheses can make calculation order explicit.`,
    "a = 12\nb = 5\nprint(a + b)\nprint(a / b)\nprint(a // b)\nprint(a % b)\nprint(2 ** 3)",
    "17\n2.4\n2\n2\n8",
    "Which operator calculates a remainder?",
    ["//", "*", "%", "/"],
    2,
    "It is the percent symbol.",
    {
      instructions:
        "Build a bill calculator using a price and quantity. Display the total and the remainder when the total is divided by three.",
      starterCode:
        "price = 12\nquantity = 3\n\n# Calculate and print the total\n# Print total % 5",
      solutionCode:
        "price = 12\nquantity = 3\ntotal = price * quantity\nprint(total)\nprint(total % 5)",
      quizQuestions: [
        {
          question: "What is 7 * 4?",
          options: ["11", "28", "74", "3"],
          answer: 1,
        },
        {
          question: "What is 17 // 5?",
          options: ["3", "3.4", "2", "4"],
          answer: 0,
        },
        {
          question: "What is 17 % 5?",
          options: ["3", "5", "2", "0"],
          answer: 2,
        },
        {
          question: "Which operator calculates 2 to the power of 4?",
          options: ["2 * 4", "2 ** 4", "2 // 4", "2 % 4"],
          answer: 1,
        },
        {
          question: "What is the result of 10 / 2?",
          options: ["5", "5.0", "2", "10"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    5,
    "Strings",
    "Python Meadow",
    "Create, combine, and inspect text values.",
    `A string is text enclosed in matching quotation marks. The + operator joins strings, len() counts characters, and f-strings allow variable values to be inserted into text. Strings are immutable, so string methods return new strings instead of modifying the original string in place.`,
    'first = "Hello"\nsecond = "Python"\ngreeting = first + " " + second\nprint(greeting)\nprint(len(greeting))\nprint(f"Welcome to {second}!")',
    "Hello Python\n12\nWelcome to Python!",
    "Which value is a string?",
    ["25", "3.14", '"EVOLV"', "True"],
    2,
    "Text is enclosed in matching quotation marks.",
    {
      instructions:
        "Create a name and a favourite language. Combine them into a sentence, then print the sentence length.",
      starterCode:
        'name = "EVO"\nlanguage = "Python"\n\n# Create a greeting using both variables\n# Print the greeting length',
      solutionCode:
        'name = "EVO"\nlanguage = "Python"\ngreeting = f"{name} is learning {language}."\nprint(greeting)\nprint(len(greeting))',
      quizQuestions: [
        {
          question: 'What is the type of "Python"?',
          options: ["int", "str", "float", "bool"],
          answer: 1,
        },
        {
          question: 'What does "EV" + "OLV" produce?',
          options: ["EV OLV", "EVOLV", "An error", "EV+OLV"],
          answer: 1,
        },
        {
          question: 'What does len("cat") return?',
          options: ["2", "3", "4", "cat"],
          answer: 1,
        },
        {
          question: "Which prefix commonly introduces an f-string?",
          options: ["s", "f", "p", "t"],
          answer: 1,
        },
        {
          question: "What does string immutability mean?",
          options: [
            "A string cannot be modified in place",
            "A string cannot contain spaces",
            "A string must contain numbers",
            "A string cannot be printed",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    6,
    "Getting User Input",
    "Python Meadow",
    "Collect information entered by the person running a program.",
    `input() displays an optional prompt and waits for the user to enter information. Its result is a string, even when the user enters digits. Convert suitable text with int() or float() before arithmetic. Invalid numeric text raises ValueError unless the program handles it. Input-based programs require an execution environment that supports interactive input.`,
    'name = input("Name: ")\nprint(f"Hello, {name}!")\nage = int(input("Age: "))\nprint(age + 1)',
    "The program greets the entered name and prints the entered age plus one.",
    "What type does input() return by default?",
    ["int", "float", "str", "bool"],
    2,
    "Keyboard input initially arrives as text.",
    {
      type: "hands-on",
      instructions:
        "Ask for a name and age. Convert the age to an integer before calculating the age next year.",
      starterCode:
        'name = input("Name: ")\nage_text = input("Age: ")\n\n# Convert age_text to an integer\n# Print a greeting and the age next year',
      solutionCode:
        'name = input("Name: ")\nage_text = input("Age: ")\nage = int(age_text)\nprint(f"Hello, {name}!")\nprint(age + 1)',
      validation: "manual",
      quizQuestions: [
        {
          question: 'If the user enters 19, what does input() initially return?',
          options: ["19 as an integer", '"19" as a string', "19.0", "True"],
          answer: 1,
        },
        {
          question: "Which function converts suitable text to a whole number?",
          options: ["str()", "int()", "print()", "len()"],
          answer: 1,
        },
        {
          question: 'What is int("20") + 2?',
          options: ["202", "22", "20", "An error"],
          answer: 1,
        },
        {
          question: 'What happens with int("hello")?',
          options: [
            "Returns zero",
            "Returns hello",
            "Raises ValueError",
            "Returns True",
          ],
          answer: 2,
        },
        {
          question: "Why might a browser-based lesson need special support for input()?",
          options: [
            "It requires interactive input handling",
            "It only works with lists",
            "It changes the CSS",
            "It cannot use strings",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    7,
    "Converting Data Types",
    "Python Meadow",
    "Convert values and inspect their types.",
    `Python values have types such as str, int, float, and bool. Use int() for suitable integer text, float() for decimal text, and str() to create text. Conversions can fail when the supplied value is unsuitable. type() can help inspect a value's type during learning.`,
    'age = int("19")\nprice = float("3.5")\nprint(age + 1)\nprint(price * 2)\nprint(type(age).__name__)',
    "20\n7.0\nint",
    "Which function converts suitable text to an integer?",
    ["str()", "int()", "input()", "type()"],
    1,
    "Its name is short for integer.",
    {
      instructions:
        "Convert text representing a quantity and a price. Calculate their product and inspect the types.",
      starterCode:
        'quantity_text = "4"\nprice_text = "2.5"\n\n# Convert both values\n# Print their product',
      solutionCode:
        'quantity_text = "4"\nprice_text = "2.5"\nquantity = int(quantity_text)\nprice = float(price_text)\nprint(quantity * price)\nprint(type(quantity).__name__)\nprint(type(price).__name__)',
      quizQuestions: [
        {
          question: 'What is int("12")?',
          options: ['"12"', "12", "12.0", "An error"],
          answer: 1,
        },
        {
          question: 'What is float("2.5")?',
          options: ["2", "2.5", '"2.5"', "An error"],
          answer: 1,
        },
        {
          question: "What does str(25) return?",
          options: ["25 as text", "25 as a float", "True", "None"],
          answer: 0,
        },
        {
          question: 'What happens when int("3.5") is evaluated?',
          options: [
            "It returns 3.5",
            "It raises ValueError",
            "It returns 4",
            "It returns False",
          ],
          answer: 1,
        },
        {
          question: "Which expression gets the type name of value?",
          options: [
            "type(value).__name__",
            "value.type()",
            "name(value)",
            "typeof value",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    8,
    "Booleans",
    "Python Meadow",
    "Represent truth using True and False.",
    `A Boolean represents one of two truth values: True or False. Python Boolean literals are case-sensitive. Comparisons produce Boolean results. Boolean variables are useful for representing states such as is_ready or has_ticket. The string "True" is text, not the Boolean value True.`,
    'is_ready = True\nhas_ticket = False\nprint(is_ready)\nprint(5 > 8)\nprint(type("True").__name__)',
    "True\nFalse\nstr",
    "Which is a valid Boolean literal?",
    ["true", "FALSE", "True", "yes"],
    2,
    "The first letter is uppercase.",
    {
      instructions:
        "Create two Boolean variables and print a comparison that produces another Boolean result.",
      starterCode:
        "is_registered = True\nhas_completed_lesson = False\n\n# Print both values\n# Check whether the learner is registered",
      solutionCode:
        "is_registered = True\nhas_completed_lesson = False\nprint(is_registered)\nprint(has_completed_lesson)\nprint(is_registered and has_completed_lesson)",
      quizQuestions: [
        {
          question: "Which two values are Python Boolean literals?",
          options: [
            "yes and no",
            "True and False",
            "1 and 2 only",
            '"true" and "false"',
          ],
          answer: 1,
        },
        {
          question: "What is the result of 5 > 8?",
          options: ["True", "False", "5", "8"],
          answer: 1,
        },
        {
          question: 'What is the type of "True"?',
          options: ["bool", "int", "str", "float"],
          answer: 2,
        },
        {
          question: "What does bool(0) return?",
          options: ["True", "False", "0", "None"],
          answer: 1,
        },
        {
          question: "Which variable name best represents a Boolean state?",
          options: ["student name", "is_logged_in", "2ready", "class"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    9,
    "Comparisons",
    "Python Meadow",
    "Compare values and use the resulting Boolean values.",
    `Comparison operators include ==, !=, >, <, >=, and <=. They test relationships and produce Boolean results. The assignment operator = is different from the equality operator ==. Boundary conditions matter: >= includes equality, while > does not.`,
    "score = 82\nprint(score >= 50)\nprint(score == 100)\nprint(score != 0)",
    "True\nFalse\nTrue",
    "Which operator checks equality?",
    ["=", "==", "!=", ">"],
    1,
    "Equality checking uses two equals signs.",
    {
      instructions:
        "Test whether a score passes, equals 100, and differs from zero. Include the boundary score 50.",
      starterCode:
        "score = 50\n\n# Check whether score is at least 50\n# Check whether score equals 100",
      solutionCode:
        "score = 50\nprint(score >= 50)\nprint(score == 100)\nprint(score != 0)",
      quizQuestions: [
        {
          question: "What is 7 == 7?",
          options: ["True", "False", "7", "An error"],
          answer: 0,
        },
        {
          question: "Which condition means at least 50?",
          options: ["score > 50", "score >= 50", "score < 50", "score != 50"],
          answer: 1,
        },
        {
          question: "What does != mean?",
          options: ["Equal to", "Not equal to", "Greater than", "Assign"],
          answer: 1,
        },
        {
          question: "What is 10 < 4?",
          options: ["True", "False", "10", "4"],
          answer: 1,
        },
        {
          question: "What is the difference between = and ==?",
          options: [
            "= assigns; == compares equality",
            "They are identical",
            "= compares; == assigns",
            "Both start loops",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    10,
    "Meadow Checkpoint",
    "Python Meadow",
    "Combine output, variables, strings, arithmetic, and comparisons.",
    `Trace assignments in order, evaluate arithmetic, and examine comparison results. Variables may change during a program, so use their current values when predicting output. A good debugging habit is to trace each statement and verify the result with a small test.`,
    'name = "EVO"\npoints = 5\npoints = points + 3\npassed = points >= 8\nprint(name, points)\nprint(passed)',
    "EVO 8\nTrue",
    "What does print(2 + 3) display?",
    ["23", "5", "2 + 3", "An error"],
    1,
    "The plus operator adds numbers.",
    {
      type: "quiz",
      instructions:
        "Predict each output. Change points to 7, 8, and 9 and explain when passed changes.",
      starterCode:
        'name = "EVO"\npoints = 5\npoints = points + 3\npassed = points >= 8\nprint(name, points)\nprint(passed)',
      solutionCode:
        'name = "EVO"\npoints = 5\npoints += 3\npassed = points >= 8\nprint(name, points)\nprint(passed)',
      quizQuestions: [
        {
          question: "Which operator assigns a value?",
          options: ["=", "==", "!=", "<"],
          answer: 0,
        },
        {
          question: 'What is the type of "Python"?',
          options: ["int", "str", "bool", "float"],
          answer: 1,
        },
        {
          question: "What is 10 % 3?",
          options: ["3", "1", "0", "10"],
          answer: 1,
        },
        {
          question: "What is the result of 4 > 7?",
          options: ["True", "False", "4", "7"],
          answer: 1,
        },
        {
          question: "If points is 8, what is points >= 8?",
          options: ["True", "False", "8", "An error"],
          answer: 0,
        },
      ],
    }
  ),

  // ==========================================================
  // WORLD 2 — LOGIC FOREST
  // ==========================================================

  lesson(
    11,
    "Making Decisions with if",
    "Logic Forest",
    "Run a block of code only when its condition is true.",
    `An if statement evaluates a condition and executes its indented block when that condition is true. A colon begins the block, and indentation identifies the statements that belong to it. If the condition is false, Python skips the block and continues after it.`,
    'temperature = 30\nif temperature > 25:\n    print("It is warm")\nprint("Weather check complete")',
    "It is warm\nWeather check complete",
    "Which keyword begins a conditional statement?",
    ["when", "if", "check", "case"],
    1,
    "It is a two-letter keyword.",
    { videoUrl: "/videos/if%20condition.html",
      videoTitle: "Making Decisions with if — Video",
      instructions:
        "Change the temperature to 18 and add a separate condition that prints a jacket reminder below 20 degrees.",
      starterCode:
        'temperature = 18\n\n# Print "It is warm" if temperature > 25\n# Print "Bring a jacket" if temperature < 20',
      solutionCode:
        'temperature = 18\nif temperature > 25:\n    print("It is warm")\nif temperature < 20:\n    print("Bring a jacket")',
      quizQuestions: [
        {
          question: "When does an if block execute?",
          options: [
            "When its condition is true",
            "Every time",
            "Only inside a function",
            "Only after a loop",
          ],
          answer: 0,
        },
        {
          question: "What punctuation follows an if condition?",
          options: [".", ":", ";", ","],
          answer: 1,
        },
        {
          question: "What does indentation identify?",
          options: [
            "The statements inside the block",
            "The variable type",
            "The file extension",
            "The module name",
          ],
          answer: 0,
        },
        {
          question: "If temperature is 20, is temperature > 25 true?",
          options: ["Yes", "No", "Only for strings", "An error"],
          answer: 1,
        },
        {
          question: "What happens when an if condition is false and there is no else?",
          options: [
            "Its block is skipped",
            "The program must crash",
            "The condition becomes true",
            "Python repeats the statement",
          ],
          answer: 0,
        },
      ],
    }
  ),

lesson(
  12,
  "if and else",
  "Logic Forest",
  "Choose between two possible paths in a program.",
  `An if/else statement selects one of two paths. Python checks the if condition. If it is true, the if block runs; otherwise, the else block runs. Both blocks require colons and consistent indentation. Use >= when the boundary value should be included.`,
  'age = 16\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
  "Minor",
  "When does the else block run?",
  ["Always", "When the if condition is false", "Before if", "Only in loops"],
  1,
  "It handles the alternative path.",
  {
    type: "hands-on",

    // Video
    videoUrl: "/videos/ifelse%20condition.html",
    videoTitle: "Python if and else — Video",

    instructions:
      "Write a pass/fail program for a score of 50 or more. Test scores 49, 50, and 51.",
    starterCode:
      'score = 45\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")',
    solutionCode:
      'score = 45\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")',
    quizQuestions: [
      {
        question: "If age is 20, what does the example print?",
        options: ["Adult", "Minor", "Both", "Nothing"],
        answer: 0,
      },
      {
        question: "What does else represent?",
        options: [
          "The alternative path",
          "A loop",
          "A variable",
          "A function return",
        ],
        answer: 0,
      },
      {
        question: "What does score >= 50 include?",
        options: [
          "Only values greater than 50",
          "50 and values greater than 50",
          "Only values below 50",
          "Only zero",
        ],
        answer: 1,
      },
      {
        question: "Which structure selects between two paths?",
        options: ["if/else", "for/import", "class/def", "try/with"],
        answer: 0,
      },
      {
        question: "How many branches of a basic if/else run?",
        options: ["Neither", "Both", "One", "Always three"],
        answer: 2,
      },
    ],
  }
),

  lesson(
    13,
    "elif Conditions",
    "Logic Forest",
    "Select among several outcomes using ordered conditions.",
    `elif checks another condition when earlier conditions are false. Python evaluates a conditional chain from top to bottom and runs the first matching branch. Place thresholds in the appropriate order so a broad condition does not prevent a more specific branch from being reached. An else branch can handle all remaining cases.`,
    'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',
    "B",
    "What does elif allow you to do?",
    ["Repeat a loop", "Check another condition", "Create a variable", "Read a file"],
    1,
    "It adds another conditional branch.",
    { videoUrl: "/videos/elif%20condition.html",
      videoTitle: "Python elif — Video",
      instructions:
        "Extend the grade program with A, B, C, and Fail outcomes. Test values near each grade boundary.",
      starterCode:
        'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C or below")',
      solutionCode:
        'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelif score >= 50:\n    print("C")\nelse:\n    print("Fail")',
      quizQuestions: [
        {
          question: "Which branch is checked after a false if condition?",
          options: ["elif", "class", "return", "import"],
          answer: 0,
        },
        {
          question: "What does the chain print when score is 95?",
          options: ["A", "B", "C", "Fail"],
          answer: 0,
        },
        {
          question: "What does the chain print when score is 75?",
          options: ["A", "B", "C", "Fail"],
          answer: 1,
        },
        {
          question: "When is an else branch used?",
          options: [
            "When no preceding branch matches",
            "Before the if",
            "After every matching branch",
            "Only inside a loop",
          ],
          answer: 0,
        },
        {
          question: "Why does the order of grade conditions matter?",
          options: [
            "The first matching branch runs",
            "Python sorts the conditions",
            "All branches run",
            "The last condition is always true",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    14,
    "Logical Operators",
    "Logic Forest",
    "Combine conditions using and, or, and not.",
    `and is true only when both operands are truthy. or is true when at least one operand is truthy. not reverses a truth value. Logical operators allow a program to represent rules involving several requirements. Parentheses can make more complicated conditions easier to understand.`,
    'age = 20\nhas_id = True\nprint(age >= 18 and has_id)\nprint(age < 18 or not has_id)',
    "True\nFalse",
    "When is A and B true?",
    ["When either is true", "When both are true", "When both are false", "Always"],
    1,
    "and requires both conditions.",
    { 
      videoUrl: "/videos/logical%20operators.html",
      videoTitle: "Logical Operators",
      instructions:
        "Create a login rule requiring both a correct password flag and an active-account flag.",
      starterCode:
        "correct_password = True\naccount_active = False\n\n# Check both requirements with and",
      solutionCode:
        "correct_password = True\naccount_active = False\ncan_login = correct_password and account_active\nprint(can_login)",
      quizQuestions: [
        {
          question: "What is True and False?",
          options: ["True", "False", "None", "An error"],
          answer: 1,
        },
        {
          question: "What is True or False?",
          options: ["True", "False", "None", "An error"],
          answer: 0,
        },
        {
          question: "What is not True?",
          options: ["True", "False", "1", "None only"],
          answer: 1,
        },
        {
          question: "Which operator requires both conditions to be true?",
          options: ["or", "and", "not", "in"],
          answer: 1,
        },
        {
          question: "If correct_password is True but account_active is False, what is their and result?",
          options: ["True", "False", "1", "An error"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    15,
    "Nested Conditions",
    "Logic Forest",
    "Place one conditional inside another conditional block.",
    `A nested conditional is an if statement inside another conditional block. Indentation shows which condition owns each statement. Nested conditions can express dependent decisions, but excessive nesting can make code difficult to follow. Consider combining conditions or using an elif chain when it makes the logic clearer.`,
    'logged_in = True\nis_admin = False\nif logged_in:\n    if is_admin:\n        print("Admin")\n    else:\n        print("Member")\nelse:\n    print("Please log in")',
    "Member",
    "What makes an if statement nested?",
    [
      "It has no condition",
      "It is inside another block",
      "It has no indentation",
      "It uses a loop",
    ],
    1,
    "Look at where the second if appears.",
    { videoUrl: "/videos/Nested%20Conditions.html",
      videoTitle: "Nested Conditions",
      instructions:
        "Check whether a user is logged in. If so, check whether they have completed a lesson. Print a different message for each situation.",
      starterCode:
        "logged_in = True\nlesson_completed = False\n\n# Check logged_in first\n# Inside that block, check lesson_completed",
      solutionCode:
        'logged_in = True\nlesson_completed = False\nif logged_in:\n    if lesson_completed:\n        print("Ready for the next lesson")\n    else:\n        print("Finish your lesson")\nelse:\n    print("Please log in")',
      quizQuestions: [
        {
          question: "What is a nested conditional?",
          options: [
            "An if statement inside another block",
            "A loop with no body",
            "A string comparison only",
            "A function with no parameters",
          ],
          answer: 0,
        },
        {
          question: "What does the example print?",
          options: ["Admin", "Member", "Please log in", "Nothing"],
          answer: 1,
        },
        {
          question: "Which variable controls the outer decision?",
          options: ["is_admin", "logged_in", "print", "else"],
          answer: 1,
        },
        {
          question: "What does indentation show?",
          options: [
            "Block membership",
            "The number's type",
            "The file extension",
            "The string length",
          ],
          answer: 0,
        },
        {
          question: "What can make deeply nested code easier to understand?",
          options: [
            "Clear conditions and simpler branches",
            "Removing every condition",
            "Removing indentation",
            "Using random variable names",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    16,
    "Membership Operators",
    "Logic Forest",
    "Check whether a value exists inside a sequence.",
    `The in operator checks whether a value appears in a string or collection. not in checks the opposite. Membership checks are useful for verifying whether a course appears in a list or whether a character occurs in text.`,
    'language = "Python"\nprint("Py" in language)\nprint("Java" in language)\nprint("on" not in language)',
    "True\nFalse\nFalse",
    "Which operator checks membership?",
    ["has", "in", "contains", "belongs"],
    1,
    "It is an ordinary English word.",
    { videoUrl: "/videos/Membership%20Operators.html",
      videoTitle: "Nested Conditions",
      instructions:
        "Create a list of available courses. Check whether Python and Java are present, then check whether SQL is absent.",
      starterCode:
        'courses = ["Python", "HTML", "JavaScript"]\n\n# Use in and not in',
      solutionCode:
        'courses = ["Python", "HTML", "JavaScript"]\nprint("Python" in courses)\nprint("Java" in courses)\nprint("SQL" not in courses)',
      quizQuestions: [
        {
          question: 'What is "Py" in "Python"?',
          options: ["True", "False", "None", "An error"],
          answer: 0,
        },
        {
          question: 'What is "Java" in "Python"?',
          options: ["True", "False", "Java", "None"],
          answer: 1,
        },
        {
          question: "Which operator checks absence?",
          options: ["is", "not in", "contains", "equals"],
          answer: 1,
        },
        {
          question: "What does 3 in [1, 2, 3] return?",
          options: ["True", "False", "3", "An error"],
          answer: 0,
        },
        {
          question: "Which collection supports membership testing?",
          options: ["A list", "A tuple", "A string", "All of these"],
          answer: 3,
        },
      ],
    }
  ),

  lesson(
    17,
    "Conditional Expressions",
    "Logic Forest",
    "Choose one of two values using a compact conditional expression.",
    `A conditional expression selects one of two values using the form value_if_true if condition else value_if_false. It suits simple choices such as assigning a status label. Use a regular if/else statement when each branch needs several statements or the logic is complicated.`,
    'age = 20\nstatus = "Adult" if age >= 18 else "Minor"\nprint(status)',
    "Adult",
    "Which keyword separates the alternative value?",
    ["elif", "else", "then", "switch"],
    1,
    "It introduces the alternative branch.",
    { videoUrl: "/videos/Conditional%20Expressions.html",
      videoTitle: "Nested Conditions",
      instructions:
        "Create a conditional expression that labels a score as Pass or Fail.",
      starterCode:
        'score = 65\n\n# Set status to "Pass" when score >= 50, otherwise "Fail"\n# Print status',
      solutionCode:
        'score = 65\nstatus = "Pass" if score >= 50 else "Fail"\nprint(status)',
      quizQuestions: [
        {
          question: "Which form is a conditional expression?",
          options: [
            '"Pass" if score >= 50 else "Fail"',
            "if score then Pass",
            "score ? Pass : Fail",
            "else score >= 50",
          ],
          answer: 0,
        },
        {
          question: "What is status when score is 65?",
          options: ["Pass", "Fail", "65", "None"],
          answer: 0,
        },
        {
          question: "What is status when score is 30?",
          options: ["Pass", "Fail", "30", "An error"],
          answer: 1,
        },
        {
          question: "When is a regular if/else statement preferable?",
          options: [
            "When branches require several statements",
            "Never",
            "Only for strings",
            "Only inside lists",
          ],
          answer: 0,
        },
        {
          question: "How many alternative values does a conditional expression choose between?",
          options: ["One", "Two", "Three", "Unlimited branches"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    18,
    "Truthiness",
    "Logic Forest",
    "Understand how Python interprets values in conditions.",
    `Python treats False, None, numeric zero, and empty collections such as "", [], and {} as false-like. Non-zero numbers and non-empty strings or collections are generally truthy. This behavior is useful for checking whether a value is supplied, but explicit comparisons can be clearer when the intended rule is specific.`,
    'name = "Python"\nitems = []\nif name:\n    print("Name supplied")\nif not items:\n    print("No items yet")',
    "Name supplied\nNo items yet",
    "Which value is false-like?",
    ['"hello"', "5", "[]", "[1]"],
    2,
    "An empty list is false-like.",
    { videoUrl: "/videos/Python%20Truthiness.html",
      videoTitle: "Python Truthiness",
      instructions:
        "Test an empty string, a non-empty string, an empty list, and a list containing one item.",
      starterCode:
        'name = ""\nitems = []\n\n# Print bool(name) and bool(items)\n# Add a name and an item, then test again',
      solutionCode:
        'name = ""\nitems = []\nprint(bool(name))\nprint(bool(items))\nname = "EVO"\nitems.append("Python")\nprint(bool(name))\nprint(bool(items))',
      quizQuestions: [
        {
          question: "What is bool([])?",
          options: ["True", "False", "[]", "None"],
          answer: 1,
        },
        {
          question: 'What is bool("Python")?',
          options: ["True", "False", "Python", "An error"],
          answer: 0,
        },
        {
          question: "Which numeric value is false-like?",
          options: ["1", "-2", "0", "3"],
          answer: 2,
        },
        {
          question: "What is bool([0])?",
          options: ["True", "False", "0", "None"],
          answer: 0,
        },
        {
          question: "Which expression tests whether items is empty using truthiness?",
          options: ["if not items:", "if items == 1:", "if items > 0:", "if empty(items):"],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    19,
    "Decision Practice",
    "Logic Forest",
    "Build decisions that handle thresholds and boundary values correctly.",
    `Reliable decision logic handles ordinary values and boundaries. “At least 50” means score >= 50. For several ranges, choose comparison operators carefully so every intended value belongs to the correct range. Test values just below, at, and just above each threshold.`,
    'temperature = 24\nif temperature < 18:\n    print("Cool")\nelif temperature <= 28:\n    print("Comfortable")\nelse:\n    print("Hot")',
    "Comfortable",
    "Which condition checks whether a score is at least 50?",
    ["score > 50", "score >= 50", "score = 50", "score < 50"],
    1,
    "At least includes equality.",
    { videoUrl: "/videos/Decision%20Practise.html",
      videoTitle: "Decision Practise",
      instructions:
        'Build a temperature alert: below 18 prints "Cool", 18 through 28 prints "Comfortable", and above 28 prints "Hot".',
      starterCode:
        "temperature = 18\n\n# Add an if/elif/else chain",
      solutionCode:
        'temperature = 18\nif temperature < 18:\n    print("Cool")\nelif temperature <= 28:\n    print("Comfortable")\nelse:\n    print("Hot")',
      quizQuestions: [
        {
          question: "What does the example print for temperature 24?",
          options: ["Cool", "Comfortable", "Hot", "Nothing"],
          answer: 1,
        },
        {
          question: 'What does the example print for temperature 18?',
          options: ["Cool", "Comfortable", "Hot", "An error"],
          answer: 1,
        },
        {
          question: "Which condition describes a value strictly below 18?",
          options: ["temperature < 18", "temperature >= 18", "temperature == 18", "temperature > 18"],
          answer: 0,
        },
        {
          question: "Why test values at a boundary?",
          options: [
            "To verify inclusive and exclusive comparisons",
            "To make Python run faster",
            "To create a variable",
            "To avoid writing conditions",
          ],
          answer: 0,
        },
        {
          question: "What does temperature 30 produce?",
          options: ["Cool", "Comfortable", "Hot", "None"],
          answer: 2,
        },
      ],
    }
  ),

  lesson(
    20,
    "Logic Forest Checkpoint",
    "Logic Forest",
    "Combine conditionals, logical operators, membership, and truthiness.",
    `Evaluate each condition before choosing a branch. Remember that logical operators combine truth values, membership checks look for elements, and empty collections are false-like. Test several inputs to make sure the program follows the intended path.`,
    'value = 12\nif value % 2 == 0 and value > 10:\n    print("Even and greater than ten")\nelse:\n    print("Other value")',
    "Even and greater than ten",
    "Which operator means logical AND?",
    ["or", "and", "not", "in"],
    1,
    "Both conditions must be true.",
    {
      type: "quiz",
      instructions:
        "Test values 9, 10, 11, and 12. Explain why each value follows its branch.",
      quizQuestions: [
        {
          question: "Which keyword begins a conditional?",
          options: ["if", "for", "def", "return"],
          answer: 0,
        },
        {
          question: "What is 10 % 2 == 0?",
          options: ["True", "False", "10", "0"],
          answer: 0,
        },
        {
          question: "What does and require?",
          options: [
            "Both conditions true",
            "Either condition true",
            "Both conditions false",
            "No conditions",
          ],
          answer: 0,
        },
        {
          question: 'What is "a" in "cat"?',
          options: ["False", "True", "None", "An error"],
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

  // ==========================================================
  // WORLD 3 — LOOP RIVER
  // ==========================================================

  lesson(
    21,
    "Why Loops?",
    "Loop River",
    "Repeat instructions without copying the same code.",
    `A loop repeats a block of instructions. A for loop commonly visits items in an iterable or values generated by range(). A while loop repeats while its condition remains true. Every loop should have a clear purpose and stopping behavior.`,
    'for number in range(1, 4):\n    print("Practice", number)',
    "Practice 1\nPractice 2\nPractice 3",
    "What is the main purpose of a loop?",
    ["Store data", "Repeat instructions", "Define a class", "Import a module"],
    1,
    "It avoids repeating the same instruction manually.",
    {
      instructions:
        "Print a practice reminder five times using a loop. Change the range and predict how many lines appear.",
      starterCode:
        "for number in range(1, 6):\n    # Print a practice reminder",
      solutionCode:
        'for number in range(1, 6):\n    print("Keep learning!")',
      quizQuestions: [
        {
          question: "What problem do loops help solve?",
          options: [
            "Repeated instructions",
            "Missing file extensions only",
            "All syntax errors",
            "Every type conversion",
          ],
          answer: 0,
        },
        {
          question: "How many times does range(1, 4) iterate?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "Which loop is commonly used to visit each item in a list?",
          options: ["for", "class", "import", "except"],
          answer: 0,
        },
        {
          question: "What must a finite while loop eventually achieve?",
          options: [
            "A false condition or another exit",
            "A new variable every time",
            "A file write",
            "A class definition",
          ],
          answer: 0,
        },
        {
          question: "What is a loop body?",
          options: [
            "The indented instructions repeated by the loop",
            "The file name",
            "The list length",
            "The output window",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    22,
    "The for Loop",
    "Loop River",
    "Visit each item in a sequence using a for loop.",
    `A for loop takes each item from an iterable, assigns it to the loop variable, and executes the indented body. Lists, strings, tuples, and ranges are common iterables. The loop variable receives a new value on each iteration.`,
    'for fruit in ["apple", "mango", "grape"]:\n    print(fruit)',
    "apple\nmango\ngrape",
    "Which keyword creates this loop?",
    ["repeat", "for", "each", "loop"],
    1,
    "It appears before the loop variable.",
    {
      instructions:
        "Loop through three subjects and print each subject with a numbered label.",
      starterCode:
        'subjects = ["Maths", "Python", "DBMS"]\n\n# Use a for loop and enumerate()',
      solutionCode:
        'subjects = ["Maths", "Python", "DBMS"]\nfor index, subject in enumerate(subjects, start=1):\n    print(index, subject)',
      quizQuestions: [
        {
          question: "What does a for loop receive from an iterable?",
          options: [
            "One item per iteration",
            "Only the final item",
            "Only an integer",
            "A class definition",
          ],
          answer: 0,
        },
        {
          question: "How many items are in the example list?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "What is the second value of fruit in the example?",
          options: ["apple", "mango", "grape", "fruit"],
          answer: 1,
        },
        {
          question: "Which type of value can a for loop iterate over?",
          options: ["A string", "A list", "A tuple", "All of these"],
          answer: 3,
        },
        {
          question: "What does enumerate() help provide?",
          options: [
            "An index and an item",
            "Only a file",
            "A random number",
            "A Boolean only",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    23,
    "Using range()",
    "Loop River",
    "Generate integer sequences for loops.",
    `range(stop) generates integers beginning at zero and stopping before stop. range(start, stop) sets a starting value, while range(start, stop, step) controls the interval. The stop value is excluded. A negative step can be used for counting down.`,
    "for number in range(1, 4):\n    print(number)",
    "1\n2\n3",
    "What values does range(3) generate?",
    ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
    1,
    "The stop value is excluded.",
    {
      instructions:
        "Print even numbers from 2 through 10, then count backward from 5 to 1.",
      starterCode:
        "# Print 2, 4, 6, 8, 10\n\n# Print 5, 4, 3, 2, 1",
      solutionCode:
        "for number in range(2, 11, 2):\n    print(number)\nfor number in range(5, 0, -1):\n    print(number)",
      quizQuestions: [
        {
          question: "What values does range(3) produce?",
          options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
          answer: 1,
        },
        {
          question: "What values does range(2, 6) produce?",
          options: ["2, 3, 4, 5", "2, 3, 4, 5, 6", "1, 2, 3, 4, 5", "6 only"],
          answer: 0,
        },
        {
          question: "What does the third argument of range() control?",
          options: ["The step", "The data type", "The variable name", "The output format"],
          answer: 0,
        },
        {
          question: "What does range(5, 0, -1) produce?",
          options: ["5, 4, 3, 2, 1", "0, 1, 2, 3, 4", "5 only", "An empty sequence"],
          answer: 0,
        },
        {
          question: "How many values are generated by range(1, 5)?",
          options: ["3", "4", "5", "6"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    24,
    "The while Loop",
    "Loop River",
    "Repeat while a condition remains true.",
    `A while loop checks its condition before each iteration. If the condition is true, its body runs and the condition is checked again. Update the state controlling the loop so the condition can eventually become false. Otherwise, the loop may continue indefinitely.`,
    "count = 1\nwhile count <= 3:\n    print(count)\n    count += 1",
    "1\n2\n3",
    "What should a finite while loop eventually do?",
    ["Stop", "Restart Python", "Delete variables", "Import a library"],
    0,
    "Update the loop state so its condition becomes false.",
    {
      instructions:
        "Use a while loop to count from 1 to 5. Explain which statement makes the loop stop.",
      starterCode:
        "count = 1\nwhile count <= 5:\n    # Print count\n    # Increase count",
      solutionCode:
        "count = 1\nwhile count <= 5:\n    print(count)\n    count += 1",
      quizQuestions: [
        {
          question: "When is a while condition checked?",
          options: [
            "Before each iteration",
            "Only after the loop ends",
            "Only once when Python starts",
            "Never",
          ],
          answer: 0,
        },
        {
          question: "Why does count += 1 matter in the example?",
          options: [
            "It moves count toward the stopping condition",
            "It deletes count",
            "It starts another program",
            "It changes count to a string",
          ],
          answer: 0,
        },
        {
          question: "What is a common cause of an unintended infinite loop?",
          options: [
            "The stopping condition never becomes false",
            "Using print()",
            "Using a variable",
            "Indenting the body",
          ],
          answer: 0,
        },
        {
          question: "How many numbers are printed in the example?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "What happens if the initial count is 6?",
          options: [
            "The loop body is skipped",
            "It prints 6 once",
            "It prints 1 to 5",
            "It must crash",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    25,
    "break",
    "Loop River",
    "Exit the innermost loop before it finishes normally.",
    `break immediately exits the innermost loop containing it. It is useful when a search finds its target or a stopping condition is reached. Execution continues after the loop. Unlike continue, break terminates the loop rather than skipping to another iteration.`,
    'for number in range(5):\n    if number == 3:\n        break\n    print(number)',
    "0\n1\n2",
    "What does break do?",
    [
      "Skips one iteration",
      "Exits the current loop",
      "Restarts the loop",
      "Defines a function",
    ],
    1,
    "It ends the current loop immediately.",
    {
      instructions:
        "Search for a target number in a list and stop the loop as soon as the target is found.",
      starterCode:
        "numbers = [4, 7, 9, 12, 15]\ntarget = 9\n\n# Print each number until target is found\n# Use break",
      solutionCode:
        'numbers = [4, 7, 9, 12, 15]\ntarget = 9\nfor number in numbers:\n    if number == target:\n        print("Found", target)\n        break\n    print("Checking", number)',
      quizQuestions: [
        {
          question: "What does break terminate?",
          options: [
            "The innermost loop containing it",
            "Every Python installation",
            "Every function in the program",
            "The current variable",
          ],
          answer: 0,
        },
        {
          question: "Which numbers are printed before break in the example?",
          options: ["0, 1, 2", "0, 1, 2, 3", "1, 2, 3", "3, 4"],
          answer: 0,
        },
        {
          question: "What statement continues with the next iteration instead?",
          options: ["continue", "break", "return", "class"],
          answer: 0,
        },
        {
          question: "When is break useful in a search?",
          options: [
            "When the target is found",
            "Before the search begins",
            "Only when the list is empty",
            "When defining a class",
          ],
          answer: 0,
        },
        {
          question: "After break exits a loop, what normally happens?",
          options: [
            "Execution continues after the loop",
            "The program must close",
            "The loop restarts automatically",
            "The target is deleted",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    26,
    "continue",
    "Loop River",
    "Skip the remaining statements in the current iteration.",
    `continue skips the remaining statements in the current iteration and moves to the next iteration of the innermost loop. It is useful when certain values should be ignored. The loop continues; continue does not terminate the entire loop.`,
    "for number in range(4):\n    if number == 2:\n        continue\n    print(number)",
    "0\n1\n3",
    "What does continue do?",
    [
      "Ends the entire program",
      "Skips to the next iteration",
      "Deletes the loop",
      "Creates a list",
    ],
    1,
    "The loop moves on to its next value.",
    {
      instructions:
        "Print numbers from 1 to 10, skipping multiples of three.",
      starterCode:
        "for number in range(1, 11):\n    # Skip multiples of three\n    # Print other numbers",
      solutionCode:
        "for number in range(1, 11):\n    if number % 3 == 0:\n        continue\n    print(number)",
      quizQuestions: [
        {
          question: "What does continue skip?",
          options: [
            "The remaining statements in the current iteration",
            "The entire program",
            "All future loops",
            "The variable declaration",
          ],
          answer: 0,
        },
        {
          question: "What does the example omit?",
          options: ["0", "1", "2", "3"],
          answer: 2,
        },
        {
          question: "Does continue terminate the loop?",
          options: ["Yes, always", "No", "Only for lists", "Only for strings"],
          answer: 1,
        },
        {
          question: "Which condition detects a multiple of three?",
          options: ["number % 3 == 0", "number / 3 == 0", "number + 3", "number == 3"],
          answer: 0,
        },
        {
          question: "Which statement exits a loop immediately?",
          options: ["continue", "break", "if", "pass"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    27,
    "Nested Loops",
    "Loop River",
    "Use a loop inside another loop to process combinations.",
    `A nested loop is a loop inside another loop. The inner loop completes its iterations for each outer iteration. If the outer loop runs twice and the inner loop runs three times for each outer iteration, the inner body runs six times. Nested loops are useful for grids and combinations.`,
    "for row in range(2):\n    for col in range(2):\n        print(row, col)",
    "0 0\n0 1\n1 0\n1 1",
    "How many times does the inner body run?",
    ["2", "3", "4", "8"],
    2,
    "Multiply the number of outer and inner iterations.",
    {
      instructions:
        "Print a 3-by-3 coordinate grid using nested loops.",
      starterCode:
        "for row in range(3):\n    for col in range(3):\n        # Print row and col",
      solutionCode:
        "for row in range(3):\n    for col in range(3):\n        print(row, col)",
      quizQuestions: [
        {
          question: "How many times does the inner body run in the example?",
          options: ["2", "3", "4", "8"],
          answer: 2,
        },
        {
          question: "What is the first coordinate printed?",
          options: ["0 0", "0 1", "1 0", "1 1"],
          answer: 0,
        },
        {
          question: "If the outer loop runs 3 times and the inner loop runs 4 times, how many inner iterations occur?",
          options: ["7", "12", "4", "3"],
          answer: 1,
        },
        {
          question: "Which loop finishes its iterations for each outer iteration?",
          options: ["The inner loop", "The outer loop only", "Neither", "Both end immediately"],
          answer: 0,
        },
        {
          question: "What is a common use for nested loops?",
          options: ["Processing a grid", "Declaring a string only", "Importing a module only", "Converting a float only"],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    28,
    "Looping Through Strings",
    "Loop River",
    "Process each character in a string.",
    `Strings are iterable, so a for loop can visit their characters in order. Each iteration assigns one character to the loop variable. This is useful for counting letters, checking characters, and transforming text. An empty string produces no iterations.`,
    'for letter in "EVO":\n    print(letter)',
    "E\nV\nO",
    "What does a for loop over a string visit?",
    [
      "Only numbers",
      "Characters in the string",
      "Only spaces",
      "File names",
    ],
    1,
    "Each item is one character.",
    {
      instructions:
        "Count the vowels in a word by looping through its characters.",
      starterCode:
        'word = "education"\ncount = 0\n\n# Check each character for a, e, i, o, or u\n# Increase count when a vowel is found',
      solutionCode:
        'word = "education"\ncount = 0\nfor letter in word.lower():\n    if letter in "aeiou":\n        count += 1\nprint(count)',
      quizQuestions: [
        {
          question: "What does the loop visit in 'EVO'?",
          options: ["E, V, O", "Only EVO", "Only numbers", "Nothing"],
          answer: 0,
        },
        {
          question: "How many iterations occur for 'cat'?",
          options: ["2", "3", "4", "0"],
          answer: 1,
        },
        {
          question: "What happens when looping over an empty string?",
          options: [
            "The body runs zero times",
            "The body runs once",
            "The body runs forever",
            "Python must crash",
          ],
          answer: 0,
        },
        {
          question: "Which expression checks whether a character is a vowel?",
          options: [
            'letter in "aeiou"',
            "letter == vowels",
            "letter + 5",
            "len(letter) > 5",
          ],
          answer: 0,
        },
        {
          question: "Why might lower() help in vowel counting?",
          options: [
            "It standardises uppercase and lowercase letters",
            "It removes all vowels",
            "It converts letters to numbers",
            "It sorts the string",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    29,
    "Loop Patterns",
    "Loop River",
    "Use counters and accumulators to solve repetitive problems.",
    `A counter tracks how many times something happens. An accumulator stores a running result, such as a sum. Initialise the variable before the loop, update it during each iteration, and inspect it afterward. A numeric sum commonly starts at zero.`,
    "total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)",
    "6",
    "What is an accumulator used for?",
    [
      "Store a running result",
      "Stop Python",
      "Create a class",
      "Read input only",
    ],
    0,
    "It updates a result repeatedly.",
    {
      instructions:
        "Calculate the sum of numbers from 1 through 10 and count how many of them are even.",
      starterCode:
        "total = 0\neven_count = 0\n\n# Loop from 1 to 10\n# Update total and even_count",
      solutionCode:
        "total = 0\neven_count = 0\nfor number in range(1, 11):\n    total += number\n    if number % 2 == 0:\n        even_count += 1\nprint(total)\nprint(even_count)",
      quizQuestions: [
        {
          question: "What is the sum of range(1, 4)?",
          options: ["3", "4", "6", "10"],
          answer: 2,
        },
        {
          question: "What is a counter commonly used for?",
          options: [
            "Counting occurrences",
            "Storing a class definition",
            "Opening a file only",
            "Sorting strings automatically",
          ],
          answer: 0,
        },
        {
          question: "Why initialise total = 0 before summing?",
          options: [
            "To provide the starting total",
            "To stop the loop",
            "To create a string",
            "To import a module",
          ],
          answer: 0,
        },
        {
          question: "How many even numbers are between 1 and 10 inclusive?",
          options: ["4", "5", "6", "10"],
          answer: 1,
        },
        {
          question: "What does total += number do?",
          options: [
            "Adds number to the current total",
            "Resets total to zero",
            "Compares total and number",
            "Deletes number",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    30,
    "Loop River Checkpoint",
    "Loop River",
    "Review for, while, range, break, continue, and accumulators.",
    `for iterates over an iterable, while repeats as long as its condition remains true, and range() excludes its stop value. break exits the current loop, while continue skips to the next iteration. Accumulators must be initialised before they are updated.`,
    "total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)",
    "6",
    "Which statement skips the current iteration?",
    ["break", "continue", "return", "pass"],
    1,
    "It moves to the next iteration.",
    {
      type: "quiz",
      instructions:
        "Write a loop that calculates the sum of even numbers from 1 to 10. Test your result.",
      quizQuestions: [
        {
          question: "Which loop iterates through a sequence?",
          options: ["for", "class", "def", "try"],
          answer: 0,
        },
        {
          question: "What does range(3) produce?",
          options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
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
          question: "What is the sum of even numbers from 1 through 10?",
          options: ["20", "25", "30", "55"],
          answer: 2,
        },
      ],
    }
  ),

  // ==========================================================
  // WORLD 4 — DATA KINGDOM
  // ==========================================================

  lesson(
    31,
    "Lists",
    "Data Kingdom",
    "Store multiple ordered values in one collection.",
    `A list is an ordered, mutable collection. Lists use square brackets and commas between elements. They can contain different data types and can be changed after creation. Lists are useful for scores, names, tasks, and groups of values.`,
    'fruits = ["apple", "mango", "grape"]\nprint(fruits[0])\nprint(len(fruits))',
    "apple\n3",
    "Which brackets create a list?",
    ["()", "{}", "[]", "<>"],
    2,
    "They are square brackets.",
    {
      instructions:
        "Create a list of five subjects. Print the first subject and the number of subjects.",
      starterCode:
        'subjects = ["Maths", "Python", "DBMS"]\n\n# Add two more subjects\n# Print the first subject and list length',
      solutionCode:
        'subjects = ["Maths", "Python", "DBMS", "Java", "Networks"]\nprint(subjects[0])\nprint(len(subjects))',
      quizQuestions: [
        {
          question: "Which brackets create a list?",
          options: ["()", "[]", "{}", "<>"],
          answer: 1,
        },
        {
          question: "Are lists mutable?",
          options: ["Yes", "No", "Only when empty", "Only with strings"],
          answer: 0,
        },
        {
          question: "How many items are in [2, 4, 6]?",
          options: ["2", "3", "4", "6"],
          answer: 1,
        },
        {
          question: "Which method adds an item at the end?",
          options: ["append()", "strip()", "upper()", "read()"],
          answer: 0,
        },
        {
          question: "Can a list contain different data types?",
          options: ["Yes", "No", "Only strings", "Only integers"],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    32,
    "List Indexing",
    "Data Kingdom",
    "Access individual list items using their positions.",
    `Python uses zero-based indexing, so the first item is at index 0. Negative indexes count backward from the end, with -1 representing the last item. Accessing an invalid index raises IndexError.`,
    "numbers = [10, 20, 30]\nprint(numbers[0])\nprint(numbers[1])\nprint(numbers[-1])",
    "10\n20\n30",
    "What is the index of the first list item?",
    ["0", "1", "-1", "It has no index"],
    0,
    "Python uses zero-based indexing.",
    {
      instructions:
        "Print the first, third, and last values of a list. Identify the error from an invalid index.",
      starterCode:
        "numbers = [10, 20, 30, 40]\n\n# Print first, third, and last values",
      solutionCode:
        "numbers = [10, 20, 30, 40]\nprint(numbers[0])\nprint(numbers[2])\nprint(numbers[-1])",
      quizQuestions: [
        {
          question: "What is the first index in a list?",
          options: ["0", "1", "-1", "It depends on the value"],
          answer: 0,
        },
        {
          question: "What is numbers[1] for [10, 20, 30]?",
          options: ["10", "20", "30", "1"],
          answer: 1,
        },
        {
          question: "What does numbers[-1] access?",
          options: [
            "The first item",
            "The last item",
            "The second item",
            "No item",
          ],
          answer: 1,
        },
        {
          question: "What happens when a list index is out of range?",
          options: [
            "IndexError is raised",
            "The list is automatically expanded",
            "Python returns zero",
            "The list is sorted",
          ],
          answer: 0,
        },
        {
          question: "Which expression accesses the third item?",
          options: ["numbers[3]", "numbers[2]", "numbers[-3]", "numbers[1]"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    33,
    "Updating Lists",
    "Data Kingdom",
    "Add, replace, and remove list elements.",
    `Lists are mutable. Assign to an index to replace an item. append() adds to the end, insert() adds at a chosen position, remove() removes the first matching value, and pop() removes and returns an item. Choose the method according to whether you know the value or its position.`,
    "scores = [10, 20]\nscores.append(30)\nscores[0] = 5\nprint(scores)",
    "[5, 20, 30]",
    "Which method adds an item to the end of a list?",
    ["append()", "push()", "insertEnd()", "addLast()"],
    0,
    "This method appends a value.",
    {
      instructions:
        "Create three scores, append another score, update one item, and remove a value.",
      starterCode:
        "scores = [10, 20, 30]\n\n# Append 40\n# Replace the first score with 5\n# Remove 20",
      solutionCode:
        "scores = [10, 20, 30]\nscores.append(40)\nscores[0] = 5\nscores.remove(20)\nprint(scores)",
      quizQuestions: [
        {
          question: "Which method adds an item to the end?",
          options: ["append()", "remove()", "pop()", "sort()"],
          answer: 0,
        },
        {
          question: "What does scores[0] = 5 do?",
          options: [
            "Replaces the first item",
            "Adds an item at the end",
            "Deletes the list",
            "Sorts the list",
          ],
          answer: 0,
        },
        {
          question: "Which method removes the first matching value?",
          options: ["remove()", "append()", "insert()", "extend()"],
          answer: 0,
        },
        {
          question: "What does pop() normally return?",
          options: [
            "The removed item",
            "The whole program",
            "A class",
            "The list length only",
          ],
          answer: 0,
        },
        {
          question: "Are list updates allowed after the list is created?",
          options: ["Yes", "No", "Only for tuples", "Only for strings"],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    34,
    "Tuples",
    "Data Kingdom",
    "Store ordered values in an immutable collection.",
    `A tuple is an ordered collection that cannot be modified in place after creation. Tuples are commonly written with parentheses, although commas define the tuple. A one-item tuple requires a trailing comma. Tuples are useful for fixed groups of related values such as coordinates.`,
    "point = (3, 4)\nprint(point[0])\nprint(point[1])",
    "3\n4",
    "Can a tuple item be reassigned in place?",
    ["Yes, always", "No", "Only strings", "Only integers"],
    1,
    "Tuples are immutable.",
    {
      instructions:
        "Create a coordinate tuple. Access both values and explain why a tuple suits fixed data.",
      starterCode:
        "point = (3, 4)\n\n# Print both coordinate values",
      solutionCode:
        "point = (3, 4)\nprint(point[0])\nprint(point[1])",
      quizQuestions: [
        {
          question: "What is a key property of tuples?",
          options: [
            "They are immutable",
            "They must contain strings",
            "They cannot be indexed",
            "They always sort values",
          ],
          answer: 0,
        },
        {
          question: "How do you write a one-item tuple containing 5?",
          options: ["(5)", "(5,)", "[5]", "{5:}"],
          answer: 1,
        },
        {
          question: "What is point[1] for (3, 4)?",
          options: ["3", "4", "1", "An error"],
          answer: 1,
        },
        {
          question: "Which brackets are commonly used to display a tuple?",
          options: ["()", "[]", "{}", "<>"],
          answer: 0,
        },
        {
          question: "Which is a sensible use for a tuple?",
          options: [
            "A fixed coordinate pair",
            "A collection that must constantly be edited",
            "A mutable shopping cart only",
            "A function definition",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    35,
    "Sets",
    "Data Kingdom",
    "Store unique values and compare collections.",
    `A set stores distinct elements, removing duplicates. Sets do not support positional indexing. Union combines elements, intersection finds shared elements, and difference finds elements in one set but not another. Use set() to create an empty set; {} creates an empty dictionary.`,
    "values = {1, 2, 2, 3}\nprint(len(values))\nprint(2 in values)",
    "3\nTrue",
    "What is a key property of sets?",
    [
      "They preserve duplicates",
      "They store unique elements",
      "They are always sorted",
      "They use indexes",
    ],
    1,
    "Repeated values are represented once.",
    {
      instructions:
        "Create two sets of course participants. Find the participants appearing in both sets and those appearing in either set.",
      starterCode:
        'python_group = {"Asha", "EVO", "Meena"}\nweb_group = {"EVO", "Arun"}\n\n# Print the intersection and union',
      solutionCode:
        'python_group = {"Asha", "EVO", "Meena"}\nweb_group = {"EVO", "Arun"}\nprint(python_group & web_group)\nprint(python_group | web_group)',
      quizQuestions: [
        {
          question: "What happens to duplicate values in a set?",
          options: [
            "They are represented once",
            "They are always duplicated",
            "They cause every set to fail",
            "They become dictionary keys",
          ],
          answer: 0,
        },
        {
          question: "Which operator calculates set intersection?",
          options: ["&", "|", "+", "/"],
          answer: 0,
        },
        {
          question: "Which operator calculates set union?",
          options: ["&", "|", "%", "//"],
          answer: 1,
        },
        {
          question: "How do you create an empty set?",
          options: ["{}", "set()", "[]", "()"],
          answer: 1,
        },
        {
          question: "Do sets support ordinary positional indexing?",
          options: ["Yes", "No", "Only for strings", "Only when sorted"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    36,
    "Dictionaries",
    "Data Kingdom",
    "Store and retrieve values using keys.",
    `A dictionary maps keys to values. Curly braces contain key-value pairs separated by colons. Access a value using its key, or use get() when a missing key should return a fallback instead of raising KeyError. Dictionary keys must be hashable, and each key is unique.`,
    'person = {"name": "EVO", "age": 19}\nprint(person["name"])\nprint(person.get("city", "Unknown"))',
    "EVO\nUnknown",
    "What does a dictionary store?",
    [
      "Only individual characters",
      "Key-value pairs",
      "Only unique numbers",
      "Only ordered indexes",
    ],
    1,
    "Each value is associated with a key.",
    {
      instructions:
        "Create a student dictionary containing a name, course, and score. Retrieve values and safely check for a missing key.",
      starterCode:
        'student = {"name": "EVO", "course": "Python", "score": 85}\n\n# Print name and score\n# Use get() to check for "city"',
      solutionCode:
        'student = {"name": "EVO", "course": "Python", "score": 85}\nprint(student["name"])\nprint(student["score"])\nprint(student.get("city", "Unknown"))',
      quizQuestions: [
        {
          question: "What does a dictionary map?",
          options: ["Keys to values", "Characters to loops", "Only indexes to strings", "Files to folders only"],
          answer: 0,
        },
        {
          question: 'What does person["name"] return in the example?',
          options: ["EVO", "19", "Unknown", "name"],
          answer: 0,
        },
        {
          question: "What does get('city', 'Unknown') return when city is missing?",
          options: ["None always", "Unknown", "city", "An integer"],
          answer: 1,
        },
        {
          question: "Which brackets are commonly used to define a dictionary?",
          options: ["()", "[]", "{}", "<>"],
          answer: 2,
        },
        {
          question: "What happens if you access a missing key using person['city']?",
          options: [
            "A KeyError can be raised",
            "Python automatically creates the key",
            "It always returns zero",
            "It returns the key name",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    37,
    "String Methods",
    "Data Kingdom",
    "Transform and inspect text using built-in string methods.",
    `String methods provide common text operations. lower() and upper() change letter case, strip() removes surrounding whitespace, and replace() substitutes text. Methods return new strings because strings are immutable. Method calls can be chained when each operation returns a string.`,
    'text = "  Python  "\nprint(text.strip().upper())\nprint(text.lower())\nprint(text.replace("Python", "EVOLV"))',
    "PYTHON\n  python  \n  EVOLV  ",
    "Which method removes surrounding whitespace?",
    ["upper()", "strip()", "append()", "sort()"],
    1,
    "It trims the beginning and end.",
    {
      instructions:
        "Clean a user-entered name by removing surrounding spaces and standardising its case.",
      starterCode:
        'name = "  meena  "\n\n# Remove surrounding spaces\n# Convert the result to title case',
      solutionCode:
        'name = "  meena  "\nclean_name = name.strip().title()\nprint(clean_name)',
      quizQuestions: [
        {
          question: 'What does " Python ".strip() return?',
          options: ['"Python"', '" Python "', '"PYTHON"', '"python"'],
          answer: 0,
        },
        {
          question: 'What does "Py".upper() return?',
          options: ["Py", "PY", "py", "An error"],
          answer: 1,
        },
        {
          question: 'What does "ABC".lower() return?',
          options: ["ABC", "Abc", "abc", "aBc"],
          answer: 2,
        },
        {
          question: "Which method substitutes part of a string?",
          options: ["replace()", "append()", "remove()", "sort()"],
          answer: 0,
        },
        {
          question: "Do string methods usually modify the original string in place?",
          options: [
            "No, strings are immutable",
            "Yes, always",
            "Only with upper()",
            "Only with lower()",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    38,
    "Slicing",
    "Data Kingdom",
    "Extract a portion of a string or sequence.",
    `Slicing uses sequence[start:stop:step]. The start index is included, but the stop index is excluded. Omitting start or stop uses the relevant default. Negative indexes count from the end, and a step controls which elements are selected.`,
    'letters = "PYTHON"\nprint(letters[1:4])\nprint(letters[:2])\nprint(letters[-2:])',
    "YTH\nPY\nON",
    "Is the stop index included in a slice?",
    ["Yes", "No", "Only for lists", "Only for strings"],
    1,
    "The stop position marks where extraction ends.",
    {
      instructions:
        "Extract the first three characters, last two characters, and every second character from a string.",
      starterCode:
        'word = "PYTHON"\n\n# Print word[:3]\n# Print the last two characters\n# Print every second character',
      solutionCode:
        'word = "PYTHON"\nprint(word[:3])\nprint(word[-2:])\nprint(word[::2])',
      quizQuestions: [
        {
          question: 'What does "PYTHON"[1:4] return?',
          options: ["PYT", "YTH", "THO", "YTHO"],
          answer: 1,
        },
        {
          question: 'What does "PYTHON"[:2] return?',
          options: ["PY", "YT", "PYT", "ON"],
          answer: 0,
        },
        {
          question: 'What does "PYTHON"[-2:] return?',
          options: ["PY", "TH", "ON", "HO"],
          answer: 2,
        },
        {
          question: "Is the stop index included?",
          options: ["Yes", "No", "Only in tuples", "Only with negative indexes"],
          answer: 1,
        },
        {
          question: 'What does "PYTHON"[::2] return?',
          options: ["PTO", "YHN", "PYTHON", "PYN"],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    39,
    "Comprehensions",
    "Data Kingdom",
    "Create a list from an iterable in a compact expression.",
    `A list comprehension creates a list using an expression and a for clause, with an optional condition. It can replace a simple loop that builds a list. Keep comprehensions readable; use a regular loop when the logic becomes complex.`,
    "squares = [number * number for number in range(4)]\nprint(squares)\nevens = [number for number in range(10) if number % 2 == 0]\nprint(evens)",
    "[0, 1, 4, 9]\n[0, 2, 4, 6, 8]",
    "What does a list comprehension create?",
    ["A new list", "A database", "A class only", "A file"],
    0,
    "The result is enclosed in square brackets.",
    {
      instructions:
        "Create a list of squares from 1 to 10 and another list containing only even numbers.",
      starterCode:
        "# Create squares of numbers from 1 through 10\n# Create even numbers from 1 through 10",
      solutionCode:
        "squares = [number ** 2 for number in range(1, 11)]\nevens = [number for number in range(1, 11) if number % 2 == 0]\nprint(squares)\nprint(evens)",
      quizQuestions: [
        {
          question: "What does a list comprehension create?",
          options: ["A new list", "A file", "A class only", "A database connection"],
          answer: 0,
        },
        {
          question: "What is [n * n for n in range(3)]?",
          options: ["[0, 1, 4]", "[1, 4, 9]", "[0, 1, 2]", "[0, 1, 4, 9]"],
          answer: 0,
        },
        {
          question: "Which part filters items in a comprehension?",
          options: ["An optional if clause", "The list name", "The brackets alone", "A print statement"],
          answer: 0,
        },
        {
          question: "What does [n for n in range(6) if n % 2 == 0] produce?",
          options: ["[0, 2, 4]", "[1, 3, 5]", "[0, 1, 2, 3, 4, 5]", "[2, 4, 6]"],
          answer: 0,
        },
        {
          question: "When might a regular loop be clearer?",
          options: [
            "When the logic requires several complicated steps",
            "Never",
            "Only for integers",
            "Only when the list is empty",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    40,
    "Data Kingdom Checkpoint",
    "Data Kingdom",
    "Choose the right collection and practise working with its values.",
    `Lists are ordered and mutable; tuples are ordered and immutable; sets store unique elements; dictionaries map keys to values. Strings represent text and support indexing and slicing. Choose a data structure based on what needs to be stored and how it will be accessed or updated.`,
    'student = {"name": "EVO", "score": 5}\nstudent["score"] += 3\nprint(student["name"])\nprint(student["score"])',
    "EVO\n8",
    "Which collection stores key-value pairs?",
    ["List", "Tuple", "Set", "Dictionary"],
    3,
    "Use this collection when values are retrieved by keys.",
    {
      type: "quiz",
      instructions:
        "Create one example of each collection type and explain which operations each supports.",
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

  // ==========================================================
  // WORLD 5 — FUNCTION MOUNTAINS
  // ==========================================================

  lesson(
    41,
    "Creating Functions",
    "Function Mountains",
    "Group reusable instructions into named functions.",
    `A function groups instructions so they can be called when needed. Define one using def, followed by its name, parentheses, and a colon. The function body is indented. Defining a function does not execute its body; calling it does. Small functions make programs easier to test and maintain.`,
    'def greet():\n    print("Hello!")\n\ngreet()\ngreet()',
    "Hello!\nHello!",
    "Which keyword defines a function?",
    ["func", "def", "function", "make"],
    1,
    "It is a three-letter keyword.",
    {
      instructions:
        "Create a function that prints a three-line study plan. Call it twice.",
      starterCode:
        "def study_plan():\n    # Print three study tasks\n    pass\n\n# Call the function twice",
      solutionCode:
        'def study_plan():\n    print("Review notes")\n    print("Practise Python")\n    print("Test your code")\n\nstudy_plan()\nstudy_plan()',
      quizQuestions: [
        {
          question: "Which keyword defines a function?",
          options: ["def", "func", "make", "class"],
          answer: 0,
        },
        {
          question: "Does defining a function automatically run its body?",
          options: ["Yes", "No", "Only with print()", "Only in a loop"],
          answer: 1,
        },
        {
          question: "How do you call greet()?",
          options: ["greet()", "call greet", "def greet", "function greet"],
          answer: 0,
        },
        {
          question: "Where does a function body appear?",
          options: [
            "In its indented block",
            "Only in a comment",
            "Only after the program ends",
            "Inside quotation marks",
          ],
          answer: 0,
        },
        {
          question: "Why create a reusable function?",
          options: [
            "To organise instructions and avoid repetition",
            "To remove all variables",
            "To disable loops",
            "To convert every value to text",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    42,
    "Function Parameters",
    "Function Mountains",
    "Pass information into functions using parameters and arguments.",
    `Parameters are names in a function definition. Arguments are the values passed when a function is called. A function can accept several parameters and produce different results for different arguments. Meaningful parameter names make the function's requirements clearer.`,
    'def greet(name, course):\n    print(f"Hello {name}, welcome to {course}!")\n\ngreet("EVO", "Python")\ngreet("Arun", "Data Science")',
    "Hello EVO, welcome to Python!\nHello Arun, welcome to Data Science!",
    "What is a parameter?",
    ["A named input in a function definition", "A loop", "A module", "A file"],
    0,
    "It provides a named input to a function.",
    {
      instructions:
        "Create a function accepting a product name and price. Call it with two products.",
      starterCode:
        "def show_product(name, price):\n    # Print the name and price\n    pass\n\n# Call the function twice",
      solutionCode:
        'def show_product(name, price):\n    print(f"{name}: Rs. {price}")\n\nshow_product("Notebook", 45)\nshow_product("Pen", 10)',
      quizQuestions: [
        {
          question: "What is a parameter?",
          options: [
            "A named input in a function definition",
            "A loop variable only",
            "A file path",
            "A return value only",
          ],
          answer: 0,
        },
        {
          question: "What is an argument?",
          options: [
            "A value supplied when calling a function",
            "The def keyword",
            "A module name only",
            "An indentation level",
          ],
          answer: 0,
        },
        {
          question: "How many parameters does greet(name, course) define?",
          options: ["0", "1", "2", "3"],
          answer: 2,
        },
        {
          question: 'What does greet("EVO", "Python") pass?',
          options: [
            "Two arguments",
            "No arguments",
            "A class",
            "A file",
          ],
          answer: 0,
        },
        {
          question: "Why use meaningful parameter names?",
          options: [
            "To make the function easier to understand",
            "To avoid all function calls",
            "To change Python syntax",
            "To prevent values from being passed",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    43,
    "Returning Values",
    "Function Mountains",
    "Return a result that other parts of your program can use.",
    `return sends a result back to the caller and ends the current function call. print() displays a value but does not return that displayed value for later calculation. Returned values can be stored, combined, or passed to another function. Without an explicit return, a function returns None.`,
    "def add(a, b):\n    return a + b\n\nresult = add(2, 3)\nprint(result * 2)",
    "10",
    "Which keyword sends a value back from a function?",
    ["print", "yield only", "return", "send"],
    2,
    "It gives the caller a result.",
    {
      instructions:
        "Write a function returning a rectangle's area. Store the result and use it in another calculation.",
      starterCode:
        "def rectangle_area(width, height):\n    # Return the area\n    pass\n\narea = rectangle_area(4, 3)\nprint(area)",
      solutionCode:
        "def rectangle_area(width, height):\n    return width * height\n\narea = rectangle_area(4, 3)\nprint(area)\nprint(area * 2)",
      quizQuestions: [
        {
          question: "What does return do?",
          options: [
            "Sends a result to the caller",
            "Only displays a value",
            "Starts a loop",
            "Imports a module",
          ],
          answer: 0,
        },
        {
          question: "What is add(2, 3) when add returns a + b?",
          options: ["23", "5", "2", "None"],
          answer: 1,
        },
        {
          question: "What does a function without an explicit return normally return?",
          options: ["0", "False", "None", "An empty list"],
          answer: 2,
        },
        {
          question: "Which statement correctly stores a return value?",
          options: [
            "area = rectangle_area(4, 3)",
            "return = area",
            "def area = rectangle_area",
            "print area as return",
          ],
          answer: 0,
        },
        {
          question: "How does print() differ from return?",
          options: [
            "print displays; return provides a result to the caller",
            "They are always identical",
            "return only works with strings",
            "print ends every function",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    44,
    "Default Arguments",
    "Function Mountains",
    "Give parameters fallback values when callers omit arguments.",
    `A default argument supplies a value when a caller omits that argument. A supplied argument overrides the default. Defaults are useful for optional settings such as greetings. Avoid mutable list or dictionary defaults unless you deliberately manage their shared state.`,
    'def greet(name, greeting="Hello"):\n    print(f"{greeting}, {name}!")\n\ngreet("EVO")\ngreet("Arun", "Welcome")',
    "Hello, EVO!\nWelcome, Arun!",
    "When is a default argument used?",
    [
      "Whenever a loop runs",
      "When the argument is omitted",
      "Only after an error",
      "Never",
    ],
    1,
    "It supplies a fallback value.",
    {
      instructions:
        "Create a function with a default greeting. Call it once with the default and once with a custom greeting.",
      starterCode:
        'def greet(name, greeting="Hello"):\n    print(f"{greeting}, {name}!")\n\n# Call once with the default\n# Call once with a custom greeting',
      solutionCode:
        'def greet(name, greeting="Hello"):\n    print(f"{greeting}, {name}!")\n\ngreet("EVO")\ngreet("Arun", "Welcome")',
      quizQuestions: [
        {
          question: "When is a default argument used?",
          options: [
            "When the caller omits that argument",
            "Only when a loop ends",
            "Only when an error occurs",
            "Never",
          ],
          answer: 0,
        },
        {
          question: 'What does greet("EVO") print?',
          options: ["Hello, EVO!", "Welcome, EVO!", "EVO, Hello!", "Nothing"],
          answer: 0,
        },
        {
          question: 'What does greet("Arun", "Welcome") print?',
          options: [
            "Hello, Arun!",
            "Welcome, Arun!",
            "Arun, Welcome!",
            "Nothing",
          ],
          answer: 1,
        },
        {
          question: "Can a caller override a default argument?",
          options: ["Yes", "No", "Only with integers", "Only inside a loop"],
          answer: 0,
        },
        {
          question: "Why should mutable defaults be used carefully?",
          options: [
            "The same mutable default can be shared across calls",
            "They cannot contain values",
            "They always cause syntax errors",
            "They cannot be passed as arguments",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    45,
    "Keyword Arguments",
    "Function Mountains",
    "Pass function arguments by parameter name.",
    `Keyword arguments specify parameter names in a function call. They improve readability and allow arguments to be supplied in a different order from the function definition. The names must match the parameters. Positional arguments generally come before keyword arguments in a call.`,
    'def describe(name, age, course):\n    print(f"{name} is {age} and studies {course}.")\n\ndescribe(course="Python", name="EVO", age=1)',
    "EVO is 1 and studies Python.",
    "How does a keyword argument identify its parameter?",
    ["By parameter name", "By list index", "By file path", "By data type only"],
    0,
    "The call includes a name followed by =.",
    {
      instructions:
        "Call a function with three parameters using keyword arguments in a different order.",
      starterCode:
        "def describe(name, age, course):\n    print(name, age, course)\n\n# Call using keyword arguments in a different order",
      solutionCode:
        'def describe(name, age, course):\n    print(name, age, course)\n\ndescribe(course="Python", name="EVO", age=1)',
      quizQuestions: [
        {
          question: "What identifies a keyword argument?",
          options: [
            "Its parameter name",
            "Its position only",
            "Its file extension",
            "Its indentation level",
          ],
          answer: 0,
        },
        {
          question: "Can keyword arguments improve readability?",
          options: ["Yes", "No", "Only for strings", "Only inside loops"],
          answer: 0,
        },
        {
          question: "Which call uses keyword arguments?",
          options: [
            'describe(course="Python", name="EVO", age=1)',
            'describe("EVO", 1, "Python")',
            "describe()",
            "def describe",
          ],
          answer: 0,
        },
        {
          question: "Which argument order is generally required when mixing positional and keyword arguments?",
          options: [
            "Positional before keyword",
            "Keyword before positional in all cases",
            "Only keyword arguments",
            "Only positional arguments",
          ],
          answer: 0,
        },
        {
          question: "What must a keyword argument name match?",
          options: [
            "A parameter name",
            "A list index",
            "A module extension",
            "A class instance value only",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    46,
    "Variable Scope",
    "Function Mountains",
    "Understand where variables can be accessed.",
    `Scope describes where a name is accessible. A variable assigned inside a function is normally local to that function call. It does not automatically replace a same-named variable outside the function. Prefer parameters and return values over unnecessary global state.`,
    'message = "Outside"\ndef show():\n    message = "Inside"\n    print(message)\n\nshow()\nprint(message)',
    "Inside\nOutside",
    "Where is a local variable normally accessible?",
    ["Everywhere", "Inside its defining scope", "Only in another file", "Only in a list"],
    1,
    "Its visibility is limited to its scope.",
    {
      instructions:
        "Create a local variable sharing a name with a global variable. Explain why the outside value remains unchanged.",
      starterCode:
        'message = "Outside"\ndef show():\n    message = "Inside"\n    print(message)\n\nshow()\nprint(message)',
      solutionCode:
        'message = "Outside"\ndef show():\n    message = "Inside"\n    print(message)\n\nshow()\nprint(message)',
      quizQuestions: [
        {
          question: "Where is a local variable normally accessible?",
          options: [
            "Inside its local scope",
            "Everywhere in every file",
            "Only in the terminal",
            "Only inside a list",
          ],
          answer: 0,
        },
        {
          question: "What does the example print first?",
          options: ["Outside", "Inside", "None", "An error"],
          answer: 1,
        },
        {
          question: "What does the example print second?",
          options: ["Outside", "Inside", "None", "An error"],
          answer: 0,
        },
        {
          question: "What is a useful alternative to unnecessary global variables?",
          options: [
            "Pass parameters and return results",
            "Delete all functions",
            "Use random names",
            "Remove indentation",
          ],
          answer: 0,
        },
        {
          question: "Does assigning a local variable automatically change a global variable with the same name?",
          options: ["Yes", "No", "Only for strings", "Only in loops"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    47,
    "Lambda Functions",
    "Function Mountains",
    "Create small anonymous functions using lambda.",
    `A lambda expression creates a small anonymous function containing one expression. It is useful for simple transformations and short key functions. A lambda cannot contain ordinary multi-line statements. Use def when a function needs several steps, a descriptive name, or complex logic.`,
    'double = lambda number: number * 2\nprint(double(4))\n\nwords = ["pear", "watermelon", "fig"]\nprint(sorted(words, key=lambda word: len(word)))',
    "8\n['fig', 'pear', 'watermelon']",
    "Which keyword introduces a lambda expression?",
    ["def", "lambda", "return", "anonymous"],
    1,
    "It names this kind of expression.",
    {
      instructions:
        "Use a lambda to sort words by length. Then write an equivalent named function.",
      starterCode:
        'words = ["pear", "watermelon", "fig"]\n\n# Sort by word length using lambda',
      solutionCode:
        'words = ["pear", "watermelon", "fig"]\nprint(sorted(words, key=lambda word: len(word)))\n\ndef word_length(word):\n    return len(word)\n\nprint(sorted(words, key=word_length))',
      quizQuestions: [
        {
          question: "What does a lambda create?",
          options: [
            "An anonymous function",
            "A class only",
            "A file",
            "A loop",
          ],
          answer: 0,
        },
        {
          question: "How many expressions can a lambda contain?",
          options: [
            "One expression",
            "Unlimited ordinary statements",
            "No expression",
            "Only a print statement",
          ],
          answer: 0,
        },
        {
          question: "What does double(4) return in the example?",
          options: ["4", "8", "16", "None"],
          answer: 1,
        },
        {
          question: "What does sorted(..., key=...) use the key for?",
          options: [
            "Determining the value used for sorting",
            "Opening a file",
            "Ending a loop",
            "Creating a database",
          ],
          answer: 0,
        },
        {
          question: "When is def usually clearer than lambda?",
          options: [
            "For complex or multi-step functions",
            "Never",
            "Only for integers",
            "Only inside a list",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    48,
    "Recursion",
    "Function Mountains",
    "Understand functions that call themselves.",
    `Recursion occurs when a function calls itself to solve a smaller version of a problem. Every recursive solution needs a base case that stops further calls and a recursive step that moves toward the base case. Without a suitable stopping condition, recursion can continue until Python raises RecursionError.`,
    'def countdown(n):\n    if n == 0:\n        print("Go!")\n    else:\n        print(n)\n        countdown(n - 1)\n\ncountdown(3)',
    "3\n2\n1\nGo!",
    "What prevents recursion from continuing indefinitely?",
    ["A base case", "A print statement", "A string", "An import"],
    0,
    "It defines when recursion should stop.",
    {
      instructions:
        "Trace countdown(3), identify the base case, and modify the call to count down from five.",
      starterCode:
        'def countdown(n):\n    if n == 0:\n        print("Go!")\n    else:\n        print(n)\n        countdown(n - 1)\n\ncountdown(3)',
      solutionCode:
        'def countdown(n):\n    if n == 0:\n        print("Go!")\n    else:\n        print(n)\n        countdown(n - 1)\n\ncountdown(5)',
      quizQuestions: [
        {
          question: "What is recursion?",
          options: [
            "A function calling itself",
            "A list sorting itself automatically",
            "A file being opened",
            "A variable assignment",
          ],
          answer: 0,
        },
        {
          question: "What is a base case?",
          options: [
            "A condition that stops recursive calls",
            "A variable used only in a loop",
            "A module import",
            "A print statement only",
          ],
          answer: 0,
        },
        {
          question: "What does countdown(3) print first?",
          options: ["3", "2", "1", "Go!"],
          answer: 0,
        },
        {
          question: "What can happen when recursion never reaches its base case?",
          options: [
            "RecursionError may occur",
            "The program automatically sorts the values",
            "Python always returns zero",
            "The function becomes a list",
          ],
          answer: 0,
        },
        {
          question: "What makes a recursive step useful?",
          options: [
            "It moves the problem toward the base case",
            "It repeats the exact same state forever",
            "It removes all parameters",
            "It disables return values",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    49,
    "Modules and Imports",
    "Function Mountains",
    "Reuse functions and constants from Python modules.",
    `A module is an importable unit of Python code, commonly a Python file. import makes its names available. The standard-library math module provides functions such as sqrt() and ceil(), as well as constants such as pi. With import math, access these names using math.name.`,
    "import math\nprint(math.sqrt(16))\nprint(math.ceil(3.2))\nprint(round(math.pi, 2))",
    "4.0\n4\n3.14",
    "Which keyword imports a module?",
    ["include", "using", "import", "require"],
    2,
    "It is followed by the module name.",
    {
      instructions:
        "Use the math module to calculate a square root, round a number upward, and display pi.",
      starterCode:
        "import math\n\n# Print sqrt(25)\n# Print ceil(4.2)\n# Print pi rounded to two decimals",
      solutionCode:
        "import math\nprint(math.sqrt(25))\nprint(math.ceil(4.2))\nprint(round(math.pi, 2))",
      quizQuestions: [
        {
          question: "Which keyword imports a module?",
          options: ["include", "using", "import", "require"],
          answer: 2,
        },
        {
          question: "What does math.sqrt(16) return?",
          options: ["4.0", "8", "16", "2"],
          answer: 0,
        },
        {
          question: "What does math.ceil(3.2) return?",
          options: ["3", "4", "3.2", "0"],
          answer: 1,
        },
        {
          question: "How do you access pi after import math?",
          options: ["math.pi", "pi.math", "import.pi", "math::pi"],
          answer: 0,
        },
        {
          question: "What is a module useful for?",
          options: [
            "Reusing related code",
            "Removing all functions",
            "Replacing every variable",
            "Making indentation unnecessary",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    50,
    "Function Mountains Checkpoint",
    "Function Mountains",
    "Combine functions, parameters, return values, and imports.",
    `Functions make programs reusable and easier to test. Identify a function's inputs, operations, and return value. Test more than one call, including boundary values such as zero. Printing a value and returning a value serve different purposes.`,
    "def square(number):\n    return number * number\n\nfor value in [2, 4, 6]:\n    print(square(value))",
    "4\n16\n36",
    "What does a function return if it has no return statement?",
    ["0", "False", "None", "An empty string"],
    2,
    "Python uses a special value to represent no result.",
    {
      type: "quiz",
      instructions:
        "Write a function that converts minutes to seconds. Test several values, including zero.",
      quizQuestions: [
        {
          question: "Which keyword defines a function?",
          options: ["def", "func", "make", "class"],
          answer: 0,
        },
        {
          question: "What is an argument?",
          options: [
            "A value passed to a function",
            "A loop",
            "A module",
            "A file",
          ],
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

  // ==========================================================
  // WORLD 6 — OBJECT-ORIENTED GROVE
  // ==========================================================

  lesson(
    51,
    "Classes and Objects",
    "Object-Oriented Grove",
    "Model related data and behaviour using classes and objects.",
    `A class defines a type of object, including attributes for data and methods for behaviour. An object is an instance created from a class. A class can describe a student record, while each Student object represents a particular student.`,
    "class Dog:\n    pass\n\npet = Dog()\nprint(type(pet).__name__)",
    "Dog",
    "What is an object?",
    ["An instance of a class", "A loop", "A module only", "A comment"],
    0,
    "It is created from a class.",
    {
      instructions:
        "Create a Book class and make two instances. Print the type of each object.",
      starterCode:
        "class Book:\n    pass\n\nfirst = Book()\nsecond = Book()\n\n# Print each object's type name",
      solutionCode:
        "class Book:\n    pass\n\nfirst = Book()\nsecond = Book()\nprint(type(first).__name__)\nprint(type(second).__name__)",
      quizQuestions: [
        {
          question: "What does a class define?",
          options: [
            "A type of object",
            "A loop count only",
            "A file path only",
            "A Boolean value",
          ],
          answer: 0,
        },
        {
          question: "What is an object?",
          options: [
            "An instance of a class",
            "An import statement",
            "A string method",
            "A comment",
          ],
          answer: 0,
        },
        {
          question: "Which keyword defines a class?",
          options: ["object", "class", "defclass", "new"],
          answer: 1,
        },
        {
          question: "What does Dog() do in the example?",
          options: [
            "Creates a Dog instance",
            "Imports Dog",
            "Prints the class automatically",
            "Deletes Dog",
          ],
          answer: 0,
        },
        {
          question: "What are attributes commonly used to represent?",
          options: [
            "An object's data",
            "Only indentation",
            "A file extension",
            "A loop exit",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    52,
    "The __init__ Method",
    "Object-Oriented Grove",
    "Initialize each object with its own attributes.",
    `The __init__ method initializes a new instance. Its first parameter is conventionally self and refers to that instance. Assigning self.name = name stores a value on that object. Different instances can therefore hold different attributes.`,
    'class Student:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\nfirst = Student("EVO", 90)\nsecond = Student("Arun", 82)\nprint(first.name, first.score)\nprint(second.name, second.score)',
    "EVO 90\nArun 82",
    "What does self refer to in an instance method?",
    ["The current instance", "The parent folder", "A module", "A loop"],
    0,
    "It refers to the object being used.",
    {
      instructions:
        "Add a course attribute to Student and create two students with different names, scores, and courses.",
      starterCode:
        "class Student:\n    def __init__(self, name, score, course):\n        self.name = name\n        self.score = score\n        self.course = course\n\n# Create two students and print their attributes",
      solutionCode:
        'class Student:\n    def __init__(self, name, score, course):\n        self.name = name\n        self.score = score\n        self.course = course\n\nfirst = Student("EVO", 90, "Python")\nsecond = Student("Arun", 82, "Java")\nprint(first.name, first.score, first.course)\nprint(second.name, second.score, second.course)',
      quizQuestions: [
        {
          question: "What is __init__ commonly used for?",
          options: [
            "Initialising instance attributes",
            "Ending every loop",
            "Importing modules",
            "Sorting a list",
          ],
          answer: 0,
        },
        {
          question: "What does self refer to?",
          options: [
            "The current instance",
            "The parent folder",
            "A module",
            "A string",
          ],
          answer: 0,
        },
        {
          question: "What does self.name = name do?",
          options: [
            "Stores name on the instance",
            "Creates a global variable only",
            "Imports name",
            "Ends the class",
          ],
          answer: 0,
        },
        {
          question: "Can two Student instances have different scores?",
          options: ["Yes", "No", "Only if their names match", "Only in a list"],
          answer: 0,
        },
        {
          question: "How is an instance commonly created?",
          options: [
            "Student(...)",
            "new Student only",
            "create Student",
            "def Student",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    53,
    "Instance Methods",
    "Object-Oriented Grove",
    "Define actions that can read or update an object's state.",
    `An instance method is defined inside a class and works with an instance. Python passes the current instance as the first argument, conventionally named self, when the method is called through that object. Methods can read attributes, update state, and return useful information.`,
    "class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increment(self):\n        self.value += 1\n\n    def show(self):\n        return self.value\n\ncounter = Counter()\ncounter.increment()\ncounter.increment()\nprint(counter.show())",
    "2",
    "Where are instance methods defined?",
    ["Inside a class", "Only inside loops", "Inside JSON", "Only in the terminal"],
    0,
    "They belong to the class definition.",
    {
      instructions:
        "Add a reset method to Counter. Increment twice, reset the counter, and print its value after each step.",
      starterCode:
        "class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increment(self):\n        self.value += 1\n\n    # Add reset() here\n\ncounter = Counter()",
      solutionCode:
        "class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increment(self):\n        self.value += 1\n\n    def reset(self):\n        self.value = 0\n\ncounter = Counter()\ncounter.increment()\ncounter.increment()\nprint(counter.value)\ncounter.reset()\nprint(counter.value)",
      quizQuestions: [
        {
          question: "Where is an instance method defined?",
          options: ["Inside a class", "Only in a list", "Only in a loop", "Inside a JSON file"],
          answer: 0,
        },
        {
          question: "What does self.value += 1 do?",
          options: [
            "Increases the instance value by one",
            "Deletes the instance",
            "Creates a module",
            "Changes the class name",
          ],
          answer: 0,
        },
        {
          question: "What does the example print?",
          options: ["0", "1", "2", "3"],
          answer: 2,
        },
        {
          question: "How is an instance method normally called?",
          options: [
            "counter.increment()",
            "increment.counter",
            "class.increment",
            "self only",
          ],
          answer: 0,
        },
        {
          question: "What could a reset method do?",
          options: [
            "Set the counter value back to zero",
            "Import a module",
            "Create a new Python file",
            "End every program",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    54,
    "Inheritance",
    "Object-Oriented Grove",
    "Reuse and extend the behaviour of an existing class.",
    `Inheritance allows a child class to derive behaviour and attributes from a parent class. The parent is named in parentheses after the child class name. A child can use inherited methods, add methods, or override an inherited method. Use inheritance when the relationship represents a specialised kind of the parent.`,
    'class Animal:\n    def speak(self):\n        print("Some sound")\n\nclass Dog(Animal):\n    def speak(self):\n        print("Woof!")\n\nDog().speak()',
    "Woof!",
    "What is inheritance used for?",
    [
      "Reuse and extend class behaviour",
      "Repeat a loop",
      "Convert a string",
      "Open a file",
    ],
    0,
    "A child class can reuse a parent's behaviour.",
    {
      instructions:
        "Create a Cat subclass of Animal that overrides speak(). Compare Dog and Cat outputs.",
      starterCode:
        'class Animal:\n    def speak(self):\n        print("Some sound")\n\nclass Dog(Animal):\n    def speak(self):\n        print("Woof!")\n\n# Define Cat(Animal) and override speak()',
      solutionCode:
        'class Animal:\n    def speak(self):\n        print("Some sound")\n\nclass Dog(Animal):\n    def speak(self):\n        print("Woof!")\n\nclass Cat(Animal):\n    def speak(self):\n        print("Meow!")\n\nDog().speak()\nCat().speak()',
      quizQuestions: [
        {
          question: "What does inheritance support?",
          options: [
            "Reusing and extending class behaviour",
            "Only arithmetic",
            "Removing all methods",
            "Converting strings",
          ],
          answer: 0,
        },
        {
          question: "What is a child class?",
          options: [
            "A class derived from another class",
            "A list of objects",
            "A string variable",
            "A file handle",
          ],
          answer: 0,
        },
        {
          question: "What does overriding a method mean?",
          options: [
            "Providing a child-class implementation of an inherited method",
            "Deleting every class",
            "Changing a variable into a list",
            "Importing a module",
          ],
          answer: 0,
        },
        {
          question: "What does Dog(Animal) indicate?",
          options: [
            "Dog inherits from Animal",
            "Animal inherits from Dog",
            "Dog is a list",
            "Animal is a string",
          ],
          answer: 0,
        },
        {
          question: "What does the example print?",
          options: ["Some sound", "Woof!", "Meow!", "Nothing"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    55,
    "Object-Oriented Grove Checkpoint",
    "Object-Oriented Grove",
    "Combine classes, instances, attributes, methods, and inheritance.",
    `Classes organise related state and behaviour. Attributes describe object state, and methods define actions. __init__ initialises an instance, while self refers to that instance. Inheritance lets a child class reuse or override parent behaviour. Test multiple instances to confirm their data remains independent.`,
    'class Greeter:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        return f"Hello, {self.name}!"\n\nprint(Greeter("EVO").greet())',
    "Hello, EVO!",
    "Which keyword defines a class?",
    ["object", "class", "defclass", "new"],
    1,
    "It introduces a class definition.",
    {
      type: "quiz",
      instructions:
        "Design a Student class with a name attribute and a method returning a welcome message. Test two instances.",
      quizQuestions: [
        {
          question: "What is an object?",
          options: [
            "An instance of a class",
            "A keyword",
            "A loop",
            "A comment",
          ],
          answer: 0,
        },
        {
          question: "What is self commonly used for?",
          options: [
            "Referring to the instance",
            "Importing modules",
            "Stopping loops",
            "Printing output",
          ],
          answer: 0,
        },
        {
          question: "Which method initialises instance attributes?",
          options: ["__init__", "__start__", "__main__", "__newname__"],
          answer: 0,
        },
        {
          question: "What does inheritance support?",
          options: [
            "Reusing and extending class behaviour",
            "Deleting all objects",
            "Only arithmetic",
            "Reading keyboard input",
          ],
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

  // ==========================================================
  // WORLD 7 — FILES AND TOOLS
  // ==========================================================

  lesson(
    56,
    "Reading Files",
    "Files and Tools",
    "Read text stored in a file.",
    `open(path, mode, encoding="utf-8") opens a file. Read mode "r" opens an existing file. The with statement ensures the file is closed when the block finishes. read() reads the full content, readline() reads one line, and iteration can process a file line by line. Relative paths depend on the program's working directory.`,
    'with open("notes.txt", "r", encoding="utf-8") as file:\n    content = file.read()\n    print(content)',
    "Displays the contents of notes.txt when the file exists.",
    "Which mode is commonly used to read a file?",
    ["'w'", "'r'", "'x'", "'a'"],
    1,
    "It stands for read.",
    {
      instructions:
        "Create notes.txt in a Python environment that supports files. Write two lines and read them back.",
      starterCode:
        'with open("notes.txt", "r", encoding="utf-8") as file:\n    print(file.read())',
      solutionCode:
        'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Learn Python.\\nPractise daily.\\n")\n\nwith open("notes.txt", "r", encoding="utf-8") as file:\n    print(file.read(), end="")',
      validation: "manual",
      quizQuestions: [
        {
          question: "Which mode opens an existing file for reading?",
          options: ["'w'", "'r'", "'a'", "'x'"],
          answer: 1,
        },
        {
          question: "What does read() normally return for a text file?",
          options: [
            "The file's text content",
            "A class definition",
            "A database table",
            "A random number",
          ],
          answer: 0,
        },
        {
          question: "Why use with open(...)?",
          options: [
            "It manages the file context and closes it when the block exits",
            "It deletes the file automatically",
            "It converts every line to a number",
            "It disables errors",
          ],
          answer: 0,
        },
        {
          question: "What can happen if notes.txt does not exist in read mode?",
          options: [
            "FileNotFoundError may be raised",
            "Python always creates it",
            "It returns an empty list automatically",
            "The file is renamed",
          ],
          answer: 0,
        },
        {
          question: "What does encoding='utf-8' specify?",
          options: [
            "The text encoding",
            "The loop count",
            "The file's row count",
            "The variable name",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    57,
    "Writing Files",
    "Files and Tools",
    "Write and append text to files.",
    `The write mode "w" creates a file or replaces existing contents, so use it carefully. Append mode "a" adds text to the end. The with statement closes the file correctly. write() does not automatically add a newline; include \\n when another line is needed.`,
    'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Hello EVOLV!\\n")\n    file.write("Keep learning.\\n")\n\nwith open("notes.txt", "r", encoding="utf-8") as file:\n    print(file.read(), end="")',
    "Hello EVOLV!\nKeep learning.",
    "Which file mode can replace existing contents?",
    ["'r'", "'w'", "'a'", "'read'"],
    1,
    "Be careful: this mode overwrites existing contents.",
    {
      instructions:
        "Write two lines to a file, read them back, and compare write mode with append mode.",
      starterCode:
        'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("First line\\n")\n\n# Append a second line\n# Read and display the file',
      solutionCode:
        'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("First line\\n")\n\nwith open("notes.txt", "a", encoding="utf-8") as file:\n    file.write("Second line\\n")\n\nwith open("notes.txt", "r", encoding="utf-8") as file:\n    print(file.read(), end="")',
      validation: "manual",
      quizQuestions: [
        {
          question: "Which mode overwrites existing file contents?",
          options: ["'r'", "'w'", "'a'", "'read'"],
          answer: 1,
        },
        {
          question: "Which mode appends to a file?",
          options: ["'r'", "'w'", "'a'", "'x'"],
          answer: 2,
        },
        {
          question: "Does write() automatically add a newline?",
          options: ["Yes, always", "No", "Only for numbers", "Only in append mode"],
          answer: 1,
        },
        {
          question: "Why use encoding='utf-8'?",
          options: [
            "To specify the text encoding",
            "To specify the number of lines",
            "To select a Python loop",
            "To rename the file",
          ],
          answer: 0,
        },
        {
          question: "Which mode should you choose when preserving existing text and adding more?",
          options: ["'w'", "'a'", "'r'", "'x'"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    58,
    "Handling Exceptions",
    "Files and Tools",
    "Handle expected runtime errors with try and except.",
    `An exception interrupts normal execution. Place code that may fail inside a try block and handle a matching exception type with except. Catch specific exceptions rather than hiding unrelated bugs with a bare except. An optional else block runs when no exception occurs, and finally can perform cleanup.`,
    'try:\n    number = int("abc")\nexcept ValueError:\n    print("Please enter a whole number")\nelse:\n    print(number * 2)',
    "Please enter a whole number",
    "Which block handles a matching exception?",
    ["try", "except", "class", "for"],
    1,
    "It follows the try block.",
    {
      instructions:
        "Convert user-provided text to an integer and display a helpful message when conversion fails.",
      starterCode:
        'text = "abc"\n\n# Add try/except around int(text)',
      solutionCode:
        'text = "abc"\ntry:\n    number = int(text)\nexcept ValueError:\n    print("Please enter a whole number")\nelse:\n    print(number * 2)',
      quizQuestions: [
        {
          question: "Which block contains code that may raise an exception?",
          options: ["try", "except", "class", "for"],
          answer: 0,
        },
        {
          question: "Which exception can int('abc') raise?",
          options: ["ValueError", "IndexError", "KeyError", "StopIteration"],
          answer: 0,
        },
        {
          question: "When does the else block run in try/except/else?",
          options: [
            "When the try block finishes without an exception",
            "Every time before try",
            "Only when an exception occurs",
            "Only inside a loop",
          ],
          answer: 0,
        },
        {
          question: "Why catch a specific exception?",
          options: [
            "To handle expected failures without hiding unrelated bugs",
            "To disable all errors permanently",
            "To skip all program statements",
            "To convert every exception into a number",
          ],
          answer: 0,
        },
        {
          question: "What does finally commonly support?",
          options: [
            "Cleanup that should run regardless of success or failure",
            "A new function parameter",
            "A list comprehension",
            "A loop counter only",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    59,
    "Useful Built-in Functions",
    "Files and Tools",
    "Use built-in functions to inspect, summarise, and process values.",
    `Python includes built-in functions for common tasks. len() counts items, sum() totals numbers, min() and max() find extreme values, sorted() returns a sorted list, and type() inspects a value. enumerate() provides an index and item while looping.`,
    "scores = [72, 90, 84]\nprint(len(scores))\nprint(sum(scores))\nprint(min(scores))\nprint(max(scores))\nprint(sorted(scores))",
    "3\n246\n72\n90\n[72, 84, 90]",
    "Which function returns the number of items in a sequence?",
    ["sum()", "len()", "max()", "type()"],
    1,
    "It reports the length.",
    {
      instructions:
        "Analyse a list of scores: print its size, total, average, minimum, maximum, and sorted values.",
      starterCode:
        "scores = [72, 90, 84]\n\n# Calculate count, total, average, minimum, maximum, and sorted scores",
      solutionCode:
        "scores = [72, 90, 84]\nprint(len(scores))\nprint(sum(scores))\nprint(sum(scores) / len(scores))\nprint(min(scores))\nprint(max(scores))\nprint(sorted(scores))",
      quizQuestions: [
        {
          question: "Which function counts the items in a sequence?",
          options: ["sum()", "len()", "max()", "type()"],
          answer: 1,
        },
        {
          question: "What is sum([2, 3, 4])?",
          options: ["9", "24", "3", "4"],
          answer: 0,
        },
        {
          question: "What does min([7, 2, 9]) return?",
          options: ["7", "2", "9", "18"],
          answer: 1,
        },
        {
          question: "What does sorted([3, 1, 2]) return?",
          options: ["[3, 1, 2]", "[1, 2, 3]", "[2, 1, 3]", "3"],
          answer: 1,
        },
        {
          question: "What does enumerate() provide when used in a loop?",
          options: [
            "An index and an item",
            "Only a total",
            "Only a Boolean",
            "A file handle",
          ],
          answer: 0,
        },
      ],
    }
  ),

  // ==========================================================
  // WORLD 8 — EVOLV CITADEL
  // ==========================================================

  lesson(
    60,
    "EVOLV Python Final Challenge",
    "EVOLV Citadel",
    "Combine Python fundamentals to solve a practical coding problem.",
    `This challenge combines functions, loops, conditions, and collections. Initialise a total, visit each number, check whether it is even, add matching values, and return the result. Test an empty list, a list containing only odd numbers, and a list containing several even numbers. A good solution should work for different inputs, not only the supplied example.`,
    "def total_even(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total\n\nprint(total_even([1, 2, 3, 4, 5, 6]))",
    "12",
    "What is the total of the even numbers in [1, 2, 3, 4, 5, 6]?",
    ["9", "10", "12", "21"],
    2,
    "Add 2, 4, and 6.",
    {
      type: "hands-on",
      difficulty: "Intermediate",
      duration: "15 min",
      instructions:
        "Complete total_even(numbers). Return the sum of even values only. Test [2, 4], [1, 3, 5], and [].",
      starterCode:
        "def total_even(numbers):\n    total = 0\n    # Loop through the numbers\n    # Add only even numbers\n    return total\n\nprint(total_even([1, 2, 3, 4, 5, 6]))",
      solutionCode:
        "def total_even(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total\n\nprint(total_even([1, 2, 3, 4, 5, 6]))\nprint(total_even([2, 4]))\nprint(total_even([1, 3, 5]))\nprint(total_even([]))",
      expectedResult: "12\n6\n0\n0",
      quizQuestions: [
        {
          question: "Which keyword defines total_even?",
          options: ["def", "class", "loop", "print"],
          answer: 0,
        },
        {
          question: "Which operator identifies an even integer using number % 2?",
          options: ["==", "!=", ">", "//"],
          answer: 0,
        },
        {
          question: "Why is total initialised to zero?",
          options: [
            "It is the starting sum",
            "It stops the function",
            "It makes every number even",
            "It converts the list to text",
          ],
          answer: 0,
        },
        {
          question: "What should total_even([1, 3, 5]) return?",
          options: ["9", "1", "0", "5"],
          answer: 2,
        },
        {
          question: "What should total_even([2, 4]) return?",
          options: ["2", "4", "6", "8"],
          answer: 2,
        },
      ],
    }
  ),
];

// ============================================================
// CONTENT QUALITY CHECKS
// Fail early during development if lesson data is malformed.
// ============================================================

const validateLessons = (lessons) => {
  const ids = new Set();

  for (const item of lessons) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate Python lesson ID: ${item.id}`);
    }

    ids.add(item.id);

    if (!item.title || !item.area || !item.description || !item.explanation) {
      throw new Error(`Lesson ${item.id} is missing required content.`);
    }

    if (!Array.isArray(item.options) || item.options.length !== 4) {
      throw new Error(`Lesson ${item.id} must have four main answer options.`);
    }

    if (
      !Number.isInteger(item.answer) ||
      item.answer < 0 ||
      item.answer >= item.options.length
    ) {
      throw new Error(`Lesson ${item.id} has an invalid main answer index.`);
    }

    if (!Array.isArray(item.quizQuestions) || item.quizQuestions.length !== 5) {
      throw new Error(`Lesson ${item.id} must have exactly five quiz questions.`);
    }

    for (const [index, quiz] of item.quizQuestions.entries()) {
      if (
        !quiz.question ||
        !Array.isArray(quiz.options) ||
        quiz.options.length !== 4 ||
        !Number.isInteger(quiz.answer) ||
        quiz.answer < 0 ||
        quiz.answer >= quiz.options.length
      ) {
        throw new Error(
          `Lesson ${item.id}, quiz question ${index + 1} is malformed.`
        );
      }
    }

    if (!Array.isArray(item.activities) || item.activities.length < 3) {
      throw new Error(`Lesson ${item.id} needs at least three activities.`);
    }
  }

  if (lessons.length !== 60) {
    throw new Error(`Expected 60 Python lessons, found ${lessons.length}.`);
  }
};

validateLessons(pythonLessons);

// ============================================================
// LOOKUP AND PROGRESS HELPERS
// Keep the existing function names and return shape.
// ============================================================

export const getPythonLesson = (lessonId) => {
  const id = Number(lessonId);

  return pythonLessons.find((item) => item.id === id) || null;
};

export const getPythonLessonsByArea = (area) => {
  return pythonLessons.filter((item) => item.area === area);
};

export const getPythonLessonTypes = () => {
  return ["video", "concept", "quiz", "hands-on"];
};

export const getPythonProgress = (completedLessonIds = []) => {
  const completed = new Set(completedLessonIds.map(Number));

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
    totalXP: completedLessons.reduce((total, item) => total + item.xp, 0),
  };
};

export const getPythonAreas = () => {
  return [...new Set(pythonLessons.map((item) => item.area))];
};

// ============================================================
// EXPORTS
// Supports existing named and default imports.
// ============================================================

export { pythonLessons };

export default pythonLessons;