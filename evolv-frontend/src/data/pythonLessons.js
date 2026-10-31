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
//   material (what it is, syntax, rules, common mistakes).
//   It never contains practice tasks, "try this" prompts, or quiz items.
// - Practice lives in `instructions`, `starterCode`, `solutionCode`
//   and `activities`. Quizzes live in `question` and `quizQuestions`.
//
// HANDS-ON STANDARD (every lesson):
// - instructions : Task + numbered Steps + Expected output
// - starterCode  : runnable skeleton with TODO comments
// - solutionCode : complete reference solution
// - expectedResult : exact output of solutionCode
//
// Compatibility preserved:
// - Existing lesson IDs: 1–60
// - Existing world names
// - Existing lesson properties
// - Existing video URLs and titles
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

    `What is Python?
Python is a high-level, general-purpose programming language. It is used for web development, automation, data analysis, science, and artificial intelligence. Its syntax is designed to be easy to read.

What is a program?
A program is a list of instructions that tells a computer what to do. Each instruction is called a statement. Python runs statements one at a time, from the top of the file to the bottom, so the order of statements matters.

How Python code runs
Python code is saved in files that end with .py. A program called the Python interpreter reads the file and carries out each statement.

Your first statement
print() is a built-in function that displays a value on the screen.
Syntax: print(value)
- Text must be written inside quotation marks: print("Hello")
- Numbers and calculations do not need quotation marks: print(2 + 3)

Common mistakes
- Leaving out the parentheses: print "Hi" is an error in Python 3.
- Forgetting a closing quotation mark or bracket.
- Writing Print instead of print. Python is case-sensitive.`,

    `print("Hello, EVOLV!")
print("I am learning Python.")
print(2 + 3)`,

    "Hello, EVOLV!\nI am learning Python.\n5",

    "Which function displays a value on the screen?",

    ["input()", "print()", "type()", "len()"],

    1,

    "It sends a value to the output.",

    {
      videoUrl: "/videos/Meet Python.html",
      videoTitle: "Meet Python — Animated Introduction",

      instructions: `Task: Write a short program that greets the learner and performs one calculation.

Steps:
1. Print the text Welcome to EVOLV!
2. Print the text My first program
3. Print the result of 8 + 4

Expected output:
Welcome to EVOLV!
My first program
12`,

      starterCode: `# Step 1: print the welcome message
print("Welcome to EVOLV!")

# Step 2: print "My first program"
# TODO

# Step 3: print the result of 8 + 4
# TODO
`,

      solutionCode: `print("Welcome to EVOLV!")
print("My first program")
print(8 + 4)`,

      expectedResult: "Welcome to EVOLV!\nMy first program\n12",

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
          options: ['"Hi"', "Hi", "print", "Nothing"],
          answer: 1,
        },
        {
          question: "Which file extension is normally used for Python programs?",
          options: [".html", ".css", ".py", ".sql"],
          answer: 2,
        },
        {
          question: "What does print(2 + 3) display?",
          options: ["23", "5", "2 + 3", "An error"],
          answer: 1,
        },
        {
          question: "In which order does Python normally run statements?",
          options: [
            "From top to bottom",
            "From bottom to top",
            "In random order",
            "Alphabetical order",
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

    `What print() does
print() displays information in the program's output. The value you give to a function is called an argument.
Syntax: print(argument1, argument2, ...)

What you can print
- Text (a string) must be inside quotation marks: print("Welcome")
- Numbers are written without quotes: print(10)
- Variables print the value they store: print(name)
- Expressions are calculated first, then displayed: print(4 + 6) shows 10

A number and a string can look the same when printed, but Python treats them as different kinds of values. 10 is a number and "10" is text.

Several arguments
You can give print() several arguments separated by commas. By default Python puts a single space between them.
print("Score:", 10) displays Score: 10

Changing the layout
- sep sets the text placed between arguments: print("A", "B", sep="-") displays A-B
- end sets what is printed at the end. By default it is a new line, so each print() starts on its own line. print("Hi", end="!") keeps the next output on the same line.

Common mistakes
- Putting a number in quotes when you want to calculate: print("4 + 6") displays 4 + 6, not 10.
- Forgetting the comma between arguments.
- Using mismatched quotes such as "Hello'.`,

    `print("Welcome to EVOLV")
print(10)
name = "EVO"
print("Hello", name)
print("Score:", 4 + 6)`,

    "Welcome to EVOLV\n10\nHello EVO\nScore: 10",

    "Which statement prints the number 25?",

    ['print("25")', "print(25)", "display = 25", "echo(25)"],

    1,

    "Use print() with the number inside its parentheses.",

    {
      videoUrl: "/videos/Printing Messages.html",
      videoTitle: "Printing Messages — Video",

      instructions: `Task: Display a learner's name, a calculated total, and a custom separator.

Steps:
1. Print Learner: followed by the variable name
2. Print Total score: followed by first_score + second_score
3. Print the arguments "Level" and 1 using sep=": "

Expected output:
Learner: EVO
Total score: 20
Level: 1`,

      starterCode: `name = "EVO"
first_score = 12
second_score = 8

# Step 1: print "Learner:" and the name
# TODO

# Step 2: print "Total score:" and the sum of both scores
# TODO

# Step 3: print "Level" and 1 with sep=": "
# TODO
`,

      solutionCode: `name = "EVO"
first_score = 12
second_score = 8

print("Learner:", name)
print("Total score:", first_score + second_score)
print("Level", 1, sep=": ")`,

      expectedResult: "Learner: EVO\nTotal score: 20\nLevel: 1",

      quizQuestions: [
        {
          question: 'What does print("EVOLV", 10) display?',
          options: ["EVOLV10", "EVOLV 10", '"EVOLV", 10', "An error"],
          answer: 1,
        },
        {
          question: "Which value is a number rather than text?",
          options: ['"42"', "42", '"3.5"', '"hello"'],
          answer: 1,
        },
        {
          question: "What does print(7 + 3) display?",
          options: ["73", "10", "7 + 3", "7"],
          answer: 1,
        },
        {
          question: 'What does print("A", "B", sep="-") display?',
          options: ["A B", "AB", "A-B", "A,B"],
          answer: 2,
        },
        {
          question: "What normally happens after a print() call finishes?",
          options: [
            "The next output starts on a new line",
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

    `What is a variable?
A variable is a name that refers to a value stored in memory. It lets you keep information and use it again later.

Assignment
Syntax: variable_name = value
Python works out the value on the right side and attaches the name on the left side to it.
- The = sign means "assign". It does not mean "is equal to". Equality is tested with ==.

Updating a variable
A name can be assigned again. The name then refers to the new value.
score = 10
score = score + 5   (score is now 15)
The right side is calculated first using the old value, then the result is stored back.

Naming rules
- Use letters, digits, and underscores only.
- A name cannot start with a digit: 2score is invalid.
- A name cannot contain spaces: use student_name, not student name.
- A name cannot be a Python keyword such as class, if, or for.
- Names are case-sensitive: score and Score are different variables.

Good style
Use lowercase words joined by underscores (snake_case) and choose names that describe the data, such as total_price rather than x.

Dynamic typing
You do not declare a type in advance. The value has a type, and a name can later be assigned a value of a different type.

Common mistakes
- Using a variable before assigning it (NameError).
- Writing score == 10 when you meant score = 10.
- Typing a name with different capitalisation.`,

    `student_name = "EVO"
score = 10
score = score + 5
print(student_name)
print(score)`,

    "EVO\n15",

    "Which operator assigns a value to a variable?",

    ["==", "=", "!=", ":"],

    1,

    "Assignment uses one equals sign.",

    {
      videoUrl: "/videos/Variables.html",
      videoTitle: "Variables — Video",

      instructions: `Task: Store a learner's details in variables and update the points.

Steps:
1. Create a variable name with the value "EVO"
2. Create a variable points with the value 10
3. Increase points by 5 using points = points + 5
4. Print name
5. Print points

Expected output:
EVO
15`,

      starterCode: `# Step 1: create name
name = "EVO"

# Step 2: create points
points = 10

# Step 3: add 5 to points
# TODO

# Step 4 and 5: print name and points
# TODO
`,

      solutionCode: `name = "EVO"
points = 10
points = points + 5
print(name)
print(points)`,

      expectedResult: "EVO\n15",

      quizQuestions: [
        {
          question: "Which is a valid variable name?",
          options: ["2score", "student_name", "student name", "class"],
          answer: 1,
        },
        {
          question:
            "What is the value of score after score = 10 and then score = score + 5?",
          options: ["5", "10", "15", "105"],
          answer: 2,
        },
        {
          question: "Are score and Score the same variable?",
          options: [
            "Yes, always",
            "No, Python is case-sensitive",
            "Only inside functions",
            "Only for numbers",
          ],
          answer: 1,
        },
        {
          question: "What does = mean in score = 10?",
          options: [
            "Assign the value 10 to score",
            "Check whether score equals 10",
            "Check whether score differs from 10",
            "Start a loop",
          ],
          answer: 0,
        },
        {
          question: "Which statement adds 2 to points?",
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

    `Number types
- int is a whole number such as 7 or -3.
- float is a number with a decimal point such as 2.5 or 10.0.

Arithmetic operators
+   addition          7 + 2 gives 9
-   subtraction       7 - 2 gives 5
*   multiplication    7 * 2 gives 14
/   division          7 / 2 gives 3.5
//  floor division    7 // 2 gives 3
%   remainder         7 % 2 gives 1
**  power             7 ** 2 gives 49

Important rules
- / always gives a float, even when the answer is whole: 10 / 2 gives 5.0.
- // divides and rounds the result down to a whole number.
- % gives what is left over after division. A number is even when number % 2 is 0.

Order of operations
Python calculates parentheses first, then **, then * / // %, then + and -. Use parentheses to make your intention clear: (2 + 3) * 4 is 20, but 2 + 3 * 4 is 14.

Common mistakes
- Expecting 10 / 2 to print 5 instead of 5.0.
- Confusing / (true division) with // (floor division).
- Forgetting parentheses when the order matters.`,

    `a = 12
b = 5
print(a + b)
print(a / b)
print(a // b)
print(a % b)
print(2 ** 3)`,

    "17\n2.4\n2\n2\n8",

    "Which operator calculates a remainder?",

    ["//", "*", "%", "/"],

    2,

    "It is the percent symbol.",

    {
      videoUrl: "/videos/Numbers%20and%20Calculations.html",
      videoTitle: "Videos — Video",

      instructions: `Task: Build a small bill calculator.

Steps:
1. Calculate total as price * quantity
2. Print total
3. Print the remainder when total is divided by 5
4. Print the whole-number result of total divided by 5 (floor division)

Expected output:
36
1
7`,

      starterCode: `price = 12
quantity = 3

# Step 1: calculate total
# TODO

# Step 2: print total
# TODO

# Step 3: print total % 5
# TODO

# Step 4: print total // 5
# TODO
`,

      solutionCode: `price = 12
quantity = 3
total = price * quantity
print(total)
print(total % 5)
print(total // 5)`,

      expectedResult: "36\n1\n7",

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
          question: "Which expression calculates 2 to the power of 4?",
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

    `What is a string?
A string (type str) is a sequence of characters used to store text. Write it inside matching single or double quotation marks: "Python" or 'Python'.

Joining and repeating
- Concatenation with +: "Hello" + " " + "World" gives "Hello World"
- Repetition with *: "ab" * 3 gives "ababab"
Both sides of + must be strings. "Age: " + 20 raises a TypeError.

Length
len(text) returns the number of characters, including spaces and punctuation. len("Hi there") is 8.

f-strings
An f-string puts values inside text. Place the letter f before the opening quote and write variables or expressions inside curly braces.
Syntax: f"Hello {name}"
Example: with age = 19, f"Next year: {age + 1}" gives "Next year: 20".

Strings are immutable
A string cannot be changed in place. Any operation on a string produces a new string.

Common mistakes
- Joining text and a number with + instead of converting the number or using an f-string.
- Forgetting the f before an f-string, which prints the braces literally.
- Mixing quote types, such as "Hello'.`,

    `first = "Hello"
second = "Python"
greeting = first + " " + second
print(greeting)
print(len(greeting))
print(f"Welcome to {second}!")`,

    "Hello Python\n12\nWelcome to Python!",

    "Which value is a string?",

    ["25", "3.14", '"EVOLV"', "True"],

    2,

    "Text is enclosed in matching quotation marks.",

    { videoUrl: "/videos/Strings.html",
      videoTitle: "Strings — Video",
      instructions: `Task: Build and measure a sentence from two variables.

Steps:
1. Create greeting using an f-string: "EVO is learning Python."
2. Print greeting
3. Print the length of greeting
4. Print name and language joined with a space using +

Expected output:
EVO is learning Python.
23
EVO Python`,

      starterCode: `name = "EVO"
language = "Python"

# Step 1: create greeting with an f-string
# TODO

# Step 2: print greeting
# TODO

# Step 3: print the length of greeting
# TODO

# Step 4: print name + " " + language
# TODO
`,

      solutionCode: `name = "EVO"
language = "Python"
greeting = f"{name} is learning {language}."
print(greeting)
print(len(greeting))
print(name + " " + language)`,

      expectedResult: "EVO is learning Python.\n23\nEVO Python",

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
          question: 'What does "ab" * 3 produce?',
          options: ["ab3", "ababab", "aabbbb", "An error"],
          answer: 1,
        },
        {
          question: "What does string immutability mean?",
          options: [
            "A string cannot be changed in place",
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

    `What input() does
input() shows an optional message (the prompt), pauses the program, and waits for the user to type a line and press Enter. The text typed is returned to your program.
Syntax: variable = input("Prompt: ")

Input is always a string
Even when the user types digits, input() returns text. "19" is a string, not the number 19. To calculate with it you must convert it.
- int(text) converts to a whole number
- float(text) converts to a decimal number
A common pattern is to wrap the conversion around input: age = int(input("Age: "))

Invalid input
If the text cannot be converted, for example int("hello"), Python raises a ValueError. Later lessons show how to handle this with try and except.

Where input() works
input() needs an environment that allows typing, such as a terminal or an editor with an input box.

Common mistakes
- Adding two input() results with + and getting joined text ("2" + "3" is "23") instead of a sum.
- Forgetting to convert before comparing or calculating.
- Using a prompt without a space at the end, so the typed text touches the prompt.`,

    `name = input("Name: ")
print(f"Hello, {name}!")
age = int(input("Age: "))
print(age + 1)`,

    "The program greets the entered name and prints the entered age plus one.",

    "What type does input() return by default?",

    ["int", "float", "str", "bool"],

    2,

    "Keyboard input initially arrives as text.",

    {
      type: "hands-on",
      videoUrl: "/videos/User%20Input.html",
      videoTitle: "User Input — Video",
      instructions: `Task: Ask for a name and an age, then greet the user and calculate their age next year.

Steps:
1. Read the name with input("Name: ")
2. Read the age as text with input("Age: ")
3. Convert the age text to an integer with int()
4. Print a greeting using an f-string
5. Print the age next year in a sentence

Sample run (inputs EVO and 19):
Hello, EVO!
Next year you will be 20.`,

      starterCode: `name = input("Name: ")
age_text = input("Age: ")

# Step 3: convert age_text to an integer
# TODO

# Step 4: print the greeting
# TODO

# Step 5: print the age next year
# TODO
`,

      solutionCode: `name = input("Name: ")
age_text = input("Age: ")
age = int(age_text)
print(f"Hello, {name}!")
print(f"Next year you will be {age + 1}.")`,

      validation: "manual",

      expectedResult:
        "Hello, EVO!\nNext year you will be 20. (when the inputs are EVO and 19)",

      quizQuestions: [
        {
          question: "If the user types 19, what does input() return?",
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
            "It returns zero",
            "It returns hello",
            "It raises ValueError",
            "It returns True",
          ],
          answer: 2,
        },
        {
          question: 'If a user enters 2 and then 3, what is a + b when both come straight from input()?',
          options: ["5", '"23"', "6", "An error"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    7,
    "Converting Data Types",
    "Python Meadow",
    "Convert values and inspect their types.",

    `Data types
Every value has a type.
- str: text, such as "hello"
- int: whole numbers, such as 5
- float: decimal numbers, such as 2.5
- bool: True or False

Type conversion
Conversion functions create a new value of a different type.
- int(x): to a whole number. int(3.9) gives 3 because the decimal part is removed, not rounded. int("12") gives 12.
- float(x): to a decimal number. float("2.5") gives 2.5.
- str(x): to text. str(25) gives "25".
- bool(x): to True or False. bool(0) is False and bool(5) is True.

When conversion fails
A conversion raises ValueError if the value is unsuitable. int("abc") fails, and int("3.5") also fails because the text contains a decimal point. Use int(float("3.5")) in that case.

Checking a type
type(value) reports the type. type(value).__name__ gives a short name such as int or str.

Why conversion matters
Python will not mix some types automatically. "Total: " + 10 is a TypeError, but "Total: " + str(10) works.

Common mistakes
- Expecting int() to round: int(2.9) is 2.
- Converting text that contains letters or spaces inside the number.
- Forgetting that input() returns text.`,

    `age = int("19")
price = float("3.5")
print(age + 1)
print(price * 2)
print(type(age).__name__)`,

    "20\n7.0\nint",

    "Which function converts suitable text to an integer?",

    ["str()", "int()", "input()", "type()"],

    1,

    "Its name is short for integer.",

    {
      instructions: `Task: Convert text values into numbers, calculate a total, and display the types.

Steps:
1. Convert quantity_text to an integer called quantity
2. Convert price_text to a float called price
3. Print quantity * price
4. Print the type name of quantity, then of price
5. Print the text Total: followed by the product converted with str() and joined using +

Expected output:
10.0
int
float
Total: 10.0`,

      starterCode: `quantity_text = "4"
price_text = "2.5"

# Step 1: convert quantity_text to int
# TODO

# Step 2: convert price_text to float
# TODO

# Step 3: print quantity * price
# TODO

# Step 4: print the type names
# TODO

# Step 5: print "Total: " + str(quantity * price)
# TODO
`,

      solutionCode: `quantity_text = "4"
price_text = "2.5"
quantity = int(quantity_text)
price = float(price_text)
print(quantity * price)
print(type(quantity).__name__)
print(type(price).__name__)
print("Total: " + str(quantity * price))`,

      expectedResult: "10.0\nint\nfloat\nTotal: 10.0",

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
          question: "What is int(3.9)?",
          options: ["4", "3", "3.9", "An error"],
          answer: 1,
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
          question: "Which expression gets the short type name of value?",
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

    `What is a Boolean?
A Boolean (type bool) has only two possible values: True and False. Both must start with a capital letter. true and FALSE are not valid.

Where Booleans come from
Comparisons produce Booleans. 5 > 8 gives False, and 5 < 8 gives True.

Storing a Boolean
Booleans are often stored in variables that describe a state or a yes/no fact. Names such as is_ready, has_ticket, or is_logged_in make the meaning clear.

Combining Booleans
- and: True only when both sides are True
- or: True when at least one side is True
- not: reverses the value, so not True is False

Text is not a Boolean
"True" in quotes is a string, not the Boolean True. They behave differently: type("True") is str.

Why Booleans matter
Conditions in if statements and loops are evaluated as True or False, so Booleans are the base of decision making.

Common mistakes
- Writing true or false in lowercase.
- Putting quotes around True or False.
- Using = instead of == when comparing.`,

    `is_ready = True
has_ticket = False
print(is_ready)
print(5 > 8)
print(type("True").__name__)`,

    "True\nFalse\nstr",

    "Which is a valid Boolean literal?",

    ["true", "FALSE", "True", "yes"],

    2,

    "The first letter is uppercase.",

    {
      instructions: `Task: Create Boolean variables and combine them with logical operators.

Steps:
1. Print is_registered
2. Print has_completed_lesson
3. Print is_registered and has_completed_lesson
4. Print is_registered or has_completed_lesson
5. Print not has_completed_lesson

Expected output:
True
False
False
True
True`,

      starterCode: `is_registered = True
has_completed_lesson = False

# Step 1 and 2: print both variables
# TODO

# Step 3: print the result of and
# TODO

# Step 4: print the result of or
# TODO

# Step 5: print the result of not
# TODO
`,

      solutionCode: `is_registered = True
has_completed_lesson = False
print(is_registered)
print(has_completed_lesson)
print(is_registered and has_completed_lesson)
print(is_registered or has_completed_lesson)
print(not has_completed_lesson)`,

      expectedResult: "True\nFalse\nFalse\nTrue\nTrue",

      quizQuestions: [
        {
          question: "Which two values are the Python Boolean literals?",
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
          question: 'What is the type of "True" (with quotation marks)?',
          options: ["bool", "int", "str", "float"],
          answer: 2,
        },
        {
          question: "What does bool(0) return?",
          options: ["True", "False", "0", "None"],
          answer: 1,
        },
        {
          question: "What is True and False?",
          options: ["True", "False", "None", "An error"],
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

    `What are comparison operators?
Comparison operators compare two values and produce a Boolean result, True or False.

The operators
==  equal to                 5 == 5 is True
!=  not equal to             5 != 3 is True
>   greater than             5 > 8 is False
<   less than                5 < 8 is True
>=  greater than or equal    5 >= 5 is True
<=  less than or equal       5 <= 4 is False

= and == are different
- = assigns a value: score = 50
- == compares two values: score == 50
Mixing them up is one of the most common beginner mistakes.

Boundary values
>= includes the value itself and > does not. For score = 50, score >= 50 is True but score > 50 is False. Always check the boundary when writing a condition.

Comparing text
Strings can be compared too. "cat" == "cat" is True. Comparison is case-sensitive, so "Cat" == "cat" is False.

Using the result
A comparison can be stored in a variable or used directly as a condition in an if statement.

Common mistakes
- Writing = where == is needed.
- Choosing > when the rule says "at least" (it needs >=).
- Comparing a number with text, such as 5 == "5", which is False.`,

    `score = 82
print(score >= 50)
print(score == 100)
print(score != 0)`,

    "True\nFalse\nTrue",

    "Which operator checks whether two values are equal?",

    ["=", "==", "!=", ">"],

    1,

    "Equality checking uses two equals signs.",

    {
      instructions: `Task: Test one score against several rules, including the boundary value 50.

Steps:
1. Print whether score is at least 50
2. Print whether score is greater than 50
3. Print whether score equals 100
4. Print whether score differs from 0

Expected output:
True
False
False
True`,

      starterCode: `score = 50

# Step 1: score is at least 50
# TODO

# Step 2: score is greater than 50
# TODO

# Step 3: score equals 100
# TODO

# Step 4: score differs from 0
# TODO
`,

      solutionCode: `score = 50
print(score >= 50)
print(score > 50)
print(score == 100)
print(score != 0)`,

      expectedResult: "True\nFalse\nFalse\nTrue",

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
            "= assigns a value; == compares values",
            "They are identical",
            "= compares values; == assigns a value",
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

    `Checkpoint summary
This checkpoint reviews the key ideas of the Python Meadow.

Output and variables
- print() displays values and calculated results.
- A variable is a name that refers to a value. = assigns, == compares.
- A variable's value changes whenever it is reassigned.

Numbers and strings
- Arithmetic operators: + - * / // % **
- / always gives a float, // rounds down, % gives the remainder.
- Strings are text. Join them with +, repeat with *, and format them with f-strings.

Input and conversion
- input() always returns a string.
- Use int() or float() before doing arithmetic with typed input.

Booleans and comparisons
- A Boolean is True or False.
- Comparison operators (==, !=, >, <, >=, <=) produce Booleans.

How to predict output
Follow the program one statement at a time and keep track of the current value of every variable. Write the values down as they change.`,

    `name = "EVO"
points = 5
points = points + 3
passed = points >= 8
print(name, points)
print(passed)`,

    "EVO 8\nTrue",

    "What does print(2 + 3) display?",

    ["23", "5", "2 + 3", "An error"],

    1,

    "The plus operator adds numbers.",

    {
      videoUrl: "/videos/Meadow%20Checkpoint.html",
      videoTitle: "Meadow Checkpoint Video",
      type: "quiz",

      instructions: `Task: Build a mini score tracker that uses variables, arithmetic, and a comparison.

Steps:
1. Create name = "EVO" and points = 5
2. Add 3 to points
3. Create passed that stores whether points is at least 8
4. Print name and points on one line
5. Print passed
6. Print points divided by 2

Expected output:
EVO 8
True
4.0`,

      starterCode: `name = "EVO"
points = 5

# Step 2: add 3 to points
# TODO

# Step 3: create passed (points >= 8)
# TODO

# Step 4: print name and points
# TODO

# Step 5: print passed
# TODO

# Step 6: print points / 2
# TODO
`,

      solutionCode: `name = "EVO"
points = 5
points = points + 3
passed = points >= 8
print(name, points)
print(passed)
print(points / 2)`,

      expectedResult: "EVO 8\nTrue\n4.0",

      quizQuestions: [
        {
          question: "Which operator assigns a value to a variable?",
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

    `What is a conditional statement?
A conditional statement lets a program choose whether to run some code. An if statement checks a condition, which is an expression that is either True or False.

Syntax
if condition:
    statement(s)

How it works
- If the condition is True, the indented block runs.
- If the condition is False, Python skips the block and continues with the next unindented statement.

Rules
- The if line must end with a colon (:).
- Every statement inside the block must be indented, usually with four spaces.
- All lines in the same block must use the same indentation.
- Unindented statements are not part of the block and always run.

Several separate if statements
Each if is checked independently. If two conditions are both True, both blocks run.

Common mistakes
- Forgetting the colon at the end of the if line.
- Inconsistent indentation, which causes an IndentationError.
- Using = instead of == in the condition.`,

    `temperature = 30
if temperature > 25:
    print("It is warm")
print("Weather check complete")`,

    "It is warm\nWeather check complete",

    "Which keyword begins a conditional statement?",

    ["when", "if", "check", "case"],

    1,

    "It is a two-letter keyword.",

    {
      videoUrl: "/videos/if%20condition.html",
      videoTitle: "Making Decisions with if — Video",

      instructions: `Task: Write two separate if statements that react to the temperature.

Steps:
1. Use temperature = 18
2. If temperature is greater than 25, print It is warm
3. If temperature is less than 20, print Bring a jacket
4. After both checks (not indented), print Weather check complete

Expected output:
Bring a jacket
Weather check complete`,

      starterCode: `temperature = 18

# Step 2: if temperature > 25, print "It is warm"
# TODO

# Step 3: if temperature < 20, print "Bring a jacket"
# TODO

# Step 4: print "Weather check complete" (no indentation)
# TODO
`,

      solutionCode: `temperature = 18

if temperature > 25:
    print("It is warm")

if temperature < 20:
    print("Bring a jacket")

print("Weather check complete")`,

      expectedResult: "Bring a jacket\nWeather check complete",

      quizQuestions: [
        {
          question: "When does an if block execute?",
          options: [
            "When its condition is True",
            "Every time the program runs",
            "Only inside a function",
            "Only after a loop",
          ],
          answer: 0,
        },
        {
          question: "What punctuation must end an if line?",
          options: [".", ":", ";", ","],
          answer: 1,
        },
        {
          question: "What does indentation show in an if statement?",
          options: [
            "Which statements belong to the block",
            "The variable type",
            "The file extension",
            "The module name",
          ],
          answer: 0,
        },
        {
          question: "If temperature is 20, is temperature > 25 True?",
          options: ["Yes", "No", "Only for strings", "It causes an error"],
          answer: 1,
        },
        {
          question:
            "What happens when an if condition is False and there is no else?",
          options: [
            "Its block is skipped",
            "The program must crash",
            "The condition becomes True",
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

    `What is if/else?
An if/else statement chooses exactly one of two paths.

Syntax
if condition:
    statements when the condition is True
else:
    statements when the condition is False

How it works
1. Python checks the if condition.
2. If it is True, the if block runs and the else block is skipped.
3. If it is False, the else block runs.
Exactly one of the two blocks always runs.

Rules
- else has no condition. It covers everything the if condition did not.
- Both the if line and the else line end with a colon.
- Both blocks must be indented.
- else must line up with its matching if.

Choosing the boundary
With score >= 50 the value 50 passes. With score > 50 the value 50 goes to else. Choose the operator that matches the rule.

Common mistakes
- Writing else score < 50: (else never takes a condition).
- Forgetting the colon after else.
- Placing else at a different indentation from if.`,

    `age = 16
if age >= 18:
    print("Adult")
else:
    print("Minor")`,

    "Minor",

    "When does the else block run?",

    ["Always", "When the if condition is False", "Before the if block", "Only in loops"],

    1,

    "It handles the alternative path.",

    {
      type: "hands-on",
      videoUrl: "/videos/ifelse%20condition.html",
      videoTitle: "Python if and else — Video",

      instructions: `Task: Write a pass/fail checker.

Steps:
1. Use score = 49
2. If score is at least 50, print Pass
3. Otherwise print Try again
4. After the if/else, print Score checked
5. Change score to 50 and run again. Notice the result changes to Pass.

Expected output for score = 49:
Try again
Score checked`,

      starterCode: `score = 49

# Step 2 and 3: add if / else
# TODO

# Step 4: print "Score checked" (no indentation)
# TODO
`,

      solutionCode: `score = 49

if score >= 50:
    print("Pass")
else:
    print("Try again")

print("Score checked")`,

      expectedResult: "Try again\nScore checked",

      quizQuestions: [
        {
          question: "If age is 20, what does the example print?",
          options: ["Adult", "Minor", "Both", "Nothing"],
          answer: 0,
        },
        {
          question: "What does the else block represent?",
          options: [
            "The alternative path",
            "A loop",
            "A variable",
            "A function return",
          ],
          answer: 0,
        },
        {
          question: "Which values does score >= 50 include?",
          options: [
            "Only values greater than 50",
            "50 and values greater than 50",
            "Only values below 50",
            "Only zero",
          ],
          answer: 1,
        },
        {
          question: "How many branches of an if/else statement run?",
          options: ["Neither", "Both", "Exactly one", "Always three"],
          answer: 2,
        },
        {
          question: "Which line is invalid Python?",
          options: ["else:", "else score < 50:", "if score < 50:", "print('x')"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    13,
    "elif Conditions",
    "Logic Forest",
    "Select among several outcomes using ordered conditions.",

    `What is elif?
elif is short for "else if". It adds another condition to a decision chain so a program can choose among more than two outcomes.

Syntax
if condition1:
    ...
elif condition2:
    ...
elif condition3:
    ...
else:
    ...

How it works
- Python checks the conditions from top to bottom.
- It runs only the first block whose condition is True.
- All remaining branches are skipped, even if their conditions are also True.
- The final else is optional and runs when no earlier condition matched.

Order matters
Place the most specific or highest threshold first. If score >= 50 is written before score >= 90, a score of 95 would match the first branch and never reach the second.

elif or separate if?
- Use if/elif/else when only one outcome should happen (for example, one grade).
- Use separate if statements when several outcomes can happen together.

Common mistakes
- Writing conditions in the wrong order.
- Forgetting the colon after elif.
- Using else if (two words), which is invalid in Python.`,

    `score = 75
if score >= 90:
    print("A")
elif score >= 70:
    print("B")
else:
    print("C")`,

    "B",

    "What does elif allow you to do?",

    ["Repeat a loop", "Check another condition", "Create a variable", "Read a file"],

    1,

    "It adds another conditional branch.",

    {
      videoUrl: "/videos/elif%20condition.html",
      videoTitle: "Python elif — Video",

      instructions: `Task: Build a grade program with four outcomes.

Rules:
- 90 or more: A
- 70 to 89: B
- 50 to 69: C
- below 50: Fail

Steps:
1. Use score = 65
2. Write an if for A, an elif for B, an elif for C, and an else for Fail
3. Test the boundaries 90, 70, 50 and 49 by changing score

Expected output for score = 65:
C`,

      starterCode: `score = 65

# Write the if / elif / elif / else chain
# TODO
`,

      solutionCode: `score = 65

if score >= 90:
    print("A")
elif score >= 70:
    print("B")
elif score >= 50:
    print("C")
else:
    print("Fail")`,

      expectedResult: "C",

      quizQuestions: [
        {
          question: "Which keyword is checked after a False if condition?",
          options: ["elif", "class", "return", "import"],
          answer: 0,
        },
        {
          question: "In the grade chain, what is printed for a score of 95?",
          options: ["A", "B", "C", "Fail"],
          answer: 0,
        },
        {
          question: "In the example (score = 75), what is printed?",
          options: ["A", "B", "C", "Nothing"],
          answer: 1,
        },
        {
          question: "When does the else branch run?",
          options: [
            "When no earlier condition matched",
            "Before the if",
            "After every matching branch",
            "Only inside a loop",
          ],
          answer: 0,
        },
        {
          question: "Why does the order of conditions matter?",
          options: [
            "The first matching branch runs and the rest are skipped",
            "Python sorts the conditions",
            "All branches always run",
            "The last condition is always True",
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

    `What are logical operators?
Logical operators combine or reverse Boolean conditions so one condition can express a rule with several parts.

The operators
- and: True only when both sides are True
- or: True when at least one side is True
- not: reverses a value

Truth tables
True and True   gives True
True and False  gives False
False and False gives False

True or False   gives True
False or False  gives False

not True        gives False
not False       gives True

Example rule
To enter, a person must be at least 18 and have an ID: age >= 18 and has_id

Order of evaluation
Python evaluates not first, then and, then or. Use parentheses to make the grouping obvious: (a or b) and c.

Short-circuiting
With and, if the left side is False, Python does not check the right side. With or, if the left side is True, the right side is not checked.

Common mistakes
- Writing x > 5 and < 10. Each side must be a full condition: x > 5 and x < 10.
- Mixing up and and or.
- Forgetting parentheses in a long expression.`,

    `age = 20
has_id = True
print(age >= 18 and has_id)
print(age < 18 or not has_id)`,

    "True\nFalse",

    "When is A and B True?",

    ["When either is True", "When both are True", "When both are False", "Always"],

    1,

    "and requires both conditions.",

    {
      videoUrl: "/videos/logical%20operators.html",
      videoTitle: "Logical Operators — Video",

      instructions: `Task: Create a login rule using logical operators.

Steps:
1. Create correct_password = True and account_active = False
2. Create can_login that is True only when both are True, and print it
3. Print whether at least one of the two values is True
4. Print the reverse of account_active

Expected output:
False
True
True`,

      starterCode: `correct_password = True
account_active = False

# Step 2: create can_login with and, then print it
# TODO

# Step 3: print correct_password or account_active
# TODO

# Step 4: print not account_active
# TODO
`,

      solutionCode: `correct_password = True
account_active = False

can_login = correct_password and account_active
print(can_login)
print(correct_password or account_active)
print(not account_active)`,

      expectedResult: "False\nTrue\nTrue",

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
          options: ["True", "False", "1", "None"],
          answer: 1,
        },
        {
          question: "Which operator requires both conditions to be True?",
          options: ["or", "and", "not", "in"],
          answer: 1,
        },
        {
          question: "Which is the correct way to test that x is between 5 and 10?",
          options: [
            "x > 5 and < 10",
            "x > 5 and x < 10",
            "5 < and x < 10",
            "x > 5 or < 10",
          ],
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

    `What is a nested conditional?
A nested conditional is an if statement placed inside the block of another if or else.

Syntax
if outer_condition:
    if inner_condition:
        statements
    else:
        statements
else:
    statements

How it works
- The outer condition is checked first.
- The inner condition is checked only if the outer block runs.
- Each extra level is indented one more step. Indentation shows which condition owns each statement.

When to use it
Use nesting when the second question only makes sense after the first answer. For example, check that a user is logged in before checking whether they are an admin.

Keeping code readable
Deep nesting is hard to read. You can often simplify it:
- Combine related conditions with and: if logged_in and is_admin:
- Use an elif chain when the outcomes are mutually exclusive.

Common mistakes
- Misaligned indentation, so an else attaches to the wrong if.
- Nesting more levels than necessary.
- Forgetting a colon on an inner if or else.`,

    `logged_in = True
is_admin = False
if logged_in:
    if is_admin:
        print("Admin")
    else:
        print("Member")
else:
    print("Please log in")`,

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

      instructions: `Task: Decide what message to show using a nested condition.

Steps:
1. Create logged_in = True and lesson_completed = False
2. Check logged_in first
3. Inside that block, check lesson_completed. Print Ready for the next lesson if True, otherwise print Finish your lesson
4. If the user is not logged in, print Please log in

Expected output:
Finish your lesson`,

      starterCode: `logged_in = True
lesson_completed = False

# Step 2: check logged_in
# Step 3: inside it, check lesson_completed
# Step 4: else print "Please log in"
# TODO
`,

      solutionCode: `logged_in = True
lesson_completed = False

if logged_in:
    if lesson_completed:
        print("Ready for the next lesson")
    else:
        print("Finish your lesson")
else:
    print("Please log in")`,

      expectedResult: "Finish your lesson",

      quizQuestions: [
        {
          question: "What is a nested conditional?",
          options: [
            "An if statement inside another block",
            "A loop with no body",
            "A string comparison",
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
          question: "Which variable controls the outer decision in the example?",
          options: ["is_admin", "logged_in", "print", "else"],
          answer: 1,
        },
        {
          question: "What does indentation show in nested code?",
          options: [
            "Which block each statement belongs to",
            "The number's type",
            "The file extension",
            "The string length",
          ],
          answer: 0,
        },
        {
          question: "Which condition is equivalent to a nested check of logged_in then is_admin?",
          options: [
            "logged_in or is_admin",
            "logged_in and is_admin",
            "not logged_in",
            "logged_in == is_admin",
          ],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    16,
    "Membership Operators",
    "Logic Forest",
    "Check whether a value exists inside a sequence.",

    `What are membership operators?
Membership operators test whether a value appears inside a string or a collection. They return True or False.
- in: True when the value is found
- not in: True when the value is not found

How they work on different types
- Strings: checks for a substring. "Py" in "Python" is True.
- Lists, tuples, sets: checks whether an equal element exists. 3 in [1, 2, 3] is True.
- Dictionaries: checks the keys, not the values.

Case sensitivity
Membership tests are case-sensitive. "py" in "Python" is False because the letters differ in case.

Using membership in conditions
if "SQL" not in courses:
    print("SQL is not available")

Common use cases
- Checking that a course or item is available
- Testing whether a character is a vowel: letter in "aeiou"
- Validating that a choice is one of the allowed options

Common mistakes
- Forgetting that the check is case-sensitive.
- Using == to test for a substring.
- Expecting in to search dictionary values.`,

    `language = "Python"
print("Py" in language)
print("Java" in language)
print("on" not in language)`,

    "True\nFalse\nFalse",

    "Which operator checks membership?",

    ["has", "in", "contains", "belongs"],

    1,

    "It is an ordinary English word.",

    {
      videoUrl: "/videos/Membership%20Operators.html",
      videoTitle: "Membership Operators — Video",

      instructions: `Task: Check a list of courses and a piece of text using membership operators.

Steps:
1. Use courses = ["Python", "HTML", "JavaScript"]
2. Print whether "Python" is in courses
3. Print whether "Java" is in courses
4. Print whether "SQL" is not in courses
5. Print whether "Py" is in the string "Python"

Expected output:
True
False
True
True`,

      starterCode: `courses = ["Python", "HTML", "JavaScript"]

# Step 2: "Python" in courses
# TODO

# Step 3: "Java" in courses
# TODO

# Step 4: "SQL" not in courses
# TODO

# Step 5: "Py" in "Python"
# TODO
`,

      solutionCode: `courses = ["Python", "HTML", "JavaScript"]
print("Python" in courses)
print("Java" in courses)
print("SQL" not in courses)
print("Py" in "Python")`,

      expectedResult: "True\nFalse\nTrue\nTrue",

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
          question: "Which operator checks that a value is absent?",
          options: ["is", "not in", "contains", "equals"],
          answer: 1,
        },
        {
          question: "What does 3 in [1, 2, 3] return?",
          options: ["True", "False", "3", "An error"],
          answer: 0,
        },
        {
          question: 'What is "py" in "Python"?',
          options: [
            "True",
            "False, because membership is case-sensitive",
            "An error",
            "None",
          ],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    17,
    "Conditional Expressions",
    "Logic Forest",
    "Choose one of two values using a compact conditional expression.",

    `What is a conditional expression?
A conditional expression (also called a ternary expression) chooses one of two values in a single line.

Syntax
value_if_true if condition else value_if_false

How it works
Python evaluates the condition first. If it is True, the expression produces value_if_true. Otherwise it produces value_if_false. Only the chosen value is used.

Example
status = "Adult" if age >= 18 else "Minor"
This is the same as:
if age >= 18:
    status = "Adult"
else:
    status = "Minor"

It is an expression
Because it produces a value, it can be assigned to a variable, printed directly, or used inside another expression.

When to use it
- Good for simple choices such as assigning a label.
- Use a regular if/else statement when a branch needs several statements or when the line becomes hard to read.

Common mistakes
- Writing the parts in the wrong order. The value comes first, then if, then the condition, then else.
- Forgetting the else part. It is required.
- Chaining many conditions on one line, which makes code unreadable.`,

    `age = 20
status = "Adult" if age >= 18 else "Minor"
print(status)`,

    "Adult",

    "Which keyword introduces the alternative value in a conditional expression?",

    ["elif", "else", "then", "switch"],

    1,

    "It introduces the alternative branch.",

    {
      videoUrl: "/videos/Conditional%20Expressions.html",
      videoTitle: "Conditional Expressions — Video",

      instructions: `Task: Use conditional expressions to create labels.

Steps:
1. Use score = 65
2. Create status that is "Pass" when score >= 50, otherwise "Fail"
3. Print status
4. Use number = 7
5. Create parity that is "Even" when number % 2 == 0, otherwise "Odd"
6. Print parity

Expected output:
Pass
Odd`,

      starterCode: `score = 65

# Step 2: create status with a conditional expression
# TODO

# Step 3: print status
# TODO

number = 7

# Step 5: create parity with a conditional expression
# TODO

# Step 6: print parity
# TODO
`,

      solutionCode: `score = 65
status = "Pass" if score >= 50 else "Fail"
print(status)

number = 7
parity = "Even" if number % 2 == 0 else "Odd"
print(parity)`,

      expectedResult: "Pass\nOdd",

      quizQuestions: [
        {
          question: "Which line is a valid conditional expression?",
          options: [
            '"Pass" if score >= 50 else "Fail"',
            "if score >= 50 then Pass",
            "score >= 50 ? Pass : Fail",
            "else score >= 50",
          ],
          answer: 0,
        },
        {
          question: 'What is status after status = "Pass" if score >= 50 else "Fail" when score is 65?',
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
            "When a branch needs several statements",
            "Never",
            "Only for strings",
            "Only inside lists",
          ],
          answer: 0,
        },
        {
          question: "How many alternative values does a conditional expression choose between?",
          options: ["One", "Two", "Three", "Any number"],
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

    `What is truthiness?
In a condition, Python does not require a Boolean. Any value can be tested, and Python treats it as truthy (acts like True) or falsy (acts like False).

Falsy values
- False
- None
- The number zero: 0 and 0.0
- Empty text and empty collections: "", [], (), {}, set()

Truthy values
Almost everything else is truthy, including non-zero numbers, non-empty strings, and non-empty collections.
Note: "0" is a non-empty string, and [0] is a non-empty list, so both are truthy.

Checking how Python sees a value
bool(value) returns the Boolean Python would use.
bool([]) is False
bool([0]) is True
bool("hello") is True

Using truthiness in code
if name:            runs when name is not empty
if not items:       runs when items is empty

When to be explicit
If the rule is specific, write it out. For example, use if count > 0 instead of if count when the meaning could be unclear.

Common mistakes
- Assuming "0" or "False" (as text) is falsy.
- Treating an empty list and a list containing 0 as the same.
- Using truthiness when the exact value matters.`,

    `name = "Python"
items = []
if name:
    print("Name supplied")
if not items:
    print("No items yet")`,

    "Name supplied\nNo items yet",

    "Which value is falsy?",

    ['"hello"', "5", "[]", "[1]"],

    2,

    "An empty list is falsy.",

    {
      videoUrl: "/videos/Python%20Truthiness.html",
      videoTitle: "Python Truthiness — Video",

      instructions: `Task: Test how Python treats empty and non-empty values.

Steps:
1. Create name = "" and items = []
2. Print bool(name) and bool(items)
3. Reassign name = "EVO" and items = ["Python"]
4. Print bool(name) and bool(items) again

Expected output:
False
False
True
True`,

      starterCode: `name = ""
items = []

# Step 2: print bool(name) and bool(items)
# TODO

# Step 3: give both variables values
# TODO

# Step 4: print bool(name) and bool(items) again
# TODO
`,

      solutionCode: `name = ""
items = []
print(bool(name))
print(bool(items))

name = "EVO"
items = ["Python"]
print(bool(name))
print(bool(items))`,

      expectedResult: "False\nFalse\nTrue\nTrue",

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
          question: "Which numeric value is falsy?",
          options: ["1", "-2", "0", "3"],
          answer: 2,
        },
        {
          question: "What is bool([0])?",
          options: ["True", "False", "0", "None"],
          answer: 0,
        },
        {
          question: "Which condition runs its block when items is empty?",
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

    `Choosing the right operator
Reading a rule carefully tells you which operator to use.
- "at least 50" means >= 50
- "more than 50" means > 50
- "at most 28" means <= 28
- "below 18" means < 18

Ranges must not overlap or leave gaps
When a value must fall into one of several ranges, every possible value should belong to exactly one range.
Example for temperature:
- below 18 is Cool
- 18 up to and including 28 is Comfortable
- above 28 is Hot

Using an if/elif/else chain
Each branch is reached only if the earlier ones were False, so later conditions can rely on that.
if temperature < 18:
    ...
elif temperature <= 28:
    ...
else:
    ...
The elif does not need to repeat temperature >= 18, because that is already known.

Boundary values
Boundary values are the values exactly at a threshold, such as 17, 18, 28, and 29 here. Mistakes usually happen at these points, so always test them.

Common mistakes
- Using > when the rule includes the boundary.
- Leaving a gap, so some values match no branch.
- Overlapping ranges written as separate if statements.`,

    `temperature = 24
if temperature < 18:
    print("Cool")
elif temperature <= 28:
    print("Comfortable")
else:
    print("Hot")`,

    "Comfortable",

    "Which condition checks that a score is at least 50?",

    ["score > 50", "score >= 50", "score = 50", "score < 50"],

    1,

    "At least includes equality.",

    {
      videoUrl: "/videos/Decision%20Practise.html",
      videoTitle: "Decision Practice — Video",

      instructions: `Task: Build a temperature alert.

Rules:
- below 18: Cool
- 18 through 28: Comfortable
- above 28: Hot

Steps:
1. Use temperature = 18
2. Write an if/elif/else chain that prints the correct label
3. Test the boundary values 17, 18, 28 and 29 by changing temperature

Expected output for temperature = 18:
Comfortable`,

      starterCode: `temperature = 18

# Write the if / elif / else chain
# TODO
`,

      solutionCode: `temperature = 18

if temperature < 18:
    print("Cool")
elif temperature <= 28:
    print("Comfortable")
else:
    print("Hot")`,

      expectedResult: "Comfortable",

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
          question: "Why should you test values at a boundary?",
          options: [
            "To verify inclusive and exclusive comparisons",
            "To make Python run faster",
            "To create a variable",
            "To avoid writing conditions",
          ],
          answer: 0,
        },
        {
          question: "What does the example print for temperature 29?",
          options: ["Cool", "Comfortable", "Hot", "Nothing"],
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

    `Checkpoint summary
This checkpoint reviews the key ideas of the Logic Forest.

Decisions
- if runs a block when its condition is True.
- if/else chooses between two paths.
- elif adds more ordered branches. Only the first True branch runs.
- Nested conditionals place one if inside another block.
- A conditional expression chooses one of two values on one line.

Conditions
- Comparison operators: ==, !=, >, <, >=, <=
- and needs both sides True, or needs at least one, not reverses a value.
- in and not in test membership in strings and collections.

Truthiness
Falsy values are False, None, 0, 0.0, and empty strings and collections. Almost everything else is truthy.

How to follow a decision
Evaluate each condition in order, find the first one that is True, run only that block, then continue after the whole chain.`,

    `value = 12
if value % 2 == 0 and value > 10:
    print("Even and greater than ten")
else:
    print("Other value")`,

    "Even and greater than ten",

    "Which operator means logical AND?",

    ["or", "and", "not", "in"],

    1,

    "Both conditions must be True.",

    {
      videoUrl: "/videos/LogicalForest%20Checkpoint.html",
      videoTitle: "Logic Forest Checkpoint — Video",
      type: "quiz",

      instructions: `Task: Classify a number using logical operators and an if/elif/else chain.

Rules:
- even and greater than 10: Even and greater than ten
- even but 10 or less: Even
- otherwise: Odd

Steps:
1. Use value = 12
2. Write the chain using value % 2 == 0 and value > 10 for the first rule
3. Test the values 9, 10, 11 and 12

Expected output for value = 12:
Even and greater than ten`,

      starterCode: `value = 12

# Write the if / elif / else chain
# TODO
`,

      solutionCode: `value = 12

if value % 2 == 0 and value > 10:
    print("Even and greater than ten")
elif value % 2 == 0:
    print("Even")
else:
    print("Odd")`,

      expectedResult: "Even and greater than ten",

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
            "Both conditions True",
            "Either condition True",
            "Both conditions False",
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
          question: "Which value is falsy?",
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

    `What is a loop?
A loop repeats a block of code so you do not have to write the same instructions many times.
- The repeated block is called the loop body.
- Each repetition is called an iteration.

Why loops are useful
Printing a message five times by copying print() five times is slow and easy to get wrong. A loop does it with two lines, and changing the count is a single edit.

Two kinds of loop in Python
- for loop: repeats once for each item in a sequence, such as a list, a string, or range().
- while loop: repeats as long as a condition stays True.

Syntax of a for loop
for variable in sequence:
    loop body
Syntax of a while loop
while condition:
    loop body

Rules
- The loop header ends with a colon.
- The loop body is indented.
- Every loop needs a way to finish. A for loop ends when the sequence runs out. A while loop ends when its condition becomes False.

Common mistakes
- Forgetting the colon or the indentation.
- Writing a while loop that never ends.
- Expecting range(1, 4) to include 4.`,

    `for number in range(1, 4):
    print("Practice", number)`,

    "Practice 1\nPractice 2\nPractice 3",

    "What is the main purpose of a loop?",

    ["Store data", "Repeat instructions", "Define a class", "Import a module"],

    1,

    "It avoids repeating the same instruction manually.",

    { videoUrl: "/videos/Why%20Loops.html",
      videoTitle: "Why Loops? — Video",
      instructions: `Task: Use a loop to print a numbered practice reminder.

Steps:
1. Write a for loop that uses range(1, 6)
2. Inside the loop, print Practice followed by the loop number
3. After the loop (not indented), print Done

Expected output:
Practice 1
Practice 2
Practice 3
Practice 4
Practice 5
Done`,

      starterCode: `# Step 1 and 2: write the for loop
for number in range(1, 6):
    # TODO: print "Practice" and number
    pass

# Step 3: print "Done" after the loop
# TODO
`,

      solutionCode: `for number in range(1, 6):
    print("Practice", number)

print("Done")`,

      expectedResult:
        "Practice 1\nPractice 2\nPractice 3\nPractice 4\nPractice 5\nDone",

      quizQuestions: [
        {
          question: "What problem do loops help solve?",
          options: [
            "Repeating instructions",
            "Missing file extensions",
            "All syntax errors",
            "Type conversion",
          ],
          answer: 0,
        },
        {
          question: "How many times does a loop over range(1, 4) run?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "Which loop is commonly used to visit each item in a list?",
          options: ["for", "class", "import", "except"],
          answer: 0,
        },
        {
          question: "What must a while loop eventually achieve to stop?",
          options: [
            "Its condition must become False",
            "A new variable every time",
            "A file write",
            "A class definition",
          ],
          answer: 0,
        },
        {
          question: "What is the loop body?",
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

    `What is a for loop?
A for loop takes the items of a sequence one at a time, stores each in a loop variable, and runs the body once for each item.

Syntax
for variable in sequence:
    loop body

What you can loop over
Lists, strings, tuples, sets, dictionaries, and range() are all iterable, which means they can be used in a for loop.

How it works
1. The first item is stored in the loop variable.
2. The body runs.
3. The next item is stored and the body runs again.
4. When there are no more items, the loop ends.
The loop variable keeps its last value after the loop. If the sequence is empty, the body runs zero times.

Numbering items with enumerate()
enumerate() produces an index and an item together.
for index, item in enumerate(items, start=1):
    print(index, item)
start=1 makes the numbering begin at 1 instead of 0.

Common mistakes
- Forgetting the colon after the loop header.
- Changing a list while looping over it.
- Using the wrong variable name inside the body.`,

    `for fruit in ["apple", "mango", "grape"]:
    print(fruit)`,

    "apple\nmango\ngrape",

    "Which keyword creates this kind of loop?",

    ["repeat", "for", "each", "loop"],

    1,

    "It appears before the loop variable.",

    { videoUrl: "/videos/For%20Loops.html",
      videoTitle: "For Loop — Video",
      instructions: `Task: Loop through a list of subjects, first plainly and then with numbers.

Steps:
1. Use subjects = ["Maths", "Python", "DBMS"]
2. Write a for loop that prints each subject
3. Write a second loop using enumerate(subjects, start=1) that prints the number and the subject

Expected output:
Maths
Python
DBMS
1 Maths
2 Python
3 DBMS`,

      starterCode: `subjects = ["Maths", "Python", "DBMS"]

# Step 2: print each subject
# TODO

# Step 3: print numbered subjects using enumerate
# TODO
`,

      solutionCode: `subjects = ["Maths", "Python", "DBMS"]

for subject in subjects:
    print(subject)

for index, subject in enumerate(subjects, start=1):
    print(index, subject)`,

      expectedResult: "Maths\nPython\nDBMS\n1 Maths\n2 Python\n3 DBMS",

      quizQuestions: [
        {
          question: "What does a for loop take from a sequence each time it repeats?",
          options: [
            "One item",
            "Only the final item",
            "Only an integer",
            "A class definition",
          ],
          answer: 0,
        },
        {
          question: "How many times does the fruit loop in the example run?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "What is the value of fruit on the second iteration?",
          options: ["apple", "mango", "grape", "fruit"],
          answer: 1,
        },
        {
          question: "Which of these can a for loop iterate over?",
          options: ["A string", "A list", "A tuple", "All of these"],
          answer: 3,
        },
        {
          question: "What does enumerate() provide in each iteration?",
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

    `What is range()?
range() produces a sequence of whole numbers. It is the standard partner of the for loop when you need to repeat something a set number of times.

Three forms
range(stop)               starts at 0, ends before stop
range(start, stop)        starts at start, ends before stop
range(start, stop, step)  moves by step each time

The stop value is never included
- range(3) gives 0, 1, 2
- range(1, 4) gives 1, 2, 3
- range(2, 11, 2) gives 2, 4, 6, 8, 10
The number of values in range(start, stop) is stop minus start.

Counting backwards
Use a negative step. The start must be larger than the stop.
range(5, 0, -1) gives 5, 4, 3, 2, 1

Using it in a loop
for number in range(1, 4):
    print(number)

Good to know
range() creates numbers when they are needed instead of storing them all, so it is memory-efficient. To see the numbers as a list, use list(range(3)).

Common mistakes
- Expecting the stop value to be included.
- Using a positive step when counting down, which gives an empty range.
- Using a step of 0, which raises an error.`,

    `for number in range(1, 4):
    print(number)`,

    "1\n2\n3",

    "What values does range(3) generate?",

    ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],

    1,

    "The stop value is excluded.",

    { videoUrl: "/videos/For%20Loops.html",
      videoTitle: "For Loop — Video",
      instructions: `Task: Use the three forms of range() to print number sequences.

Steps:
1. Print the numbers from range(3)
2. Print the even numbers 2, 4, 6, 8, 10 using a step
3. Count down from 5 to 1 using a negative step

Expected output:
0
1
2
2
4
6
8
10
5
4
3
2
1`,

      starterCode: `# Step 1: print 0, 1, 2
# TODO

# Step 2: print 2, 4, 6, 8, 10
# TODO

# Step 3: print 5, 4, 3, 2, 1
# TODO
`,

      solutionCode: `for number in range(3):
    print(number)

for number in range(2, 11, 2):
    print(number)

for number in range(5, 0, -1):
    print(number)`,

      expectedResult: "0\n1\n2\n2\n4\n6\n8\n10\n5\n4\n3\n2\n1",

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
          options: ["5, 4, 3, 2, 1", "0, 1, 2, 3, 4", "5 only", "Nothing"],
          answer: 0,
        },
        {
          question: "How many values does range(1, 5) generate?",
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

    `What is a while loop?
A while loop repeats its body as long as its condition is True. It is useful when you do not know in advance how many repetitions are needed.

Syntax
while condition:
    loop body

How it works
1. Python checks the condition.
2. If it is True, the body runs, and Python checks the condition again.
3. If it is False, the loop ends and the program continues after it.
If the condition is False the very first time, the body never runs.

The three parts of a safe while loop
1. A starting state: count = 1
2. A condition: while count <= 3:
3. An update inside the body that moves toward stopping: count += 1

Infinite loops
If the update is missing or wrong, the condition never becomes False and the loop never ends. This is called an infinite loop. If you run one by mistake, stop the program manually.

for or while?
- Use for when you know the items or the count.
- Use while when you repeat until something happens, such as valid input being entered.

Common mistakes
- Forgetting to update the variable in the condition.
- Updating it in the wrong direction.
- Starting with a value that already makes the condition False.`,

    `count = 1
while count <= 3:
    print(count)
    count += 1`,

    "1\n2\n3",

    "What must a finite while loop eventually do?",

    [
      "Make its condition False",
      "Restart Python",
      "Delete variables",
      "Import a library",
    ],

    0,

    "Update the loop state so its condition becomes False.",

    {
      instructions: `Task: Count from 1 to 5 with a while loop.

Steps:
1. Create count = 1
2. Write while count <= 5:
3. Inside the loop, print count
4. Inside the loop, increase count by 1
5. After the loop, print Finished

Expected output:
1
2
3
4
5
Finished`,

      starterCode: `count = 1

while count <= 5:
    # Step 3: print count
    # Step 4: increase count by 1
    pass

# Step 5: print "Finished"
# TODO
`,

      solutionCode: `count = 1

while count <= 5:
    print(count)
    count += 1

print("Finished")`,

      expectedResult: "1\n2\n3\n4\n5\nFinished",

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
            "It moves count toward making the condition False",
            "It deletes count",
            "It starts another program",
            "It changes count to a string",
          ],
          answer: 0,
        },
        {
          question: "What commonly causes an unintended infinite loop?",
          options: [
            "The condition never becomes False",
            "Using print()",
            "Using a variable",
            "Indenting the body",
          ],
          answer: 0,
        },
        {
          question: "How many numbers does the example print?",
          options: ["2", "3", "4", "5"],
          answer: 1,
        },
        {
          question: "What happens if count starts at 6 with while count <= 5?",
          options: [
            "The body is skipped",
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

    `What is break?
The break statement stops the loop immediately. Any remaining iterations are skipped, and the program continues with the first statement after the loop.

Syntax
for item in sequence:
    if condition:
        break

How it works
break is almost always placed inside an if statement so the loop stops only when something specific happens, such as a target being found.

Typical uses
- Searching: stop as soon as the item is found, instead of checking the rest.
- Stopping on a signal, such as the user typing "quit".

Important points
- break affects only the loop it is directly inside. In nested loops it ends the inner loop only.
- Statements after break in the same iteration do not run.
- break is different from continue. break ends the whole loop; continue skips only the current iteration.

Example flow
for number in range(5):
    if number == 3:
        break
    print(number)
This prints 0, 1, 2. When number becomes 3 the loop ends before printing.

Common mistakes
- Putting break outside a loop, which is a SyntaxError.
- Placing print() after break and expecting it to run.
- Expecting break to end an outer loop.`,

    `for number in range(5):
    if number == 3:
        break
    print(number)`,

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
      instructions: `Task: Search a list for a target number and stop as soon as it is found.

Steps:
1. Use numbers = [4, 7, 9, 12, 15] and target = 9
2. Loop through numbers
3. If the number equals target, print Found followed by the target and use break
4. Otherwise print Checking followed by the number

Expected output:
Checking 4
Checking 7
Found 9`,

      starterCode: `numbers = [4, 7, 9, 12, 15]
target = 9

for number in numbers:
    # Step 3: if number == target, print "Found" and target, then break
    # Step 4: otherwise print "Checking" and number
    pass
`,

      solutionCode: `numbers = [4, 7, 9, 12, 15]
target = 9

for number in numbers:
    if number == target:
        print("Found", target)
        break
    print("Checking", number)`,

      expectedResult: "Checking 4\nChecking 7\nFound 9",

      quizQuestions: [
        {
          question: "What does break end?",
          options: [
            "The innermost loop containing it",
            "The whole Python installation",
            "Every function in the program",
            "The current variable",
          ],
          answer: 0,
        },
        {
          question: "Which numbers does the example print before break stops it?",
          options: ["0, 1, 2", "0, 1, 2, 3", "1, 2, 3", "3, 4"],
          answer: 0,
        },
        {
          question: "Which statement skips to the next iteration instead of ending the loop?",
          options: ["continue", "break", "return", "class"],
          answer: 0,
        },
        {
          question: "Why is break useful in a search?",
          options: [
            "The loop can stop once the target is found",
            "It runs before the search begins",
            "It only works on empty lists",
            "It defines a class",
          ],
          answer: 0,
        },
        {
          question: "After break exits a loop, what happens next?",
          options: [
            "The program continues after the loop",
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

    `What is continue?
The continue statement skips the rest of the current iteration and jumps to the next one. The loop itself keeps running.

Syntax
for item in sequence:
    if condition:
        continue
    statements that run only when the condition was False

How it works
- In a for loop, the loop moves to the next item.
- In a while loop, the condition is checked again. Make sure the update happens before continue, or the loop may never end.
- Statements after continue in the same iteration are not executed.

When to use it
Use continue to ignore values you do not want to process, such as invalid data or multiples of a number.

break compared with continue
- break: ends the loop completely.
- continue: skips only this iteration and carries on.

Example
for number in range(4):
    if number == 2:
        continue
    print(number)
This prints 0, 1, 3. The value 2 is skipped.

Common mistakes
- Confusing continue with break.
- Placing continue before the counter update in a while loop, causing an infinite loop.
- Writing code after continue and expecting it to run.`,

    `for number in range(4):
    if number == 2:
        continue
    print(number)`,

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
      instructions: `Task: Print the numbers from 1 to 10, skipping every multiple of 3.

Steps:
1. Write a for loop using range(1, 11)
2. If number % 3 == 0, use continue
3. Otherwise print the number

Expected output:
1
2
4
5
7
8
10`,

      starterCode: `for number in range(1, 11):
    # Step 2: skip multiples of 3 with continue
    # Step 3: print the number
    pass
`,

      solutionCode: `for number in range(1, 11):
    if number % 3 == 0:
        continue
    print(number)`,

      expectedResult: "1\n2\n4\n5\n7\n8\n10",

      quizQuestions: [
        {
          question: "What does continue skip?",
          options: [
            "The rest of the current iteration",
            "The entire program",
            "All future loops",
            "The variable declaration",
          ],
          answer: 0,
        },
        {
          question: "Which number does the example omit?",
          options: ["0", "1", "2", "3"],
          answer: 2,
        },
        {
          question: "Does continue end the loop?",
          options: ["Yes, always", "No", "Only for lists", "Only for strings"],
          answer: 1,
        },
        {
          question: "Which condition detects a multiple of 3?",
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

    `What is a nested loop?
A nested loop is a loop placed inside the body of another loop.

Syntax
for outer in range(...):
    for inner in range(...):
        body

How it works
1. The outer loop starts its first iteration.
2. The inner loop runs completely, from start to finish.
3. The outer loop moves to its next iteration.
4. The inner loop runs completely again.

Counting the work
The inner body runs (outer iterations) x (inner iterations) times. An outer loop of 3 and an inner loop of 4 run the inner body 12 times.

Rules
- Each loop needs its own loop variable (for example row and col).
- Each level is indented one more step.

Tracing the example
for row in range(2):
    for col in range(2):
        print(row, col)
Output: 0 0, 0 1, 1 0, 1 1. The inner value changes fastest.

Typical uses
- Grids and tables: rows in the outer loop, columns in the inner loop.
- Producing every combination of two sets of values.

Performance
Because the work multiplies, deeply nested loops over large ranges can be slow.

Common mistakes
- Using the same variable name in both loops.
- Mixing up which loop is outer and which is inner.
- Forgetting that break only ends the inner loop.`,

    `for row in range(2):
    for col in range(2):
        print(row, col)`,

    "0 0\n0 1\n1 0\n1 1",

    "How many times does the inner body run in this example?",

    ["2", "3", "4", "8"],

    2,

    "Multiply the number of outer and inner iterations.",

    {
      instructions: `Task: Print every coordinate of a 3-by-3 grid using nested loops.

Steps:
1. Write an outer loop for row using range(3)
2. Write an inner loop for col using range(3)
3. Inside the inner loop, print row and col

Expected output:
0 0
0 1
0 2
1 0
1 1
1 2
2 0
2 1
2 2`,

      starterCode: `for row in range(3):
    for col in range(3):
        # Step 3: print row and col
        pass
`,

      solutionCode: `for row in range(3):
    for col in range(3):
        print(row, col)`,

      expectedResult: "0 0\n0 1\n0 2\n1 0\n1 1\n1 2\n2 0\n2 1\n2 2",

      quizQuestions: [
        {
          question: "How many times does the inner body run in the lesson example?",
          options: ["2", "3", "4", "8"],
          answer: 2,
        },
        {
          question: "What is the first line printed by the lesson example?",
          options: ["0 0", "0 1", "1 0", "1 1"],
          answer: 0,
        },
        {
          question:
            "If the outer loop runs 3 times and the inner loop runs 4 times, how many times does the inner body run?",
          options: ["7", "12", "4", "3"],
          answer: 1,
        },
        {
          question: "Which loop completes all its iterations for each outer iteration?",
          options: ["The inner loop", "The outer loop only", "Neither", "Both end immediately"],
          answer: 0,
        },
        {
          question: "What is a common use for nested loops?",
          options: [
            "Processing a grid of rows and columns",
            "Declaring a string",
            "Importing a module",
            "Converting a float",
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

    `Strings are sequences
A string is an ordered sequence of characters, so it can be used in a for loop.

Syntax
for character in text:
    body

How it works
The loop visits each character from the first to the last, storing it in the loop variable, and runs the body once per character.
- Spaces and punctuation count as characters.
- An empty string "" runs the body zero times.

Example
for letter in "EVO":
    print(letter)
prints E, V, O on separate lines.

Common text tasks with loops
- Counting particular characters, such as vowels
- Checking whether every character meets a rule
- Building a new string one character at a time

Case matters
"A" and "a" are different characters. To compare fairly, convert the text first with lower() or upper().

Counting pattern
count = 0
for letter in word.lower():
    if letter in "aeiou":
        count += 1

Common mistakes
- Forgetting to convert case before comparing.
- Starting the counter inside the loop, which resets it every time.
- Forgetting that a space is also a character.`,

    `for letter in "EVO":
    print(letter)`,

    "E\nV\nO",

    "What does a for loop over a string visit?",

    ["Only numbers", "Each character in the string", "Only spaces", "File names"],

    1,

    "Each item is one character.",

    {
      instructions: `Task: Count the vowels in a word.

Steps:
1. Use word = "education" and count = 0
2. Loop through word.lower()
3. If the letter is in "aeiou", add 1 to count
4. After the loop, print count

Expected output:
5`,

      starterCode: `word = "education"
count = 0

# Step 2 and 3: loop through the letters and count vowels
# TODO

# Step 4: print count
# TODO
`,

      solutionCode: `word = "education"
count = 0

for letter in word.lower():
    if letter in "aeiou":
        count += 1

print(count)`,

      expectedResult: "5",

      quizQuestions: [
        {
          question: "What does the loop visit in the string 'EVO'?",
          options: ["E, V, O", "Only EVO", "Only numbers", "Nothing"],
          answer: 0,
        },
        {
          question: "How many iterations occur for the string 'cat'?",
          options: ["2", "3", "4", "0"],
          answer: 1,
        },
        {
          question: "What happens when you loop over an empty string?",
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
          question: "Why might lower() help when counting vowels?",
          options: [
            "It makes uppercase and lowercase letters match",
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

    `Two patterns used in many loops
Counter
A counter is a variable that tracks how many times something happens. It starts at 0 and increases by 1 each time the event occurs.
count = 0
for number in numbers:
    if number > 10:
        count += 1

Accumulator
An accumulator builds a running result, such as a sum, by combining each new value with the total so far.
total = 0
for number in numbers:
    total += number

The three steps
1. Initialise the variable before the loop.
2. Update it inside the loop.
3. Use the final value after the loop.

Starting values
- A sum starts at 0, because adding 0 changes nothing.
- A product starts at 1, because multiplying by 1 changes nothing.

Accumulating and counting together
One loop can update both a total and a counter. Use an if statement to count only the items that match a rule.

Common mistakes
- Not creating the variable before the loop (NameError).
- Creating it inside the loop, so it resets on every iteration.
- Printing inside the loop when you only want the final result.`,

    `total = 0
for number in range(1, 4):
    total += number
print(total)`,

    "6",

    "What is an accumulator used for?",

    ["Storing a running result", "Stopping Python", "Creating a class", "Reading input only"],

    0,

    "It updates a result repeatedly.",

    {
      instructions: `Task: Calculate the sum of the numbers from 1 to 10 and count how many of them are even.

Steps:
1. Create total = 0 and even_count = 0
2. Loop through range(1, 11)
3. Add each number to total
4. If the number is even, add 1 to even_count
5. After the loop, print total and then even_count

Expected output:
55
5`,

      starterCode: `total = 0
even_count = 0

for number in range(1, 11):
    # Step 3: add number to total
    # Step 4: if number is even, add 1 to even_count
    pass

# Step 5: print total and even_count
# TODO
`,

      solutionCode: `total = 0
even_count = 0

for number in range(1, 11):
    total += number
    if number % 2 == 0:
        even_count += 1

print(total)
print(even_count)`,

      expectedResult: "55\n5",

      quizQuestions: [
        {
          question: "What is the sum of the numbers in range(1, 4)?",
          options: ["3", "4", "6", "10"],
          answer: 2,
        },
        {
          question: "What is a counter commonly used for?",
          options: [
            "Counting how often something happens",
            "Storing a class definition",
            "Opening a file",
            "Sorting strings",
          ],
          answer: 0,
        },
        {
          question: "Why initialise total = 0 before summing?",
          options: [
            "It gives the sum a neutral starting value",
            "It stops the loop",
            "It creates a string",
            "It imports a module",
          ],
          answer: 0,
        },
        {
          question: "How many even numbers are there from 1 to 10 inclusive?",
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

    `Checkpoint summary
This checkpoint reviews the key ideas of the Loop River.

Loop types
- for visits each item of a sequence.
- while repeats as long as its condition is True and needs an update to finish.

range()
- range(stop), range(start, stop), range(start, stop, step)
- The stop value is never included.

Controlling a loop
- break ends the loop immediately.
- continue skips to the next iteration.

Nested loops
The inner loop completes for every iteration of the outer loop, so the inner body runs outer x inner times.

Patterns
- A counter tracks how many times something happens.
- An accumulator builds a running result.
- Both must be created before the loop starts.

How to trace a loop
Write down the loop variable and any counters or totals on every iteration. The pattern shows you the final result.`,

    `total = 0
for number in range(1, 4):
    total += number
print(total)`,

    "6",

    "Which statement skips the rest of the current iteration?",

    ["break", "continue", "return", "pass"],

    1,

    "It moves to the next iteration.",

    {
      type: "quiz",

      instructions: `Task: Calculate the sum of the even numbers from 1 to 10.

Steps:
1. Create total = 0
2. Loop through range(1, 11)
3. If the number is even, add it to total
4. After the loop, print total

Expected output:
30`,

      starterCode: `total = 0

for number in range(1, 11):
    # Step 3: add only even numbers to total
    pass

# Step 4: print total
# TODO
`,

      solutionCode: `total = 0

for number in range(1, 11):
    if number % 2 == 0:
        total += number

print(total)`,

      expectedResult: "30",

      quizQuestions: [
        {
          question: "Which loop is used to go through each item of a sequence?",
          options: ["for", "class", "def", "try"],
          answer: 0,
        },
        {
          question: "What does range(3) produce?",
          options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
          answer: 1,
        },
        {
          question: "Which statement exits a loop completely?",
          options: ["continue", "break", "elif", "import"],
          answer: 1,
        },
        {
          question: "Which loop checks a condition before each iteration?",
          options: ["while", "class", "print", "return"],
          answer: 0,
        },
        {
          question: "What is the sum of the even numbers from 1 to 10?",
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

    `What is a list?
A list stores several values in one variable. It is ordered (items keep their position) and mutable (it can be changed after it is created).

Syntax
Use square brackets with items separated by commas.
fruits = ["apple", "mango", "grape"]
An empty list is written [].

Key properties
- Ordered: each item has a fixed position.
- Mutable: items can be added, replaced, or removed.
- Mixed types are allowed: [1, "two", 3.0, True]
- Duplicates are allowed: [1, 1, 2]

Common operations
- len(list) returns the number of items.
- list.append(value) adds an item to the end.
- list[0] reads the first item (indexing is covered in the next lesson).
- You can loop over a list with for item in list:

When to use a list
Use a list for a group of related values that may grow or change, such as scores, names, or tasks.

Common mistakes
- Using round brackets () or curly braces {} when a list is needed.
- Forgetting the commas between items.
- Expecting append() to return the list. It changes the list and returns None.`,

    `fruits = ["apple", "mango", "grape"]
print(fruits[0])
print(len(fruits))`,

    "apple\n3",

    "Which brackets create a list?",

    ["()", "{}", "[]", "<>"],

    2,

    "They are square brackets.",

    {
      instructions: `Task: Create and grow a list of subjects.

Steps:
1. Create subjects = ["Maths", "Python", "DBMS"]
2. Append "Java" and then "Networks"
3. Print the first subject
4. Print the number of subjects
5. Print the whole list

Expected output:
Maths
5
['Maths', 'Python', 'DBMS', 'Java', 'Networks']`,

      starterCode: `subjects = ["Maths", "Python", "DBMS"]

# Step 2: append "Java" and "Networks"
# TODO

# Step 3: print the first subject
# TODO

# Step 4: print the number of subjects
# TODO

# Step 5: print the whole list
# TODO
`,

      solutionCode: `subjects = ["Maths", "Python", "DBMS"]
subjects.append("Java")
subjects.append("Networks")

print(subjects[0])
print(len(subjects))
print(subjects)`,

      expectedResult: "Maths\n5\n['Maths', 'Python', 'DBMS', 'Java', 'Networks']",

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
          question: "Which method adds an item at the end of a list?",
          options: ["append()", "strip()", "upper()", "read()"],
          answer: 0,
        },
        {
          question: "Can a list contain values of different types?",
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

    `What is an index?
An index is the position of an item in a sequence. You read an item by writing its index in square brackets after the sequence.
Syntax: sequence[index]

Zero-based indexing
Python starts counting at 0.
numbers = [10, 20, 30]
numbers[0] is 10 (first item)
numbers[1] is 20 (second item)
numbers[2] is 30 (third item)
The last valid index is len(numbers) - 1.

Negative indexes
Negative numbers count backwards from the end.
numbers[-1] is 30 (last item)
numbers[-2] is 20 (second from the end)

Out-of-range indexes
Using an index that does not exist raises an IndexError. For a list of 3 items, numbers[3] is an error.

Replacing an item
Lists are mutable, so you can assign to an index.
numbers[0] = 5   (the list becomes [5, 20, 30])

Other sequences
Indexing also works on strings and tuples. "Python"[0] is "P".

Common mistakes
- Thinking the first item is at index 1.
- Using len(list) as an index. It is one past the last valid index.
- Forgetting that strings and tuples cannot have items reassigned.`,

    `numbers = [10, 20, 30]
print(numbers[0])
print(numbers[1])
print(numbers[-1])`,

    "10\n20\n30",

    "What is the index of the first item in a list?",

    ["0", "1", "-1", "It has no index"],

    0,

    "Python uses zero-based indexing.",

    {
      instructions: `Task: Read items from a list using positive and negative indexes.

Steps:
1. Use numbers = [10, 20, 30, 40]
2. Print the first item
3. Print the third item
4. Print the last item using -1
5. Print the second item from the end using -2

Expected output:
10
30
40
30`,

      starterCode: `numbers = [10, 20, 30, 40]

# Step 2: print the first item
# TODO

# Step 3: print the third item
# TODO

# Step 4: print the last item using -1
# TODO

# Step 5: print the second item from the end using -2
# TODO
`,

      solutionCode: `numbers = [10, 20, 30, 40]
print(numbers[0])
print(numbers[2])
print(numbers[-1])
print(numbers[-2])`,

      expectedResult: "10\n30\n40\n30",

      quizQuestions: [
        {
          question: "What is the index of the first item in a list?",
          options: ["0", "1", "-1", "It depends on the values"],
          answer: 0,
        },
        {
          question: "What is numbers[1] for numbers = [10, 20, 30]?",
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
          question: "Which expression accesses the third item of numbers?",
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

    `Lists can be changed in place
Because lists are mutable, you can modify them after they are created.

Adding items
- list.append(value) adds to the end.
- list.insert(index, value) adds at a chosen position.

Replacing an item
list[index] = new_value
scores[0] = 5 replaces the first item.

Removing items
- list.remove(value) deletes the first item equal to value. It raises ValueError if the value is not found.
- list.pop() removes and returns the last item.
- list.pop(index) removes and returns the item at that position.
Choose remove() when you know the value and pop() when you know the position.

These methods return None
append(), insert(), remove(), and sort() change the list itself. They return None, so scores = scores.append(5) would wrongly set scores to None.

Example
scores = [10, 20]
scores.append(30)     [10, 20, 30]
scores[0] = 5         [5, 20, 30]

Common mistakes
- Assigning the result of append() back to the list.
- Calling remove() with a value that is not in the list.
- Using pop() on an empty list (IndexError).`,

    `scores = [10, 20]
scores.append(30)
scores[0] = 5
print(scores)`,

    "[5, 20, 30]",

    "Which method adds an item to the end of a list?",

    ["append()", "push()", "insertEnd()", "addLast()"],

    0,

    "This method appends a value.",

    {
      instructions: `Task: Add, replace, and remove items in a list of scores.

Steps:
1. Use scores = [10, 20, 30]
2. Append 40
3. Replace the first score with 5
4. Remove the value 20
5. Print scores
6. Remove the last item with pop() and store it in last
7. Print last, then print scores again

Expected output:
[5, 30, 40]
40
[5, 30]`,

      starterCode: `scores = [10, 20, 30]

# Step 2: append 40
# TODO

# Step 3: replace the first score with 5
# TODO

# Step 4: remove the value 20
# TODO

# Step 5: print scores
# TODO

# Step 6 and 7: pop the last item, print it, print scores
# TODO
`,

      solutionCode: `scores = [10, 20, 30]
scores.append(40)
scores[0] = 5
scores.remove(20)
print(scores)

last = scores.pop()
print(last)
print(scores)`,

      expectedResult: "[5, 30, 40]\n40\n[5, 30]",

      quizQuestions: [
        {
          question: "Which method adds an item to the end of a list?",
          options: ["append()", "remove()", "pop()", "sort()"],
          answer: 0,
        },
        {
          question: "What does scores[0] = 5 do?",
          options: [
            "Replaces the first item with 5",
            "Adds 5 at the end",
            "Deletes the list",
            "Sorts the list",
          ],
          answer: 0,
        },
        {
          question: "Which method removes the first item equal to a given value?",
          options: ["remove()", "append()", "insert()", "extend()"],
          answer: 0,
        },
        {
          question: "What does pop() return?",
          options: [
            "The item it removed",
            "The whole program",
            "A class",
            "The list length only",
          ],
          answer: 0,
        },
        {
          question: "What does scores = scores.append(5) set scores to?",
          options: ["The updated list", "None", "5", "An empty list"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    34,
    "Tuples",
    "Data Kingdom",
    "Store ordered values in an immutable collection.",

    `What is a tuple?
A tuple is an ordered collection that cannot be changed after it is created. This is called being immutable.

Syntax
point = (3, 4)
The commas make it a tuple, and parentheses are normally added for clarity.

One-item tuple
A tuple with a single item needs a trailing comma: (5,). Without it, (5) is just the number 5.

Reading items
Use indexes exactly as with lists: point[0] is 3 and point[1] is 4. len(point) gives the number of items.

Cannot be modified
point[0] = 10 raises a TypeError. There is no append() or remove() for tuples.

Unpacking
A tuple can be split into separate variables.
x, y = point
Now x is 3 and y is 4. The number of variables must match the number of items.

Tuple compared with list
- List: [] and mutable. Use it when the data changes.
- Tuple: () and immutable. Use it for fixed groups, such as coordinates or a date.

Common mistakes
- Forgetting the comma in a one-item tuple.
- Trying to change an item.
- Unpacking into the wrong number of variables.`,

    `point = (3, 4)
print(point[0])
print(point[1])`,

    "3\n4",

    "Can an item of a tuple be reassigned after the tuple is created?",

    ["Yes, always", "No", "Only strings", "Only integers"],

    1,

    "Tuples are immutable.",

    {
      instructions: `Task: Create a tuple, read its items, and unpack it.

Steps:
1. Create point = (3, 4)
2. Print the first item
3. Print the second item
4. Unpack point into x and y
5. Print x + y
6. Print the length of point

Expected output:
3
4
7
2`,

      starterCode: `point = (3, 4)

# Step 2: print the first item
# TODO

# Step 3: print the second item
# TODO

# Step 4: unpack point into x and y
# TODO

# Step 5: print x + y
# TODO

# Step 6: print len(point)
# TODO
`,

      solutionCode: `point = (3, 4)
print(point[0])
print(point[1])

x, y = point
print(x + y)
print(len(point))`,

      expectedResult: "3\n4\n7\n2",

      quizQuestions: [
        {
          question: "What is a key property of tuples?",
          options: [
            "They are immutable",
            "They must contain strings",
            "They cannot be indexed",
            "They always sort their values",
          ],
          answer: 0,
        },
        {
          question: "How do you write a tuple containing only the number 5?",
          options: ["(5)", "(5,)", "[5]", "{5:}"],
          answer: 1,
        },
        {
          question: "What is point[1] for point = (3, 4)?",
          options: ["3", "4", "1", "An error"],
          answer: 1,
        },
        {
          question: "What does x, y = (3, 4) do?",
          options: [
            "Sets x to 3 and y to 4",
            "Creates a list",
            "Raises a TypeError",
            "Sets both x and y to 7",
          ],
          answer: 0,
        },
        {
          question: "Which is a sensible use for a tuple?",
          options: [
            "A fixed coordinate pair",
            "A collection that is edited constantly",
            "A growing shopping cart",
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

    `What is a set?
A set is an unordered collection of unique values. Adding a duplicate has no effect, so each value appears only once.

Syntax
values = {1, 2, 3}
Use set() to create an empty set, because {} creates an empty dictionary.

Key properties
- Unique: duplicates are ignored. {1, 2, 2, 3} becomes {1, 2, 3}.
- Unordered: no positions, so indexing like values[0] and slicing do not work. The printed order is not guaranteed.
- Fast membership tests: 2 in values.

Removing duplicates
set([1, 2, 2, 3, 3]) gives {1, 2, 3}.

Useful methods
- set.add(value) adds one item.
- set.remove(value) deletes an item (error if missing).

Set operations
a | b   union: items in either set
a & b   intersection: items in both sets
a - b   difference: items in a but not in b

Showing a set in order
Use sorted(my_set) to get a sorted list, which gives a predictable display.

Common mistakes
- Creating an empty set with {}.
- Expecting a set to keep insertion order.
- Trying to index a set.`,

    `values = {1, 2, 2, 3}
print(len(values))
print(2 in values)`,

    "3\nTrue",

    "What is a key property of sets?",

    [
      "They keep duplicates",
      "They store unique elements",
      "They are always sorted",
      "They use indexes",
    ],

    1,

    "Repeated values are stored once.",

    {
      instructions: `Task: Compare two groups of participants and remove duplicates.

Steps:
1. Use python_group = {"Asha", "EVO", "Meena"} and web_group = {"EVO", "Arun"}
2. Print the sorted intersection (people in both groups)
3. Print the sorted union (people in either group)
4. Print the sorted difference python_group - web_group
5. Create unique = set([1, 2, 2, 3, 3]) and print len(unique)

Expected output:
['EVO']
['Arun', 'Asha', 'EVO', 'Meena']
['Asha', 'Meena']
3`,

      starterCode: `python_group = {"Asha", "EVO", "Meena"}
web_group = {"EVO", "Arun"}

# Step 2: print sorted(python_group & web_group)
# TODO

# Step 3: print sorted(python_group | web_group)
# TODO

# Step 4: print sorted(python_group - web_group)
# TODO

# Step 5: remove duplicates and print the length
# TODO
`,

      solutionCode: `python_group = {"Asha", "EVO", "Meena"}
web_group = {"EVO", "Arun"}

print(sorted(python_group & web_group))
print(sorted(python_group | web_group))
print(sorted(python_group - web_group))

unique = set([1, 2, 2, 3, 3])
print(len(unique))`,

      expectedResult:
        "['EVO']\n['Arun', 'Asha', 'EVO', 'Meena']\n['Asha', 'Meena']\n3",

      quizQuestions: [
        {
          question: "What happens to duplicate values in a set?",
          options: [
            "They are stored once",
            "They are always duplicated",
            "They cause an error",
            "They become dictionary keys",
          ],
          answer: 0,
        },
        {
          question: "Which operator calculates the intersection of two sets?",
          options: ["&", "|", "+", "/"],
          answer: 0,
        },
        {
          question: "Which operator calculates the union of two sets?",
          options: ["&", "|", "%", "//"],
          answer: 1,
        },
        {
          question: "How do you create an empty set?",
          options: ["{}", "set()", "[]", "()"],
          answer: 1,
        },
        {
          question: "Do sets support positional indexing such as values[0]?",
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

    `What is a dictionary?
A dictionary (type dict) stores data as key: value pairs. You look up a value using its key instead of a position.

Syntax
person = {"name": "EVO", "age": 19}

Rules for keys
- Each key must be unique.
- Keys must be immutable types such as strings, numbers, or tuples. Lists cannot be keys.
- Values can be any type.

Reading values
- person["name"] returns "EVO". A missing key raises a KeyError.
- person.get("city", "Unknown") returns "Unknown" when the key is missing, so no error occurs.

Adding and changing
person["city"] = "Pune"    adds a new pair
person["age"] = 20         replaces the existing value

Removing
del person["age"] removes a pair.

Looping
- for key in person: visits the keys.
- for key, value in person.items(): visits both together.

Order and membership
Dictionaries remember insertion order. "name" in person checks the keys, not the values.

Common mistakes
- Using a key that does not exist with square brackets.
- Using curly braces without key: value pairs, which creates a set.
- Expecting in to search the values.`,

    `person = {"name": "EVO", "age": 19}
print(person["name"])
print(person.get("city", "Unknown"))`,

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
      instructions: `Task: Work with a student dictionary.

Steps:
1. Create student = {"name": "EVO", "course": "Python", "score": 85}
2. Print the name
3. Print the score
4. Use get() to print the city, with "Unknown" as the default
5. Change the score to 90 and add the key "city" with the value "Pune"
6. Print the score
7. Print the city using get() with the same default

Expected output:
EVO
85
Unknown
90
Pune`,

      starterCode: `student = {"name": "EVO", "course": "Python", "score": 85}

# Step 2: print the name
# TODO

# Step 3: print the score
# TODO

# Step 4: print the city with get(), default "Unknown"
# TODO

# Step 5: update score and add city
# TODO

# Step 6 and 7: print score and city
# TODO
`,

      solutionCode: `student = {"name": "EVO", "course": "Python", "score": 85}
print(student["name"])
print(student["score"])
print(student.get("city", "Unknown"))

student["score"] = 90
student["city"] = "Pune"
print(student["score"])
print(student.get("city", "Unknown"))`,

      expectedResult: "EVO\n85\nUnknown\n90\nPune",

      quizQuestions: [
        {
          question: "What does a dictionary map?",
          options: [
            "Keys to values",
            "Characters to loops",
            "Indexes to strings only",
            "Files to folders",
          ],
          answer: 0,
        },
        {
          question: 'What does person["name"] return for person = {"name": "EVO", "age": 19}?',
          options: ["EVO", "19", "Unknown", "name"],
          answer: 0,
        },
        {
          question: "What does person.get('city', 'Unknown') return when city is missing?",
          options: ["An error", "Unknown", "city", "0"],
          answer: 1,
        },
        {
          question: "Which brackets are used to write a dictionary?",
          options: ["()", "[]", "{}", "<>"],
          answer: 2,
        },
        {
          question: "What happens if you read a missing key with person['city']?",
          options: [
            "A KeyError is raised",
            "Python creates the key",
            "It returns zero",
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

    `What is a method?
A method is a function that belongs to a value and is called with a dot.
Syntax: value.method(arguments)
Example: "python".upper() returns "PYTHON".

Common string methods
- lower() converts to lowercase; upper() converts to uppercase
- title() capitalises each word
- strip() removes whitespace from both ends
- replace(old, new) substitutes text
- split(separator) breaks a string into a list
- startswith(text) and endswith(text) return True or False
- find(text) returns the position of the first match, or -1 if not found

Strings are immutable
A method never changes the original string. It returns a new one. To keep the result, store it:
clean = name.strip()
Calling name.strip() alone and ignoring the result changes nothing.

Chaining
Methods that return strings can be chained: text.strip().upper() removes spaces first, then converts to uppercase.

Example
text = "  Python  "
text.strip()                       "Python"
text.lower()                       "  python  "
text.replace("Python", "EVOLV")    "  EVOLV  "

Common mistakes
- Forgetting the parentheses after the method name.
- Not storing the returned value.
- Expecting split() to return a string. It returns a list.`,

    `text = "  Python  "
print(text.strip().upper())
print(text.lower())
print(text.replace("Python", "EVOLV"))`,

    "PYTHON\n  python  \n  EVOLV  ",

    "Which method removes whitespace from both ends of a string?",

    ["upper()", "strip()", "append()", "sort()"],

    1,

    "It trims the beginning and end.",

    {
      instructions: `Task: Clean and inspect a user-entered name.

Steps:
1. Use name = "  meena  "
2. Create clean_name by chaining strip() and title(), then print it
3. Print clean_name in uppercase
4. Print whether clean_name starts with "M"
5. Print the length of name, then the length of clean_name
6. Split "EVO,Arun,Asha" at the commas and print the result

Expected output:
Meena
MEENA
True
9
5
['EVO', 'Arun', 'Asha']`,

      starterCode: `name = "  meena  "

# Step 2: create clean_name and print it
# TODO

# Step 3: print clean_name in uppercase
# TODO

# Step 4: print clean_name.startswith("M")
# TODO

# Step 5: print len(name) and len(clean_name)
# TODO

# Step 6: split "EVO,Arun,Asha" at the commas and print the list
# TODO
`,

      solutionCode: `name = "  meena  "
clean_name = name.strip().title()
print(clean_name)
print(clean_name.upper())
print(clean_name.startswith("M"))
print(len(name))
print(len(clean_name))
print("EVO,Arun,Asha".split(","))`,

      expectedResult: "Meena\nMEENA\nTrue\n9\n5\n['EVO', 'Arun', 'Asha']",

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
          question: "Which method substitutes part of a string with other text?",
          options: ["replace()", "append()", "remove()", "sort()"],
          answer: 0,
        },
        {
          question: "Do string methods usually change the original string in place?",
          options: [
            "No, strings are immutable and a new string is returned",
            "Yes, always",
            "Only upper()",
            "Only lower()",
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

    `What is slicing?
Slicing extracts part of a sequence. It works on strings, lists, and tuples and always produces a new object of the same kind.

Syntax
sequence[start:stop:step]

The rules
- start is included.
- stop is excluded.
- step is optional and chooses every nth item.
Example with "PYTHON" (indexes 0 to 5):
"PYTHON"[1:4] gives "YTH" (indexes 1, 2, 3)

Leaving values out
- Omitted start means the beginning: [:3] gives "PYT".
- Omitted stop means the end: [3:] gives "HON".
- [:] copies everything.

Negative values
- [-2:] gives the last two items: "ON".
- A step of -1 reverses the sequence: [::-1] gives "NOHTYP".

Steps
[::2] takes every second item: "PTO".

Out-of-range bounds
A slice never raises IndexError. "PYTHON"[2:100] simply returns "THON".

Slice compared with index
word[1] returns one item. word[1:2] returns a sequence containing that item.

Common mistakes
- Expecting the stop index to be included.
- Mixing up the positions of start and stop.
- Using a step of 0, which is an error.`,

    `letters = "PYTHON"
print(letters[1:4])
print(letters[:2])
print(letters[-2:])`,

    "YTH\nPY\nON",

    "Is the stop index included in a slice?",

    ["Yes", "No", "Only for lists", "Only for strings"],

    1,

    "The stop position marks where extraction ends.",

    {
      instructions: `Task: Extract different parts of a word using slicing.

Steps:
1. Use word = "PYTHON"
2. Print the first three characters
3. Print the last two characters
4. Print every second character
5. Print the characters at indexes 1, 2 and 3
6. Print the word reversed

Expected output:
PYT
ON
PTO
YTH
NOHTYP`,

      starterCode: `word = "PYTHON"

# Step 2: first three characters
# TODO

# Step 3: last two characters
# TODO

# Step 4: every second character
# TODO

# Step 5: characters at indexes 1 to 3
# TODO

# Step 6: the word reversed
# TODO
`,

      solutionCode: `word = "PYTHON"
print(word[:3])
print(word[-2:])
print(word[::2])
print(word[1:4])
print(word[::-1])`,

      expectedResult: "PYT\nON\nPTO\nYTH\nNOHTYP",

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
          question: "In a slice [start:stop], which index is excluded?",
          options: ["start", "stop", "Both", "Neither"],
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

    `What is a list comprehension?
A list comprehension builds a new list in one expression. It is a shorter way to write a loop that creates a list.

Syntax
[expression for item in iterable]
[expression for item in iterable if condition]

How it works
1. Python takes each item from the iterable.
2. If there is a condition, items that fail it are skipped.
3. The expression is calculated for each remaining item.
4. The results are collected into a new list.

Equivalent loop
squares = []
for number in range(4):
    squares.append(number * number)
becomes
squares = [number * number for number in range(4)]

Examples
[n * n for n in range(4)]                 gives [0, 1, 4, 9]
[n for n in range(10) if n % 2 == 0]      gives [0, 2, 4, 6, 8]
[name.upper() for name in ["asha", "evo"]] gives ["ASHA", "EVO"]

Other kinds
The same idea works for sets {x for x in ...} and dictionaries {k: v for ...}.

When to use one
Use a comprehension for simple transformations and filters. If the logic needs several steps or nested conditions, a normal loop is clearer.

Common mistakes
- Putting the if condition before the for.
- Using a comprehension for logic that is too complicated to read.
- Forgetting that it creates a new list and does not change the original.`,

    `squares = [number * number for number in range(4)]
print(squares)
evens = [number for number in range(10) if number % 2 == 0]
print(evens)`,

    "[0, 1, 4, 9]\n[0, 2, 4, 6, 8]",

    "What does a list comprehension create?",

    ["A new list", "A database", "A class", "A file"],

    0,

    "The result is enclosed in square brackets.",

    {
      instructions: `Task: Build lists with list comprehensions.

Steps:
1. Create squares: the square of each number from 1 to 10
2. Create evens: the even numbers from 1 to 10
3. Create upper_names: each name in ["asha", "evo"] in uppercase
4. Print all three lists

Expected output:
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
[2, 4, 6, 8, 10]
['ASHA', 'EVO']`,

      starterCode: `# Step 1: squares of 1 to 10
squares = []  # TODO: replace with a list comprehension

# Step 2: even numbers from 1 to 10
evens = []  # TODO: replace with a list comprehension

# Step 3: uppercase names
names = ["asha", "evo"]
upper_names = []  # TODO: replace with a list comprehension

# Step 4: print all three lists
print(squares)
print(evens)
print(upper_names)
`,

      solutionCode: `squares = [number ** 2 for number in range(1, 11)]
evens = [number for number in range(1, 11) if number % 2 == 0]

names = ["asha", "evo"]
upper_names = [name.upper() for name in names]

print(squares)
print(evens)
print(upper_names)`,

      expectedResult:
        "[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\n[2, 4, 6, 8, 10]\n['ASHA', 'EVO']",

      quizQuestions: [
        {
          question: "What does a list comprehension create?",
          options: ["A new list", "A file", "A class", "A database connection"],
          answer: 0,
        },
        {
          question: "What is [n * n for n in range(3)]?",
          options: ["[0, 1, 4]", "[1, 4, 9]", "[0, 1, 2]", "[0, 1, 4, 9]"],
          answer: 0,
        },
        {
          question: "Which part of a comprehension filters items?",
          options: [
            "The optional if clause",
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
          question: "When is a regular loop clearer than a comprehension?",
          options: [
            "When the logic needs several complicated steps",
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

    `Checkpoint summary
This checkpoint compares the collections of the Data Kingdom.

Collection comparison
- List [ ]: ordered, mutable, allows duplicates. Use it for data that changes.
- Tuple ( ): ordered, immutable. Use it for fixed groups of values.
- Set { }: unordered, unique values only. Use it for removing duplicates and comparing groups.
- Dictionary { key: value }: maps unique keys to values. Use it to look up data by name.
- String " ": immutable sequence of characters.

Accessing data
- Indexing starts at 0, and negative indexes count from the end.
- Slicing [start:stop:step] excludes the stop index.
- Dictionaries are read by key: data["name"] or data.get("name", default).

Useful tools
- len() works on all collections.
- append(), remove(), and pop() change a list.
- String methods return new strings.
- A list comprehension builds a list in one expression.

Choosing the right structure
Ask what must be stored (a sequence, unique items, or labelled data) and whether it must change.`,

    `student = {"name": "EVO", "score": 5}
student["score"] += 3
print(student["name"])
print(student["score"])`,

    "EVO\n8",

    "Which collection stores key-value pairs?",

    ["List", "Tuple", "Set", "Dictionary"],

    3,

    "Use this collection when values are retrieved by keys.",

    {
      type: "quiz",

      instructions: `Task: Use each kind of collection once.

Steps:
1. Create student = {"name": "EVO", "score": 5}, add 3 to the score, then print the name and the score
2. Create numbers = [1, 2, 2, 3, 3, 3], convert it to a set called unique, and print how many unique values it has
3. Create point = (3, 4) and print its second item
4. Print the slice of "PYTHON" from index 1 up to (but not including) index 4

Expected output:
EVO
8
3
4
YTH`,

      starterCode: `# Step 1: dictionary
student = {"name": "EVO", "score": 5}
# TODO: add 3 to the score, print the name and the score

# Step 2: set
numbers = [1, 2, 2, 3, 3, 3]
# TODO: create unique and print its length

# Step 3: tuple
point = (3, 4)
# TODO: print the second item

# Step 4: slicing
# TODO: print "PYTHON"[1:4]
`,

      solutionCode: `student = {"name": "EVO", "score": 5}
student["score"] += 3
print(student["name"])
print(student["score"])

numbers = [1, 2, 2, 3, 3, 3]
unique = set(numbers)
print(len(unique))

point = (3, 4)
print(point[1])

print("PYTHON"[1:4])`,

      expectedResult: "EVO\n8\n3\n4\nYTH",

      quizQuestions: [
        {
          question: "Which brackets create a list?",
          options: ["()", "[]", "{}", "<>"],
          answer: 1,
        },
        {
          question: "What is the first index of a list?",
          options: ["0", "1", "-1", "2"],
          answer: 0,
        },
        {
          question: "Which collection stores only unique elements?",
          options: ["List", "Tuple", "Set", "String"],
          answer: 2,
        },
        {
          question: "Which collection stores key-value pairs?",
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

    `What is a function?
A function is a named block of code that performs a task. You write it once and run it whenever you need it.

Defining a function
Syntax:
def function_name():
    body

- def is the keyword that starts a definition.
- The name is followed by parentheses and a colon.
- The body is indented.
- Defining a function does not run it.

Calling a function
Write the name followed by parentheses: greet()
The body runs each time the function is called, so one function can be called many times.

Why use functions?
- Remove repeated code
- Give a name to a piece of logic
- Make programs easier to test and maintain

Naming
Function names use lowercase letters and underscores, and should describe the action, such as print_report or calculate_total.

Order matters
A function must be defined before the line that calls it runs.

Common mistakes
- Defining a function but never calling it.
- Forgetting the parentheses when calling (greet does not run the function, greet() does).
- Forgetting the colon or the indentation.`,

    `def greet():
    print("Hello!")

greet()
greet()`,

    "Hello!\nHello!",

    "Which keyword defines a function?",

    ["func", "def", "function", "make"],

    1,

    "It is a three-letter keyword.",

    {
      instructions: `Task: Create a function that prints a study plan and call it twice.

Steps:
1. Define a function called study_plan with no parameters
2. Inside it, print Review notes, then Practise Python, then Test your code
3. Call study_plan() two times

Expected output:
Review notes
Practise Python
Test your code
Review notes
Practise Python
Test your code`,

      starterCode: `# Steps 1 and 2: define study_plan
def study_plan():
    # TODO: print the three study tasks
    pass

# Step 3: call the function twice
# TODO
`,

      solutionCode: `def study_plan():
    print("Review notes")
    print("Practise Python")
    print("Test your code")

study_plan()
study_plan()`,

      expectedResult:
        "Review notes\nPractise Python\nTest your code\nReview notes\nPractise Python\nTest your code",

      quizQuestions: [
        {
          question: "Which keyword defines a function?",
          options: ["def", "func", "make", "class"],
          answer: 0,
        },
        {
          question: "Does defining a function run its body?",
          options: ["Yes", "No, it only runs when called", "Only with print()", "Only in a loop"],
          answer: 1,
        },
        {
          question: "How do you call a function named greet?",
          options: ["greet()", "call greet", "def greet", "function greet"],
          answer: 0,
        },
        {
          question: "How is the function body written?",
          options: [
            "As an indented block under the def line",
            "Inside a comment",
            "After the program ends",
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

    `Parameters and arguments
- A parameter is a variable name listed in the parentheses of the function definition.
- An argument is the actual value you give when you call the function.

Syntax
def greet(name, course):
    print(f"Hello {name}, welcome to {course}!")

greet("EVO", "Python")

How they connect
Arguments are matched to parameters by position. The first argument goes to the first parameter, the second to the second, and so on. In the call above, name is "EVO" and course is "Python".

Rules
- The number of arguments must match the number of parameters, otherwise Python raises a TypeError.
- Parameters exist only while the function runs. They cannot be used outside it.
- A function can have any number of parameters.

Why parameters help
One function can give different results for different arguments, so you avoid writing near-identical functions.

Good naming
Use meaningful names such as name and price. They document what the function expects.

Common mistakes
- Passing too few or too many arguments.
- Passing arguments in the wrong order.
- Using a parameter name outside the function.`,

    `def greet(name, course):
    print(f"Hello {name}, welcome to {course}!")

greet("EVO", "Python")
greet("Arun", "Data Science")`,

    "Hello EVO, welcome to Python!\nHello Arun, welcome to Data Science!",

    "What is a parameter?",

    [
      "A named input in a function definition",
      "A loop",
      "A module",
      "A file",
    ],

    0,

    "It provides a named input to a function.",

    {
      instructions: `Task: Create a function that displays a product and its price.

Steps:
1. Define show_product(name, price)
2. Inside it, print the name, a colon, Rs., and the price in the form: Notebook: Rs. 45 (use an f-string)
3. Call it with "Notebook" and 45
4. Call it with "Pen" and 10
5. Call it with "Bag" and 120

Expected output:
Notebook: Rs. 45
Pen: Rs. 10
Bag: Rs. 120`,

      starterCode: `def show_product(name, price):
    # Step 2: print in the form "Notebook: Rs. 45"
    pass

# Steps 3 to 5: call the function three times
# TODO
`,

      solutionCode: `def show_product(name, price):
    print(f"{name}: Rs. {price}")

show_product("Notebook", 45)
show_product("Pen", 10)
show_product("Bag", 120)`,

      expectedResult: "Notebook: Rs. 45\nPen: Rs. 10\nBag: Rs. 120",

      quizQuestions: [
        {
          question: "What is a parameter?",
          options: [
            "A named input in a function definition",
            "A loop variable",
            "A file path",
            "A return value",
          ],
          answer: 0,
        },
        {
          question: "What is an argument?",
          options: [
            "A value supplied when calling a function",
            "The def keyword",
            "A module name",
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
          question: 'What does greet("EVO", "Python") pass to name and course?',
          options: [
            'name is "EVO" and course is "Python"',
            'name is "Python" and course is "EVO"',
            "Nothing is passed",
            "Both receive the same value",
          ],
          answer: 0,
        },
        {
          question: "What happens if you call greet('EVO') when two arguments are required?",
          options: ["A TypeError is raised", "It prints nothing", "It uses 0", "It works normally"],
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

    `What does return do?
The return statement sends a value back to the code that called the function and ends the function immediately.

Syntax
def add(a, b):
    return a + b

result = add(2, 3)    result is 5

Using the returned value
A returned value can be stored in a variable, used in a calculation, or passed to another function: print(add(2, 3) * 2).

return compared with print
- print() only displays a value on screen. The caller gets nothing to work with.
- return gives the value back so the program can keep using it.

No return means None
A function with no return statement (or a bare return) returns None, which represents "no value".

Returning several values
return a, b returns a tuple. You can unpack it: x, y = function().

Code after return
Statements after a return in the same function call never run.

Why it matters
Functions that return results are easier to reuse and test than functions that only print.

Common mistakes
- Using print() when a result must be reused.
- Forgetting to store the returned value.
- Writing code after return and expecting it to run.`,

    `def add(a, b):
    return a + b

result = add(2, 3)
print(result * 2)`,

    "10",

    "Which keyword sends a value back from a function?",

    ["print", "yield only", "return", "send"],

    2,

    "It gives the caller a result.",

    {
      instructions: `Task: Write functions that return results, then reuse those results.

Steps:
1. Define rectangle_area(width, height) that returns width * height
2. Define rectangle_perimeter(width, height) that returns 2 * (width + height)
3. Store rectangle_area(4, 3) in area and print it
4. Print area * 2
5. Print rectangle_perimeter(4, 3)

Expected output:
12
24
14`,

      starterCode: `def rectangle_area(width, height):
    # Step 1: return the area
    pass

def rectangle_perimeter(width, height):
    # Step 2: return the perimeter
    pass

# Steps 3 to 5
area = rectangle_area(4, 3)
# TODO: print area, area * 2, and the perimeter
`,

      solutionCode: `def rectangle_area(width, height):
    return width * height

def rectangle_perimeter(width, height):
    return 2 * (width + height)

area = rectangle_area(4, 3)
print(area)
print(area * 2)
print(rectangle_perimeter(4, 3))`,

      expectedResult: "12\n24\n14",

      quizQuestions: [
        {
          question: "What does return do?",
          options: [
            "Sends a result back to the caller",
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
          question: "What does a function without a return statement give back?",
          options: ["0", "False", "None", "An empty list"],
          answer: 2,
        },
        {
          question: "Which statement correctly stores a returned value?",
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
            "print displays a value; return gives the value to the caller",
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

    `What is a default argument?
A default argument gives a parameter a fallback value. If the caller leaves that argument out, the default is used. If the caller supplies a value, it replaces the default.

Syntax
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("EVO")              uses the default: Hello, EVO!
greet("Arun", "Welcome")  overrides it: Welcome, Arun!

Rules
- Write a default as parameter=value in the definition.
- Parameters with defaults must come after parameters without defaults.
  def f(a, b=2) is valid. def f(a=1, b) is a SyntaxError.

Why use defaults?
Common cases need fewer arguments, while special cases can still change the behaviour. For example power(5) can square by default and power(2, 3) can use another exponent.

When the default is created
The default value is created once, when the function is defined, not on every call.

Warning about mutable defaults
A default such as items=[] is shared between calls and can produce surprising results. The usual solution is to use None and create the list inside the function:
def add_item(item, items=None):
    if items is None:
        items = []

Common mistakes
- Placing a default parameter before a required one.
- Using an empty list or dictionary as a default.`,

    `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("EVO")
greet("Arun", "Welcome")`,

    "Hello, EVO!\nWelcome, Arun!",

    "When is a default argument used?",

    [
      "Whenever a loop runs",
      "When the argument is omitted in the call",
      "Only after an error",
      "Never",
    ],

    1,

    "It supplies a fallback value.",

    {
      instructions: `Task: Use default arguments in two functions.

Steps:
1. Define greet(name, greeting="Hello") that prints greeting, a comma, a space, name, and an exclamation mark
2. Call greet("EVO") and greet("Arun", "Welcome")
3. Define power(base, exponent=2) that returns base ** exponent
4. Print power(5)
5. Print power(2, 3)

Expected output:
Hello, EVO!
Welcome, Arun!
25
8`,

      starterCode: `def greet(name, greeting="Hello"):
    # Step 1: print the greeting
    pass

# Step 2: call greet twice
# TODO

def power(base, exponent=2):
    # Step 3: return base ** exponent
    pass

# Steps 4 and 5: print the results
# TODO
`,

      solutionCode: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("EVO")
greet("Arun", "Welcome")

def power(base, exponent=2):
    return base ** exponent

print(power(5))
print(power(2, 3))`,

      expectedResult: "Hello, EVO!\nWelcome, Arun!\n25\n8",

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
          question: 'What does greet("EVO") print for greet(name, greeting="Hello")?',
          options: ["Hello, EVO!", "Welcome, EVO!", "EVO, Hello!", "Nothing"],
          answer: 0,
        },
        {
          question: 'What does greet("Arun", "Welcome") print?',
          options: ["Hello, Arun!", "Welcome, Arun!", "Arun, Welcome!", "Nothing"],
          answer: 1,
        },
        {
          question: "Which definition is valid Python?",
          options: [
            "def f(a, b=2):",
            "def f(a=1, b):",
            "def f(a=, b):",
            "def f(=a, b):",
          ],
          answer: 0,
        },
        {
          question: "Why should mutable defaults such as [] be avoided?",
          options: [
            "The same list can be shared across calls",
            "They cannot hold values",
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

    `What is a keyword argument?
A keyword argument passes a value by naming the parameter in the call.
Syntax: function(parameter=value)

Example
def describe(name, age, course):
    print(f"{name} is {age} and studies {course}.")

describe(course="Python", name="EVO", age=19)

Benefits
- Python matches by name, not by position, so the order does not matter.
- Calls are easier to read, especially when a function has several parameters.
- They combine well with default arguments, so a caller can change just one optional setting.

Rules
- The name must match a parameter name in the definition. Otherwise Python raises a TypeError.
- Positional and keyword arguments can be mixed, but positional arguments must come first.
  describe("Arun", course="Java", age=20) is valid.
  describe(name="Arun", "Java", 20) is a SyntaxError.
- A parameter cannot receive a value twice, once by position and once by keyword.

Positional compared with keyword
- Positional: describe("EVO", 19, "Python") relies on order.
- Keyword: describe(name="EVO", age=19, course="Python") relies on names.

Common mistakes
- Misspelling a parameter name.
- Placing a positional argument after a keyword argument.
- Giving the same parameter two values.`,

    `def describe(name, age, course):
    print(f"{name} is {age} and studies {course}.")

describe(course="Python", name="EVO", age=19)`,

    "EVO is 19 and studies Python.",

    "How does a keyword argument identify its parameter?",

    ["By parameter name", "By list index", "By file path", "By data type only"],

    0,

    "The call includes a name followed by =.",

    {
      instructions: `Task: Call a function using keyword arguments.

Steps:
1. Define describe(name, age, course) that prints: EVO is 19 and studies Python. (use an f-string)
2. Call it with keyword arguments in the order course, name, age for EVO, 19, Python
3. Call it with the positional argument "Arun" first, followed by keyword arguments course="Java" and age=20

Expected output:
EVO is 19 and studies Python.
Arun is 20 and studies Java.`,

      starterCode: `def describe(name, age, course):
    # Step 1: print the sentence
    pass

# Step 2: keyword arguments in a different order
# TODO

# Step 3: one positional argument, then keyword arguments
# TODO
`,

      solutionCode: `def describe(name, age, course):
    print(f"{name} is {age} and studies {course}.")

describe(course="Python", name="EVO", age=19)
describe("Arun", course="Java", age=20)`,

      expectedResult: "EVO is 19 and studies Python.\nArun is 20 and studies Java.",

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
          question: "Can keyword arguments be written in any order?",
          options: ["Yes", "No", "Only for strings", "Only inside loops"],
          answer: 0,
        },
        {
          question: "Which call uses keyword arguments?",
          options: [
            'describe(course="Python", name="EVO", age=19)',
            'describe("EVO", 19, "Python")',
            "describe()",
            "def describe",
          ],
          answer: 0,
        },
        {
          question: "What is the required order when mixing positional and keyword arguments?",
          options: [
            "Positional first, keyword after",
            "Keyword first, positional after",
            "Only keyword arguments are allowed",
            "Only positional arguments are allowed",
          ],
          answer: 0,
        },
        {
          question: "What must a keyword argument's name match?",
          options: [
            "A parameter name in the function definition",
            "A list index",
            "A module extension",
            "A variable in the caller only",
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

    `What is scope?
Scope is the part of a program where a variable name can be used.

Local variables
A variable created inside a function is local. It exists only while the function runs and cannot be used outside it.

Global variables
A variable created outside all functions is global. A function can read it.

Same name, different variables
Assigning to a name inside a function creates a new local variable, even if a global variable has the same name. The global value is not changed.
message = "Outside"
def show():
    message = "Inside"
    print(message)
show()          prints Inside
print(message)  prints Outside

How Python finds a name (LEGB)
1. Local: inside the current function
2. Enclosing: inside any outer function
3. Global: at the top level of the file
4. Built-in: names such as print and len

The global keyword
The global keyword lets a function assign to a global variable, but it makes code harder to follow.

Better design
Pass values in as parameters and send results out with return. This keeps functions independent and easy to test.

Common mistakes
- Using a local variable outside its function (NameError).
- Expecting an assignment inside a function to change a global variable.
- Overusing global.`,

    `message = "Outside"
def show():
    message = "Inside"
    print(message)

show()
print(message)`,

    "Inside\nOutside",

    "Where is a local variable normally accessible?",

    ["Everywhere", "Only inside the function where it was created", "Only in another file", "Only in a list"],

    1,

    "Its visibility is limited to its scope.",

    {
      instructions: `Task: Show that a local variable does not change a global variable.

Steps:
1. Create the global variable message = "Outside"
2. Define show() that creates a local variable message = "Inside" and prints it
3. Call show()
4. Print the global message
5. Define add_bonus(score) that creates a local variable bonus = 5 and returns score + bonus
6. Print add_bonus(10)

Expected output:
Inside
Outside
15`,

      starterCode: `message = "Outside"

def show():
    # Step 2: create a local message and print it
    pass

# Step 3: call show()
# TODO

# Step 4: print the global message
# TODO

def add_bonus(score):
    # Step 5: create bonus and return score + bonus
    pass

# Step 6: print add_bonus(10)
# TODO
`,

      solutionCode: `message = "Outside"

def show():
    message = "Inside"
    print(message)

show()
print(message)

def add_bonus(score):
    bonus = 5
    return score + bonus

print(add_bonus(10))`,

      expectedResult: "Inside\nOutside\n15",

      quizQuestions: [
        {
          question: "Where is a local variable normally accessible?",
          options: [
            "Inside the function that created it",
            "Everywhere in every file",
            "Only in the terminal",
            "Only inside a list",
          ],
          answer: 0,
        },
        {
          question: "What does the lesson example print first?",
          options: ["Outside", "Inside", "None", "An error"],
          answer: 1,
        },
        {
          question: "What does the lesson example print second?",
          options: ["Outside", "Inside", "None", "An error"],
          answer: 0,
        },
        {
          question: "What is a better alternative to relying on global variables?",
          options: [
            "Pass parameters and return results",
            "Delete all functions",
            "Use random names",
            "Remove indentation",
          ],
          answer: 0,
        },
        {
          question: "Does assigning to a name inside a function change a global variable with the same name?",
          options: [
            "No, it creates a separate local variable",
            "Yes, always",
            "Only for strings",
            "Only in loops",
          ],
          answer: 0,
        },
      ],
    }
  ),

  lesson(
    47,
    "Lambda Functions",
    "Function Mountains",
    "Create small anonymous functions using lambda.",

    `What is a lambda?
A lambda expression creates a small function without a name (an anonymous function).

Syntax
lambda parameters: expression

Example
double = lambda number: number * 2
double(4) returns 8

It is equivalent to
def double(number):
    return number * 2

Key rules
- A lambda contains exactly one expression.
- The value of that expression is returned automatically. Do not write return.
- It cannot contain statements such as assignments, loops, or several lines.
- It can take several parameters: lambda a, b: a + b

Where lambdas are used
They are most often passed straight into another function that expects a function, for example the key argument of sorted(), min(), and max().
sorted(words, key=lambda word: len(word)) sorts words by length.

When to choose def instead
Use a regular def function when the code needs several steps, a clear name, or documentation. A named function is easier to read and debug.

Common mistakes
- Writing return inside a lambda.
- Trying to put several statements in a lambda.
- Using a lambda for logic that deserves a name.`,

    `double = lambda number: number * 2
print(double(4))

words = ["pear", "watermelon", "fig"]
print(sorted(words, key=lambda word: len(word)))`,

    "8\n['fig', 'pear', 'watermelon']",

    "Which keyword introduces a lambda expression?",

    ["def", "lambda", "return", "anonymous"],

    1,

    "It names this kind of expression.",

    {
      instructions: `Task: Use lambda functions for a calculation and for sorting.

Steps:
1. Create square = lambda number: number * number and print square(5)
2. Use words = ["pear", "watermelon", "fig"]
3. Print the words sorted by length using sorted() with a lambda as the key
4. Create add = lambda a, b: a + b and print add(2, 3)

Expected output:
25
['fig', 'pear', 'watermelon']
5`,

      starterCode: `# Step 1: square lambda
# TODO

words = ["pear", "watermelon", "fig"]

# Step 3: sort by length using a lambda key
# TODO

# Step 4: add lambda
# TODO
`,

      solutionCode: `square = lambda number: number * number
print(square(5))

words = ["pear", "watermelon", "fig"]
print(sorted(words, key=lambda word: len(word)))

add = lambda a, b: a + b
print(add(2, 3))`,

      expectedResult: "25\n['fig', 'pear', 'watermelon']\n5",

      quizQuestions: [
        {
          question: "What does a lambda create?",
          options: ["An anonymous function", "A class", "A file", "A loop"],
          answer: 0,
        },
        {
          question: "How many expressions can a lambda contain?",
          options: [
            "One expression",
            "Any number of statements",
            "None",
            "Only a print statement",
          ],
          answer: 0,
        },
        {
          question: "What does double(4) return for double = lambda number: number * 2?",
          options: ["4", "8", "16", "None"],
          answer: 1,
        },
        {
          question: "What is the key argument of sorted() used for?",
          options: [
            "Choosing the value used for sorting",
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

    `What is recursion?
Recursion is when a function calls itself to solve a smaller version of the same problem.

The two parts of every recursive function
1. Base case: a condition that can be answered directly and stops further calls.
2. Recursive case: the function calls itself with a smaller or simpler input that moves toward the base case.

Example
def countdown(n):
    if n == 0:
        print("Go!")        base case
    else:
        print(n)
        countdown(n - 1)    recursive case
countdown(3) prints 3, 2, 1, Go!

Factorial
5! = 5 x 4 x 3 x 2 x 1 and 0! = 1.
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

The call stack
Each call waits for the call it made to finish. The calls are stored on the call stack and return one by one once the base case is reached.

What can go wrong
If the base case is never reached, calls keep stacking until Python raises a RecursionError.

Recursion or loop?
Recursion suits problems that break into smaller copies of themselves, such as factorials and tree structures. For plain repetition, a loop is usually simpler.

Common mistakes
- Forgetting the base case.
- A recursive call that does not move toward the base case.
- Forgetting to return the recursive result.`,

    `def countdown(n):
    if n == 0:
        print("Go!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)`,

    "3\n2\n1\nGo!",

    "What stops a recursive function from continuing forever?",

    ["A base case", "A print statement", "A string", "An import"],

    0,

    "It defines when recursion should stop.",

    {
      instructions: `Task: Complete a recursive factorial function.

Steps:
1. Keep the countdown function and call countdown(3)
2. Define factorial(n) with the base case: if n == 0, return 1
3. For other values, return n * factorial(n - 1)
4. Print factorial(5)
5. Print factorial(0)

Expected output:
3
2
1
Go!
120
1`,

      starterCode: `def countdown(n):
    if n == 0:
        print("Go!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)

def factorial(n):
    # Step 2: base case
    # Step 3: recursive case
    pass

# Steps 4 and 5: print the results
# TODO
`,

      solutionCode: `def countdown(n):
    if n == 0:
        print("Go!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)

def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(factorial(0))`,

      expectedResult: "3\n2\n1\nGo!\n120\n1",

      quizQuestions: [
        {
          question: "What is recursion?",
          options: [
            "A function calling itself",
            "A list sorting itself",
            "A file being opened",
            "A variable assignment",
          ],
          answer: 0,
        },
        {
          question: "What is a base case?",
          options: [
            "A condition that stops the recursive calls",
            "A variable used only in a loop",
            "A module import",
            "A print statement",
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
            "RecursionError is raised",
            "The program sorts the values",
            "Python returns zero",
            "The function becomes a list",
          ],
          answer: 0,
        },
        {
          question: "What is factorial(3) when factorial(n) returns n * factorial(n - 1) and factorial(0) is 1?",
          options: ["3", "6", "9", "1"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    49,
    "Modules and Imports",
    "Function Mountains",
    "Reuse functions and constants from Python modules.",

    `What is a module?
A module is a file of Python code that you can import and reuse. The standard library is a large collection of modules that come with Python, such as math, random, and datetime.

Importing
- import math makes the module available. Use dot notation: math.sqrt(16)
- from math import sqrt imports one name that you can use directly: sqrt(16)
- import math as m gives the module a shorter alias: m.sqrt(16)
Imports are normally written at the top of the file.

Useful items in the math module
- math.sqrt(x): square root (always a float)
- math.ceil(x): round up to the next whole number
- math.floor(x): round down to the previous whole number
- math.pi: the constant 3.14159...

Examples
math.sqrt(16)   gives 4.0
math.ceil(3.2)  gives 4
math.floor(3.8) gives 3
round(math.pi, 2) gives 3.14

Your own modules
Any Python file you write can be imported as a module by another file.

Common mistakes
- Using math.sqrt without importing math first (NameError).
- Writing sqrt(16) after import math instead of math.sqrt(16).
- Naming your own file math.py, which hides the real module.`,

    `import math
print(math.sqrt(16))
print(math.ceil(3.2))
print(round(math.pi, 2))`,

    "4.0\n4\n3.14",

    "Which keyword imports a module?",

    ["include", "using", "import", "require"],

    2,

    "It is followed by the module name.",

    {
      instructions: `Task: Use the math module.

Steps:
1. Import the math module
2. Print the square root of 25
3. Print 4.2 rounded up using ceil
4. Print 4.8 rounded down using floor
5. Print pi rounded to two decimal places

Expected output:
5.0
5
4
3.14`,

      starterCode: `# Step 1: import math
# TODO

# Step 2: square root of 25
# TODO

# Step 3: ceil(4.2)
# TODO

# Step 4: floor(4.8)
# TODO

# Step 5: round(math.pi, 2)
# TODO
`,

      solutionCode: `import math

print(math.sqrt(25))
print(math.ceil(4.2))
print(math.floor(4.8))
print(round(math.pi, 2))`,

      expectedResult: "5.0\n5\n4\n3.14",

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
          question: "After from math import sqrt, how do you call it?",
          options: ["sqrt(16)", "math.sqrt(16)", "import sqrt(16)", "from sqrt(16)"],
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

    `Checkpoint summary
This checkpoint reviews the key ideas of the Function Mountains.

Defining and calling
- A function is defined with def and runs only when it is called.
- Parameters are names in the definition. Arguments are the values supplied in the call, either by position or by keyword.
- Default arguments give parameters fallback values.

Results
- return sends a value back to the caller.
- print() only displays a value.
- A function without return gives back None.

Scope
Local variables exist only inside their function. Prefer parameters and return values to global variables.

Special functions
- A lambda is a one-expression anonymous function.
- A recursive function calls itself and needs a base case.

Modules
Use import to bring in modules, and dot notation (math.sqrt) to reach their names.

How to analyse a function
Identify its inputs (parameters), what it does with them, and what it returns.`,

    `def square(number):
    return number * number

for value in [2, 4, 6]:
    print(square(value))`,

    "4\n16\n36",

    "What does a function return if it has no return statement?",

    ["0", "False", "None", "An empty string"],

    2,

    "Python uses a special value to represent no result.",

    {
      type: "quiz",

      instructions: `Task: Write a function that converts minutes to seconds.

Steps:
1. Define minutes_to_seconds(minutes) that returns minutes * 60
2. Print minutes_to_seconds(2)
3. Print minutes_to_seconds(0)
4. Print minutes_to_seconds(1.5)

Expected output:
120
0
90.0`,

      starterCode: `def minutes_to_seconds(minutes):
    # Step 1: return minutes * 60
    pass

# Steps 2 to 4: print the three results
# TODO
`,

      solutionCode: `def minutes_to_seconds(minutes):
    return minutes * 60

print(minutes_to_seconds(2))
print(minutes_to_seconds(0))
print(minutes_to_seconds(1.5))`,

      expectedResult: "120\n0\n90.0",

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
          question: "Which keyword sends a result back to the caller?",
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

    `What is object-oriented programming?
Object-oriented programming (OOP) organises code around objects that combine data and behaviour.

Class
A class is a blueprint that describes a kind of object. It is defined with the class keyword. By convention, class names use CapitalizedWords.
Syntax:
class Dog:
    pass
(pass is a placeholder meaning "nothing here yet".)

Object (instance)
An object is a particular item created from a class by calling the class like a function.
pet = Dog()
Many objects can be created from one class, and each one is independent.

Attributes and methods
- Attributes are the data stored in an object.
- Methods are the actions an object can perform.
You can add an attribute with dot notation: pet.name = "Rex". Later lessons show how to set attributes properly using __init__.

Analogy
A Student class describes what every student has. Each Student object represents one specific student.

Checking the class of an object
type(pet).__name__ returns "Dog".

Common mistakes
- Forgetting the parentheses when creating an object (Dog instead of Dog()).
- Confusing the class (the blueprint) with an object (one item made from it).
- Using lowercase class names, which is legal but against convention.`,

    `class Dog:
    pass

pet = Dog()
print(type(pet).__name__)`,

    "Dog",

    "What is an object?",

    ["An instance of a class", "A loop", "A module", "A comment"],

    0,

    "It is created from a class.",

    {
      instructions: `Task: Define a class and create two independent objects from it.

Steps:
1. Define a class named Book with pass as its body
2. Create two objects, first and second
3. Print the class name of each object using type(...).__name__
4. Give first the attribute title = "Python Basics" and second the attribute title = "Data Science"
5. Print both titles
6. Print whether first is second

Expected output:
Book
Book
Python Basics
Data Science
False`,

      starterCode: `# Step 1: define the class
class Book:
    pass

# Step 2: create two objects
first = Book()
second = Book()

# Step 3: print each class name
# TODO

# Step 4: set the title attribute on each object
# TODO

# Step 5: print both titles
# TODO

# Step 6: print first is second
# TODO
`,

      solutionCode: `class Book:
    pass

first = Book()
second = Book()

print(type(first).__name__)
print(type(second).__name__)

first.title = "Python Basics"
second.title = "Data Science"
print(first.title)
print(second.title)

print(first is second)`,

      expectedResult: "Book\nBook\nPython Basics\nData Science\nFalse",

      quizQuestions: [
        {
          question: "What does a class define?",
          options: [
            "A blueprint for a type of object",
            "A loop count",
            "A file path",
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
          question: "What does pet = Dog() do?",
          options: [
            "Creates a Dog object",
            "Imports Dog",
            "Prints the class",
            "Deletes Dog",
          ],
          answer: 0,
        },
        {
          question: "What are attributes used for?",
          options: [
            "Storing an object's data",
            "Controlling indentation",
            "Naming files",
            "Exiting loops",
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

    `What is __init__?
__init__ is a special method that Python calls automatically whenever a new object is created. It sets up the object's starting attributes.

Syntax
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

Creating objects
first = Student("EVO", 90)
second = Student("Arun", 82)
The arguments in the call become the parameters after self.

What is self?
- self is the first parameter of every instance method.
- It refers to the object being created or used.
- Python passes it automatically. You do not write it in the call.

Storing data on the object
self.name = name stores the value on that specific object.
- name is a temporary parameter that disappears when __init__ ends.
- self.name is an attribute that stays with the object.

Reading and changing attributes
Use dot notation.
first.name gives "EVO"
first.score = 95 changes only first's score. second is not affected.

Common mistakes
- Forgetting self as the first parameter.
- Writing name = name instead of self.name = name, so nothing is stored on the object.
- Writing __init__ with a single underscore or the wrong spelling.
- Passing the wrong number of arguments when creating the object.`,

    `class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

first = Student("EVO", 90)
second = Student("Arun", 82)
print(first.name, first.score)
print(second.name, second.score)`,

    "EVO 90\nArun 82",

    "What does self refer to inside an instance method?",

    ["The current object", "The parent folder", "A module", "A loop"],

    0,

    "It refers to the object being used.",

    {
      instructions: `Task: Create a Student class that stores a name, a score, and a course.

Steps:
1. Define Student with __init__(self, name, score, course)
2. Store all three values as attributes using self
3. Create first = Student("EVO", 90, "Python") and second = Student("Arun", 82, "Java")
4. Print the name, score, and course of each student on one line
5. Change first's score to 95
6. Print first.score and second.score to show that the objects are independent

Expected output:
EVO 90 Python
Arun 82 Java
95
82`,

      starterCode: `class Student:
    def __init__(self, name, score, course):
        # Step 2: store the three values on self
        pass

# Step 3: create the two students
# TODO

# Step 4: print the details of each student
# TODO

# Step 5 and 6: change first.score and print both scores
# TODO
`,

      solutionCode: `class Student:
    def __init__(self, name, score, course):
        self.name = name
        self.score = score
        self.course = course

first = Student("EVO", 90, "Python")
second = Student("Arun", 82, "Java")

print(first.name, first.score, first.course)
print(second.name, second.score, second.course)

first.score = 95
print(first.score)
print(second.score)`,

      expectedResult: "EVO 90 Python\nArun 82 Java\n95\n82",

      quizQuestions: [
        {
          question: "What is __init__ used for?",
          options: [
            "Setting up an object's attributes when it is created",
            "Ending every loop",
            "Importing modules",
            "Sorting a list",
          ],
          answer: 0,
        },
        {
          question: "What does self refer to?",
          options: [
            "The current object",
            "The parent folder",
            "A module",
            "A string",
          ],
          answer: 0,
        },
        {
          question: "What does self.name = name do?",
          options: [
            "Stores the value on the object",
            "Creates a global variable",
            "Imports name",
            "Ends the class",
          ],
          answer: 0,
        },
        {
          question: "Can two Student objects hold different scores?",
          options: ["Yes", "No", "Only if their names match", "Only in a list"],
          answer: 0,
        },
        {
          question: "How many arguments do you pass when creating Student('EVO', 90)?",
          options: ["1", "2", "3", "0"],
          answer: 1,
        },
      ],
    }
  ),

  lesson(
    53,
    "Instance Methods",
    "Object-Oriented Grove",
    "Define actions that can read or update an object's state.",

    `What is an instance method?
An instance method is a function defined inside a class that works on one particular object.

Syntax
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def show(self):
        return self.value

How self works
The first parameter is self. Python fills it in automatically with the object the method is called on. counter.increment() is treated as increment(counter).

State
The attributes of an object together make up its state. Inside a method, read and change the state through self, for example self.value += 1.

Two kinds of methods
- Methods that change the object, such as increment(). They usually return nothing.
- Methods that report information, such as show(). They usually return a value.

Calling a method
Use dot notation on an object: counter.increment()

Independent objects
Each object keeps its own state. If counter and other are two Counter objects, incrementing one does not change the other.

Common mistakes
- Forgetting self in the method definition.
- Writing value instead of self.value inside a method.
- Calling a method without the parentheses.`,

    `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def show(self):
        return self.value

counter = Counter()
counter.increment()
counter.increment()
print(counter.show())`,

    "2",

    "Where are instance methods defined?",

    ["Inside a class", "Only inside loops", "Inside JSON", "Only in the terminal"],

    0,

    "They belong to the class definition.",

    {
      instructions: `Task: Complete a Counter class and test two independent counters.

Steps:
1. Complete the Counter class with increment(), reset(), and show()
2. Create counter = Counter()
3. Call increment() twice and print counter.show()
4. Call reset() and print counter.show()
5. Create other = Counter(), call increment() once, and print other.show()
6. Print counter.show() again to show that the counters are independent

Expected output:
2
0
1
0`,

      starterCode: `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        # Step 1: set the value back to 0
        pass

    def show(self):
        # Step 1: return the value
        pass

# Steps 2 to 6
counter = Counter()
# TODO
`,

      solutionCode: `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        self.value = 0

    def show(self):
        return self.value

counter = Counter()
counter.increment()
counter.increment()
print(counter.show())

counter.reset()
print(counter.show())

other = Counter()
other.increment()
print(other.show())
print(counter.show())`,

      expectedResult: "2\n0\n1\n0",

      quizQuestions: [
        {
          question: "Where is an instance method defined?",
          options: ["Inside a class", "Only in a list", "Only in a loop", "Inside a JSON file"],
          answer: 0,
        },
        {
          question: "What does self.value += 1 do?",
          options: [
            "Increases the object's value by one",
            "Deletes the object",
            "Creates a module",
            "Changes the class name",
          ],
          answer: 0,
        },
        {
          question: "What does the lesson example print?",
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
          question: "Two Counter objects are created and only one is incremented. What happens to the other?",
          options: [
            "It keeps its own value",
            "It is incremented too",
            "It is deleted",
            "It becomes a string",
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

    `What is inheritance?
Inheritance lets a new class reuse and extend an existing class.
- The existing class is the parent (also called base class or superclass).
- The new class is the child (also called subclass).

Syntax
Write the parent's name in parentheses after the child's name.
class Animal:
    def speak(self):
        print("Some sound")

class Dog(Animal):
    pass

What the child gets
The child automatically receives all the attributes and methods of the parent. Dog().speak() works without being rewritten and prints "Some sound".

Overriding
A child can replace an inherited method by defining a method with the same name. The child's version is used for the child's objects.
class Dog(Animal):
    def speak(self):
        print("Woof!")

Using super()
super() gives access to the parent's version. It is often used inside __init__ to run the parent's setup:
class Dog(Animal):
    def __init__(self, name):
        super().__init__(name)

"Is a" relationship
Use inheritance when the child is a specialised kind of the parent: a Dog is an Animal. Do not use it only to share code between unrelated classes.

Common mistakes
- Forgetting the parent in parentheses.
- Overriding a method with a different name, so the original is still used.
- Using inheritance where the classes are not truly related.`,

    `class Animal:
    def speak(self):
        print("Some sound")

class Dog(Animal):
    def speak(self):
        print("Woof!")

Dog().speak()`,

    "Woof!",

    "What is inheritance used for?",

    [
      "Reusing and extending an existing class",
      "Repeating a loop",
      "Converting a string",
      "Opening a file",
    ],

    0,

    "A child class can reuse a parent's behaviour.",

    {
      instructions: `Task: Build a small class hierarchy.

Steps:
1. Keep the Animal class with speak() printing Some sound
2. Keep Dog(Animal) overriding speak() to print Woof!
3. Define Cat(Animal) overriding speak() to print Meow!
4. Define Fish(Animal) that does not override speak()
5. Call speak() on a Dog, a Cat, an Animal, and a Fish, in that order

Expected output:
Woof!
Meow!
Some sound
Some sound`,

      starterCode: `class Animal:
    def speak(self):
        print("Some sound")

class Dog(Animal):
    def speak(self):
        print("Woof!")

# Step 3: define Cat and override speak()
# TODO

# Step 4: define Fish without overriding speak()
# TODO

# Step 5: call speak() on a Dog, a Cat, an Animal, and a Fish
# TODO
`,

      solutionCode: `class Animal:
    def speak(self):
        print("Some sound")

class Dog(Animal):
    def speak(self):
        print("Woof!")

class Cat(Animal):
    def speak(self):
        print("Meow!")

class Fish(Animal):
    pass

Dog().speak()
Cat().speak()
Animal().speak()
Fish().speak()`,

      expectedResult: "Woof!\nMeow!\nSome sound\nSome sound",

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
            "A class that inherits from another class",
            "A list of objects",
            "A string variable",
            "A file handle",
          ],
          answer: 0,
        },
        {
          question: "What does overriding a method mean?",
          options: [
            "Providing a new version of an inherited method in the child class",
            "Deleting every class",
            "Changing a variable into a list",
            "Importing a module",
          ],
          answer: 0,
        },
        {
          question: "What does class Dog(Animal) indicate?",
          options: [
            "Dog inherits from Animal",
            "Animal inherits from Dog",
            "Dog is a list",
            "Animal is a string",
          ],
          answer: 0,
        },
        {
          question: "A Fish class inherits from Animal and does not define speak(). What does Fish().speak() print?",
          options: ["Nothing", "Some sound", "Woof!", "An error"],
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

    `Checkpoint summary
This checkpoint reviews the key ideas of the Object-Oriented Grove.

Classes and objects
- A class is a blueprint. An object is an instance created from it.
- Attributes store an object's data. Methods define its actions.

Setting up objects
- __init__ runs automatically when an object is created and sets its starting attributes.
- self refers to the current object inside every instance method.
- Each object keeps its own attribute values.

Methods
- A method that changes state usually returns nothing.
- A method that reports information usually returns a value.
- Call methods with dot notation: object.method().

Inheritance
- class Child(Parent) reuses everything from Parent.
- A child can override a method by defining one with the same name.
- super() reaches the parent's version.

Design idea
Group related data and behaviour in one class so the program mirrors the things it models.`,

    `class Greeter:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Hello, {self.name}!"

print(Greeter("EVO").greet())`,

    "Hello, EVO!",

    "Which keyword defines a class?",

    ["object", "class", "defclass", "new"],

    1,

    "It introduces a class definition.",

    {
      type: "quiz",

      instructions: `Task: Design a Student class and test two objects.

Steps:
1. Define Student with __init__(self, name) that stores name
2. Add a method welcome(self) that returns Welcome, <name>! using an f-string
3. Create two students, "EVO" and "Arun"
4. Print the result of welcome() for each

Expected output:
Welcome, EVO!
Welcome, Arun!`,

      starterCode: `class Student:
    def __init__(self, name):
        # Step 1: store name on self
        pass

    def welcome(self):
        # Step 2: return the welcome message
        pass

# Steps 3 and 4
# TODO
`,

      solutionCode: `class Student:
    def __init__(self, name):
        self.name = name

    def welcome(self):
        return f"Welcome, {self.name}!"

first = Student("EVO")
second = Student("Arun")
print(first.welcome())
print(second.welcome())`,

      expectedResult: "Welcome, EVO!\nWelcome, Arun!",

      quizQuestions: [
        {
          question: "What is an object?",
          options: ["An instance of a class", "A keyword", "A loop", "A comment"],
          answer: 0,
        },
        {
          question: "What is self used for?",
          options: [
            "Referring to the current object",
            "Importing modules",
            "Stopping loops",
            "Printing output",
          ],
          answer: 0,
        },
        {
          question: "Which method sets up an object's attributes when it is created?",
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

    `Why use files?
Files store data that stays available after a program ends. Programs read files to load notes, settings, and records.

Opening a file
Syntax:
open(path, mode, encoding="utf-8")
- path is the file name or location.
- mode says how the file is used. "r" means read and is the default.
- encoding="utf-8" tells Python how to decode the text.
open() returns a file object.

The with statement
with open("notes.txt", "r", encoding="utf-8") as file:
    content = file.read()
The with statement closes the file automatically when its block ends, even if an error occurs. It is the recommended way to work with files.

Ways to read
- file.read() returns the whole content as one string.
- file.readline() returns one line.
- file.readlines() returns a list of lines.
- for line in file: visits one line at a time.

Newline characters
Each line from a file ends with a newline character, written as \\n. Use line.strip() to remove it.

File paths
A relative path such as "notes.txt" is looked up from the program's current working directory.

Errors
Opening a file that does not exist in read mode raises FileNotFoundError.

Common mistakes
- Forgetting that lines include a newline at the end.
- Reading a file that was never created.
- Forgetting to use with, leaving the file open.`,

    `with open("notes.txt", "r", encoding="utf-8") as file:
    content = file.read()
    print(content)`,

    "Displays the contents of notes.txt when the file exists.",

    "Which mode is used to read a file?",

    ["'w'", "'r'", "'x'", "'a'"],

    1,

    "It stands for read.",

    {
      instructions: `Task: Create a small file, then read it back in two different ways. (Requires a Python environment that supports files.)

Steps:
1. Write the two lines Learn Python. and Practise daily. to notes.txt
2. Open notes.txt in read mode and print its whole content using read() with end=""
3. Open the file again and loop through it with enumerate(file, start=1)
4. Print each line number and the line with its newline removed using strip()

Expected output:
Learn Python.
Practise daily.
1 Learn Python.
2 Practise daily.`,

      starterCode: `# Step 1: create the file
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Learn Python.\\nPractise daily.\\n")

# Step 2: read the whole file and print it
# TODO

# Steps 3 and 4: loop through the lines and print numbered lines
# TODO
`,

      solutionCode: `with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Learn Python.\\nPractise daily.\\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read(), end="")

with open("notes.txt", "r", encoding="utf-8") as file:
    for number, line in enumerate(file, start=1):
        print(number, line.strip())`,

      validation: "manual",

      expectedResult: "Learn Python.\nPractise daily.\n1 Learn Python.\n2 Practise daily.",

      quizQuestions: [
        {
          question: "Which mode opens an existing file for reading?",
          options: ["'w'", "'r'", "'a'", "'x'"],
          answer: 1,
        },
        {
          question: "What does read() return for a text file?",
          options: [
            "The file's content as a string",
            "A class definition",
            "A database table",
            "A random number",
          ],
          answer: 0,
        },
        {
          question: "Why use with open(...) as file?",
          options: [
            "The file is closed automatically when the block ends",
            "It deletes the file automatically",
            "It converts every line to a number",
            "It disables errors",
          ],
          answer: 0,
        },
        {
          question: "What happens if notes.txt does not exist and you open it in read mode?",
          options: [
            "FileNotFoundError is raised",
            "Python always creates it",
            "It returns an empty list",
            "The file is renamed",
          ],
          answer: 0,
        },
        {
          question: "Which method removes the newline from the end of a line?",
          options: ["strip()", "append()", "split()", "sort()"],
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

    `File modes for writing
- "w" (write): creates the file if it does not exist. If it already exists, its old content is erased immediately.
- "a" (append): keeps the existing content and adds new text at the end.
- "x" (exclusive): creates a new file and raises an error if the file already exists.

Writing text
file.write(text) writes a string to the file.
- It does not add a newline automatically. Include \\n at the end of each line.
- Only strings can be written. Convert numbers first: file.write(str(42)).

Syntax
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Hello EVOLV!\\n")
    file.write("Keep learning.\\n")

Why use with
The with statement saves the data and closes the file when its block ends.

Choosing the right mode
- Use "w" to start a file from scratch.
- Use "a" to add to a log or list without losing earlier content.
- Use "r" to read.

Common mistakes
- Opening an important file with "w" and losing its content.
- Forgetting \\n, so all text ends up on one line.
- Writing a number without converting it to a string.`,

    `with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Hello EVOLV!\\n")
    file.write("Keep learning.\\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read(), end="")`,

    "Hello EVOLV!\nKeep learning.",

    "Which file mode erases the existing contents of a file?",

    ["'r'", "'w'", "'a'", "'read'"],

    1,

    "Be careful: this mode overwrites existing contents.",

    {
      instructions: `Task: Compare write mode and append mode. (Requires a Python environment that supports files.)

Steps:
1. Write First line to notes.txt using mode "w"
2. Append Second line using mode "a"
3. Read the file and print its content with end=""
4. Open the file in "w" mode again and write Fresh start
5. Read the file and print its content with end=""

Expected output:
First line
Second line
Fresh start`,

      starterCode: `# Step 1: write the first line
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("First line\\n")

# Step 2: append the second line
# TODO

# Step 3: read and print the file
# TODO

# Step 4: overwrite the file
# TODO

# Step 5: read and print the file again
# TODO
`,

      solutionCode: `with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("First line\\n")

with open("notes.txt", "a", encoding="utf-8") as file:
    file.write("Second line\\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read(), end="")

with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Fresh start\\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read(), end="")`,

      validation: "manual",

      expectedResult: "First line\nSecond line\nFresh start",

      quizQuestions: [
        {
          question: "Which mode overwrites the existing contents of a file?",
          options: ["'r'", "'w'", "'a'", "'read'"],
          answer: 1,
        },
        {
          question: "Which mode adds text to the end of a file?",
          options: ["'r'", "'w'", "'a'", "'x'"],
          answer: 2,
        },
        {
          question: "Does write() add a newline automatically?",
          options: ["Yes, always", "No", "Only for numbers", "Only in append mode"],
          answer: 1,
        },
        {
          question: "How do you write the number 42 to a text file?",
          options: [
            "file.write(str(42))",
            "file.write(42)",
            "file.write[42]",
            "file.print(42)",
          ],
          answer: 0,
        },
        {
          question: "Which mode should you use to keep existing text and add more?",
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

    `What is an exception?
An exception is an error that happens while a program is running and interrupts its normal flow. If it is not handled, the program stops.

Common exceptions
- ValueError: the value is unsuitable, such as int("abc")
- TypeError: the wrong type, such as "a" + 1
- ZeroDivisionError: dividing by zero
- IndexError: a list index is out of range
- KeyError: a dictionary key does not exist
- FileNotFoundError: the file does not exist

try and except
try:
    code that might fail
except ValueError:
    code that runs only if a ValueError occurs

Extra blocks
- else: runs only if the try block finished with no exception.
- finally: runs in every case, and is used for cleanup.

Full structure
try:
    number = int(text)
except ValueError:
    print("Please enter a whole number")
else:
    print(number * 2)
finally:
    print("Done")

Be specific
Catch the specific exception you expect. A bare except: can hide unrelated bugs.

Syntax errors are different
A SyntaxError is found before the program runs, so try/except cannot handle it.

Common mistakes
- Using a bare except:.
- Putting too much code inside try.
- Forgetting the colon after try, except, else, or finally.`,

    `try:
    number = int("abc")
except ValueError:
    print("Please enter a whole number")
else:
    print(number * 2)`,

    "Please enter a whole number",

    "Which block handles an exception that occurs in the try block?",

    ["try", "except", "class", "for"],

    1,

    "It follows the try block.",

    {
      instructions: `Task: Handle two kinds of expected errors.

Steps:
1. Use text = "abc"
2. In a try block, convert text to an integer
3. In an except ValueError block, print Please enter a whole number
4. In an else block, print the number multiplied by 2
5. In a finally block, print Done
6. In a second try block, print 10 / 0 and handle ZeroDivisionError by printing Cannot divide by zero

Expected output:
Please enter a whole number
Done
Cannot divide by zero`,

      starterCode: `text = "abc"

# Steps 2 to 5: try / except / else / finally
# TODO

# Step 6: handle division by zero
# TODO
`,

      solutionCode: `text = "abc"

try:
    number = int(text)
except ValueError:
    print("Please enter a whole number")
else:
    print(number * 2)
finally:
    print("Done")

try:
    print(10 / 0)
except ZeroDivisionError:
    print("Cannot divide by zero")`,

      expectedResult: "Please enter a whole number\nDone\nCannot divide by zero",

      quizQuestions: [
        {
          question: "Which block contains code that might raise an exception?",
          options: ["try", "except", "class", "for"],
          answer: 0,
        },
        {
          question: "Which exception does int('abc') raise?",
          options: ["ValueError", "IndexError", "KeyError", "StopIteration"],
          answer: 0,
        },
        {
          question: "When does the else block of try/except/else run?",
          options: [
            "When the try block finishes without an exception",
            "Every time before try",
            "Only when an exception occurs",
            "Only inside a loop",
          ],
          answer: 0,
        },
        {
          question: "Why catch a specific exception type?",
          options: [
            "To handle expected failures without hiding unrelated bugs",
            "To disable all errors permanently",
            "To skip all program statements",
            "To convert every exception into a number",
          ],
          answer: 0,
        },
        {
          question: "What does a finally block do?",
          options: [
            "Runs in every case, success or failure",
            "Runs only when no error occurs",
            "Runs only when an error occurs",
            "Defines a new function",
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

    `What are built-in functions?
Built-in functions are always available. You do not need to import anything to use them.

Functions for collections
- len(x): number of items
- sum(numbers): total of the numbers
- min(x) and max(x): smallest and largest value
- sorted(x): a new sorted list. The original is not changed. sorted(x, reverse=True) sorts in descending order.

Functions for numbers
- round(number, digits): rounds to the given number of decimals
- abs(number): absolute value, so abs(-7) is 7

Functions for loops and pairs
- enumerate(items): gives an index and an item together
- zip(a, b): combines two sequences item by item
for name, score in zip(names, scores):
    print(name, score)

Inspecting values
- type(x) reports the type of a value.

Calculating an average
average = sum(numbers) / len(numbers)

Why use them
Built-ins are fast, tested, and clear. They often replace a loop you would otherwise write by hand.

Common mistakes
- Using sum() on a list of strings.
- Calling min() or max() on an empty list (ValueError).
- Forgetting that sorted() returns a new list and does not sort in place.`,

    `scores = [72, 90, 84]
print(len(scores))
print(sum(scores))
print(min(scores))
print(max(scores))
print(sorted(scores))`,

    "3\n246\n72\n90\n[72, 84, 90]",

    "Which function returns the number of items in a sequence?",

    ["sum()", "len()", "max()", "type()"],

    1,

    "It reports the length.",

    {
      instructions: `Task: Analyse a list of scores using built-in functions.

Steps:
1. Use scores = [72, 90, 84] and names = ["Asha", "EVO", "Arun"]
2. Print the number of scores
3. Print the total
4. Print the average (total divided by count)
5. Print the minimum and the maximum
6. Print the scores sorted in ascending order
7. Use zip() to print each name with its score

Expected output:
3
246
82.0
72
90
[72, 84, 90]
Asha 72
EVO 90
Arun 84`,

      starterCode: `scores = [72, 90, 84]
names = ["Asha", "EVO", "Arun"]

# Step 2: count
# TODO

# Step 3: total
# TODO

# Step 4: average
# TODO

# Step 5: minimum and maximum
# TODO

# Step 6: sorted scores
# TODO

# Step 7: names with scores using zip()
# TODO
`,

      solutionCode: `scores = [72, 90, 84]
names = ["Asha", "EVO", "Arun"]

print(len(scores))
print(sum(scores))
print(sum(scores) / len(scores))
print(min(scores))
print(max(scores))
print(sorted(scores))

for name, score in zip(names, scores):
    print(name, score)`,

      expectedResult: "3\n246\n82.0\n72\n90\n[72, 84, 90]\nAsha 72\nEVO 90\nArun 84",

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
          question: "What does zip(['a', 'b'], [1, 2]) pair together?",
          options: [
            "'a' with 1 and 'b' with 2",
            "'a' with 2 and 'b' with 1",
            "All items in one tuple",
            "Nothing",
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

    `Challenge overview
This challenge combines the main ideas of the course in one function: a function, a loop, a condition, an accumulator, and a return value.

The building blocks
1. Function: define it with def and give it a parameter, such as numbers.
2. Loop: for number in numbers: visits every item of the list.
3. Condition: number % 2 == 0 is True for even numbers, because an even number leaves a remainder of 0 when divided by 2.
4. Accumulator: create total = 0 before the loop and update it with total += number inside the loop.
5. Return: return total sends the final result back to the caller.

Putting it together
def total_even(numbers):
    total = 0
    for number in numbers:
        if number % 2 == 0:
            total += number
    return total

Edge cases
A good function works for every valid input.
- A list with no even numbers returns 0.
- An empty list returns 0, because the loop body never runs and total keeps its starting value.

How to test a function
Call it with typical values, boundary values, and empty input, then compare each result with what you expect.

Common mistakes
- Creating total inside the loop, so it resets every time.
- Using print(total) instead of return total.
- Placing return inside the loop, which ends the function after the first item.`,

    `def total_even(numbers):
    total = 0
    for number in numbers:
        if number % 2 == 0:
            total += number
    return total

print(total_even([1, 2, 3, 4, 5, 6]))`,

    "12",

    "What is the total of the even numbers in [1, 2, 3, 4, 5, 6]?",

    ["9", "10", "12", "21"],

    2,

    "Add 2, 4, and 6.",

    {
      type: "hands-on",
      difficulty: "Intermediate",
      duration: "15 min",

      instructions: `Task: Complete total_even(numbers) so it returns the sum of the even numbers in a list.

Steps:
1. Create total = 0 inside the function
2. Loop through numbers
3. If a number is even (number % 2 == 0), add it to total
4. Return total after the loop
5. Test the function with [1, 2, 3, 4, 5, 6], [2, 4], [1, 3, 5] and []

Expected output:
12
6
0
0`,

      starterCode: `def total_even(numbers):
    total = 0
    # Step 2: loop through the numbers
    # Step 3: add only the even numbers to total
    # Step 4: return total
    pass

print(total_even([1, 2, 3, 4, 5, 6]))
print(total_even([2, 4]))
print(total_even([1, 3, 5]))
print(total_even([]))
`,

      solutionCode: `def total_even(numbers):
    total = 0
    for number in numbers:
        if number % 2 == 0:
            total += number
    return total

print(total_even([1, 2, 3, 4, 5, 6]))
print(total_even([2, 4]))
print(total_even([1, 3, 5]))
print(total_even([]))`,

      expectedResult: "12\n6\n0\n0",

      quizQuestions: [
        {
          question: "Which keyword defines total_even?",
          options: ["def", "class", "loop", "print"],
          answer: 0,
        },
        {
          question: "Which expression is True when number is even?",
          options: ["number % 2 == 0", "number % 2 == 1", "number // 2 == 0", "number / 2"],
          answer: 0,
        },
        {
          question: "Why is total set to 0 before the loop?",
          options: [
            "It is the starting value of the sum",
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