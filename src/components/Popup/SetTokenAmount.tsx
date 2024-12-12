import React, { useState } from 'react'

interface SetAmountProps {
  onSetAmount: (amount: string) => void;
}

const SetAmount: React.FC<SetAmountProps> = ({ onSetAmount }) => {
  const [tokenAmount, setTokenAmount] = useState<string>('')
  const [message, setMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSetAmount = () => {
    setMessage(null)
    setSuccessMessage(null)

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setMessage("Please enter a valid token amount.")
      return
    }

    try {
      onSetAmount(tokenAmount)
      setSuccessMessage(`Token amount set successfully!`)
      setTokenAmount('') // Reset the input after setting
    } catch (error) {
      console.error(error)
      setMessage("Failed to set token amount.")
    }
  }

  return (
    <div className="w-full rounded-md bg-[#191919] px-4 py-8 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Set Token Amount (%)
      </h2>
      
      <div className="flex flex-col gap-4">
        <input
          type="number"
          min="0"
          step="0.01"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          className="w-full rounded-lg border-[1.5px] border-form-strokedark bg-form-input px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default"
          placeholder="e.x. 100"
        />

        <button
          onClick={handleSetAmount}
          className="inline-flex items-center justify-center rounded-md bg-green-500 px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Set Amount
        </button>

        {message && (
          <div className="mt-2 text-sm text-danger">{message}</div>
        )}
        {successMessage && (
          <div className="mt-2 text-sm text-success">{successMessage}</div>
        )}
      </div>
    </div>
  )
}

export default SetAmount
