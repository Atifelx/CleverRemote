'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, Lock, Play, Search, X } from 'lucide-react'

import {
  forPlatform,
  type LabCodeBlank,
  type LabField,
  type LabPlatform,
  type LabTask,
} from '@/lib/devops-lab'

import styles from './lab.module.css'

type TaskProps<K extends LabTask['kind']> = {
  task: Extract<LabTask, { kind: K }>
  platform: LabPlatform
  done: boolean
  onComplete: () => void
}

type Feedback = { tone: 'ok' | 'bad', text: string } | undefined

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  return (
    <p className={feedback.tone === 'ok' ? styles.feedbackOk : styles.feedbackBad} role="status">
      {feedback.tone === 'ok' ? <Check size={14} /> : <X size={14} />}
      {feedback.text}
    </p>
  )
}

export function ClickTask({ task, platform, done, onComplete }: TaskProps<'click'>) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<Feedback>()
  const items = task.items.map((item, index) => ({ label: forPlatform(item, platform), index }))
  const visible = items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div>
      <label className={styles.consoleSearch}>
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search resources, services, and docs"
          aria-label="Search services"
        />
      </label>
      <div className={styles.serviceGrid}>
        {visible.map((item) => {
          const isTarget = item.index === task.target
          return (
            <button
              type="button"
              key={item.index}
              className={`${styles.serviceTile} ${done && isTarget ? styles.serviceTileDone : ''}`}
              disabled={done}
              onClick={() => {
                if (isTarget) {
                  setFeedback({ tone: 'ok', text: `Opened ${item.label}.` })
                  onComplete()
                } else {
                  setFeedback({ tone: 'bad', text: `That is ${item.label}. ${forPlatform(task.hint, platform)}` })
                }
              }}
            >
              <span className={styles.serviceIcon} aria-hidden="true">{item.label.slice(0, 2).toUpperCase()}</span>
              {item.label}
            </button>
          )
        })}
      </div>
      <FeedbackLine feedback={feedback} />
    </div>
  )
}

function fieldApplies(field: LabField, platform: LabPlatform) {
  return !field.platforms || field.platforms.includes(platform)
}

function isFieldCorrect(field: LabField, value: string, platform: LabPlatform) {
  if (field.kind === 'fixed') return true
  if (field.kind === 'text') return new RegExp(forPlatform(field.accept, platform), 'i').test(value.trim())
  if (value === '') return false
  const correct = Array.isArray(field.correct) ? field.correct : [field.correct]
  return correct.includes(Number(value))
}

export function FormTask({ task, platform, done, onComplete }: TaskProps<'form'>) {
  const fields = task.fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => fieldApplies(field, platform))
  const [values, setValues] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const tabs = task.tabs ? forPlatform(task.tabs, platform) : undefined
  const activeTab = task.activeTab === undefined ? 0 : forPlatform(task.activeTab, platform)
  const allCorrect = fields.every(({ field, index }) => isFieldCorrect(field, values[index] ?? '', platform))

  return (
    <div className={styles.formTask}>
      {tabs ? (
        <div className={styles.wizardTabs} role="tablist" aria-label="Wizard steps">
          {tabs.map((tab, index) => (
            <span key={tab} role="tab" aria-selected={index === activeTab} className={index === activeTab ? styles.wizardTabActive : ''}>{tab}</span>
          ))}
        </div>
      ) : null}

      <div className={styles.formFields}>
        {fields.map(({ field, index }) => {
          const label = forPlatform(field.label, platform)
          const value = values[index] ?? ''
          const correct = isFieldCorrect(field, value, platform)
          const showState = (checked || done) && field.kind !== 'fixed'
          const selectedFeedback = field.kind === 'select' && value !== ''
            ? field.options[Number(value)]?.feedback
            : undefined

          return (
            <div className={styles.formRow} key={index}>
              <label htmlFor={`field-${index}`}>{label}{field.kind !== 'fixed' ? <span aria-hidden="true"> *</span> : null}</label>
              <div>
                {field.kind === 'fixed' ? (
                  <span className={styles.fixedValue}>{forPlatform(field.value, platform)}</span>
                ) : field.kind === 'text' ? (
                  <input
                    id={`field-${index}`}
                    className={`${styles.formInput} ${showState ? (correct ? styles.inputOk : styles.inputBad) : ''}`}
                    value={done && !value ? (forPlatform(field.placeholder ?? '', platform)) : value}
                    placeholder={forPlatform(field.placeholder ?? '', platform)}
                    disabled={done}
                    onChange={(event) => {
                      setChecked(false)
                      setValues((current) => ({ ...current, [index]: event.target.value }))
                    }}
                  />
                ) : (
                  <select
                    id={`field-${index}`}
                    className={`${styles.formInput} ${showState ? (correct ? styles.inputOk : styles.inputBad) : ''}`}
                    value={value}
                    disabled={done}
                    onChange={(event) => {
                      setChecked(false)
                      setValues((current) => ({ ...current, [index]: event.target.value }))
                    }}
                  >
                    <option value="" disabled>Select…</option>
                    {field.options.map((option, optionIndex) => (
                      <option value={optionIndex} key={optionIndex}>{forPlatform(option.label, platform)}</option>
                    ))}
                  </select>
                )}
                {selectedFeedback && (checked || value !== '') ? (
                  <small className={correct ? styles.fieldNoteOk : styles.fieldNoteBad}>{forPlatform(selectedFeedback, platform)}</small>
                ) : null}
                {checked && !correct && field.kind !== 'fixed' && !selectedFeedback ? (
                  <small className={styles.fieldNoteBad}>{forPlatform(field.hint, platform)}</small>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={done}
          onClick={() => {
            setChecked(true)
            if (allCorrect) onComplete()
          }}
        >
          {forPlatform(task.submit, platform)}
        </button>
        {checked && !allCorrect && !done ? <span className={styles.feedbackBad}><X size={14} /> Fix the fields marked in red.</span> : null}
      </div>
    </div>
  )
}

function CodeLine({ line, blanks, picks, platform, onPick, done }: {
  line: string
  blanks: readonly LabCodeBlank[]
  picks: Record<number, number>
  platform: LabPlatform
  onPick: (blank: number, option: number) => void
  done: boolean
}) {
  const parts = line.split(/(\[\[\d+\]\])/)
  return (
    <>
      {parts.map((part, index) => {
        const match = /^\[\[(\d+)\]\]$/.exec(part)
        if (!match) return <span key={index}>{part}</span>
        const blankIndex = Number(match[1])
        const blank = blanks[blankIndex]
        const pick = done ? blank.correct : picks[blankIndex]
        const state = pick === undefined ? '' : pick === blank.correct ? styles.blankOk : styles.blankBad
        return (
          <select
            key={index}
            aria-label={`Blank ${blankIndex + 1}`}
            className={`${styles.codeBlank} ${state}`}
            value={pick ?? ''}
            disabled={done}
            onChange={(event) => onPick(blankIndex, Number(event.target.value))}
          >
            <option value="" disabled>{`▾ blank ${blankIndex + 1}`}</option>
            {blank.options.map((option, optionIndex) => (
              <option value={optionIndex} key={optionIndex}>{forPlatform(option.label, platform)}</option>
            ))}
          </select>
        )
      })}
    </>
  )
}

export function CodeTask({ task, platform, done, onComplete }: TaskProps<'code'>) {
  const [picks, setPicks] = useState<Record<number, number>>({})
  const code = forPlatform(task.code, platform)
  const allCorrect = task.blanks.every((blank, index) => picks[index] === blank.correct)

  return (
    <div className={styles.editor}>
      <div className={styles.editorTab}>{forPlatform(task.file, platform)}</div>
      <pre className={styles.editorBody}>
        {code.split('\n').map((line, index) => (
          <div className={styles.editorLine} key={index}>
            <span className={styles.lineNumber}>{index + 1}</span>
            <code>
              <CodeLine
                line={line}
                blanks={task.blanks}
                picks={picks}
                platform={platform}
                done={done}
                onPick={(blank, option) => {
                  const next = { ...picks, [blank]: option }
                  setPicks(next)
                  if (task.blanks.every((item, itemIndex) => next[itemIndex] === item.correct)) onComplete()
                }}
              />
            </code>
          </div>
        ))}
      </pre>
      <div className={styles.blankNotes}>
        {task.blanks.map((blank, index) => {
          const pick = done ? blank.correct : picks[index]
          if (pick === undefined) return null
          const option = blank.options[pick]
          return (
            <p key={index} className={pick === blank.correct ? styles.feedbackOk : styles.feedbackBad}>
              {pick === blank.correct ? <Check size={14} /> : <X size={14} />}
              <strong>Blank {index + 1}:</strong> {forPlatform(option.feedback ?? '', platform)}
            </p>
          )
        })}
        {!done && !allCorrect && Object.keys(picks).length === 0 ? <p className={styles.mutedNote}>Use the dropdowns inside the code.</p> : null}
      </div>
    </div>
  )
}

export function ChoiceTask({ task, platform, done, onComplete }: TaskProps<'choice'>) {
  const [picked, setPicked] = useState<number | undefined>()
  const correctIndex = task.options.findIndex((option) => option.correct)
  const shown = done && picked === undefined ? correctIndex : picked

  return (
    <div className={styles.choiceTask}>
      <p className={styles.choiceQuestion}>{forPlatform(task.question, platform)}</p>
      <div className={styles.choiceList}>
        {task.options.map((option, index) => {
          const isPicked = shown === index
          const state = isPicked ? (option.correct ? styles.choiceOk : styles.choiceBad) : ''
          return (
            <button
              type="button"
              key={index}
              className={`${styles.choiceOption} ${state}`}
              disabled={done}
              onClick={() => {
                setPicked(index)
                if (option.correct) onComplete()
              }}
            >
              <span className={styles.choiceMarker}>{String.fromCharCode(65 + index)}</span>
              <span>
                {forPlatform(option.label, platform)}
                {isPicked ? <small>{forPlatform(option.feedback, platform)}</small> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function usePlayback(length: number, active: boolean, interval: number, onDone: () => void) {
  const [count, setCount] = useState(0)
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  })
  useEffect(() => {
    if (!active) return
    if (count >= length) {
      doneRef.current()
      return
    }
    const timer = window.setTimeout(() => setCount((current) => current + 1), interval)
    return () => window.clearTimeout(timer)
  }, [active, count, length, interval])
  return [count, setCount] as const
}

export function TerminalTask({ task, platform, done, onComplete }: TaskProps<'terminal'>) {
  const [running, setRunning] = useState(false)
  const output = forPlatform(task.output, platform)
  const [count] = usePlayback(output.length, running, 260, onComplete)
  const visible = done && !running ? output.length : count
  const command = forPlatform(task.command, platform)

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}><span /><span /><span /> bash</div>
      <pre className={styles.terminalBody}>
        {command.split('\n').map((line, index) => (
          <div key={index}><span className={styles.prompt}>{index === 0 ? '$ ' : '  '}</span>{line}</div>
        ))}
        {output.slice(0, visible).map((line, index) => <div className={styles.terminalOut} key={index}>{line}</div>)}
        {!running && !done ? (
          <button type="button" className={styles.runButton} onClick={() => setRunning(true)}>
            <Play size={13} /> Run command
          </button>
        ) : null}
      </pre>
    </div>
  )
}

export function SimulateTask({ task, platform, done, onComplete }: TaskProps<'simulate'>) {
  const [running, setRunning] = useState(false)
  const [count] = usePlayback(task.frames.length, running, 900, onComplete)
  const visible = done && !running ? task.frames.length : count
  const current = [...task.frames.slice(0, visible)].reverse().find((frame) => frame.values)?.values

  return (
    <div className={styles.simulation}>
      {task.url ? (
        <div className={styles.browserBar}>
          <Lock size={12} />
          <span>{forPlatform(task.url, platform)}</span>
        </div>
      ) : null}

      {task.metrics ? (
        <div className={styles.metricGrid}>
          {task.metrics.map((metric, index) => {
            const value = current?.[index] ?? 0
            const percent = Math.min(100, (value / metric.max) * 100)
            return (
              <div className={styles.metric} key={index}>
                <span>{forPlatform(metric.label, platform)}</span>
                <strong>{value.toLocaleString('en-US')}{metric.unit}</strong>
                <div className={styles.metricTrack}><div style={{ width: `${percent}%` }} /></div>
              </div>
            )
          })}
        </div>
      ) : null}

      <ol className={styles.simLog}>
        {task.frames.slice(0, visible).map((frame, index) => (
          <li key={index} className={styles[`tone_${frame.tone}`]}>
            <ChevronRight size={13} />
            {forPlatform(frame.log, platform)}
          </li>
        ))}
      </ol>

      {!running && !done ? (
        <button type="button" className={styles.primaryButton} onClick={() => setRunning(true)}>
          <Play size={14} /> {forPlatform(task.action, platform)}
        </button>
      ) : null}
    </div>
  )
}

export function LabTaskView(props: { task: LabTask, platform: LabPlatform, done: boolean, onComplete: () => void }) {
  const { task } = props
  switch (task.kind) {
    case 'click': return <ClickTask {...props} task={task} />
    case 'form': return <FormTask {...props} task={task} />
    case 'code': return <CodeTask {...props} task={task} />
    case 'choice': return <ChoiceTask {...props} task={task} />
    case 'terminal': return <TerminalTask {...props} task={task} />
    case 'simulate': return <SimulateTask {...props} task={task} />
  }
}
