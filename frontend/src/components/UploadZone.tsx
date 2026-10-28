import React, { useState, useRef } from 'react'

interface PresetOption {
  id: string
  title: string
  subtitle?: string
}

interface Props {
  label: string
  description?: string
  acceptTypes?: string
  placeholder?: string
  presetLabel?: string
  presets?: PresetOption[]
  onFileSelect: (file: File | null) => void
  onTextChange: (text: string) => void
  onPresetSelect?: (presetId: string) => void
}

export function UploadZone({
  label,
  description = 'Upload PDF or Word document, or paste raw text',
  acceptTypes = '.pdf,.docx,.doc,.txt',
  placeholder = 'Paste text here...',
  presetLabel = 'Or pick a sample',
  presets = [],
  onFileSelect,
  onTextChange,
  onPresetSelect,
}: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setSelectedFile(file)
    onFileSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  function handleTextChange(val: string) {
    setPastedText(val)
    onTextChange(val)
  }

  function clearFile() {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{label}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 3 }}>
          <button
            type="button"
            onClick={() => setMode('upload')}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              background: mode === 'upload' ? 'var(--blue)' : 'transparent',
              color: mode === 'upload' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              background: mode === 'paste' ? 'var(--blue)' : 'transparent',
              color: mode === 'paste' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Preset selector if available */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{presetLabel}:</span>
          <select
            onChange={(e) => {
              if (e.target.value && onPresetSelect) {
                onPresetSelect(e.target.value)
                setSelectedFile(null)
                setPastedText('')
              }
            }}
            defaultValue=""
            style={{
              background: 'var(--surface-3)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              flex: 1,
              outline: 'none',
            }}
          >
            <option value="" disabled>-- Select a preloaded sample --</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.subtitle ? `(${p.subtitle})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--blue)' : selectedFile ? 'var(--green)' : 'var(--border)'}`,
            borderRadius: 12,
            background: isDragging ? 'var(--blue-dim)' : 'var(--surface-2)',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleFile(e.target.files[0])
            }}
          />
          {selectedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selectedFile.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                style={{
                  background: 'var(--red-dim)',
                  color: 'var(--red)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  marginLeft: 12,
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 26, marginBottom: 6 }}>📁</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Click to browse or drop file here
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Supports PDF, Word (.docx), or plain text
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={pastedText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            style={{
              width: '100%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              color: 'var(--text)',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}
