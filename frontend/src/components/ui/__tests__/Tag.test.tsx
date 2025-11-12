import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/test-utils'
import Tag from '../Tag'

describe('Tag', () => {
  it('renders tag with label', () => {
    render(<Tag label="Test Tag" />)
    expect(screen.getByText('Test Tag')).toBeInTheDocument()
  })

  it('renders different variants', () => {
    const { rerender } = render(<Tag label="Default" variant="default" />)
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100')

    rerender(<Tag label="Success" variant="success" />)
    expect(screen.getByText('Success')).toHaveClass('bg-green-100')

    rerender(<Tag label="Warning" variant="warning" />)
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100')

    rerender(<Tag label="Error" variant="error" />)
    expect(screen.getByText('Error')).toHaveClass('bg-red-100')

    rerender(<Tag label="Info" variant="info" />)
    expect(screen.getByText('Info')).toHaveClass('bg-blue-100')
  })

  it('renders different sizes', () => {
    const { rerender } = render(<Tag label="Small" size="sm" />)
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs')

    rerender(<Tag label="Medium" size="md" />)
    expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-1', 'text-sm')

    rerender(<Tag label="Large" size="lg" />)
    expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1.5', 'text-base')
  })

  it('handles onClick event', () => {
    const handleClick = vi.fn()
    render(<Tag label="Clickable" onClick={handleClick} />)
    
    fireEvent.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows close button when closable', () => {
    render(<Tag label="Closable Tag" closable />)
    
    const closeButton = screen.getByText('Closable Tag').querySelector('svg')
    expect(closeButton).toBeInTheDocument()
  })

  it('handles onClose event', () => {
    const handleClose = vi.fn()
    render(<Tag label="Closable" closable onClose={handleClose} />)
    
    const closeIcon = screen.getByText('Closable').querySelector('svg')
    if (closeIcon) {
      fireEvent.click(closeIcon)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('applies selected state', () => {
    const { rerender } = render(<Tag label="Tag" selected={false} />)
    expect(screen.getByText('Tag')).not.toHaveClass('ring-2')

    rerender(<Tag label="Tag" selected={true} />)
    expect(screen.getByText('Tag')).toHaveClass('ring-2', 'ring-blue-500')
  })

  it('applies custom className', () => {
    render(<Tag label="Custom" className="custom-class" />)
    expect(screen.getByText('Custom')).toHaveClass('custom-class')
  })

  it('prevents close event propagation when clicking close icon', () => {
    const handleClick = vi.fn()
    const handleClose = vi.fn()
    
    render(
      <Tag 
        label="Tag" 
        closable 
        onClick={handleClick} 
        onClose={handleClose} 
      />
    )
    
    const closeIcon = screen.getByText('Tag').querySelector('svg')
    if (closeIcon) {
      fireEvent.click(closeIcon)
      expect(handleClose).toHaveBeenCalledTimes(1)
      expect(handleClick).not.toHaveBeenCalled()
    }
  })
})
