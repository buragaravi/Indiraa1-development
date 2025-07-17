import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUpload, 
  FiPackage, 
  FiGrid, 
  FiArrowRight,
  FiCheckCircle,
  FiImage,
  FiFile
} from 'react-icons/fi';

const BulkUploadHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bulk Product Upload System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload hundreds of products with images efficiently using our advanced CSV/Excel bulk upload system
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 text-center">
            <FiFile className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">CSV/Excel Support</h3>
            <p className="text-gray-600 text-sm">
              Upload products using CSV or Excel files with variant support
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 text-center">
            <FiImage className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Image Matching</h3>
            <p className="text-gray-600 text-sm">
              Automatically match images to products using filename patterns
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 text-center">
            <FiCheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Batch Processing</h3>
            <p className="text-gray-600 text-sm">
              Process hundreds of products with detailed success/failure reports
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Download Template",
                description: "Get our CSV template with sample data",
                icon: FiFile,
                color: "bg-blue-500"
              },
              {
                step: 2,
                title: "Prepare Data",
                description: "Fill in your product details and variants",
                icon: FiGrid,
                color: "bg-green-500"
              },
              {
                step: 3,
                title: "Upload Files",
                description: "Upload CSV and product images together",
                icon: FiUpload,
                color: "bg-purple-500"
              },
              {
                step: 4,
                title: "Process & Review",
                description: "Review results and handle any errors",
                icon: FiCheckCircle,
                color: "bg-orange-500"
              }
            ].map((step, index) => (
              <div key={step.step} className="text-center relative">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                
                {index < 3 && (
                  <FiArrowRight className="hidden md:block absolute top-8 -right-3 w-6 h-6 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link 
            to="/admin/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl font-semibold text-lg"
          >
            <FiUpload className="w-6 h-6" />
            Start Bulk Upload
            <FiArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-gray-600 mt-4">
            Ready to upload your products? Let's get started!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">CSV/Excel</p>
            <p className="text-sm text-gray-600">File Support</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">1000+</p>
            <p className="text-sm text-gray-600">Products per batch</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">Multi-Variant</p>
            <p className="text-sm text-gray-600">Product Support</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">S3</p>
            <p className="text-sm text-gray-600">Cloud Storage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadHome;
