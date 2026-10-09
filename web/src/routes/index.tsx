import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { demoQuery, explain, startDemo, type DemoStatus } from '../api'
import { Rail } from '../components/Rail'

export const Route = createFileRoute('/')({ component: Home })

// Candidates and Reviewers arrive by their own links. This page is for visitors
// to a hosted copy (the demo) and for whoever runs the server.
function Home() {
  const demo = useQuery(demoQuery())
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <p className="font-mono text-xs tracking-wide text-graphite uppercase">takehome-room</p>
      <h1 className="display mt-3 text-4xl leading-[1.05] font-extrabold sm:text-5xl">
        Take-home interviews in a real desktop
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-graphite">
        The candidate works in a recorded Linux desktop in their browser, with any AI tools they like. When the clock
        runs out, the reviewer gets the recording, the commits and the results of tests the candidate never saw.
      </p>

      {demo.data?.enabled && <DemoCard status={demo.data} />}

      <p className="mt-10 text-sm text-graphite">
        Running an interview?{' '}
        <Link to="/admin" className="font-semibold text-ink underline underline-offset-4">
          Create one and get its links
        </Link>
      </p>
    </main>
  )
}

function DemoCard({ status }: { status: DemoStatus }) {
  const navigate = useNavigate()
  const start = useMutation({
    mutationFn: startDemo,
    onSuccess: ({ candidatePath }) => navigate({ to: '/c/$token', params: { token: candidatePath.slice(3) } }),
  })
  const setup = status.setupMinutes ?? 0
  const work = status.workMinutes ?? 0
  const waitMinutes = Math.ceil((status.retryAfterSeconds ?? 0) / 60)

  return (
    <section className="mt-10 rounded-xl border border-rule bg-sheet p-5 sm:p-6">
      <h2 className="display text-lg font-bold">Try it as the candidate</h2>
      <p className="mt-2 text-graphite">
        A short version of a real task: {setup} minutes to settle in, then {work} minutes on the clock. Afterwards you
        see the report a reviewer would get.
      </p>
      <div className="mt-5 max-w-md">
        <Rail setupMinutes={setup} workMinutes={work} />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="rounded-lg bg-ink px-5 py-3 font-semibold text-paper hover:opacity-90 disabled:opacity-50"
          disabled={!status.available || start.isPending}
          onClick={() => start.mutate()}
        >
          {start.isPending ? 'Starting…' : 'Start the demo'}
        </button>
        {!status.available && (
          <p className="text-sm text-graphite" role="status">
            {status.reason === 'cap'
              ? `Today's demos are used up. More open in about ${waitMinutes >= 120 ? `${Math.round(waitMinutes / 60)} hours` : `${waitMinutes} minutes`}.`
              : `Someone is using the desktop right now. It frees up in about ${waitMinutes} minutes.`}
          </p>
        )}
      </div>
      {start.error && <p className="mt-3 text-sm text-proctor">{explain(start.error)}</p>}
      {(!status.available || start.error) && <Contact />}
      <p className="mt-4 text-xs text-graphite">Demos run one at a time on a shared cloud desktop.</p>
    </section>
  )
}

/** For visitors who cannot wait: the author can set up an interview for them. */
const CONTACTS = [
  { label: 'jananitan@gmail.com', href: 'mailto:jananitan@gmail.com' },
  { label: 'X', href: 'https://x.com/iam_nitan' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nitan-jana' },
]

function Contact() {
  return (
    <p className="mt-3 text-sm">
      Cannot wait? Ask Nitan for your own interview link:{' '}
      {CONTACTS.map((c, i) => (
        <span key={c.href}>
          {i > 0 && ' · '}
          <a
            className="font-semibold underline underline-offset-4"
            href={c.href}
            {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {c.label}
          </a>
        </span>
      ))}
    </p>
  )
}
