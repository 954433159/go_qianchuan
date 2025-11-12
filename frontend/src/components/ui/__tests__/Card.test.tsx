import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  it('renders card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card Content')).toBeInTheDocument()
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('applies custom className to Card', () => {
    const { container } = render(
      <Card className="custom-card">Content</Card>
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-card')
  })

  it('renders CardTitle with correct styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('text-lg', 'font-semibold')
  })

  it('renders CardDescription with muted text', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    )
    const description = screen.getByText('Test Description')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('can render without header or footer', () => {
    render(
      <Card>
        <CardContent>Just Content</CardContent>
      </Card>
    )
    expect(screen.getByText('Just Content')).toBeInTheDocument()
  })
})
