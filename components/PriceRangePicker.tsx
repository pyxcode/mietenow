'use client'

import { useState, useEffect } from 'react'
import { Euro } from 'lucide-react'

interface PriceRangePickerProps {
  onPriceChange: (prices: { minPrice: number; maxPrice: number }) => void
  initialMinPrice?: number
  initialMaxPrice?: number
  minValue?: number
  maxValue?: number
  step?: number
}

export default function PriceRangePicker({
  onPriceChange,
  initialMinPrice = 0,
  initialMaxPrice = 2000,
  minValue = 0,
  maxValue = 5000,
  step = 50
}: PriceRangePickerProps) {
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)

  // Update parent component when prices change
  useEffect(() => {
    onPriceChange({ minPrice, maxPrice })
  }, [minPrice, maxPrice, onPriceChange])

  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value >= minValue && value <= maxPrice) {
      setMinPrice(value)
    }
  }

  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value >= minPrice && value <= maxValue) {
      setMaxPrice(value)
    }
  }

  // Handle min price input change
  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minValue
    if (value >= minValue && value <= maxPrice) {
      setMinPrice(value)
    }
  }

  // Handle max price input change
  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxValue
    if (value >= minPrice && value <= maxValue) {
      setMaxPrice(value)
    }
  }

  // Calculate percentage for visual representation
  const minPercentage = ((minPrice - minValue) / (maxValue - minValue)) * 100
  const maxPercentage = ((maxPrice - minValue) / (maxValue - minValue)) * 100

  return (
    <div className="w-full space-y-4">
      {/* Price Range Display */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {minPrice.toLocaleString()}€ - {maxPrice.toLocaleString()}€
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Monthly rent budget
        </div>
      </div>

      {/* Visual Range Slider */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-lg relative">
          {/* Active range */}
          <div
            className="absolute h-2 bg-blue-500 rounded-lg"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min price handle */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={minPrice}
            onChange={handleMinPriceChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
            style={{ zIndex: 2 }}
          />
          
          {/* Max price handle */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={maxPrice}
            onChange={handleMaxPriceChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
            style={{ zIndex: 2 }}
          />
        </div>
        
        {/* Range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{minValue.toLocaleString()}€</span>
          <span>{maxValue.toLocaleString()}€</span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              min={minValue}
              max={maxValue}
              step={step}
              value={minPrice}
              onChange={handleMinPriceInputChange}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Min price"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              min={minValue}
              max={maxValue}
              step={step}
              value={maxPrice}
              onChange={handleMaxPriceInputChange}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Max price"
            />
          </div>
        </div>
      </div>

      {/* Quick Price Buttons */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Quick Select:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Budget', min: 0, max: 800 },
            { label: 'Mid-range', min: 800, max: 1500 },
            { label: 'Premium', min: 1500, max: 2500 },
            { label: 'Luxury', min: 2500, max: 5000 }
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => {
                setMinPrice(option.min)
                setMaxPrice(option.max)
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                minPrice === option.min && maxPrice === option.max
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
