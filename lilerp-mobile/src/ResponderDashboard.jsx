import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { API_URL } from '@/lib/config'
import { Toaster, toast } from 'sonner';
import ResponderAnalytics from './components/ui/ResponderAnalytics';
import IncidentMap from './components/ui/incident-map.jsx';
import { 
  Phone, 
  Shield, 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Navigation,
  Menu,
  X,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Loader,
  Bell,
  Activity,
  BarChart3,
  Map,
  MessageSquare,
  UserCheck,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  PhoneCall,
  MessageCircle,
  CheckSquare,
  XCircle,
  Play,
  Pause,
  ExternalLink,
  Home,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const getAudioUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) {
    return path;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

const formatString = (str) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Incidents Distribution Map Component
const IncidentsDistributionMap = ({ incidents }) => {
  const validIncidents = incidents.filter(i => i.latitude && i.longitude);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Map className="w-5 h-5 mr-2" />
          Incidents Distribution Map
        </CardTitle>
        <CardDescription>Geographic overview of all reported incidents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
          {validIncidents.length > 0 ? (
            <IncidentMap incidents={validIncidents} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No incidents with location data to display on map.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Incidents by Type Chart Component
const IncidentsByTypeChart = ({ incidents }) => {
  const incidentTypesData = incidents.reduce((acc, incident) => {
    const type = formatString(incident.type || 'Unknown');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const totalIncidents = incidents.length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Incidents by Type
        </CardTitle>
        <CardDescription>Breakdown of incidents by their reported type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.keys(incidentTypesData).length > 0 ? (
            Object.entries(incidentTypesData)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <span className="text-sm font-medium text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${(count / totalIncidents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No incident data available for chart.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Incident Details Modal Component with Call Button
const IncidentDetailsModal = ({ incident, onClose, onUpdateStatus, onCallReporter }) => {
  if (!incident) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formatString(incident.title || incident.type)}</h2>
              <p className="text-sm text-gray-500 mt-1">Incident ID: #{incident.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex gap-2 mb-6">
            <Badge className={
              incident.priority === 'critical' ? 'bg-red-600' :
              incident.priority === 'high' ? 'bg-orange-500' :
              incident.priority === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }>
              {formatString(incident.priority)} Priority
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              {formatString(incident.status)}
            </Badge>
          </div>

          {/* Map Section */}
          {incident.latitude && incident.longitude && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                Reporter Location
              </h3>
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <IncidentMap
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                  location={incident.location}
                  reporterName={incident.reporter?.name}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {incident.location?.address || incident.location || 'Location not specified'}
              </p>
            </div>
          )}

          {/* Incident Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{incident.description}</p>
            </div>

            {/* Voice Recording & Transcription */}
            {incident.voiceRecording && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Voice Recording
                </h3>
                <audio
                  src={getAudioUrl(incident.voiceRecording)}
                  controls
                  className="w-full"
                />
              </div>
            )}

            {incident.voiceTranscription && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Voice Transcription
                </h3>
                <p className="text-gray-700 italic bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  "{incident.voiceTranscription}"
                </p>
              </div>
            )}

            {/* Incident Metadata */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-1">Type</h3>
                <p className="text-gray-900">{formatString(incident.type)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-1">Created</h3>
                <p className="text-gray-900">{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Reporter Information */}
            {incident.reporter && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 flex items-center mb-4">
                  <User className="w-5 h-5 mr-2" />
                  Reporter Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="text-gray-900 font-medium">{incident.reporter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="text-gray-900 font-medium">{incident.reporter.phone || 'Not provided'}</p>
                  </div>
                  {incident.reporter.community && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Community</p>
                      <p className="text-gray-900 font-medium">{incident.reporter.community}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
              {incident.reporter?.phone && (
                <Button
                  onClick={() => onCallReporter(incident.reporter.phone)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Reporter
                </Button>
              )}
              {incident.status !== 'investigating' && (
                <Button
                  onClick={() => onUpdateStatus(incident.id, 'investigating')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Start Investigation
                </Button>
              )}
              {incident.status !== 'resolved' && (
                <Button
                  onClick={() => onUpdateStatus(incident.id, 'resolved')}
                  variant="outline"
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ResponderDashboard() {
  // Core state
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [responder, setResponder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Forms
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Reports data
  const [emergencyReports, setEmergencyReports] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedToday: 0
  })

  // Incidents and error handling
  const [incidents, setIncidents] = useState([])
  const [error, setError] = useState(null)

  // Splash screen and authentication check
  useEffect(() => {
    const initializeApp = async () => {
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000))
      
      const token = localStorage.getItem('lilerp_responder_token')
      const savedResponder = localStorage.getItem('lilerp_responder_user')
      
      if (token && savedResponder) {
        try {
          const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.user.isResponder) {
              setResponder(data.user)
              setIsAuthenticated(true)
              fetchIncidents(token)
              await minSplashTime
              setCurrentScreen('dashboard')
            } else {
              handleLogout()
              await minSplashTime
              setCurrentScreen('login')
            }
          } else {
            handleLogout()
            await minSplashTime
            setCurrentScreen('login')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          await minSplashTime
          setCurrentScreen('login')
        }
      } else {
        await minSplashTime
        setCurrentScreen('login')
      }
      
      setIsLoading(false)
    }
    
    initializeApp()
  }, [])

  // Fetch incidents when logged in
  useEffect(() => {
    if (isAuthenticated && responder) {
      fetchIncidents()
    }
  }, [isAuthenticated, responder])

  // Fetch incidents from server
  const fetchIncidents = async (token) => {
    try {
      setIsLoading(true)
      const authToken = token || localStorage.getItem('lilerp_responder_token')
      
      if (!authToken) {
        setIsAuthenticated(false)
        return
      }

      const response = await fetch(`${API_URL}/responders/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dashboard data:', data)
        
        setIncidents(data.incidents || [])
        setEmergencyReports(data.incidents || [])
        
        setStats({
          totalReports: data.stats?.totalReports || data.incidents?.length || 0,
          pendingReports: data.stats?.pending || 0,
          inProgressReports: data.stats?.investigating || 0,
          resolvedToday: data.stats?.resolvedToday || 0
        })
      } else if (response.status === 401 || response.status === 403) {
        setIsAuthenticated(false)
        setError('Session expired. Please login again.')
      } else {
        setError('Failed to fetch incidents')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.user.isResponder) {
          localStorage.setItem('lilerp_responder_token', data.token)
          localStorage.setItem('lilerp_responder_refreshToken', data.refreshToken)
          localStorage.setItem('lilerp_responder_user', JSON.stringify(data.user))
          setResponder(data.user)
          setIsAuthenticated(true)
          setCurrentScreen('dashboard')
          fetchIncidents(data.token)
          toast.success('Login successful!')
        } else {
          toast.error('This account is not authorized as a responder')
        }
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileNavigation = () => {
    setCurrentScreen('profile')
  }

  const handleLogout = () => {
    localStorage.removeItem('lilerp_responder_token')
    localStorage.removeItem('lilerp_responder_refreshToken')
    localStorage.removeItem('lilerp_responder_user')
    setIsAuthenticated(false)
    setResponder(null)
    setCurrentScreen('login')
    toast.success('Logged out successfully')
  }

  // Report actions
  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('lilerp_responder_token')
      const response = await fetch(`${API_URL}/incidents/${reportId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Status updated successfully!')
        fetchIncidents()
        if (selectedIncident && selectedIncident.id === reportId) {
          setSelectedIncident({ ...selectedIncident, status: newStatus })
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCallReporter = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`
      toast.success(`Calling ${phone}...`)
    } else {
      toast.error('Phone number not available')
    }
  }

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus
    const matchesSearch = !searchTerm || 
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8 animate-bounce">
            <Shield className="w-24 h-24 text-white mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">LILERP</h1>
          <p className="text-blue-100 text-lg">Responder Dashboard</p>
          <div className="mt-8">
            <Loader className="w-8 h-8 text-white animate-spin mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Responder Login</CardTitle>
            <CardDescription>Access the emergency response dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="responder@lilerp.org"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard Screen
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Toaster position="top-center" />
        
        {/* Sidebar for Desktop */}
        <div className={`hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-2" />
                  <span className="font-bold text-xl">LILERP</span>
                </div>
              )}
              {!sidebarOpen && <Shield className="w-8 h-8 text-blue-600 mx-auto" />}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 ml-auto"
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Overview</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Analytics</span>}
            </button>
            
            <button
              onClick={handleProfileNavigation}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Profile</span>}
            </button>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-2" />
                <span className="font-bold text-xl">LILERP</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' ? 'Dashboard Overview' : 'Analytics & Reports'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {responder?.name || 'Responder'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => fetchIncidents()}>
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Reports</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingReports}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">In Progress</p>
                          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgressReports}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedToday}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search incidents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Incidents List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Incidents</CardTitle>
                    <CardDescription>
                      {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : filteredIncidents.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No incidents found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredIncidents.map((incident) => (
                          <div
                            key={incident.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {formatString(incident.title || incident.type)}
                                  </h3>
                                  <Badge className={
                                    incident.priority === 'critical' ? 'bg-red-600' :
                                    incident.priority === 'high' ? 'bg-orange-500' :
                                    incident.priority === 'medium' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }>
                                    {formatString(incident.priority)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {formatString(incident.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {incident.description?.substring(0, 150)}
                                  {incident.description?.length > 150 ? '...' : ''}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  {incident.location && (
                                    <span className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {incident.location}
                                    </span>
                                  )}
                                  {incident.reporter?.name && (
                                    <span className="flex items-center">
                                      <User className="w-4 h-4 mr-1" />
                                      {incident.reporter.name}
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {new Date(incident.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600 ml-4">
                                <ExternalLink className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* ResponderAnalytics Component with Charts */}
                <ResponderAnalytics incidents={incidents} />
                
                {/* Incidents Distribution Map */}
                <IncidentsDistributionMap incidents={incidents} />
                
                {/* Incidents by Type Chart */}
                <IncidentsByTypeChart incidents={incidents} />
              </div>
            )}
          </div>
        </div>

        {/* Incident Details Modal */}
        {selectedIncident && (
          <IncidentDetailsModal
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onUpdateStatus={handleUpdateStatus}
            onCallReporter={handleCallReporter}
          />
        )}
      </div>
    )
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="w-20"></div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{responder?.name}</CardTitle>
                  <CardDescription>{responder?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 mt-1">{responder?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{responder?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900 mt-1">Emergency Responder</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className="mt-1 bg-green-600">Active</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

export default ResponderDashboard
