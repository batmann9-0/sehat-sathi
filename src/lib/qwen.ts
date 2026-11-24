/**
 * Sehat Sathi — Qwen client (Alibaba DashScope).
 *
 * The ONLY AI layer in this project. Every model call goes to a Qwen
 * model — published on ModelScope — through DashScope's compatible
 * chat-completions endpoint, using a plain fetch (no SDK).
 *
 * It NEVER fakes success: with no DASHSCOPE_API_KEY it throws, and a
 * non-JSON model reply throws too.
 *
 * Env (see .env.example):
 *   DASHSCOPE_API_KEY  — required
 *   QWEN_BASE_URL      — e.g. https://dashscope-intl.aliyuncs.com/compatible-mode/v1
 *   QWEN_VL_MODEL      — default qwen-vl-max
 *   QWEN_MODEL         — default qwen-max
 */
import { PROMPT_A_EXTRACTOR, PROMPT_B_REASONER, buildProcessMessage } from './prompts';

export interface ExtractedTestResult {
  testName: string;
  resultValue: string;
  unit: string | null;
  referenceRange: string | null;
  isAbnormal: boolean | null;
  testDate: string | null;
}

export interface ExtractedMedication {
  brandName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
}

/** Prompt A output shape. */
export interface ExtractedDocument {
  patientName: string | null;
  documentDate: string | null;
  documentType: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY' | 'OTHER';
  labName: string | null;
  bloodGroup: string | null;
  testResults: ExtractedTestResult[];
  medications: ExtractedMedication[];
  allergies: string[];
  chronicConditions: string[];
  doctorName: string | null;
}

/** Prompt B output shape. */
export interface ProcessedDocument {
  duplicateAlerts: Array<{
    testName: string;
    previousDate: string;
    previousLab: string | null;
    moneySavedPKR: number;
    message: string;
  }>;
  translatedInstructions: Array<{
    brandName: string;
    instructionRomanUrdu: string;
    warning: string | null;
  }>;
  sosUpdate: {
    hasNewCriticalInfo: boolean;
    newAllergies: string[];
    newConditions: string[];
  };
  labTrustTip: string | null;
}

export function requireApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) {
    throw new Error(
      'DASHSCOPE_API_KEY is not set. Add it to .env (see .env.example) — ' +
        'Sehat Sathi does not fake AI results without a key.',
    );
  }
  return key;
}

function baseUrl(): string {
  return (
    process.env.QWEN_BASE_URL ??
    'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  ).replace(/\/$/, '');
}

function parseStrictJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Qwen returned non-JSON output: ${text.slice(0, 200)}`);
  }
}

async function chatCompletion(
  model: string,
  messages: Array<Record<string, unknown>>,
): Promise<string> {
  const apiKey = requireApiKey();
  const res = await fetch(`${baseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' } }),
  });
  if (!res.ok) {
    throw new Error(`DashScope request failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('DashScope returned an empty completion.');
  return content;
}

/** Prompt A — extract structured data from a document image (Qwen vision model). */
export async function extractDocument(imageUrl: string): Promise<ExtractedDocument> {
  const model = process.env.QWEN_VL_MODEL ?? 'qwen-vl-max';
  const content = await chatCompletion(model, [
    { role: 'system', content: PROMPT_A_EXTRACTOR },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: 'Extract this medical document. Output STRICT JSON only.' },
      ],
    },
  ]);
  return parseStrictJson<ExtractedDocument>(content);
}

/** Prompt B — reason over a new extraction against the patient profile (Qwen chat model). */
export async function processDocument(
  newData: ExtractedDocument,
  profile: unknown,
  labs: unknown,
  generics: unknown,
): Promise<ProcessedDocument> {
  const model = process.env.QWEN_MODEL ?? 'qwen-max';
  const content = await chatCompletion(model, [
    { role: 'system', content: PROMPT_B_REASONER },
    {
      role: 'user',
      content: buildProcessMessage({
        newData,
        existingProfile: profile,
        labsDb: labs,
        genericsDb: generics,
      }),
    },
  ]);
  return parseStrictJson<ProcessedDocument>(content);
}
