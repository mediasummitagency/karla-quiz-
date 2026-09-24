import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { initTracking, track, buildCheckoutUrl } from './tracking'

// ============ CONFIGURATION (update these as needed) ============
// PREVIEW: envio de leads DESLIGADO neste branch. A planilha (scripts/Code.gs) e o Zap do WhatsApp
// ainda não têm colunas para nome/contexto/duração/raiz/resposta aberta. Religar só junto com isso.
const WEBHOOK_URL = ''
// Checkout do low ticket "Raiz da Sobrecarga" (Kiwify)
const CHECKOUT_URL = 'https://pay.kiwify.com.br/zftB1uv'
// A barra fixa da oferta só aparece depois deste tanto de vídeo ASSISTIDO (não de tempo na
// página). Os quatro vídeos têm de 8 a 10 minutos, então 3 min é cerca de um terço da aula.
const STICKY_AFTER_SECONDS = 180

// ============ QUIZ DATA ============
const SCALE_LABELS = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre']

const QUESTIONS = [
  'Eu acordo já me sentindo cansada, mesmo após uma noite de sono.',
  'Minha mente continua ativa mesmo quando tento descansar.',
  'Sinto culpa quando tiro tempo para mim.',
  'Tenho dificuldade de dizer "não", mesmo quando já estou sobrecarregada.',
  'Sinto que estou sempre correndo, mas nunca finalizando tudo.',
  'Percebo irritação ou impaciência maior do que gostaria.',
  'Sinto que ninguém percebe o quanto eu estou sustentando.',
  'Adio autocuidado básico (alimentação, pausas, consultas).',
  'Tenho a sensação de que, se eu parar, tudo desorganiza.',
  'Me comparo com outras mulheres e sinto que estou ficando para trás.',
  'Choro com mais facilidade ou fico emocionalmente mais sensível.',
  'Sinto que perdi parte da minha identidade fora das minhas obrigações.',
  'Tenho dificuldade de relaxar sem estar produzindo algo.',
  'Sinto tensão física frequente (mandíbula, ombros, cabeça).',
  'Penso que deveria dar conta melhor do que estou dando.',
  'Sinto que estou vivendo no automático.',
  'Tenho dificuldade de sentir prazer nas coisas simples.',
  'Já pensei que não aguento manter esse ritmo por muito tempo.',
]

const RESULT_LEVELS = [
  {
    min: 0,
    max: 18,
    name: 'Sobrecarga Leve',
    badge: 'Leve',
    badgeClass: 'level-leve',
    videoId: 'I8heSy5ExaE',
    videoTitle: 'Seu resultado: Sobrecarga Emocional Leve | O cansaço que começa em silêncio',
    devolutiva:
      'Seu resultado indica sinais de Sobrecarga Emocional Leve.\n\nIsso não significa que você está em exaustão. Mas significa que alguns padrões emocionais já começaram a aparecer e merecem atenção.\n\nMuitas mulheres acreditam que a exaustão emocional surge de repente. A verdade é que ela costuma começar em silêncio, através de pequenos sinais que vão sendo ignorados ao longo do tempo.\n\nNa aula abaixo, vou te ajudar a entender por que isso acontece, quais comportamentos costumam levar a esse estado e como perceber os primeiros sinais antes que eles se tornem algo maior.\n\nAssista com calma. Talvez você se identifique mais do que imagina.',
  },
  {
    min: 19,
    max: 36,
    name: 'Sobrecarga em Alerta',
    badge: 'Alerta',
    badgeClass: 'level-alerta',
    videoId: '0-yWqG98LnA',
    videoTitle: 'Seu resultado: Sobrecarga Emocional em Alerta | Como você aprendeu a funcionar cansada',
    devolutiva:
      'Seu resultado indica Sobrecarga Emocional em Alerta.\n\nIsso significa que o cansaço já deixou de ser algo pontual e começou a se tornar parte da sua rotina.\n\nTalvez você esteja vivendo cansada há tanto tempo que isso passou a parecer normal. Talvez esteja funcionando no automático, tentando dar conta de tudo, mesmo sentindo que sua energia já não é a mesma.\n\nNa aula abaixo, vou te mostrar como esse padrão se desenvolve, o que acontece emocionalmente quando passamos tempo demais sustentando responsabilidades e por que descansar pode estar sendo tão difícil para você.\n\nEssa aula costuma trazer muitos insights para mulheres que sentem que estão carregando mais peso do que deveriam.',
  },
  {
    min: 37,
    max: 54,
    name: 'Sobrecarga Elevada',
    badge: 'Elevada',
    badgeClass: 'level-elevada',
    videoId: 'LIMzwmhBfBI',
    videoTitle: 'Seu resultado: Sobrecarga Emocional Elevada | Quando a exaustão começa a roubar quem você é',
    devolutiva:
      'Seu resultado indica Sobrecarga Emocional Elevada.\n\nNesse estágio, a sobrecarga já não afeta apenas sua energia. Ela pode começar a impactar sua leveza, sua motivação, seu prazer pelas coisas e até sua conexão consigo mesma.\n\nMuitas mulheres chegam aqui acreditando que ficaram fracas, quando na verdade estão emocionalmente exaustas há muito tempo.\n\nNa aula abaixo, vou te ajudar a entender como esse processo acontece, quais são os sinais mais comuns desse estágio e por que tantas mulheres sentem que estão perdendo partes importantes de si mesmas sem perceber.\n\nSe possível, assista até o final. Essa pode ser uma das explicações que você procurava há muito tempo.',
  },
  {
    min: 55,
    max: 72,
    name: 'Exaustão Crítica',
    badge: 'Crítica',
    badgeClass: 'level-critica',
    videoId: 'HDCAsco8Emk',
    videoTitle:
      'Seu resultado: Exaustão Emocional Crítica | Seu corpo está tentando sobreviver ao peso que sua mente sustentou por tempo demais',
    devolutiva:
      'Seu resultado indica Exaustão Emocional Crítica.\n\nAntes de qualquer coisa, eu quero que você saiba: esse resultado não significa fraqueza.\n\nEle apenas mostra que seu corpo e seu emocional podem estar sustentando mais peso do que conseguem carregar sozinhos neste momento.\n\nMuitas mulheres chegam a esse estágio sentindo culpa, vergonha ou acreditando que deveriam conseguir lidar melhor com tudo. Mas a exaustão emocional raramente acontece porque alguém é fraco. Ela acontece porque alguém sustentou peso demais por tempo demais sem suporte suficiente.\n\nA aula abaixo não foi gravada para te assustar. Ela foi gravada para te ajudar a compreender o que está acontecendo, diminuir a autocobrança e mostrar que existe um caminho possível a partir daqui.\n\nRespire fundo e assista com calma.',
  },
]

// ============ CONTEXTO (não pontua; só personaliza o resultado) ============
const CONTEXT_OPTIONS = [
  { key: 'trabalho', label: 'Trabalho fora', phrase: 'o trabalho' },
  { key: 'empreendo', label: 'Empreendo / trabalho em casa', phrase: 'o seu negócio' },
  { key: 'filhos', label: 'Filhos', phrase: 'os filhos' },
  { key: 'familia', label: 'Cuidar de pais ou familiares', phrase: 'o cuidado com a família' },
  { key: 'casa', label: 'Casa', phrase: 'a casa' },
  { key: 'estudos', label: 'Estudos', phrase: 'os estudos' },
]

const DURATION_OPTIONS = [
  { key: 'semanas', label: 'Algumas semanas', phrase: 'há algumas semanas' },
  { key: 'meses', label: 'Alguns meses', phrase: 'há alguns meses' },
  { key: 'ano', label: 'Mais de um ano', phrase: 'há mais de um ano' },
  { key: 'sempre', label: 'Nem lembro como era antes', phrase: 'há tanto tempo que nem lembra como era antes' },
]

// As 18 perguntas continuam as mesmas e na mesma ordem; só ganham pausas a cada 6.
const CHAPTER_SIZE = 6
const CHAPTER_TITLES = ['Seu dia a dia', 'Suas cobranças', 'Você por dentro']

function joinPt(list) {
  if (list.length <= 1) return list.join('')
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`
}

// ============ AS 5 RAÍZES (rascunho 2026-09-24, textos pendentes de aprovação da Karla) ============
// `items` = índices (0-based) das perguntas que mais se aproximam de cada raiz.
const ROOTS = [
  {
    key: 'da-conta',
    name: 'A que dá conta',
    quote: 'Se eu não resolver, ninguém resolve.',
    items: [3, 6, 8],
    text: 'É a mulher que sente que, se ela não resolver, ninguém resolve. Por isso ela segura tudo, mesmo quando já não tem de onde tirar. Isso não é força demais. Muitas vezes é uma regra que você aprendeu cedo e que continua mandando, mesmo quando custa caro.',
  },
  {
    key: 'provar',
    name: 'A que precisa provar',
    quote: 'Se eu conseguir, ninguém vai duvidar de mim.',
    items: [9, 14],
    text: 'É a mulher que sente que precisa mostrar, o tempo todo, que é capaz. Cada tarefa vira uma prova, e nenhum resultado parece suficiente por muito tempo. O cansaço aqui não vem só do que você faz. Vem do quanto você sente que precisa se provar enquanto faz.',
  },
  {
    key: 'impecavel',
    name: 'A que exige o impecável',
    quote: 'Se não ficou como deveria, não conta.',
    items: [4, 14],
    text: 'É a mulher para quem o "bom o suficiente" não conta. Se não ficou como deveria, é como se não tivesse feito. Isso transforma qualquer tarefa em algo que nunca termina de verdade, e o descanso nunca chega, porque sempre falta um detalhe.',
  },
  {
    key: 'parar',
    name: 'A que não se permite parar',
    quote: 'Eu poderia estar fazendo mais.',
    items: [1, 2, 12],
    text: 'É a mulher que, mesmo parada, sente que poderia estar fazendo mais. Descansar vem com culpa, e a cabeça continua trabalhando quando o corpo finalmente deita. Não é falta de saber descansar. É uma regra interna que diz que parar é ficar devendo.',
  },
  {
    key: 'ultimo',
    name: 'A que fica por último',
    quote: 'Isso é importante pra mim. Mas pode esperar.',
    items: [2, 7, 11],
    text: 'É a mulher que cuida de todo mundo e deixa as próprias necessidades para depois. Ela sabe o que é importante para ela, mas sempre existe algo mais urgente na frente. Com o tempo, esse "depois" vai ficando tão longe que ela mesma começa a se perder de vista.',
  },
]

// Quanto cada raiz aparece nas respostas (0-100). A raiz escolhida por ela recebe um peso extra,
// porque a escolha direta é o sinal mais forte que temos.
function getRootProfile(answers, pickedKey) {
  return ROOTS.map((r) => {
    const avg = r.items.reduce((s, i) => s + (answers[i] ?? 0), 0) / r.items.length
    let pct = Math.round((avg / 4) * 100)
    if (r.key === pickedKey) pct = Math.min(100, pct + 15)
    return { ...r, pct }
  }).sort((a, b) => b.pct - a.pct)
}

// As 3 afirmações que ela marcou com mais intensidade (empate: a que veio primeiro).
function getTopSignals(answers) {
  return answers
    .map((v, i) => ({ v, i }))
    .filter((a) => a.v >= 2)
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .slice(0, 3)
    .map((a) => ({ text: QUESTIONS[a.i], label: SCALE_LABELS[a.v] }))
}

function getResultLevel(score) {
  return RESULT_LEVELS.find((l) => score >= l.min && score <= l.max) || RESULT_LEVELS[0]
}

// Masks input as a Brazilian mobile number with DDD: (11) 99999-9999
function formatWhatsApp(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatTimestampBR() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`
}

// ============ MAIN APP ============
export default function App() {
  const [screen, setScreen] = useState('intro')
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '' })
  const [photoError, setPhotoError] = useState(false)
  const [watchedEnough, setWatchedEnough] = useState(false)
  const [offerInView, setOfferInView] = useState(false)
  const [rootPick, setRootPick] = useState(null)
  const [contextPicks, setContextPicks] = useState([])
  const [duration, setDuration] = useState(null)
  const [openAnswer, setOpenAnswer] = useState('')
  const offerViewedFiredRef = useRef(false)

  useEffect(() => {
    initTracking()
  }, [])

  useEffect(() => {
    if (screen === 'result' || screen === 'intro') setPhotoError(false)
    if (screen !== 'result') {
      setWatchedEnough(false)
      setOfferInView(false)
      offerViewedFiredRef.current = false
    }
  }, [screen])

  // Once she presses play we load YouTube's iframe API and count only the seconds the player is
  // actually PLAYING — ticks, not getCurrentTime(), so skipping ahead does not buy her the bar.
  useEffect(() => {
    // `resultLevel` is declared further down, so key off the rendered iframe instead of it.
    if (screen !== 'result' || watchedEnough) return
    if (!document.getElementById('result-video-player')) return

    let player
    let ticker
    let watched = 0
    let cancelled = false

    const startCounting = () => {
      clearInterval(ticker)
      ticker = setInterval(() => {
        watched += 1
        if (watched >= STICKY_AFTER_SECONDS) {
          clearInterval(ticker)
          setWatchedEnough(true)
        }
      }, 1000)
    }

    const build = () => {
      if (cancelled || !window.YT || !window.YT.Player) return
      player = new window.YT.Player('result-video-player', {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) startCounting()
            else clearInterval(ticker)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      build()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev()
        build()
      }
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    }

    return () => {
      cancelled = true
      clearInterval(ticker)
      if (player && player.destroy) player.destroy()
    }
  }, [screen, watchedEnough])

  // Hide the sticky bar once the real offer block is on screen, so she never sees two buttons
  // for the same thing at the same time. Gated on watchedEnough because the sticky bar itself
  // only exists once watchedEnough is true.
  useEffect(() => {
    if (screen !== 'result' || !watchedEnough) return
    const target = document.querySelector('.offer-bridge')
    if (!target || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      ([entry]) => setOfferInView(entry.isIntersecting),
      { threshold: 0.12 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [screen, watchedEnough])

  // offer_viewed fires once, the first time .offer-bridge enters the viewport — independent of
  // watchedEnough/the sticky bar, since plenty of visitors scroll past without watching 3 min of
  // video and still see (and should count as having viewed) the offer block.
  useEffect(() => {
    if (screen !== 'result') return
    const target = document.querySelector('.offer-bridge')
    if (!target || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !offerViewedFiredRef.current) {
          offerViewedFiredRef.current = true
          track('offer_viewed')
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [screen])

  // The result screen reveals itself on a timed stagger (up to ~3.8s for the CTA). That reads well
  // if you sit and watch, but anyone who scrolls ahead meets a blank page, because the blocks below
  // the fold are still at opacity 0. So: once she scrolls, drop the remaining delays for anything
  // at or near the viewport, and let the stagger play out untouched for anyone who waits.
  useEffect(() => {
    if (screen !== 'result') return

    let observer
    const revealOnScroll = () => {
      window.removeEventListener('scroll', revealOnScroll)
      const pending = document.querySelectorAll(
        '.root-map, .devolutiva-para, .result-video-wrapper, .result-signature, .offer-bridge, .offer-bridge .cta-button'
      )
      if (!('IntersectionObserver' in window)) {
        pending.forEach((el) => el.classList.add('reveal-now'))
        return
      }
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('reveal-now')
            obs.unobserve(entry.target)
          })
        },
        { rootMargin: '0px 0px 25% 0px' }
      )
      pending.forEach((el) => observer.observe(el))
    }

    window.addEventListener('scroll', revealOnScroll, { passive: true, once: false })
    return () => {
      window.removeEventListener('scroll', revealOnScroll)
      if (observer) observer.disconnect()
    }
  }, [screen])

  useEffect(() => {
    if (['name', 'context', 'duration', 'quiz', 'break', 'root', 'open'].includes(screen)) {
      document.body.classList.add('quiz-active')
    } else {
      document.body.classList.remove('quiz-active')
    }
    return () => document.body.classList.remove('quiz-active')
  }, [screen])

  const totalQuestions = QUESTIONS.length
  const STEP_SCREENS = ['name', 'context', 'duration', 'quiz', 'break', 'root', 'open']
  const stepsDone =
    { name: 0, context: 1, duration: 2, root: 21, open: 22 }[screen] ?? 3 + answers.length
  const progress = (stepsDone / 23) * 100

  const handleScreenChange = (newScreen) => setScreen(newScreen)

  const handleAnswerSelect = (value) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (newAnswers.length >= totalQuestions) {
      track('quiz_complete')
      setTimeout(() => handleScreenChange('root'), 400)
    } else if (newAnswers.length % CHAPTER_SIZE === 0) {
      // Fim de uma parte: pausa com um retorno sobre o que ela acabou de responder.
      setTimeout(() => {
        setCurrentQuestion(newAnswers.length)
        handleScreenChange('break')
      }, 400)
    } else {
      setTimeout(() => setCurrentQuestion(newAnswers.length), 400)
    }
  }

  const handleLeadSubmit = (e) => {
    e.preventDefault()
    const score = answers.reduce((a, b) => a + b, 0)
    const level = getResultLevel(score)

    track('lead_submit')

    if (WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoids CORS preflight; Apps Script parses JSON from e.postData.contents
        body: JSON.stringify({
          timestamp: formatTimestampBR(),
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          nivel: level.name,
          pontuacao: score,
          devolutiva: level.devolutiva,
          respostas: answers.map((idx) => SCALE_LABELS[idx]),
        }),
      }).catch((err) => console.warn('Webhook submit failed:', err))
    }

    handleScreenChange('result')
  }

  // `source` is which button fired it — 'bridge' (bottom of the offer block) or 'sticky' (the
  // fixed bar). Both go into the checkout_click event and into the Kiwify URL's utm_content, so
  // a sale can be attributed back to which CTA sold it.
  const handleCheckoutClick = (source) => {
    track('checkout_click', { button: source })
    window.open(buildCheckoutUrl(CHECKOUT_URL, source), '_blank', 'noopener')
  }

  const firstName = formData.nome.trim().split(/\s+/)[0] || ''

  const score = answers.reduce((a, b) => a + b, 0)
  const resultLevel = getResultLevel(score)
  const devolutivaParas = resultLevel.devolutiva.split('\n\n')
  const rootProfile = getRootProfile(answers, rootPick)
  const mainRoot = ROOTS.find((r) => r.key === rootPick) || rootProfile[0]
  const topSignals = getTopSignals(answers)
  const contextPhrase = joinPt(
    CONTEXT_OPTIONS.filter((o) => contextPicks.includes(o.key)).map((o) => o.phrase)
  )
  const durationPhrase = DURATION_OPTIONS.find((o) => o.key === duration)?.phrase
  const showSupportNote = (answers[17] ?? 0) >= 3
  const DEVOLUTIVA_START = 2600
  const videoDelay = DEVOLUTIVA_START + devolutivaParas.length * 150
  const afterVideoDelay = videoDelay + (resultLevel.videoId ? 300 : 0)

  return (
    <div className="app">
      <div className="bg-mesh" aria-hidden="true" />

      {STEP_SCREENS.includes(screen) && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className={`container screen-${screen}`}>
        {/* SCREEN 1 — INTRO */}
        {screen === 'intro' && (
          <section className="screen-content intro-content">
            <span className="intro-tagline">DIAGNÓSTICO GRATUITO</span>
            <div className="headline-divider" aria-hidden="true" />
            <h1 className="headline headline-intro">Escala de Cansaço Emocional Feminino</h1>
            {photoError ? (
              <div className="intro-avatar intro-avatar-fallback" aria-hidden="true">KA</div>
            ) : (
              <img
                src="/karla.jpg"
                alt="Karla Arantes"
                className="intro-avatar intro-avatar-img"
                width={60}
                height={60}
                onError={() => setPhotoError(true)}
              />
            )}
            <p className="intro-credentials">Karla Arantes • Psicóloga Clínica • CRP 04/71970</p>
            <p className="subheadline">
              Este teste foi criado para mulheres que funcionam todos os dias, mas não sabem mais a que custo.
            </p>
            <p className="body-text">Responda com sinceridade. Leva menos de 3 minutos.</p>
            <button
              className="cta-button"
              onClick={() => {
                track('quiz_start')
                handleScreenChange('name')
              }}
            >
              Quero fazer o teste
            </button>
          </section>
        )}

        {/* SCREEN 2 — QUIZ */}
        {screen === 'quiz' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">
                PERGUNTA {currentQuestion + 1} DE {totalQuestions}
              </p>
              <h2 className="question-text">{QUESTIONS[currentQuestion]}</h2>
            </div>
            <div className="scale-cards">
              {SCALE_LABELS.map((label, index) => {
                const isSelected = answers[currentQuestion] === index
                const hasAnswered = answers.length > currentQuestion
                return (
                  <button
                    key={index}
                    type="button"
                    className={`scale-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => !hasAnswered && handleAnswerSelect(index)}
                    disabled={hasAnswered}
                  >
                    <span className="scale-card-label">{label}</span>
                    <span
                      className={`scale-card-indicator scale-card-indicator-${index}`}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ETAPA 0 — NOME (personaliza todo o resto) */}
        {screen === 'name' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">ANTES DE COMEÇAR</p>
              <h2 className="question-text">Como você gosta de ser chamada?</h2>
            </div>
            <form
              className="step-form"
              onSubmit={(e) => {
                e.preventDefault()
                if (formData.nome.trim()) handleScreenChange('context')
              }}
            >
              <input
                type="text"
                placeholder="Seu primeiro nome"
                value={formData.nome}
                onChange={(e) => setFormData((f) => ({ ...f, nome: e.target.value }))}
                className="input-field"
                autoFocus
                required
                data-clarity-mask="true"
              />
              <button type="submit" className="cta-button" disabled={!formData.nome.trim()}>
                Continuar
              </button>
            </form>
          </section>
        )}

        {/* ETAPA 1 — O QUE OCUPA OS DIAS DELA (várias escolhas) */}
        {screen === 'context' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">
                {firstName ? `PRAZER, ${firstName.toUpperCase()}` : 'PRAZER'}
              </p>
              <h2 className="question-text">O que mais ocupa os seus dias hoje?</h2>
              <p className="step-hint">Pode marcar mais de uma opção.</p>
            </div>
            <div className="chip-grid">
              {CONTEXT_OPTIONS.map((o) => {
                const on = contextPicks.includes(o.key)
                return (
                  <button
                    key={o.key}
                    type="button"
                    className={`chip ${on ? 'selected' : ''}`}
                    aria-pressed={on}
                    onClick={() =>
                      setContextPicks((c) => (on ? c.filter((k) => k !== o.key) : [...c, o.key]))
                    }
                  >
                    <span className="chip-check" aria-hidden="true">{on ? '✓' : '+'}</span>
                    {o.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className="cta-button step-next"
              disabled={contextPicks.length === 0}
              onClick={() => handleScreenChange('duration')}
            >
              Continuar
            </button>
          </section>
        )}

        {/* ETAPA 2 — HÁ QUANTO TEMPO */}
        {screen === 'duration' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">MAIS UMA COISA</p>
              <h2 className="question-text">
                Há quanto tempo você sente que está carregando mais do que consegue?
              </h2>
            </div>
            <div className="scale-cards">
              {DURATION_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={`scale-card root-card-option ${duration === o.key ? 'selected' : ''}`}
                  disabled={!!duration}
                  onClick={() => {
                    setDuration(o.key)
                    setTimeout(() => handleScreenChange('break'), 400)
                  }}
                >
                  <span className="scale-card-label">{o.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* PAUSA ENTRE AS PARTES — abre cada bloco de 6 e devolve o que ela acabou de marcar */}
        {screen === 'break' && (() => {
          const part = Math.floor(answers.length / CHAPTER_SIZE) // 0, 1 ou 2
          const last = answers.slice(-CHAPTER_SIZE)
          const heavy = answers.length ? last.filter((v) => v >= 3).length : 0
          return (
            <section className="screen-content chapter-break" key={`break-${part}`}>
              <p className="chapter-count">PARTE {part + 1} DE 3</p>
              <h1 className="headline chapter-title">{CHAPTER_TITLES[part]}</h1>
              {part === 0 ? (
                <p className="subheadline">
                  {firstName}, agora são 18 frases curtas, em três partes. Responda pensando nas
                  últimas semanas, sem pensar demais. Não existe resposta certa.
                </p>
              ) : (
                <>
                  <div className="chapter-dots" aria-hidden="true">
                    {last.map((v, i) => (
                      <span key={i} className={`chapter-dot ${v >= 3 ? 'is-heavy' : ''}`} style={{ animationDelay: `${200 + i * 110}ms` }} />
                    ))}
                  </div>
                  <p className="subheadline">
                    {heavy >= 4
                      ? `Na parte anterior, ${heavy} de 6 frases aparecem com frequência na sua vida. Isso é muita coisa para carregar, ${firstName}. Vamos continuar com calma.`
                      : heavy >= 2
                        ? `Na parte anterior, ${heavy} de 6 frases aparecem com frequência na sua vida. Já dá para ver onde o peso está se acumulando.`
                        : `Na parte anterior, poucas frases aparecem com frequência na sua vida. Vamos ver se isso se repete na próxima parte.`}
                  </p>
                </>
              )}
              <button
                type="button"
                className="cta-button"
                onClick={() => handleScreenChange('quiz')}
              >
                {part === 0 ? 'Começar' : 'Continuar'}
              </button>
            </section>
          )
        })()}

        {/* SCREEN 2.5 — QUAL FRASE MAIS PARECE COM VOCÊ (raiz) */}
        {screen === 'root' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">ÚLTIMA PERGUNTA</p>
              <h2 className="question-text">Qual dessas frases mais parece com você hoje?</h2>
            </div>
            <div className="scale-cards">
              {ROOTS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`scale-card root-card-option ${rootPick === r.key ? 'selected' : ''}`}
                  disabled={!!rootPick}
                  onClick={() => {
                    setRootPick(r.key)
                    setTimeout(() => handleScreenChange('open'), 400)
                  }}
                >
                  <span className="scale-card-label">“{r.quote}”</span>
                </button>
              ))}
            </div>
          </section>
        )}


        {/* ETAPA FINAL — A PERGUNTA ABERTA (opcional, aparece de volta no resultado) */}
        {screen === 'open' && (
          <section className="screen-content quiz-content">
            <div className="question-block">
              <p className="question-number">SE QUISER</p>
              <h2 className="question-text">
                Se você pudesse tirar uma coisa dos seus ombros agora, o que seria?
              </h2>
              <p className="step-hint">Opcional. Só você e a Karla vão ver.</p>
            </div>
            <form
              className="step-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleScreenChange('lead')
              }}
            >
              <textarea
                className="input-field step-textarea"
                rows={3}
                maxLength={280}
                placeholder="Escreva com as suas palavras..."
                value={openAnswer}
                onChange={(e) => setOpenAnswer(e.target.value)}
                data-clarity-mask="true"
              />
              <button type="submit" className="cta-button">
                {openAnswer.trim() ? 'Ver meu resultado' : 'Pular e ver meu resultado'}
              </button>
            </form>
          </section>
        )}

        {/* SCREEN 3 — LEAD CAPTURE */}
        {screen === 'lead' && (
          <section className="screen-content">
            <h1 className="headline">
              {firstName ? `${firstName}, seu resultado está pronto.` : 'Seu resultado está pronto.'}
            </h1>
            <p className="subheadline">
              Deixe seu e-mail e WhatsApp para receber sua análise completa.
            </p>
            <form onSubmit={handleLeadSubmit} className="lead-form" data-clarity-mask="true">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => setFormData((f) => ({ ...f, nome: e.target.value }))}
                required
                className="input-field"
              />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                required
                className="input-field"
              />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData((f) => ({ ...f, whatsapp: formatWhatsApp(e.target.value) }))}
                required
                pattern="\(\d{2}\) \d{5}-\d{4}"
                title="Digite um número de WhatsApp válido com DDD, ex: (11) 99999-9999"
                className="input-field"
              />
              <button type="submit" className="cta-button">
                Ver meu resultado
              </button>
            </form>
            <p className="privacy-text">Seus dados são tratados com sigilo e respeito.</p>
          </section>
        )}

        {/* SCREEN 4 — RESULTS */}
        {screen === 'result' && (
          <section className="screen-content result-content">
            <h1 className="headline">
              {firstName ? `${firstName}, seu resultado chegou.` : 'Seu resultado chegou.'}
            </h1>

            {/* 1. ANIMATED SCORE ARC */}
            <div className="score-arc-section" data-clarity-mask="true">
            <div className="score-arc-wrapper">
              <svg className="score-arc-svg" viewBox="0 0 220 110" width={220} height={110}>
                <defs>
                  <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7A9BB5" />
                    <stop offset="100%" stopColor="#3A5570" />
                  </linearGradient>
                </defs>
                {/* Background arc (unfilled) */}
                <path
                  className="score-arc-bg"
                  d="M 10 110 A 100 100 0 0 1 210 110"
                  fill="none"
                  strokeWidth={12}
                  strokeLinecap="round"
                />
                {/* Filled arc (animates via stroke-dashoffset) */}
                <path
                  className="score-arc-fill"
                  d="M 10 110 A 100 100 0 0 1 210 110"
                  fill="none"
                  stroke="url(#arc-gradient)"
                  strokeWidth={12}
                  strokeLinecap="round"
                  style={{
                    '--arc-final-offset': 314.16 - 314.16 * (score / 72),
                  }}
                />
              </svg>
              <div className="score-arc-center">
                <span className="score-arc-number">{score}</span>
                <span className="score-arc-scale">de 72 pontos</span>
              </div>
              <span className={`level-badge ${resultLevel.badgeClass}`}>{resultLevel.badge}</span>
            </div>
            </div>

            {/* 1.5 MAPA DAS RAÍZES — o bloco dinâmico, montado a partir das respostas dela */}
            <div className="root-map" data-clarity-mask="true">
              <p className="root-map-eyebrow">SEU MAPA DE SOBRECARGA</p>

              {contextPhrase && (
                <p className="root-context" style={{ animationDelay: '850ms' }}>
                  Você concilia <strong>{contextPhrase}</strong>
                  {durationPhrase ? <>, e se sente assim <strong>{durationPhrase}</strong></> : null}.
                  {' '}Foi a partir disso e das suas respostas que montamos este mapa.
                </p>
              )}

              <div className="root-main" style={{ animationDelay: '900ms' }}>
                <span className="root-main-label">Sua raiz mais forte</span>
                <h2 className="root-main-name">{mainRoot.name}</h2>
                <p className="root-main-quote">“{mainRoot.quote}”</p>
                <p className="root-main-text">
                  {firstName ? `${firstName}, n` : 'N'}as suas respostas aparece com força um padrão
                  que eu chamo de “{mainRoot.name.toLowerCase()}”. {mainRoot.text}
                </p>
                {openAnswer.trim() && (
                  <blockquote className="root-open-answer">
                    <span>Você escreveu que tiraria dos seus ombros:</span>
                    “{openAnswer.trim()}”
                  </blockquote>
                )}
              </div>

              <div className="root-bars">
                <p className="root-bars-title">Como cada raiz aparece nas suas respostas</p>
                {rootProfile.map((r, i) => (
                  <div
                    key={r.key}
                    className={`root-bar-row ${r.key === mainRoot.key ? 'is-main' : ''}`}
                    style={{ animationDelay: `${1200 + i * 120}ms` }}
                  >
                    <div className="root-bar-head">
                      <span>{r.name}</span>
                      <span className="root-bar-pct">{r.pct}%</span>
                    </div>
                    <div className="root-bar-track">
                      <div
                        className="root-bar-fill"
                        style={{ '--w': `${r.pct}%`, animationDelay: `${1300 + i * 120}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {topSignals.length > 0 && (
                <div className="root-signals" style={{ animationDelay: '2000ms' }}>
                  <p className="root-bars-title">O que mais pesou nas suas respostas</p>
                  <ul>
                    {topSignals.map((s, i) => (
                      <li key={i}>
                        <span className="root-signal-tag">{s.label}</span>
                        {s.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showSupportNote && (
                <p className="root-support-note">
                  Se em algum momento esse peso ficar grande demais, você não precisa carregá-lo
                  sozinha. O CVV atende de graça, 24 horas, pelo telefone 188 ou pelo site cvv.org.br.
                </p>
              )}
            </div>

            {/* 2. DIVIDER */}
            <div className="result-divider" aria-hidden="true" />

            {/* 3. DEVOLUTIVA TEXT (level-specific intro to the video below) */}
            <div className="devolutiva" data-clarity-mask="true">
              {devolutivaParas.map((para, i) => (
                <p
                  key={i}
                  className="devolutiva-para"
                  style={{ animationDelay: `${DEVOLUTIVA_START + i * 150}ms` }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* 3.5 PERSONAL VIDEO MESSAGE */}
            {resultLevel.videoId && (
              <div className="result-video-wrapper" style={{ animationDelay: `${videoDelay}ms` }}>
                {/* Embed direto, um toque só. Um pôster click-to-play foi tentado e revertido em
                    2026-09-15: no iOS o autoplay com som é bloqueado, então dava dois toques.
                    Fica o domínio -nocookie, que corta as chamadas de anúncio sem custo nenhum,
                    e o enablejsapi, que a barra da oferta usa para contar tempo assistido. */}
                <iframe
                  id="result-video-player"
                  className="result-video"
                  src={`https://www.youtube-nocookie.com/embed/${resultLevel.videoId}?rel=0&enablejsapi=1&playsinline=1`}
                  title={resultLevel.videoTitle || `Mensagem em vídeo de Karla Arantes — ${resultLevel.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* 5. CLOSING SIGNATURE */}
            <div
              className="result-signature"
              style={{
                animationDelay: `${afterVideoDelay + 300}ms`,
              }}
            >
              <div className="result-signature-divider" aria-hidden="true" />
              <div className="result-signature-block">
                {photoError ? (
                  <div className="result-signature-photo-fallback" aria-hidden="true">KA</div>
                ) : (
                  <img
                    src="/karla.jpg"
                    alt="Karla Arantes"
                    className="result-signature-photo"
                    width={80}
                    height={80}
                    onError={() => setPhotoError(true)}
                  />
                )}
                <div className="result-signature-text">
                  <span className="result-signature-name">Karla Arantes</span>
                  <span className="result-signature-cred">Psicóloga Clínica • CRP 04/71970</span>
                </div>
              </div>
            </div>

            {/* 6. PONTE PARA O LOW TICKET (Raiz da Sobrecarga) */}
            <section
              className="offer-bridge"
              style={{ '--cta-delay': `${afterVideoDelay + 900}ms` }}
              aria-labelledby="offer-bridge-title"
            >
              <div className="offer-bridge-divider" aria-hidden="true" />
              <h2 className="offer-bridge-title" id="offer-bridge-title">
                Você já descobriu o quanto está sobrecarregada.
              </h2>
              <p className="offer-bridge-para">
                Mas o seu nível de sobrecarga responde apenas uma parte da pergunta.
              </p>
              <p className="offer-bridge-para">Talvez tenha ficado outra:</p>
              <p className="offer-bridge-question">
                “Por que eu continuo funcionando dessa maneira mesmo quando sei que estou cansada?”
              </p>
              <p className="offer-bridge-para">
                A resposta pode estar na forma como você aprendeu a responder às demandas, às pessoas e
                às suas próprias necessidades.
              </p>
              <p className="offer-bridge-para">
                O seu padrão, <strong>{mainRoot.name.toLowerCase()}</strong>, tem uma origem e um
                ciclo que o mantém. É isso que vamos investigar no <strong>Raiz da Sobrecarga®</strong>.
              </p>
              <p className="offer-bridge-para offer-bridge-para-last">
                Uma experiência guiada de autorreflexão para ajudar você a perceber o padrão que
                aparece com mais força no seu funcionamento.
              </p>
              <span className="cta-nudge-arrow">👇</span>
              <button
                className="cta-button cta-result"
                onClick={() => handleCheckoutClick('bridge')}
                style={{
                  '--cta-delay': `${afterVideoDelay + 900}ms`,
                }}
              >
                Quero descobrir minha raiz
              </button>
            </section>

            {/* Barra fixa da oferta — só depois de 3 min de aula assistida, e some quando o bloco
                da oferta aparece na tela, para nunca haver dois botões iguais ao mesmo tempo. */}
            {watchedEnough &&
              /* Precisa sair via portal para o body: a seção do resultado tem `transform` (da
                 animação de entrada), e um ancestral com transform vira o bloco de referência do
                 `position: fixed` — dentro dela a barra ancorava na seção, fora da tela. */
              createPortal(
                <div
                  className={`offer-sticky${offerInView ? ' is-hidden' : ''}`}
                  role="region"
                  aria-label="Raiz da Sobrecarga"
                >
                  <span className="offer-sticky-label">
                    Raiz da Sobrecarga<sup>®</sup>
                  </span>
                  <button
                    type="button"
                    className="offer-sticky-btn"
                    onClick={() => handleCheckoutClick('sticky')}
                  >
                    Quero descobrir minha raiz
                  </button>
                </div>,
                document.body
              )}
          </section>
        )}
      </main>
    </div>
  )
}
