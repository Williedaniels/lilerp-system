import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Phone, 
  Shield, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Mic, 
  MicOff,
  Send,
  Home,
  FileText,
  Settings,
  User,
  Navigation,
  Menu,
  X
} from 'lucide-react'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isRecording, setIsRecording] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    type: '',
    urgency: '',
    location: '',
    description: ''
  })
  const [reports, setReports] = useState([
    {
      id: 1,
      type: 'Land Boundary Dispute',
      status: 'In Progress',
      date: '2025-09-25',
      urgency: 'Medium',
      location: 'Ganta Village'
    },
    {
      id: 2,
      type: 'Property Conflict',
      status: 'Resolved',
      date: '2025-09-20',
      urgency: 'High',
      location: 'Sanniquellie'
    }
  ])

  // Simulate location detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportForm(prev => ({
            ...prev,
            location: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          }))
        },
        () => {
          setReportForm(prev => ({
            ...prev,
            location: 'Nimba County, Liberia (GPS unavailable)'
          }))
        }
      )
    }
  }, [])

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setReportForm(prev => ({
          ...prev,
          description: 'Voice recording: "There is a boundary dispute between my family and our neighbor about the land near the palm tree. The neighbor is claiming our ancestral land."'
        }))
      }, 3000)
    }
  }

  const handleSubmitReport = () => {
    if (reportForm.type && reportForm.urgency && reportForm.location) {
      const newReport = {
        id: reports.length + 1,
        type: reportForm.type,
        status: 'Submitted',
        date: new Date().toISOString().split('T')[0],
        urgency: reportForm.urgency,
        location: reportForm.location.split(',')[0] || reportForm.location
      }
      setReports([newReport, ...reports])
      setReportForm({ type: '', urgency: '', location: '', description: '' })
      setCurrentScreen('reports')
      alert('Emergency report submitted successfully! Help is on the way.')
    } else {
      alert('Please fill in all required fields.')
    }
  }

  const callEmergency = () => {
    alert('Calling LILERP Emergency Line: +231-123-HELP\n\nThis would normally initiate a voice call to the IVR system.')
  }

  const callChief = () => {
    alert('Connecting to Traditional Chief...\n\nThis would connect you directly to your local traditional authority.')
  }

  // Navigation Component for Desktop
  const DesktopNavigation = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:shadow-lg">
      <div className="flex items-center h-16 px-6 bg-green-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold">LILERP</h1>
            <p className="text-sm text-green-100">Emergency Response</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button 
          onClick={() => setCurrentScreen('home')}
          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
            currentScreen === 'home' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Home className="mr-3 h-5 w-5" />
          Home
        </button>
        <button 
          onClick={() => setCurrentScreen('report')}
          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
            currentScreen === 'report' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="mr-3 h-5 w-5" />
          Report Emergency
        </button>
        <button 
          onClick={() => setCurrentScreen('reports')}
          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
            currentScreen === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="mr-3 h-5 w-5" />
          My Reports
        </button>
        <button 
          onClick={() => setCurrentScreen('profile')}
          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
            currentScreen === 'profile' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="mr-3 h-5 w-5" />
          Profile
        </button>
      </nav>
    </div>
  )

  // Mobile Header Component
  const MobileHeader = ({ title, subtitle, bgColor = 'bg-green-600' }) => (
    <div className={`lg:hidden ${bgColor} text-white p-4 rounded-b-lg shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentScreen('home')} 
            className="text-white lg:hidden"
          >
            <Home className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-sm opacity-90">{subtitle}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => { setCurrentScreen('home'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center px-4 py-2 text-left rounded-lg bg-white/10 hover:bg-white/20"
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </button>
          <button 
            onClick={() => { setCurrentScreen('report'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center px-4 py-2 text-left rounded-lg bg-white/10 hover:bg-white/20"
          >
            <AlertTriangle className="mr-3 h-5 w-5" />
            Report Emergency
          </button>
          <button 
            onClick={() => { setCurrentScreen('reports'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center px-4 py-2 text-left rounded-lg bg-white/10 hover:bg-white/20"
          >
            <FileText className="mr-3 h-5 w-5" />
            My Reports
          </button>
          <button 
            onClick={() => { setCurrentScreen('profile'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center px-4 py-2 text-left rounded-lg bg-white/10 hover:bg-white/20"
          >
            <User className="mr-3 h-5 w-5" />
            Profile
          </button>
        </div>
      )}
    </div>
  )

  // Bottom Navigation for Mobile
  const MobileBottomNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="grid grid-cols-4 py-2">
        <button 
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center py-2 ${
            currentScreen === 'home' ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('report')}
          className={`flex flex-col items-center py-2 ${
            currentScreen === 'report' ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-xs mt-1">Report</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('reports')}
          className={`flex flex-col items-center py-2 ${
            currentScreen === 'reports' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">My Reports</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('profile')}
          className={`flex flex-col items-center py-2 ${
            currentScreen === 'profile' ? 'text-purple-600' : 'text-gray-600'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  )

  // Main Content Wrapper
  const ContentWrapper = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <DesktopNavigation />
      <div className="lg:ml-64">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  )

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <ContentWrapper>
        <div className="max-w-4xl mx-auto lg:p-8">
          <MobileHeader title="LILERP Emergency" subtitle="Rural Liberia Response" />
          
          {/* Desktop Header */}
          <div className="hidden lg:block bg-green-600 text-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LILERP Emergency Response</h1>
                <p className="text-green-100">Liberia Integrated Land Registry & Emergency Response Platform</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-0 space-y-6">
            {/* Status Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm lg:text-base font-medium text-green-800">System Online</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Nimba County</Badge>
                </div>
                <p className="text-xs lg:text-sm text-green-700 mt-2">Emergency response available 24/7</p>
              </CardContent>
            </Card>

            {/* Emergency Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Button 
                  onClick={() => setCurrentScreen('report')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 lg:py-8 text-lg font-semibold"
                >
                  <AlertTriangle className="mr-3 h-6 w-6" />
                  Report Land Dispute Emergency
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Button 
                    onClick={callEmergency}
                    variant="outline" 
                    className="py-6 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call Emergency Line
                  </Button>
                  
                  <Button 
                    onClick={callChief}
                    variant="outline" 
                    className="py-6 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Call Traditional Chief
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">Response Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl lg:text-3xl font-bold text-green-600">&lt;2min</div>
                      <div className="text-xs lg:text-sm text-gray-600">Avg Response</div>
                    </div>
                    <div>
                      <div className="text-2xl lg:text-3xl font-bold text-blue-600">24/7</div>
                      <div className="text-xs lg:text-sm text-gray-600">Availability</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-purple-600">{reports.length}</div>
                      <div className="text-xs lg:text-sm text-gray-600">Total Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Desktop Only */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest emergency reports and system updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            report.status === 'Resolved' ? 'bg-green-500' :
                            report.status === 'In Progress' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="font-medium">{report.type}</div>
                            <div className="text-sm text-gray-600">{report.location}</div>
                          </div>
                        </div>
                        <Badge className={
                          report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Report Screen
  if (currentScreen === 'report') {
    return (
      <ContentWrapper>
        <div className="max-w-4xl mx-auto lg:p-8">
          <MobileHeader title="Report Emergency" subtitle="Land Dispute Response" bgColor="bg-red-600" />
          
          {/* Desktop Header */}
          <div className="hidden lg:block bg-red-600 text-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Report Emergency</h1>
                <p className="text-red-100">Submit a land dispute emergency report</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-0 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Emergency Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Type of Emergency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={reportForm.type} onValueChange={(value) => setReportForm(prev => ({...prev, type: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emergency type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Land Boundary Dispute">Land Boundary Dispute</SelectItem>
                        <SelectItem value="Property Conflict">Property Conflict</SelectItem>
                        <SelectItem value="Inheritance Dispute">Inheritance Dispute</SelectItem>
                        <SelectItem value="Forced Eviction">Forced Eviction</SelectItem>
                        <SelectItem value="Violence/Threats">Violence or Threats</SelectItem>
                        <SelectItem value="Other">Other Land Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Urgency Level */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Urgency Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={reportForm.urgency === 'Low' ? 'default' : 'outline'}
                        onClick={() => setReportForm(prev => ({...prev, urgency: 'Low'}))}
                        className="text-sm"
                      >
                        Low
                      </Button>
                      <Button 
                        variant={reportForm.urgency === 'Medium' ? 'default' : 'outline'}
                        onClick={() => setReportForm(prev => ({...prev, urgency: 'Medium'}))}
                        className="text-sm"
                      >
                        Medium
                      </Button>
                      <Button 
                        variant={reportForm.urgency === 'High' ? 'default' : 'outline'}
                        onClick={() => setReportForm(prev => ({...prev, urgency: 'High'}))}
                        className="text-sm bg-red-600 hover:bg-red-700"
                      >
                        High
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      value={reportForm.location}
                      onChange={(e) => setReportForm(prev => ({...prev, location: e.target.value}))}
                      placeholder="Village name or GPS coordinates"
                    />
                    <p className="text-xs text-gray-600 mt-2">GPS location detected automatically</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Voice Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                    <CardDescription>Describe the situation or use voice recording</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleVoiceRecord}
                        variant={isRecording ? 'destructive' : 'outline'}
                        className="flex-1"
                      >
                        {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                        {isRecording ? 'Stop Recording' : 'Voice Record'}
                      </Button>
                    </div>
                    {isRecording && (
                      <div className="bg-red-100 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-700 font-medium">Recording...</span>
                        </div>
                      </div>
                    )}
                    <Textarea 
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe what happened..."
                      rows={6}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitReport}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                >
                  <Send className="mr-3 h-5 w-5" />
                  Submit Emergency Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Reports Screen
  if (currentScreen === 'reports') {
    return (
      <ContentWrapper>
        <div className="max-w-6xl mx-auto lg:p-8">
          <MobileHeader title="My Reports" subtitle="Track your submissions" bgColor="bg-blue-600" />
          
          {/* Desktop Header */}
          <div className="hidden lg:block bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">My Reports</h1>
                <p className="text-blue-100">Track and manage your emergency submissions</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-0 space-y-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.type}</CardTitle>
                        <CardDescription>{report.location}</CardDescription>
                      </div>
                      <Badge 
                        className={
                          report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{report.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgency:</span>
                        <Badge 
                          variant="outline"
                          className={
                            report.urgency === 'High' ? 'border-red-500 text-red-700' :
                            report.urgency === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                            'border-green-500 text-green-700'
                          }
                        >
                          {report.urgency}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono">#{report.id.toString().padStart(4, '0')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {reports.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any emergency reports.</p>
                  <Button onClick={() => setCurrentScreen('report')}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Create First Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ContentWrapper>
    )
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <ContentWrapper>
        <div className="max-w-4xl mx-auto lg:p-8">
          <MobileHeader title="Profile" subtitle="Account & Settings" bgColor="bg-purple-600" />
          
          {/* Desktop Header */}
          <div className="hidden lg:block bg-purple-600 text-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Profile & Settings</h1>
                <p className="text-purple-100">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-0 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* User Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Community Member</CardTitle>
                        <CardDescription>Ganta Village, Nimba County</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>+231-XXX-XXXX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <span>English, Mano</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span>September 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Notifications</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>GPS Location</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Voice Recording</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Emergency Contacts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">LILERP Hotline</div>
                        <div className="text-sm text-gray-600">+231-123-HELP</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={callEmergency}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Traditional Chief</div>
                        <div className="text-sm text-gray-600">Local Authority</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={callChief}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* App Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>About LILERP</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p>
                      LILERP (Liberia Integrated Land Registry & Emergency Response Platform) 
                      provides 24/7 emergency response for land disputes in rural communities.
                    </p>
                    <div className="mt-4 space-y-1">
                      <div>Version: 1.0.0</div>
                      <div>Developer: Willie B. Daniels</div>
                      <div>© 2025 African Leadership University</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>
    )
  }

  return null
}

export default App
