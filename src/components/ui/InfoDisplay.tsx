import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Info, HelpCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Enhanced Information Display Components
 */

// Tooltip System
interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  maxWidth?: string
  disabled?: boolean
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 500,
  maxWidth = '300px',
  disabled = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()
        
        let top = 0
        let left = 0

        switch (position) {
          case 'top':
            top = triggerRect.top - tooltipRect.height - 8
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
            break
          case 'bottom':
            top = triggerRect.bottom + 8
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
            break
          case 'left':
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
            left = triggerRect.left - tooltipRect.width - 8
            break
          case 'right':
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
            left = triggerRect.right + 8
            break
        }

        // Keep tooltip within viewport
        const padding = 8
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))

        setTooltipPosition({ top, left })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 text-sm text-white animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth
          }}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-800 border-slate-600 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r' :
              'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l'
            }`}
          />
        </div>,
        document.body
      )}
    </>
  )
}

// Stat Display with Tooltips
interface StatDisplayProps {
  label: string
  value: number | string
  maxValue?: number
  icon?: React.ReactNode
  tooltip?: string
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  showBar?: boolean
}

export function StatDisplay({ 
  label, 
  value, 
  maxValue,
  icon, 
  tooltip, 
  color = 'default',
  size = 'md',
  showBar = false
}: StatDisplayProps) {
  const colorClasses = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400'
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const content = (
    <div className="flex items-center space-x-2">
      {icon && <div className="text-slate-400">{icon}</div>}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
          <span className={`font-bold ${colorClasses[color]} ${sizeClasses[size]}`}>
            {typeof value === 'number' && maxValue ? `${value}/${maxValue}` : value}
          </span>
        </div>
        
        {showBar && typeof value === 'number' && maxValue && (
          <div className="mt-1">
            <div className="w-full bg-slate-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  color === 'green' ? 'bg-green-500' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'blue' ? 'bg-blue-500' :
                  color === 'yellow' ? 'bg-yellow-500' :
                  'bg-slate-400'
                }`}
                style={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        {content}
      </Tooltip>
    )
  }

  return content
}

// Collapsible Info Panel
interface InfoPanelProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
  badge?: string | number
}

export function InfoPanel({ title, children, defaultOpen = false, icon, badge }: InfoPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon && <div className="text-slate-400">{icon}</div>}
          <span className="text-white font-medium">{title}</span>
          {badge && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-600">
          {children}
        </div>
      )}
    </div>
  )
}

// Help Button with Modal
interface HelpButtonProps {
  title: string
  content: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function HelpButton({ title, content, size = 'sm' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-blue-400 transition-colors"
        title="Help"
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-600">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 text-slate-300">
              {content}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Quick Info Cards
interface QuickInfoProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
}

export function QuickInfo({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  trend,
  onClick 
}: QuickInfoProps) {
  const colorClasses = {
    blue: 'bg-blue-900/30 border-blue-500/30 text-blue-400',
    green: 'bg-green-900/30 border-green-500/30 text-green-400',
    red: 'bg-red-900/30 border-red-500/30 text-red-400',
    yellow: 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400',
    purple: 'bg-purple-900/30 border-purple-500/30 text-purple-400'
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '→'
  }

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${colorClasses[color]}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className="text-sm text-slate-400">
            {trendIcons[trend]}
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// Detailed Stats Table
interface StatsTableProps {
  stats: Array<{
    label: string
    value: string | number
    tooltip?: string
    color?: 'default' | 'green' | 'red' | 'blue' | 'yellow'
  }>
  title?: string
}

export function StatsTable({ stats, title }: StatsTableProps) {
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-slate-600">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}
      
      <div className="divide-y divide-slate-600">
        {stats.map((stat, index) => (
          <div key={index} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">{stat.label}</span>
              {stat.tooltip && (
                <Tooltip content={stat.tooltip}>
                  <Info className="h-3 w-3 text-slate-500" />
                </Tooltip>
              )}
            </div>
            
            <span className={`font-medium ${
              stat.color === 'green' ? 'text-green-400' :
              stat.color === 'red' ? 'text-red-400' :
              stat.color === 'blue' ? 'text-blue-400' :
              stat.color === 'yellow' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}