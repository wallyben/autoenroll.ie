'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Calendar, Package, Clock, Check, ArrowRight } from 'lucide-react'

interface BundlePricing {
  bundleSize: number
  pricePerReport: number
  totalPrice: number
  discountPercent: number
  savings: number
}

interface CreditBalance {
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  activeBundles: Array<{
    bundleId: string
    creditsRemaining: number
    purchaseDate: string
    expiryDate?: string
  }>
  recentTransactions: Array<{
    bundleId: string
    type: string
    credits: number
    date: string
    description: string
  }>
}

export default function BundlesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [pricing, setPricing] = useState<BundlePricing[]>([])
  const [credits, setCredits] = useState<CreditBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [purchasingBundle, setPurchasingBundle] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [pricingRes, creditsRes] = await Promise.all([
        api.get('/bundles/pricing'),
        api.get('/bundles/credits')
      ])
      setPricing(pricingRes.data.data.pricing)
      setCredits(creditsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch bundles data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async (bundleSize: number) => {
    try {
      setPurchasingBundle(bundleSize)
      // Mock payment - in production, integrate with Stripe
      const response = await api.post('/bundles/purchase', {
        bundleSize,
        paymentMethodId: 'pm_mock_' + Date.now(),
      })
      alert(`Successfully purchased ${bundleSize}-pack! You now have ${response.data.data.totalCreditsRemaining} credits.`)
      fetchData() // Refresh data
    } catch (error: any) {
      console.error('Failed to purchase bundle:', error)
      alert('Failed to purchase bundle: ' + (error.response?.data?.error?.message || error.message))
    } finally {
      setPurchasingBundle(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bundles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Volume Pricing Bundles</h1>
        <p className="text-muted-foreground">
          Save up to 61% with bulk report purchases
        </p>
      </div>

      {/* Credit Balance Card */}
      {credits && (
        <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Credit Balance
            </CardTitle>
            <CardDescription>Report credits available for use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-green-600">{credits.remainingCredits}</div>
                <div className="text-sm text-muted-foreground">Credits Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-700">{credits.usedCredits}</div>
                <div className="text-sm text-muted-foreground">Credits Used</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-700">{credits.totalCredits}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
            </div>
            
            {credits.activeBundles.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Active Bundles:</h4>
                {credits.activeBundles.map((bundle) => (
                  <div key={bundle.bundleId} className="flex justify-between text-sm py-1">
                    <span>{bundle.creditsRemaining} credits remaining</span>
                    <span className="text-muted-foreground">
                      Expires: {bundle.expiryDate ? new Date(bundle.expiryDate).toLocaleDateString() : 'No expiry'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricing.map((plan) => (
          <Card key={plan.bundleSize} className={plan.bundleSize === 50 ? 'border-green-500 border-2 relative' : ''}>
            {plan.bundleSize === 50 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">
                {plan.bundleSize === 1 ? 'Single Report' : `${plan.bundleSize}-Pack`}
              </CardTitle>
              <CardDescription>
                {plan.bundleSize === 1 ? 'Pay as you go' : `${plan.discountPercent}% discount`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-4xl font-bold">€{plan.totalPrice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  €{plan.pricePerReport.toFixed(2)} per report
                </div>
                {plan.savings > 0 && (
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    Save €{plan.savings.toFixed(2)}
                  </div>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {plan.bundleSize} compliance report{plan.bundleSize > 1 ? 's' : ''}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Full eligibility analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  PDF download
                </li>
                {plan.bundleSize > 1 && (
                  <>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      1 year validity
                    </li>
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      Use anytime
                    </li>
                  </>
                )}
              </ul>

              <Button
                onClick={() => handlePurchase(plan.bundleSize)}
                disabled={purchasingBundle === plan.bundleSize}
                className="w-full"
                variant={plan.bundleSize === 50 ? 'default' : 'outline'}
              >
                {purchasingBundle === plan.bundleSize ? 'Processing...' : 'Purchase'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      {credits && credits.recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your credit usage history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {credits.recentTransactions.map((txn, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{txn.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-semibold ${txn.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.credits > 0 ? '+' : ''}{txn.credits}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
