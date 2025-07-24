import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Info, Zap, Heart, Shield, Sword } from 'lucide-react'

/**
 * Visual Feedback Components - Enhanced user experience
 */

// Toast Notification System
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastManagerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  )
}

function ToastNotification({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto-remove after duration
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      handleRemove()
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50'
      case 'error':
        return 'bg-red-900/90 border-red-500/50'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50'
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColorClasses()}
        border rounded-lg shadow-lg backdrop-blur-sm max-w-sm
      `}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-slate-300 text-xs mt-1">{toast.message}</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        {toast.action && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <button
              onClick={() => {
                toast.action!.onClick()
                handleRemove()
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Floating Damage Numbers
export interface DamageNumber {
  id: string
  value: number
  type: 'damage' | 'heal' | 'critical' | 'miss'
  x: number
  y: number
}

interface FloatingNumbersProps {
  numbers: DamageNumber[]
  onComplete: (id: string) => void
}

export function FloatingNumbers({ numbers, onComplete }: FloatingNumbersProps) {
  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-40">
      {numbers.map(number => (
        <FloatingNumber
          key={number.id}
          number={number}
          onComplete={onComplete}
        />
      ))}
    </div>,
    document.body
  )
}

function FloatingNumber({ number, onComplete }: { number: DamageNumber; onComplete: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
    
    const timer = setTimeout(() => {
      onComplete(number.id)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const getStyles = () => {
    switch (number.type) {
      case 'damage':
        return 'text-red-400 text-lg font-bold'
      case 'heal':
        return 'text-green-400 text-lg font-bold'
      case 'critical':
        return 'text-yellow-400 text-xl font-bold animate-pulse'
      case 'miss':
        return 'text-slate-400 text-base font-medium'
    }
  }

  const getText = () => {
    switch (number.type) {
      case 'damage':
        return `-${number.value}`
      case 'heal':
        return `+${number.value}`
      case 'critical':
        return `CRIT! -${number.value}`
      case 'miss':
        return 'MISS'
    }
  }

  return (
    <div
      className={`
        absolute transform transition-all duration-2000 ease-out
        ${isVisible ? '-translate-y-16 opacity-0' : 'translate-y-0 opacity-100'}
        ${getStyles()}
        drop-shadow-lg
      `}
      style={{
        left: number.x,
        top: number.y
      }}
    >
      {getText()}
    </div>
  )
}

// Loading States
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'green'
  text?: string
}

export function LoadingSpinner({ size = 'md', color = 'blue', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    green: 'border-green-500'
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`
          animate-spin rounded-full border-2 border-transparent
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor'
        }}
      />
      {text && (
        <p className="text-slate-400 text-sm">{text}</p>
      )}
    </div>
  )
}

// Progress Indicators
interface ProgressBarProps {
  value: number
  max: number
  label?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = 'blue', 
  size = 'md',
  showPercentage = false,
  animated = false
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-slate-300 text-sm">{label}</span>}
          {showPercentage && (
            <span className="text-slate-400 text-xs">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-slate-700 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-300
            ${colorClasses[color]}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Status Indicators
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function StatusBadge({ status, size = 'md', showText = false }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const colorClasses = {
    online: 'bg-green-500',
    offline: 'bg-slate-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  }

  const textLabels = {
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    away: 'Away'
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`
          rounded-full animate-pulse
          ${sizeClasses[size]} ${colorClasses[status]}
        `}
      />
      {showText && (
        <span className="text-slate-400 text-sm">{textLabels[status]}</span>
      )}
    </div>
  )
}

// Stat Change Indicators
interface StatChangeProps {
  stat: string
  oldValue: number
  newValue: number
  icon?: React.ReactNode
}

export function StatChangeIndicator({ stat, oldValue, newValue, icon }: StatChangeProps) {
  const change = newValue - oldValue
  const isIncrease = change > 0
  const isDecrease = change < 0

  if (change === 0) return null

  return (
    <div className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
      ${isIncrease ? 'bg-green-900/30 border border-green-500/30' : ''}
      ${isDecrease ? 'bg-red-900/30 border border-red-500/30' : ''}
    `}>
      {icon && <div className="text-slate-400">{icon}</div>}
      
      <span className="text-slate-300">{stat}</span>
      
      <div className="flex items-center space-x-1">
        <span className="text-slate-400">{oldValue}</span>
        <span className="text-slate-500">→</span>
        <span className={isIncrease ? 'text-green-400' : 'text-red-400'}>
          {newValue}
        </span>
      </div>
      
      <span className={`
        font-medium
        ${isIncrease ? 'text-green-400' : 'text-red-400'}
      `}>
        {isIncrease ? '+' : ''}{change}
      </span>
    </div>
  )
}

// Battle Effect Icons
export const BattleEffectIcons = {
  damage: <Sword className="h-4 w-4" />,
  heal: <Heart className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  critical: <Zap className="h-4 w-4" />
}