import { AccountCircle } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Slider,
  Switch,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import React, { FormEvent, useState } from "react";
import "./App.css";
import DocxReader from "./DocumentReader";
import UploadPreview from "./UploadPreview";

// Types for our data structures
interface QuestionOption {
  question: string;
  options: string[];
}

interface ScrambledQuestion {
  question: string;
  options: string[];
}

const MultipleChoiceScrambler: React.FC = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const OPTIONS = 4;

  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [paperCount, setPaperCount] = useState<number>(1);
  const [uploadQP, setUploadQP] = useState<boolean>(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: Array(OPTIONS).fill(""),
      },
    ]);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const scrambleGenerator = (
    questionOptions: QuestionOption[]
  ): ScrambledQuestion[] => {
    return shuffleArray(questionOptions).map((question) => ({
      question: question.question,
      options: shuffleArray(question.options),
    }));
  };

  const writeToTextFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateAndSaveTextFile = (
    scrambledQuestions: ScrambledQuestion[],
    version: number
  ) => {
    let formattedContent = `Version - ${version}\n`;
    formattedContent +=
      "-----------------------------------------------------------------------------------\n \n \n \n";
    scrambledQuestions.forEach((q, i) => {
      formattedContent += `________ ${i + 1} : ${q.question}\n`;
      q.options.forEach((option, j) => {
        formattedContent += `${letters[j]}) ${option}\n`;
      });
      formattedContent +=
        "-----------------------------------------------------------------------------------\n";
    });

    const filename = `MCQGenerator - ${new Date().toDateString()} - ${version}.txt`;
    writeToTextFile(filename, formattedContent);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const scrambledQuestionSets = Array.from({ length: paperCount }, () =>
      scrambleGenerator(questions)
    );

    scrambledQuestionSets.forEach((set, index) => {
      generateAndSaveTextFile(set, index + 1);
    });
  };

  function valuetext(value: number) {
    setPaperCount(Number(value));
    return `${value}°C`;
  }

  const marks = [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 3,
      label: "3",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 5,
      label: "5",
    },
  ];

  const [auth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1976d2",
      },
    },
  });

  return (
    <>
      <AppBar position="static">
        <Toolbar color="orange">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MCQ Scrambler
          </Typography>
          {auth && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="paper-count-container">
            <InputLabel id="paper-version-label">
              Select the number of versions you want to generate
            </InputLabel>
            <Slider
              aria-label="PaperVersion"
              valueLabelDisplay="auto"
              defaultValue={1}
              getAriaValueText={valuetext}
              shiftStep={30}
              step={1}
              marks={marks}
              min={1}
              max={5}
              style={{ width: "200px" }}
            />
          </div>
          <div style={{ paddingTop: "8px" }}>
            <Switch
              checked={uploadQP}
              onChange={() => setUploadQP(!uploadQP)}
              name="loading"
              color="primary"
            />
            <text
              style={{
                paddingInline: "10px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              Upload Question Paper for parsing
            </text>
          </div>

          {!uploadQP && (
            <>
              <h4>Enter the Questions and Options</h4>
              <div id="questions-container">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="question-container">
                    <label className="question-label">
                      Question {qIndex + 1}:
                      <input
                        className="question-input"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, e.target.value)}
                      />
                    </label>

                    {q.options.map((option, oIndex) => (
                      <div key={oIndex}>
                        <label className="option-label">
                          Option {oIndex + 1}:
                          <input
                            className="option-input"
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {uploadQP && <DocxReader setQuestionsCB={setQuestions} />}
          {questions.length > 0 && uploadQP && (
            <UploadPreview questions={questions} />
          )}

          {questions.length > 0 && (
            <div
              style={{
                margin: "20px 0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                style={{ marginRight: "10px" }}
              >
                Generate Question Papers
              </Button>
              <Button variant="contained" type="button" onClick={addQuestion}>
                Add Question
              </Button>
            </div>
          )}
          {questions.length === 0 && (
            <Button variant="contained" type="button" onClick={addQuestion}>
              Add Question
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default MultipleChoiceScrambler;
