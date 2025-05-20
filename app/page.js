"use client";
import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar"; // Import Navbar
import Footer from "@/components/Footer";   // Import Footer
import styles from './Page.module.css'; // Import CSS module
// import { Button } from "@/components/ui/button"; // Import ShadCN Button
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import ShadCN Card for structure
// We will create styles for these elements in a CSS module later
// For now, replace with standard HTML elements

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]); // Changed from selectedFile to selectedFiles
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to Array
    if (files.length > 0) {
      const pdfFiles = files.filter(file => file.type === "application/pdf");
      if (pdfFiles.length > 0) {
        setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]); // Append new valid files
        setError("");
        setProgress(0);
      } else {
        setError("Please select PDF files only.");
        // Optionally clear existing selection or just don't add non-PDFs
        // setSelectedFiles([]); // Uncomment to clear selection if non-PDFs are chosen
      }
      // Clear the input value to allow selecting the same file(s) again if needed
      if (event.target) event.target.value = null;
    }
  };

  const handleSummarizePdf = async () => {
    if (selectedFiles.length === 0) { // Changed from !selectedFile
      setError("Please select at least one PDF file.");
      return;
    }
    setIsLoading(true);
    setError("");
    setProgress(0);
    const formData = new FormData();
    selectedFiles.forEach(file => { // Loop through selectedFiles
      formData.append("files", file); // Append each file
    });

    try {
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 90) setProgress(currentProgress);
        else clearInterval(progressInterval);
      }, 200);

      const response = await fetch("/api/summarize", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        setError(errorData.error || `API request failed: ${response.status}`);
        setProgress(0);
      } else {
        const apiResponse = await response.json();
        if (typeof apiResponse.result === 'string') {
          try {
            // JSON.parse(apiResponse.result); // Optional validation, dashboard does it
            sessionStorage.setItem('healthData', apiResponse.result);
            setError("");
            setProgress(100);
            router.push('/dashboard');
          } catch (e) {
            setError("Received malformed data from summarization.");
            setProgress(0);
          }
        } else {
          setError("Received unexpected data format.");
          setProgress(0);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    // className="flex flex-col min-h-screen bg-background"
    // Styles will be applied via Page.module.css
    <div id="home-container" className={styles.homeContainer}> 
      <Navbar />
      {/* className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 text-foreground" */}
      <main id="home-main-content" className={styles.homeMainContent}>
        {/* className="mb-10 sm:mb-12 text-center" */}
        <header id="home-header" className={styles.homeHeader}>
          {/* className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 bg-testcolorred" */}
          <h1 id="home-main-title" className={styles.homeMainTitle}>
            Health Report Analyzer
          </h1>
          {/* className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground" */}
          <p id="home-subtitle" className={styles.homeSubtitle}>
            Upload your PDF health report for an AI-powered analysis and dashboard.
          </p>
        </header>

        {/* className="w-full max-w-lg sm:max-w-xl shadow-2xl" */}
        <div id="upload-card" className={styles.uploadCard}> {/* Was Card */}
          {/* <CardHeader> */}
          <div id="upload-card-header" className={styles.uploadCardHeader}>
            {/* className="text-2xl sm:text-3xl text-center" */}
            <h2 id="upload-card-title" className={styles.uploadCardTitle}>Upload Your Report</h2> {/* Was CardTitle */}
          </div>
          {/* </CardHeader> */}
          {/* className="space-y-6 sm:space-y-8 p-6 sm:p-8" */}
          <div id="upload-card-content" className={styles.uploadCardContent}> {/* Was CardContent */}
            <div>
              <input
                type="file"
                accept="application/pdf"
                multiple // Allow multiple file selection
                onChange={handleFileChange}
                // className="hidden" // Will be styled to be hidden visually but accessible
                style={{ display: 'none' }}
                ref={fileInputRef}
                id="pdfUpload"
              />
              {/* 
                onClick={triggerFileInput}
                variant="outline"
                className="w-full text-base py-6 sm:py-7"
                size="lg"
              */}
              <button
                onClick={triggerFileInput}
                id="select-file-button"
                className={styles.selectFileButton}
              >
                {selectedFiles.length > 0 ? `Selected: ${selectedFiles.length} file(s)` : "Select PDF Report(s)"}
              </button> {/* Was Button */}
              {selectedFiles.length > 0 && (
                <div className={styles.selectedFilesList}>
                  <p>Files to upload:</p>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* className="text-sm text-destructive text-center break-words" */}
            {error && <p id="error-message" className={styles.errorMessage}>{error}</p>}

            {selectedFiles.length > 0 && ( // Changed from selectedFile
              /*
                onClick={handleSummarizePdf}
                disabled={isLoading}
                className="w-full text-base py-6 sm:py-7"
                size="lg"
              */
              <button
                onClick={handleSummarizePdf}
                disabled={isLoading}
                id="analyze-button"
                className={styles.analyzeButton}
              >
                {isLoading ? `Analyzing... ${progress}%` : "Analyze & View Dashboard"}
              </button> // Was Button
            )}

            {isLoading && (
              // className="text-center"
              <div id="loading-indicator" className={styles.loadingIndicator}>
                {/* className="w-full bg-muted rounded-full h-2.5 mt-1" */}
                <div id="progress-bar-container" className={styles.progressBarContainer}>
                  {/*
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  */}
                  <div
                    id="progress-bar"
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {/* Error during loading can be shown via the main 'error' state */}
              </div>
            )}
          </div> {/* Was CardContent */}
        </div> {/* Was Card */}
      </main>
      <Footer />
    </div>
  );
}
