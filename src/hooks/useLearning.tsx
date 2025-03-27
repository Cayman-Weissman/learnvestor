
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';

type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
};

type Progress = {
  userId: string;
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentComplete: number;
  lastAccessed: Date;
  timeSpent: number; // in minutes
};

type LearningContextType = {
  topics: Topic[];
  userProgress: Progress[];
  portfolioValue: number;
  portfolioChange: number;
  portfolioChangePercent: number;
  loadTopics: () => Promise<void>;
  getTopicById: (id: string) => Topic | undefined;
  getProgressForTopic: (topicId: string) => Progress | undefined;
  updateProgress: (topicId: string, update: Partial<Progress>) => Promise<void>;
  dailyActivity: { day: string; value: number }[];
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

// Sample data
const mockTopics: Topic[] = [
  {
    id: 'topic-1',
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of machine learning algorithms and applications.',
    category: 'Computer Science',
    popularity: 950,
    difficulty: 'beginner',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-10'),
  },
  {
    id: 'topic-2',
    title: 'Advanced Calculus',
    description: 'Explore advanced calculus concepts including limits, derivatives, and integrals.',
    category: 'Mathematics',
    popularity: 780,
    difficulty: 'advanced',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-02-20'),
  },
  {
    id: 'topic-3',
    title: 'Modern Physics',
    description: 'Discover quantum mechanics, relativity, and other modern physics topics.',
    category: 'Physics',
    popularity: 820,
    difficulty: 'intermediate',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-12'),
  },
  {
    id: 'topic-4',
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript to build interactive websites.',
    category: 'Computer Science',
    popularity: 1050,
    difficulty: 'beginner',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-02-05'),
  },
  {
    id: 'topic-5',
    title: 'Data Visualization',
    description: 'Create effective visual representations of data using modern tools.',
    category: 'Data Science',
    popularity: 890,
    difficulty: 'intermediate',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-25'),
  },
];

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);
  
  // Portfolio metrics
  const [portfolioValue, setPortfolioValue] = useState(1250);
  const [portfolioChange, setPortfolioChange] = useState(150);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(12.5);
  
  // Daily activity for the chart
  const [dailyActivity, setDailyActivity] = useState([
    { day: 'Mon', value: 950 },
    { day: 'Tue', value: 1050 },
    { day: 'Wed', value: 1000 },
    { day: 'Thu', value: 1020 },
    { day: 'Fri', value: 1100 },
    { day: 'Sat', value: 1150 },
    { day: 'Sun', value: 1250 },
  ]);

  const loadTopics = async () => {
    try {
      // In a real app, this would fetch from an API
      setTopics(mockTopics);
      
      if (user) {
        // Mock progress data for the logged-in user
        const mockProgress: Progress[] = mockTopics.slice(0, 2).map(topic => ({
          userId: user.id,
          topicId: topic.id,
          status: Math.random() > 0.5 ? 'in_progress' : 'not_started',
          percentComplete: Math.floor(Math.random() * 100),
          lastAccessed: new Date(),
          timeSpent: Math.floor(Math.random() * 120),
        }));
        
        setUserProgress(mockProgress);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTopics();
    } else {
      setTopics([]);
      setUserProgress([]);
    }
  }, [user]);

  const getTopicById = (id: string) => {
    return topics.find(topic => topic.id === id);
  };

  const getProgressForTopic = (topicId: string) => {
    return userProgress.find(progress => progress.topicId === topicId);
  };

  const updateProgress = async (topicId: string, update: Partial<Progress>) => {
    if (!user) return;
    
    try {
      // In a real app, this would be an API call
      setUserProgress(prev => {
        const existingProgress = prev.find(p => p.topicId === topicId);
        
        if (existingProgress) {
          // Update existing progress
          return prev.map(p => 
            p.topicId === topicId 
              ? { ...p, ...update, lastAccessed: new Date() } 
              : p
          );
        } else {
          // Create new progress entry
          const newProgress: Progress = {
            userId: user.id,
            topicId,
            status: 'in_progress',
            percentComplete: 0,
            lastAccessed: new Date(),
            timeSpent: 0,
            ...update
          };
          return [...prev, newProgress];
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <LearningContext.Provider value={{
      topics,
      userProgress,
      portfolioValue,
      portfolioChange,
      portfolioChangePercent,
      loadTopics,
      getTopicById,
      getProgressForTopic,
      updateProgress,
      dailyActivity,
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export default useLearning;
