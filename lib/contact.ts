import { z } from "zod";

// Shared by the Contact form (inline messages) and app/api/contact (the authority).

export const PROJECT_TYPES = [
  "TVC",
  "Brand film",
  "Documentary",
  "Music video",
  "Corporate",
  "Other",
] as const;

export const pitchSchema = z.object({
  name: z.string({ error: "Please add your name." }).trim().min(1, "Please add your name.").max(120, "Please keep your name under 120 characters."),
  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .pipe(z.email("Please enter a valid email address, like you@studio.com.").max(200, "Please use a shorter email address.")),
  type: z.enum(PROJECT_TYPES, { error: "Please choose a project type." }),
  message: z
    .string({ error: "Please add a line or two about the story." })
    .trim()
    .min(10, "Please add a line or two about the story (at least 10 characters).")
    .max(5000, "Please keep the message under 5,000 characters."),
  // Honeypot: hidden from people, filled in by bots. Checked by the API, not the schema,
  // so a bot gets an ordinary-looking success.
  company: z.string().optional(),
});

export type Pitch = z.infer<typeof pitchSchema>;
export type PitchField = "name" | "email" | "type" | "message";
export type PitchErrors = Partial<Record<PitchField, string>>;

/** First error message per field, for showing next to each input. */
export function fieldErrors(error: z.ZodError): PitchErrors {
  const out: PitchErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "name" || field === "email" || field === "type" || field === "message") && !out[field]) {
      out[field] = issue.message;
    }
  }
  return out;
}

/** JSON the API returns. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: PitchErrors };

/** Subject line, shared by the Resend email and the mailto fallback. */
export function pitchSubject(pitch: Pick<Pitch, "type" | "name">): string {
  return `Pitch: ${pitch.type} — ${pitch.name}`;
}

/** Plain-text body with every field, shared by the Resend email, mailto and "Copy pitch". */
export function pitchText(pitch: Pick<Pitch, "name" | "email" | "type" | "message">): string {
  return [
    `Name: ${pitch.name}`,
    `Email: ${pitch.email}`,
    `Project: ${pitch.type}`,
    ``,
    `The story:`,
    pitch.message,
  ].join("\n");
}

/** mailto: link that opens the visitor's email app with the pitch filled in. */
export function pitchMailto(to: string, pitch: Pick<Pitch, "name" | "email" | "type" | "message">): string {
  return `mailto:${to}?subject=${encodeURIComponent(pitchSubject(pitch))}&body=${encodeURIComponent(pitchText(pitch))}`;
}
