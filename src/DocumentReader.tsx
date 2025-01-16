import { Input, InputLabel } from "@mui/material";
import { DOMParser } from "@xmldom/xmldom";
import PizZip from "pizzip";

interface QuestionOption {
  question: string;
  options: string[];
}

function str2xml(str: string) {
  if (str.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substr(1);
  }
  return new DOMParser().parseFromString(str, "text/xml");
}

// Get paragraphs as javascript array
function getParagraphs(
  content: string | number[] | ArrayBuffer | null | undefined
) {
  const zip = new PizZip(content as any);
  const xml = str2xml(zip.files["word/document.xml"].asText());
  const paragraphsXml = xml.getElementsByTagName("w:p");
  const paragraphs = [];

  for (let i = 0, len = paragraphsXml.length; i < len; i++) {
    let fullText = "";
    const textsXml = paragraphsXml[i].getElementsByTagName("w:t");
    for (let j = 0, len2 = textsXml.length; j < len2; j++) {
      const textXml = textsXml[j];
      if (textXml.childNodes) {
        fullText += textXml.childNodes[0].nodeValue;
      }
    }
    if (fullText) {
      paragraphs.push(fullText);
    }
  }
  return parseTextFile(paragraphs);
}

const parseTextFile = (lines: string[]): QuestionOption[] => {
  const questions: QuestionOption[] = [];
  let currentQuestion: QuestionOption | null = null;
  const pattern = /^(_*\s*\d+\)?\s*|Question\s*\d+[):]\s*)/;

  lines.forEach((line) => {
    let trimmedLine = line.trim();
    if (trimmedLine.startsWith("Question") || trimmedLine.startsWith("___")) {
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
      if (!currentQuestion) {
        trimmedLine = trimmedLine.replace(pattern, "");
        currentQuestion = { question: trimmedLine, options: [] };
      }
    } else {
      trimmedLine = trimmedLine.replace(pattern, "");
      if (!currentQuestion) {
        currentQuestion = { question: trimmedLine, options: [] };
      } else {
        trimmedLine = trimmedLine.replace(/^.(\)|.)?/, "").trim();
        currentQuestion.options.push(trimmedLine);
      }
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
};

const DocxReader = ({ setQuestionsCB }: any) => {
  const onFileUpload = (event: { target: { files: any[] } }) => {
    const reader = new FileReader();
    let file = event.target.files[0];

    reader.onload = (e) => {
      const content = e.target?.result;
      const paragraphs = getParagraphs(content);
      setQuestionsCB(paragraphs);
    };

    reader.onerror = (err) => console.error(err);

    reader?.readAsBinaryString?.(file);
  };

  return (
    <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
      <InputLabel style={{ marginRight: "15px" }}>
        Upload your Question Paper (.docx only)
      </InputLabel>
      <Input
        placeholder=""
        // accept=".docx"
        type="file"
        onChange={onFileUpload as any}
        name="docx-reader"
        inputProps={{ "aria-label": "Upload your Question Paper" }}
      />
    </div>
  );
};

export default DocxReader;
