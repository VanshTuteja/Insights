export type UserRole = 'jobseeker' | 'employer' | 'admin';

export interface ProfileAwareUser {
  role: UserRole;
  phone?: string;
  location?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  skills?: string[];
  profileCompleted?: boolean;
  missingProfileFields?: string[];
}

const hasText = (value?: string) => typeof value === 'string' && value.trim().length > 0;

export const getMissingProfileFields = (user: ProfileAwareUser | null | undefined) => {
  if (!user) return [];

  const missing = ['phone', 'location', 'bio'].filter((field) => {
    const value = user[field as keyof ProfileAwareUser];
    return typeof value !== 'string' || !hasText(value);
  });

  if (user.role === 'jobseeker') {
    if (!hasText(user.jobTitle)) missing.push('jobTitle');
    if (!hasText(user.experience)) missing.push('experience');
    if (!hasText(user.education)) missing.push('education');
    if (!Array.isArray(user.skills) || user.skills.length === 0) missing.push('skills');
    if (!hasText(user.resumeUrl)) missing.push('resumeUrl');
  }

  if (user.role === 'employer') {
    if (!hasText(user.company)) missing.push('company');
    if (!hasText(user.jobTitle)) missing.push('jobTitle');
    if (!hasText(user.companySize)) missing.push('companySize');
    if (!hasText(user.industry)) missing.push('industry');
  }

  return missing;
};

export const isProfileComplete = (user: ProfileAwareUser | null | undefined) => {
  if (!user) return false;
  if (typeof user.profileCompleted === 'boolean') return user.profileCompleted;
  return getMissingProfileFields(user).length === 0;
};
