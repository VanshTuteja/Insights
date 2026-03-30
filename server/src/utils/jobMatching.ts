import { IJob, IUser } from '../types';

export const MATCH_THRESHOLD = 80;

const normalizeText = (value?: string | null) => String(value || '').trim().toLowerCase();

const uniqueNormalized = (values?: string[] | null) =>
  Array.from(new Set((values || []).map((value) => normalizeText(value)).filter(Boolean)));

const parseSalaryUpperBound = (value?: string | null): number | null => {
  const normalized = normalizeText(value).replace(/,/g, '');
  const matches = normalized.match(/\d+(?:\.\d+)?\s*(?:k|m|b|lpa|lac|lakh|cr|crore)?/g);
  if (!matches?.length) return null;

  const parsed = matches
    .map((part) => {
      const trimmed = part.trim();
      const suffixMatch = trimmed.match(/(k|m|b|lpa|lac|lakh|cr|crore)$/i);
      const suffix = suffixMatch?.[1]?.toLowerCase() || '';
      const numeric = Number(trimmed.replace(/(k|m|b|lpa|lac|lakh|cr|crore)$/i, '').trim());
      if (Number.isNaN(numeric)) return null;
      if (suffix === 'k') return numeric * 1_000;
      if (suffix === 'm') return numeric * 1_000_000;
      if (suffix === 'b') return numeric * 1_000_000_000;
      if (suffix === 'lpa' || suffix === 'lac' || suffix === 'lakh') return numeric * 100_000;
      if (suffix === 'cr' || suffix === 'crore') return numeric * 10_000_000;
      return numeric;
    })
    .filter((item): item is number => item !== null);

  return parsed.length ? Math.max(...parsed) : null;
};

const includesPartial = (haystack: string, needles: string[]) =>
  needles.some((needle) => haystack.includes(needle) || needle.includes(haystack));

const arraysPartiallyOverlap = (left: string[], right: string[]) =>
  left.some((leftItem) => right.some((rightItem) => leftItem.includes(rightItem) || rightItem.includes(leftItem)));

type MatchDimension = {
  configured: boolean;
  matched: boolean;
};

export function calculateJobMatchScore(
  user: Pick<IUser, 'skills' | 'jobTitle' | 'preferences'> | null | undefined,
  job: Pick<IJob, 'title' | 'company' | 'description' | 'location' | 'salary' | 'type' | 'tags' | 'requirements' | 'benefits'>,
): number {
  if (!user) return 0;

  const searchableJobText = normalizeText(
    `${job.title} ${job.company} ${job.description} ${job.requirements} ${job.benefits} ${(job.tags || []).join(' ')}`,
  );
  const normalizedJobLocation = normalizeText(job.location);
  const normalizedJobType = normalizeText(job.type);
  const jobTags = uniqueNormalized(job.tags);
  const userSkills = uniqueNormalized(user.skills);
  const preferredRoles = uniqueNormalized(user.preferences?.preferredRoles);
  const preferredJobTypes = uniqueNormalized((user.preferences?.jobTypes as string[] | undefined) || []);
  const preferredLocations = uniqueNormalized(user.preferences?.locations);
  const salaryRange = user.preferences?.salaryRange || [];
  const salaryConfigured = Array.isArray(salaryRange) && salaryRange.length === 2;
  const salaryUpper = parseSalaryUpperBound(job.salary);

  const dimensions: MatchDimension[] = [
    {
      configured: userSkills.length > 0,
      matched: userSkills.length > 0 && (arraysPartiallyOverlap(userSkills, jobTags) || includesPartial(searchableJobText, userSkills)),
    },
    {
      configured: preferredRoles.length > 0,
      matched: preferredRoles.length > 0 && includesPartial(searchableJobText, preferredRoles),
    },
    {
      configured: preferredJobTypes.length > 0,
      matched: preferredJobTypes.length > 0 && preferredJobTypes.includes(normalizedJobType),
    },
    {
      configured: preferredLocations.length > 0,
      matched:
        preferredLocations.length > 0 &&
        preferredLocations.some((location) => normalizedJobLocation.includes(location) || location.includes(normalizedJobLocation)),
    },
    {
      configured: salaryConfigured,
      matched: salaryConfigured && salaryUpper !== null && salaryUpper >= Number(salaryRange[0] || 0),
    },
  ];

  const configuredDimensions = dimensions.filter((dimension) => dimension.configured);
  if (!configuredDimensions.length) return 0;

  const matchedDimensions = configuredDimensions.filter((dimension) => dimension.matched).length;
  return Math.round((matchedDimensions / configuredDimensions.length) * 100);
}

export function isStrongJobMatch(
  user: Pick<IUser, 'skills' | 'jobTitle' | 'preferences'> | null | undefined,
  job: Pick<IJob, 'title' | 'company' | 'description' | 'location' | 'salary' | 'type' | 'tags' | 'requirements' | 'benefits'>,
  threshold = MATCH_THRESHOLD,
) {
  return calculateJobMatchScore(user, job) >= threshold;
}
