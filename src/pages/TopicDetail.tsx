
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

// Mock content generated "by AI" for the topic
interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz' | 'exercise';
  content: string;
  duration: number; // minutes
}

const TopicDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { getTopicById, getProgressForTopic, updateProgress } = useLearning();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState<number>(Math.floor(Math.random() * 200) + 50);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const topic = topicId ? getTopicById(topicId) : undefined;
  const progress = topicId ? getProgressForTopic(topicId) : undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!topic) {
      navigate('/dashboard');
      return;
    }

    // Simulate loading AI-generated content
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      // Mock AI-generated sections based on topic
      const mockSections: ContentSection[] = [
        {
          id: 's1',
          title: `Introduction to ${topic.title}`,
          type: 'text',
          content: `This comprehensive introduction will guide you through the fundamental concepts of ${topic.title.toLowerCase()}. We'll explore the key principles and applications that make this subject relevant in today's world.`,
          duration: 10
        },
        {
          id: 's2',
          title: 'Core Concepts',
          type: 'text',
          content: `In this section, we'll dive deeper into the essential frameworks and methodologies that form the backbone of ${topic.title.toLowerCase()}. You'll gain a solid understanding of how these concepts interrelate and build upon each other.`,
          duration: 15
        },
        {
          id: 's3',
          title: 'Practical Application',
          type: 'exercise',
          content: `Now it's time to apply what you've learned. This hands-on exercise will challenge you to solve real-world problems using the knowledge you've gained so far.`,
          duration: 20
        },
        {
          id: 's4',
          title: 'Advanced Techniques',
          type: 'video',
          content: `Watch this comprehensive video tutorial that demonstrates advanced techniques in ${topic.title.toLowerCase()}. These methods will help you tackle complex challenges more effectively.`,
          duration: 18
        },
        {
          id: 's5',
          title: 'Knowledge Check',
          type: 'quiz',
          content: `Test your understanding with this quiz covering the key concepts we've explored. This will help reinforce your learning and identify any areas that might need additional review.`,
          duration: 12
        }
      ];
      
      setSections(mockSections);
      setIsLoading(false);
      
      // If no progress exists yet, create initial progress entry
      if (!progress) {
        updateProgress(topic.id, {
          status: 'in_progress',
          percentComplete: 0,
          timeSpent: 0
        });
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [topic, isAuthenticated, navigate, progress, updateProgress]);

  const startLearning = async () => {
    if (!topic) return;
    
    try {
      await updateProgress(topic.id, {
        status: 'in_progress',
        percentComplete: progress?.percentComplete || 5,
        timeSpent: (progress?.timeSpent || 0) + 5
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
    <div className="min-h-screen bg-[#0A0A0A] dot-pattern text-white">
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
                <span>75 minutes</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Last Updated</span>
              <div className="flex items-center">
                <Calendar size={16} className="text-primary mr-2" />
                <span>{new Date(topic.updatedAt).toLocaleDateString()}</span>
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
                <span className="text-sm font-medium">{progress.percentComplete}%</span>
              </div>
              <Progress value={progress.percentComplete} className="h-2 bg-gray-700" />
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
              {progress?.percentComplete ? 'Continue Learning' : 'Start Learning'}
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
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interest over time</span>
              <span className="text-primary font-medium">+{topic.popularity - 750}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TopicDetail;
