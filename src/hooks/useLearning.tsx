
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Topic type matches Supabase schema
export type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
};

// ContentSection type matches Supabase schema
export type ContentSection = {
  id: string;
  topic_id: string;
  title: string;
  type: 'text' | 'video' | 'quiz' | 'exercise';
  content: string;
  duration: number;
  order_index: number;
};

// UserProgress type matches Supabase schema
export type UserProgress = {
  id?: string;
  user_id?: string;
  topic_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percent_complete: number;
  last_accessed: string;
  time_spent: number;
};

// Daily activity data type
export type DailyActivity = {
  day: string;
  value: number;
};

// Topic popularity history entry
export type PopularityHistoryEntry = {
  timestamp: string;
  popularity: number;
};

// Define types for the LearningContext
type LearningContextType = {
  topics: Topic[];
  topicSections: Record<string, ContentSection[]>;
  userProgress: UserProgress[];
  isLoading: boolean;
  error: string | null;
  fetchTopics: () => Promise<void>;
  fetchTopicSections: (topicId: string) => Promise<ContentSection[]>;
  updateUserProgress: (progressData: Partial<UserProgress>) => Promise<void>;
  getTopicById: (id: string) => Topic | undefined;
  getUserProgressForTopic: (topicId: string) => UserProgress | undefined;
  topicPopularityHistory: Record<string, PopularityHistoryEntry[]>;
  portfolioValue: number;
  portfolioChange: number;
  portfolioChangePercent: number;
  dailyActivity: DailyActivity[];
  loadTopics: () => Promise<void>;
};

// Create context with default values
const LearningContext = createContext<LearningContextType | undefined>(undefined);

// Provider component
export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicSections, setTopicSections] = useState<Record<string, ContentSection[]>>({});
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicPopularityHistory, setTopicPopularityHistory] = useState<Record<string, PopularityHistoryEntry[]>>({});
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioChange, setPortfolioChange] = useState<number>(0);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState<number>(0);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  
  const { user } = useAuth();

  // Function to fetch topics from Supabase
  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('popularity', { ascending: false });

      if (topicsError) {
        throw topicsError;
      }

      // Convert to proper Topic type with explicit difficulty field
      const typedTopics: Topic[] = topicsData?.map(topic => ({
        ...topic,
        difficulty: topic.difficulty as 'beginner' | 'intermediate' | 'advanced'
      })) || [];

      setTopics(typedTopics);

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) {
          throw progressError;
        }

        // Convert to proper UserProgress type with explicit status field
        const typedProgress: UserProgress[] = progressData?.map(progress => ({
          ...progress,
          status: progress.status as 'not_started' | 'in_progress' | 'completed'
        })) || [];

        setUserProgress(typedProgress);

        // Generate mock portfolio value based on user progress
        calculatePortfolioMetrics(typedProgress);

        // Generate mock daily activity data
        generateDailyActivityData();

        // Generate mock topic popularity history
        generateTopicPopularityHistory(typedTopics);
      }
    } catch (err) {
      console.error('Error loading topics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load topics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock daily activity data
  const generateDailyActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.floor(Math.random() * 500) + 100
      };
    });
    
    setDailyActivity(last7Days);
  };

  // Generate mock portfolio metrics
  const calculatePortfolioMetrics = (progress: UserProgress[]) => {
    // Calculate value based on progress
    const baseValue = 1000;
    const completedBonus = progress.filter(p => p.status === 'completed').length * 200;
    const inProgressBonus = progress.filter(p => p.status === 'in_progress').length * 50;
    const percentBonus = progress.reduce((sum, p) => sum + p.percent_complete, 0) * 2;
    
    const value = baseValue + completedBonus + inProgressBonus + percentBonus;
    const change = Math.floor(Math.random() * 200) - 50; // Random change between -50 and 150
    const changePercent = Math.round((change / (value - change)) * 100 * 10) / 10;
    
    setPortfolioValue(value);
    setPortfolioChange(change);
    setPortfolioChangePercent(changePercent);
  };

  // Generate mock topic popularity history
  const generateTopicPopularityHistory = (topicsList: Topic[]) => {
    const history: Record<string, PopularityHistoryEntry[]> = {};
    
    topicsList.forEach(topic => {
      const entries: PopularityHistoryEntry[] = [];
      const basePopularity = topic.popularity - Math.floor(Math.random() * 200);
      
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (10 - i));
        
        entries.push({
          timestamp: date.toISOString(),
          popularity: Math.max(0, basePopularity + Math.floor(Math.random() * 50) * i)
        });
      }
      
      history[topic.id] = entries;
    });
    
    setTopicPopularityHistory(history);
  };

  // Function to fetch topic sections
  const fetchTopicSections = async (topicId: string): Promise<ContentSection[]> => {
    if (topicSections[topicId]) {
      return topicSections[topicId];
    }

    try {
      const { data: sections, error: sectionsError } = await supabase
        .from('content_sections')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        throw sectionsError;
      }

      // Save to state and return
      const typedSections = sections as ContentSection[];
      setTopicSections(prev => ({
        ...prev,
        [topicId]: typedSections
      }));
      return typedSections;
    } catch (err) {
      console.error('Error loading topic sections:', err);
      toast({
        title: 'Error',
        description: 'Failed to load content for this topic.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Function to update user progress
  const updateUserProgress = async (progressData: Partial<UserProgress>) => {
    if (!user || !progressData.topic_id) {
      return;
    }

    try {
      // Check if a record already exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', progressData.topic_id)
        .maybeSingle();

      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_progress')
          .update({
            ...progressData,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        // Update state
        setUserProgress(prevProgress =>
          prevProgress.map(progress =>
            progress.id === existingProgress.id
              ? { 
                  ...progress, 
                  ...progressData, 
                  status: (progressData.status || progress.status) as 'not_started' | 'in_progress' | 'completed',
                  last_accessed: new Date().toISOString() 
                }
              : progress
          )
        );
      } else {
        // Create new record
        const newProgress = {
          user_id: user.id,
          topic_id: progressData.topic_id,
          status: (progressData.status || 'not_started') as 'not_started' | 'in_progress' | 'completed',
          percent_complete: progressData.percent_complete || 0,
          last_accessed: new Date().toISOString(),
          time_spent: progressData.time_spent || 0,
        };

        const { data, error } = await supabase
          .from('user_progress')
          .insert([newProgress])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          // Add to state with proper typing
          setUserProgress(prev => [...prev, {
            ...data[0],
            status: data[0].status as 'not_started' | 'in_progress' | 'completed'
          }]);
        }
      }

      // Update portfolio metrics after progress update
      calculatePortfolioMetrics([...userProgress]);
    } catch (err) {
      console.error('Error updating progress:', err);
      toast({
        title: 'Error',
        description: 'Failed to update your progress.',
        variant: 'destructive',
      });
    }
  };

  // Helper to get topic by ID
  const getTopicById = (id: string) => {
    return topics.find(topic => topic.id === id);
  };

  // Helper to get user progress for a specific topic
  const getUserProgressForTopic = (topicId: string) => {
    return userProgress.find(progress => progress.topic_id === topicId);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTopics();
  }, [user?.id]);

  // Alias fetchTopics to loadTopics for backward compatibility
  const loadTopics = fetchTopics;

  return (
    <LearningContext.Provider
      value={{
        topics,
        topicSections,
        userProgress,
        isLoading,
        error,
        fetchTopics,
        fetchTopicSections,
        updateUserProgress,
        getTopicById,
        getUserProgressForTopic,
        topicPopularityHistory,
        portfolioValue,
        portfolioChange,
        portfolioChangePercent,
        dailyActivity,
        loadTopics,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

// Hook to use the learning context
export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export default useLearning;
