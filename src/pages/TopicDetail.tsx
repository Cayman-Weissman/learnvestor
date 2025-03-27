
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  BarChart2, 
  User, 
  Users,
  MessageCircle,
  Share2,
  Heart
} from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import TopicChart from '@/components/TopicChart';
import InteractiveDotBackground from '@/components/InteractiveDotBackground';

const TopicDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { 
    getTopicById, 
    getProgressForTopic, 
    updateProgress, 
    loadContentSections,
    topicPopularityHistory
  } = useLearning();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState<number>(Math.floor(Math.random() * 200) + 50);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const topic = topicId ? getTopicById(topicId) : undefined;
  const progress = topicId ? getProgressForTopic(topicId) : undefined;
  const historyData = topicId && topicPopularityHistory[topicId] ? topicPopularityHistory[topicId] : [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!topic) {
      navigate('/dashboard');
      return;
    }

    setIsLoading(true);
    
    const loadSections = async () => {
      try {
        const contentSections = await loadContentSections(topic.id);
        setSections(contentSections);
        
        // If no progress exists yet, create initial progress entry
        if (!progress) {
          await updateProgress(topic.id, {
            status: 'in_progress',
            percent_complete: 0,
            time_spent: 0
          });
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSections();
  }, [topic, isAuthenticated, navigate, progress, updateProgress, loadContentSections]);

  const startLearning = async () => {
    if (!topic) return;
    
    try {
      await updateProgress(topic.id, {
        status: 'in_progress',
        percent_complete: progress?.percent_complete || 5,
        time_spent: 5
      });
      
      toast({
        title: "Progress updated",
        description: "Your learning progress has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!topic) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <InteractiveDotBackground />
      
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <MessageCircle size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Share2 size={20} />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h1>
              <p className="text-gray-400">{topic.description}</p>
            </div>
            <span className="text-lg font-semibold text-primary">{topic.popularity}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Difficulty</span>
              <div className="flex items-center">
                <BookOpen size={16} className="text-primary mr-2" />
                <span className="capitalize">{topic.difficulty}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Estimated Time</span>
              <div className="flex items-center">
                <Clock size={16} className="text-primary mr-2" />
                <span>{sections.reduce((acc, s) => acc + s.duration, 0)} minutes</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Last Updated</span>
              <div className="flex items-center">
                <Calendar size={16} className="text-primary mr-2" />
                <span>{new Date(topic.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Active Learners</span>
              <div className="flex items-center">
                <Users size={16} className="text-primary mr-2" />
                <span>{activeUsers}</span>
              </div>
            </div>
          </div>
          
          {progress ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Your Progress</span>
                <span className="text-sm font-medium">{progress.percent_complete}%</span>
              </div>
              <Progress value={progress.percent_complete} className="h-2 bg-gray-700" />
            </div>
          ) : null}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <User size={16} className="text-primary mr-2" />
              <span className="text-sm text-gray-400">Personalized for {user?.name}</span>
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={startLearning}
            >
              {progress?.percent_complete ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-700 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-1 w-2/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="glass-card rounded-xl p-4 transition-all hover:bg-black/40">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{section.title}</h3>
                    <div className="flex items-center">
                      <span className="capitalize text-xs px-2 py-1 rounded-full bg-black/30 text-primary">
                        {section.type}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{section.duration} min</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Topic Popularity</h2>
            <div className="flex items-center text-primary">
              <BarChart2 size={16} className="mr-1" />
              <span>Trending Up</span>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-4">
            <p className="text-gray-400 mb-4">
              This topic has seen a <span className="text-primary font-medium">12% increase</span> in activity over the last week.
              There are currently <span className="text-primary font-medium">{activeUsers}</span> active learners studying this topic.
            </p>
            
            {historyData.length > 0 && (
              <TopicChart 
                data={historyData}
                height={180}
                className="mb-4"
              />
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interest over time</span>
              <span className="text-primary font-medium">
                +{historyData.length > 0 
                  ? historyData[historyData.length - 1].popularity - historyData[0].popularity 
                  : topic.popularity - 750}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TopicDetail;
