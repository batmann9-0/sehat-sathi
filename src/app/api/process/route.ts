/**
 * Sehat Sathi — POST /api/process.
 *
 * Takes a Prompt A extraction and returns everything the dashboard needs:
 *   - duplicateAlerts: Duplicate Test Shield (deterministic, 60-day window)
 *   - genericAlternatives: Sasta Badal (deterministic, from generics data)
 *   - sosCard: Auto-SOS Emergency Card data (deterministic)
 *   - qwenReasoning: Prompt B (Qwen chat model) result — ONLY when a
 *     DASHSCOPE_API_KEY is set. Without a key it is null and the
 *     deterministic results above still answer fully, so the 60-second
 *     demo never depends on a live model call. A failed Qwen call is
 *     reported in qwenError and never fails the deterministic core.
 *
 * Body: { newData: ExtractedDocument, existingProfile?: {...},
 *         history?: [{ testName, testDate, labName }] }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import labsJson from '../../../../data/pakistan_labs.json';
import genericsJson from '../../../../data/pakistan_generics.json';
import {
  findDuplicateTests,
  findGeneric,
  buildSosCard,
  type Lab,
  type GenericEntry,
  type PatientProfileLike,
} from '@/lib/demo-logic';
import { processDocument, type ExtractedDocument } from '@/lib/qwen';

const labs = labsJson as Lab[];
const generics = genericsJson as GenericEntry[];

const NullableString = z.string().nullable().optional();

const ExtractedDocumentSchema = z
  .object({
    patientName: NullableString,
    documentDate: NullableString,
    documentType: z
      .enum(['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'OTHER'])
      .optional(),
    labName: NullableString,
    bloodGroup: NullableString,
    testResults: z.array(
      z
        .object({
          testName: z.string(),
          resultValue: z.string().optional(),
          unit: NullableString,
          referenceRange: NullableString,
          isAbnormal: z.boolean().nullable().optional(),
          testDate: NullableString,
        })
        .passthrough(),
    ),
    medications: z
      .array(
        z
          .object({
            brandName: z.string(),
            dosage: NullableString,
            frequency: NullableString,
            duration: NullableString,
          })
          .passthrough(),
      )
      .optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    doctorName: NullableString,
  })
  .passthrough();

const ProcessBody = z.object({
  newData: ExtractedDocumentSchema,
  existingProfile: z
    .object({
      name: NullableString,
      bloodGroup: NullableString,
      allergies: z.array(z.string()).optional(),
      chronicConditions: z.array(z.string()).optional(),
      emergencyContact: NullableString,
    })
    .optional(),
  history: z
    .array(
      z.object({
        testName: z.string(),
        testDate: z.string(),
        labName: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = ProcessBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          'newData is required — the Prompt A extraction object (see POST /api/extract). ' +
          (parsed.error.issues[0]?.message ?? ''),
      },
      { status: 400 },
    );
  }

  const { newData, existingProfile, history } = parsed.data;
  const extraction = newData as unknown as ExtractedDocument;

  const profile: PatientProfileLike = { ...(existingProfile ?? {}) };
  if (extraction.bloodGroup && !profile.bloodGroup) profile.bloodGroup = extraction.bloodGroup;
  profile.allergies = [...(profile.allergies ?? []), ...(extraction.allergies ?? [])];
  profile.chronicConditions = [
    ...(profile.chronicConditions ?? []),
    ...(extraction.chronicConditions ?? []),
  ];

  const duplicateAlerts = findDuplicateTests(
    extraction.testResults.map((t) => ({
      testName: t.testName,
      labName: extraction.labName ?? undefined,
    })),
    history ?? [],
    labs,
  );

  const genericAlternatives = (extraction.medications ?? [])
    .map((m) => findGeneric(m.brandName, generics))
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const sosCard = buildSosCard(profile);

  // Prompt B — only when a key exists; never blocks the deterministic core.
  let qwenReasoning = null;
  let qwenError: string | null = null;
  if (process.env.DASHSCOPE_API_KEY) {
    try {
      qwenReasoning = await processDocument(extraction, profile, labs, generics);
    } catch (err) {
      qwenError = err instanceof Error ? err.message : 'Qwen reasoning failed.';
    }
  }

  return NextResponse.json({
    duplicateAlerts,
    genericAlternatives,
    sosCard,
    qwenReasoning,
    qwenError,
  });
}
