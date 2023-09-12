import React, { useState, useMemo } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useDebounce } from "use-debounce";

import "./styles.css";

import { usePdfTextSearch } from "./usePdfTextSearch";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfFileViewer = () => {
  const defaultSearchString = "appen"; // just here for the sake of loading the page with default results
  const [searchString, setSearchString] = useState(defaultSearchString);
  const [debouncedSearchString] = useDebounce(searchString, 250);

  const file =
    "https://dev-gist-chatbot-app-assets.s3.ap-south-1.amazonaws.com/public/jess1a1.pdf";
  const searchResults = usePdfTextSearch(file, debouncedSearchString);

  const textRenderer = useMemo(() => {
    // console.log("usememo");
    return (textItem) => {
      // console.log("memo ", textItem);
      if (!textItem) return null;
      return highlightPattern(textItem.str, debouncedSearchString);
    };
  }, [debouncedSearchString]);

  let resultText =
    searchResults.length === 1
      ? "Results found on 1 page"
      : `Results found on ${searchResults.length} pages`;

  if (searchResults.length === 0) {
    resultText = "No results found";
  }

  function highlightPattern(text, pattern) {
    // console.log("===========" + text + "=========" + pattern);

    const regex = new RegExp(`(${pattern})`, "gi"); // Case-insensitive, global match
    const splitText = text.split(regex);

    // console.log(splitText + "-------------------", splitText.length);

    if (splitText.length <= 1) {
      return text;
    }
    // console.log(splitText + "-------------------");
    const highlightedParts = [];

    for (let i = 0; i < splitText.length; i++) {
      const part = splitText[i];
      if (regex.test(part)) {
        highlightedParts.push(
          <span
            key={i}
            style={{
              backgroundColor: "red",
              opacity: "0.6",
              zIndex: 1,
              padding: "2px"
            }}
          >
            {part}
          </span>
        );
      } else {
        highlightedParts.push(part);
      }
    }
    console.log(highlightedParts + "-------------------");
    return highlightedParts;
  }

  return (
    <>
      <input
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        type="text"
      />
      <button onClick={() => setSearchString("")}>Clear</button>
      <p>{resultText}</p>
      <Document file={file}>
        {searchString &&
          searchResults &&
          searchResults.map((searchResultPageNumber) => (
            <Page
              key={searchResultPageNumber}
              pageNumber={searchResultPageNumber}
              customTextRenderer={textRenderer}
              renderTextLayer={true}
            />
          ))}
      </Document>
    </>
  );
};

export default function App() {
  return (
    <div className="App">
      <PdfFileViewer />
    </div>
  );
}
