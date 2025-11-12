import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import Input from '../Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts onChange handler', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('accepts different types', () => {
    const { rerender } = render(<Input type="text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')

    rerender(<Input type="password" />)
    const passwordInput = document.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()

    rerender(<Input type="email" />)
    const emailInput = document.querySelector('input[type="email"]')
    expect(emailInput).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('renders with default value', () => {
    render(<Input defaultValue="default text" />)
    expect(screen.getByRole('textbox')).toHaveValue('default text')
  })

  it('can be required', () => {
    render(<Input required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })
})
