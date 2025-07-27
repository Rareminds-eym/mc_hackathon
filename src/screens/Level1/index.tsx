import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BingoGame from '../BingoGame';
import { module4Level1Questions } from '../../data/Level1';
import { module3Level1Questions } from '../../data/Level1/module3';
import { module2Level1Questions } from '../../data/Level1/module2';
import { module1Level1Questions } from '../../data/Level1/module1';
// Import other module question sets as needed

// Map moduleId to question data
const level1QuestionsMap: Record<string, any> = {
  '1': module1Level1Questions, // Default: BingoGame uses its own data for Module 1
  '2': module2Level1Questions,
  '3': module3Level1Questions,
  '4': module4Level1Questions,
  // Add more modules as needed
};

const Level1Index: React.FC = () => {
  // Support route: /modules/:moduleId/levels/:levelId
  const { moduleId, levelId } = useParams<{ moduleId: string; levelId: string }>();
  const navigate = useNavigate();

  // Log params for debugging
  console.log('[Level1Index] Route params:', { moduleId, levelId });

  // Use moduleId to select questions
  const questions = moduleId ? level1QuestionsMap[moduleId] : undefined;


  console.log('[Level1Index] moduleId:', moduleId);
  console.log('[Level1Index] questions length:', questions.length);
  console.log('[Level1Index] last question:', questions[questions.length - 1]);


  // Pass both moduleId and questions to BingoGame
  return <BingoGame moduleId={moduleId} questions={questions} />;
};

export default Level1Index;
