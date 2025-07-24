import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronLeft, ChevronRight, Home, Users, Sword, Map, Settings, HelpCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'

/**
 * Responsive Layout Components
 */

// Mobile-friendly navigation
interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: string | number
}

const getNavigationItems = (showHomeTab: boolean): NavigationItem[] => {
  const items: NavigationItem[] = [];
  
  // Only add Home tab if enabled in settings
  if (showHomeTab) {
    items.push({
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      path: '/'
    });
  }
  
  // Add other navigation items
  items.push(
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: <Users className="h-5 w-5" />,
      path: '/recruitment'
    },
    {
      id: 'units',
      label: 'Units',
      icon: <Users className="h-5 w-5" />,
      path: '/units'
    },
    {
      id: 'squads',
      label: 'Squads',
      icon: <Users className="h-5 w-5" />,
      path: '/squads'
    },
    {
      id: 'battle',
      label: 'Battle',
      icon: <Sword className="h-5 w-5" />,
      path: '/battle'
    },
    {
      id: 'overworld',
      label: 'Overworld',
      icon: <Map className="h-5 w-5" />,
      path: '/overworld'
    },
    {
      id: 'campaign',
      label: 'Campaign',
      icon: <Map className="h-5 w-5" />,
      path: '/campaign'
    }
  );
  
  return items;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode
  showTutorial?: boolean
}

export function ResponsiveLayout({ children, showTutorial = false }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const { settingsState } = useSettings()
  
  // Get navigation items based on settings
  const navigationItems = getNavigationItems(settingsState.settings.showHomeTab)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={`
          bg-slate-800 border-r border-slate-700 transition-all duration-300
          ${isSidebarCollapsed ? 'w-16' : 'w-64'}
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <h1 className="text-xl font-bold text-white">Grand Opus</h1>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <nav className="mt-8">
            {navigationItems.map(item => (
              <NavigationLink
                key={item.id}
                item={item}
                isCollapsed={isSidebarCollapsed}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <HelpCircle className="h-5 w-5" />
                {!isSidebarCollapsed && <span>Help</span>}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-white">Grand Opus</h1>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-16 left-0 right-0 bg-slate-800 border-b border-slate-700 shadow-xl">
            <nav className="p-4 space-y-2">
              {navigationItems.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors
                    ${location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`
        flex-1 overflow-auto
        ${isMobile ? 'pt-16' : ''}
      `}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

// Navigation Link Component
function NavigationLink({ 
  item, 
  isCollapsed, 
  isActive 
}: { 
  item: NavigationItem
  isCollapsed: boolean
  isActive: boolean 
}) {
  return (
    <Link
      to={item.path}
      className={`
        flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors
        ${isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
        }
      `}
      title={isCollapsed ? item.label : undefined}
    >
      {item.icon}
      {!isCollapsed && (
        <>
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

// Responsive Grid System
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = ''
}: ResponsiveGridProps) {
  const gridClasses = `
    grid gap-${gap}
    ${cols.sm ? `grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
    ${className}
  `

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Responsive Card Container
interface ResponsiveCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function ResponsiveCard({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '',
  padding = 'md'
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  }

  return (
    <div className={`bg-slate-800 border border-slate-600 rounded-lg ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`border-b border-slate-600 ${paddingClasses[padding]}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && (
                <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  )
}

// Responsive Button Group
interface ResponsiveButtonGroupProps {
  buttons: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
  }>
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

export function ResponsiveButtonGroup({ 
  buttons, 
  orientation = 'horizontal',
  size = 'md'
}: ResponsiveButtonGroupProps) {
  const containerClasses = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-2' 
    : 'flex flex-col space-y-2'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <div className={containerClasses}>
      {buttons.map(button => (
        <button
          key={button.id}
          onClick={button.onClick}
          disabled={button.disabled}
          className={`
            flex items-center space-x-2 rounded-lg font-medium transition-colors
            ${sizeClasses[size]}
            ${button.variant === 'primary' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800'
              : button.variant === 'secondary'
              ? 'bg-slate-600 hover:bg-slate-700 text-white disabled:bg-slate-700'
              : 'border border-slate-600 hover:bg-slate-700 text-slate-300 disabled:text-slate-500'
            }
            disabled:cursor-not-allowed disabled:opacity-50
          `}
        >
          {button.icon}
          <span className={orientation === 'horizontal' ? 'hidden sm:inline' : ''}>
            {button.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// Breakpoint Hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('sm')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else setBreakpoint('sm')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}