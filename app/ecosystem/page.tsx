import AnimatedSection from "../components/AnimatedSection";

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
              Our Ecosystem
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
              Join our growing ecosystem of partners, developers, and community
              members
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.2}
              >
                <h2 className="text-2xl font-bold mb-4">Partners</h2>
                <p className="text-gray-400 mb-4">
                  Discover our network of strategic partners and collaborators
                </p>
                <a
                  href="/ecosystem/partners"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  View Partners
                </a>
              </AnimatedSection>

              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.3}
              >
                <h2 className="text-2xl font-bold mb-4">Developers</h2>
                <p className="text-gray-400 mb-4">
                  Access our developer resources and documentation
                </p>
                <a
                  href="/ecosystem/developers"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Developer Portal
                </a>
              </AnimatedSection>

              <AnimatedSection
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                delay={0.4}
              >
                <h2 className="text-2xl font-bold mb-4">Community</h2>
                <p className="text-gray-400 mb-4">
                  Join our vibrant community of RWA enthusiasts
                </p>
                <a
                  href="/ecosystem/community"
                  className="inline-block px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  Join Community
                </a>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
