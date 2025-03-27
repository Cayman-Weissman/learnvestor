
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Book, Brain, BarChart2, UsersRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] dot-pattern text-white">
      <header className="w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Book className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Luminate</h1>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-white hover:text-primary hover:bg-transparent"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
        >
          {isAuthenticated ? 'Dashboard' : 'Login'}
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">Investing in </span>
            <span className="text-primary">learning</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Luminate transforms education with elegant design and AI-powered insights. 
            Track your progress, explore curated lessons, and watch your knowledge grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg flex items-center justify-center"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
            >
              Get Started
              <ArrowRight className="ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 rounded-lg text-lg"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
          <div className="glass-card rounded-xl p-6 text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/20">
              <Brain className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
            <p className="text-gray-400">
              Personalized content and recommendations based on your learning style, interests, and progress.
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-6 text-center animate-fade-in delay-100">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/20">
              <BarChart2 className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Growth</h3>
            <p className="text-gray-400">
              Visualize your learning journey with intuitive charts and metrics that show your progress over time.
            </p>
          </div>
          
          <div className="glass-card rounded-xl p-6 text-center animate-fade-in delay-200">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/20">
              <UsersRound className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Learn Together</h3>
            <p className="text-gray-400">
              Connect with friends, share resources, and collaborate on learning goals with our social features.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© 2023 Luminate. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
