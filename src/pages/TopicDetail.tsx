
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import TopicChart from '@/components/TopicChart';
import InteractiveDotBackground from '@/components/InteractiveDotBackground';

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    getTopicById, 
    fetchTopicSections, 
    getUserProgressForTopic, 
    updateUserProgress,
    topicPopularityHistory = {},
    isLoading 
  } = useLearning();
  
  const [sections, setSections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const topic = topicId ? getTopicById(topicId) : undefined;
  const progress = topicId ? getUserProgressForTopic(topicId) : undefined;
  const historyData = topic && topicPopularityHistory[topic.id] ? topicPopularityHistory[topic.id] : [];
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!topicId) {
      navigate('/dashboard');
      return;
    }
    
    const loadSections = async () => {
      if (topicId) {
        const sectionData = await fetchTopicSections(topicId);
        setSections(sectionData);
      }
    };
    
    loadSections();
  }, [topicId, isAuthenticated, navigate, fetchTopicSections]);
  
  const handleStartLearning = async () => {
    if (!topicId) return;
    
    await updateUserProgress({
      topic_id: topicId,
      status: 'in_progress',
      percent_complete: progress?.percent_complete || 0
    });
    
    toast({
      title: "Started learning",
      description: `You've started learning ${topic?.title}`,
    });
    
    // Navigate to first section
    if (sections.length > 0) {
      setActiveTab('content');
    }
  };
  
  const handleMarkComplete = async () => {
    if (!topicId) return;
    
    await updateUserProgress({
      topic_id: topicId,
      status: 'completed',
      percent_complete: 100
    });
    
    toast({
      title: "Congratulations!",
      description: `You've completed ${topic?.title}`,
    });
  };
  
  if (!topic) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Go back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <InteractiveDotBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h1>
              <div className="flex items-center text-gray-400 mb-4">
                <span className="inline-block bg-black/30 px-2 py-1 rounded-full text-primary text-sm mr-3">
                  {topic.difficulty}
                </span>
                <span className="text-sm mr-3">{topic.category}</span>
                <span className="text-sm flex items-center">
                  <Clock size={14} className="mr-1" />
                  {sections.reduce((acc, section) => acc + section.duration, 0)} mins
                </span>
              </div>
            </div>
            
            {progress?.status === 'completed' ? (
              <div className="flex items-center bg-green-500/20 text-green-500 px-4 py-2 rounded-lg">
                <CheckCircle size={18} className="mr-2" />
                Completed
              </div>
            ) : progress?.status === 'in_progress' ? (
              <Button onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700">
                Mark as Complete
              </Button>
            ) : (
              <Button onClick={handleStartLearning}>
                Start Learning
              </Button>
            )}
          </div>
          
          {progress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress.percent_complete}%</span>
              </div>
              <Progress value={progress.percent_complete} className="h-2" />
            </div>
          )}
          
          <p className="text-gray-300">{topic.description}</p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Topic Popularity</h2>
              {historyData.length > 0 ? (
                <div className="h-64">
                  <TopicChart data={historyData} showLabels={true} />
                </div>
              ) : (
                <p className="text-gray-400">No popularity data available yet.</p>
              )}
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                {sections.map((section, index) => (
                  <li key={index} className="flex items-start">
                    <BookOpen size={16} className="mr-2 mt-1 text-primary" />
                    <span>{section.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center text-primary hover:underline">
                  <ExternalLink size={16} className="mr-2" />
                  Documentation
                </a>
                <a href="#" className="flex items-center text-primary hover:underline">
                  <ExternalLink size={16} className="mr-2" />
                  Community Forum
                </a>
                <a href="#" className="flex items-center text-primary hover:underline">
                  <ExternalLink size={16} className="mr-2" />
                  Video Tutorials
                </a>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Course Content</h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-gray-800 rounded w-1/3 mb-3"></div>
                      <div className="h-24 bg-gray-800 rounded mb-2"></div>
                    </div>
                  ))}
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <div key={section.id} className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {index + 1}. {section.title}
                        </h3>
                        <div className="flex space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {section.duration} mins
                          </span>
                          <span className="capitalize">{section.type}</span>
                        </div>
                      </div>
                      
                      <div className="prose prose-invert max-w-none text-gray-300">
                        {section.content}
                      </div>
                      
                      {index < sections.length - 1 && <Separator className="bg-gray-800" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No content available for this topic yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discussion">
            <div className="glass-card rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Discussion</h2>
              <p className="text-gray-400 mb-4">This feature is coming soon.</p>
              <Button variant="outline">Request Early Access</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TopicDetail;
