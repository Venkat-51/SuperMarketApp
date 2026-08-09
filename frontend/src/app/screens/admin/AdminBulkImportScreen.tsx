import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Download, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { adminApi } from '../../../lib/api';

export default function AdminBulkImportScreen() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ importedCount: number; errorCount: number; errors: string[] } | null>(null);
  const [parseError, setParseError] = useState('');

  // Sample CSV template content
  const sampleCsvContent = `productName,category,brand,sku,price,discount,stockQuantity,unit,weight,description,imageUrl,featured,active
Aashirvaad Svasti Pure Cow Ghee,Staples,Aashirvaad,ASH-GHEE-500,320,7,50,500ml,500ml,Pure fresh ghee,https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80,true,true
Fortune Premium Kachi Ghani,Staples,Fortune,FORT-OIL-1L,180,10,100,1L,1L,Cold pressed mustard oil,https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80,false,true`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'supermarket_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setParseError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

        if (lines.length <= 1) {
          setParseError('The uploaded CSV file is empty or missing headers.');
          setParsedRows([]);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 2) continue;

          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] ?? '';
          });

          rows.push({
            productName: rowObj.productName || rowObj.name || '',
            category: rowObj.category || 'Staples',
            brand: rowObj.brand || '',
            sku: rowObj.sku || '',
            price: Number(rowObj.price) || 0,
            mrp: Number(rowObj.mrp) || (Number(rowObj.price) || 0) + (Number(rowObj.discount) || 0),
            stockQuantity: Number(rowObj.stockQuantity || rowObj.stock) || 50,
            unit: rowObj.unit || 'unit',
            weight: rowObj.weight || '1 unit',
            description: rowObj.description || '',
            imageUrl: rowObj.imageUrl || '',
            isFeatured: rowObj.featured === 'true' || rowObj.isFeatured === 'true',
            isActive: rowObj.active !== 'false' && rowObj.isActive !== 'false',
          });
        }

        setParsedRows(rows);
      } catch (err) {
        setParseError('Failed to parse CSV file structure.');
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    const res = await adminApi.bulkImport(parsedRows);
    setIsProcessing(false);

    if (res.data) {
      setImportResult(res.data);
    } else if (res.error) {
      setParseError(res.error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bulk CSV Product Import</h1>
          <p className="text-xs text-gray-500 mt-1">Upload CSV datasets to insert or update multiple catalog products</p>
        </div>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="h-10 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>Download Sample CSV</span>
        </Button>
      </div>

      {/* Upload Box */}
      <Card className="p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center hover:border-orange-400 transition-colors">
        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-base text-gray-900">Upload your product CSV file</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">Drag and drop your file here, or browse from your computer</p>

        <label className="mt-4 inline-block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
            <FileText className="w-4 h-4" />
            <span>Select CSV File</span>
          </span>
        </label>

        {file && (
          <p className="mt-3 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
            Selected: {file.name} ({parsedRows.length} rows detected)
          </p>
        )}
      </Card>

      {parseError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
          ⚠️ {parseError}
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && !importResult && (
        <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900">Preview Imported Dataset ({parsedRows.length} items)</h3>
            <Button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="h-10 px-6 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md"
            >
              {isProcessing ? 'Processing Import...' : 'Confirm & Commit Import'}
            </Button>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs text-gray-600">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-bold text-gray-900 truncate max-w-xs">{row.productName}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{row.sku || 'Auto-generated'}</td>
                    <td className="py-2 px-3">{row.category}</td>
                    <td className="py-2 px-3 font-bold">₹{row.price}</td>
                    <td className="py-2 px-3">{row.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Result Summary */}
      {importResult && (
        <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4 shadow-xs">
          <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Import Process Finished!</p>
              <p className="text-xs">Successfully inserted {importResult.importedCount} new products into database.</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-600">Validation Errors / Skipped Rows ({importResult.errorCount}):</p>
              <ul className="max-h-48 overflow-y-auto space-y-1 p-3 bg-red-50 rounded-xl text-xs text-red-700 font-medium">
                {importResult.errors.map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button onClick={() => navigate('/admin/products')} className="h-10 px-6 rounded-xl font-bold bg-orange-500 text-white">
              View Product List →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
