import { z } from "zod";

import { OWNERSHIP_MODES } from "@/types/domain";

/**
 * Validation for the web target intake form.
 *
 * Messages are written to be read by the person filling the form — they say
 * what is wrong and what a valid value looks like, rather than restating the
 * rule.
 */

const HOSTNAME = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

export const webTargetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Give this assessment a name of at least 2 characters.")
      .max(80, "Keep the name under 80 characters."),

    websiteUrl: z
      .url("Enter a full URL including the scheme, for example https://shop.example.com.")
      .refine(
        (value) => value.startsWith("http://") || value.startsWith("https://"),
        "The URL must start with http:// or https://.",
      ),

    repositoryUrl: z
      .union([
        z.literal(""),
        z.url("Enter a full repository URL, for example https://github.com/org/repo."),
      ])
      .optional(),

    rootDomain: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        HOSTNAME,
        "Enter the registrable domain on its own, for example example.com — no scheme or path.",
      ),

    ownershipMode: z.enum(OWNERSHIP_MODES),

    bountyProgram: z.string().trim().max(120).optional(),

    notes: z
      .string()
      .trim()
      .max(600, "Keep notes under 600 characters.")
      .optional(),
  })
  .refine(
    (values) =>
      values.ownershipMode !== "bug_bounty" ||
      (values.bountyProgram ?? "").length > 1,
    {
      path: ["bountyProgram"],
      message:
        "Name the program you are testing under. Verification depends on matching its published scope.",
    },
  );

export type WebTargetFormValues = z.infer<typeof webTargetSchema>;

export const webTargetDefaults: WebTargetFormValues = {
  name: "",
  websiteUrl: "",
  repositoryUrl: "",
  rootDomain: "",
  ownershipMode: "self_owned",
  bountyProgram: "",
  notes: "",
};
