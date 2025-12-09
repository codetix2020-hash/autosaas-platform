"use client";

import { SignupForm } from "./SignupForm";

interface SignupPageClientProps {
  prefillEmail?: string;
}

export function SignupPageClient({ prefillEmail }: SignupPageClientProps) {
  return <SignupForm prefillEmail={prefillEmail} />;
}

