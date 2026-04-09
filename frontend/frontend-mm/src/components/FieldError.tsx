export function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <small className="error-text">{message}</small>
}
