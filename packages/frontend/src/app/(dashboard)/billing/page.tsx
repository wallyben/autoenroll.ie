'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Check, CreditCard, Loader2 } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  planId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export default function BillingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchSubscription()
    }
  }, [user, authLoading, router])

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/billing/subscription')
      setSubscription(response.data.subscription)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setIsCreatingSession(true)
      const response = await api.post('/billing/create-portal-session')
      window.location.href = response.data.url
    } catch (error) {
      console.error('Failed to create portal session:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setIsCreatingSession(true)
      const response = await api.post('/billing/create-checkout-session', {
        planId,
      })
      window.location.href = response.data.url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-8 max-w-5xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing information
            </p>
          </div>

          {subscription ? (
            <div className="space-y-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Subscription</CardTitle>
                      <CardDescription>
                        Your active subscription plan
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        subscription.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-medium capitalize">
                        {subscription.planId.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Renewal Date
                      </p>
                      <p className="font-medium">
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-3 border border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <p className="text-sm text-yellow-900 dark:text-yellow-100">
                        Your subscription will be canceled at the end of the
                        current billing period.
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={handleManageBilling}
                    disabled={isCreatingSession}
                  >
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* No Subscription - Show Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>
                    Select a subscription plan to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Pay Per Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pay Per Upload</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">€49</span>
                          <span className="text-muted-foreground"> / upload</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">Single file processing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">Up to 500 employees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">
                              Full eligibility analysis
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">PDF compliance report</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">No commitment</span>
                          </li>
                        </ul>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleSubscribe('pay_per_upload')}
                          disabled={isCreatingSession}
                        >
                          Choose Plan
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Monthly */}
                    <Card className="border-primary">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Monthly</CardTitle>
                          <Badge>Popular</Badge>
                        </div>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">€149</span>
                          <span className="text-muted-foreground"> / month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">Unlimited uploads</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">Unlimited employees</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">
                              Full eligibility analysis
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">PDF compliance reports</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">Priority support</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <span className="text-sm">API access</span>
                          </li>
                        </ul>
                        <Button
                          className="w-full"
                          onClick={() => handleSubscribe('monthly')}
                          disabled={isCreatingSession}
                        >
                          {isCreatingSession ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Choose Plan'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Secure payment processing via Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All payments are processed securely through Stripe. We never
                store your payment information on our servers. Your subscription
                will automatically renew unless canceled.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
