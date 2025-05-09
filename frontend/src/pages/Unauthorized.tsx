import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

const Unauthorized = () => {
  useEffect(() => {
    console.error("401 Error: User attempted to access a restricted area");
  }, []);

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

  // Animation for the security grid
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3, transition: { duration: 1 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-falsopay-dark text-white overflow-hidden relative">
      {/* Security grid background */}
      <motion.div
        className="absolute inset-0 z-0"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(155, 135, 245, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(155, 135, 245, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Scanning line */}
      <motion.div 
        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-falsopay-accent to-transparent z-10"
        initial={{ top: 0, opacity: 0.7 }}
        animate={{ 
          top: ['0%', '100%', '0%'],
          opacity: [0.7, 0.7, 0.7]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div 
        className="text-center z-20 px-4 max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="relative mb-8"
          variants={childVariants}
        >
          <motion.h1 
            className="text-7xl font-bold text-falsopay-accent"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(255, 113, 154, 0.5)", 
                "0 0 20px rgba(255, 113, 154, 0.8)", 
                "0 0 10px rgba(255, 113, 154, 0.5)"
              ],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            401
          </motion.h1>
        </motion.div>

        {/* Animated lock */}
        <motion.div
          className="relative w-24 h-32 mx-auto mb-8"
          variants={childVariants}
        >
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-14 border-4 border-falsopay-secondary rounded-t-full"
            style={{ borderBottom: 'none' }}
            animate={{ 
              rotate: [-5, 5, -5, 0, 0, 0, 0, 0, 0, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "loop",
              times: [0, 0.1, 0.2, 0.3, 1]
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-falsopay-primary rounded-md"
            animate={{ 
              boxShadow: [
                "0 0 10px rgba(110, 89, 165, 0.5)", 
                "0 0 20px rgba(110, 89, 165, 0.8)", 
                "0 0 10px rgba(110, 89, 165, 0.5)"
              ],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-falsopay-dark rounded-full"
            />
          </motion.div>
        </motion.div>

        <motion.p 
          className="text-xl text-gray-300 mb-8"
          variants={childVariants}
        >
          Access Denied. You don't have permission to view this area.
        </motion.p>

        <motion.div
          variants={childVariants}
        >
          <Link 
            to="/" 
            className="px-6 py-3 bg-falsopay-primary hover:bg-falsopay-secondary text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-block"
          >
            Return to Falsopay
          </Link>
        </motion.div>
      </motion.div>

      {/* Security notifications */}
      {Array.from({ length: 5 }).map((_, i) => (
        <SecurityNotification key={i} delay={i * 2} />
      ))}
    </div>
  );
};

// Security notification popup component
const SecurityNotification = ({ delay }: { delay: number }) => {
  const messages = [
    "Access Denied",
    "Authentication Required",
    "Security Violation",
    "Unauthorized Access",
    "Permission Denied",
    "Session Expired",
    "Security Alert",
    "Login Required",
    "Invalid Credentials"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const randomPosition = {
    top: `${10 + Math.random() * 80}%`,
    left: `${10 + Math.random() * 80}%`,
  };

  return (
    <motion.div
      className="absolute px-3 py-2 bg-falsopay-dark border border-falsopay-accent rounded text-xs text-white z-30"
      style={randomPosition}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.9]
      }}
      transition={{ 
        duration: 3,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 10
      }}
    >
      {randomMessage}
    </motion.div>
  );
};

export default Unauthorized; 