import AnimatedSection from "../components/AnimatedSection";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
              Our Products
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
              Discover our suite of RWA products and services
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.2}
              >
                <h2 className="text-2xl font-bold mb-4">Asset Issuance</h2>
                <p className="text-gray-400 mb-4">
                  Tokenize your real-world assets with our secure and efficient
                  platform
                </p>
                <a
                  href="/products/issuance"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Learn More
                </a>
              </AnimatedSection>

              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.3}
              >
                <h2 className="text-2xl font-bold mb-4">Trading</h2>
                <p className="text-gray-400 mb-4">
                  Trade RWA tokens in our secure and liquid marketplace
                </p>
                <a
                  href="/products/trading"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Learn More
                </a>
              </AnimatedSection>

              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.4}
              >
                <h2 className="text-2xl font-bold mb-4">Staking</h2>
                <p className="text-gray-400 mb-4">
                  Earn rewards by staking your RWA tokens
                </p>
                <a
                  href="/products/staking"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Learn More
                </a>
              </AnimatedSection>

              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.5}
              >
                <h2 className="text-2xl font-bold mb-4">Lending</h2>
                <p className="text-gray-400 mb-4">
                  Borrow against your RWA tokens with competitive rates
                </p>
                <a
                  href="/products/lending"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Learn More
                </a>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
