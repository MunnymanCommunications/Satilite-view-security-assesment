import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative my-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline whitespace-pre-wrap">{message}</span>
    </div>
  );
};

export default ErrorMessage;