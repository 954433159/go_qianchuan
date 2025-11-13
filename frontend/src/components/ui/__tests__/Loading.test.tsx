import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Loading, { Spinner } from '../Loading'

describe('Loading', () => {
  it('renders loading spinner', () => {
    const { container } = render(<Loading />)
    
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders loading with text', () => {
    render(<Loading text="Loading data..." />)
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders loading with different sizes', () => {
    const { container: containerSm } = render(<Loading size="sm" />)
    const { container: containerLg } = render(<Loading size="lg" />)
    
    const spinnerSm = containerSm.querySelector('.h-4')
    const spinnerLg = containerLg.querySelector('.h-12')
    
    expect(spinnerSm).toBeInTheDocument()
    expect(spinnerLg).toBeInTheDocument()
  })

  it('renders fullscreen loading', () => {
    const { container } = render(<Loading fullScreen />)
    
    const fullScreenElement = container.querySelector('.fixed.inset-0')
    expect(fullScreenElement).toBeInTheDocument()
  })

  it('renders fullscreen loading with backdrop', () => {
    const { container } = render(<Loading fullScreen />)
    
    const backdrop = container.querySelector('.backdrop-blur-sm')
    expect(backdrop).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-class" />)
    
    const loadingContainer = container.querySelector('.custom-class')
    expect(loadingContainer).toBeInTheDocument()
  })
})

describe('Spinner', () => {
  it('renders spinner component', () => {
    const { container } = render(<Spinner />)
    
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders spinner with custom size', () => {
    const { container } = render(<Spinner size="lg" />)
    
    const spinner = container.querySelector('.h-12')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom className to spinner', () => {
    const { container } = render(<Spinner className="custom-spinner" />)
    
    const spinner = container.querySelector('.custom-spinner')
    expect(spinner).toBeInTheDocument()
  })
})
