'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    city: 'Berlin',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    minBedrooms: '',
    maxBedrooms: '',
    minSize: '',
    maxSize: '',
    propertyType: [] as string[],
    furnishing: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'room', label: 'Chambre' },
    { value: 'studio', label: 'Studio' },
    { value: 'loft', label: 'Loft' }
  ]

  const furnishingOptions = [
    { value: 'furnished', label: 'Meublé' },
    { value: 'unfurnished', label: 'Non meublé' },
    { value: 'partially_furnished', label: 'Partiellement meublé' }
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: 'propertyType' | 'furnishing', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Rediriger vers la page de paiement
        router.push('/payment')
      } else {
        setError(data.message || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-mineral text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-mineral' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            {step === 1 && 'Location'}
            {step === 2 && 'Criteria'}
            {step === 3 && 'Let\'s go!'}
          </h2>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="bg-mineral text-white p-6 text-center">
            <h1 className="text-xl font-bold mb-2">
              Receive 142 matches next week directly in your inbox!
            </h1>
            <p className="text-sm opacity-90">
              Start by creating your account. Receive your first matches today.
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Your name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                    placeholder="Your address"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Search Criteria */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                  >
                    <option value="Berlin">Berlin</option>
                    <option value="Munich">Munich</option>
                    <option value="Hamburg">Hamburg</option>
                    <option value="Cologne">Cologne</option>
                    <option value="Frankfurt">Frankfurt</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix min (€)
                    </label>
                    <input
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix max (€)
                    </label>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pièces min
                    </label>
                    <input
                      type="number"
                      value={formData.minRooms}
                      onChange={(e) => handleInputChange('minRooms', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chambres min
                    </label>
                    <input
                      type="number"
                      value={formData.minBedrooms}
                      onChange={(e) => handleInputChange('minBedrooms', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface min (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.minSize}
                    onChange={(e) => handleInputChange('minSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mineral focus:border-transparent"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de logement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.propertyType.includes(type.value)}
                          onChange={() => handleCheckboxChange('propertyType', type.value)}
                          className="rounded border-gray-300 text-mineral focus:ring-mineral"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipement
                  </label>
                  <div className="space-y-2">
                    {furnishingOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.furnishing.includes(option.value)}
                          onChange={() => handleCheckboxChange('furnishing', option.value)}
                          className="rounded border-gray-300 text-mineral focus:ring-mineral"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-mint mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Prêt à recevoir vos matches !
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nous allons vous envoyer les meilleures annonces correspondant à vos critères.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{formData.firstName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ville:</span>
                    <span className="font-medium">{formData.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">
                      {formData.minPrice && formData.maxPrice 
                        ? `${formData.minPrice}€ - ${formData.maxPrice}€`
                        : formData.minPrice 
                        ? `À partir de ${formData.minPrice}€`
                        : formData.maxPrice
                        ? `Jusqu'à ${formData.maxPrice}€`
                        : 'Non spécifié'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            {step === 1 && (
              <p className="text-xs text-gray-500 mt-4">
                By creating an account, you accept our{' '}
                <a href="/terms" className="text-mint hover:underline">
                  terms and conditions
                </a>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>{loading ? 'Creating...' : 'Send me all matches'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
