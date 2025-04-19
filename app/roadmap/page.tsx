import AnimatedSection from "../components/AnimatedSection";

const roadmapData = [
  {
    quarter: "Q2 2025",
    goals: [
      "RWA AI-Agent integrated with Marketplace v1 launch",
      "Launch of Decentralized Option-Style Market on Assets and Tokens",
      "Expansion into DePIN category with focus on bitcoin mining, GPU sharing",
      "Updated Asset Hub & My Assets/Profile UI with new user journey",
      "Dark Mode",
      "Chainlink CCIP integration extending to EVM and non-EVM chains",
      "New EVM chain deployments including Plume, Ozean",
      "Cross-chain integration and MPC wallet for seamless user experience",
      "New Loyalty Portal Farming System with RAGMI integration",
    ],
  },
  {
    quarter: "Q1 2025",
    goals: [
      "Platform MVP Launch",
      "Core Smart Contract Development",
      "Basic Asset Tokenization Features",
      "Initial Partner Integrations",
      "Community Building",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatedSection className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
              Roadmap
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
              Our quarterly roadmap is based on the overall yearly vision and
              goals.
            </p>

            <div className="space-y-16">
              {roadmapData.map((item, index) => (
                <AnimatedSection
                  key={item.quarter}
                  className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
                  delay={0.2 * index}
                >
                  <h2 className="text-2xl font-bold mb-6">{item.quarter}</h2>
                  <ul className="space-y-4">
                    {item.goals.map((goal, goalIndex) => (
                      <li
                        key={goalIndex}
                        className="flex items-start space-x-3 text-gray-300"
                      >
                        <span className="text-white mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              ))}
            </div>

            {/* Newsletter Form */}
            <AnimatedSection
              className="mt-16 p-6 rounded-lg bg-white/5 backdrop-blur-sm"
              delay={0.6}
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
      </AnimatedSection>
    </div>
  );
}
