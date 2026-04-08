import { useState } from 'react';
import { importToolsToFirestore } from '../scripts/importTools';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportToolsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleImport = async () => {
    if (!confirm('This will import 50 tools to Firestore. Continue?')) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const importResult = await importToolsToFirestore();
      
      if (importResult.success) {
        setResult({
          success: true,
          message: `Successfully imported ${importResult.count} tools!`
        });
      } else {
        setResult({
          success: false,
          message: `Imported ${importResult.count} tools with ${importResult.errors.length} errors. Check console for details.`
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Import failed: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleImport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Importing...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Import Tools to Firestore</span>
          </>
        )}
      </button>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>This will import:</p>
        <ul className="list-disc list-inside mt-1 ml-2">
          <li>20 IT Equipment items (laptops, monitors, printers, etc.)</li>
          <li>30 Carpentry Tools (hammers, saws, drills, etc.)</li>
        </ul>
      </div>
    </div>
  );
}
