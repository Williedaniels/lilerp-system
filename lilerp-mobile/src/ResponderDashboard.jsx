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
  User
} from 'lucide-react'

const getAudioUrl = (path) => {
  if (!path) return '';
  // If it's a full URL (from Twilio), use it directly
  if (path.startsWith('http')) {
    return path;
  }
  // Otherwise, it's a local path, construct the full URL from API_URL
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

// Helper function to format strings like 'mining_conflict' to 'Mining Conflict'
const formatString = (str) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'analytics'
  const [selectedIncident, setSelectedIncident] = useState(null);
  
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

  // New state for incidents and error handling
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  // Splash screen and authentication check
  useEffect(() => {
    const initializeApp = async () => {
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000))
      
      const token = localStorage.getItem('lilerp_responder_token')
      const savedResponder = localStorage.getItem('lilerp_responder_user')
      
      if (token && savedResponder) { // Check for standard user token
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
              
              // Fetch incidents for dashboard
              fetchIncidents(token)
              
              await minSplashTime
              setCurrentScreen('dashboard')
            } else {
              // Not a responder, log them out of this dashboard
              handleLogout()
              await minSplashTime
              setCurrentScreen('login')
            }
          } else {
            // Invalid token
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
      fetchIncidents();
    }
  }, [isAuthenticated, responder]);

  // Fetch incidents from server
  const fetchIncidents = async (token) => {
    try {
      setIsLoading(true);
      const authToken = token || localStorage.getItem('lilerp_responder_token');
      
      if (!authToken) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`${API_URL}/responders/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data:', data);
        
        // Set all incidents from the response
        setIncidents(data.incidents || []);
        setEmergencyReports(data.incidents || []);
        
        // Set stats if available
        setStats({
          totalReports: data.stats?.totalReports || data.incidents?.length || 0,
          pendingReports: data.stats?.pending || 0,
          inProgressReports: data.stats?.investigating || 0,
          resolvedToday: data.stats?.resolvedToday || 0
        });
      } else if (response.status === 401 || response.status === 403) {
        setIsAuthenticated(false);
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('lilerp_responder_refreshToken')
      if (!refreshToken) {
        handleLogout()
        return
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
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      handleLogout()
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
          
          // Fetch incidents for dashboard
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
    setCurrentScreen('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('lilerp_responder_token');
    localStorage.removeItem('lilerp_responder_refreshToken');
    localStorage.removeItem('lilerp_responder_user');
    setIsAuthenticated(false);
    setResponder(null);
    setCurrentScreen('login');
  };

  // Report actions
  const handleAssignReport = async (reportId) => {
    try {
      const token = localStorage.getItem('lilerp_responder_token')
      const response = await fetch(`${API_URL}/incidents/${reportId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Report assigned successfully!')
        fetchIncidents()
      } else {
        toast.error('Failed to assign report')
      }
    } catch (error) {
      console.error('Error assigning report:', error)
      toast.error('Failed to assign report')
    }
  }

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

  const handleCallReporter = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`
    } else {
      toast.warning('Phone number not available')
    }
  }

  const handleViewOnMap = (location) => {
    if (location?.coordinates) {
      const { lat, lng } = location.coordinates
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
    } else {
      toast.warning('Location coordinates not available')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  // Filter reports
  const filteredReports = emergencyReports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
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
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">LILERP Responder</h1>
                <p className="text-xs text-blue-100">Emergency Response Dashboard</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`flex items-center space-x-2 hover:text-blue-100 transition ${
                  currentScreen === 'dashboard' ? 'text-white' : 'text-blue-200'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentScreen('reports')}
                className={`flex items-center space-x-2 hover:text-blue-100 transition ${
                  currentScreen === 'reports' ? 'text-white' : 'text-blue-200'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Reports</span>
                {stats.pendingReports > 0 && (
                  <Badge className="bg-red-500 text-white">{stats.pendingReports}</Badge>
                )}
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`flex items-center space-x-2 hover:text-blue-100 transition ${
                  currentScreen === 'profile' ? 'text-white' : 'text-blue-200'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-blue-200 hover:text-white transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Dashboard or Analytics content */}
        {currentScreen === 'dashboard' && (
          <div>
            {/* Tab Navigation - ONLY show on dashboard screen */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`${
                      activeTab === 'overview'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`${
                      activeTab === 'analytics'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Analytics
                  </button>
                </nav>
              </div>
            </div>

            {/* Conditional tab content */}
            {activeTab === 'overview' ? (
              <div>
                {/* Dashboard Screen */}
                {currentScreen === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome, {responder?.name}!
                      </h2>
                      <p className="text-gray-600">
                        Emergency Response Dashboard
                      </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Reports</p>
                              <p className="text-3xl font-bold text-blue-600">{stats.totalReports}</p>
                            </div>
                            <AlertTriangle className="w-12 h-12 text-blue-600 opacity-20" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Pending</p>
                              <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
                            </div>
                            <Clock className="w-12 h-12 text-red-600 opacity-20" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">In Progress</p>
                              <p className="text-3xl font-bold text-yellow-600">{stats.inProgressReports}</p>
                            </div>
                            <Activity className="w-12 h-12 text-yellow-600 opacity-20" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Resolved Today</p>
                              <p className="text-3xl font-bold text-green-600">{stats.resolvedToday}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={() => setCurrentScreen('reports')}
                          className="h-20 text-lg"
                        >
                          <AlertTriangle className="w-6 h-6 mr-2" />
                          View All Reports
                        </Button>
                        <Button
                          onClick={() => {
                            setFilterStatus('pending')
                            setCurrentScreen('reports')
                          }}
                          className="h-20 text-lg"
                          variant="outline"
                        >
                          <Clock className="w-6 h-6 mr-2" />
                          Pending Reports
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Recent Reports */}
                    {emergencyReports.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Emergency Reports</CardTitle>
                          <CardDescription>Latest reports requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {emergencyReports.slice(0, 5).map(report => (
                              <div
                                key={report.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                onClick={() => setSelectedIncident(report)}
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{formatString(report.type || report.title)}</p>
                                  <p className="text-sm text-gray-600">
                                    {report.location?.address || report.location}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(report.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={
                                      report.status === 'resolved' ? 'success' :
                                      report.status === 'in_progress' ? 'warning' :
                                      'default'
                                    }
                                  >
                                    {formatString(report.status)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {formatString(report.priority)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <ResponderAnalytics />
            )}
          </div>
        )}

        {/* Reports Screen - ADD THIS */}
        {currentScreen === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Emergency Reports</h2>
              <Badge variant="outline">{incidents.length} Total</Badge>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['all', 'pending', 'investigating', 'resolved'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="whitespace-nowrap"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'pending' && stats.pendingReports > 0 && (
                    <Badge className="ml-2 bg-red-500">{stats.pendingReports}</Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {incidents
                .filter(incident => filterStatus === 'all' || incident.status === filterStatus)
                .map((incident) => (
                  <Card
                    key={incident.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
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
                          
                          <h3 className="font-bold text-lg mb-1">{formatString(incident.title)}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {incident.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                                {incident.location?.address || incident.location || 'No location'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(incident.createdAt).toLocaleString()}
                            </div>
                            {incident.reporter && (
                                <div className="flex items-center" title={`Community: ${incident.reporter.community || 'N/A'}`}>
                                  <User className="w-4 h-4 mr-1" />
                                  {incident.reporter.name}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <AlertTriangle className={`w-6 h-6 ml-4 ${
                          incident.priority === 'critical' ? 'text-red-600' :
                          incident.priority === 'high' ? 'text-orange-500' :
                          'text-yellow-500'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {incidents.filter(incident => filterStatus === 'all' || incident.status === filterStatus).length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No {filterStatus === 'all' ? '' : filterStatus} reports found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Screen */}
        {currentScreen === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Responder Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {responder && (
                  <>
                    <div className="flex items-center space-x-4 pb-4 border-b">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {responder.name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{responder.name}</h3>
                        <p className="text-gray-600">{responder.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Phone</label>
                        <p className="text-gray-900">{responder.phone || 'Not provided'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700">Role</label>
                        <Badge className="mt-1">{responder.role || 'responder'}</Badge>
                      </div>
                    </div>

                    <Button 
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full mt-6"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation - MOVED OUTSIDE all conditionals */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-50">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => {
              setCurrentScreen('dashboard');
              setActiveTab('overview'); // Reset to overview when going to dashboard
            }}
            className={`flex flex-col items-center justify-center w-full transition-colors ${
              currentScreen === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentScreen('reports')}
            className={`flex flex-col items-center justify-center w-full transition-colors ${
              currentScreen === 'reports' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <div className="relative">
              <AlertTriangle className="w-6 h-6" />
              {stats.pendingReports > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingReports}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1">Reports</span>
          </button>
          
          <button
            onClick={handleProfileNavigation}
            className={`flex flex-col items-center justify-center w-full transition-colors ${
              currentScreen === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedIncident(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold">{formatString(selectedIncident.title)}</h2>
                  <p className="text-gray-600">ID: {selectedIncident.id}</p>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
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
                <IncidentMap
                  latitude={selectedIncident.latitude}
                  longitude={selectedIncident.longitude}
                  location={selectedIncident.location}
                  reporterName={selectedIncident.reporter?.name}
                />
                <p className="text-sm text-gray-600 mt-2">
                  📍 {selectedIncident.location || 'Location not specified'}
                </p>
              </div>

              {/* Rest of incident details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600">{selectedIncident.description}</p>
                </div>

                {/* Voice Recording & Transcription */}
                {selectedIncident.voiceRecording && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Voice Recording</h3>
                    <audio
                      src={getAudioUrl(selectedIncident.voiceRecording)}
                      controls
                      className="w-full"
                    />
                  </div>
                )}

                {selectedIncident.voiceTranscription && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Transcription
                    </h3>
                    <p className="text-gray-600 italic bg-gray-100 p-3 rounded-md">
                      "{selectedIncident.voiceTranscription}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Type</h3>
                    <p className="text-gray-600">{formatString(selectedIncident.type)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Priority</h3>
                    <Badge className={
                      selectedIncident.priority === 'high' ? 'bg-red-500' :
                      selectedIncident.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }>
                      {formatString(selectedIncident.priority)}
                    </Badge>
                  </div>
                </div>

                {selectedIncident.reporter && (
                  <div>
                    <h3 className="font-semibold text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Reporter Contact
                    </h3>
                    <p className="text-gray-600">Name: {selectedIncident.reporter.name}</p>
                    <p className="text-gray-600">Phone: {selectedIncident.reporter.phone}</p>
                    <p className="text-gray-600">Community: {selectedIncident.reporter.community || 'N/A'}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2 mt-6">
                  <Button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'investigating')}
                    className="flex-1"
                  >
                    Start Investigation
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponderDashboard
