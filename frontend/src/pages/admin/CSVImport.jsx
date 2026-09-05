import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { medicineService } from '../../services/medicineService';
import { useToast } from '../../context/ToastContext';

const SAMPLE_CSV = `name,generic_name,composition,strength,dosage_form,manufacturer,price,stock_quantity,expiry_date,prescription_required,disease_category,description,image_url
Dolo 650,Paracetamol,Paracetamol,650mg,Tablet,Micro Labs Ltd,31.00,180,2028-12-31,False,Fever & Pain,"Antipyretic and analgesic tablet.",https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400
Parafast 650,Paracetamol,Paracetamol,650mg,Tablet,Cipla Ltd,14.00,300,2028-05-30,False,Fever & Pain,"Jan Aushadhi equivalent paracetamol 650mg.",https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400
Augmentin 625 Duo,Amoxicillin and Potassium Clavulanate,Amoxicillin (500mg) + Clavulanic Acid (125mg),625mg,Tablet,GSK India,225.00,75,2027-06-30,True,Antibiotics,"Broad spectrum antibacterial tablet.",https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400
Moxikind-CV 625,Amoxicillin and Potassium Clavulanate,Amoxicillin (500mg) + Clavulanic Acid (125mg),625mg,Tablet,Mankind Pharma,130.00,140,2028-09-20,True,Antibiotics,"Affordable bioequivalent alternative.",https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400`;

export default function CSVImport() {
  const { success, error } = useToast();

  const [file, setFile] = useState(null);
  const [rawCsv, setRawCsv] = useState(SAMPLE_CSV);
  const [importMode, setImportMode] = useState('raw'); // 'file' or 'raw'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_medicines_import.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    success('Sample CSV template downloaded.');
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (importMode === 'file') {
        if (!file) {
          error('Please select a CSV file to upload.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        res = await medicineService.importCSV(formData);
      } else {
        if (!rawCsv.trim()) {
          error('Please enter CSV data.');
          setLoading(false);
          return;
        }
        res = await medicineService.importCSVRaw(rawCsv);
      }

      setResult(res);
      success(res.message || 'CSV Import executed successfully!');
    } catch (err) {
      console.error('Import failed:', err);
      const resData = err.response?.data;
      if (resData && resData.errors) {
        setResult(resData);
      }
      error(resData?.error || 'CSV Import encountered validation errors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Bulk CSV Medicine Importer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Batch populate or update medicine catalogues with automatic schema validation and error reporting.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setImportMode('raw')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            importMode === 'raw'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Direct CSV Text Editor
        </button>
        <button
          type="button"
          onClick={() => setImportMode('file')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            importMode === 'file'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Upload .CSV File
        </button>
      </div>

      {/* Import Form */}
      <form onSubmit={handleImport} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
        
        {importMode === 'file' ? (
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3">
            <Upload className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <label className="font-bold text-emerald-600 cursor-pointer hover:underline">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>{' '}
              or drag & drop your medicine inventory CSV file here
            </div>
            {file && (
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 py-1 px-3 rounded-lg inline-block">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Paste / Edit CSV Payload:
              </span>
              <span className="text-slate-400">Header row required</span>
            </div>
            <textarea
              rows={10}
              value={rawCsv}
              onChange={(e) => setRawCsv(e.target.value)}
              className="w-full p-4 font-mono text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md transition flex items-center justify-center gap-2 ${
            loading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{loading ? 'Processing Import...' : 'Run Bulk Import'}</span>
        </button>

      </form>

      {/* Import Results Card */}
      {result && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Import Execution Summary
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {result.created_count || 0}
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">New Records Created</div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
              <div className="text-xl font-black text-sky-600 dark:text-sky-400">
                {result.updated_count || 0}
              </div>
              <div className="text-[11px] text-sky-800 dark:text-sky-300 font-semibold">Existing Records Updated</div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                {result.errors?.length || 0}
              </div>
              <div className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold">Validation Errors</div>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4" />
                <span>Error Log:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-800 dark:text-rose-200 space-y-1">
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
