import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@/test/test-utils'
import ToastContainer, { toast, useToastStore } from '../Toast'

describe('Toast', () => {
  beforeEach(() => {
    // 清空toast状态
    useToastStore.setState({ toasts: [] })
  })

  it('renders toast container', () => {
    const { container } = render(<ToastContainer />)
    
    expect(container.querySelector('.fixed.top-4.right-4')).toBeInTheDocument()
  })

  it('displays success toast', async () => {
    render(<ToastContainer />)
    
    act(() => {
      toast.success('Success message')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })
  })

  it('displays error toast', async () => {
    render(<ToastContainer />)
    
    act(() => {
      toast.error('Error message')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  it('displays warning toast', async () => {
    render(<ToastContainer />)
    
    act(() => {
      toast.warning('Warning message')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })
  })

  it('displays info toast', async () => {
    render(<ToastContainer />)
    
    act(() => {
      toast.info('Info message')
    })
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })
  })

  it('auto removes toast after duration', async () => {
    vi.useFakeTimers()
    render(<ToastContainer />)
    
    act(() => {
      toast.success('Auto remove', 1000)
    })
    
    expect(screen.getByText('Auto remove')).toBeInTheDocument()
    
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    
    expect(screen.queryByText('Auto remove')).not.toBeInTheDocument()
    
    vi.useRealTimers()
  })

  it('displays multiple toasts', () => {
    render(<ToastContainer />)
    
    act(() => {
      toast.success('First message')
      toast.error('Second message')
    })
    
    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
  })

  it('has correct icon for each toast type', () => {
    const { container } = render(<ToastContainer />)
    
    act(() => {
      toast.success('Success')
    })
    
    // CheckCircle icon for success
    const successIcon = container.querySelector('.text-green-600')
    expect(successIcon).toBeInTheDocument()
  })
})
