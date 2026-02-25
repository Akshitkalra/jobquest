import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              jobquest
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered job matching connecting companies with top talent.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">For Candidates</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-primary">Browse Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-primary">Companies</Link></li>
              <li><Link href="/register/candidate" className="hover:text-primary">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register/company" className="hover:text-primary">Post a Job</Link></li>
              <li><Link href="/register/company" className="hover:text-primary">Find Candidates</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
