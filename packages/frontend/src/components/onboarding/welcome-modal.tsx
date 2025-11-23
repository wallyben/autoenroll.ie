'use client'

import { useState, useEffect } from 'react'
import { X, Upload, FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface WelcomeModalProps {
  onClose: () => void
  onGetStarted: () => void
}

export function WelcomeModal({ onClose, onGetStarted }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const steps = [
    {
      icon: Upload,
      title: 'Welcome to AutoEnroll.ie! 👋',
      description: 'Let\'s get you started with Irish pension auto-enrolment compliance in just 3 simple steps.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Upload,
      title: '1. Upload Your Payroll Data',
      description: 'Upload your employee payroll data as CSV or Excel. We support all major Irish payroll formats.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      tips: [
        'Required fields: Name, DOB, PRSI Class, Earnings',
        'Download our template if you\'re unsure',
        'Data is encrypted and never stored permanently'
      ]
    },
    {
      icon: FileText,
      title: '2. Validate & Review',
      description: 'Our system automatically validates your data and flags any issues. You\'ll see a preview of results immediately.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      tips: [
        'Fix validation errors with inline suggestions',
        'Preview eligibility summary for free',
        'No payment required until you download'
      ]
    },
    {
      icon: CheckCircle2,
      title: '3. Get Your Compliance Report',
      description: 'Download a professional PDF report ready for Revenue submission. Only €49 per report.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      tips: [
        'Detailed eligibility breakdown for each employee',
        'Contribution calculations (employer, employee, state)',
        'Opt-out windows and re-enrolment dates'
      ]
    }
  ]

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
      onGetStarted()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]
  const StepIcon = step.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <Card
          className={`w-full max-w-2xl pointer-events-auto transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <CardContent className="p-8">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-green-600'
                      : index < currentStep
                      ? 'w-2 bg-green-600'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center`}>
                <StepIcon className={`h-10 w-10 ${step.color}`} />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {step.title}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {step.description}
              </p>

              {/* Tips */}
              {step.tips && (
                <div className="bg-neutral-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Quick Tips
                  </h3>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip option */}
            {currentStep < steps.length - 1 && (
              <div className="text-center mt-4">
                <button
                  onClick={handleClose}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook to manage first-time user detection
export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('autoenroll_welcome_seen')
    if (!hasSeenWelcome) {
      setIsFirstTime(true)
      setShowWelcome(true)
    }
  }, [])

  const markWelcomeSeen = () => {
    localStorage.setItem('autoenroll_welcome_seen', 'true')
    setShowWelcome(false)
  }

  const resetWelcome = () => {
    localStorage.removeItem('autoenroll_welcome_seen')
    setShowWelcome(true)
  }

  return {
    isFirstTime,
    showWelcome,
    setShowWelcome,
    markWelcomeSeen,
    resetWelcome
  }
}
