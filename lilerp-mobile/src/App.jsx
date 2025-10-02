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
  Navigation
} from 'lucide-react'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isRecording, setIsRecording] = useState(false)
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

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 rounded-b-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold">LILERP Emergency</h1>
              <p className="text-sm text-green-100">Rural Liberia Response</p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">System Online</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Nimba County</Badge>
              </div>
              <p className="text-xs text-green-700 mt-2">Emergency response available 24/7</p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Actions */}
        <div className="p-4 space-y-4">
          <Button 
            onClick={() => setCurrentScreen('report')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
          >
            <AlertTriangle className="mr-3 h-6 w-6" />
            Report Land Dispute Emergency
          </Button>

          <div className="grid grid-cols-2 gap-4">
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
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">&lt;2min</div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-xs text-gray-600">Availability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
          <div className="grid grid-cols-4 py-2">
            <button 
              onClick={() => setCurrentScreen('home')}
              className="flex flex-col items-center py-2 text-green-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('report')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs mt-1">Report</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('reports')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">My Reports</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Report Screen
  if (currentScreen === 'report') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-4 rounded-b-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={() => setCurrentScreen('home')} className="text-white">
              <Home className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Report Emergency</h1>
              <p className="text-sm text-red-100">Land Dispute Response</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
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
                rows={4}
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
          <div className="grid grid-cols-4 py-2">
            <button 
              onClick={() => setCurrentScreen('home')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('report')}
              className="flex flex-col items-center py-2 text-red-600"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs mt-1">Report</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('reports')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">My Reports</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Reports Screen
  if (currentScreen === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-b-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={() => setCurrentScreen('home')} className="text-white">
              <Home className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">My Reports</h1>
              <p className="text-sm text-blue-100">Track your submissions</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
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
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className={`h-4 w-4 ${
                        report.urgency === 'High' ? 'text-red-500' :
                        report.urgency === 'Medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <span>{report.urgency}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {reports.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports submitted yet</p>
                <Button 
                  onClick={() => setCurrentScreen('report')}
                  className="mt-4"
                >
                  Submit Your First Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
          <div className="grid grid-cols-4 py-2">
            <button 
              onClick={() => setCurrentScreen('home')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('report')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs mt-1">Report</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('reports')}
              className="flex flex-col items-center py-2 text-blue-600"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">My Reports</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 rounded-b-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={() => setCurrentScreen('home')} className="text-white">
              <Home className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Profile</h1>
              <p className="text-sm text-purple-100">Account & Settings</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
          <div className="grid grid-cols-4 py-2">
            <button 
              onClick={() => setCurrentScreen('home')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('report')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs mt-1">Report</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('reports')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">My Reports</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className="flex flex-col items-center py-2 text-purple-600"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
