import { z } from "zod";

export const jobCreateSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"], {
    message: "Job type is required",
  }),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"], {
    message: "Experience level is required",
  }),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"], {
    message: "Work mode is required",
  }),
  location: z.string().optional(),
  salaryMin: z.coerce.number().positive("Must be a positive number").optional(),
  salaryMax: z.coerce.number().positive("Must be a positive number").optional(),
  salaryCurrency: z.string().default("USD"),
  isSalaryVisible: z.boolean().default(true),
  applicationDeadline: z.string().optional(),
  shortlistCount: z.coerce.number().int().min(1, "Must be at least 1").optional(),
  skills: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]).default("ACTIVE"),
});

export type JobCreateFormData = z.input<typeof jobCreateSchema>;
