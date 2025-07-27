import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  FiUpload,
  FiFile,
  FiImage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiTrash2,
  FiLoader,
  FiPackage,
  FiGrid,
  FiCalendar,
  FiUser,
  FiSettings
} from 'react-icons/fi';

const BulkUpload = ({ onSuccess, onClose }) => {
  // State management
  const [csvFile, setCsvFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [imageMatching, setImageMatching] = useState({});

  // New batch configuration state
  const [batchConfig, setBatchConfig] = useState({
    sameDatesForAll: false,
    differentSuppliers: false,
    globalDates: {
      manufacturingDate: '',
      expiryDate: '',
      bestBeforeDate: ''
    },
    globalSupplier: {
      supplierName: 'Indiraa Foods Pvt Ltd',
      contactInfo: 'info@indiraafoods.com'
    }
  });

  // Refs
  const csvInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Sample CSV structure for download
  const generateSampleCSV = () => {
    const baseSampleData = [
      {
        name: 'Apple Juice',
        description: 'Fresh organic apple juice with natural sweetness',
        category: 'Beverages',
        price: 299.99,
        originalPrice: 399.99,
        stock: 100,
        hasVariants: true,
        'variant1_name': '500ml',
        'variant1_label': '500ml Bottle',
        'variant1_price': 299.99,
        'variant1_originalPrice': 399.99,
        'variant1_stock': 50,
        'variant1_isDefault': true,
        'variant2_name': '1L',
        'variant2_label': '1 Litre Bottle',
        'variant2_price': 499.99,
        'variant2_originalPrice': 599.99,
        'variant2_stock': 30,
        'variant2_isDefault': false
      },
      {
        name: 'Mango Smoothie',
        description: 'Creamy mango smoothie with real fruit pulp',
        category: 'Beverages',
        price: 199.99,
        originalPrice: 249.99,
        stock: 75,
        hasVariants: false
      }
    ];

    // Add batch fields based on configuration
    const sampleData = baseSampleData.map(product => {
      const productWithBatch = { ...product };

      // Add date fields if needed
      if (!batchConfig.sameDatesForAll) {
        productWithBatch.manufacturingDate = '2024-07-18';
        productWithBatch.expiryDate = '2025-06-18';
        productWithBatch.bestBeforeDate = '2025-05-18';
        
        // Add variant-specific dates for products with variants
        if (product.hasVariants) {
          productWithBatch['manufacturingDate_500ml'] = '2024-07-18';
          productWithBatch['expiryDate_500ml'] = '2025-06-18';
          productWithBatch['manufacturingDate_1L'] = '2024-07-20';
          productWithBatch['expiryDate_1L'] = '2025-06-20';
        }
      }

      // Add supplier fields if needed
      if (batchConfig.differentSuppliers) {
        productWithBatch.supplierName = product.name.includes('Apple') ? 'Fresh Fruits Ltd' : 'Tropical Suppliers';
        productWithBatch.supplierContact = product.name.includes('Apple') ? 'supplier@freshfruits.com' : 'contact@tropical.com';
      }

      // Always include location and other optional batch fields
      productWithBatch.location = product.name.includes('Apple') ? 'Warehouse A' : 'Warehouse B';
      
      return productWithBatch;
    });

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_upload_sample_${batchConfig.sameDatesForAll ? 'global_dates' : 'product_dates'}_${batchConfig.differentSuppliers ? 'diff_suppliers' : 'same_supplier'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV/Excel file
  const handleFileUpload = (file) => {
    setCsvFile(file);
    setErrors([]);

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setErrors(results.errors.map(err => err.message));
            return;
          }
          processRawData(results.data);
        },
        error: (error) => {
          setErrors([`CSV parsing error: ${error.message}`]);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processRawData(jsonData);
        } catch (error) {
          setErrors([`Excel parsing error: ${error.message}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors(['Please upload a CSV or Excel (.xlsx/.xls) file']);
    }
  };

  // Process raw data and convert to product format
  const processRawData = (rawData) => {
    const processed = [];
    const processingErrors = [];

    rawData.forEach((row, index) => {
      try {
        // Basic validation
        if (!row.name || !row.description || !row.category || !row.price) {
          processingErrors.push(`Row ${index + 1}: Missing required fields (name, description, category, price)`);
          return;
        }

        // Process variants
        const variants = [];
        let variantIndex = 1;
        
        while (row[`variant${variantIndex}_name`]) {
          const variant = {
            name: row[`variant${variantIndex}_name`],
            label: row[`variant${variantIndex}_label`] || row[`variant${variantIndex}_name`],
            price: parseFloat(row[`variant${variantIndex}_price`]) || parseFloat(row.price),
            originalPrice: row[`variant${variantIndex}_originalPrice`] ? parseFloat(row[`variant${variantIndex}_originalPrice`]) : null,
            stock: parseInt(row[`variant${variantIndex}_stock`]) || 0,
            isDefault: row[`variant${variantIndex}_isDefault`] === 'true' || row[`variant${variantIndex}_isDefault`] === true,
            id: `${Date.now()}_${variantIndex}_${Math.random().toString(36).substr(2, 9)}`
          };
          variants.push(variant);
          variantIndex++;
        }

        // Ensure at least one default variant if variants exist
        if (variants.length > 0 && !variants.some(v => v.isDefault)) {
          const cheapestVariant = variants.reduce((min, current) => 
            current.price < min.price ? current : min
          );
          cheapestVariant.isDefault = true;
        }

        const product = {
          name: row.name.trim(),
          description: row.description.trim(),
          category: row.category.trim(),
          price: parseFloat(row.price),
          originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
          stock: parseInt(row.stock) || 0,
          hasVariants: (row.hasVariants === 'true' || row.hasVariants === true) && variants.length > 0,
          variants: variants,
          
          // Process batch data with configuration-based defaults
          manufacturingDate: row.manufacturingDate || (batchConfig.sameDatesForAll ? batchConfig.globalDates.manufacturingDate : null),
          expiryDate: row.expiryDate || (batchConfig.sameDatesForAll ? batchConfig.globalDates.expiryDate : null),
          bestBeforeDate: row.bestBeforeDate || (batchConfig.sameDatesForAll ? batchConfig.globalDates.bestBeforeDate : null),
          
          // Supplier information
          supplierName: row.supplierName || (!batchConfig.differentSuppliers ? batchConfig.globalSupplier.name : null),
          supplierContact: row.supplierContact || row.contactInfo || (!batchConfig.differentSuppliers ? batchConfig.globalSupplier.contactInfo : null),
          
          // Optional batch fields
          location: row.location || 'Main Warehouse',
          qualityChecked: row.qualityChecked === 'true' || row.qualityChecked === true,
          qualityNotes: row.qualityNotes || '',
          
          // Add variant-specific batch dates
          ...Object.keys(row).reduce((acc, key) => {
            if (key.startsWith('manufacturingDate_') || key.startsWith('expiryDate_') || key.startsWith('bestBeforeDate_')) {
              acc[key] = row[key];
            }
            return acc;
          }, {})
        };

        processed.push(product);
      } catch (error) {
        processingErrors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    if (processingErrors.length > 0) {
      setErrors(processingErrors);
    }

    setParsedData(processed);
    setPreviewData(processed.slice(0, 5)); // Show first 5 for preview
    if (processed.length > 0) {
      setStep(2);
    }
  };

  // Handle image files upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Match images to products
    matchImagesToProducts(parsedData, [...imageFiles, ...newFiles]);
  };

  // Match images to products based on filename
  const matchImagesToProducts = (products, images) => {
    const matching = {};
    
    products.forEach(product => {
      const productMatches = images.filter(file => 
        file.name.toLowerCase().includes(product.name.toLowerCase().replace(/\s+/g, '_')) ||
        file.name.toLowerCase().includes(product.name.toLowerCase().replace(/\s+/g, ''))
      );
      
      matching[product.name] = {
        productImages: productMatches,
        variants: {}
      };

      // Match variant-specific images
      if (product.hasVariants && product.variants) {
        product.variants.forEach(variant => {
          const variantMatches = images.filter(file => {
            const filename = file.name.toLowerCase();
            const productName = product.name.toLowerCase().replace(/\s+/g, '_');
            const variantName = variant.name.toLowerCase().replace(/\s+/g, '_');
            
            return (filename.includes(productName) && filename.includes(variantName)) ||
                   (filename.includes(product.name.toLowerCase()) && filename.includes(variant.name.toLowerCase()));
          });
          
          matching[product.name].variants[variant.name] = variantMatches;
        });
      }
    });
    
    setImageMatching(matching);
  };

  // Remove image
  const removeImage = (indexToRemove) => {
    const newImageFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    setImageFiles(newImageFiles);
    matchImagesToProducts(parsedData, newImageFiles);
  };

  // Remove CSV file and reset
  const removeCsvFile = () => {
    setCsvFile(null);
    setParsedData([]);
    setPreviewData([]);
    setStep(0);
    setErrors([]);
  };

  // Process bulk upload
  const processBulkUpload = async () => {
    if (!csvFile || parsedData.length === 0) {
      setErrors(['Please upload and preview CSV file first']);
      return;
    }

    setUploading(true);
    setUploadResults(null);
    setStep(3);

    try {
      const formData = new FormData();
      
      // Add parsed products data
      formData.append('products', JSON.stringify(parsedData));
      
      // Add batch configuration
      formData.append('batchConfig', JSON.stringify(batchConfig));
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors(['Authentication token not found. Please login again.']);
        setStep(2);
        return;
      }

      const response = await fetch('http://localhost:5001/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResults(result.results);
        setStep(4);
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Give user time to see the results
        }
      } else {
        setErrors([result.message || 'Upload failed']);
        setStep(2);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setErrors([`Upload failed: ${error.message}`]);
      setStep(2);
    } finally {
      setUploading(false);
    }
  };

  // Reset all states
  const resetUpload = () => {
    setCsvFile(null);
    setImageFiles([]);
    setParsedData([]);
    setPreviewData([]);
    setUploadResults(null);
    setStep(0);
    setErrors([]);
    setImageMatching({});
    
    // Call onClose callback if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200">
              <FiPackage className="text-white text-sm sm:text-base lg:text-lg" />
            </div>
            Bulk Product Upload
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Upload multiple products with images using CSV/Excel files</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-emerald-100/50 border border-white/50 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full"></div>
            <div 
              className="absolute top-6 left-6 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((step / 4) * 100, 100)}%` }}
            />
            
            {[
              { number: 0, label: 'Batch Config', icon: FiGrid },
              { number: 1, label: 'Upload Files', icon: FiUpload },
              { number: 2, label: 'Preview Data', icon: FiEye },
              { number: 3, label: 'Processing', icon: FiLoader },
              { number: 4, label: 'Results', icon: FiCheckCircle }
            ].map((stepItem, index) => (
              <div
                key={stepItem.number}
                className={`relative z-10 flex flex-col items-center ${
                  step >= stepItem.number ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step >= stepItem.number 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{stepItem.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Errors Found:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 0: Batch Configuration */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full mb-4">
                <FiGrid className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Batch Configuration</h2>
              <p className="text-gray-600">Configure batch tracking settings for your products</p>
              <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your configuration will affect the CSV template structure. 
                  Download the sample CSV after configuring to get the correct format.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Manufacturing & Expiry Dates Configuration */}
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-200/50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2 text-blue-600" />
                  Manufacturing & Expiry Dates
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="dateConfig"
                      checked={batchConfig.sameDatesForAll}
                      onChange={() => setBatchConfig(prev => ({
                        ...prev,
                        sameDatesForAll: true
                      }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Same dates for all products</span>
                  </label>
                  
                  {batchConfig.sameDatesForAll && (
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manufacturing Date
                        </label>
                        <input
                          type="date"
                          value={batchConfig.globalDates.manufacturing}
                          onChange={(e) => setBatchConfig(prev => ({
                            ...prev,
                            globalDates: {
                              ...prev.globalDates,
                              manufacturing: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={batchConfig.globalDates.expiry}
                          onChange={(e) => setBatchConfig(prev => ({
                            ...prev,
                            globalDates: {
                              ...prev.globalDates,
                              expiry: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="dateConfig"
                      checked={!batchConfig.sameDatesForAll}
                      onChange={() => setBatchConfig(prev => ({
                        ...prev,
                        sameDatesForAll: false
                      }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Different dates per product (specify in CSV)</span>
                  </label>
                </div>
              </div>

              {/* Supplier Configuration */}
              <div className="p-6 bg-green-50/50 rounded-2xl border border-green-200/50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUser className="w-5 h-5 mr-2 text-green-600" />
                  Supplier Information
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="supplierConfig"
                      checked={!batchConfig.differentSuppliers}
                      onChange={() => setBatchConfig(prev => ({
                        ...prev,
                        differentSuppliers: false
                      }))}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Same supplier for all products</span>
                  </label>
                  
                  {!batchConfig.differentSuppliers && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        value={batchConfig.globalSupplier.name}
                        onChange={(e) => setBatchConfig(prev => ({
                          ...prev,
                          globalSupplier: {
                            ...prev.globalSupplier,
                            name: e.target.value
                          }
                        }))}
                        placeholder="Enter supplier name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  )}
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="supplierConfig"
                      checked={batchConfig.differentSuppliers}
                      onChange={() => setBatchConfig(prev => ({
                        ...prev,
                        differentSuppliers: true
                      }))}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Different suppliers per product (specify in CSV)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={generateSampleCSV}
                    className="px-6 py-3 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download Sample CSV
                  </button>
                  <button
                    onClick={() => {
                      // Validate configuration before proceeding
                      const errors = [];
                      if (batchConfig.sameDatesForAll) {
                        if (!batchConfig.globalDates.manufacturing) {
                          errors.push('Manufacturing date is required');
                        }
                        if (!batchConfig.globalDates.expiry) {
                          errors.push('Expiry date is required');
                        }
                      }
                      if (!batchConfig.differentSuppliers && !batchConfig.globalSupplier.name.trim()) {
                        errors.push('Supplier name is required');
                      }
                      
                      if (errors.length > 0) {
                        setErrors(errors);
                        return;
                      }
                      
                      setErrors([]);
                      setStep(1);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Continue to Upload
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: File Upload */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Sample CSV Download */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FiDownload className="w-6 h-6 text-blue-600" />
                Download Sample CSV
              </h3>
              <p className="text-gray-600 mb-4">
                Download our sample CSV file to understand the required format for bulk upload.
              </p>
              <button
                onClick={generateSampleCSV}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download Sample CSV
              </button>
            </div>

            {/* CSV/Excel Upload */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FiFile className="w-6 h-6 text-blue-600" />
                Upload Product Data
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => csvInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  if (files[0]) handleFileUpload(files[0]);
                }}
              >
                <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload CSV or Excel File</h4>
                <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
                <p className="text-sm text-gray-400">Supported formats: .csv, .xlsx, .xls</p>
                
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files[0]) handleFileUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </div>

              {csvFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{csvFile.name}</p>
                      <p className="text-sm text-green-600">{parsedData.length} products found</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCsvFile}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FiImage className="w-6 h-6 text-blue-600" />
                Upload Product Images
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleImageUpload(files);
                }}
              >
                <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload Product Images</h4>
                <p className="text-gray-500 mb-4">Drag and drop your images here, or click to browse</p>
                <p className="text-sm text-gray-400">Supported formats: .jpg, .jpeg, .png, .webp</p>
                
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files.length > 0) handleImageUpload(e.target.files);
                  }}
                  className="hidden"
                />
              </div>

              {/* Image Preview */}
              {imageFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Selected Images ({imageFiles.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Naming Guide */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">📝 Image Naming Guide</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• <strong>ProductName_VariantName_1.jpg</strong> - Variant-specific image</p>
                  <p>• <strong>ProductName_main.jpg</strong> - Main product image</p>
                  <p>• <strong>ProductName.jpg</strong> - Simple product image</p>
                  <p className="text-blue-600 mt-2">
                    💡 Images will be automatically matched to products based on filename
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Preview Data */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Data Preview */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <FiEye className="w-6 h-6 text-blue-600" />
                  Data Preview ({parsedData.length} products)
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Upload
                  </button>
                  <button
                    onClick={processBulkUpload}
                    disabled={uploading || parsedData.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Process Upload
                  </button>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Product</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Category</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Price</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Stock</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Variants</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-semibold">₹{product.price}</p>
                            {product.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{product.stock}</span>
                        </td>
                        <td className="p-3">
                          {product.hasVariants && product.variants.length > 0 ? (
                            <div className="space-y-1">
                              {product.variants.slice(0, 2).map((variant, vIndex) => (
                                <div key={vIndex} className="text-sm">
                                  <span className="font-medium">{variant.label}</span>
                                  <span className="text-gray-600 ml-2">₹{variant.price}</span>
                                  {variant.isDefault && (
                                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                              ))}
                              {product.variants.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{product.variants.length - 2} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No variants</span>
                          )}
                        </td>
                        <td className="p-3">
                          {imageMatching[product.name] ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium text-green-600">
                                  {imageMatching[product.name].productImages.length}
                                </span>
                                <span className="text-gray-600 ml-1">main images</span>
                              </div>
                              {Object.keys(imageMatching[product.name].variants).map(variant => (
                                <div key={variant} className="text-xs text-gray-600">
                                  {variant}: {imageMatching[product.name].variants[variant].length} images
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No images matched</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedData.length > 5 && (
                <div className="mt-4 text-center text-gray-600">
                  Showing first 5 products. {parsedData.length - 5} more products will be processed.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Processing Your Upload</h3>
              <p className="text-gray-600 mb-4">
                We're creating {parsedData.length} products and uploading {imageFiles.length} images...
              </p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 4 && uploadResults && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <FiCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-green-800">{uploadResults.summary.created}</p>
                <p className="text-green-600">Products Created</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <FiXCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-red-800">{uploadResults.summary.failed}</p>
                <p className="text-red-600">Failed</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <FiImage className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-blue-800">{uploadResults.summary.imagesUploaded}</p>
                <p className="text-blue-600">Images Uploaded</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
                <FiGrid className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-purple-800">{uploadResults.summary.totalProducts}</p>
                <p className="text-purple-600">Total Processed</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upload Results</h3>
                <button
                  onClick={resetUpload}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  Upload More Products
                </button>
              </div>

              {/* Successful Products */}
              {uploadResults.successful.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5" />
                    Successfully Created ({uploadResults.successful.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadResults.successful.map((product, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-green-800">{product.name}</p>
                            <p className="text-sm text-green-600">
                              ID: {product.id} | {product.imagesUploaded} images | {product.variantsCreated} variants
                            </p>
                          </div>
                          <FiCheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Products */}
              {uploadResults.failed.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <FiXCircle className="w-5 h-5" />
                    Failed to Create ({uploadResults.failed.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadResults.failed.map((product, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-red-800">{product.name}</p>
                            <p className="text-sm text-red-600">{product.error}</p>
                          </div>
                          <FiXCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
