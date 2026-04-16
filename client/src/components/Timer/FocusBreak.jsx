import React, { useState } from 'react'

import FocusTimer from './FocusTimer'
import BreakTimer from './BreakTimer'

const FocusBreak = () => {
  const [mode, setMode] = useState('focus')

  return (
    <div className="text-white">

      {/* Tabs */}
      <div className="flex justify-center gap-12 border-b border-gray-700 w-full max-w-md mx-auto">
        
        <button
          onClick={() => setMode('focus')}
          className={`text-2xl font-semibold pb-2 transition-all duration-300
            ${mode === "focus"
              ? "border-b-2 border-white text-white"
              : "text-gray-400"
            }`}
        >
          Focus
        </button>

        <button
          onClick={() => setMode('break')}
          className={`text-2xl font-semibold pb-2 transition-all duration-300
            ${mode === "break"
              ? "border-b-2 border-white text-white"
              : "text-gray-400"
            }`}
        >
          Break
        </button>

      </div>

      {/* Content */}
      <div className="py-4 flex justify-center">
        {mode === 'focus' && <FocusTimer />}
        {mode === 'break' && <BreakTimer />}
      </div>

    </div>
  )
}

export default FocusBreak