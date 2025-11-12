import { describe, it, expect } from 'vitest'
import { render } from '../../../test/test-utils'
import {
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonTable,
  SkeletonList 
} from '../Skeleton'

describe('Skeleton', () => {
  describe('Basic Skeleton', () => {
    it('renders skeleton with default props', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('bg-muted', 'rounded', 'animate-pulse')
    })

    it('renders different variants', () => {
      const { container: textContainer } = render(<Skeleton variant="text" />)
      expect(textContainer.firstChild).toHaveClass('rounded')

      const { container: circularContainer } = render(<Skeleton variant="circular" />)
      expect(circularContainer.firstChild).toHaveClass('rounded-full')

      const { container: rectContainer } = render(<Skeleton variant="rectangular" />)
      expect(rectContainer.firstChild).toHaveClass('rounded-none')

      const { container: roundedContainer } = render(<Skeleton variant="rounded" />)
      expect(roundedContainer.firstChild).toHaveClass('rounded-lg')
    })

    it('renders different animations', () => {
      const { container: pulseContainer } = render(<Skeleton animation="pulse" />)
      expect(pulseContainer.firstChild).toHaveClass('animate-pulse')

      const { container: waveContainer } = render(<Skeleton animation="wave" />)
      expect(waveContainer.firstChild).toHaveClass('animate-shimmer')

      const { container: noneContainer } = render(<Skeleton animation="none" />)
      const element = noneContainer.firstChild as HTMLElement
      expect(element.className).not.toContain('animate-')
    })

    it('applies custom width and height', () => {
      const { container } = render(<Skeleton width={200} height={100} />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton.style.width).toBe('200px')
      expect(skeleton.style.height).toBe('100px')
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />)
      expect(container.firstChild).toHaveClass('custom-skeleton')
    })

    it('handles string width and height', () => {
      const { container } = render(<Skeleton width="50%" height="2rem" />)
      const skeleton = container.firstChild as HTMLElement
      
      expect(skeleton.style.width).toBe('50%')
      expect(skeleton.style.height).toBe('2rem')
    })
  })

  describe('SkeletonText', () => {
    it('renders default 3 lines', () => {
      const { container } = render(<SkeletonText />)
      const lines = container.querySelectorAll('.bg-muted')
      
      expect(lines).toHaveLength(3)
    })

    it('renders custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />)
      const lines = container.querySelectorAll('.bg-muted')
      
      expect(lines).toHaveLength(5)
    })

    it('last line is 80% width', () => {
      const { container } = render(<SkeletonText lines={3} />)
      const lines = container.querySelectorAll('.bg-muted')
      const lastLine = lines[lines.length - 1] as HTMLElement
      
      expect(lastLine.style.width).toBe('80%')
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonText className="custom-text" />)
      expect(container.firstChild).toHaveClass('custom-text')
    })
  })

  describe('SkeletonCard', () => {
    it('renders card skeleton structure', () => {
      const { container } = render(<SkeletonCard />)
      const skeletons = container.querySelectorAll('.bg-muted')
      
      // Should have rectangular + 3 text lines = 4 skeletons
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonCard className="custom-card" />)
      expect(container.firstChild).toHaveClass('custom-card')
    })
  })

  describe('SkeletonAvatar', () => {
    it('renders with default size', () => {
      const { container } = render(<SkeletonAvatar />)
      const avatar = container.firstChild as HTMLElement
      
      expect(avatar.style.width).toBe('40px')
      expect(avatar.style.height).toBe('40px')
      expect(avatar).toHaveClass('rounded-full')
    })

    it('renders with custom size', () => {
      const { container } = render(<SkeletonAvatar size={64} />)
      const avatar = container.firstChild as HTMLElement
      
      expect(avatar.style.width).toBe('64px')
      expect(avatar.style.height).toBe('64px')
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonAvatar className="custom-avatar" />)
      expect(container.firstChild).toHaveClass('custom-avatar')
    })
  })

  describe('SkeletonTable', () => {
    it('renders default 5 rows and 4 columns', () => {
      const { container } = render(<SkeletonTable />)
      const rows = container.querySelectorAll('.space-y-3 > div')
      
      // Header + 5 rows = 6 total
      expect(rows).toHaveLength(6)
    })

    it('renders custom rows and columns', () => {
      const { container } = render(<SkeletonTable rows={3} columns={5} />)
      const allRows = container.querySelectorAll('.space-y-3 > div')
      
      // Header + 3 rows = 4 total
      expect(allRows).toHaveLength(4)
      
      // Each row should have 5 columns
      const firstRow = allRows[0]
      const columns = firstRow.querySelectorAll('.bg-muted')
      expect(columns).toHaveLength(5)
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonTable className="custom-table" />)
      expect(container.firstChild).toHaveClass('custom-table')
    })
  })

  describe('SkeletonList', () => {
    it('renders default 3 items', () => {
      const { container } = render(<SkeletonList />)
      const items = container.querySelectorAll('.space-y-4 > div')
      
      expect(items).toHaveLength(3)
    })

    it('renders custom number of items', () => {
      const { container } = render(<SkeletonList items={5} />)
      const items = container.querySelectorAll('.space-y-4 > div')
      
      expect(items).toHaveLength(5)
    })

    it('each item has avatar and text lines', () => {
      const { container } = render(<SkeletonList items={1} />)
      const item = container.querySelector('.space-y-4 > div')
      
      // Should have circular avatar
      const avatar = item?.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
      
      // Should have text lines
      const textLines = item?.querySelectorAll('.space-y-2 .bg-muted')
      expect(textLines).toHaveLength(2)
    })

    it('applies custom className', () => {
      const { container } = render(<SkeletonList className="custom-list" />)
      expect(container.firstChild).toHaveClass('custom-list')
    })
  })
})
