import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getAllEducationalTemplates, generateEducationalAppPrompt } from '@/lib/educational-templates';

interface EducationalTemplateSelectorProps {
  onTemplateSelect: (prompt: string) => void;
  onClose: () => void;
}

export default function EducationalTemplateSelector({ 
  onTemplateSelect, 
  onClose 
}: EducationalTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customization, setCustomization] = useState({
    subject: '',
    targetAge: '',
    features: [] as string[]
  });
  const [showCustomization, setShowCustomization] = useState(false);

  const templates = getAllEducationalTemplates();

  const handleTemplateClick = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setShowCustomization(true);
  };

  const handleGenerateApp = () => {
    if (!selectedTemplate) return;

    const template = templates.find(t => t.key === selectedTemplate);
    if (!template) return;

    let finalPrompt = template.prompt;

    // If customization is provided, generate custom prompt
    if (customization.subject || customization.targetAge || customization.features.length > 0) {
      finalPrompt = generateEducationalAppPrompt(
        template.name,
        customization.subject || 'general',
        customization.targetAge || 'all ages',
        customization.features.length > 0 ? customization.features : template.components
      );
    }

    onTemplateSelect(finalPrompt);
    onClose();
  };

  const toggleFeature = (feature: string) => {
    setCustomization(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-white via-blue-50 to-yellow-50 rounded-3xl shadow-2xl border-4 border-yellow-400 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b-4 border-red-400 bg-gradient-to-r from-red-100 to-yellow-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              🎓 Educational App Templates
            </h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Choose a template to generate an educational learning application
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {!showCustomization ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-4 border-blue-300 rounded-2xl p-3 sm:p-4 cursor-pointer hover:shadow-xl hover:border-yellow-400 transition-all duration-300 bg-gradient-to-br from-white to-blue-50 transform hover:scale-105 active:scale-95"
                  onClick={() => handleTemplateClick(template.key)}
                >
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs rounded-full shadow-sm font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.components.slice(0, 3).map((component) => (
                      <span
                        key={component}
                        className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-full shadow-sm font-semibold"
                      >
                        {component}
                      </span>
                    ))}
                    {template.components.length > 3 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs rounded-full shadow-sm font-semibold">
                        +{template.components.length - 3} more
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomization(false)}
                  >
                    ← Back
                  </Button>
                  <h3 className="text-xl font-semibold">
                    Customize Your {templates.find(t => t.key === selectedTemplate)?.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Area (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mathematics, Science, History"
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={customization.subject}
                        onChange={(e) => setCustomization(prev => ({ ...prev, subject: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Age Group (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Elementary, Middle School, High School"
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={customization.targetAge}
                        onChange={(e) => setCustomization(prev => ({ ...prev, targetAge: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Features (Optional)
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[
                        'Progress tracking',
                        'Gamification elements',
                        'Accessibility features',
                        'Offline support',
                        'Teacher dashboard',
                        'Parent portal',
                        'Achievement system',
                        'Social learning features',
                        'AI-powered hints',
                        'Adaptive difficulty',
                        'Export results',
                        'Multi-language support'
                      ].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customization.features.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setShowCustomization(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateApp} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-4 sm:px-6 text-sm sm:text-base rounded-2xl shadow-lg border-4 border-green-400 transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[44px]">
                    Generate Educational App 🚀
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}