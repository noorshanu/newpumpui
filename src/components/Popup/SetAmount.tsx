import React, { useMemo, useState } from 'react'

interface SetAmountProps {
  onSetAmount: (amount: string) => void;
}

const SetAmount: React.FC<SetAmountProps> = ({ onSetAmount }) => {
  const [solAmount, setSolAmount] = useState<number>(0)
  const [message, setMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Calculate total amount with buffer
  const totalAmount = useMemo(() => {
    const buffer = 0.005;
    return solAmount > 0 ? solAmount + buffer : 0;
  }, [solAmount]);

  const handleSetAmount = () => {
    setMessage(null)
    setSuccessMessage(null)

    if (!solAmount || solAmount <= 0) {
      setMessage("Please enter a valid SOL amount.")
      return
    }

    try {
      const formattedAmount = totalAmount.toFixed(3)
      onSetAmount(formattedAmount)
      setSuccessMessage(`SOL amount set to ${formattedAmount} SOL (includes 0.005 SOL buffer)`)
      setSolAmount(0) // Reset the input after setting
    } catch (error) {
      console.error(error)
      setMessage("Failed to set SOL amount.")
    }
  }

  return (
    <div className="w-full rounded-md bg-[#191919] px-4 py-8 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Set SOL Amount
      </h2>
      
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={solAmount}
            onChange={(e) => setSolAmount(Number(e.target.value))}
            className="w-full rounded-lg border-[1.5px] border-form-strokedark bg-form-input px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default"
            placeholder="SOL Amount"
          />
          {solAmount > 0 && (
            <div className="text-sm text-gray-400">
              Total with buffer: {totalAmount.toFixed(3)} SOL (+0.005 SOL buffer)
            </div>
          )}
        </div>

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
