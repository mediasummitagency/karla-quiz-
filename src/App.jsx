import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { initTracking, track, buildCheckoutUrl } from './tracking'

// ============ CONFIGURATION (update these as needed) ============
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyzvpm7uPCkeyLx3nZYOJ_3t5bDU6xw9wD7H6_30r9ZyHniVJHLrA1lZOMYY8G2wNfHEQ/exec'
// Checkout do low ticket "Raiz da Sobrecarga" (Kiwify)
const CHECKOUT_URL = 'https://pay.kiwify.com.br/zftB1uv'

// ============ RAIZ DA SOBRECARGA — RESULT PAGE CONTENT ============
// Comando da Karla: _workspace/inputs/2026-09-24-karla-comando-pagina-resultado.md
// Bloco 6: um segundo vídeo específico de apresentação do Raiz (não a devolutiva do Bloco 2).
// Vazio = o bloco inteiro não renderiza — a Karla proíbe placeholders (regras 19-23).
const RAIZ_VIDEO_ID = ''
// Bloco 11: 2 a 4 depoimentos reais e autorizados. Nunca inventar. Vazio = bloco não renderiza.
const TESTIMONIALS = [] // [{ quote: '', name: '' }]
// Bloco 15: imagens reais do produto. Nunca placeholder. Vazio = bloco não renderiza.
const PRODUCT_SHOTS = [] // [{ label: '', caption: '' }]

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

function getResultLevel(score) {
  return RESULT_LEVELS.find((l) => score >= l.min && score <= l.max) || RESULT_LEVELS[0]
}

// ============ ETAPAS INTERATIVAS (não pontuam; só personalizam o resultado e o lead) ============
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

// Telas com barra de progresso: nome, contexto, duração, 18 perguntas (com pausas), pergunta aberta.
const STEP_SCREENS = ['name', 'context', 'duration', 'quiz', 'break', 'open']
const TOTAL_STEPS = 22

// A raiz NÃO é revelada de graça (decisão 2026-09-25): a Escala responde "o quanto", o Raiz pago
// responde "o que pode estar alimentando" (regra 41 do comando da Karla). O preview que revelava a
// raiz ficou no branch preview/escala-interativa.

function joinPt(list) {
  if (list.length <= 1) return list.join('')
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`
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

// ============ RAIZ DA SOBRECARGA — RESULT PAGE COPY (verbatim from Karla's brief) ============
const BLOCK1_PARAS = [
  'O seu resultado mostra o quanto a sobrecarga está presente na sua vida neste momento.',
  'Mas ele não mostra tudo.',
  'Ele não mostra o que acontece dentro de você quando uma nova demanda aparece.',
  'Não mostra por que algumas coisas parecem tão difíceis de recusar, delegar ou deixar para depois.',
  'E não mostra por que, mesmo quando você sabe que está cansada, pode continuar funcionando da mesma maneira.',
]

const BLOCK3_PARAS = [
  'Por que você continua funcionando dessa maneira, mesmo quando já sabe que está cansada?',
  'Talvez você já tenha tentado descansar mais.',
  'Organizar melhor a rotina.',
  'Fazer listas.',
  'Criar hábitos.',
  'Colocar limites.',
  'E talvez algumas dessas coisas até tenham funcionado por algum tempo.',
  'Mas depois você voltou para o mesmo lugar.',
  'Não necessariamente porque falta organização.',
  'Nem porque falta força de vontade.',
  'Talvez exista uma forma aprendida de responder às demandas, às expectativas e às próprias necessidades que continua funcionando mesmo quando você já percebeu que está cansada.',
]

const BLOCK4_PARAS = [
  'Porque nem sempre o que mantém uma mulher sobrecarregada é apenas a quantidade de coisas que ela precisa fazer.',
  'Às vezes, existe uma forma aprendida de responder às demandas, às expectativas e às próprias necessidades.',
  'E enquanto esse funcionamento permanece automático, você pode continuar tentando resolver a superfície sem perceber o que está por trás dela.',
]

const BLOCK5_PARAS = [
  'Uma experiência guiada de autorreflexão para ajudar você a identificar o padrão que aparece com mais força na sua forma de responder às demandas, às expectativas e às próprias necessidades.',
  'O Raiz parte das suas respostas e conduz você para uma camada mais profunda de compreensão.',
  'Não é outra escala para medir o quanto você está cansada.',
  'É uma experiência para começar a investigar:',
  'Como você costuma responder quando uma demanda aparece.',
  'O que acontece dentro de você antes de dizer "sim", assumir, adiar ou continuar.',
  'Quais pensamentos e emoções podem estar participando desse funcionamento.',
  'E qual pode ser um primeiro movimento possível.',
]

const BLOCK7_PHRASES = [
  '"Se eu não fizer, ninguém faz."',
  '"Eu preciso provar que consigo."',
  '"Se não ficou como deveria, não está bom."',
  '"Eu poderia estar fazendo mais."',
  '"Isso é importante para mim. Mas pode esperar."',
]

const BLOCK8_LINES = ['Você resolve.', 'Entrega.', 'Cuida.', 'Antecipa.', 'Assume.', 'Adia suas próprias necessidades.', 'Continua.']

const ROOT_ITEMS = [
  { quote: '"Se eu não resolver, ninguém resolve."', name: 'A que precisa dar conta' },
  { quote: '"Se eu conseguir, ninguém vai duvidar de mim."', name: 'A que precisa provar' },
  { quote: '"Se não ficou como deveria, não conta."', name: 'A que precisa fazer perfeito' },
  { quote: '"Eu poderia estar fazendo mais."', name: 'A que precisa estar sempre avançando' },
  { quote: '"Isso é importante para mim. Mas pode esperar."', name: 'A que se coloca por último' },
]

const RAIZ_IS_ITEMS = [
  'identificar o padrão que aparece com mais força;',
  'compreender como esse padrão pode participar da sua sobrecarga;',
  'reconhecer o ciclo de pensamentos, emoções e comportamentos envolvidos;',
  'experimentar um primeiro movimento possível na vida real.',
]

const STEP_ITEMS = [
  { n: 1, k: 'SINAL', text: 'O que está pesando em você agora.' },
  { n: 2, k: 'RAIZ', text: 'O padrão que pode estar alimentando a forma como você responde.' },
  {
    n: 3,
    k: 'CICLO',
    text: 'Pensamento, emoção e comportamento, para você perceber o que pode manter a sobrecarga acontecendo.',
  },
  { n: 4, k: 'DIREÇÃO', text: 'Um primeiro movimento pequeno e concreto, que faça sentido para você.' },
]

const DELIVER_ITEMS = [
  {
    k: 'SEU MAPA DE PADRÃO',
    text: 'Uma devolutiva correspondente ao padrão que apareceu com mais força nas suas respostas.',
  },
  {
    k: 'A EXPLICAÇÃO DA SUA RAIZ',
    text: 'Uma reflexão sobre por que determinadas situações podem despertar cobrança, culpa, controle ou dificuldade de se priorizar.',
  },
  {
    k: 'O DESENHO DO SEU CICLO',
    text: 'Uma representação de pensamento, emoção e comportamento para você enxergar o que pode manter a sobrecarga acontecendo.',
  },
  {
    k: 'SEU PRIMEIRO MOVIMENTO',
    text: 'Uma prática pequena e concreta, em vez de uma lista interminável de hábitos.',
  },
  { k: 'EXERCÍCIOS DE REFLEXÃO', text: 'Perguntas para levar o que você percebeu para a sua vida real.' },
]

const FIT_ITEMS = [
  'Está cansada de precisar dar conta de tudo.',
  'Sabe que deveria se colocar na própria lista, mas na prática não consegue sustentar isso.',
  'Quer entender o que está acontecendo antes de tentar mais uma técnica.',
  'Percebe que algumas formas de responder às demandas se repetem, mesmo quando você sabe que está cansada.',
]

const NOT_ITEMS = [
  'Terapia ou diagnóstico psicológico.',
  'Uma promessa de eliminar a sobrecarga.',
  'Uma fórmula para fazer você simplesmente "dar conta melhor".',
  'Mais uma rotina para você conseguir cumprir.',
]

const OFFER_LIST_ITEMS = [
  'identificar o padrão que aparece com mais força;',
  'compreender como ele pode participar da sua sobrecarga;',
  'enxergar o ciclo que sustenta esse funcionamento;',
  'experimentar um primeiro movimento possível.',
]

const FAQ_ITEMS = [
  {
    q: 'Isso é terapia?',
    a: [
      'Não.',
      'O Raiz da Sobrecarga® é uma experiência guiada de psicoeducação e autorreflexão.',
      'Ele não é diagnóstico psicológico e não substitui psicoterapia.',
    ],
  },
  {
    q: 'E se eu não me identificar com o resultado?',
    a: [
      'O resultado representa o padrão que apareceu com mais força nas suas respostas.',
      'Você pode perceber elementos de outros padrões também.',
      'A proposta não é colocar você em uma caixa, mas oferecer uma hipótese de reflexão para que você observe o que faz sentido na sua vida.',
    ],
  },
  {
    q: 'Como eu recebo?',
    a: ['Após a confirmação do pagamento, você recebe acesso à Área de Membros e as orientações para começar.'],
  },
  {
    q: 'Quanto tempo leva?',
    a: [
      'A experiência começa com o questionário de autorreflexão.',
      'Depois, você pode fazer as etapas ao longo de 7 dias, no seu próprio ritmo.',
    ],
  },
  {
    q: 'Preciso fazer tudo de uma vez?',
    a: ['Não.', 'A proposta é justamente observar, refletir e experimentar aos poucos.'],
  },
  {
    q: 'E se eu já faço terapia?',
    a: [
      'O Raiz pode ser utilizado como uma experiência de autorreflexão.',
      'Se você já faz psicoterapia, pode conversar com sua psicóloga sobre como as percepções que surgirem aqui se relacionam ao seu processo.',
    ],
  },
]

const CLOSE_PARAS = [
  'Talvez você continue tentando resolver a sobrecarga apenas pela superfície.',
  'Mais organização.',
  'Mais planejamento.',
  'Mais esforço.',
  'Mais uma tentativa de dar conta.',
  'Mas talvez esteja na hora de olhar para a forma como você aprendeu a responder às demandas, às expectativas e às suas próprias necessidades.',
  'Você não precisa mudar tudo hoje.',
  'Precisa apenas começar a enxergar.',
]

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
  // Barra fixa da oferta (regra 33 do comando da Karla, decisão 2026-09-24): não é mais um
  // gate por tempo de vídeo assistido. Aparece depois que o Bloco 5 (primeiro CTA) já passou
  // pela tela uma vez, e some sempre que qualquer um dos 4 blocos de CTA está visível.
  const [stickyRevealed, setStickyRevealed] = useState(false)
  const [ctaBlockVisible, setCtaBlockVisible] = useState(false)
  const [selectedRoots, setSelectedRoots] = useState(() => new Set())
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
      setStickyRevealed(false)
      setCtaBlockVisible(false)
      setSelectedRoots(new Set())
      offerViewedFiredRef.current = false
    }
  }, [screen])

  const toggleRoot = (i) => {
    setSelectedRoots((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  // Bloco 5 (.rr-block5) é o primeiro momento de CTA da página (regra 33: só depois de ver o
  // resultado, a devolutiva, a lacuna e conhecer o Raiz). offer_viewed dispara junto, uma única
  // vez, pois é o primeiro bloco de oferta real da página.
  useEffect(() => {
    if (screen !== 'result') return
    const target = document.querySelector('.rr-block5')
    if (!target || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setStickyRevealed(true)
        if (!offerViewedFiredRef.current) {
          offerViewedFiredRef.current = true
          track('offer_viewed')
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [screen])

  // Esconde a barra fixa sempre que qualquer um dos 4 blocos de CTA está na tela, para nunca
  // haver dois botões iguais ao mesmo tempo.
  useEffect(() => {
    if (screen !== 'result' || !stickyRevealed) return
    const anchors = document.querySelectorAll('.rr-cta-anchor')
    if (!anchors.length || !('IntersectionObserver' in window)) return
    const visible = new Set()
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target)
          else visible.delete(entry.target)
        })
        setCtaBlockVisible(visible.size > 0)
      },
      { threshold: 0.15 }
    )
    anchors.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [screen, stickyRevealed])

  useEffect(() => {
    if (STEP_SCREENS.includes(screen)) {
      document.body.classList.add('quiz-active')
    } else {
      document.body.classList.remove('quiz-active')
    }
    return () => document.body.classList.remove('quiz-active')
  }, [screen])

  const totalQuestions = QUESTIONS.length
  const stepsDone = { name: 0, context: 1, duration: 2, open: 21 }[screen] ?? 3 + answers.length
  const progress = (stepsDone / TOTAL_STEPS) * 100

  const handleScreenChange = (newScreen) => setScreen(newScreen)

  const handleAnswerSelect = (value) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (newAnswers.length >= totalQuestions) {
      track('quiz_complete')
      setTimeout(() => handleScreenChange('open'), 400)
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
          // Campos das etapas interativas. O Code.gs grava depois do Q18, então as colunas
          // antigas (e o Zap do WhatsApp, que lê por nome) não mudam de lugar.
          contexto: CONTEXT_OPTIONS.filter((o) => contextPicks.includes(o.key))
            .map((o) => o.label)
            .join(', '),
          tempo: DURATION_OPTIONS.find((o) => o.key === duration)?.label || '',
          resposta_aberta: openAnswer.trim(),
        }),
      }).catch((err) => console.warn('Webhook submit failed:', err))
    }

    handleScreenChange('result')
  }

  // `source` is which of the 4 CTAs fired it ('cta1'..'cta4') or 'sticky' for the fixed bar.
  // Goes into the checkout_click event and into the Kiwify URL's utm_content, so a sale can be
  // attributed back to which CTA sold it.
  const handleCheckoutClick = (source) => {
    track('checkout_click', { button: source })
    window.open(buildCheckoutUrl(CHECKOUT_URL, source), '_blank', 'noopener')
  }

  const firstName = formData.nome.trim().split(/\s+/)[0] || ''

  const score = answers.reduce((a, b) => a + b, 0)
  const resultLevel = getResultLevel(score)
  const topSignals = getTopSignals(answers)
  const contextPhrase = joinPt(
    CONTEXT_OPTIONS.filter((o) => contextPicks.includes(o.key)).map((o) => o.phrase)
  )
  const durationPhrase = DURATION_OPTIONS.find((o) => o.key === duration)?.phrase
  // Pergunta 18: "Já pensei que não aguento manter esse ritmo por muito tempo."
  const showSupportNote = (answers[17] ?? 0) >= 3

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
            <div className="check-list">
              {CONTEXT_OPTIONS.map((o) => {
                const on = contextPicks.includes(o.key)
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="checkbox"
                    className={`check-option ${on ? 'selected' : ''}`}
                    aria-checked={on}
                    onClick={() =>
                      setContextPicks((c) => (on ? c.filter((k) => k !== o.key) : [...c, o.key]))
                    }
                  >
                    <span className="check-box" aria-hidden="true" />
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
                  className={`scale-card step-card-option ${duration === o.key ? 'selected' : ''}`}
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

        {/* SCREEN 3 — LEAD CAPTURE (o nome já veio da etapa 0) */}
        {screen === 'lead' && (
          <section className="screen-content">
            <h1 className="headline">
              {firstName ? `${firstName}, seu resultado está pronto.` : 'Seu resultado está pronto.'}
            </h1>
            <p className="subheadline">
              Deixe seu e-mail e WhatsApp para acessar seu resultado.
            </p>
            <form onSubmit={handleLeadSubmit} className="lead-form" data-clarity-mask="true">
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

        {/* SCREEN 4 — RESULTADO + DEVOLUTIVA + OFERTA DO RAIZ DA SOBRECARGA */}
        {screen === 'result' && (
          <section className="screen-content result-content">
            <div className="rr">
              {/* BLOCO 1 — Resultado da Escala */}
              <div className="rr-band">
                <div className="rr-inner">
                  <h1 className="rr-h1" data-clarity-mask="true">
                    {firstName ? `${firstName}, agora` : 'Agora'} você sabe o quanto está sobrecarregada.
                  </h1>
                  <p className="rr-lead">
                    Sua pontuação mostra a intensidade da sua sobrecarga neste momento.
                  </p>

                  <div className="rr-result-card">
                  <div className="score-arc-section" data-clarity-mask="true">
                    <span className="rr-level-label">Seu nível</span>
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
                        <span className="score-arc-scale">/ 72</span>
                      </div>
                      <span className={`level-badge ${resultLevel.badgeClass}`}>{resultLevel.badge}</span>
                    </div>
                    <p className="rr-h3" style={{ textAlign: 'center' }}>
                      {resultLevel.name}
                    </p>
                  </div>
                  </div>

                  {/* Retrato das respostas dela (etapas interativas). Fica no "o quanto": mostra o
                      que pesou, nunca a raiz, que é o que o Raiz pago investiga. */}
                  {(contextPhrase || topSignals.length > 0 || openAnswer.trim()) && (
                    <div className="rr-card rr-portrait" data-clarity-mask="true">
                      <span className="rr-card-k">O que apareceu nas suas respostas</span>
                      {contextPhrase && (
                        <p className="rr-p">
                          Você concilia <strong>{contextPhrase}</strong>
                          {durationPhrase ? <>, e se sente assim <strong>{durationPhrase}</strong></> : null}.
                        </p>
                      )}
                      {topSignals.length > 0 && (
                        <ul className="rr-signals">
                          {topSignals.map((s, i) => (
                            <li key={i}>
                              <span className="rr-signal-tag">{s.label}</span>
                              {s.text}
                            </li>
                          ))}
                        </ul>
                      )}
                      {openAnswer.trim() && (
                        <blockquote className="rr-open-answer">
                          <span>Você escreveu que tiraria dos seus ombros:</span>
                          “{openAnswer.trim()}”
                        </blockquote>
                      )}
                      {showSupportNote && (
                        <p className="rr-support-note">
                          Se em algum momento esse peso ficar grande demais, você não precisa carregá-lo
                          sozinha. O CVV atende de graça, 24 horas, pelo telefone 188 ou pelo site
                          cvv.org.br.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rr-stack rr-measure">
                    <p className="rr-p">{BLOCK1_PARAS[0]}</p>
                    <p className="rr-p">
                      <strong>{BLOCK1_PARAS[1]}</strong>
                    </p>
                    <ul className="rr-dash">
                      {BLOCK1_PARAS.slice(2).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="rr-big">
                    Você já sabe o quanto está sobrecarregada.
                    <br />
                    Agora existe uma <mark>outra pergunta.</mark>
                  </p>
                </div>
              </div>

              {/* BLOCO 2 — Devolutiva da Escala */}
              <div className="rr-band">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Sua devolutiva</span>
                  <h2 className="rr-h2">Entenda o seu resultado.</h2>
                  <p className="rr-lead">Agora que você viu sua pontuação, assista à sua devolutiva.</p>
                  <p className="rr-p rr-measure">
                    Neste vídeo, eu explico o que o seu nível de sobrecarga pode significar e o que pode
                    acontecer quando esse funcionamento começa a fazer parte da rotina.
                  </p>

                  {resultLevel.videoId && (
                    <div className="rr-video-col">
                    <div className="result-video-wrapper" style={{ margin: '8px auto 0' }}>
                      {/* Embed direto, um toque só (aprendido em 2026-09-15: pôster click-to-play
                          custa dois toques no iOS). -nocookie corta as chamadas de anúncio. */}
                      <iframe
                        className="result-video"
                        src={`https://www.youtube-nocookie.com/embed/${resultLevel.videoId}?rel=0&playsinline=1`}
                        title={resultLevel.videoTitle || `Devolutiva em vídeo de Karla Arantes — ${resultLevel.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="rr-sig">
                      <img src="/karla.jpg" alt="Karla Arantes" width={48} height={48} />
                      <div>
                        <b>Karla Arantes</b>
                        <span>Psicóloga Clínica · CRP 04/71970</span>
                      </div>
                    </div>
                    </div>
                  )}

                  <p className="rr-quote-xl" style={{ marginTop: 8 }}>
                    Seu resultado mostrou o quanto você está sobrecarregada.
                    <br />
                    Agora talvez tenha surgido outra pergunta.
                  </p>
                </div>
              </div>

              {/* BLOCO 3 — A grande lacuna */}
              <div className="rr-band rr-band-dark">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Agora você sabe o quanto.</span>
                  <h2 className="rr-h2">Mas talvez ainda queira entender por quê.</h2>
                  <p className="rr-quote-xl">{BLOCK3_PARAS[0]}</p>
                  <div className="rr-stack rr-measure">
                    <p className="rr-p">{BLOCK3_PARAS[1]}</p>
                    <ul className="rr-pills">
                      {BLOCK3_PARAS.slice(2, 6).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                    <p className="rr-p">
                      {BLOCK3_PARAS[6]} {BLOCK3_PARAS[7]}
                    </p>
                    <p className="rr-p">
                      <strong>{BLOCK3_PARAS[8]}</strong> <strong>{BLOCK3_PARAS[9]}</strong>
                    </p>
                    <p className="rr-p">{BLOCK3_PARAS[10]}</p>
                  </div>
                  <div className="rr-card rr-card-dark">
                    <span className="rr-card-k">O resultado mostrou o quanto.</span>
                    <p className="rr-p">Agora existe uma próxima pergunta:</p>
                    <p className="rr-big">
                      <mark>O que pode estar alimentando esse padrão?</mark>
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCO 4 — A grande tese */}
              <div className="rr-band rr-band-dark">
                <div className="rr-inner">
                  <h2 className="rr-h2 rr-h2-hero">
                    O cansaço que o fim de semana não resolve <mark>pode ter uma raiz.</mark>
                  </h2>
                  <p className="rr-lede-italic">E talvez ela não esteja na sua agenda.</p>
                  <div className="rr-stack rr-measure">
                    {BLOCK4_PARAS.map((p, i) => (
                      <p key={i} className="rr-p">
                        {p}
                      </p>
                    ))}
                  </div>
                  <p className="rr-quote-xl">
                    Você não precisa mudar tudo hoje.
                    <br />
                    Talvez precise começar entendendo o que está acontecendo.
                  </p>
                </div>
              </div>

              {/* BLOCO 5 — Apresentação do Raiz — CTA 1 */}
              <div className="rr-band rr-block5 rr-cta-anchor">
                <div className="rr-inner rr-cta-block rr-left">
                  <span className="rr-eyebrow">O próximo passo da sua devolutiva</span>
                  <h2 className="rr-h2">
                    É por isso que eu criei o Raiz da Sobrecarga<sup>®</sup>.
                  </h2>
                  <div className="rr-stack rr-measure">
                    <p className="rr-lead">{BLOCK5_PARAS[0]}</p>
                    <p className="rr-p">{BLOCK5_PARAS[1]}</p>
                    <p className="rr-p">
                      <strong>{BLOCK5_PARAS[2]}</strong> {BLOCK5_PARAS[3]}
                    </p>
                  </div>
                  <ol className="rr-numlist">
                    {BLOCK5_PARAS.slice(4).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                  <div className="rr-card">
                    <span className="rr-card-k">Nada de texto genérico.</span>
                    <p className="rr-p">
                      A experiência é organizada a partir do{' '}
                      <mark>padrão que aparece com mais força nas suas respostas.</mark>
                    </p>
                  </div>
                  <button className="rr-cta-btn" onClick={() => handleCheckoutClick('cta1')}>
                    Quero descobrir o que está por trás da minha sobrecarga
                  </button>
                </div>
              </div>

              {/* BLOCO 6 — Segundo vídeo do Raiz (só existe se houver conteúdo real) */}
              {RAIZ_VIDEO_ID && (
                <div className="rr-band">
                  <div className="rr-inner">
                    <h2 className="rr-h2" style={{ textAlign: 'center' }}>
                      Antes de continuar, eu quero te mostrar uma coisa.
                    </h2>
                    <div className="result-video-wrapper" style={{ margin: '8px auto 0' }}>
                      <iframe
                        className="result-video"
                        src={`https://www.youtube-nocookie.com/embed/${RAIZ_VIDEO_ID}?rel=0&playsinline=1`}
                        title="Apresentação do Raiz da Sobrecarga"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="rr-p">
                      Talvez você tenha passado muito tempo tentando resolver a sobrecarga pela agenda.
                    </p>
                    <p className="rr-p">Mas talvez exista algo acontecendo antes da agenda.</p>
                  </div>
                </div>
              )}

              {/* BLOCO 7 — Por que você funciona assim? */}
              <div className="rr-band">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Por que você funciona assim?</span>
                  <h2 className="rr-h2">Talvez o problema não seja falta de organização.</h2>
                  <div className="rr-stack rr-measure">
                    <p className="rr-lead">
                      Você já tentou se organizar. Talvez tenha planejado, listado, priorizado e
                      reorganizado a rotina inúmeras vezes. E ainda assim continua se sentindo
                      sobrecarregada.
                    </p>
                    <p className="rr-p">
                      Porque sobrecarga não é apenas acúmulo de tarefas. Às vezes, existe uma{' '}
                      <strong>regra interna</strong> orientando a maneira como você responde ao que
                      precisa ser feito.
                    </p>
                  </div>
                  <div className="rr-phrases">
                    {BLOCK7_PHRASES.map((t, i) => (
                      <p key={i} className="rr-phrase">
                        {t}
                      </p>
                    ))}
                  </div>
                  <div className="rr-stack rr-measure">
                    <p className="rr-p">
                      <strong>Essas regras não aparecem do nada.</strong> Elas podem ser formas
                      aprendidas de lidar com demandas, expectativas, culpa, medo, responsabilidade e
                      necessidade de reconhecimento.
                    </p>
                    <p className="rr-p">E quando uma demanda aparece, o ciclo pode começar.</p>
                  </div>
                </div>
              </div>

              {/* BLOCO 8 — Ciclo da sobrecarga */}
              <div className="rr-band rr-band-alt">
                <div className="rr-inner">
                  <div className="rr-cycle">
                    <svg
                      viewBox="0 0 340 300"
                      role="img"
                      aria-label="Demanda leva a pensamento, que leva a emoção, que leva a comportamento, que leva a sobrecarga, que volta para uma nova demanda"
                    >
                      <defs>
                        <marker
                          id="rr-ah"
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="7"
                          markerHeight="7"
                          orient="auto-start-reverse"
                        >
                          <path className="rr-ahead" d="M0,0 L10,5 L0,10 z" />
                        </marker>
                      </defs>
                      <path className="rr-arrow" d="M 222 34 Q 272 48 284 108" markerEnd="url(#rr-ah)" />
                      <path className="rr-arrow" d="M 284 156 Q 282 210 262 238" markerEnd="url(#rr-ah)" />
                      <path className="rr-arrow" d="M 198 262 L 150 262" markerEnd="url(#rr-ah)" />
                      <path className="rr-arrow" d="M 66 240 Q 52 200 56 158" markerEnd="url(#rr-ah)" />
                      <path className="rr-arrow" d="M 58 110 Q 66 50 116 36" markerEnd="url(#rr-ah)" />
                      <rect className="rr-node" x="120" y="16" width="100" height="40" rx="20" />
                      <text x="170" y="41" textAnchor="middle">
                        Demanda
                      </text>
                      <rect className="rr-node" x="232" y="112" width="104" height="40" rx="20" />
                      <text x="284" y="137" textAnchor="middle">
                        Pensamento
                      </text>
                      <rect className="rr-node" x="200" y="242" width="100" height="40" rx="20" />
                      <text x="250" y="267" textAnchor="middle">
                        Emoção
                      </text>
                      <rect className="rr-node" x="18" y="242" width="126" height="40" rx="20" />
                      <text x="81" y="267" textAnchor="middle">
                        Comportamento
                      </text>
                      <rect className="rr-node rr-node-hot" x="4" y="112" width="104" height="40" rx="20" />
                      <text x="56" y="137" textAnchor="middle">
                        Sobrecarga
                      </text>
                      <text
                        x="170"
                        y="142"
                        textAnchor="middle"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontSize: 15,
                          fontWeight: 500,
                          fill: 'var(--color-primary-dark)',
                        }}
                      >
                        nova demanda
                      </text>
                    </svg>
                    <p className="rr-cycle-cap">O ciclo da sobrecarga</p>
                  </div>
                  <h2 className="rr-h2">O ciclo da sobrecarga.</h2>
                  <p className="rr-p rr-measure">
                    O problema nem sempre termina quando a demanda termina. Porque o padrão que orientou
                    a sua resposta pode continuar funcionando.
                  </p>
                  <ul className="rr-pills">
                    {BLOCK8_LINES.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <p className="rr-p">
                    <strong>E então a sobrecarga volta.</strong>
                  </p>
                  <p className="rr-big">
                    É assim que você pode acabar{' '}
                    <mark>confundindo sobrecarga com responsabilidade.</mark>
                  </p>
                  <p className="rr-quote-xl">Mas um padrão aprendido não precisa continuar invisível.</p>
                </div>
              </div>

              {/* BLOCO 9 — As 5 raízes */}
              <div className="rr-band">
                <div className="rr-inner">
                  <span className="rr-eyebrow">As 5 raízes da sobrecarga</span>
                  <h2 className="rr-h2">Talvez sua sobrecarga tenha uma raiz que você nunca percebeu.</h2>
                  <div className="rr-stack">
                    <p className="rr-lead">
                      <strong>Qual destas frases parece mais familiar?</strong>
                    </p>
                    <p className="rr-p">
                      Você não precisa escolher agora. Mas provavelmente uma delas vai incomodar um pouco
                      mais.
                    </p>
                  </div>
                  <div className="rr-roots">
                    {ROOT_ITEMS.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        className="rr-root-chip"
                        aria-pressed={selectedRoots.has(i)}
                        onClick={() => toggleRoot(i)}
                      >
                        <span className="rr-box" aria-hidden="true" />
                        <span>
                          <span className="rr-root-quote">{r.quote}</span>
                          <span className="rr-root-name">{r.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="rr-card rr-card-navy">
                    <p className="rr-p">
                      <strong>Talvez você tenha se reconhecido em mais de uma. Isso é possível.</strong>
                    </p>
                    <p className="rr-p">
                      A proposta do Raiz não é colocar você em uma caixa. É identificar o padrão que
                      aparece com mais força nas suas respostas e começar a observar como ele funciona na
                      sua vida.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCO 10 — CTA após as 5 raízes — CTA 2 */}
              <div className="rr-band rr-band-dark rr-cta-anchor">
                <div className="rr-inner rr-cta-block rr-center">
                  <h2 className="rr-h2">Você acabou de reconhecer algumas possibilidades.</h2>
                  <p className="rr-lead">
                    Mas reconhecer uma frase é diferente de <mark>compreender o padrão</mark> que existe por
                    trás dela.
                  </p>
                  <p className="rr-p">
                    O Raiz da Sobrecarga® foi criado para ajudar você a fazer justamente essa investigação.
                  </p>
                  <p className="rr-p">
                    Você vai identificar qual padrão apareceu com mais força nas suas respostas, compreender
                    como ele pode participar da sua sobrecarga e começar a observar esse funcionamento na
                    vida real.
                  </p>
                  <button className="rr-cta-btn" onClick={() => handleCheckoutClick('cta2')}>
                    Quero descobrir minha raiz
                  </button>
                  <p className="rr-cta-micro">Acesso digital imediato • R$47 • Garantia de 7 dias</p>
                </div>
              </div>

              {/* BLOCO 11 — Prova social (só existe com depoimentos reais e autorizados) */}
              {TESTIMONIALS.length > 0 && (
                <div className="rr-band">
                  <div className="rr-inner">
                    <span className="rr-eyebrow">Você não está sozinha</span>
                    <h2 className="rr-h2">
                      Quando você começa a enxergar o padrão, algumas coisas passam a fazer sentido.
                    </h2>
                    <p className="rr-lead">
                      O que mulheres perceberam depois de olhar para a própria sobrecarga
                    </p>
                    <div className="rr-tgrid">
                      {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="rr-tcard">
                          <p>{t.quote}</p>
                          <span>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCO 12 — O que é o Raiz + BLOCO 13 — Os 4 movimentos */}
              <div className="rr-band rr-band-dark">
                <div className="rr-inner">
                  <span className="rr-eyebrow">O próximo passo</span>
                  <h2 className="rr-h2">
                    Agora você pode começar a entender o que pode estar por trás do seu resultado.
                  </h2>
                  <p className="rr-lead">
                    O Raiz da Sobrecarga® é uma experiência guiada de autorreflexão. Ela foi criada para
                    ajudar você a:
                  </p>
                  <ul className="rr-checklist">
                    {RAIZ_IS_ITEMS.map((t, i) => (
                      <li key={i}>
                        <span className="rr-checkmark" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="rr-quote-xl">
                    Não é uma promessa de mudar sua vida em alguns dias. É um primeiro espaço para enxergar
                    algo que talvez tenha acontecido no automático por muito tempo.
                  </p>
                  <div className="rr-steps">
                    {STEP_ITEMS.map((s) => (
                      <div key={s.n} className="rr-step">
                        <span className="rr-step-n">{s.n}</span>
                        <span className="rr-step-k">{s.k}</span>
                        <p>{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCO 14 — O que você recebe */}
              <div className="rr-band">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Tudo o que você recebe</span>
                  <h2 className="rr-h2">Tudo parte do seu resultado.</h2>
                  <ul className="rr-deliver">
                    {DELIVER_ITEMS.map((d, i) => (
                      <li key={i}>
                        <span className="rr-check" aria-hidden="true" />
                        <span>
                          <b>{d.k}</b>
                          <span>{d.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BLOCO 15 — Por dentro do guia (só existe com imagens reais) */}
              {PRODUCT_SHOTS.length > 0 && (
                <div className="rr-band rr-band-alt">
                  <div className="rr-inner">
                    <span className="rr-eyebrow">Por dentro do guia</span>
                    <h2 className="rr-h2">Veja como ele é por dentro.</h2>
                    <div className="rr-shots">
                      {PRODUCT_SHOTS.map((s, i) => (
                        <div key={i} className="rr-shot">
                          <span>
                            {s.label}
                            <br />
                            {s.caption}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCO 16 — É para você se */}
              <div className="rr-band">
                <div className="rr-inner">
                  <h2 className="rr-h2">É para você se...</h2>
                  <ul className="rr-checklist">
                    {FIT_ITEMS.map((t, i) => (
                      <li key={i}>
                        <span className="rr-checkmark" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BLOCO 17 — O Raiz não é */}
              <div className="rr-band rr-band-alt">
                <div className="rr-inner">
                  <h2 className="rr-h2">O Raiz não é...</h2>
                  <ul className="rr-xlist">
                    {NOT_ITEMS.map((t, i) => (
                      <li key={i}>
                        <span className="rr-xmark" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="rr-p rr-measure">
                    O Raiz da Sobrecarga® é uma experiência de psicoeducação e autorreflexão. Se você vive
                    um sofrimento psicológico intenso, esta experiência não substitui acompanhamento
                    profissional individual.
                  </p>
                </div>
              </div>

              {/* BLOCO 18 — Oferta — CTA 3 */}
              <div className="rr-band rr-cta-anchor">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Comece pela raiz</span>
                  <h2 className="rr-h2">Você não precisa mudar a sua vida inteira hoje.</h2>
                  <p className="rr-lead">
                    Só precisa começar a entender o que está acontecendo. O Raiz da Sobrecarga® foi criado
                    para ser esse primeiro movimento.
                  </p>
                  <p className="rr-p">
                    <strong>Dentro da experiência, você vai:</strong>
                  </p>
                  <ul className="rr-checklist">
                    {OFFER_LIST_ITEMS.map((t, i) => (
                      <li key={i}>
                        <span className="rr-checkmark" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="rr-pricecard">
                    <h3 className="rr-pricecard-name">
                      Raiz da Sobrecarga<sup>®</sup>
                    </h3>
                    <div className="rr-price">
                      <span className="rr-price-sub">Pagamento único</span>
                      <span className="rr-price-main">
                        <small>R$</small>47
                      </span>
                      <span className="rr-price-sub">Pix ou até 3x no cartão</span>
                    </div>
                    <button className="rr-cta-btn" onClick={() => handleCheckoutClick('cta3')}>
                      Quero começar pela raiz
                    </button>
                    <p className="rr-cta-micro">Garantia de 7 dias • Pagamento seguro • Acesso imediato</p>
                  </div>
                </div>
              </div>

              {/* BLOCO 19 — Garantia */}
              <div className="rr-band">
                <div className="rr-inner">
                  <h2 className="rr-h2">Você pode experimentar com tranquilidade.</h2>
                  <div className="rr-guarantee-card">
                    <span className="rr-shield" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#D4B896" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l7 3v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6l7-3z" />
                        <path d="M8.8 12.2l2.2 2.2 4.2-4.6" />
                      </svg>
                    </span>
                    <p>
                      <b>Garantia de 7 dias</b>
                      Você tem 7 dias para acessar a experiência, conhecer o material e começar o primeiro
                      exercício. Se perceber que o Raiz da Sobrecarga® não faz sentido para você, poderá
                      solicitar o reembolso dentro do prazo de garantia.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCO 20 — Perguntas frequentes */}
              <div className="rr-band rr-band-alt">
                <div className="rr-inner">
                  <span className="rr-eyebrow">Perguntas frequentes</span>
                  <h2 className="rr-h2">Ainda com dúvida?</h2>
                  <div className="rr-faq">
                    {FAQ_ITEMS.map((f, i) => (
                      <details key={i}>
                        <summary>{f.q}</summary>
                        {f.a.map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </details>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCO 21 — Fechamento final — CTA 4 */}
              <div className="rr-band rr-band-dark rr-cta-anchor">
                <div className="rr-inner rr-close">
                  <span className="rr-eyebrow">Agora você já sabe que está sobrecarregada.</span>
                  <h2 className="rr-h2">A próxima pergunta é o que pode estar por trás disso.</h2>
                  <p className="rr-p">{CLOSE_PARAS[0]}</p>
                  <ul className="rr-pills rr-pills-center">
                    {CLOSE_PARAS.slice(1, 5).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  <p className="rr-p">{CLOSE_PARAS[5]}</p>
                  <p className="rr-quote-xl">
                    {CLOSE_PARAS[6]} {CLOSE_PARAS[7]}
                  </p>
                  <p className="rr-big">
                    <mark>Comece pela raiz.</mark>
                  </p>
                  <button className="rr-cta-btn" onClick={() => handleCheckoutClick('cta4')}>
                    Quero começar pela raiz — R$47
                  </button>
                  <p className="rr-cta-micro">Acesso imediato • Garantia de 7 dias</p>
                  <p className="rr-ps">
                    P.S. Você já passou tempo demais tentando resolver apenas a superfície.
                    <br />
                    Talvez agora seja hora de entender o que está por trás dela.
                  </p>
                  <p className="rr-disclaimer">
                    Raiz da Sobrecarga® é uma experiência de psicoeducação e autorreflexão e não substitui
                    acompanhamento psicológico individual.
                  </p>
                </div>
              </div>
            </div>

            {/* Barra fixa da oferta — aparece depois que o Bloco 5 (1º CTA) já passou pela tela
                uma vez, e some sempre que um dos 4 blocos de CTA está visível. */}
            {stickyRevealed &&
              /* Precisa sair via portal para o body: a seção do resultado tem `transform` (da
                 animação de entrada), e um ancestral com transform vira o bloco de referência do
                 `position: fixed` — dentro dela a barra ancorava na seção, fora da tela. */
              createPortal(
                <div
                  className={`offer-sticky${ctaBlockVisible ? ' is-hidden' : ''}`}
                  role="region"
                  aria-label="Raiz da Sobrecarga"
                >
                  <span className="offer-sticky-label">
                    Raiz da Sobrecarga<sup>®</sup> · R$47 · garantia de 7 dias
                  </span>
                  <button
                    type="button"
                    className="offer-sticky-btn"
                    onClick={() => handleCheckoutClick('sticky')}
                  >
                    Quero começar pela raiz
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
