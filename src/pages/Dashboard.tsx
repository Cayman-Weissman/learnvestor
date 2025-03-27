
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronUp, 
  Bookmark, 
  Clock, 
  XCircle, 
  Book,
  UserPlus,
  BellDot,
  LogOut
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useLearning } from '@/hooks/useLearning';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import TopicChart from '@/components/TopicChart';
import InteractiveDotBackground from '@/components/InteractiveDotBackground';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { 
    topics, 
    userProgress, 
    topicPopularityHistory,
    portfolioValue, 
    portfolioChange, 
    portfolioChangePercent,
    dailyActivity,
    loadTopics,
    isLoading
  } = useLearning();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadTopics();
    }
  }, [isAuthenticated, navigate, loadTopics]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    navigate('/');
  };

  const getTopicCounts = () => {
    const statusCounts = {
      total: topics.length,
      completed: userProgress.filter(p => p.status === 'completed').length,
      inProgress: userProgress.filter(p => p.status === 'in_progress').length,
      notStarted: topics.length - userProgress.length,
    };
    
    return statusCounts;
  };

  const topicCounts = getTopicCounts();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <InteractiveDotBackground />
      
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Luminate</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white">
            <UserPlus size={20} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <BellDot size={20} />
          </button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-transparent"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-6 pb-20 max-w-6xl mx-auto">
        <div className="w-full mt-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              type="search"
              placeholder="Search topics..."
              className="w-full py-3 pl-10 pr-4 bg-black/30 border-white/10 text-white placeholder:text-gray-500 rounded-lg"
            />
          </div>
        </div>

        <section className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold text-primary">Learning Portfolio</h2>
            <div className="flex items-center">
              <ChevronUp className="text-primary mr-1" size={16} />
              <span className="text-primary font-semibold">{portfolioChangePercent}%</span>
            </div>
          </div>
          
          <div className="flex items-baseline mb-4">
            <h3 className="text-3xl font-bold mr-2">{portfolioValue.toLocaleString()}</h3>
            <span className="text-sm text-gray-400">points</span>
          </div>
          
          <div className="h-56">
            <ChartContainer
              config={{
                value: {
                  color: '#3b82f6'
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActivity}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 200']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent payload={payload} />
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </section>

        <section className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-300">
              <div className="flex items-center">
                <Book className="mr-2 text-primary" size={18} />
                <span>Topics</span>
              </div>
              <span>{topicCounts.total}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-300">
              <div className="flex items-center">
                <Bookmark className="mr-2 text-green-500" size={18} />
                <span>Completed</span>
              </div>
              <span>{topicCounts.completed}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-300">
              <div className="flex items-center">
                <Clock className="mr-2 text-yellow-500" size={18} />
                <span>In Progress</span>
              </div>
              <span>{topicCounts.inProgress}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-300">
              <div className="flex items-center">
                <XCircle className="mr-2 text-gray-500" size={18} />
                <span>Not Started</span>
              </div>
              <span>{topicCounts.notStarted}</span>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Your Learning Journey</h2>
            <a href="#" className="text-primary hover:underline text-sm">View All</a>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-800 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded mb-3 w-full"></div>
                  <div className="h-20 bg-gray-800 rounded mb-2 w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((topic) => {
                const progress = userProgress.find(p => p.topic_id === topic.id);
                const historyData = topicPopularityHistory[topic.id] || [];
                
                return (
                  <div 
                    key={topic.id}
                    onClick={() => navigate(`/topic/${topic.id}`)}
                    className="glass-card rounded-xl p-4 cursor-pointer hover:bg-black/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{topic.title}</h3>
                      <span className="text-sm bg-black/30 px-2 py-1 rounded-full text-primary">
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{topic.description}</p>
                    
                    {historyData.length > 0 && (
                      <TopicChart 
                        data={historyData}
                        className="mb-2"
                      />
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{topic.category}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-2">
                          {progress ? `${progress.percent_complete}% complete` : 'Not started'}
                        </span>
                        <span className="text-primary font-medium">{topic.popularity}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
              <p className="text-gray-400 mb-4">No topics found matching your search.</p>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => navigate('/explore')}
              >
                Explore Topics
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
