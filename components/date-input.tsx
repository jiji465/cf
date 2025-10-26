"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface DateInputProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
}

export function DateInput({ value = "", onChange, placeholder = "dd/mm/aaaa", required, id }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Convert ISO date (yyyy-mm-dd) to Brazilian format (dd/mm/yyyy)
  const isoToBrazilian = (isoDate: string): string => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  // Convert Brazilian format (dd/mm/yyyy) to ISO date (yyyy-mm-dd)
  const brazilianToISO = (brDate: string): string => {
    if (!brDate) return ""
    const cleaned = brDate.replace(/\D/g, "")
    if (cleaned.length !== 8) return ""
    const day = cleaned.substring(0, 2)
    const month = cleaned.substring(2, 4)
    const year = cleaned.substring(4, 8)
    return `${year}-${month}-${day}`
  }

  // Initialize display value from prop
  useEffect(() => {
    if (value) {
      // If value is in ISO format, convert to Brazilian
      if (value.includes("-")) {
        setDisplayValue(isoToBrazilian(value))
      } else {
        setDisplayValue(value)
      }
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "") // Remove non-digits

    // Limit to 8 digits (ddmmyyyy)
    if (input.length > 8) {
      input = input.substring(0, 8)
    }

    // Format as dd/mm/yyyy
    let formatted = ""
    if (input.length > 0) {
      formatted = input.substring(0, 2)
      if (input.length >= 3) {
        formatted += "/" + input.substring(2, 4)
      }
      if (input.length >= 5) {
        formatted += "/" + input.substring(4, 8)
      }
    }

    setDisplayValue(formatted)

    // Only call onChange with ISO format when we have a complete date
    if (input.length === 8) {
      const isoDate = brazilianToISO(formatted)
      onChange(isoDate)
    } else if (input.length === 0) {
      onChange("")
    }
  }

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      maxLength={10}
    />
  )
}
