import { NextRequest, NextResponse } from 'next/server';
// formidable is no longer used
// fs.promises might not be needed if not writing temp files, but Gemini SDK might use it or other fs aspects.
// For now, let's assume Gemini SDK handles its needs or we pass data directly.
// import fs from 'fs/promises'; 
// path is likely not needed
// import path from 'path'; 
import * as genai from '@google/generative-ai';
import { Part } from '@google/generative-ai'; // Import Part type if needed for casting, though often inferred

// Disable Next.js body parser for manual form data handling
export const config = {
  api: {
    bodyParser: false,
  },
};

// --- API Handler ---
export async function POST(req) {
  try {
    const formData = await req.formData();
    const userPrompt = `
You are an AI medical data extraction and structuring assistant.
Process the provided medical report OCR text and extract all relevant diagnostic data.
Organize this data into a structured JSON format. The timeline of events MUST be in chronological order based on the event date (earliest first).

The JSON output must strictly adhere to the following schema:

{
  "patientInfo": {
    "name": "string | null",
    "age": "string | null (e.g., '22Y 0M 1D' or '45')",
    "gender": "string | null ('Male', 'Female', 'Other')",
    "dob": "string | null (e.g., 'DD-MMM-YYYY')",
    "uhid": "string | null",
    "phone": "string | null",
    "address": "string | null",
    "allergy": "string | null"
    // Add other consistent patient-level details if any
  },
  "timeline": [
    {
      "id": "string (generate a unique ID like 'event-YYYYMMDD-type-1')",
      "date": "string (ISO 8601 format, e.g., 'YYYY-MM-DDTHH:mm:ssZ'. Be as precise as possible from report timestamps)",
      "eventType": "string (must be one of: 'BloodTest', 'RadiologyReport', 'Consultation', 'Diagnosis', 'Medication', 'HospitalAdmission', 'Discharge', 'OtherClinicalInfo')",
      "facilityName": "string | null (name of the healthcare facility or testing center)",
      "summary": "string (a concise, 1-2 sentence AI-generated summary of this event)",
      "details": {
        // Details object structure depends on eventType.
        // For "BloodTest": {
        //   "panels": [
        //     {
        //       "panelName": "string (e.g., 'HEMOGRAM (CBC+ESR+PS)')",
        //       "results": [
        //         {
        //           "testName": "string",
        //           "value": "string | number",
        //           "unit": "string | null",
        //           "referenceRange": "string | null",
        //           "flag": "string | null ('Normal', 'Abnormal', 'High', 'Low', 'Critical' - infer from value vs range or symbols like '*')",
        //           // Include impression lines related to a test group if available
        //         }
        //       ]
        //     }
        //   ]
        // }
        // For "RadiologyReport": {
        //   "modality": "string (e.g., 'X-Ray Chest PA', 'ULTRASOUND - WHOLE ABDOMEN')",
        //   "bodyPart": "string | null",
        //   "referringDoctor": "string | null",
        //   "reportingDoctor": "string | null", // If identifiable (e.g. signed by)
        //   "findings": "string (summary or list of findings)",
        //   "impression": "string (conclusion/impression)"
        // }
        // For "Consultation": {
        //   "doctorName": "string | null",
        //   "specialty": "string | null",
        //   "chiefComplaints": "string | null",
        //   "physicalExamination": "string | null",
        //   "vitals": { /* object with vital signs like pulseRate, bp, height, weight, bmi, bsa */ },
        //   "investigationResultsSummary": "string | null (summary of any tests mentioned in consultation notes)",
        //   "notes": "string | null (other relevant notes, advice, handwritten notes if OCR'd)"
        // }
        // For "Diagnosis": {
        //   "diagnosisName": "string",
        //   "type": "string | null ('Provisional', 'Confirmed', etc.)",
        //   "dateOfDiagnosis": "string | null (ISO 8601)"
        // }
        // For "OtherClinicalInfo": {
        //    "title": "string",
        //    "description": "string | null",
        //    "items": [ { /* custom structure, e.g. {"category": "string", "test": "string"} for 'Not Done' tests */ } ]
        // }
      }
    }
  ],
  "overallSummary": "string | null (an AI-generated summary of the patient's entire journey from the report)"
}

Important Rules:
1.  Chronological Order: Sort timeline events by date (earliest first).
2.  Dates: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). If only date is present, use YYYY-MM-DD. Use the most precise time available.
3.  Blood Test Panels: For BloodTest events, group individual tests under their respective panel names in the panels array as shown in the schema.
4.  Flags: For blood tests, infer the flag field by comparing the value to the referenceRange. Also consider symbols like '*' or visual cues if described in text.
5.  Completeness: Extract all relevant information. If a field is optional and data is not present, use null.
6.  Facility Names: Be consistent. Extract the most specific facility name associated with the event.
7.  Summaries: Generate concise summaries for each event and an overall summary.

Now, process the following medical report OCR text and provide ONLY the JSON output:

      `;
;
    const files = formData.getAll('files'); // Get all files

    if (!userPrompt || !files || files.length === 0) {
        return NextResponse.json({ error: 'Missing prompt or no files uploaded' }, { status: 400 });
    }

    const apiKey = "AIzaSyChPNLGqiMKC7-GVsrrgiWL8Sdx7IGNA-A"; // Correctly use environment variable
    if (!apiKey) {
        console.error("GOOGLE_API_KEY not set");
        return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
    }
    const generativeModel = new genai.GoogleGenerativeAI(apiKey);
    const model = generativeModel.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Initialize geminiParts with the user prompt
    const geminiParts = [userPrompt];

    for (const file of files) {
        if (!(file instanceof File)) {
            console.error('Uploaded item is not a file:', file);
            return NextResponse.json({ error: 'One of the uploaded items is not a valid file.' }, { status: 400 });
        }
        
        if (file.type !== 'application/pdf') {
            console.error(`Invalid file type uploaded: ${file.type} for file ${file.name}`);
            return NextResponse.json({ error: `Invalid file type for ${file.name}. Only PDFs are allowed.` }, { status: 400 });
        }

        const fileSize = file.size;
        if (fileSize > 20 * 1024 * 1024) { // 20MB limit per file
            console.error(`File size exceeds 20MB for ${file.name}: ${fileSize}`);
            return NextResponse.json({ error: `File ${file.name} size exceeds the 20MB inline data limit.` }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        geminiParts.push({
            inline_data: {
                data: fileBuffer.toString('base64'),
                mime_type: 'application/pdf'
            }
        });
        console.log(`Added file ${file.name} to Gemini request parts.`);
    }

    // --- Call Gemini API once with all parts ---
    console.log(`Sending combined request to Gemini API with ${files.length} PDF(s)...`);
    
    const result = await model.generateContent(geminiParts);
    const response = result.response;
    let rawText = response.text();
    
    console.log("Received response from Gemini API for combined documents.");

    // Clean the rawText to remove markdown fences if present
    let cleanedJsonText = rawText.trim();
    if (cleanedJsonText.startsWith("```json")) {
      cleanedJsonText = cleanedJsonText.substring(7); 
    } else if (cleanedJsonText.startsWith("```")) {
      cleanedJsonText = cleanedJsonText.substring(3);
    }
    if (cleanedJsonText.endsWith("```")) {
      cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
    }
    cleanedJsonText = cleanedJsonText.trim();

    // --- Send the single result back to the frontend ---
    // No merging logic needed here as Gemini is expected to return one consolidated JSON
    try {
      JSON.parse(cleanedJsonText); // Validate
      return NextResponse.json({ result: cleanedJsonText }, { status: 200 });
    } catch (jsonError) {
      console.error('Error: Gemini response is not valid JSON after cleaning:', cleanedJsonText, jsonError);
      console.error('Raw Gemini response was:', rawText);
      return NextResponse.json({ error: 'AI returned malformed data. Could not parse as JSON.', rawResponse: rawText }, { status: 500 });
    }

  } catch (error) {
    console.error('Backend processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during processing.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
