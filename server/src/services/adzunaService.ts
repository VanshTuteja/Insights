import config from '../config';

type AdzunaSearchParams = {
  search?: string;
  location?: string;
  type?: string;
  salary?: string;
  page: number;
  limit: number;
};

export type ExternalJob = {
  _id: string;
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  tags: string[];
  requirements: string;
  benefits: string;
  createdAt: string;
  isActive: boolean;
  applications: [];
  views: number;
  employerId: null;
  isExternal: true;
  source: 'adzuna';
  applyUrl?: string;
};

type AdzunaApiResponse = {
  count?: number;
  results?: any[];
};

const isConfigured = () => Boolean(config.adzuna.appId && config.adzuna.appKey);

const parseSalaryRange = (salary?: string) => {
  if (!salary) return {};
  const map: Record<string, { min?: number; max?: number }> = {
    '0-50k': { max: 50000 },
    '50k-100k': { min: 50000, max: 100000 },
    '100k-150k': { min: 100000, max: 150000 },
    '150k+': { min: 150000 },
  };
  return map[salary] || {};
};

const mapTypeToQuery = (type?: string) => {
  if (!type) return '';
  if (type === 'remote' || type === 'hybrid') return type;
  return type.replace('-', ' ');
};

const extractTags = (job: any) => {
  const raw = [job.category?.label, ...(job.__CLASS__ ? [] : []), ...(Array.isArray(job.tags) ? job.tags : [])]
    .filter(Boolean)
    .map((value) => String(value).trim());
  return Array.from(new Set(raw)).slice(0, 6);
};

export const fetchAdzunaJobs = async ({
  search,
  location,
  type,
  salary,
  page,
  limit,
}: AdzunaSearchParams): Promise<{ jobs: ExternalJob[]; total: number }> => {
  if (!isConfigured()) {
    return { jobs: [], total: 0 };
  }

  const salaryRange = parseSalaryRange(salary);
  const query = new URLSearchParams({
    app_id: config.adzuna.appId,
    app_key: config.adzuna.appKey,
    results_per_page: String(limit),
    'content-type': 'application/json',
  });

  const combinedSearch = [search, mapTypeToQuery(type)].filter(Boolean).join(' ').trim();
  if (combinedSearch) query.set('what', combinedSearch);
  if (location) query.set('where', location);
  if (salaryRange.min) query.set('salary_min', String(salaryRange.min));
  if (salaryRange.max) query.set('salary_max', String(salaryRange.max));

  const endpoint = `https://api.adzuna.com/v1/api/jobs/${config.adzuna.country}/search/${page}?${query.toString()}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Adzuna request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AdzunaApiResponse;
  const jobs: ExternalJob[] = (data.results || []).map((job: any) => ({
    _id: `adzuna-${job.id}`,
    id: `adzuna-${job.id}`,
    title: job.title || 'Untitled role',
    company: job.company?.display_name || 'Company not listed',
    description: job.description || 'No description provided.',
    location: job.location?.display_name || location || 'Location not listed',
    salary:
      job.salary_min || job.salary_max
        ? `Rs ${Math.round(job.salary_min || 0).toLocaleString('en-IN')} - Rs ${Math.round(job.salary_max || 0).toLocaleString('en-IN')}`
        : 'Salary not specified',
    type: type || 'full-time',
    tags: extractTags(job),
    requirements: job.description || 'See original listing for requirements.',
    benefits: 'See original listing for benefits and perks.',
    createdAt: job.created || new Date().toISOString(),
    isActive: true,
    applications: [],
    views: 0,
    employerId: null,
    isExternal: true,
    source: 'adzuna',
    applyUrl: job.redirect_url,
  }));

  return {
    jobs,
    total: Number(data.count || jobs.length),
  };
};
