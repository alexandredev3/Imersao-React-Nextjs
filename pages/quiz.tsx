import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';

import db from '../db.json';
import api from '../services/api';
import LoadingWidget from '../src/components/LoadingWidget';
import QuestionWidget from '../src/components/QuestionWidget';
import QuizBackground from '../src/components/QuizBackground';
import QuizContainer from '../src/components/QuizContainer';
import QuizLogo from '../src/components/QuizLogo';
import Widget from '../src/components/Widget';

interface Props {
  results: Array<boolean>;
}

interface Questions {
  image: string;
  title: string;
  description: string;
  answer: number;
  alternatives: string[];
}

function ResultWidget({ results }: Props) {
  const { query } = useRouter();

  const correctAlternatives = results.filter((result) => result).length;
  const totalPoints = correctAlternatives * 100;

  return (
    <Widget>
      <Widget.Header>Tela de Resultado:</Widget.Header>

      <Widget.Content>
        {totalPoints === 0 ? (
          <>
            <p>Estude mais, {query.name}!</p>
            <h1>Você fez 0 pontos, que pena :(</h1>
          </>
        ) : (
          <>
            <p>Mandou bem, {query.name}!</p>
            <h1>Você fez {totalPoints} pontos, Parabéns :)</h1>
          </>
        )}
        <ul>
          {results.map((result, index) => {
            const resultId = `result__${index}`;
            const resultPosition = index + 1;
            const resultPositionHasTwoSquares = resultPosition < 10 && '0';

            return (
              <li key={resultId}>
                #{resultPositionHasTwoSquares}
                {resultPosition} Resultado:{' '}
                {result ? 'Acertou Viseravel!' : 'Errou!'}
              </li>
            );
          })}
        </ul>
      </Widget.Content>
    </Widget>
  );
}

export default function QuizPage() {
  const { QUIZ, LOADING, RESULT } = {
    QUIZ: 'QUIZ',
    LOADING: 'LOADING',
    RESULT: 'RESULT',
  };

  const [screenState, setScreenState] = useState(LOADING);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState<Array<boolean>>([]);
  const [questions, setQuestions] = useState<Questions[]>([]);

  const questionIndex = currentQuestion;
  const question = questions[questionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    api
      .get('/db')
      .then((response) => {
        const data = response.data.questions;

        setQuestions(data);
        return setScreenState(QUIZ);
      })
      .catch((error) => {
        alert(
          'Ocorreu um error inesperado durante o processo de carregar as perguntas.'
        );
        console.log(error);
      });
  }, []);

  const handleAddResult = useCallback(
    (result: boolean) => {
      return setResults([...results, result]);
    },
    [results]
  );

  const handleSubmitQuiz = useCallback(() => {
    const nextQuestion = questionIndex + 1;

    if (nextQuestion < totalQuestions) {
      return setCurrentQuestion(nextQuestion);
    }

    return setScreenState(RESULT);
  }, [questionIndex, currentQuestion, questions]);

  return (
    <>
      <Head>
        <title>AluraQuiz - Modelo Base</title>
      </Head>
      <QuizBackground backgroundImage={db.bg}>
        <QuizContainer>
          <QuizLogo className="logo" />
          {screenState === 'LOADING' && <LoadingWidget />}

          {screenState === 'QUIZ' && (
            <QuestionWidget
              question={question}
              totalQuestions={totalQuestions}
              questionIndex={questionIndex}
              onSubmit={handleSubmitQuiz}
              handleAddResult={handleAddResult}
            />
          )}

          {screenState === 'RESULT' && <ResultWidget results={results} />}
        </QuizContainer>
      </QuizBackground>
    </>
  );
}
