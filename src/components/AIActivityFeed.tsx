import React, { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { 
  Brain, 
  Move, 
  Hammer, 
  Swords, 
  Flag, 
  Shield,
  Clock,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AIActivity {
  id: string
  faction: string
  type: 'movement' | 'building' | 'attack' | 'expansion' | 'defense'
  message: string
  location?: { q: number; r: number }
  timestamp: number
  severity: 'low' | 'medium' | 'high'
}

export function AIActivityFeed() {
  const { overworldManager } = useGameStore()
  const [activities, setActivities] = useState<AIActivity[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [maxActivities] = useState(10)

  // Simulate AI activity monitoring (in a real implementation, this would come from the AI system)
  useEffect(() => {
    if (!overworldManager?.aiIntegration) return

    // Listen for AI actions (this would be integrated with the actual AI system)
    const interval = setInterval(() => {
      // Check for new AI activities
      checkForAIActivities()
    }, 3000)

    return () => clearInterval(interval)
  }, [overworldManager])

  const checkForAIActivities = () => {
    if (!overworldManager?.aiIntegration) return

    // In a real implementation, this would get actual AI activities
    // For now, we'll simulate some activities for demonstration
    const simulatedActivities = [
      {
        type: 'movement' as const,
        message: 'Enemy army spotted moving toward player territory',
        severity: 'high' as const,
        location: { q: 8, r: 6 }
      },
      {
        type: 'building' as const,
        message: 'Enemy constructed a new outpost',
        severity: 'medium' as const,
        location: { q: 12, r: 10 }
      },
      {
        type: 'expansion' as const,
        message: 'Enemy claimed neutral territory',
        severity: 'medium' as const,
        location: { q: 15, r: 8 }
      }
    ]

    // Randomly add activities (for demonstration)
    if (Math.random() < 0.3 && activities.length < maxActivities) {
      const activity = simulatedActivities[Math.floor(Math.random() * simulatedActivities.length)]
      addActivity(activity.type, activity.message, activity.severity, activity.location)
    }
  }

  const addActivity = (
    type: AIActivity['type'],
    message: string,
    severity: AIActivity['severity'],
    location?: { q: number; r: number }
  ) => {
    const newActivity: AIActivity = {
      id: `activity_${Date.now()}_${Math.random()}`,
      faction: 'enemy',
      type,
      message,
      location,
      timestamp: Date.now(),
      severity
    }

    setActivities(prev => [newActivity, ...prev.slice(0, maxActivities - 1)])
  }

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id))
  }

  const clearAllActivities = () => {
    setActivities([])
  }

  const getActivityIcon = (type: AIActivity['type']) => {
    switch (type) {
      case 'movement': return <Move className="w-4 h-4" />
      case 'building': return <Hammer className="w-4 h-4" />
      case 'attack': return <Swords className="w-4 h-4" />
      case 'expansion': return <Flag className="w-4 h-4" />
      case 'defense': return <Shield className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: AIActivity['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      case 'high': return 'text-red-400 bg-red-900/20 border-red-500/30'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return `${seconds}s ago`
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="w-5 h-5" />
          <span className="text-sm">No AI activity detected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">AI Activity</span>
          <span className="text-slate-400 text-sm">({activities.length})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearAllActivities}
            className="text-slate-400 hover:text-white transition-colors"
            title="Clear all activities"
          >
            <X className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Activity List */}
      {isExpanded && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map(activity => (
            <div
              key={activity.id}
              className={`border rounded-lg p-3 ${getSeverityColor(activity.severity)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {activity.message}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                      
                      {activity.location && (
                        <div>
                          ({activity.location.q}, {activity.location.r})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeActivity(activity.id)}
                  className="text-current opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary when collapsed */}
      {!isExpanded && activities.length > 0 && (
        <div className="text-sm text-slate-400">
          Latest: {activities[0].message}
        </div>
      )}
    </div>
  )
}

/**
 * AI Activity Indicator - Shows a small indicator when AI is active
 */
export function AIActivityIndicator() {
  const { overworldManager } = useGameStore()
  const [isAIActive, setIsAIActive] = useState(false)

  useEffect(() => {
    if (!overworldManager?.aiIntegration) return

    // Monitor AI activity
    const interval = setInterval(() => {
      // In a real implementation, this would check if AI is currently processing
      // For now, we'll simulate AI activity periods
      setIsAIActive(Math.random() < 0.3)
    }, 2000)

    return () => clearInterval(interval)
  }, [overworldManager])

  if (!isAIActive) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-purple-900/90 text-purple-200 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">AI Processing...</span>
      </div>
    </div>
  )
}

/**
 * Hook for managing AI activity notifications
 */
export function useAIActivityNotifications() {
  const [notifications, setNotifications] = useState<AIActivity[]>([])

  const addNotification = (
    type: AIActivity['type'],
    message: string,
    severity: AIActivity['severity'],
    location?: { q: number; r: number }
  ) => {
    const notification: AIActivity = {
      id: `notification_${Date.now()}_${Math.random()}`,
      faction: 'enemy',
      type,
      message,
      location,
      timestamp: Date.now(),
      severity
    }

    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only 5 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}