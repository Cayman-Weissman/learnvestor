
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
};

type Progress = {
  id: string;
  user_id: string;
  topic_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percent_complete: number;
  last_accessed: string;
  time_spent: number; // in minutes
};

type ContentSection = {
  id: string;
  topic_id: string;
  title: string;
  type: 'text' | 'video' | 'quiz' | 'exercise';
  content: string;
  duration: number;
  order_index: number;
};

type PopularityHistory = {
  id: string;
  topic_id: string;
  popularity: number;
  timestamp: string;
};

type DailyActivity = {
  day: string;
  value: number;
};

type LearningContextType = {
  topics: Topic[];
  userProgress: Progress[];
  contentSections: ContentSection[];
  topicPopularityHistory: Record<string, PopularityHistory[]>;
  portfolioValue: number;
  portfolioChange: number;
  portfolioChangePercent: number;
  loadTopics: () => Promise<void>;
  loadContentSections: (topicId: string) => Promise<ContentSection[]>;
  getTopicById: (id: string) => Topic | undefined;
  getProgressForTopic: (topicId: string) => Progress | undefined;
  updateProgress: (topicId: string, update: Partial<Progress>) => Promise<void>;
  dailyActivity: DailyActivity[];
  isLoading: boolean;
  error: Error | null;
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [topicPopularityHistory, setTopicPopularityHistory] = useState<Record<string, PopularityHistory[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Portfolio metrics
  const [portfolioValue, setPortfolioValue] = useState(1250);
  const [portfolioChange, setPortfolioChange] = useState(150);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(12.5);
  
  // Daily activity for the chart
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([
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
      setIsLoading(true);
      
      // Fetch topics from Supabase
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('popularity', { ascending: false });
      
      if (topicsError) {
        throw new Error(topicsError.message);
      }
      
      setTopics(topicsData as Topic[]);
      
      // Load popularity history for all topics
      await loadPopularityHistory(topicsData.map(t => t.id));
      
      if (user) {
        // Load user progress from Supabase if user is logged in
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) {
          throw new Error(progressError.message);
        }
        
        setUserProgress(progressData as Progress[]);
      }
    } catch (err) {
      console.error('Error loading topics:', err);
      setError(err instanceof Error ? err : new Error('Failed to load topics'));
      toast({
        title: 'Error loading topics',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPopularityHistory = async (topicIds: string[]) => {
    if (!topicIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from('topic_popularity_history')
        .select('*')
        .in('topic_id', topicIds)
        .order('timestamp', { ascending: true });
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Group by topic_id
      const historyByTopic: Record<string, PopularityHistory[]> = {};
      (data as PopularityHistory[]).forEach(item => {
        if (!historyByTopic[item.topic_id]) {
          historyByTopic[item.topic_id] = [];
        }
        historyByTopic[item.topic_id].push(item);
      });
      
      setTopicPopularityHistory(historyByTopic);
    } catch (err) {
      console.error('Error loading popularity history:', err);
    }
  };
  
  const loadContentSections = async (topicId: string): Promise<ContentSection[]> => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const sections = data as ContentSection[];
      setContentSections(sections);
      return sections;
    } catch (err) {
      console.error('Error loading content sections:', err);
      throw err;
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
    return userProgress.find(progress => progress.topic_id === topicId);
  };

  const updateProgress = async (topicId: string, update: Partial<Progress>) => {
    if (!user) return;
    
    try {
      const existingProgress = userProgress.find(p => p.topic_id === topicId);
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            status: update.status || existingProgress.status,
            percent_complete: update.percent_complete || existingProgress.percent_complete,
            time_spent: (update.time_spent || 0) + existingProgress.time_spent,
            last_accessed: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select();
          
        if (error) throw new Error(error.message);
        
        // Update local state
        setUserProgress(prev => 
          prev.map(p => p.id === existingProgress.id ? (data[0] as Progress) : p)
        );
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            topic_id: topicId,
            status: update.status || 'in_progress',
            percent_complete: update.percent_complete || 0,
            time_spent: update.time_spent || 0,
            last_accessed: new Date().toISOString()
          })
          .select();
          
        if (error) throw new Error(error.message);
        
        // Update local state
        setUserProgress(prev => [...prev, data[0] as Progress]);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  return (
    <LearningContext.Provider value={{
      topics,
      userProgress,
      contentSections,
      topicPopularityHistory,
      portfolioValue,
      portfolioChange,
      portfolioChangePercent,
      loadTopics,
      loadContentSections,
      getTopicById,
      getProgressForTopic,
      updateProgress,
      dailyActivity,
      isLoading,
      error
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
