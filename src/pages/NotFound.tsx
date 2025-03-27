
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white p-6">
      <InteractiveDotBackground />
      <div className="glass-card rounded-xl p-8 text-center max-w-md animate-fade-in">
        <BookX className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-400 mb-6">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white"
        >
          <ArrowLeft size={16} />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
