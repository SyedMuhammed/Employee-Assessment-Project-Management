import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  HelpCircle, 
  Users, 
  BarChart3, 
  FileText,
  Settings,
  Target,
  Loader
} from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI assistant for employee assessment. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      title: 'Find Employee Matches',
      description: 'Find suitable employees for a project',
      icon: Target,
      action: 'I need to find employees that match a specific project. Can you help me with employee matching?'
    },
    {
      title: 'Performance Analysis',
      description: 'Analyze employee performance data',
      icon: BarChart3,
      action: 'Can you help me analyze employee performance trends and identify areas for improvement?'
    },
    {
      title: 'Add New Employee',
      description: 'Guide me through adding an employee',
      icon: Users,
      action: 'I want to add a new employee to the system. Can you guide me through the process?'
    },
    {
      title: 'Get Help',
      description: 'Learn about system features',
      icon: HelpCircle,
      action: 'What features are available in this employee assessment system?'
    }
  ];

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate API call to NLP service
      const response = await simulateNLPResponse(content);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const simulateNLPResponse = async (userInput) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = userInput.toLowerCase();
    
    if (input.includes('employee') && input.includes('match')) {
      return `I can help you find the best employees for your project! Here's how the matching works:

1. **Skills Assessment**: The system analyzes employee skills against project requirements
2. **Performance History**: Considers past performance and project success rates
3. **Availability Check**: Ensures employees are available for new assignments
4. **Compatibility Score**: Provides a percentage match based on multiple factors

To get started, go to the "Project Requirements" page and select a project to see employee matches. Would you like me to explain any specific aspect of the matching process?`;
    }
    
    if (input.includes('performance') || input.includes('analyze')) {
      return `Great question about performance analysis! Here are the key metrics I track:

📊 **Performance Metrics**:
• Overall performance scores (0-100%)
• Skills proficiency levels
• Project completion rates
• Team collaboration scores
• Leadership indicators

📈 **Trends & Insights**:
• Monthly performance trends
• Top performers identification
• Areas needing improvement
• Skill gap analysis

You can view detailed analytics on the "Analytics" page. Would you like me to explain any specific performance metric?`;
    }
    
    if (input.includes('add') && input.includes('employee')) {
      return `I'll guide you through adding a new employee! Here's the process:

👤 **Step 1: Basic Information**
• Enter name, email, phone, and location
• Add employee bio and status

🎯 **Step 2: Skills Assessment**
• Rate technical skills, communication, leadership
• Assess problem-solving and teamwork abilities
• The system automatically calculates performance scores

📊 **Step 3: Review Results**
• View calculated performance metrics
• See strengths and areas for improvement
• Finalize employee profile

Navigate to "Add/Edit Employee" to get started. Would you like me to explain any specific part of the assessment process?`;
    }
    
    if (input.includes('help') || input.includes('feature')) {
      return `Here are the main features of the Employee Assessment System:

🎯 **Project Requirements**
• Create and manage project briefs
• Find employee matches using AI
• Get detailed explanations for matches

👥 **Employee Database**
• View all employees with performance metrics
• Search, filter, and sort employees
• Edit employee information and scores

📊 **Analytics Dashboard**
• Performance distribution charts
• Skills analysis and trends
• Top performers leaderboard

➕ **Add/Edit Employees**
• Multi-step assessment process
• Automatic score calculation
• Comprehensive employee profiles

💬 **AI Assistant** (that's me!)
• Get help with any feature
• Understand system capabilities
• Quick navigation guidance

Is there a specific feature you'd like to learn more about?`;
    }
    
    if (input.includes('hello') || input.includes('hi')) {
      return `Hello! I'm here to help you with the Employee Assessment System. I can assist with:

• Finding employee matches for projects
• Understanding performance analytics
• Adding new employees to the system
• Explaining system features
• Navigating the dashboard

What would you like to know about?`;
    }

    // Default response
    return `I understand you're asking about "${userInput}". Let me help you with that!

For the best assistance, you can:
• Ask about employee matching and project assignments
• Get help with performance analysis and analytics
• Learn about adding new employees to the system
• Understand system features and navigation

What specific aspect would you like me to help you with?`;
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 border-2 border-white/20 backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chatbot Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700/50 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/50 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-gray-400">
                    Employee Assessment Helper
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[350px] bg-gray-900/50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800/80 text-gray-100 border border-gray-700/50'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700/50">
                      <div className="flex items-center space-x-1">
                        <Loader className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm text-gray-300">
                          AI is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t border-gray-700/50 bg-gray-800/30"
              >
                <p className="text-xs text-gray-400 mb-3">
                  Quick actions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.title}
                      onClick={() => handleQuickAction(action.action)}
                      className="p-2 text-xs bg-gray-800/60 hover:bg-gray-700/60 rounded-lg transition-colors text-left border border-gray-700/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <action.icon className="w-3 h-3 text-blue-400" />
                        <span className="font-medium text-white">
                          {action.title}
                        </span>
                      </div>
                      <p className="text-gray-400">
                        {action.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 rounded-b-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 