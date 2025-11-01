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
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarTrigger,
} from './components/ui/sidebar.jsx';
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
  User
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

// New component for incident details modal
const IncidentDetailsModal = ({ incident, onClose, onUpdateStatus, onCallReporter }) => {
  if (!incident) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">{formatString(incident.title)}</h2>
              <p className="text-gray-600">ID: {incident.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Map Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Reporter Location
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {incident.latitude && incident.longitude ? (
                <IncidentMap
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                  location={incident.location}
                  reporterName={incident.reporter?.name}
                />
              ) : (
                <p className="text-gray-500">No location data available</p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              📍 {incident.location?.address || incident.location || 'Location not specified'}
            </p>
          </div>

          {/* Incident Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Description</h3>
              <p className="text-gray-600">{incident.description}</p>
            </div>

            {/* Voice Recording & Transcription */}
            {incident.voiceRecording && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Voice Recording</h3>
                <audio
                  src={getAudioUrl(incident.voiceRecording)}
                  controls
                  className="w-full"
                />
              </div>
            )}

            {incident.voiceTranscription && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Transcription
                </h3>
                <p className="text-gray-600 italic bg-gray-100 p-3 rounded-md">
                  "{incident.voiceTranscription}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Type</h3>
                <p className="text-gray-600">{formatString(incident.type)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Priority</h3>
                <Badge className={
                  incident.priority === 'critical' ? 'bg-red-600' :
                  incident.priority === 'high' ? 'bg-orange-500' :
                  incident.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }>
                  {formatString(incident.priority)}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <Badge variant="outline">
                  {formatString(incident.status)}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Created</h3>
                <p className="text-gray-600">{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {incident.reporter && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 flex items-center mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Reporter Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900">{incident.reporter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{incident.reporter.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Community</p>
                    <p className="text-gray-900">{incident.reporter.community || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t">
              {incident.reporter?.phone && (
                <Button
                  onClick={() => onCallReporter(incident.reporter.phone)}
                  className="flex-1"
                  variant="outline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Reporter
                </Button>
              )}
              {incident.status !== 'investigating' && (
                <Button
                  onClick={() => onUpdateStatus(incident.id, 'investigating')}
                  className="flex-1"
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
  
  // Forms
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Data state
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedToday: 0
  })
  const [error, setError] = useState(null)

  // Authentication check on mount
  useEffect(() => {
    const initializeApp = async () => {
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000))
      
      try {
        const token = localStorage.getItem('lilerp_responder_token')
        const savedResponder = localStorage.getItem('lilerp_responder_user')
        
        if (token && savedResponder) {
          // Verify token is still valid
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = JSON.parse(savedResponder)
            if (userData.isResponder) {
              setResponder(userData)
              setIsAuthenticated(true)
              await fetchIncidents(token)
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
        } else {
          await minSplashTime
          setCurrentScreen('login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        await minSplashTime
        setCurrentScreen('login')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp()
  }, [])

  // Fetch incidents when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents()
    }
  }, [isAuthenticated])

  // Fetch incidents from server
  const fetchIncidents = async (token = null) => {
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
        
        // Calculate stats from incidents if not provided by API
        const incidentsData = data.incidents || []
        const pending = incidentsData.filter(i => i.status === 'pending').length
        const investigating = incidentsData.filter(i => i.status === 'investigating').length
        const today = new Date().toDateString()
        const resolvedToday = incidentsData.filter(i => 
          i.status === 'resolved' && new Date(i.updatedAt).toDateString() === today
        ).length

        setStats({
          totalReports: incidentsData.length,
          pendingReports: data.stats?.pending || pending,
          inProgressReports: data.stats?.investigating || investigating,
          resolvedToday: data.stats?.resolvedToday || resolvedToday
        })
        
        setError(null)
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await refreshToken()
        if (newToken) {
          await fetchIncidents(newToken)
        } else {
          setIsAuthenticated(false)
          setError('Session expired. Please login again.')
        }
      } else {
        setError('Failed to fetch incidents')
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load dashboard')
      toast.error('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('lilerp_responder_refreshToken')
      if (!refreshToken) {
        handleLogout()
        return null
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('lilerp_responder_token', data.token)
        localStorage.setItem('lilerp_responder_refreshToken', data.refreshToken)
        return data.token
      } else {
        handleLogout()
        return null
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      handleLogout()
      return null
    }
  }

  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })
      
      const data = await response.json()
      
      if (response.ok && data.user) {
        if (data.user.isResponder) {
          localStorage.setItem('lilerp_responder_token', data.token)
          localStorage.setItem('lilerp_responder_refreshToken', data.refreshToken)
          localStorage.setItem('lilerp_responder_user', JSON.stringify(data.user))
          setResponder(data.user)
          setIsAuthenticated(true)
          setCurrentScreen('dashboard')
          
          await fetchIncidents(data.token)
          toast.success('Login successful!')
        } else {
          toast.error('This account is not authorized as a responder')
        }
      } else {
        toast.error(data.message || 'Login failed')
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lilerp_responder_token')
    localStorage.removeItem('lilerp_responder_refreshToken')
    localStorage.removeItem('lilerp_responder_user')
    setIsAuthenticated(false)
    setResponder(null)
    setIncidents([])
    setCurrentScreen('login')
    toast.info('Logged out successfully')
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
        toast.success(`Status updated to ${formatString(newStatus)}!`)
        fetchIncidents()
        setSelectedIncident(null)
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCallReporter = (phoneNumber) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self')
    } else {
      toast.warning('Phone number not available')
    }
  }

  // Filter incidents based on status and search
  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      (incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Shield className="w-24 h-24 text-white mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-2">LILERP</h1>
            <p className="text-blue-100 text-lg">Responder Dashboard</p>
            <p className="text-blue-100">Emergency Response System</p>
          </div>
          <Loader className="w-8 h-8 text-white animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
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
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader className="w-4 h-4 mr-2 animate-spin" /> Logging in...</>
                ) : (
                  <><LogIn className="w-4 h-4 mr-2" /> Login</>
                )}
              </Button>
              
              <div className="text-center">
                <a
                  href="/"
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back to main app
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
        <Toaster richColors position="top-center" />
      </div>
    )
  }

  // Main Dashboard
  return (
    <SidebarProvider>
      <Sidebar className="bg-blue-800 text-white p-0 [&>div]:border-r-0">
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-3 p-2">
            <Shield className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">LILERP</h1>
              <p className="text-xs text-blue-200">Responder</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setCurrentScreen('dashboard');
                  setActiveTab('overview');
                }}
                isActive={currentScreen === 'dashboard'}
                className="hover:bg-blue-700 data-[active=true]:bg-blue-900"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCurrentScreen('reports')}
                isActive={currentScreen === 'reports'}
                className="hover:bg-blue-700 data-[active=true]:bg-blue-900"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Reports</span>
                {stats.pendingReports > 0 && (
                  <SidebarMenuBadge className="bg-red-500 text-white">{stats.pendingReports}</SidebarMenuBadge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCurrentScreen('profile')}
                isActive={currentScreen === 'profile'}
                className="hover:bg-blue-700 data-[active=true]:bg-blue-900"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="hover:bg-blue-700">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
      <Toaster richColors position="top-center" />
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">LILERP Responder</h1>
                  <p className="text-xs text-blue-100">Emergency Response Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-100">Welcome, {responder?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          {/* ... (main content remains the same) ... */}
        </main>

        {/* Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-50">
          {/* ... (bottom nav remains the same) ... */}
        </nav>

        {/* Incident Details Modal */}
        <IncidentDetailsModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateStatus={handleUpdateStatus}
          onCallReporter={handleCallReporter}
        />
      </div>
    </SidebarProvider>
  )
}

export default ResponderDashboard