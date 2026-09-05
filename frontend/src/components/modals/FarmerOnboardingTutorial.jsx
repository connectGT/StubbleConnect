import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle2, Leaf, Truck, IndianRupee, MapPin } from 'lucide-react';

export default function FarmerOnboardingTutorial({ onComplete }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: 'Welcome to StubbleConnect! 🌱',
      desc: 'Let us show you how to turn your crop residue into extra income in just a few steps.',
      icon: <Leaf className="w-16 h-16 text-emerald-500" />,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: '1. Register Your Field',
      desc: 'Add your farm location, acres, and crop type. You only need to do this once per season.',
      icon: <MapPin className="w-16 h-16 text-blue-500" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: '2. Declare Harvest Date',
      desc: 'Tell us when you plan to harvest. We will automatically connect you to the nearest biomass buyer.',
      icon: <Truck className="w-16 h-16 text-amber-500" />,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: '3. Get Paid Fast',
      desc: 'Once the truck picks up your stubble, the payment goes directly to your bank account via UPI.',
      icon: <IndianRupee className="w-16 h-16 text-emerald-600" />,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const nextStep = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else onComplete();
  };

  const { title, desc, icon, color } = slides[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-emerald-500' : 'w-2 bg-gray-200'}`} />
            ))}
          </div>
          <button onClick={onComplete} className="text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer">
            SKIP
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center flex flex-col items-center">
          <div className={`w-28 h-28 rounded-full ${color} flex items-center justify-center mb-6 shadow-inner`}>
            {icon}
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} 
            className={`text-sm font-bold text-gray-500 px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer ${step === 0 ? 'invisible' : ''}`}>
            Back
          </button>
          
          <button onClick={nextStep} 
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95">
            {step === slides.length - 1 ? (
              <>Let's Go! <CheckCircle2 className="w-4 h-4" /></>
            ) : (
              <>Next <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
