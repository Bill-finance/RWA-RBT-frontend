import AnimatedSection from "../components/AnimatedSection";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
              Contact Us
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
              Feel free to reach out to us for queries, partnerships or anything
              else.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Methods */}
              <AnimatedSection className="space-y-8" delay={0.2}>
                <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-4">Join Community</h2>
                  <p className="text-gray-400 mb-4">
                    Connect with our community on Discord and Telegram
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
                      Discord
                    </button>
                    <button className="px-6 py-3 border border-white rounded-full hover:bg-white/10 transition-colors">
                      Telegram
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-4">Support Email</h2>
                  <p className="text-gray-400 mb-4">
                    For general inquiries and support
                  </p>
                  <a
                    href="mailto:support@example.com"
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    support@example.com
                  </a>
                </div>

                <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-4">
                    Marketplace Exclusive Drops Redemption Email
                  </h2>
                  <p className="text-gray-400 mb-4">
                    For marketplace and drops related inquiries
                  </p>
                  <a
                    href="mailto:drops@example.com"
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    drops@example.com
                  </a>
                </div>
              </AnimatedSection>

              {/* Newsletter Form */}
              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.4}
              >
                <h2 className="text-2xl font-bold mb-4">
                  Join our Flagship RWA Newsletter
                </h2>
                <p className="text-gray-400 mb-6">
                  We&apos;ll send you RWA packed deets twice a month.
                </p>
                <form className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
