export interface ProfileCompletionResult {
  profileCompleted: boolean;
  missingProfileFields: string[];
}

const hasText = (value?: string) => typeof value === 'string' && value.trim().length > 0;

type ProfileLikeUser = {
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  jobTitle?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  skills?: string[];
};

export const getProfileCompletion = (user: ProfileLikeUser): ProfileCompletionResult => {
  const missingProfileFields = ['name', 'email', 'phone', 'location', 'bio'].filter((field) => {
    const value = user[field as keyof ProfileLikeUser];
    return typeof value !== 'string' || !hasText(value);
  });

  if (user.role === 'jobseeker') {
    if (!hasText(user.jobTitle)) missingProfileFields.push('jobTitle');
    if (!hasText(user.experience)) missingProfileFields.push('experience');
    if (!hasText(user.education)) missingProfileFields.push('education');
    if (!Array.isArray(user.skills) || user.skills.length === 0) missingProfileFields.push('skills');
    if (!hasText(user.resumeUrl)) missingProfileFields.push('resumeUrl');
  }

  if (user.role === 'employer') {
    if (!hasText(user.company)) missingProfileFields.push('company');
    if (!hasText(user.jobTitle)) missingProfileFields.push('jobTitle');
    if (!hasText(user.companySize)) {
      missingProfileFields.push('companySize');
    }
    if (!hasText(user.industry)) {
      missingProfileFields.push('industry');
    }
  }

  return {
    profileCompleted: missingProfileFields.length === 0,
    missingProfileFields,
  };
};

export const withProfileCompletion = <T extends { toJSON?: () => any }>(user: T) => {
  const baseUser = typeof user.toJSON === 'function' ? user.toJSON() : user;
  return {
    ...baseUser,
    ...getProfileCompletion(baseUser),
  };
};
