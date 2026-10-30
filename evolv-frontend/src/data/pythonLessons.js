// src/data/pythonLessons.js

// ============================================================
// EVOLV — PYTHON LEARNING CURRICULUM
// 60 lessons | 8 worlds | Progressive difficulty
//
// Lesson types:
// - video    : watch an animated explanation
// - concept  : read-only theory (definitions, rules, syntax, key ideas)
// - quiz     : check understanding with questions
// - hands-on : write and run code
//
// CONTENT RULE:
// - `explanation` is the "content to read". It contains ONLY concept
//   material (definitions, rules, syntax, common mistakes).
//   It never contains practice tasks, "try this" prompts, or quiz items.
// - Practice lives in `instructions`, `starterCode`, `solutionCode`
//   and `activities`. Quizzes live in `question` and `quizQuestions`.
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
    `Python is a general-purpose programming language used for automation, web development, data analysis, and artificial intelligence. A program is an ordered list of instructions, and each instruction is called a statement. Python runs statements from top to bottom, one at a time. The built-in print() function displays a value in the output. The value placed inside the parentheses is called an argument. Text values, called strings, must be written inside matching quotation marks, while numbers are written without quotes. Python source files commonly use the .py extension. Python's syntax is designed to be readable, which is why it is widely recommended for beginners.`,
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
    `print() displays the values passed to it. When several arguments are separated by commas, print() places a single space between them in the output. Each print() call normally ends with a newline, so separate calls appear on separate lines. A number such as 10 and a string such as "10" look similar when printed, but they are different types: the number can be used in arithmetic, while the string is text. A print() call can display a literal value, a variable, or the result of an expression; Python evaluates the expression first and then prints the result. Strings can use single or double quotes, but the opening and closing quote must match.`,
    'print("Welcome to EVOLV")\nprint(10)\nname = "EVO"\nprint("Hello", name)\nprint("Score:", 4 + 6)',
    "Welcome to EVOLV\n10\nHello EVO\nScore: 10",
    "Which statement prints the numeric value 25?",
    ['print("25")', "print(25)", "display = 25", "echo(25)"],
    1,
    "Use print() with the number inside its parentheses.",
    {
      videoUrl: "/videos/Printing Messages.html",
      videoTitle: "Printing Messages — Video",
      instructions:
        "Print a welcome message, a learner's name, and a score calculated from two numbers.",
      starterCode:
        'name = "EVO"\nfirst_score = 12\nsecond_score = 8\n\n# Display the name and total score',
      solutionCode:
        'name = "EVO"\nfirst_score = 12\nsecond_score = 8\nprint("Learner:", name)\nprint("Total score:", first_score + second_score)',
      quizQuestions: [
        {
          question: 'What does print("EVOLV", 10) display?',
          options: ["EVOLV10", "EVOLV 10", '"EVOLV", 10', "An error"],
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
    `A variable is a name that refers to a value stored in memory. The assignment operator = gives a name a value; it does not test equality. Python reads an assignment from right to left: the expression on the right is evaluated first, and the result is bound to the name on the left. Variable names are case-sensitive, so score and Score are different names. A name may contain letters, digits, and underscores, but it cannot start with a digit, cannot contain spaces, and cannot be a reserved keyword such as class. By convention, Python names use lowercase letters with underscores, such as student_name. Reassigning a name makes it refer to a new value, and later statements use the new value.`,
    'student_name = "EVO"\nscore = 10\nscore = score + 5\nprint(student_name)\nprint(score)',
    "EVO\n15",
    "Which operator assigns a value?",
    ["==", "=", "!=", ":"],
    1,
    "Assignment uses one equals sign.",
    { videoUrl: "/videos/Variables.html",
      videoTitle: "Videos — Video",
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
          question:
            "What is the value of score after score = 10 and score = score + 5?",
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
    `Python supports addition (+), subtraction (-), multiplication (*), division (/), floor division (//), remainder (%), and exponentiation (**). Ordinary division with / always produces a float, even when the result is a whole number, so 10 / 2 gives 5.0. Floor division // divides and rounds the result down to the nearest whole number. The remainder operator % gives what is left after division, which makes it useful for testing divisibility: a number is even when number % 2 is 0. Python follows the usual order of operations: parentheses first, then exponentiation, then multiplication and division, then addition and subtraction. Parentheses can be added to make the intended order clear. Integers (int) are whole numbers and floats (float) contain a decimal point.`,
    "a = 12\nb = 5\nprint(a + b)\nprint(a / b)\nprint(a // b)\nprint(a % b)\nprint(2 ** 3)",
    "17\n2.4\n2\n2\n8",
    "Which operator calculates a remainder?",
    ["//", "*", "%", "/"],
    2,
    "It is the percent symbol.",
    { videoUrl: "/videos/Numbers%20and%20Calculations.html",
      videoTitle: "Videos — Video",
      instructions:
        "Build a bill calculator using a price and quantity. Display the total and the remainder when the total is divided by 5.",
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
    `A string (str) is a sequence of characters enclosed in matching single or double quotation marks. The + operator joins (concatenates) two strings, and the * operator repeats a string. The len() function returns the number of characters, including spaces. An f-string begins with the letter f before the opening quote and lets you insert values by placing variable names or expressions inside curly braces, as in f"Hello {name}". Strings are immutable, which means a string cannot be changed in place; operations on strings produce new strings. Joining a string and a number with + raises a TypeError, so the number must first be converted to text.`,
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
    `The input() function shows an optional prompt message, pauses the program, and waits for the user to type a line and press Enter. It always returns a string, even when the user types digits. To do arithmetic, the text must be converted with int() for whole numbers or float() for decimals. If the text cannot be converted, for example int("hello"), Python raises a ValueError. A common pattern is to wrap input() inside a conversion call, such as int(input("Age: ")). Programs that use input() need an environment that supports interactive typing, such as a terminal or an editor with an input box.`,
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
          question: "If the user enters 19, what does input() initially return?",
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
          question:
            "Why might a browser-based lesson need special support for input()?",
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
    `Every Python value has a type. The basic types are str (text), int (whole numbers), float (decimal numbers), and bool (True or False). Type conversion creates a value of a different type: int() converts suitable text or a float to an integer, float() converts to a decimal number, str() converts a value to text, and bool() converts a value to True or False. Converting a float with int() removes the fractional part rather than rounding. A conversion fails with ValueError when the value is unsuitable, for example int("3.5") or int("abc"). The type() function reports a value's type, and type(value).__name__ gives the short type name such as int.`,
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
    `A Boolean (bool) is a value with exactly two possibilities: True or False. Both literals are case-sensitive, so true and FALSE are not valid. Comparison operations produce Boolean results, for example 5 > 8 evaluates to False. Boolean variables usually represent a state or a yes/no fact, and names such as is_ready or has_ticket make that meaning clear. The string "True" is text, not the Boolean value True, and the two behave differently. Booleans are the foundation of decision-making, because conditions in if statements and loops are evaluated as True or False. The and, or, and not operators combine Boolean values.`,
    'is_ready = True\nhas_ticket = False\nprint(is_ready)\nprint(5 > 8)\nprint(type("True").__name__)',
    "True\nFalse\nstr",
    "Which is a valid Boolean literal?",
    ["true", "FALSE", "True", "yes"],
    2,
    "The first letter is uppercase.",
    {
      instructions:
        "Create two Boolean variables, print both, and print a result that combines them with and.",
      starterCode:
        "is_registered = True\nhas_completed_lesson = False\n\n# Print both values\n# Print whether both are True",
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
    `Comparison operators compare two values and produce a Boolean result. The operators are == (equal to), != (not equal to), > (greater than), < (less than), >= (greater than or equal to), and <= (less than or equal to). The single equals sign = assigns a value, while the double equals sign == tests equality, and confusing them is a very common mistake. Boundary values matter: >= includes the value itself, while > does not. Comparison operators work on numbers and also on strings, which are compared character by character. Comparisons can be stored in variables or used directly as conditions.`,
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
        "score = 50\n\n# Check whether score is at least 50\n# Check whether score equals 100\n# Check whether score differs from 0",
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
    `This checkpoint reviews the core ideas of the Meadow. print() displays values. A variable is a name bound to a value, and = assigns while == compares. Arithmetic operators calculate numbers, with / producing a float, // rounding down, and % giving the remainder. Strings are text, can be joined with +, and can be formatted with f-strings. input() returns a string that must be converted before arithmetic. Comparison operators produce Boolean values. To predict a program's output, follow each statement in order and keep track of the current value of every variable, because a variable's value changes whenever it is reassigned.`,
    'name = "EVO"\npoints = 5\npoints = points + 3\npassed = points >= 8\nprint(name, points)\nprint(passed)',
    "EVO 8\nTrue",
    "What does print(2 + 3) display?",
    ["23", "5", "2 + 3", "An error"],
    1,
    "The plus operator adds numbers.",
    {
      videoUrl: "/videos/Meadow%20Checkpoint.html",
      videoTitle: "Meadow Checkpoint Video",
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
    `A conditional statement lets a program choose whether to run some code. An if statement evaluates a condition, which is an expression that results in True or False. When the condition is True, the indented block beneath the if runs. When it is False, Python skips the block and continues with the next statement after it. The if line must end with a colon, and the statements that belong to the block must be indented consistently, usually with four spaces. Indentation is part of Python's syntax, and inconsistent indentation causes an IndentationError. Statements that are not indented run regardless of the condition.`,
    'temperature = 30\nif temperature > 25:\n    print("It is warm")\nprint("Weather check complete")',
    "It is warm\nWeather check complete",
    "Which keyword begins a conditional statement?",
    ["when", "if", "check", "case"],
    1,
    "It is a two-letter keyword.",
    {
      videoUrl: "/videos/if%20condition.html",
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
          question:
            "What happens when an if condition is false and there is no else?",
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
    `An if/else statement selects exactly one of two paths. Python checks the if condition first. If it is True, the if block runs and the else block is skipped. If it is False, the else block runs instead. The else keyword has no condition of its own; it simply covers every case the if condition did not. Both the if line and the else line end with a colon, and both blocks must be indented consistently. Because exactly one branch runs, if/else is the right structure when a program must always take one of two actions. Choosing between >= and > decides whether the boundary value belongs to the if branch or the else branch.`,
    'age = 16\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
    "Minor",
    "When does the else block run?",
    ["Always", "When the if condition is false", "Before if", "Only in loops"],
    1,
    "It handles the alternative path.",
    {
      type: "hands-on",
      videoUrl: "/videos/ifelse%20condition.html",
      videoTitle: "Python if and else — Video",
      instructions:
        "Write a pass/fail program for a score of 50 or more. Test scores 49, 50, and 51.",
      starterCode:
        'score = 49\n\n# Print "Pass" if score is 50 or more\n# Otherwise print "Try again"',
      solutionCode:
        'score = 49\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")',
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
    `The elif keyword, short for "else if", adds another condition to a decision chain. Python evaluates an if/elif/else chain from top to bottom and runs only the first branch whose condition is True; all remaining branches are skipped. Because of this, the order of conditions matters: a broad condition placed too early can prevent a more specific one from ever being reached. A chain can contain any number of elif branches. The final else is optional and handles every case that no earlier condition matched. Use elif when the outcomes are mutually exclusive, and use separate if statements when several outcomes can happen together.`,
    'score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',
    "B",
    "What does elif allow you to do?",
    ["Repeat a loop", "Check another condition", "Create a variable", "Read a file"],
    1,
    "It adds another conditional branch.",
    {
      videoUrl: "/videos/elif%20condition.html",
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
    `Logical operators combine or reverse Boolean conditions. The and operator is True only when both sides are True. The or operator is True when at least one side is True, and False only when both sides are False. The not operator reverses a value, turning True into False and False into True. Python evaluates not first, then and, then or, and parentheses can be used to make the intended grouping obvious. Python uses short-circuit evaluation: with and, if the left side is False the right side is not evaluated, and with or, if the left side is True the right side is not evaluated. Logical operators let one condition express a rule with several requirements, such as being old enough and holding a valid ID.`,
    "age = 20\nhas_id = True\nprint(age >= 18 and has_id)\nprint(age < 18 or not has_id)",
    "True\nFalse",
    "When is A and B true?",
    ["When either is true", "When both are true", "When both are false", "Always"],
    1,
    "and requires both conditions.",
    {
      videoUrl: "/videos/logical%20operators.html",
      videoTitle: "Logical Operators — Video",
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
          question:
            "If correct_password is True but account_active is False, what is their and result?",
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
    `A nested conditional is an if statement placed inside the block of another conditional. The inner condition is checked only when the outer condition allows its block to run. Indentation shows which condition owns each statement, and each additional level is indented further. Nested conditions are natural for dependent decisions, where the second question only makes sense after the first has been answered. However, deep nesting makes code hard to read. Two techniques can reduce nesting: combining related conditions with and, and using an elif chain when the outcomes are mutually exclusive.`,
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
    {
      videoUrl: "/videos/Nested%20Conditions.html",
      videoTitle: "Nested Conditions — Video",
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
    `Membership operators test whether a value appears inside a string or a collection. The in operator returns True when the value is found, and not in returns True when it is not found. For strings, in checks for a substring, so "Py" in "Python" is True. For lists, tuples, and sets, in checks whether an equal element exists. For dictionaries, in checks the keys. Membership tests are case-sensitive, so "py" in "Python" is False. Membership operators return Boolean values and are commonly used in conditions, for example to confirm that a course is available or that a character is a vowel.`,
    'language = "Python"\nprint("Py" in language)\nprint("Java" in language)\nprint("on" not in language)',
    "True\nFalse\nFalse",
    "Which operator checks membership?",
    ["has", "in", "contains", "belongs"],
    1,
    "It is an ordinary English word.",
    {
      videoUrl: "/videos/Membership%20Operators.html",
      videoTitle: "Membership Operators — Video",
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
    `A conditional expression, sometimes called a ternary expression, selects one of two values in a single line. Its form is value_if_true if condition else value_if_false. Python evaluates the condition first and then produces only the matching value. Because it is an expression, it produces a value and can be assigned to a variable or used inside another expression. It works best for simple choices such as assigning a label. It cannot contain several statements, so a regular if/else statement is the better choice when a branch needs multiple steps or when the logic becomes hard to read.`,
    'age = 20\nstatus = "Adult" if age >= 18 else "Minor"\nprint(status)',
    "Adult",
    "Which keyword separates the alternative value?",
    ["elif", "else", "then", "switch"],
    1,
    "It introduces the alternative branch.",
    {
      videoUrl: "/videos/Conditional%20Expressions.html",
      videoTitle: "Conditional Expressions — Video",
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
          question:
            "How many alternative values does a conditional expression choose between?",
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
    `In a condition, Python does not require a Boolean; any value can be tested, and Python treats it as either truthy or falsy. The falsy values are False, None, the number zero (0 and 0.0), and empty collections or strings such as "", [], (), {}, and set(). Almost every other value is truthy, including non-zero numbers and non-empty strings and collections. The bool() function shows how Python interprets a value, so bool([]) is False and bool([0]) is True because the list is not empty. Truthiness gives a short way to test whether a value was supplied, as in if name:. When the intended rule is specific, such as a number being greater than zero, an explicit comparison is clearer.`,
    'name = "Python"\nitems = []\nif name:\n    print("Name supplied")\nif not items:\n    print("No items yet")',
    "Name supplied\nNo items yet",
    "Which value is false-like?",
    ['"hello"', "5", "[]", "[1]"],
    2,
    "An empty list is false-like.",
    {
      videoUrl: "/videos/Python%20Truthiness.html",
      videoTitle: "Python Truthiness — Video",
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
          question:
            "Which expression tests whether items is empty using truthiness?",
          options: [
            "if not items:",
            "if items == 1:",
            "if items > 0:",
            "if empty(items):",
          ],
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
    `Reliable decision logic depends on choosing the correct comparison operator at each threshold. A phrase such as "at least 50" means score >= 50, "more than 50" means score > 50, "at most 28" means value <= 28, and "below 18" means value < 18. When a value must fall into one of several ranges, each possible value must belong to exactly one range, with no gaps and no overlaps. An if/elif/else chain achieves this because each branch is reached only if the earlier ones failed, so later conditions can rely on that fact. Boundary values, the values exactly at a threshold, are where mistakes usually occur, because they depend on whether the operator includes equality.`,
    'temperature = 24\nif temperature < 18:\n    print("Cool")\nelif temperature <= 28:\n    print("Comfortable")\nelse:\n    print("Hot")',
    "Comfortable",
    "Which condition checks whether a score is at least 50?",
    ["score > 50", "score >= 50", "score = 50", "score < 50"],
    1,
    "At least includes equality.",
    {
      videoUrl: "/videos/Decision%20Practise.html",
      videoTitle: "Decision Practice — Video",
      instructions:
        'Build a temperature alert: below 18 prints "Cool", 18 through 28 prints "Comfortable", and above 28 prints "Hot".',
      starterCode: "temperature = 18\n\n# Add an if/elif/else chain",
      solutionCode:
        'temperature = 18\nif temperature < 18:\n    print("Cool")\nelif temperature <= 28:\n    print("Comfortable")\nelse:\n    print("Hot")',
      quizQuestions: [
        {
          question: "What does the example print for temperature 24?",
          options: ["Cool", "Comfortable", "Hot", "Nothing"],
          answer: 1,
        },
        {
          question: "What does the example print for temperature 18?",
          options: ["Cool", "Comfortable", "Hot", "An error"],
          answer: 1,
        },
        {
          question: "Which condition describes a value strictly below 18?",
          options: [
            "temperature < 18",
            "temperature >= 18",
            "temperature == 18",
            "temperature > 18",
          ],
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
    `This checkpoint reviews the Forest. An if statement runs a block when its condition is True, if/else chooses between two paths, and elif adds further ordered branches where only the first match runs. The and operator needs both conditions True, or needs at least one, and not reverses a value. The in and not in operators test membership. Falsy values include False, None, zero, and empty strings and collections. A conditional expression chooses one of two values in a single line. To follow a decision, evaluate each condition in order and identify the first one that is True.`,
    'value = 12\nif value % 2 == 0 and value > 10:\n    print("Even and greater than ten")\nelse:\n    print("Other value")',
    "Even and greater than ten",
    "Which operator means logical AND?",
    ["or", "and", "not", "in"],
    1,
    "Both conditions must be true.",
    {
      videoUrl: "/videos/LogicalForest%20Checkpoint.html",
      videoTitle: "Logic Forest Checkpoint — Video",
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
    `A loop repeats a block of instructions so the same code does not have to be written many times. The repeated block is called the loop body, and each repetition is called an iteration. Python has two loop statements. A for loop visits each item of an iterable, such as a list, a string, or the values produced by range(). A while loop repeats as long as its condition remains True. Both end their header line with a colon and indent the body. Every loop needs a clear way to finish: a for loop ends when its items are exhausted, and a while loop ends when its condition becomes False.`,
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
        "for number in range(1, 6):\n    # Print a practice reminder\n    pass",
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
    `A for loop takes items one at a time from an iterable, assigns each item to the loop variable, and runs the indented body once for each item. The syntax is for variable in iterable: followed by the body. Lists, strings, tuples, sets, dictionaries, and ranges are all iterables. The loop variable receives a new value on each iteration and keeps its last value after the loop ends. The built-in enumerate() function produces pairs of an index and an item, so for index, item in enumerate(items, start=1) gives numbered items. The loop stops automatically after the last item, and an empty iterable runs the body zero times.`,
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
    `The range() function generates a sequence of integers, which makes it the standard partner of the for loop. range(stop) starts at 0 and stops before stop. range(start, stop) begins at start. range(start, stop, step) moves by step each time. In every form the stop value is excluded, so range(1, 4) produces 1, 2, 3. The number of values in range(start, stop) is stop minus start. A negative step counts downward, and in that case start must be larger than stop, as in range(5, 0, -1). range() produces values on demand rather than building a full list, which keeps it memory-efficient.`,
    "for number in range(1, 4):\n    print(number)",
    "1\n2\n3",
    "What values does range(3) generate?",
    ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
    1,
    "The stop value is excluded.",
    {
      instructions:
        "Print even numbers from 2 through 10, then count backward from 5 to 1.",
      starterCode: "# Print 2, 4, 6, 8, 10\n\n# Print 5, 4, 3, 2, 1",
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
    `A while loop checks its condition before every iteration. If the condition is True, the body runs and the condition is checked again; when it becomes False, the loop ends and execution continues after it. If the condition is False the first time, the body never runs. A while loop is useful when the number of repetitions is not known in advance, such as repeating until the user enters valid data. A while loop needs three parts: a starting state, a condition, and an update inside the body that moves the state toward making the condition False. If the update is missing, the loop never ends, which is called an infinite loop.`,
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
        "count = 1\nwhile count <= 5:\n    # Print count\n    # Increase count\n    pass",
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
    `The break statement immediately exits the innermost loop that contains it. Any remaining iterations are skipped, and execution continues with the first statement after the loop. break is typically placed inside an if statement so the loop ends only when a particular condition is met. It is commonly used in searches, where the loop can stop as soon as the target is found, and in loops that wait for a stop signal. break affects only the loop it is directly inside; in nested loops it does not end the outer loop. It differs from continue, which skips only the current iteration and keeps the loop running.`,
    "for number in range(5):\n    if number == 3:\n        break\n    print(number)",
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
    `The continue statement skips the rest of the current iteration and jumps straight to the next iteration of the innermost loop. In a for loop, the loop moves on to the next item. In a while loop, the condition is checked again. Unlike break, continue does not end the loop; the loop keeps running. continue is usually placed inside an if statement and is useful when certain values should be ignored, such as skipping invalid data or unwanted numbers. Statements written after continue in the same iteration are not executed.`,
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
      instructions: "Print numbers from 1 to 10, skipping multiples of three.",
      starterCode:
        "for number in range(1, 11):\n    # Skip multiples of three\n    # Print other numbers\n    pass",
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
    `A nested loop is a loop placed inside the body of another loop. The outer loop starts one iteration, then the inner loop runs completely, and only then does the outer loop move to its next iteration. The total number of inner iterations is the number of outer iterations multiplied by the number of inner iterations per outer pass. Each loop needs its own loop variable, and each level is indented one step further. Nested loops are used for grids and tables, where an outer loop represents rows and an inner loop represents columns, and for generating combinations of values. Because the work multiplies, deeply nested loops over large ranges can be slow.`,
    "for row in range(2):\n    for col in range(2):\n        print(row, col)",
    "0 0\n0 1\n1 0\n1 1",
    "How many times does the inner body run?",
    ["2", "3", "4", "8"],
    2,
    "Multiply the number of outer and inner iterations.",
    {
      instructions: "Print a 3-by-3 coordinate grid using nested loops.",
      starterCode:
        "for row in range(3):\n    for col in range(3):\n        # Print row and col\n        pass",
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
          question:
            "If the outer loop runs 3 times and the inner loop runs 4 times, how many inner iterations occur?",
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
          options: [
            "Processing a grid",
            "Declaring a string only",
            "Importing a module only",
            "Converting a float only",
          ],
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
    `A string is an ordered sequence of characters, so it is iterable. A for loop over a string assigns one character at a time to the loop variable, from the first character to the last, and the body runs once per character. Spaces and punctuation count as characters. An empty string produces zero iterations. Looping over strings is the basis of many text tasks, such as counting particular letters, checking whether each character meets a rule, and building a new string one character at a time. Because "A" and "a" are different characters, text is often converted with lower() or upper() before characters are compared.`,
    'for letter in "EVO":\n    print(letter)',
    "E\nV\nO",
    "What does a for loop over a string visit?",
    ["Only numbers", "Characters in the string", "Only spaces", "File names"],
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
    `Two patterns appear in many loops. A counter is a variable that tracks how many times something happens; it starts at 0 and increases by 1 each time the event occurs. An accumulator is a variable that builds up a running result, such as a sum, by combining each new value with the current total using a statement like total += number. Both patterns follow the same three steps: initialise the variable before the loop, update it inside the loop, and use the final value after the loop. A sum starts at 0 because 0 does not change the total, while a product starts at 1. If the variable is not initialised before the loop, Python raises an error, and if it is initialised inside the loop, it resets on every iteration.`,
    "total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)",
    "6",
    "What is an accumulator used for?",
    ["Store a running result", "Stop Python", "Create a class", "Read input only"],
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
    `This checkpoint reviews the River. A for loop visits each item of an iterable, and a while loop repeats while its condition is True and must update its state to finish. range() generates integers and excludes its stop value. break exits the innermost loop, while continue skips to the next iteration. In nested loops, the inner loop completes for every outer iteration. A counter tracks how many times an event happens, and an accumulator builds a running result; both must be initialised before the loop starts.`,
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
    `A list is an ordered, mutable collection of items. Lists are written with square brackets and commas between the elements, such as [10, 20, 30]. "Ordered" means each item keeps its position, and "mutable" means the list can be changed after it is created by adding, replacing, or removing items. A list can hold values of different types and can contain duplicates. The len() function returns the number of items, and an empty list is written []. The append() method adds an item to the end. Lists are used wherever a group of related values must be kept together, such as scores, names, or tasks.`,
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
    `An index is the position of an item in a sequence, written in square brackets after the sequence, as in numbers[0]. Python uses zero-based indexing, so the first item is at index 0, the second at index 1, and the last at index len(numbers) - 1. Negative indexes count backward from the end: -1 is the last item, -2 is the second-to-last, and so on. Using an index that does not exist raises an IndexError. Indexing works on lists, tuples, and strings. Because lists are mutable, an index can also appear on the left of an assignment to replace the item at that position.`,
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
          options: ["The first item", "The last item", "The second item", "No item"],
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
    `Because lists are mutable, their contents can be changed in place. Assigning to an index, as in scores[0] = 5, replaces the item at that position. The append(value) method adds an item to the end, and insert(index, value) adds an item at a chosen position. The remove(value) method deletes the first item equal to the value and raises ValueError if it is not found. The pop() method removes and returns the last item, and pop(index) removes the item at that index. Methods such as append(), remove(), and sort() change the list itself and return None. Choose remove() when the value is known and pop() when the position is known.`,
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
    `A tuple is an ordered collection that cannot be changed after it is created, which is called being immutable. Tuples are usually written with parentheses, such as (3, 4), although it is the commas that actually define a tuple. A tuple containing one item needs a trailing comma, as in (5,), because (5) is just the number 5 in parentheses. Items are accessed by index exactly as in lists, but assigning to an index raises a TypeError. Tuples can be unpacked into separate variables, as in x, y = point. Tuples suit fixed groups of related values, such as coordinates or a date, where accidental changes should not be possible.`,
    "point = (3, 4)\nprint(point[0])\nprint(point[1])",
    "3\n4",
    "Can a tuple item be reassigned in place?",
    ["Yes, always", "No", "Only strings", "Only integers"],
    1,
    "Tuples are immutable.",
    {
      instructions:
        "Create a coordinate tuple. Access both values and explain why a tuple suits fixed data.",
      starterCode: "point = (3, 4)\n\n# Print both coordinate values",
      solutionCode: "point = (3, 4)\nprint(point[0])\nprint(point[1])",
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
    `A set is an unordered collection of distinct elements. Adding a duplicate value has no effect, so each value is stored only once. Sets are written with curly braces, such as {1, 2, 3}, and an empty set must be created with set() because {} creates an empty dictionary. Because sets are unordered, they do not support indexing or slicing, and the order of printed elements is not guaranteed. Membership tests with in are fast. Sets support mathematical operations: union (| ) combines elements from both sets, intersection (&) keeps elements found in both, and difference (-) keeps elements found in the first set but not the second. Converting a list with set() is a quick way to remove duplicates.`,
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
    `A dictionary (dict) is a collection that maps keys to values. It is written with curly braces containing key: value pairs separated by commas. Each key must be unique and hashable, which in practice means strings, numbers, and tuples are suitable keys while lists are not. A value is read with dictionary[key], and a missing key raises a KeyError. The get(key, default) method returns the default instead of raising an error when the key is missing. Assigning to a key, such as student["score"] = 90, adds the pair if the key is new or replaces the value if it exists. Looping over a dictionary visits its keys, and the items() method provides key and value together. Dictionaries keep the order in which keys were inserted.`,
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
          options: [
            "Keys to values",
            "Characters to loops",
            "Only indexes to strings",
            "Files to folders only",
          ],
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
    `A method is a function that belongs to a value and is called with a dot, as in text.upper(). String methods perform common text operations. lower() and upper() change letter case, title() capitalises each word, strip() removes whitespace from both ends, and replace(old, new) substitutes text. Other useful methods include split(), which breaks a string into a list, startswith() and endswith(), which return Booleans, and find(), which returns the position of a substring or -1. Because strings are immutable, a method never changes the original; it returns a new string, so the result must be stored in a variable to keep it. Methods that return strings can be chained, as in text.strip().upper().`,
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
    `Slicing extracts part of a sequence using the form sequence[start:stop:step]. The start index is included, and the stop index is excluded, so "PYTHON"[1:4] gives "YTH". If start is omitted it defaults to the beginning, and if stop is omitted it defaults to the end, so [:2] means the first two items and [-2:] means the last two. Negative indexes count from the end. The optional step selects every nth item, and a step of -1 reverses the sequence. Slicing never raises an IndexError for out-of-range bounds; it simply returns what is available. Slicing works on strings, lists, and tuples, and always produces a new object of the same kind.`,
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
    `A list comprehension builds a new list in a single expression. Its form is [expression for item in iterable], optionally followed by if condition to keep only some items. Python takes each item from the iterable, applies the expression, and collects the results into a list. The condition, when present, is checked first and filters items out. A comprehension is equivalent to a for loop that creates an empty list and appends to it, but it is shorter. Similar syntax exists for sets and dictionaries. Comprehensions are best for simple transformations and filters; when the logic needs several steps or nested conditions, a regular loop is easier to read.`,
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
          options: [
            "An optional if clause",
            "The list name",
            "The brackets alone",
            "A print statement",
          ],
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
    `This checkpoint compares the collections of the Kingdom. A list is ordered and mutable and is written with []. A tuple is ordered and immutable and is written with (). A set is unordered, stores only unique elements, and supports union, intersection, and difference. A dictionary maps unique keys to values. Strings are immutable sequences of characters that support indexing, slicing, and methods. Indexing starts at 0, negative indexes count from the end, and slices exclude the stop index. The right structure depends on what must be stored and how it will be accessed or updated.`,
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
    `A function is a named block of code that performs a task and can be run whenever it is needed. A function is defined with the def keyword, followed by the function name, parentheses, and a colon, and its body is indented beneath. Defining a function does not run its body; the body runs only when the function is called by writing its name followed by parentheses, such as greet(). A function can be called any number of times. Functions remove repetition, give a name to a piece of logic, and make programs easier to test and maintain. By convention, function names use lowercase letters with underscores and describe the action performed.`,
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
    `Parameters let a function receive information. A parameter is a variable name listed in the parentheses of the function definition. An argument is the actual value supplied when the function is called. Arguments are matched to parameters by position, so the first argument goes to the first parameter. A function can have any number of parameters, and it must be called with the right number of arguments, otherwise Python raises a TypeError. Parameters exist only while the function runs. Meaningful parameter names, such as name and price, document what the function expects, and one function can produce different results for different arguments.`,
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
          options: ["Two arguments", "No arguments", "A class", "A file"],
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
    `The return statement sends a value back to the code that called the function and immediately ends that function call. The returned value can be stored in a variable, used in a calculation, or passed to another function. This differs from print(), which only displays a value on the screen; a function that only prints gives the caller nothing to work with. A function with no return statement, or with a bare return, returns None, which represents "no value". A function can return several values at once as a tuple, such as return a, b. Statements written after a return in the same function call are never executed. Functions that return results are easier to reuse and test than functions that only print.`,
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
    `A default argument gives a parameter a fallback value, written in the definition as parameter=value. When the caller omits that argument, the default is used; when the caller supplies a value, it replaces the default. Parameters with defaults must come after parameters without defaults. Defaults make functions flexible, because common cases need fewer arguments while special cases can still override the behaviour. The default value is created once, when the function is defined, not on every call. For this reason a mutable default such as an empty list can be shared between calls and cause surprising results; the usual approach is to use None as the default and create the list inside the function.`,
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
          options: ["Hello, Arun!", "Welcome, Arun!", "Arun, Welcome!", "Nothing"],
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
    `A keyword argument passes a value by naming the parameter in the call, in the form name=value. Because Python matches by name rather than position, keyword arguments can appear in any order, and they make calls easier to read, especially when a function has several parameters. The names used must match the parameter names in the definition, otherwise Python raises a TypeError. Positional and keyword arguments can be mixed, but positional arguments must come first. Providing the same parameter both by position and by keyword is an error. Keyword arguments also combine naturally with default arguments, letting a caller change just one optional setting.`,
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
          question:
            "Which argument order is generally required when mixing positional and keyword arguments?",
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
    `Scope is the region of a program where a name can be used. A variable created inside a function is local: it exists only while that function runs and cannot be used outside it. A variable created outside all functions is global and can be read from inside functions. Assigning to a name inside a function creates a new local variable, even when a global variable has the same name, so the global value is not changed. Python searches for a name in this order: local scope, enclosing function scope, global scope, and finally built-in names. The global keyword can make a function assign to a global variable, but relying on it makes code harder to follow. Passing values in as parameters and sending results out with return is the preferred design.`,
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
        'message = "Outside"\n\ndef show():\n    # Create a local variable named message\n    pass\n\nshow()\nprint(message)',
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
          question:
            "Does assigning a local variable automatically change a global variable with the same name?",
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
    `A lambda expression creates a small anonymous function, meaning a function without a name. Its form is lambda parameters: expression. The function contains exactly one expression, and the value of that expression is returned automatically, so no return keyword is used. A lambda can be assigned to a variable and called like any function, but it is most often passed directly to another function that expects a function, such as the key argument of sorted(), min(), or max(). A lambda cannot contain statements such as assignments, loops, or multiple lines. When a function needs several steps, a descriptive name, or documentation, a regular def function is the better choice.`,
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
          options: ["An anonymous function", "A class only", "A file", "A loop"],
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
    `Recursion is a technique in which a function calls itself to solve a smaller version of the same problem. Every correct recursive function has two parts. The base case is a condition that can be answered directly and stops further calls. The recursive case calls the function again with a smaller or simpler input that moves toward the base case. Each call is placed on the call stack and waits for the call it made to finish. If the base case is never reached, calls keep stacking until Python raises a RecursionError. Recursion suits problems that naturally break into smaller copies of themselves, such as counting down, factorials, and tree structures, although a loop is often simpler for plain repetition.`,
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
    `A module is a file of Python code that can be imported and reused. The standard library is a large set of modules that come with Python, such as math, random, and datetime. The statement import math makes the module's names available, and each name is accessed with dot notation, such as math.sqrt(16). The form from math import sqrt imports a single name that can then be used directly, and import math as m gives the module a shorter alias. The math module provides functions such as sqrt() for square roots, ceil() for rounding up, and floor() for rounding down, and constants such as pi. Imports are normally placed at the top of a file. Any Python file you write can also be imported as a module.`,
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
    `This checkpoint reviews the Mountains. A function is defined with def and runs only when called. Parameters are names in the definition, and arguments are the values supplied in a call, either by position or by keyword. Default arguments supply fallback values. return sends a result back to the caller, while print() only displays a value, and a function without return gives back None. Local variables exist only inside their function. A lambda is a one-expression anonymous function, and recursion needs a base case. Modules are imported with import and their names are reached with dot notation. To analyse a function, identify its inputs, what it does with them, and what it returns.`,
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

  // ==========================================================
  // WORLD 6 — OBJECT-ORIENTED GROVE
  // ==========================================================

  lesson(
    51,
    "Classes and Objects",
    "Object-Oriented Grove",
    "Model related data and behaviour using classes and objects.",
    `Object-oriented programming organises code around objects that combine data and behaviour. A class is a blueprint that defines a kind of object. It is created with the class keyword, and by convention class names use CapitalizedWords. An object, also called an instance, is a particular item created from a class by calling the class like a function, such as Dog(). Many objects can be created from one class, and each is independent. Data stored in an object is called its attributes, and actions the object can perform are called methods. For example, a Student class can describe what every student has, while each Student object represents one specific student. The type() function reports the class of an object.`,
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
    `The __init__ method is a special method that Python calls automatically whenever a new instance is created. It is used to set up the object's starting attributes. Its first parameter is conventionally named self and refers to the instance being created; Python supplies it automatically, so it is not passed when creating the object. Writing self.name = name stores the value on that particular instance, so different instances can hold different data. The remaining parameters of __init__ become the arguments used when creating the object, as in Student("EVO", 90). Attributes are read with dot notation, such as first.name. Parameters and attributes are separate things: name is a temporary parameter, while self.name is stored on the object.`,
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
          options: ["Student(...)", "new Student only", "create Student", "def Student"],
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
    `An instance method is a function defined inside a class that works on one particular object. Its first parameter is self, which Python fills in automatically with the object the method is called on, so counter.increment() is treated as increment(counter). Inside a method, attributes are read and changed through self, as in self.value += 1. An object's attributes together make up its state, and methods are the controlled way to read or change that state. A method can return a value, such as show(), or change the object and return nothing, such as increment(). Methods are called with dot notation on an instance, and each instance keeps its own separate state.`,
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
    `Inheritance lets a new class reuse and extend an existing class. The existing class is called the parent, base, or superclass, and the new class is the child or subclass. The parent is named in parentheses after the child's name, as in class Dog(Animal). The child automatically receives the parent's attributes and methods. A child can add new methods and can override an inherited method by defining a method with the same name, in which case the child's version is used for the child's objects. The super() function gives access to the parent's version of a method, which is often used inside __init__. Inheritance models an "is a" relationship: a Dog is an Animal. It should be used for genuine specialisations, not simply to share code.`,
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
    `This checkpoint reviews the Grove. A class is a blueprint, and an object is an instance created from it. Attributes store an object's data, and methods define its actions. The __init__ method runs when an instance is created and sets its initial attributes, while self refers to the current instance inside every instance method. Each instance keeps its own attribute values. Inheritance lets a child class reuse a parent class and override its methods, and super() reaches the parent's version. Object-oriented design groups related state and behaviour so a program mirrors the things it models.`,
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
          options: ["An instance of a class", "A keyword", "A loop", "A comment"],
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
    `Files let a program read data that persists after the program ends. The open(path, mode, encoding="utf-8") function opens a file and returns a file object. The mode "r" opens an existing file for reading, and it is the default. The with statement, written with open(...) as file:, closes the file automatically when its block ends, even if an error occurs, so it is the recommended way to work with files. The read() method returns the whole content as one string, readline() returns one line, readlines() returns a list of lines, and looping over the file object visits one line at a time. Each line from a file ends with a newline character, which strip() can remove. A relative path is resolved from the program's working directory, and opening a file that does not exist raises FileNotFoundError.`,
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
        'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Learn Python.\\nPractise daily.\\n")\n\n# Open notes.txt in read mode and print its content',
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
    `A file opened in write mode "w" is created if it does not exist, and if it already exists its previous contents are erased immediately, so this mode must be used carefully. Append mode "a" keeps the existing contents and adds new text at the end. Exclusive mode "x" creates a new file and raises an error if the file already exists. The write() method writes a string and returns the number of characters written; it does not add a newline automatically, so "\\n" must be included at the end of each line. Only strings can be written to a text file, so numbers must be converted with str() first. Using with open(...) ensures the data is saved and the file is closed when the block ends.`,
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
          question:
            "Which mode should you choose when preserving existing text and adding more?",
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
    `An exception is an error that occurs while a program runs and interrupts its normal flow. Common exceptions include ValueError for an unsuitable value, TypeError for the wrong type, ZeroDivisionError, IndexError, KeyError, and FileNotFoundError. A try block contains code that might fail. An except block names the exception type to handle and runs only if that exception occurs. An optional else block runs when the try block finishes without an exception, and an optional finally block runs in every case and is used for cleanup. Handling a specific exception type is better than a bare except, because a bare except can hide unrelated bugs. Syntax errors are different: they are found before the program runs and cannot be handled with try.`,
    'try:\n    number = int("abc")\nexcept ValueError:\n    print("Please enter a whole number")\nelse:\n    print(number * 2)',
    "Please enter a whole number",
    "Which block handles a matching exception?",
    ["try", "except", "class", "for"],
    1,
    "It follows the try block.",
    {
      instructions:
        "Convert user-provided text to an integer and display a helpful message when conversion fails.",
      starterCode: 'text = "abc"\n\n# Add try/except around int(text)',
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
    `Built-in functions are always available without importing anything. len() returns the number of items in a sequence or collection. sum() adds the numbers in an iterable, and min() and max() return the smallest and largest values. sorted() returns a new sorted list and leaves the original unchanged, with reverse=True giving descending order. round() rounds a number to a chosen number of decimals, and abs() returns the absolute value. type() reports a value's type, and enumerate() pairs each item with its index in a loop. zip() combines several iterables item by item. An average is calculated by dividing sum() by len(). Knowing the built-ins avoids writing loops for common tasks.`,
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
    `This challenge combines the main ideas of the course. A function is defined with def and receives its input through parameters. A for loop visits each item of a list. An if statement with the condition number % 2 == 0 identifies even numbers, because an even number leaves a remainder of 0 when divided by 2. An accumulator variable is initialised to 0 before the loop and updated with += inside it. The function ends with return, which sends the final total back to the caller. A well-designed function works for any input of the expected kind, including an empty list, which produces the starting total of 0 because the loop body never runs.`,
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