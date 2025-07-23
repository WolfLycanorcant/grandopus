import { GameException } from './GameExceptions';

/**
 * Error severity levels for logging and user notification
 */
export enum ErrorSeverity {
  LOW = 'low',           // Minor issues, game continues normally
  MEDIUM = 'medium',     // Noticeable issues, some features may be affected
  HIGH = 'high',         // Significant issues, major features affected
  CRITICAL = 'critical'  // Game-breaking issues, immediate attention required
}

/**
 * Error handling strategies
 */
export enum ErrorStrategy {
  LOG_ONLY = 'log_only',                    // Just log the error
  NOTIFY_USER = 'notify_user',              // Show user notification
  RETRY = 'retry',                          // Attempt to retry the operation
  FALLBACK = 'fallback',                    // Use fallback/default behavior
  HALT = 'halt'                             // Stop current operation
}

/**
 * Error handling configuration for different exception types
 */
interface ErrorHandlingConfig {
  severity: ErrorSeverity;
  strategy: ErrorStrategy;
  retryAttempts?: number;
  userMessage?: string;
  fallbackAction?: () => void;
}

/**
 * Central error handler for the game
 */
export class GameErrorHandler {
  private static instance: GameErrorHandler;
  private errorConfigs: Map<string, ErrorHandlingConfig> = new Map();
  private errorLog: GameException[] = [];
  private maxLogSize = 1000;

  private constructor() {
    this.initializeDefaultConfigs();
  }

  public static getInstance(): GameErrorHandler {
    if (!GameErrorHandler.instance) {
      GameErrorHandler.instance = new GameErrorHandler();
    }
    return GameErrorHandler.instance;
  }

  /**
   * Initialize default error handling configurations
   */
  private initializeDefaultConfigs(): void {
    // Squad System Errors
    this.errorConfigs.set('SQUAD_CAPACITY_EXCEEDED', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Squad is at maximum capacity. Remove a unit or increase leadership.'
    });

    this.errorConfigs.set('SQUAD_INVALID_FORMATION', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.FALLBACK,
      userMessage: 'Invalid formation. Units will be placed in default positions.',
      fallbackAction: () => this.resetToDefaultFormation()
    });

    this.errorConfigs.set('SQUAD_UNIT_NOT_FOUND', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Unit not found. The squad may have been modified.'
    });

    // Combat System Errors
    this.errorConfigs.set('COMBAT_INVALID_STATE', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.HALT,
      userMessage: 'Combat system error. Battle will be reset.'
    });

    this.errorConfigs.set('COMBAT_DAMAGE_CALCULATION_FAILED', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.FALLBACK,
      fallbackAction: () => this.useDefaultDamage()
    });

    // Equipment System Errors
    this.errorConfigs.set('EQUIPMENT_INCOMPATIBLE_EQUIPMENT', {
      severity: ErrorSeverity.LOW,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'This equipment cannot be used by the selected unit.'
    });

    this.errorConfigs.set('EQUIPMENT_INSUFFICIENT_EMBER_SLOTS', {
      severity: ErrorSeverity.LOW,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Not enough ember slots available on this weapon.'
    });

    // Resource System Errors
    this.errorConfigs.set('RESOURCE_INSUFFICIENT_RESOURCES', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Insufficient resources for this action.'
    });

    this.errorConfigs.set('RESOURCE_INVALID_PROMOTION', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Unit cannot be promoted. Check requirements.'
    });

    // Strategic Layer Errors
    this.errorConfigs.set('STRATEGIC_INVALID_TERRAIN_MOVEMENT', {
      severity: ErrorSeverity.LOW,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Cannot move through this terrain. Check unit requirements.'
    });

    this.errorConfigs.set('STRATEGIC_CONSTRUCTION_FAILED', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Building construction failed. Check location and resources.'
    });

    // Data & Persistence Errors
    this.errorConfigs.set('DATA_SAVE_FAILED', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.RETRY,
      retryAttempts: 3,
      userMessage: 'Failed to save game. Retrying...'
    });

    this.errorConfigs.set('DATA_LOAD_FAILED', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.NOTIFY_USER,
      userMessage: 'Failed to load save file. The file may be corrupted.'
    });

    this.errorConfigs.set('DATA_DATA_CORRUPTED', {
      severity: ErrorSeverity.CRITICAL,
      strategy: ErrorStrategy.HALT,
      userMessage: 'Save data is corrupted. Please load a different save file.'
    });

    // Graphics & Rendering Errors
    this.errorConfigs.set('RENDER_WEBGL_ERROR', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.FALLBACK,
      userMessage: 'Graphics error detected. Switching to fallback renderer.',
      fallbackAction: () => this.switchToCanvasRenderer()
    });

    this.errorConfigs.set('RENDER_TEXTURE_LOAD_FAILED', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.FALLBACK,
      fallbackAction: () => this.useDefaultTexture()
    });

    this.errorConfigs.set('RENDER_GPU_MEMORY_EXCEEDED', {
      severity: ErrorSeverity.HIGH,
      strategy: ErrorStrategy.FALLBACK,
      userMessage: 'GPU memory limit reached. Reducing graphics quality.',
      fallbackAction: () => this.reduceGraphicsQuality()
    });

    // Network Errors
    this.errorConfigs.set('NETWORK_API_REQUEST_FAILED', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.RETRY,
      retryAttempts: 3
    });

    this.errorConfigs.set('NETWORK_CONNECTION_TIMEOUT', {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.RETRY,
      retryAttempts: 2,
      userMessage: 'Connection timeout. Retrying...'
    });
  }

  /**
   * Handle a game exception
   */
  public handleError(error: GameException): void {
    // Add to error log
    this.addToErrorLog(error);

    // Get handling configuration
    const config = this.errorConfigs.get(error.code) || this.getDefaultConfig();

    // Log the error
    this.logError(error, config.severity);

    // Execute handling strategy
    this.executeStrategy(error, config);
  }

  /**
   * Handle non-game exceptions (unexpected errors)
   */
  public handleUnexpectedError(error: Error, context?: Record<string, any>): void {
    const gameError = new (class extends GameException {
      constructor() {
        super(error.message, 'UNEXPECTED_ERROR', context);
      }
    })();

    this.handleError(gameError);
  }

  /**
   * Add error to internal log
   */
  private addToErrorLog(error: GameException): void {
    this.errorLog.push(error);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Log error to console with appropriate level
   */
  private logError(error: GameException, severity: ErrorSeverity): void {
    const logData = {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack
    };

    switch (severity) {
      case ErrorSeverity.LOW:
        console.info('Game Info:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('Game Warning:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('Game Error:', logData);
        break;
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL Game Error:', logData);
        break;
    }
  }

  /**
   * Execute the configured error handling strategy
   */
  private executeStrategy(error: GameException, config: ErrorHandlingConfig): void {
    switch (config.strategy) {
      case ErrorStrategy.LOG_ONLY:
        // Already logged, nothing more to do
        break;

      case ErrorStrategy.NOTIFY_USER:
        this.notifyUser(config.userMessage || error.message, config.severity);
        break;

      case ErrorStrategy.RETRY:
        this.retryOperation(error, config.retryAttempts || 1);
        break;

      case ErrorStrategy.FALLBACK:
        if (config.fallbackAction) {
          config.fallbackAction();
        }
        if (config.userMessage) {
          this.notifyUser(config.userMessage, config.severity);
        }
        break;

      case ErrorStrategy.HALT:
        this.haltOperation(error, config.userMessage);
        break;
    }
  }

  /**
   * Get default configuration for unknown error codes
   */
  private getDefaultConfig(): ErrorHandlingConfig {
    return {
      severity: ErrorSeverity.MEDIUM,
      strategy: ErrorStrategy.LOG_ONLY
    };
  }

  /**
   * Notify user of error (implement based on your UI framework)
   */
  private notifyUser(message: string, severity: ErrorSeverity): void {
    // This would integrate with your notification system
    // For now, just console output
    console.log(`User Notification (${severity}): ${message}`);
    
    // Example integration points:
    // - Toast notifications
    // - Modal dialogs
    // - Status bar messages
    // - In-game notification system
  }

  /**
   * Retry operation (placeholder - implement based on operation type)
   */
  private retryOperation(error: GameException, attempts: number): void {
    console.log(`Retrying operation for error ${error.code}, attempts remaining: ${attempts}`);
    // Implementation would depend on the specific operation
  }

  /**
   * Halt current operation
   */
  private haltOperation(error: GameException, message?: string): void {
    console.error(`Operation halted due to error: ${error.code}`);
    if (message) {
      this.notifyUser(message, ErrorSeverity.CRITICAL);
    }
  }

  // Fallback action implementations
  private resetToDefaultFormation(): void {
    console.log('Resetting squad to default formation');
    // Implementation would reset squad formation
  }

  private useDefaultDamage(): void {
    console.log('Using default damage calculation');
    // Implementation would use fallback damage formula
  }

  private switchToCanvasRenderer(): void {
    console.log('Switching to Canvas renderer');
    // Implementation would switch rendering backend
  }

  private useDefaultTexture(): void {
    console.log('Using default texture');
    // Implementation would load fallback texture
  }

  private reduceGraphicsQuality(): void {
    console.log('Reducing graphics quality');
    // Implementation would lower graphics settings
  }

  /**
   * Get error log for debugging
   */
  public getErrorLog(): GameException[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errorLog.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });
    return stats;
  }
}