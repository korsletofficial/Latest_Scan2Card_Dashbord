import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import teamManagerAPI, { type LicenseKey } from '../../api/teamManager.api';

const LicenseKeys = () => {
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchLicenseKeys();
  }, [page, search]);

  const fetchLicenseKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await teamManagerAPI.getAllLicenseKeys(page, limit, search);
      setLicenseKeys(data.licenseKeys);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load license keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusColor = (key: LicenseKey) => {
    const now = new Date();
    const expiresAt = new Date(key.expiresAt);
    const isExpired = expiresAt < now;
    const isFull = key.usedCount >= key.maxActivations;

    if (isExpired) return 'text-red-600';
    if (isFull) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusText = (key: LicenseKey) => {
    const now = new Date();
    const expiresAt = new Date(key.expiresAt);
    const isExpired = expiresAt < now;
    const isFull = key.usedCount >= key.maxActivations;

    if (isExpired) return 'Expired';
    if (isFull) return 'Full';
    return 'Active';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Keys</h1>
          <p className="text-gray-600 mt-1">Manage all your license keys across events</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search by key, email, stall name, or event..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none"
                />
              </div>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">{total}</span> license keys
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Keys List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : licenseKeys.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No license keys found</h3>
              <p className="text-gray-600">
                {search ? 'Try adjusting your search criteria' : 'No license keys have been assigned yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {licenseKeys.map((key, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Key Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                          {key.key}
                        </div>
                        <span className={`text-sm font-semibold ${getStatusColor(key)}`}>
                          {getStatusText(key)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {key.email}
                        </div>
                        {key.stallName && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {key.stallName}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {key.eventName}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Usage Stats */}
                    <div className="flex items-center gap-6 lg:border-l lg:pl-6 border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#854AE6]">
                          {key.usedCount} / {key.maxActivations}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Activations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {key.leadCount}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Date(key.expiresAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Expires</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      page === pageNum
                        ? 'bg-[#854AE6] text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LicenseKeys;
