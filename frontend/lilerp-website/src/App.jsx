import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import lilerpLogo from './assets/logo.png'
import { Badge } from '@/components/ui/badge.jsx'
import { Phone, Shield, Users, MapPin, Clock, AlertTriangle, CheckCircle, Globe, Smartphone, HeadphonesIcon } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={lilerpLogo} alt="LILERP Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LILERP</h1>
                <p className="text-sm text-gray-600">Liberia Integrated Land Registry & Emergency Response Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`text-sm font-medium transition-colors ${activeTab === 'features' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Features
              </button>
              <button 
                onClick={() => setActiveTab('demo')}
                className={`text-sm font-medium transition-colors ${activeTab === 'demo' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Demo
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`text-sm font-medium transition-colors ${activeTab === 'contact' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {activeTab === 'overview' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
               Now Live in Nimba County
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Emergency Response for
              <span className="text-green-600 block">Rural Land Disputes</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A voice-based emergency response system designed specifically for rural Liberian communities. 
              Report land disputes, get immediate help, and connect with traditional authorities - all through a simple phone call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                <Phone className="mr-2 h-5 w-5" />
                Call Emergency Line: +1-762-248-5141
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" onClick={() => setActiveTab('demo')}>
                <Globe className="mr-2 h-5 w-5" />
                View System Demo
              </Button>
            </div>
          </div>

          {/* Problem & Solution */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">
                <ul className="space-y-3">
                  <li>• Land disputes affect 68% of rural communities in Nimba County</li>
                  <li>• No reliable emergency response system for rural areas</li>
                  <li>• Language barriers prevent access to formal services</li>
                  <li>• Conflicts escalate due to delayed intervention</li>
                  <li>• Traditional authorities lack modern communication tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Our Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <ul className="space-y-3">
                  <li>• Voice-based IVR system accessible to illiterate users</li>
                  <li>• Immediate connection to traditional chiefs and responders</li>
                  <li>• Multi-language support (English, Mano, Gio)</li>
                  <li>• GPS location tracking for rapid response</li>
                  <li>• Integration with formal emergency services</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Impact in Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">621,841</div>
                <div className="text-sm text-gray-600">People in Nimba County</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">68%</div>
                <div className="text-sm text-gray-600">Communities with Land Disputes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">&lt;2min</div>
                <div className="text-sm text-gray-600">Average Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Emergency Availability</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">How LILERP Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>1. Call Emergency Line</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Dial +1 762 248 5141 from any phone. Our voice system guides you through simple menu options in your preferred language.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>2. Report Your Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Speak your village name and describe the land dispute. Our system automatically identifies your location and urgency level.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>3. Get Connected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Traditional chiefs, community responders, and emergency services are immediately notified. Help arrives based on urgency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* Features Section */}
      {activeTab === 'features' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">System Features</h2>
            <p className="text-xl text-gray-600">Comprehensive emergency response designed for rural communities</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <HeadphonesIcon className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Voice-Based Interface</CardTitle>
                <CardDescription>Accessible to illiterate users</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Simple 3-level menu system</li>
                  <li>• Voice prompts in local languages</li>
                  <li>• No smartphone required</li>
                  <li>• Works on basic phones</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>24/7 Emergency Response</CardTitle>
                <CardDescription>Always available when you need help</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Immediate incident logging</li>
                  <li>• Automatic responder notification</li>
                  <li>• Real-time status tracking</li>
                  <li>• Follow-up coordination</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Traditional Integration</CardTitle>
                <CardDescription>Respects local governance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Direct connection to chiefs</li>
                  <li>• Community-based mediation</li>
                  <li>• Cultural sensitivity protocols</li>
                  <li>• Elder council coordination</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Location Services</CardTitle>
                <CardDescription>Precise incident mapping</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Village-level identification</li>
                  <li>• GPS coordinate capture</li>
                  <li>• Boundary dispute mapping</li>
                  <li>• Response route optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Protected information</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Encrypted data storage</li>
                  <li>• Anonymous reporting options</li>
                  <li>• Secure communication channels</li>
                  <li>• GDPR compliance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Multi-Platform Access</CardTitle>
                <CardDescription>Multiple ways to connect</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Voice calls (primary)</li>
                  <li>• Mobile app (optional)</li>
                  <li>• SMS backup system</li>
                  <li>• Web dashboard for responders</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Technical Specifications */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl">Technical Specifications</CardTitle>
              <CardDescription>Built for rural infrastructure constraints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3">Infrastructure Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• GSM voice network (minimum)</li>
                    <li>• Basic phone compatibility</li>
                    <li>• Offline-capable design</li>
                    <li>• Solar power support</li>
                    <li>• Low bandwidth optimization</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">System Architecture</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Twilio IVR integration</li>
                    <li>• SQLite database</li>
                    <li>• Node.js backend API</li>
                    <li>• React web dashboard</li>
                    <li>• React Native mobile app</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      )}

      {/* Demo Section */}
      {activeTab === 'demo' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">System Demo</h2>
            <p className="text-xl text-gray-600">See how LILERP works in action</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* IVR Flow Demo */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  IVR Call Flow Demo
                </CardTitle>
                <CardDescription>Experience the voice interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                  <div className="mb-2">📞 Calling +1-762-248-5141</div>
                  <div className="mb-2">🔊 "Welcome to LILERP Emergency Response"</div>
                  <div className="mb-2">🔊 "Press 1 for English, 2 for Mano, 3 for Gio"</div>
                  <div className="mb-2">👤 *presses 1*</div>
                  <div className="mb-2">🔊 "Press 1 to report land dispute"</div>
                  <div className="mb-2">🔊 "Press 2 if violence is happening - urgent"</div>
                  <div className="mb-2">🔊 "Press 3 to speak with traditional chief"</div>
                  <div className="mb-2">👤 *presses 1*</div>
                  <div className="mb-2">🔊 "Recording your location... speak after beep"</div>
                  <div className="mb-2">👤 "Ganta village, boundary dispute with neighbor"</div>
                  <div>🔊 "Report submitted. Help is on the way."</div>
                </div>
                <Button className="w-full" variant="outline">
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  Listen to Audio Demo
                </Button>
              </CardContent>
            </Card>

            {/* Mobile App Screenshots */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Mobile App Interface
                </CardTitle>
                <CardDescription>For tech-savvy users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <div className="bg-white rounded-lg shadow-md p-4 max-w-xs mx-auto">
                    <div className="bg-green-600 text-white p-3 rounded-t-lg">
                      <h3 className="font-bold">LILERP Emergency</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Report Emergency
                      </Button>
                      <Button className="w-full" variant="outline">
                        Emergency Hotline
                      </Button>
                      <Button className="w-full" variant="outline">
                        My Reports
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Download Mobile App
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Architecture Diagram */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>How all components work together</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold">User Interface</div>
                      <div className="text-sm">Voice IVR, Mobile App</div>
                    </div>
                    <div className="flex justify-center">
                      <div className="text-2xl">→</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="font-semibold">Backend API</div>
                      <div className="text-sm">Processing, Database, Notifications</div>
                    </div>
                  </div>
                  <div className="mt-4 text-2xl">↓</div>
                  <div className="bg-purple-100 p-4 rounded-lg mt-4">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-semibold">Response Network</div>
                    <div className="text-sm">Chiefs, Community Responders, Emergency Services</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      )}

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-xl text-gray-600">Partner with us to expand emergency response across Liberia</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>Available 24/7 for emergencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold">Emergency Hotline</div>
                      <div className="text-gray-600">+1-762-248-5141</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">Coverage Area</div>
                      <div className="text-gray-600">Nimba County, Liberia</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-semibold">Response Time</div>
                      <div className="text-gray-600">Average &lt; 2 minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>About the LILERP initiative</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-semibold">Developer</div>
                    <div className="text-gray-600">Willie B. Daniels</div>
                    <div className="text-sm text-gray-500">Software Engineering Student, African Leadership University</div>
                  </div>
                  <div>
                    <div className="font-semibold">Project Type</div>
                    <div className="text-gray-600">Capstone Research Project</div>
                  </div>
                  <div>
                    <div className="font-semibold">Timeline</div>
                    <div className="text-gray-600">September - November 2025</div>
                  </div>
                  <div>
                    <div className="font-semibold">Status</div>
                    <Badge className="bg-green-100 text-green-800">Active Development</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Partnership Form */}
            <Card>
              <CardHeader>
                <CardTitle>Partner With Us</CardTitle>
                <CardDescription>NGOs, government agencies, and community organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organization Name</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Person</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your.email@organization.org"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+231-XXX-XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Partnership Interest</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>Select partnership type</option>
                      <option>Funding & Investment</option>
                      <option>Technical Implementation</option>
                      <option>Community Outreach</option>
                      <option>Government Integration</option>
                      <option>Research Collaboration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea 
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us about your organization and how you'd like to partner with LILERP..."
                    ></textarea>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Submit Partnership Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={lilerpLogo} alt="LILERP Logo" className="h-10 w-10" />
                <div>
                  <h3 className="text-lg font-bold">LILERP</h3>
                  <p className="text-sm text-gray-400">Emergency Response for Rural Liberia</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Bridging the gap between traditional governance and modern emergency response 
                through accessible voice-based technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setActiveTab('overview')} className="hover:text-white">System Overview</button></li>
                <li><button onClick={() => setActiveTab('features')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => setActiveTab('demo')} className="hover:text-white">Demo</button></li>
                <li><button onClick={() => setActiveTab('contact')} className="hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <div>Hotline: +1-762-248-5141</div>
                <div>Coverage: Nimba County</div>
                <div>Available: 24/7</div>
                <div className="pt-2">
                  <Badge className="bg-green-600 text-white">
                    System Online
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 LILERP Project. Developed by Willie B. Daniels for African Leadership University.</p>
            <p className="mt-2">Supporting rural communities through accessible emergency response technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
