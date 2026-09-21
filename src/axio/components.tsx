import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { AxioHintLabel } from './Hint'

interface AxioButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'icon'
}

export function AxioButton({ variant = 'outline', className = '', ...props }: AxioButtonProps) {
  return (
    <button type="button" className={`axio-btn axio-btn-${variant} ${className}`} {...props} />
  )
}

interface AxioCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  id?: string
}

export function AxioCard({ children, className = '', style, id }: AxioCardProps) {
  return (
    <div id={id} className={`axio-card ${className}`} style={style}>
      {children}
    </div>
  )
}

interface AxioStatProps {
  label: string
  value: ReactNode
  hint?: string
  column?: string
  delta?: ReactNode
  deltaTone?: 'up' | 'down' | 'flat'
  sparkline?: ReactNode
}

export function AxioStat({ label, value, hint, column, delta, deltaTone, sparkline }: AxioStatProps) {
  return (
    <div className="axio-stat">
      <p className="axio-stat-label">
        <AxioHintLabel title={label} body={hint} column={column}>
          {label}
        </AxioHintLabel>
      </p>
      <div className="axio-stat-row">
        <p className="axio-stat-value">{value}</p>
        {sparkline}
      </div>
      {delta ? <p className={`axio-stat-delta is-${deltaTone ?? 'flat'}`}>{delta}</p> : null}
    </div>
  )
}

interface AxioFieldProps {
  label: string
  children: ReactNode
}

export function AxioField({ label, children }: AxioFieldProps) {
  return (
    <label className="axio-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

interface AxioChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function AxioChip({ active, className = '', ...props }: AxioChipProps) {
  return (
    <button
      type="button"
      className={`axio-chip${active ? ' is-active' : ''} ${className}`}
      {...props}
    />
  )
}

interface AxioBadgeProps {
  children: ReactNode
  tone?: 'default' | 'info' | 'success' | 'destructive'
}

export function AxioBadge({ children, tone = 'default' }: AxioBadgeProps) {
  return <span className={`axio-badge axio-badge-${tone}`}>{children}</span>
}

interface AxioSectionTitleProps {
  children: ReactNode
  hint?: string
  column?: string
}

export function AxioSectionTitle({ children, hint, column }: AxioSectionTitleProps) {
  return (
    <div className="axio-section-title">
      <h3>
        <AxioHintLabel title={String(children)} body={hint} column={column}>
          {children}
        </AxioHintLabel>
      </h3>
    </div>
  )
}

export function AxioEmpty({ children }: { children: ReactNode }) {
  return <p className="axio-empty">{children}</p>
}
