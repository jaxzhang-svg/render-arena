import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { getModelById } from '@/lib/config'

export const runtime = 'edge'
export const alt = 'App Preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'

// Dark glass style — semi-transparent dark panels, not too harsh on light backgrounds
const glassStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
} as const

/**
 * Dynamic OG image for gallery items.
 *
 * Layout:
 * ┌──────────────────────────────────────────────┐
 * │ ┌──────────────────────┐                     │
 * │ │ 🟢 Novita Render Arena│     [cover image]  │
 * │ └──────────────────────┘                     │
 * │                                              │
 * │ ┌─────────────────────┐                      │
 * │ │  App Title           │                     │
 * │ └─────────────────────┘                      │
 * │                   ┌──────── VS ────────────┐ │
 * │                   │ 🔵 Model A  🟠 Model B │ │
 * │                   └────────────────────────┘ │
 * └──────────────────────────────────────────────┘
 */
export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const adminClient = await createAdminClient()
  const { data: app } = await adminClient
    .from('apps')
    .select('name, cover_image_url, model_a, model_b')
    .eq('id', id)
    .single()

  const title = app?.name || 'Untitled App'
  const coverUrl = app?.cover_image_url
  const modelA = app?.model_a ? getModelById(app.model_a) : null
  const modelB = app?.model_b ? getModelById(app.model_b) : null

  const resolveIcon = (iconPath: string) => `${siteUrl}${iconPath}`

  // Model badge — icon + name
  const ModelBadge = ({ model }: { model: { name: string; icon: string; color: string } }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <img
        src={resolveIcon(model.icon)}
        alt=""
        width={24}
        height={24}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          ...(model.color === '#000' ? { filter: 'invert(1)' } : {}),
        }}
      />
      <div
        style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {model.name}
      </div>
    </div>
  )

  // VS separator
  const VsDivider = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        margin: '0 14px',
        gap: '8px',
      }}
    >
      <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(255,255,255,0.35)', display: 'flex' }} />
      <div
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '2px',
        }}
      >
        VS
      </div>
      <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(255,255,255,0.35)', display: 'flex' }} />
    </div>
  )

  if (coverUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0a0a0a',
          }}
        >
          {/* Cover image — center-cropped */}
          <img
            src={coverUrl}
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />

          {/* Top-left: Novita Render Arena — logo icon + text, dark glass */}
          <div
            style={{
              position: 'absolute',
              top: '28px',
              left: '32px',
              display: 'flex',
              alignItems: 'center',
              ...glassStyle,
              borderRadius: '14px',
              padding: '10px 20px',
              gap: '10px',
            }}
          >
            <svg
              width={30}
              height={19}
              viewBox="0 0 28 17.3049"
              fill="none"
              style={{ width: '30px', height: '19px' }}
            >
              <path
                d="M10.9451 0.390625V7.00033L0.25 17.6955H10.9451V11.0854L17.5555 17.6955H28.25L10.9451 0.390625Z"
                fill="#23D57C"
              />
            </svg>
            <div
              style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Novita Render Arena
            </div>
          </div>

          {/* Bottom-left: Title — dark glass panel */}
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '32px',
              display: 'flex',
              ...glassStyle,
              borderRadius: '14px',
              padding: '14px 26px',
              maxWidth: '700px',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: '36px',
                fontWeight: 600,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom-right: Model A VS Model B — dark glass panel */}
          {(modelA || modelB) && (
            <div
              style={{
                position: 'absolute',
                bottom: '32px',
                right: '32px',
                display: 'flex',
                alignItems: 'center',
                ...glassStyle,
                borderRadius: '20px',
                padding: '10px 20px',
              }}
            >
              {modelA && <ModelBadge model={modelA} />}
              {modelA && modelB && <VsDivider />}
              {modelB && <ModelBadge model={modelB} />}
            </div>
          )}
        </div>
      ),
      { ...size }
    )
  }

  // Fallback: use default static OG image
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        <img
          src={`${siteUrl}/images/og-cover-v2.png`}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
