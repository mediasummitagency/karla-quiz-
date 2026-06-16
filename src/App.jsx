import { useState, useEffect } from 'react'

// ============ CONFIGURATION (update these as needed) ============
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyzvpm7uPCkeyLx3nZYOJ_3t5bDU6xw9wD7H6_30r9ZyHniVJHLrA1lZOMYY8G2wNfHEQ/exec'
const WHATSAPP_PHONE = '5534999358461'

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
    devolutiva:
      'Recebi suas respostas com atenção e cuidado. Obrigada por se permitir olhar para si com honestidade.\n\nDe acordo com seus resultados, você se encontra em nível leve de sobrecarga emocional.\n\nIsso significa que há sinais iniciais de cansaço mental e acúmulo de demandas, mas ainda existe preservação importante de energia, funcionamento e clareza emocional.\n\nNo cotidiano, esse nível costuma aparecer como irritação pontual, dificuldade leve de concentração, sensação de estar sempre "um pouco atrasada" e necessidade constante de dar conta de tudo.\n\nVocê pode estar sentindo que está segurando bem, mas com esforço maior do que gostaria. E isso já merece atenção.\n\nQuando a sobrecarga leve não é cuidada, ela tende a se tornar silenciosa. Pequenas tensões acumuladas começam a afetar sono, alimentação, organização e até a forma como você se relaciona.\n\nA psicoterapia, nesse estágio, atua de forma preventiva e estratégica. Trabalhamos organização mental, definição de limites, reestruturação de pensamentos automáticos e construção de micro-hábitos de autorregulação emocional.\n\nÉ o momento ideal para aprender a distribuir melhor suas responsabilidades antes que o peso aumente.\n\nMinha recomendação profissional é iniciar o acompanhamento agora, enquanto há energia para mudanças mais leves e estruturais.\n\nSe desejar, posso te explicar como funciona o processo terapêutico, frequência dos encontros, investimento e próximos passos para começarmos com segurança e clareza.\n\nCuidar agora é escolher não precisar apagar incêndios depois.',
  },
  {
    min: 19,
    max: 36,
    name: 'Sobrecarga em Alerta',
    badge: 'Alerta',
    badgeClass: 'level-alerta',
    devolutiva:
      'Obrigada por confiar no processo e responder com sinceridade.\n\nSeu resultado indica nível de sobrecarga emocional em alerta.\n\nEsse estágio revela que o cansaço mental já está impactando áreas importantes da sua vida. Não é apenas um dia difícil — é um padrão que começa a se repetir.\n\nNo cotidiano, isso pode se manifestar como exaustão constante, dificuldade para descansar sem culpa, sensação de estar sempre devendo algo, lapsos de memória, choro fácil ou irritação frequente.\n\nÉ comum que você esteja funcionando "no automático", resolvendo tudo, mas sentindo que está sempre no limite.\n\nEssa experiência é legítima. Muitas mulheres aprendem a normalizar esse estado, mas ele não é saudável quando se torna permanente.\n\nSem cuidado, o nível em alerta tende a evoluir para quadros de ansiedade mais intensa, sintomas depressivos ou somatizações físicas.\n\nA psicoterapia aqui tem papel estruturante. Trabalhamos identificação de gatilhos, manejo da sobrecarga cognitiva, reorganização de prioridades, construção de limites e regulação emocional consistente.\n\nO objetivo não é apenas aliviar sintomas, mas reorganizar seu modo de funcionamento.\n\nMinha orientação é iniciar acompanhamento neste momento. Esperar "melhorar sozinha" costuma prolongar o desgaste.\n\nSe fizer sentido para você, posso explicar como funcionam as sessões, valores, frequência e disponibilidade para começarmos de forma organizada e segura.\n\nVocê não precisa sustentar tudo sozinha.',
  },
  {
    min: 37,
    max: 54,
    name: 'Sobrecarga Elevada',
    badge: 'Elevada',
    badgeClass: 'level-elevada',
    devolutiva:
      'Agradeço sua confiança ao responder o diagnóstico.\n\nSeu resultado indica nível elevado de sobrecarga emocional.\n\nEsse nível aponta que o cansaço mental já está significativamente impactando sua energia, seu humor e possivelmente sua saúde física.\n\nNo cotidiano, pode haver sensação constante de esgotamento, dificuldade para dormir ou acordar descansada, irritabilidade intensa, perda de prazer em atividades que antes eram neutras ou agradáveis, além de pensamentos recorrentes de incapacidade ou insuficiência.\n\nVocê pode estar se sentindo drenada, como se qualquer nova demanda fosse excessiva. É compreensível que, nesse estágio, surjam sentimentos de culpa por não conseguir manter o mesmo ritmo de antes.\n\nQuando não há intervenção, a sobrecarga elevada tende a evoluir para quadros mais estruturados de ansiedade crônica, burnout ou depressão.\n\nA psicoterapia nesse nível atua de forma mais ativa: estabilização emocional, redução de pensamentos disfuncionais, reorganização de rotina, construção de limites claros e desenvolvimento de estratégias práticas de recuperação de energia.\n\nAqui, não falamos apenas de organização — falamos de restauração.\n\nMinha recomendação clínica é iniciar acompanhamento o quanto antes, para evitar agravamento e acelerar o processo de recuperação emocional.\n\nSe desejar, posso detalhar como funciona o início do processo, valores, frequência das sessões e disponibilidade atual.\n\nCuidar agora é interromper um ciclo que já está cobrando um preço alto.',
  },
  {
    min: 55,
    max: 72,
    name: 'Exaustão Crítica',
    badge: 'Crítica',
    badgeClass: 'level-critica',
    devolutiva:
      'Quero começar reconhecendo sua coragem por responder este diagnóstico.\n\nSeu resultado indica nível crítico de sobrecarga emocional.\n\nIsso significa que o esgotamento mental está em um ponto de risco significativo e pode estar afetando de maneira intensa seu funcionamento diário.\n\nEsse estado não é fraqueza. Ele é resultado de acúmulo prolongado sem suporte adequado.\n\nNesse estágio, é comum haver sensação constante de exaustão extrema, dificuldade de concentração severa, choro frequente ou bloqueio emocional, sensação de vazio, desesperança ou desejo de se afastar de tudo.\n\nVocê pode estar sentindo que está no limite absoluto.\n\nSem cuidado imediato, o nível crítico pode evoluir para quadros depressivos importantes, crises de ansiedade recorrentes ou sintomas físicos mais graves.\n\nA psicoterapia, nesse momento, atua como espaço estruturante e de estabilização. Trabalhamos segurança emocional, redução de risco, organização mínima da rotina, construção de suporte e intervenção direta sobre pensamentos automáticos intensos.\n\nO foco inicial é estabilizar e recuperar segurança interna.\n\nMinha orientação profissional é iniciar acompanhamento com prioridade. Esse não é um momento de esperar passar.\n\nSe estiver pronta, posso explicar disponibilidade imediata, valores, frequência indicada e próximos passos para começarmos o quanto antes.\n\nVocê não precisa atravessar esse nível sozinha. Existe cuidado possível — e ele pode começar agora.',
  },
]

function getResultLevel(score) {
  return RESULT_LEVELS.find((l) => score >= l.min && score <= l.max) || RESULT_LEVELS[0]
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

  useEffect(() => {
    if (screen === 'result' || screen === 'intro') setPhotoError(false)
  }, [screen])

  useEffect(() => {
    if (screen === 'quiz') {
      document.body.classList.add('quiz-active')
    } else {
      document.body.classList.remove('quiz-active')
    }
    return () => document.body.classList.remove('quiz-active')
  }, [screen])

  const totalQuestions = QUESTIONS.length
  const progress = totalQuestions > 0 ? (answers.length / totalQuestions) * 100 : 0

  const handleScreenChange = (newScreen) => setScreen(newScreen)

  const handleAnswerSelect = (value) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (newAnswers.length >= totalQuestions) {
      setTimeout(() => handleScreenChange('lead'), 400)
    } else {
      setTimeout(() => setCurrentQuestion(newAnswers.length), 400)
    }
  }

  const handleLeadSubmit = (e) => {
    e.preventDefault()
    const score = answers.reduce((a, b) => a + b, 0)
    const level = getResultLevel(score)

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

  const handleWhatsAppClick = () => {
    const score = answers.reduce((a, b) => a + b, 0)
    const level = getResultLevel(score)
    const firstName = formData.nome.trim().split(/\s+/)[0] || ''
    const message = `Olá Karla, me chamo ${firstName}. Acabei de fazer o teste e meu resultado foi ${level.name}. Gostaria de conversar.`
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const firstName = formData.nome.trim().split(/\s+/)[0] || ''

  const score = answers.reduce((a, b) => a + b, 0)
  const resultLevel = getResultLevel(score)

  return (
    <div className="app">
      <div className="bg-mesh" aria-hidden="true" />

      {screen === 'quiz' && (
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
            <button className="cta-button" onClick={() => handleScreenChange('quiz')}>
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

        {/* SCREEN 3 — LEAD CAPTURE */}
        {screen === 'lead' && (
          <section className="screen-content">
            <h1 className="headline">Seu resultado está pronto.</h1>
            <p className="subheadline">
              Coloque seu nome e WhatsApp para acessar sua análise personalizada.
            </p>
            <form onSubmit={handleLeadSubmit} className="lead-form">
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
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData((f) => ({ ...f, whatsapp: e.target.value }))}
                required
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
            <div className="score-arc-section">
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
                <span className="score-arc-ratio">
                  <span className="score-arc-ratio-score">{score}</span>
                  <span className="score-arc-ratio-rest"> / 72</span>
                </span>
                <span className="score-arc-label">pontos</span>
              </div>
              <span className={`level-badge ${resultLevel.badgeClass}`}>{resultLevel.badge}</span>
            </div>
            </div>

            {/* 2. DIVIDER */}
            <div className="result-divider" aria-hidden="true" />

            {/* 3. WARM INTRO LINE */}
            <p
              className="result-intro-line"
              style={{ animationDelay: '1400ms' }}
            >
              {firstName ? (
                <>
                  {firstName}, obrigada por se permitir olhar para si com honestidade. Aqui está o que seus resultados revelam:
                </>
              ) : (
                <>
                  Obrigada por se permitir olhar para si com honestidade. Aqui está o que seus resultados revelam:
                </>
              )}
            </p>

            {/* 4. DEVOLUTIVA TEXT */}
            <div className="devolutiva">
              {resultLevel.devolutiva.split('\n\n').map((para, i) => (
                <p key={i} className="devolutiva-para" style={{ animationDelay: `${1400 + i * 150}ms` }}>
                  {para}
                </p>
              ))}
            </div>

            {/* 5. CLOSING SIGNATURE */}
            <div
              className="result-signature"
              style={{
                animationDelay: `${1400 + resultLevel.devolutiva.split('\n\n').length * 150 + 300}ms`,
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

            {/* 6. CTA NUDGE + BUTTON */}
            <div className="cta-nudge" style={{ '--cta-delay': `${1400 + resultLevel.devolutiva.split('\n\n').length * 150 + 700 + 200}ms` }}>
              <p className="cta-nudge-text">Estou pronta para dar meu próximo passo</p>
              <span className="cta-nudge-arrow">↓</span>
            </div>
            <button
              className="cta-button cta-result"
              onClick={handleWhatsAppClick}
              style={{
                '--cta-delay': `${1400 + resultLevel.devolutiva.split('\n\n').length * 150 + 700 + 200}ms`,
              }}
            >
              Quero conversar com a Karla
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
