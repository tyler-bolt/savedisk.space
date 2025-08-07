import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Compass as Compress, FileImage, FileSpreadsheet } from 'lucide-react';

type ProcessingType = 'compress' | 'word' | 'powerpoint' | 'jpeg' | null;

interface PDFToolButtonsProps {
  uploadedPDF: any;
  isProcessing: boolean;
  onProcessPDF: (type: ProcessingType) => void;
}

const PDFToolButtons: React.FC<PDFToolButtonsProps> = ({
  uploadedPDF,
  isProcessing,
  onProcessPDF
}) => {
  const toolButtons = [
    {
      type: 'compress' as ProcessingType,
      icon: Compress,
      title: 'Compress PDF',
      description: 'Reduce file size by up to 60%',
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'from-pink-400 to-purple-500'
    },
    {
      type: 'word' as ProcessingType,
      icon: FileText,
      title: 'Convert to Word',
      description: 'Transform PDF to editable DOCX',
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'from-blue-400 to-indigo-500'
    },
    {
      type: 'powerpoint' as ProcessingType,
      icon: FileSpreadsheet,
      title: 'Convert to PowerPoint',
      description: 'Create PPTX presentation',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'from-orange-400 to-red-500'
    },
    {
      type: 'jpeg' as ProcessingType,
      icon: FileImage,
      title: 'PDF to JPEG',
      description: 'Extract pages as images',
      color: 'from-green-500 to-teal-600',
      hoverColor: 'from-green-400 to-teal-500'
    }
  ];

  if (!uploadedPDF) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {toolButtons.map((tool, index) => (
        <motion.button
          key={tool.type}
          onClick={() => onProcessPDF(tool.type)}
          disabled={isProcessing}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          className={`relative group disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md bg-gradient-to-br ${tool.color}/10 border border-current/20 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          <div className="relative z-10">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${tool.color} mb-4`}>
              <tool.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold font-space-grotesk text-white mb-2">{tool.title}</h3>
            <p className="text-sm text-gray-300 font-dm-sans">{tool.description}</p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default PDFToolButtons;