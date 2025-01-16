import React from "react";

interface QuestionOption {
  question: string;
  options: string[];
}

const UploadPreview = ({ questions }: { questions: QuestionOption[] }) => {
  return (
    <div>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-container">
          <label className="question-label">Question {qIndex + 1}:</label>
          <hr className="q-break" />
          <textarea className="question-input" value={q.question} />

          {q.options.map((option, oIndex) => (
            <div key={oIndex}>
              <label className="option-label">Option {oIndex + 1}:</label>
              <textarea className="option-input" value={option} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UploadPreview;
