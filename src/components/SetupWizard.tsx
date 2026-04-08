import { useState } from 'react';
import { initializeDatabase } from '../scripts/initDatabase';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function SetupWizard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setResult(null);
    try {
      const initResult = await initializeDatabase();
      setResult(initResult);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="MNDF Toolkit Pro" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Database Setup</h1>
          <p className="text-gray-500 mt-2">Initialize your Super Admin account</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">This will create:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Super Admin user in Authentication</li>
            <li>• User document in Firestore with full permissions</li>
            <li>• Email: faix@mndftoolpro.com</li>
            <li>• Password: Faix@123</li>
          </ul>
        </div>

        <button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing...
            </>
          ) : (
            'Initialize Database'
          )}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {result.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <p className="font-medium">{result.success ? 'Success!' : 'Error'}</p>
              <p className="text-sm mt-1">{result.message}</p>
              {result.success && (
                <p className="text-sm mt-2">You can now <a href="/" className="underline font-semibold">login here</a></p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
