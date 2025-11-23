import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Check, 
  ArrowRight, 
  Shield, 
  Lock, 
  FileText,
  Users,
  TrendingUp,
  Download,
  Mail,
  Phone
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Instant Eligibility Reports',
    description: 'Upload payroll data and get comprehensive eligibility reports in minutes'
  },
  {
    icon: Users,
    title: 'Unlimited Employees',
    description: 'Process any number of employees with no per-employee charges'
  },
  {
    icon: TrendingUp,
    title: 'Contribution Calculations',
    description: 'Automatic calculation of employer, employee, and state contributions'
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Download professional compliance reports ready for Revenue submission'
  },
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Bank-level security with PBKDF2 encryption and data pseudonymisation'
  },
  {
    icon: Lock,
    title: 'Revenue Validated',
    description: 'Business logic validated against official Revenue guidelines'
  }
]

const includedFeatures = [
  'Eligibility assessment for all employees',
  'PRSI class verification (A, B, D, H, P)',
  'Age and earnings threshold checks',
  'Opt-out window calculations',
  'Director and contractor exclusions',
  'Contribution phase tracking (1.5% → 6%)',
  'State top-up calculations (0.5% → 1.5%)',
  'Re-enrolment date tracking',
  'Detailed PDF compliance reports',
  'Unlimited file uploads',
  'Email support',
  'Regular compliance updates'
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-green-50/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-600">
              AutoEnroll.ie
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            One flat fee per compliance report. No subscriptions, no hidden costs.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-600" />
              <span>See results before paying</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-600" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-600" />
              <span>No subscription required</span>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-4 border-green-600 shadow-2xl">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Pricing Details */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Pay-Per-Report
                    </h2>
                    <p className="text-gray-600">
                      Only pay when you need a compliance report
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-6xl font-bold text-green-600">€49</span>
                      <span className="text-2xl text-gray-600">per report</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Unlimited employees • Instant results • PDF export
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Upload and validate for FREE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Preview results before paying</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-900 font-medium">Pay only for full PDF report</span>
                    </div>
                  </div>

                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 hover:scale-105 transition-transform duration-300"
                  >
                    <Link href="/signup">
                      Try Free — No Card Required
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Start free • Add card details only when downloading
                  </p>
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    What's Included
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {includedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-neutral-200 text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">GDPR Compliant</h4>
                <p className="text-sm text-gray-600">
                  Bank-level encryption and data pseudonymisation
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200 text-center">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Revenue Validated</h4>
                <p className="text-sm text-gray-600">
                  Business logic verified against official guidelines
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200 text-center">
              <CardContent className="p-6">
                <Lock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">30-Day Guarantee</h4>
                <p className="text-sm text-gray-600">
                  Full refund if you're not satisfied with the report
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Compliance
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-neutral-200 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">Do I need to subscribe?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No! AutoEnroll.ie uses a simple pay-per-report model. You only pay €49 when you want to download a full PDF compliance report. Upload and validate your data for free, preview the results, and decide if you want to purchase the report.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">Can I see results before paying?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! Upload your payroll data and see a summary of eligibility results (total employees, eligible count, contribution estimates) completely free. You only pay when you want to download the detailed PDF report with individual employee breakdowns.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">Is there a limit on employees?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No employee limits! Whether you have 5 employees or 5,000, the price is always €49 per report. Process as many employees as needed without per-employee charges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">What if I need to generate multiple reports?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each report costs €49. If you're processing monthly or quarterly payroll batches, you'll pay €49 per report. For high-volume users (10+ reports/month), contact us about volume discounts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We use PBKDF2 encryption (150,000 iterations) for sensitive data like PPS numbers. All data is pseudonymised during processing and stored in Ireland-based, GDPR-compliant infrastructure. We never share your data with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit/debit cards (Visa, Mastercard, Amex) via Stripe. Payment is processed securely at the point of downloading your PDF report.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-600 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Upload your payroll data now and see results for free.<br />
                Only pay if you need the full compliance report.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-lg px-12 py-6"
              >
                <Link href="/signup">
                  Try Free — No Card Required
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-gray-600 mt-6">
                Have questions? <Link href="mailto:support@autoenroll.ie" className="text-green-600 hover:underline">Contact our team</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/pricing" className="hover:text-green-600">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-green-600">Features</Link></li>
                <li><Link href="/docs" className="hover:text-green-600">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-green-600">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-green-600">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-green-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-green-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">Terms of Service</Link></li>
                <li><Link href="/gdpr" className="hover:text-green-600">GDPR Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@autoenroll.ie
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +353 1 234 5678
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2024 AutoEnroll.ie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
