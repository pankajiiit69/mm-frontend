import { useEffect, useRef } from 'react'

export interface TelegramAuthUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface TelegramLoginButtonProps {
  botName: string
  onAuth: (user: TelegramAuthUser) => void
  onError?: (message: string) => void
  size?: 'large' | 'medium' | 'small'
  cornerRadius?: number
  requestAccess?: 'read' | 'write'
  showUserPhoto?: boolean
  language?: string
  className?: string
}

declare global {
  interface Window {
    [key: string]: unknown
  }
}

function isValidTelegramAuthUser(input: unknown): input is TelegramAuthUser {
  if (!input || typeof input !== 'object') {
    return false
  }

  const candidate = input as Partial<TelegramAuthUser>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.first_name === 'string' &&
    typeof candidate.auth_date === 'number' &&
    typeof candidate.hash === 'string'
  )
}

function normalizeBotUsername(rawValue: string): string {
  let value = rawValue.trim()
  value = value.replace(/^@/, '')
  value = value.replace(/^https?:\/\/t\.me\//, '')
  value = value.replace(/^t\.me\//, '')
  value = value.replace(/\/+$/, '')
  value = value.replace(/%+$/, '')
  return value
}

function isValidBotUsername(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value)
}

export function TelegramLoginButton({
  botName,
  onAuth,
  onError,
  size = 'large',
  cornerRadius = 8,
  requestAccess = 'write',
  showUserPhoto = true,
  language = 'en',
  className,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const callbackNameRef = useRef(`fruzoosTelegramAuth_${Math.random().toString(36).slice(2)}`)
  const onAuthRef = useRef(onAuth)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onAuthRef.current = onAuth
  }, [onAuth])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    const host = containerRef.current
    if (!host) {
      return
    }

    const normalizedBotName = normalizeBotUsername(botName)
    if (!normalizedBotName) {
      onErrorRef.current?.('Telegram bot username is missing.')
      host.innerHTML = ''
      return
    }

    if (!isValidBotUsername(normalizedBotName)) {
      onErrorRef.current?.('Invalid Telegram bot username.')
      host.innerHTML = ''
      return
    }

    const callbackName = callbackNameRef.current
    window[callbackName] = (payload: unknown) => {
      if (!isValidTelegramAuthUser(payload)) {
        onErrorRef.current?.('Telegram returned an invalid auth payload.')
        return
      }
      onAuthRef.current(payload)
    }

    host.innerHTML = ''

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', normalizedBotName)
    script.setAttribute('data-size', size)
    script.setAttribute('data-radius', String(cornerRadius))
    script.setAttribute('data-userpic', showUserPhoto ? 'true' : 'false')
    script.setAttribute('data-request-access', requestAccess)
    script.setAttribute('data-lang', language)
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    script.addEventListener('error', () => {
      onErrorRef.current?.('Failed to load Telegram widget script. Check network/ad-blocker settings.')
    })

    host.appendChild(script)

    return () => {
      delete window[callbackName]
      host.innerHTML = ''
    }
  }, [botName, cornerRadius, language, requestAccess, showUserPhoto, size])

  return <div className={className} ref={containerRef} />
}
