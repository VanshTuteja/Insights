export const formatSalaryDisplay = (salary?: string | null) => {
  if (!salary) {
    return 'Salary not specified';
  }

  return salary
    .replace(/\bUSD\b/gi, 'INR')
    .replace(/\$/g, 'Rs ')
    .replace(/\bper year\b/gi, 'per year')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const inrNumberFormatter = new Intl.NumberFormat('en-IN');

export const formatInr = (value: number) => `Rs ${inrNumberFormatter.format(Math.round(value))}`;

export const formatLpa = (value: number) => {
  const lpa = value / 100000;
  const rounded = lpa >= 10 ? Math.round(lpa) : Math.round(lpa * 10) / 10;
  return `${rounded} LPA`;
};

export const formatInrRangeCompact = (range: number[]) => {
  if (!Array.isArray(range) || range.length < 2) {
    return 'Salary not specified';
  }

  return `${formatLpa(range[0])} - ${formatLpa(range[1])}`;
};

export const salaryFilterOptions = [
  { value: '0-50k', label: 'Rs 0 - Rs 5 LPA' },
  { value: '50k-100k', label: 'Rs 5 LPA - Rs 10 LPA' },
  { value: '100k-150k', label: 'Rs 10 LPA - Rs 15 LPA' },
  { value: '150k+', label: 'Rs 15 LPA+' },
];

export const salaryExpectationPresets = [
  { label: '3 - 6 LPA', range: [300000, 600000] },
  { label: '6 - 10 LPA', range: [600000, 1000000] },
  { label: '10 - 15 LPA', range: [1000000, 1500000] },
  { label: '15 - 25 LPA', range: [1500000, 2500000] },
  { label: '25+ LPA', range: [2500000, 5000000] },
];
