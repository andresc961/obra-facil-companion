export type CompanyBrand = {
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
};

export function selectedBrand(subscribed: boolean, include: boolean, profile?: CompanyBrand | null): CompanyBrand | null {
  if (!subscribed || !include || !profile) return null;
  return Object.values(profile).some(Boolean) ? profile : null;
}