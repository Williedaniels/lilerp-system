import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import IncidentMap from './incident-map.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'https://lilerp-backend.onrender.com/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const formatString = (str) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ResponderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('lilerp_responder_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        const [analyticsRes, incidentsRes] = await Promise.all([
          fetch(`${API_URL}/responders/analytics`, { headers }),
          fetch(`${API_URL}/responders/dashboard`, { headers })
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (incidentsRes.ok) {
          const data = await incidentsRes.json();
          setIncidents(data.incidents || []);
        }

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processIncidentsForMap = (incidents) => {
    const incidentsByLocation = incidents.reduce((acc, incident) => {
      if (incident.latitude && incident.longitude) {
        const key = `${incident.latitude.toFixed(4)},${incident.longitude.toFixed(4)}`;
        if (!acc[key]) {
          acc[key] = { latitude: incident.latitude, longitude: incident.longitude, reports: [] };
        }
        acc[key].reports.push(incident);
      }
      return acc;
    }, {});

    return Object.values(incidentsByLocation).map(group => ({
      ...group,
      count: group.reports.length,
      hoverText: group.reports.map(r => formatString(r.type || r.title)).join(' | '),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center p-8">No analytics data available</div>;
  }

  const mapPoints = processIncidentsForMap(incidents);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Incidents</div>
          <div className="text-3xl font-bold text-gray-900">{analytics.overview.totalIncidents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-3xl font-bold text-green-600">{analytics.overview.resolvedIncidents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Resolution Rate</div>
          <div className="text-3xl font-bold text-blue-600">{analytics.overview.resolutionRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-3xl font-bold text-purple-600">{analytics.overview.avgResponseTime}m</div>
        </div>
      </div>

      {/* Incident Distribution Map */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Incident Distribution Map</h3>
        <div className="h-96 w-full">
          {mapPoints.length > 0 ? (
            <IncidentMap incidents={mapPoints} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <p className="text-gray-500">No location data available for incidents.</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents by Status - Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Incidents by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.charts.incidentsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.charts.incidentsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.charts.incidentsByPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Type - Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Incidents by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.charts.incidentsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend - Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Incident Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.charts.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResponderAnalytics;