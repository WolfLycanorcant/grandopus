import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft, X, Lightbulb, Target, Users, Sword } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * Tutorial System - Interactive onboarding for new players
 */

export interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'none'
  skipable?: boolean
  icon?: React.ReactNode
}

export interface TutorialSequence {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
  autoStart?: boolean
}

interface TutorialSystemProps {
  sequences: TutorialSequence[]
  onComplete?: (sequenceId: string) => void
  onSkip?: (sequenceId: string) => void
}

export function TutorialSystem({ sequences, onComplete, onSkip }: TutorialSystemProps) {
  const [activeSequence, setActiveSequence] = useState<TutorialSequence | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Auto-start tutorial if specified
  useEffect(() => {
    const autoStartSequence = sequences.find(seq => seq.autoStart)
    if (autoStartSequence && !localStorage.getItem(`tutorial_completed_${autoStartSequence.id}`)) {
      startTutorial(autoStartSequence.id)
    }
  }, [sequences])

  // Handle element highlighting
  useEffect(() => {
    if (activeSequence && isVisible) {
      const currentStep = activeSequence.steps[currentStepIndex]
      if (currentStep?.target) {
        const element = document.querySelector(currentStep.target)
        if (element) {
          setHighlightedElement(element)
          scrollToElement(element)
        }
      } else {
        setHighlightedElement(null)
      }
    } else {
      setHighlightedElement(null)
    }
  }, [activeSequence, currentStepIndex, isVisible])

  const startTutorial = (sequenceId: string) => {
    const sequence = sequences.find(seq => seq.id === sequenceId)
    if (sequence) {
      setActiveSequence(sequence)
      setCurrentStepIndex(0)
      setIsVisible(true)
    }
  }

  const nextStep = () => {
    if (!activeSequence) return

    if (currentStepIndex < activeSequence.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeTutorial()
    }
  }

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const completeTutorial = () => {
    if (activeSequence) {
      localStorage.setItem(`tutorial_completed_${activeSequence.id}`, 'true')
      onComplete?.(activeSequence.id)
      closeTutorial()
    }
  }

  const skipTutorial = () => {
    if (activeSequence) {
      onSkip?.(activeSequence.id)
      closeTutorial()
    }
  }

  const closeTutorial = () => {
    setIsVisible(false)
    setActiveSequence(null)
    setCurrentStepIndex(0)
    setHighlightedElement(null)
  }

  const scrollToElement = (element: Element) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  }

  const getTooltipPosition = (element: Element, position: string = 'bottom') => {
    const rect = element.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 200

    switch (position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - 10,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        }
      case 'bottom':
        return {
          top: rect.bottom + 10,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        }
      case 'left':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - 10
        }
      case 'right':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + 10
        }
      default:
        return {
          top: rect.bottom + 10,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2)
        }
    }
  }

  if (!isVisible || !activeSequence) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <TutorialLauncher sequences={sequences} onStart={startTutorial} />
      </div>
    )
  }

  const currentStep = activeSequence.steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / activeSequence.steps.length) * 100

  return createPortal(
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={closeTutorial}
      />

      {/* Element Highlight */}
      {highlightedElement && (
        <ElementHighlight element={highlightedElement} />
      )}

      {/* Tutorial Tooltip */}
      <div
        className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-w-sm"
        style={
          highlightedElement
            ? getTooltipPosition(highlightedElement, currentStep.position)
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600">
          <div className="flex items-center space-x-2">
            {currentStep.icon && (
              <div className="text-blue-400">
                {currentStep.icon}
              </div>
            )}
            <h3 className="text-lg font-semibold text-white">
              {currentStep.title}
            </h3>
          </div>
          <button
            onClick={closeTutorial}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {currentStep.content}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Step {currentStepIndex + 1} of {activeSequence.steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Hint */}
          {currentStep.action && currentStep.action !== 'none' && (
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-xs">
                {currentStep.action === 'click' && '👆 Click the highlighted element to continue'}
                {currentStep.action === 'hover' && '🖱️ Hover over the highlighted element'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-600">
          <div className="flex space-x-2">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            
            {currentStep.skipable !== false && (
              <button
                onClick={skipTutorial}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Skip Tutorial
              </button>
            )}
          </div>

          <button
            onClick={nextStep}
            className="btn-primary text-sm"
          >
            {currentStepIndex === activeSequence.steps.length - 1 ? (
              'Complete'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

/**
 * Element Highlight Component
 */
function ElementHighlight({ element }: { element: Element }) {
  const rect = element.getBoundingClientRect()

  return createPortal(
    <div
      className="fixed z-45 pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8
      }}
    >
      <div className="w-full h-full border-2 border-blue-400 rounded-lg shadow-lg animate-pulse bg-blue-400/10" />
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
    </div>,
    document.body
  )
}

/**
 * Tutorial Launcher Component
 */
function TutorialLauncher({ 
  sequences, 
  onStart 
}: { 
  sequences: TutorialSequence[]
  onStart: (sequenceId: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)

  const availableSequences = sequences.filter(seq => 
    !localStorage.getItem(`tutorial_completed_${seq.id}`)
  )

  if (availableSequences.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Tutorial & Help"
      >
        <Lightbulb className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-64">
          <div className="p-3 border-b border-slate-600">
            <h3 className="text-white font-medium">Available Tutorials</h3>
          </div>
          
          <div className="p-2">
            {availableSequences.map(sequence => (
              <button
                key={sequence.id}
                onClick={() => {
                  onStart(sequence.id)
                  setIsOpen(false)
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="text-white font-medium text-sm">{sequence.name}</div>
                <div className="text-slate-400 text-xs mt-1">{sequence.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Predefined Tutorial Sequences
 */
export const TUTORIAL_SEQUENCES: TutorialSequence[] = [
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Learn the basics of Grand Opus',
    autoStart: true,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Grand Opus!',
        content: 'Welcome to Grand Opus, a tactical war game where you command squads of diverse units in strategic battles. This tutorial will guide you through the basics.',
        icon: <Target className="h-5 w-5" />,
        skipable: true
      },
      {
        id: 'units_overview',
        title: 'Units System',
        content: 'Units are the core of your army. Each unit has stats like HP, STR, MAG, and SKL. Different races and archetypes provide unique bonuses and abilities.',
        target: '[data-tutorial="units-page"]',
        position: 'bottom',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: 'squads_overview',
        title: 'Squad Formation',
        content: 'Organize your units into squads with tactical formations. Front row units get armor bonuses, while back row units deal more ranged damage.',
        target: '[data-tutorial="squads-page"]',
        position: 'bottom',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: 'battles_overview',
        title: 'Battle System',
        content: 'Engage in turn-based tactical battles. Units act based on initiative, and formation positioning affects combat effectiveness.',
        target: '[data-tutorial="battle-page"]',
        position: 'bottom',
        icon: <Sword className="h-5 w-5" />
      }
    ]
  },
  {
    id: 'unit_creation',
    name: 'Creating Units',
    description: 'Learn how to create and customize units',
    steps: [
      {
        id: 'create_unit_button',
        title: 'Create Your First Unit',
        content: 'Click the "Create Unit" button to start building your army. You can choose from different races and archetypes.',
        target: '[data-tutorial="create-unit-button"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'race_selection',
        title: 'Choose a Race',
        content: 'Each race has unique traits. Humans are balanced, Elves excel at magic, Dwarves are tough, and Orcs are aggressive.',
        target: '[data-tutorial="race-select"]',
        position: 'right'
      },
      {
        id: 'archetype_selection',
        title: 'Select an Archetype',
        content: 'Archetypes determine your unit\'s role. Knights tank damage, Mages cast spells, Archers attack from range.',
        target: '[data-tutorial="archetype-select"]',
        position: 'right'
      }
    ]
  },
  {
    id: 'squad_formation',
    name: 'Squad Formation',
    description: 'Master tactical formations',
    steps: [
      {
        id: 'formation_grid',
        title: 'Formation Grid',
        content: 'Arrange your units in a 3x2 formation. Position matters for combat effectiveness and survival.',
        target: '[data-tutorial="formation-grid"]',
        position: 'right'
      },
      {
        id: 'front_row',
        title: 'Front Row Strategy',
        content: 'Place tanky units like Knights in the front row. They get +10% armor and +5% physical damage bonuses.',
        target: '[data-tutorial="front-row"]',
        position: 'bottom'
      },
      {
        id: 'back_row',
        title: 'Back Row Strategy',
        content: 'Position ranged units like Archers and Mages in the back row for +15% ranged damage and -10% physical damage taken.',
        target: '[data-tutorial="back-row"]',
        position: 'bottom'
      }
    ]
  }
]