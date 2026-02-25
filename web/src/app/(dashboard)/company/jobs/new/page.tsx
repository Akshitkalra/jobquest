"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { jobCreateSchema, type JobCreateFormData } from "@/lib/validations/job";
import { toast } from "sonner";
import { useCreateJob } from "@/hooks/use-api";

const jobTypeOptions = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const experienceLevelOptions = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior Level" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
];

const workModeOptions = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
];

export default function CreateJobPage() {
  const router = useRouter();
  const createJobMutation = useCreateJob();
  const [skillInput, setSkillInput] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);

  const form = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      responsibilities: "",
      benefits: "",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      workMode: "ONSITE",
      location: "",
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: "USD",
      isSalaryVisible: true,
      applicationDeadline: "",
      skills: "",
      status: "ACTIVE",
    },
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      const updated = [...skillsList, trimmed];
      setSkillsList(updated);
      form.setValue("skills", updated.join(", "));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const updated = skillsList.filter((s) => s !== skill);
    setSkillsList(updated);
    form.setValue("skills", updated.join(", "));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: JobCreateFormData) => {
    createJobMutation.mutate(data as Record<string, unknown>, {
      onSuccess: () => {
        toast.success("Job posted successfully!");
        router.push("/company/jobs");
      },
      onError: (error) => {
        console.error("Failed to create job:", error);
        toast.error("Failed to create job. Please try again.");
      },
    });
  };

  const isSubmitting = createJobMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/company/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Post New Job</h2>
        <p className="text-muted-foreground">
          Fill in the details to create a new job listing.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Essential details about the position.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Frontend Developer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the role, team, and what the candidate will be working on..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the qualifications and requirements for this role..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate each requirement on a new line.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the key responsibilities for this role..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefits</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the benefits and perks offered..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
              <CardDescription>
                Specify the type, level, and work arrangement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevelOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workModeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. San Francisco, CA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compensation</CardTitle>
              <CardDescription>
                Set the salary range for this position.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 80000"
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          value={String(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 120000"
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          value={String(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isSalaryVisible"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Show salary range on job listing
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Skills & Deadline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Deadline</CardTitle>
              <CardDescription>
                Add required skills and set the application deadline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Skills
                </label>
                <div className="mt-2 flex flex-wrap gap-2 mb-2">
                  {skillsList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    disabled={!skillInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter or comma to add a skill.
                </p>
              </div>

              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty for no deadline.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortlistCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auto-Shortlist Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormDescription>
                      When the job is closed, the top N candidates by AI match score will be automatically shortlisted. Leave empty to disable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing</CardTitle>
              <CardDescription>
                Choose how to publish this job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          Publish immediately
                        </SelectItem>
                        <SelectItem value="DRAFT">Save as Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft jobs are not visible to candidates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/company/jobs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
