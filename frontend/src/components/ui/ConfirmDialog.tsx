import { ReactNode, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog'
import Button from './Button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  description = '您确定要执行此操作吗？',
  confirmText = '确定',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading}
            loading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for using confirm dialog with promise
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title?: string
    description?: string | ReactNode
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    resolve?: (value: boolean) => void
  }>({
    open: false,
  })

  const confirm = (options: {
    title?: string
    description?: string | ReactNode
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
  }) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        ...options,
        resolve,
      })
    })
  }

  const handleConfirm = () => {
    state.resolve?.(true)
    setState({ open: false })
  }

  const handleCancel = () => {
    state.resolve?.(false)
    setState({ open: false })
  }

  const ConfirmDialogComponent = () => (
    <Dialog open={state.open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.title || '确认操作'}</DialogTitle>
          {state.description && (
            <DialogDescription className="text-left">
              {state.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {state.cancelText || '取消'}
          </Button>
          <Button variant={state.variant || 'default'} onClick={handleConfirm}>
            {state.confirmText || '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
