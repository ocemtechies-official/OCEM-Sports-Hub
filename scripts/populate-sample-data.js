#!/usr/bin/env node
/**
 * Script to populate Supabase database with sample data for OCEM Sports Hub
 * Run with: node scripts/populate-sample-data.js
 */

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const sports = [
  { name: 'Cricket', icon: '🏏' },
  { name: 'Football', icon: '⚽' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Badminton', icon: '🏸' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Chess', icon: '♟️' }
];

const teams = [
  { name: 'Thunderbolts', color: '#3b82f6' },
  { name: 'Fire Dragons', color: '#ef4444' },
  { name: 'Mountain Eagles', color: '#10b981' },
  { name: 'Ocean Waves', color: '#0ea5e9' },
  { name: 'Forest Rangers', color: '#84cc16' },
  { name: 'Desert Scorpions', color: '#f59e0b' },
  { name: 'Ice Vikings', color: '#60a5fa' },
  { name: 'Solar Flares', color: '#f97316' }
];

const quizzes = [
  {
    title: 'Sports History Quiz',
    description: 'Test your knowledge of sports history from ancient times to present',
    difficulty: 'medium',
    time_limit: 600,
    is_active: true
  },
  {
    title: 'Football Rules & Regulations',
    description: 'How well do you know the official rules of football?',
    difficulty: 'hard',
    time_limit: 900,
    is_active: true
  },
  {
    title: 'Cricket Trivia Challenge',
    description: 'From test matches to T20 - prove your cricket knowledge',
    difficulty: 'easy',
    time_limit: 480,
    is_active: true
  }
];

const quizQuestions = [
  {
    question_text: 'In which year were the first modern Olympic Games held?',
    question_type: 'multiple_choice',
    options: '["1896", "1900", "1888", "1924"]',
    correct_answer: '1896',
    points: 10,
    order_index: 1,
    quiz_title: 'Sports History Quiz'
  },
  {
    question_text: 'Which country has won the most FIFA World Cup titles?',
    question_type: 'multiple_choice',
    options: '["Brazil", "Germany", "Italy", "Argentina"]',
    correct_answer: 'Brazil',
    points: 10,
    order_index: 2,
    quiz_title: 'Sports History Quiz'
  },
  {
    question_text: 'How long is a standard football match?',
    question_type: 'multiple_choice',
    options: '["90 minutes", "80 minutes", "100 minutes", "120 minutes"]',
    correct_answer: '90 minutes',
    points: 15,
    order_index: 1,
    quiz_title: 'Football Rules & Regulations'
  }
];

const chessGames = [
  {
    game_type: 'online',
    status: 'completed',
    result: 'white_wins',
    fen_position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
  },
  {
    game_type: 'online',
    status: 'completed',
    result: 'black_wins',
    fen_position: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1'
  }
];

async function populateSampleData() {
  console.log('Populating sample data...');

  try {
    // Insert sports
    console.log('Inserting sports...');
    const { data: sportsData, error: sportsError } = await supabase
      .from('sports')
      .upsert(sports, { onConflict: 'name' });
    
    if (sportsError) {
      console.error('Error inserting sports:', sportsError);
      return;
    }
    console.log(`Inserted sports:`, sportsData);

    // Insert teams
    console.log('Inserting teams...');
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .upsert(teams, { onConflict: 'name' });
    
    if (teamsError) {
      console.error('Error inserting teams:', teamsError);
      return;
    }
    console.log(`Inserted teams:`, teamsData);

    // Get inserted sports and teams for foreign key references
    const { data: insertedSports, error: sportsSelectError } = await supabase.from('sports').select('id, name');
    if (sportsSelectError) {
      console.error('Error fetching sports:', sportsSelectError);
      return;
    }
    
    const { data: insertedTeams, error: teamsSelectError } = await supabase.from('teams').select('id, name');
    if (teamsSelectError) {
      console.error('Error fetching teams:', teamsSelectError);
      return;
    }

    console.log('Fetched sports:', insertedSports);
    console.log('Fetched teams:', insertedTeams);

    // Insert sample fixtures
    console.log('Inserting fixtures...');
    if (insertedSports && insertedTeams && insertedSports.length > 0 && insertedTeams.length > 0) {
      const fixtures = [
        {
          sport_id: insertedSports.find(s => s.name === 'Cricket')?.id,
          team_a_id: insertedTeams.find(t => t.name === 'Thunderbolts')?.id,
          team_b_id: insertedTeams.find(t => t.name === 'Fire Dragons')?.id,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          venue: 'Main Stadium',
          status: 'scheduled',
          team_a_score: 0,
          team_b_score: 0
        },
        {
          sport_id: insertedSports.find(s => s.name === 'Football')?.id,
          team_a_id: insertedTeams.find(t => t.name === 'Mountain Eagles')?.id,
          team_b_id: insertedTeams.find(t => t.name === 'Ocean Waves')?.id,
          scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          venue: 'Football Field A',
          status: 'scheduled',
          team_a_score: 0,
          team_b_score: 0
        }
      ];

      const { data: fixturesData, error: fixturesError } = await supabase
        .from('fixtures')
        .upsert(fixtures);
      
      if (fixturesError) {
        console.error('Error inserting fixtures:', fixturesError);
      } else {
        console.log(`Inserted fixtures:`, fixturesData);
      }
    }

    // Insert quizzes
    console.log('Inserting quizzes...');
    const { data: quizzesData, error: quizzesError } = await supabase
      .from('quizzes')
      .upsert(quizzes, { onConflict: 'title' });
    
    if (quizzesError) {
      console.error('Error inserting quizzes:', quizzesError);
      return;
    }
    console.log(`Inserted quizzes:`, quizzesData);

    // Get inserted quizzes for foreign key references
    const { data: insertedQuizzes, error: quizzesSelectError } = await supabase.from('quizzes').select('id, title');
    if (quizzesSelectError) {
      console.error('Error fetching quizzes:', quizzesSelectError);
      return;
    }

    // Insert quiz questions
    console.log('Inserting quiz questions...');
    if (insertedQuizzes && insertedQuizzes.length > 0) {
      const questionsToInsert = quizQuestions.map(question => {
        const quiz = insertedQuizzes.find(q => q.title === question.quiz_title);
        return {
          quiz_id: quiz?.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          correct_answer: question.correct_answer,
          points: question.points,
          order_index: question.order_index
        };
      }).filter(q => q.quiz_id); // Filter out questions with missing quiz IDs

      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .upsert(questionsToInsert);
      
      if (questionsError) {
        console.error('Error inserting quiz questions:', questionsError);
      } else {
        console.log(`Inserted quiz questions:`, questionsData);
      }
    }

    // Insert chess games
    console.log('Inserting chess games...');
    const { data: chessData, error: chessError } = await supabase
      .from('chess_games')
      .upsert(chessGames);
    
    if (chessError) {
      console.error('Error inserting chess games:', chessError);
      return;
    }
    console.log(`Inserted chess games:`, chessData);

    console.log('Sample data population completed successfully!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}

// Run the script
populateSampleData();