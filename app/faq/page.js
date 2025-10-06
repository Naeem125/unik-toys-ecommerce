"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState(new Set([0])) // First item open by default

  const faqCategories = [
    {
      title: "Orders & Payment",
      faqs: [
        {
          question: "How do I place an order?",
          answer:
            "Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or sign in to complete your purchase. We accept all major credit cards and PayPal.",
        },
        {
          question: "Can I modify or cancel my order?",
          answer:
            "You can modify or cancel your order within 1 hour of placing it by contacting our customer service. After that, we begin processing orders and changes may not be possible.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through Stripe.",
        },
        {
          question: "Do you offer payment plans?",
          answer:
            "Currently, we don't offer payment plans, but we do accept PayPal Pay in 4 for eligible purchases over $30.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      faqs: [
        {
          question: "How much does shipping cost?",
          answer:
            "We offer free shipping on all orders over $50. For orders under $50, standard shipping is $9.99. Express shipping options are available at checkout.",
        },
        {
          question: "How long does delivery take?",
          answer:
            "Standard shipping takes 3-7 business days. Express shipping takes 1-3 business days. You'll receive a tracking number once your order ships.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Currently, we only ship within the United States. We're working on expanding to international shipping in the future.",
        },
        {
          question: "What if my package is lost or damaged?",
          answer:
            "If your package is lost or arrives damaged, please contact us immediately. We'll work with the shipping carrier to resolve the issue and ensure you receive your order.",
        },
      ],
    },
    {
      title: "Returns & Exchanges",
      faqs: [
        {
          question: "What is your return policy?",
          answer:
            "We offer a 30-day return policy for unused items in original packaging. Items must be returned in the same condition they were received.",
        },
        {
          question: "How do I return an item?",
          answer:
            "Contact our customer service to initiate a return. We'll provide you with a return shipping label and instructions. Returns are free for defective items.",
        },
        {
          question: "When will I receive my refund?",
          answer:
            "Refunds are processed within 3-5 business days after we receive your returned item. The refund will appear on your original payment method within 5-10 business days.",
        },
        {
          question: "Can I exchange an item?",
          answer:
            "Yes, we offer exchanges for different sizes or colors of the same item. Contact customer service to arrange an exchange.",
        },
      ],
    },
    {
      title: "Product Information",
      faqs: [
        {
          question: "Are your toys safe for children?",
          answer:
            "Yes, all our toys meet or exceed safety standards set by the Consumer Product Safety Commission (CPSC). We test all products for safety and quality before adding them to our catalog.",
        },
        {
          question: "What age ranges are your toys suitable for?",
          answer:
            "Our toys are designed for children of all ages, from infants to teenagers. Each product page includes recommended age ranges to help you choose appropriate toys.",
        },
        {
          question: "Do you offer educational toys?",
          answer:
            "Yes, we have a dedicated Educational Toys category featuring STEM toys, learning games, puzzles, and other products designed to promote learning and development.",
        },
        {
          question: "Are your toys environmentally friendly?",
          answer:
            "We're committed to sustainability and work with manufacturers who use eco-friendly materials and practices whenever possible. Look for our 'Eco-Friendly' tags on qualifying products.",
        },
      ],
    },
    {
      title: "Account & Technical",
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "Click 'Register' in the top right corner of our website. You'll need to provide your name, email address, and create a password. Account creation is free and gives you access to order tracking and faster checkout.",
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer:
            "Click 'Login' and then 'Forgot Password'. Enter your email address and we'll send you instructions to reset your password.",
        },
        {
          question: "How do I track my order?",
          answer:
            "Once your order ships, you'll receive an email with tracking information. You can also track orders by logging into your account and visiting the 'Order History' section.",
        },
        {
          question: "Why can't I add items to my cart?",
          answer:
            "This usually happens when an item is out of stock or there's a technical issue. Try refreshing the page or clearing your browser cache. If the problem persists, contact our support team.",
        },
      ],
    },
  ]

  const allFaqs = faqCategories.flatMap((category, categoryIndex) =>
    category.faqs.map((faq, faqIndex) => ({
      ...faq,
      id: `${categoryIndex}-${faqIndex}`,
      category: category.title,
    })),
  )

  const filteredFaqs = searchQuery
    ? allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allFaqs

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, orders, shipping, and more.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {searchQuery ? (
            // Search Results
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results ({filteredFaqs.length} found)</h2>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{faq.question}</h3>
                            <p className="text-sm text-orange-600">{faq.category}</p>
                          </div>
                          {openItems.has(faq.id) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {openItems.has(faq.id) && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">Try different keywords or browse categories below.</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Category View
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h2>
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const id = `${categoryIndex}-${faqIndex}`
                      return (
                        <Card key={id}>
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleItem(id)}
                              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                {openItems.has(id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                            {openItems.has(id) && (
                              <div className="px-6 pb-6">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-8">
              <HelpCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our customer support team is here to help.
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <a href="/contact">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
