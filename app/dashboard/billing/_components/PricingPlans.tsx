'use client'
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useToast } from "@/components/ui/use-toast"
import { useContext } from "react"
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

const pricingPlans = [
    {
        name: 'Basic Plan',
        credits: "50,000",  // Changed to string
        price: 9.99,
        features: [
            '50,000 Credits',
            'Basic Support',
            'Standard Response Time',
            'Basic Analytics'
        ]
    },
    {
        name: 'Pro Plan',
        credits: "150,000",  // Changed to string
        price: 24.99,
        features: [
            '150,000 Credits',
            'Priority Support',
            'Faster Response Time',
            'Advanced Analytics',
            'Custom Templates'
        ]
    },
    {
        name: 'Enterprise Plan',
        credits: "500,000",  // Changed to string
        price: 49.99,
        features: [
            '500,000 Credits',
            '24/7 Support',
            'Instant Response Time',
            'Full Analytics Suite',
            'Custom Integration',
            'Dedicated Account Manager'
        ]
    }
]

interface PricingPlansProps {
    onSuccess?: () => void;
}

export default function PricingPlans({ onSuccess }: PricingPlansProps) {
    const { user } = useUser()
    const { toast } = useToast()
    const { setTotalUsage, setUserPlan } = useContext(TotalUsageContext)

    const handlePaymentSuccess = async (details: any, plan: any) => {
        try {
            const response = await fetch('/api/billing/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    email: user?.primaryEmailAddress?.emailAddress,
                    planName: plan.name,
                    credits: plan.credits,
                    transactionId: details.id,
                    amount: plan.price
                }),
            })

            if (response.ok) {
                setTotalUsage(0)
                setUserPlan(plan.name)
                toast({
                    title: "Upgrade Successful!",
                    description: `You've successfully upgraded to ${plan.name}!`,
                })
                onSuccess?.()
            } else {
                throw new Error('Failed to update plan')
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process upgrade. Please contact support.",
            })
        }
    }

    return (
        <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center mb-8">
                    Choose Your Plan
                </h1>

                <div className="grid md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => (
                        <div key={plan.name} className="border rounded-lg p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">{plan.name}</h2>
                            <p className="text-3xl font-bold mb-6">
                                ${plan.price}
                                <span className="text-sm font-normal">/month</span>
                            </p>
                            <div className="mb-6">
                                <p className="text-lg font-semibold mb-2">Credits:</p>
                                <p className="text-2xl font-bold text-primary">
                                    {plan.credits} {/* Removed toLocaleString() */}
                                </p>
                            </div>
                            <ul className="mb-6 space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm">
                                        <svg
                                            className="w-4 h-4 mr-2 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {user ? (
                                <PayPalButtons
                                    createOrder={(data, actions) => 
                                        actions.order.create({
                                            purchase_units: [{
                                                amount: {
                                                    value: plan.price.toString(),
                                                    currency_code: "USD"
                                                },
                                                description: `${plan.name} - ${plan.credits} Credits`
                                            }],
                                            intent: "CAPTURE"
                                        })
                                    }
                                    onApprove={async (data, actions) => {
                                        if (actions.order) {
                                            const details = await actions.order.capture();
                                            await handlePaymentSuccess(details, plan);
                                        }
                                    }}
                                    onError={() => {
                                        toast({
                                            variant: "destructive",
                                            title: "Payment Error",
                                            description: "There was an error processing your payment.",
                                        })
                                    }}
                                />
                            ) : (
                                <Button className="w-full" variant="outline">
                                    Sign in to upgrade
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PayPalScriptProvider>
    )
}