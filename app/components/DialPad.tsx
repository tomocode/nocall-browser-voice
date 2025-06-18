'use client';

interface DialPadProps {
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  onDial: (digit: string) => void;
}

export default function DialPad({ phoneNumber, onPhoneNumberChange, onDial }: DialPadProps) {
  const digits = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '' },
    { digit: '#', letters: '' },
  ];

  const handleDigitClick = (digit: string) => {
    onDial(digit);
    onPhoneNumberChange(phoneNumber + digit);
  };

  const handleClear = () => {
    onPhoneNumberChange('');
  };

  const handleBackspace = () => {
    onPhoneNumberChange(phoneNumber.slice(0, -1));
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-6">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="Enter phone number"
          className="w-full p-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={handleBackspace}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {digits.map(({ digit, letters }) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-500 transition-colors duration-200 flex flex-col items-center justify-center text-lg font-semibold"
          >
            <span className="text-xl">{digit}</span>
            {letters && <span className="text-xs text-gray-500">{letters}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}