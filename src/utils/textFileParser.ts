// This file parses the text file which has inputs in the Question new line options and with each question separated by an empty line
interface QuestionOption {
  question: string;
  options: string[];
}

export const parseTextFile = (text: string): QuestionOption[] => {
  const lines = text.split("\n");
  const questions: QuestionOption[] = [];
  let currentQuestion: QuestionOption | null = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
    } else {
      if (!currentQuestion) {
        currentQuestion = { question: trimmedLine, options: [] };
      } else {
        currentQuestion.options.push(trimmedLine);
      }
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
};

export const readFile = () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".docx";

  fileInput.onchange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        const questions = parseTextFile(text);
        console.log(questions);
      };

      reader.readAsText(file, "utf-8");
    }
  };

  fileInput.click();
};
