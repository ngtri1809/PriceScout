// @ts-check
export default function AboutUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Meet the team behind PriceScout - passionate developers dedicated to helping you make smarter purchasing decisions.
        </p>
      </div>

      {/* Team Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Team Member 1 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">TN</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Tri Nguyen</h3>
            <p className="text-blue-600 font-medium mb-3">Team Leader</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> <a href="mailto:ngtri1809@gmail.com" className="text-blue-600 hover:underline">ngtri1809@gmail.com</a></p>
            <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/tri-nguyen-4b94b2249/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">linkedin.com/in/tri-nguyen-4b94b2249/</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/ngtri1809" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/ngtri1809</a></p>
            <p className="mt-4 text-gray-700">
              Expertise in Full stack AI/ML responsible for coordinate team task, manage deadline, as well as contributes to frontend backend, and machine learning codebase.
            </p>
          </div>
        </div>

        {/* Team Member 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">TM</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Team Member 2</h3>
            <p className="text-green-600 font-medium mb-3">Role/Position</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> member2@example.com</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/member2</p>
            <p><strong>GitHub:</strong> github.com/member2</p>
            <p className="mt-4 text-gray-700">
              Brief bio or description about this team member's contributions and expertise.
            </p>
          </div>
        </div>

        {/* Team Member 3 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">TM</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Team Member 3</h3>
            <p className="text-purple-600 font-medium mb-3">Role/Position</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> member3@example.com</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/member3</p>
            <p><strong>GitHub:</strong> github.com/member3</p>
            <p className="mt-4 text-gray-700">
              Brief bio or description about this team member's contributions and expertise.
            </p>
          </div>
        </div>

        {/* Team Member 4 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">TM</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Team Member 4</h3>
            <p className="text-orange-600 font-medium mb-3">Role/Position</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Email:</strong> member4@example.com</p>
            <p><strong>LinkedIn:</strong> linkedin.com/in/member4</p>
            <p><strong>GitHub:</strong> github.com/member4</p>
            <p className="mt-4 text-gray-700">
              Brief bio or description about this team member's contributions and expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-8 mt-12">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 mb-4">
          At PriceScout, we believe that everyone deserves access to transparent pricing information 
          and intelligent tools to make informed purchasing decisions. Our mission is to empower consumers 
          with AI-driven insights that help them save money and shop smarter.
        </p>
        <p className="text-lg text-gray-700">
          We combine cutting-edge machine learning technology with comprehensive marketplace data to 
          provide accurate price predictions and real-time comparisons, making online shopping more 
          transparent and cost-effective for everyone.
        </p>
      </div>
    </div>
  );
}

