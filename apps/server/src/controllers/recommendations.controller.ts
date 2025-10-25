import { Request, Response } from "express";
import axios from "axios";
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { supabase } from "../supabase";
import path from "node:path";
import fs from "node:fs";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

const RECO_SHEET_URL_KEY = "recommendations_spreadsheet_url";
const RECO_SHEET_PATH_KEY = "recommendations_spreadsheet_path";
const RECO_GSHEET_ID_KEY = "recommendations_gsheet_id";
const RECO_GSHEET_RANGE_KEY = "recommendations_gsheet_range"; // e.g. Sheet1!A1:Z

async function getSettingsValue(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as string) ?? null;
}

// Parse CSV from a readable stream into array of objects
function parseCsvStream(stream: NodeJS.ReadableStream): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    stream
      .pipe(csvParser())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

export const listRecommendations = async (req: Request, res: Response) => {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
    const url = await getSettingsValue(RECO_SHEET_URL_KEY);
    const uploadedPath = await getSettingsValue(RECO_SHEET_PATH_KEY);
    const gsheetId = await getSettingsValue(RECO_GSHEET_ID_KEY);
    const gsheetRange =
      (await getSettingsValue(RECO_GSHEET_RANGE_KEY)) || "Sheet1!A1:Z";

    if (!url && !uploadedPath && !gsheetId) {
      return res.status(200).json([]);
    }

    // 1) Try Google Sheets API when spreadsheet ID is configured
    if (gsheetId) {
      const values = await readGoogleSheetValues(gsheetId, gsheetRange);
      if (values && values.length > 0) {
        const objects = rowsToObjects(values);
        return res.status(200).json(objects);
      }
    }

    // Prefer URL when provided
    if (url) {
      const lower = url.toLowerCase();
      if (lower.endsWith(".csv") || lower.includes("output=csv")) {
        const response = await axios.get(url, { responseType: "stream" });
        const rows = await parseCsvStream(response.data);
        return res.status(200).json(rows);
      } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const response = await axios.get<ArrayBuffer>(url, {
          responseType: "arraybuffer",
        });
        const workbook = XLSX.read(response.data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        return res.status(200).json(rows);
      }
      // Fallback: try CSV as default
      const response = await axios.get(url, { responseType: "stream" });
      const rows = await parseCsvStream(response.data);
      return res.status(200).json(rows);
    }

    // Else, handle uploaded file from Supabase storage
    if (uploadedPath) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(uploadedPath);
      if (error || !data) {
        return res
          .status(500)
          .json({
            message: error?.message || "Failed to download spreadsheet",
          });
      }
      const buffer = Buffer.from(await data.arrayBuffer());
      const lower = uploadedPath.toLowerCase();
      if (lower.endsWith(".csv")) {
        // Convert buffer to stream
        // Node 18+ supports Readable.from
        const stream = require("stream").Readable.from(buffer);
        const rows = await parseCsvStream(stream);
        return res.status(200).json(rows);
      }
      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        return res.status(200).json(rows);
      }
      return res.status(400).json({ message: "Unsupported file type" });
    }

    return res.status(200).json([]);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e?.message || "Failed to load recommendations" });
  }
};

// Convert a 2D array (first row headers) to array of objects
function rowsToObjects(values: any[][]): any[] {
  if (!Array.isArray(values) || values.length === 0) return [];
  const [headers, ...rows] = values;
  const normalized = headers.map((h: any) => String(h || "").trim());
  return rows.map((r) => {
    const obj: any = {};
    normalized.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}

// Attempt to read Google Sheet values with either Service Account or Local Auth
async function readGoogleSheetValues(
  spreadsheetId: string,
  range: string
) {
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  // Credentials path: prefer server secret folder
  const serverRoot = path.resolve(process.cwd());
  console.log(serverRoot, "root");
 const keyfilePath = path.resolve('..', '..', 'secret')
 console.log(keyfilePath, 'path')

  try {
    const content = JSON.parse(fs.readFileSync(keyfilePath, "utf-8"));
    const isService =
      content?.type === "service_account" &&
      content?.private_key &&
      content?.client_email;
    if (isService) {
      const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        keyFile: keyfilePath,
      });
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    }
  } catch (_) {
    // fall through to local auth
  }
}
