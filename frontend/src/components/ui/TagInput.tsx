import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Tag from './Tag'

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
  className?: string
  disabled?: boolean
}

export default function TagInput({
  value,
  onChange,
  placeholder = '输入标签后按 Enter...',
  maxTags,
  suggestions = [],
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(
        (s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(s)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, suggestions, value])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    if (maxTags && value.length >= maxTags) return
    if (value.includes(trimmedTag)) return

    onChange([...value, trimmedTag])
    setInputValue('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (
        selectedSuggestionIndex >= 0 &&
        filteredSuggestions[selectedSuggestionIndex]
      ) {
        addTag(filteredSuggestions[selectedSuggestionIndex])
      } else {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) =>
        Math.min(prev + 1, filteredSuggestions.length - 1)
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <Tag
            key={index}
            label={tag}
            closable={!disabled}
            onClose={() => removeTag(index)}
            size="sm"
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredSuggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || (maxTags ? value.length >= maxTags : false)}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  index === selectedSuggestionIndex && 'bg-accent text-accent-foreground'
                )}
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {maxTags && (
        <p className="mt-1 text-xs text-muted-foreground">
          {value.length}/{maxTags} 标签
        </p>
      )}
    </div>
  )
}
