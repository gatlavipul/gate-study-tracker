import type { MockQuestion, QuestionType } from './sampleMock'
import type { SubjectPhase } from '../store/useAppStore'

const mapTopicToPhase = (topic: string): SubjectPhase => {
  const t = topic.toLowerCase()
  if (t.includes('c:') || t.includes('ds:') || t.includes('algo:')) return 'Programming'
  if (t.includes('math:')) return 'Math'
  if (t.includes('os:')) return 'OS'
  if (t.includes('dbms:')) return 'DBMS'
  if (t.includes('cn:')) return 'Networks'
  if (t.includes('toc:')) return 'TOC'
  if (t.includes('compiler:')) return 'Compiler'
  if (t.includes('coa:')) return 'COA'
  if (t.includes('digital:')) return 'DigitalLogic'
  if (t.includes('aptitude:')) return 'Aptitude'
  return 'Programming' // fallback
}

const generateDummyOptions = (topic: string, index: number, type: QuestionType): string[] => {
  if (type === 'NAT') return []
  
  const concepts = [
    `Concept A regarding ${topic}`,
    `O(N log N) complexity`,
    `Optimal substructure for ${topic}`,
    `Deadlock prevention`,
    `Normal form BCNF`,
    `Turing decidable`,
    `Context Free Grammar`,
    `Pipeline stall cycles`,
    `TCP Congestion Window`,
    `Eigenvalue property`
  ]
  
  return [
    concepts[(index * 3) % concepts.length],
    concepts[(index * 3 + 1) % concepts.length],
    concepts[(index * 3 + 2) % concepts.length],
    `None of the above`
  ]
}

export const generateTopicPYQs = (topic: string, count: number = 15): MockQuestion[] => {
  const questions: MockQuestion[] = []
  
  for (let i = 0; i < count; i++) {
    // Determine random question type
    const rand = Math.random()
    let type: QuestionType = 'MCQ'
    if (rand > 0.7) type = 'MSQ'
    else if (rand > 0.5) type = 'NAT'

    const isTwoMark = Math.random() > 0.5
    const marks = isTwoMark ? 2 : 1
    const negativeMarks = type === 'NAT' || type === 'MSQ' ? 0 : (isTwoMark ? 0.66 : 0.33)

    const options = generateDummyOptions(topic, i, type)
    
    let correctAnswer: string | string[] = ''
    
    if (type === 'MCQ') {
      correctAnswer = options[Math.floor(Math.random() * 4)]
    } else if (type === 'MSQ') {
      correctAnswer = [options[0], options[1]] // Dummy MSQ answers
    } else {
      correctAnswer = (Math.floor(Math.random() * 100) + 1).toString()
    }

    questions.push({
      id: `pyq-${topic.replace(/[^a-zA-Z0-9]/g, '')}-${i}`,
      subject: mapTopicToPhase(topic),
      type,
      text: `Previous Year Question ${i + 1} for ${topic}.\n\nConsider the properties of ${topic.split(' ')[0] || 'the system'}. Which of the following is correct given the standard constraints of GATE problems?`,
      options: type !== 'NAT' ? options : undefined,
      correctAnswer,
      marks,
      negativeMarks
    })
  }

  return questions
}
