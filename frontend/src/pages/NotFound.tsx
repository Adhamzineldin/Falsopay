import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.2,
        duration: 0.6 
      } 
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-red-500"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{ 
              x: [
                Math.random() * window.innerWidth, 
                Math.random() * window.innerWidth, 
                Math.random() * window.innerWidth, 
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight, 
                Math.random() * window.innerHeight, 
                Math.random() * window.innerHeight, 
                Math.random() * window.innerHeight
              ],
              opacity: [
                Math.random() * 0.3 + 0.1,
                Math.random() * 0.6 + 0.2,
                Math.random() * 0.3 + 0.1
              ]
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity,
              ease: "linear" 
            }}
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="text-center z-10 px-4 max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="relative"
          variants={childVariants}
        >
          <motion.h1 
            className="text-9xl font-bold mb-4 text-red-600"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(255, 0, 0, 0.5)", 
                "0 0 20px rgba(255, 0, 0, 0.8)", 
                "0 0 10px rgba(255, 0, 0, 0.5)"
              ],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            404
          </motion.h1>

          <motion.div
            className="absolute inset-0 -z-10 rounded-full"
            animate={{
              boxShadow: [
                "0 0 40px rgba(255, 0, 0, 0.2)", 
                "0 0 80px rgba(255, 0, 0, 0.4)", 
                "0 0 40px rgba(255, 0, 0, 0.2)"
              ],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>

        <motion.p 
          className="text-xl text-gray-300 mb-8"
          variants={childVariants}
        >
          Oops! The page you're looking for seems to have vanished.
        </motion.p>

        <motion.div
          variants={childVariants}
        >
          <Link 
            to="/" 
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-block"
          >
            Return to Falsopay
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
