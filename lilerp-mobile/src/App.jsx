import { useState, useEffect, useCallback, useRef } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { API_URL } from '@/lib/config'
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
  X,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  LogOut,
  Loader,
  StopCircle,
  Play,
  Pause,
  PhoneCall,
  ExternalLink
} from 'lucide-react'
import './App.css'

// Helper component for report type icons
const getReportTypeIcon = (type, className = "w-5 h-5") => {
  switch (type) {
    case 'boundary_dispute':
      return <MapPin className={`${className} text-red-500`} />;
    case 'mining_conflict':
      return <AlertTriangle className={`${className} text-yellow-500`} />;
    case 'inheritance_dispute':
      return <Users className={`${className} text-blue-500`} />;
    case 'illegal_occupation':
      return <Home className={`${className} text-purple-500`} />;
    default:
      return <FileText className={`${className} text-gray-500`} />;
  }
};

// Helper component for user avatar
const Avatar = ({ name }) => {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';
  return (
    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-md">
      {initials}
    </div>
  );
};

function App() {
  const navigate = useNavigate();

  // Core state
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  
  // Forms
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    community: ''
  })

  const [reportForm, setReportForm] = useState({
    type: '',
    urgency: 'low',
    location: '',
    description: '',
    voiceTranscription: '',
    audioBlob: null
  })
  
  const [reports, setReports] = useState([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedUser, setEditedUser] = useState({})

  // Speech recognition
  const [recognition, setRecognition] = useState(null)
  const recognitionRef = useRef(null)

  // Media recorder
  const {
    status: mediaStatus,
    startRecording: startMediaRecording,
    stopRecording: stopMediaRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/webm' }
  })

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setReportForm(prev => ({
            ...prev,
            voiceTranscription: prev.voiceTranscription + finalTranscript
          }))
        }
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
      }
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended')
      }
      
      setRecognition(recognitionInstance)
      recognitionRef.current = recognitionInstance
    } else {
      console.warn('Speech recognition not supported in this browser')
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Splash screen and authentication check
  useEffect(() => {
    const initializeApp = async () => {
      // Show splash screen for at least 2 seconds
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000))
      
      const token = localStorage.getItem('lilerp_token')
      const savedUser = localStorage.getItem('lilerp_user')
      
      if (token && savedUser) { // check for standardized user token
        try {
          // Verify token is still valid
          const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setIsAuthenticated(true)
            
            // Load saved reports from localStorage
            const savedReports = localStorage.getItem('reports')
            if (savedReports) {
              setReports(JSON.parse(savedReports))
            }
            
            // Fetch latest reports from server
            fetchReports(token)
            
            await minSplashTime
            setCurrentScreen('home')
          } else {
            // Token invalid, clear storage
            handleLogout() // Use the logout function to clear all relevant keys
            await minSplashTime
            setCurrentScreen('login')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // Auth failed, clear storage
          handleLogout()
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

  // Fetch reports from server

const fetchReports = useCallback(async (token) => {
  try {
    const authToken = token || localStorage.getItem('lilerp_token'); 
    
    if (!authToken) {
      console.log('No token available');
      return;
    }
    
    const response = await fetch(`${API_URL}/incidents`, {  // Changed from /incidents/user
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      const fetchedReports = Array.isArray(data) ? data : (data.incidents || data.reports || [])
      setReports(fetchedReports)
      localStorage.setItem('reports', JSON.stringify(fetchedReports))
    } else if (response.status === 401) {
      await refreshToken()
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    const savedReports = localStorage.getItem('reports')
    if (savedReports) {
      setReports(JSON.parse(savedReports))
    }
  }
}, [])

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('lilerp_refreshToken')
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
        localStorage.setItem('lilerp_token', data.token)
        localStorage.setItem('lilerp_refreshToken', data.refreshToken)
        return data.token
      } else {
        handleLogout()
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      handleLogout()
    }
  }

  // Recording timer
  useEffect(() => {
    let interval = null
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => {
          if (time >= 120) { // 2 minutes max
            handleStopRecording()
            return 0
          }
          return time + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Voice recording handlers
  const handleVoiceRecord = useCallback(() => {
    if (!isRecording) {
      clearBlobUrl()
      setReportForm(prev => ({ ...prev, voiceTranscription: '', audioBlob: null }))
      setIsRecording(true)
      startMediaRecording()
      
      if (recognition) {
        try {
          recognition.start()
        } catch (error) {
          console.error('Error starting speech recognition:', error)
        }
      }
    }
  }, [isRecording, clearBlobUrl, startMediaRecording, recognition])

  const handleStopRecording = useCallback(() => {
    setIsRecording(false)
    stopMediaRecording()
    
    if (recognition) {
      try {
        recognition.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
  }, [stopMediaRecording, recognition])

  // Save audio blob when recording completes
  useEffect(() => {
    if (mediaBlobUrl && !isRecording) {
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          setReportForm(prev => ({ ...prev, audioBlob: blob }))
        })
        .catch(error => console.error('Error converting audio:', error))
    }
  }, [mediaBlobUrl, isRecording])

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({
            latitude,
            longitude,
            accuracy: position.coords.accuracy
          })
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            setReportForm(prev => ({ ...prev, location: address }))
          } catch (error) {
            console.error('Geocoding error:', error)
            setReportForm(prev => ({ 
              ...prev, 
              location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
            }))
          }
          
          setLocationLoading(false)
        },
        (error) => {
          console.error('Location error:', error)
          alert('Unable to get your location. Please enter it manually.')
          setLocationLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
      setLocationLoading(false)
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
        localStorage.setItem('lilerp_token', data.token)
        localStorage.setItem('lilerp_refreshToken', data.refreshToken)
        localStorage.setItem('lilerp_user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        setCurrentScreen('home')
        
        // Fetch user's reports
        fetchReports(data.token)
        
        alert('Login successful!')
      } else {
        alert(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: registerForm.fullName,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          community: registerForm.community
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('lilerp_token', data.token)
        localStorage.setItem('lilerp_refreshToken', data.refreshToken)
        localStorage.setItem('lilerp_user', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        setCurrentScreen('home')
        alert('Registration successful!')
      } else {
        alert(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lilerp_token')
    localStorage.removeItem('lilerp_refreshToken')
    localStorage.removeItem('lilerp_user')
    localStorage.removeItem('reports')
    setUser(null)
    setIsAuthenticated(false)
    setCurrentScreen('login')
    setReports([])
  }

  // Find the handleSubmitReport function (around line 520) and update:

const handleSubmitReport = async (e) => {
  e.preventDefault()
  
  if (!reportForm.type || !reportForm.location || !reportForm.description) {
    alert('Please fill in all required fields')
    return
  }
  
  setIsLoading(true)
  
  try {
    const token = localStorage.getItem('lilerp_token'); 
    
    if (!token) {
      alert('Please login first');
      setCurrentScreen('login');
      return;
    }
    
    const formData = new FormData()
    
    formData.append('type', reportForm.type)
    formData.append('priority', reportForm.urgency)
    formData.append('title', reportForm.type)
    formData.append('description', reportForm.description)
    formData.append('location', JSON.stringify({
      address: reportForm.location,
      coordinates: currentLocation ? {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      } : null
    }))
    
    if (reportForm.voiceTranscription) {
      formData.append('voiceTranscription', reportForm.voiceTranscription)
    }
    
    if (reportForm.audioBlob) {
      formData.append('voiceRecording', reportForm.audioBlob, 'recording.webm')
    }
    
    const response = await fetch(`${API_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (response.ok) {
      alert('Report submitted successfully!')
      
      // Add to local reports
      const newReport = data.incident || data
      setReports(prev => {
        const updated = [newReport, ...prev]
        localStorage.setItem('reports', JSON.stringify(updated))
        return updated
      })
      
      // Reset form
      setReportForm({
        type: '',
        urgency: 'medium',
        location: '',
        description: '',
        voiceTranscription: '',
        audioBlob: null
      })
      clearBlobUrl()
      setCurrentLocation(null)
      setCurrentScreen('reports')
    } else {
      console.error('Submit error:', data);
      alert(data.error || data.message || 'Failed to submit report')
    }
  } catch (error) {
    console.error('Report submission error:', error)
    alert('Failed to submit report. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

  // Profile handlers
  const handleEditProfile = () => {
    setEditedUser({ ...user })
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditedUser({})
  }

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('lilerp_token')
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedUser)
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('lilerp_user', JSON.stringify(data.user))
        setIsEditingProfile(false)
        alert('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile')
    }
  }

  // Navigate to responder dashboard
  const handleNavigateToResponderDashboard = () => {
    navigate('/responder')
  }

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

// Add this function to handle emergency calls

const handleEmergencyCall = async () => {
  try {
    // Get token from correct localStorage key
    const token = localStorage.getItem('lilerp_token');
    
    if (!token) {
      alert('❌ Please login first to use emergency call feature.');
      return;
    }

    if (!user?.phone) {
      alert('❌ Phone number not found. Please update your profile.');
      return;
    }

    const response = await fetch(`${API_URL}/ivr/initiate-call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: user.phone
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('📞 Emergency call initiated! You will receive a call shortly.');
    } else {
      console.error('Call failed:', data);
      alert(`❌ Failed to initiate call: ${data.error || 'Please try again.'}`);
    }
  } catch (error) {
    console.error('Error initiating call:', error);
    alert(`❌ Error initiating call: ${error.message}`);
  }
};

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Shield className="w-24 h-24 text-white mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-2">LILERP</h1>
            <p className="text-green-100 text-lg">Liberia Integrated Land Registry</p>
            <p className="text-green-100">& Emergency Response Platform</p>
          </div>
          <Loader className="w-8 h-8 text-white animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Welcome to LILERP</CardTitle>
            <CardDescription>Login to report land disputes and emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
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
                <button
                  type="button"
                  onClick={() => setCurrentScreen('register')}
                  className="text-sm text-green-600 hover:underline"
                >
                  Don't have an account? Register
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Register Screen
  if (currentScreen === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join LILERP to report emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+231-XXX-XXX-XXX"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Community</label>
                <Input
                  type="text"
                  placeholder="Your community name"
                  value={registerForm.community}
                  onChange={(e) => setRegisterForm({ ...registerForm, community: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
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
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Register</>
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('login')}
                  className="text-sm text-green-600 hover:underline"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main App (Authenticated)
  return (
    <>
      <style>{`
        .screen-container {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">LILERP</h1>
                  <p className="text-xs text-green-100">Emergency Response</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className={`flex items-center space-x-2 hover:text-green-100 transition ${
                    currentScreen === 'home' ? 'text-white' : 'text-green-200'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('report')}
                  className={`flex items-center space-x-2 hover:text-green-100 transition ${
                    currentScreen === 'report' ? 'text-white' : 'text-green-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>Report</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('reports')}
                  className={`flex items-center space-x-2 hover:text-green-100 transition ${
                    currentScreen === 'reports' ? 'text-white' : 'text-green-200'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>My Reports</span>
                  {reports.length > 0 && (
                    <Badge className="bg-white text-green-600">{reports.length}</Badge>
                  )}
                </button>
                <button
                  onClick={() => setCurrentScreen('profile')}
                  className={`flex items-center space-x-2 hover:text-green-100 transition ${
                    currentScreen === 'profile' ? 'text-white' : 'text-green-200'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-green-200 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
              
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main key={currentScreen} className="container mx-auto px-4 py-8 pb-24 md:pb-8 screen-container">
          {/* Home Screen */}
          {currentScreen === 'home' && (
            <div className="space-y-6">
              {/* Hero Section with Gradient */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Welcome back, {user?.name?.split(' ')[0]}! 
                    </h2>
                    <p className="text-green-100 text-lg">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <Shield className="w-24 h-24 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Quick Stats with better visuals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Total Reports</p>
                        <p className="text-4xl font-bold text-green-600 mt-2">{reports.length}</p>
                        <p className="text-xs text-gray-400 mt-1">All time</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-full">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Pending</p>
                        <p className="text-4xl font-bold text-yellow-600 mt-2">
                          {reports.filter(r => r.status === 'pending').length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">In review</p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-full">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Resolved</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">
                          {reports.filter(r => r.status === 'resolved').length}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Completed</p>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-full">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>Choose how you'd like to report</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setCurrentScreen('report')}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute top-0 right-0 opacity-10">
                        <AlertTriangle className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <AlertTriangle className="w-8 h-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">Report Emergency</h3>
                        <p className="text-green-100 text-sm">Submit via app with voice & location</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setCurrentScreen('reports')}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute top-0 right-0 opacity-10">
                        <FileText className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <FileText className="w-8 h-8 mb-3" />
                        <h3 className="text-xl font-bold mb-2">My Reports</h3>
                        <p className="text-blue-100 text-sm">Track status & updates</p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleEmergencyCall}
                    className="bg-red-600 text-white p-6 rounded-2xl shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Phone className="w-8 h-8" />
                    <div className="text-left">
                      <div className="font-bold text-lg">Emergency Hotline (IVR)</div>
                      <div className="text-sm text-red-100">Immediate Response</div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Enhanced Recent Reports */}
              {reports.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <span>Recent Activity</span>
                        </CardTitle>
                        <CardDescription>Your latest emergency reports</CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{reports.length} total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reports.slice(0, 3).map((report, index) => (
                        <div
                          key={report.id}
                          className="group relative flex items-start space-x-4 p-4 border-2 border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`p-3 rounded-xl ${
                            report.status === 'resolved' ? 'bg-green-100' :
                            report.status === 'in_progress' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {getReportTypeIcon(report.type, "w-6 h-6")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-gray-800 capitalize group-hover:text-green-600 transition-colors">
                                {(report.type || report.title).replace(/_/g, ' ')}
                              </h4>
                              <Badge
                                className={`capitalize ml-2 ${
                                  report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {report.status.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {report.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {(report.location?.address || report.location).substring(0, 30)}...
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(report.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {reports.length > 3 && (
                      <Button
                        onClick={() => setCurrentScreen('reports')}
                        variant="outline"
                        className="w-full mt-4 border-2 hover:bg-green-50 hover:border-green-200"
                      >
                        View all {reports.length} reports
                        <FileText className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Help Section */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Need Help?</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Our team is here 24/7 to assist with land disputes and emergencies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-100 text-purple-700">Live Support</Badge>
                        <Badge className="bg-purple-100 text-purple-700">Fast Response</Badge>
                        <Badge className="bg-purple-100 text-purple-700">Expert Team</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Report Screen */}
          {currentScreen === 'report' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <span>Report Emergency</span>
                  </CardTitle>
                  <CardDescription>
                    Provide details about the land dispute or emergency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReport} className="space-y-8">
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">1. Emergency Details</h3>
                      {/* Emergency Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Emergency Type *
                        </label>
                        <Select
                          value={reportForm.type}
                          onValueChange={(value) => setReportForm({ ...reportForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select emergency type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boundary_dispute">Land Boundary Dispute</SelectItem>
                            <SelectItem value="mining_conflict">Mining Conflict</SelectItem>
                            <SelectItem value="inheritance_dispute">Inheritance Dispute</SelectItem>
                            <SelectItem value="illegal_occupation">Illegal Land Occupation</SelectItem>
                            <SelectItem value="other">Other Land Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Urgency Level */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Urgency Level *
                        </label>
                        <Select
                          value={reportForm.urgency}
                          onValueChange={(value) => setReportForm({ ...reportForm, urgency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Can wait</SelectItem>
                            <SelectItem value="medium">Medium - Important</SelectItem>
                            <SelectItem value="high">High - Urgent</SelectItem>
                            <SelectItem value="critical">Critical - Immediate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">2. Location</h3>
                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location *
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            placeholder="Enter location or use GPS"
                            value={reportForm.location}
                            onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                            className="flex-1"
                            required
                          />
                          <Button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            variant="outline"
                          >
                            {locationLoading ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Navigation className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {currentLocation && (
                          <p className="text-xs text-gray-600 mt-1">
                            Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">3. Description & Voice Report</h3>
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description *
                        </label>
                        <Textarea
                          placeholder="Describe the emergency in detail..."
                          value={reportForm.description}
                          onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>

                      {/* Voice Recording */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Voice Recording (Optional)
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {!isRecording ? (
                              <Button
                                type="button"
                                onClick={handleVoiceRecord}
                                variant="outline"
                                className="flex-1"
                              >
                                <Mic className="w-4 h-4 mr-2" />
                                Start Recording
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={handleStopRecording}
                                variant="destructive"
                                className="flex-1"
                              >
                                <StopCircle className="w-4 h-4 mr-2" />
                                Stop Recording ({formatTime(recordingTime)})
                              </Button>
                            )}
                          </div>

                          {mediaBlobUrl && (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm font-medium mb-2">Recording Preview:</p>
                              <audio src={mediaBlobUrl} controls className="w-full" />
                            </div>
                          )}

                          {reportForm.voiceTranscription && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium mb-2 text-blue-800">Transcription:</p>
                              <p className="text-sm text-gray-700 italic">"{reportForm.voiceTranscription}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Submit Report</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Screen */}
          {currentScreen === 'reports' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">My Reports</h2>
                <p className="text-gray-600">Track the status of your emergency reports</p>
              </div>

              {reports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't submitted any reports yet</p>
                    <Button onClick={() => setCurrentScreen('report')}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Emergency
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <Card key={report.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="flex flex-row items-start bg-gray-50/50 space-x-4 p-4 border-b">
                        <div className="bg-green-100 text-green-700 p-3 rounded-full mt-1">
                          {getReportTypeIcon(report.type, "w-6 h-6")}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg capitalize text-gray-800">
                              {(report.type || report.title).replace(/_/g, ' ')}
                            </h3>
                            <Badge
                              variant={
                                report.status === 'resolved' ? 'success' :
                                report.status === 'in_progress' ? 'warning' :
                                'default'
                              }
                              className="capitalize"
                            >
                              {report.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1.5" />
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <p className="text-sm text-gray-700">{report.description}</p>
                        <div className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span>{report.location?.address || report.location}</span>
                        </div>

                        {report.voiceRecording && (
                          <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-2 text-gray-700">Voice Recording:</p>
                            <audio 
                              src={`${API_URL}${report.voiceRecording}`} 
                              controls 
                              className="w-full"
                            />
                          </div>
                        )}

                        {report.voiceTranscription && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium mb-2 text-blue-800">Transcription:</p>
                            <p className="text-sm text-blue-700 italic">"{report.voiceTranscription}"</p>
                          </div>
                        )}

                        {report.responderId && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Responder Assigned
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Screen */}
          {currentScreen === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-6 h-6" />
                    <span>Profile</span>
                  </CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isEditingProfile ? (
                    <div className="flex flex-col items-center text-center">
                      <Avatar name={user?.name} />
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <p className="text-gray-500">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-4">
                        {user?.role && <Badge>{user.role}</Badge>}
                        {user?.isResponder && <Badge variant="outline">Responder</Badge>}
                      </div>
                      
                      <div className="w-full text-left mt-8 space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <p className="font-medium">{user?.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Community</label>
                          <p className="font-medium">{user?.community}</p>
                        </div>
                      </div>

                      <div className="w-full space-y-2 pt-6 mt-6 border-t">
                        <Button onClick={handleEditProfile} className="w-full">
                          Edit Profile
                        </Button>
                        
                        {user?.isResponder && (
                          <Button
                            onClick={handleNavigateToResponderDashboard}
                            variant="outline"
                            className="w-full"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Go to Responder Dashboard
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name</label>
                          <Input
                            type="text"
                            value={editedUser.name || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <Input
                            type="tel"
                            value={editedUser.phone || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Community</label>
                          <Input
                            type="text"
                            value={editedUser.community || ''}
                            onChange={(e) => setEditedUser({ ...editedUser, community: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <Button onClick={handleSaveProfile} className="flex-1">
                          Save Changes
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 md:hidden">
          <div className="grid grid-cols-4">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`p-4 flex flex-col items-center justify-center hover:bg-gray-50 ${
                currentScreen === 'home' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs">Home</span>
            </button>

            <button
              onClick={() => setCurrentScreen('report')}
              className={`p-4 flex flex-col items-center justify-center hover:bg-gray-50 ${
                currentScreen === 'report' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <AlertTriangle className="w-6 h-6 mb-1" />
              <span className="text-xs">Report</span>
            </button>

            <button
              onClick={() => setCurrentScreen('reports')}
              className={`p-4 flex flex-col items-center justify-center hover:bg-gray-50 ${
                currentScreen === 'reports' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-xs">Reports</span>
              {reports.length > 0 && (
                <div className="absolute top-1 right-1 bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded">
                  {reports.length}
                </div>
              )}
            </button>

            <button
              onClick={() => setCurrentScreen('profile')}
              className={`p-4 flex flex-col items-center justify-center hover:bg-gray-50 ${
                currentScreen === 'profile' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}

export default App
