import React from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Enhanced Loading States and Skeleton Components
 */

// Full Page Loading
interface FullPageLoadingProps {
  message?: string
  progress?: number
}

export function FullPageLoading({ message = 'Loading...', progress }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          {progress !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Grand Opus</h2>
          <p className="text-slate-400">{message}</p>
        </div>

        {progress !== undefined && (
          <div className="w-64 bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded"></div>
          <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-slate-700 rounded w-20"></div>
          <div className="h-8 bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

// Unit Card Skeleton
export function UnitCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="w-16 h-8 bg-slate-700 rounded"></div>
      </div>
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-600 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-600">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-3 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="text-slate-500 mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Error State Component
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  showIcon?: boolean
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  showIcon = true 
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      {showIcon && (
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      )}
      <h3 className="text-lg font-medium text-red-400 mb-2">{title}</h3>
      <p className="text-red-300 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-outline border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Success State Component
interface SuccessStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
  return (
    <div className="text-center py-12">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-green-400 mb-2">{title}</h3>
      <p className="text-green-300 mb-6 max-w-md mx-auto">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary bg-green-600 hover:bg-green-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Loading Overlay
interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 text-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}