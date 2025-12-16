import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart, Award, Users, Truck, HeartHandshake } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "All our toys meet the highest safety standards and are thoroughly tested for quality and durability.",
    },
    {
      icon: Heart,
      title: "Child Development",
      description: "We carefully select toys that promote learning, creativity, and healthy development in children.",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "Every product comes with our quality guarantee. If you're not satisfied, we'll make it right.",
    },
    {
      icon: Users,
      title: "Family Owned",
      description: "As a family-owned business, we understand the importance of providing safe, fun toys for children.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get toys to your door as fast as possible.",
    },
    {
      icon: HeartHandshake,
      title: "Customer Care",
      description: "Our dedicated customer service team is here to help with any questions or concerns.",
    },
  ]

  const team = [
    {
      name: "Bilal Amin",
      role: "Founder & CEO",
      description: "Leads company vision, strategy, and overall growth.",
    },
    {
      name: "Naeem Amin",
      role: "Head of Product",
      description: "Oversees product direction, development, and user experience.",
    }
    // {
    //   name: "Lisa Rodriguez",
    //   role: "Customer Experience",
    //   description: "Dedicated to ensuring every family has an amazing experience with Unique Toys.",
    // },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Unique Toys</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            We're passionate about bringing joy, learning, and imagination to children through carefully selected,
            high-quality toys. Since our founding, we've been committed to providing families with safe, educational,
            and fun toys at unbeatable prices.
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Unique Toys was founded in 2025 by Bilal Amin and Naeem Amin, who struggled to find high-quality,
                  educational toys at affordable prices. After countless hours researching and testing toys for their own
                  children, they realized there was a gap in the market for a store that truly prioritized both quality
                  and value.
                </p>
                <p>
                  What started as a small online store has grown into a trusted destination for parents seeking the best
                  toys for their children. We work directly with manufacturers to ensure quality while keeping prices
                  low, and we test every product ourselves before adding it to our catalog.
                </p>
                <p>
                  Today, we're proud to serve thousands of families across the country, helping children learn, grow,
                  and play through the power of quality toys.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/happy-family-playing-with-toys.png"
                alt="Happy family playing with toys"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">What drives us every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-[#b88a44]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind Unique Toys</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center w-full md:w-80">
                <CardContent className="p-6">
                  <div className="bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#b88a44] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Promise */}
        <div className="bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Promise to You</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            We promise to continue providing high-quality, safe, and educational toys at the lowest possible prices.
            Your child's happiness and development are our top priorities, and we're committed to earning your trust
            with every purchase.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
