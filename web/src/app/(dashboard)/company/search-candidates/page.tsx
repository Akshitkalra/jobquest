"use client";

import { useState } from "react";
import {
  Loader2,
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSearchCandidates, type RankedCandidate } from "@/hooks/use-api";

function getScoreColor(score: number): string {
  if (score >= 0.85) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
  if (score >= 0.7) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (score >= 0.5) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}

function formatScore(score: number): string {
  return `${Math.round(score * 100)}% match`;
}

export default function SearchCandidatesPage() {
  const searchMutation = useSearchCandidates();

  const [queryText, setQueryText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [topK, setTopK] = useState(20);

  const handleSearch = () => {
    if (!queryText.trim()) return;

    searchMutation.mutate({
      queryText: queryText.trim(),
      topK,
      experienceLevel: experienceLevel || undefined,
      workMode: workMode || undefined,
      location: location || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const results = searchMutation.data?.content ?? [];
  const hasSearched = searchMutation.isSuccess || searchMutation.isError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Search Candidates</h2>
        <p className="text-muted-foreground">
          Find the best candidates using AI-powered semantic search.
        </p>
      </div>

      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Criteria</CardTitle>
          <CardDescription>
            Describe the ideal candidate or paste a job description to find matching profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Search Query *</Label>
            <Input
              id="query"
              placeholder="e.g. Senior React developer with 5+ years experience in TypeScript and Node.js"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any level</SelectItem>
                  <SelectItem value="ENTRY">Entry</SelectItem>
                  <SelectItem value="MID">Mid</SelectItem>
                  <SelectItem value="SENIOR">Senior</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Any mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any mode</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topK">Max Results</Label>
              <Input
                id="topK"
                type="number"
                min={1}
                max={100}
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 20)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending || !queryText.trim()}
            >
              {searchMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {searchMutation.isPending ? "Searching..." : "Search Candidates"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchMutation.isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {searchMutation.isError && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Search failed. Please try again with a different query.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSearched && !searchMutation.isPending && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {results.length} candidate{results.length !== 1 ? "s" : ""} found
            </h3>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No candidates matched your search criteria. Try broadening your query.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result: RankedCandidate, index: number) => (
                <CandidateCard key={result.candidateProfile.id} result={result} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state before search */}
      {!hasSearched && !searchMutation.isPending && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Find Your Ideal Candidates</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              Enter a description of the role or skills you&apos;re looking for, and our AI will
              find the best-matching candidates from our talent pool.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CandidateCard({ result, rank }: { result: RankedCandidate; rank: number }) {
  const { candidateProfile: c, similarityScore, status } = result;
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ") || "Anonymous";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar + rank */}
          <div className="flex items-start gap-3">
            <span className="text-sm font-bold text-muted-foreground w-6 pt-2">
              #{rank}
            </span>
            <Avatar className="h-12 w-12">
              <AvatarImage src={c.avatarUrl ?? undefined} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h4 className="font-semibold truncate">{fullName}</h4>
              <div className="flex items-center gap-2">
                <Badge className={getScoreColor(similarityScore)}>
                  {formatScore(similarityScore)}
                </Badge>
                {c.isOpenToWork && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    Open to Work
                  </Badge>
                )}
                {status && (
                  <Badge variant="secondary">{status}</Badge>
                )}
              </div>
            </div>

            {c.headline && (
              <p className="text-sm text-muted-foreground">{c.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {c.currentTitle && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {c.currentTitle}
                  {c.currentCompany && ` at ${c.currentCompany}`}
                </span>
              )}
              {c.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {c.location}
                </span>
              )}
              {c.experienceYears != null && c.experienceYears > 0 && (
                <span>{c.experienceYears} yr{c.experienceYears !== 1 ? "s" : ""} exp</span>
              )}
              {c.preferredWorkMode && (
                <span>{c.preferredWorkMode.replace("_", " ")}</span>
              )}
            </div>

            {/* Skills */}
            {c.skills && c.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {c.skills.slice(0, 8).map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {c.skills.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{c.skills.length - 8} more
                  </Badge>
                )}
              </div>
            )}

            {/* Links */}
            {(c.linkedinUrl || c.githubUrl || c.portfolioUrl) && (
              <div className="flex items-center gap-3 pt-1">
                {c.linkedinUrl && (
                  <a
                    href={c.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {c.githubUrl && (
                  <a
                    href={c.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {c.portfolioUrl && (
                  <a
                    href={c.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
