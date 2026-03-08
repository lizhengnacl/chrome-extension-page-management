import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          padding: 32,
          textAlign: 'center',
          color: '#DC2626'
        }}>
          <h2 style={{ margin: '0 0 16px 0' }}>出现了一些问题</h2>
          <p style={{ margin: 0, color: '#6B7280' }}>
            请刷新页面重试。如果问题持续存在，请联系开发者。
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
