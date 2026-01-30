import React from 'react'

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseStyles = "bg-white rounded-xl border border-gray-200 shadow-sm"
  const hoverStyles = hoverable ? "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" : ""

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
