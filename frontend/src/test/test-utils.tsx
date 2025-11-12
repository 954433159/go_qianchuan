import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <BrowserRouter>{children}</BrowserRouter>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from React Testing Library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }

// Helper to create mock API response
export function createMockApiResponse<T>(data: T, code = 0, message = 'success') {
  return {
    code,
    message,
    data,
  }
}

// Helper to wait for async operations
export function waitFor(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
