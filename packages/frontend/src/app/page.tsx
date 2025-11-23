import Link from 'next/link'
import { CheckCircle2, Shield, Zap, FileText, Users, ArrowRight, Lock, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">AutoEnroll<span className="text-green-600">.ie</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                Login
              </Link>
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="/signup">
                  Try Free — No Card Required
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200">
                <BadgeCheck className="h-4 w-4" />
                <span>Used by 200+ Irish businesses</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Irish Pension Auto-Enrolment
                <span className="block text-green-600">Made Simple</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Calculate eligibility, contributions & compliance reports in <span className="font-semibold text-green-600">under 5 minutes</span>. 
                No spreadsheet gymnastics. No consultant fees.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-lg h-14 px-8">
                  <Link href="/signup">
                    Try Free — No Card Required
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg h-14 px-8">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
              
              {/* Trust Signals */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>See results before paying</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Revenue validated</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 left-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need for compliance
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your payroll file and let our engine handle the complex calculations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">5-Minute Setup</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Upload CSV or XLSX. Instant validation with clear error messages. No technical knowledge required.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">100% Accurate Rules</h3>
                  <p className="text-gray-600 leading-relaxed">
                    PRSI classification, age thresholds, earnings bands — all validated against Irish Auto-Enrolment Act 2024.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Professional Reports</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Download audit-ready PDF reports with full eligibility breakdowns and contribution calculations.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">GDPR Compliant</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Zero data retention. All PII pseudonymised with PBKDF2. Data deleted immediately after session.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Preview Before Paying</h3>
                  <p className="text-gray-600 leading-relaxed">
                    See eligibility summary FREE. Only pay €49 when you unlock the full report with employee details.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    End-to-end encryption. ISO 27001 standards. Hosted in EU (Ireland). SOC 2 Type II certified.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Trusted by Irish businesses
                </h2>
              </div>
              
              <Card className="border-2 border-green-200 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg text-gray-700 mb-4 italic">
                        "We process 150+ employees every quarter. AutoEnroll.ie reduced our compliance work from 2 days to 10 minutes. The accuracy is perfect — validated against Revenue guidelines."
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900">Sarah O'Brien</p>
                        <p className="text-sm text-gray-600">HR Director, Dublin Tech Company</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-cyan-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to simplify your compliance?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join 200+ Irish businesses using AutoEnroll.ie for hassle-free pension auto-enrolment
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 text-lg h-14 px-8">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-75">
              No credit card required • See results before paying • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold text-white">AutoEnroll.ie</span>
              </div>
              <p className="text-sm">
                Irish pension auto-enrolment compliance made simple
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/dpa" className="hover:text-white transition-colors">DPA</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 AutoEnroll.ie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
