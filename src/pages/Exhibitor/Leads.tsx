import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import leadApi, { type Lead } from '../../api/lead.api';
import { eventAPI } from '../../api/event.api';

const ExhibitorLeads = () => {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [stalls, setStalls] = useState<any[]>([]);
  const [selectedStall, setSelectedStall] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const leadsPerPage = 10;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.getAll();
        if (response.success) {
          // Handle nested response structure
          const eventsData = response.data.events || response.data || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);

          // After events are loaded, check URL parameters and set filters
          const eventIdFromUrl = searchParams.get('eventId');
          const licenseKeyFromUrl = searchParams.get('licenseKey');

          if (eventIdFromUrl) {
            setSelectedEventId(eventIdFromUrl);
          }

          if (licenseKeyFromUrl) {
            setSelectedStall(licenseKeyFromUrl);
          }
        }
      } catch (err: any) {
        console.error('Failed to load events:', err);
      }
    };

    fetchEvents();
  }, [searchParams]);

  // Fetch stalls when event is selected
  useEffect(() => {
    const fetchStalls = async () => {
      if (!selectedEventId) {
        setStalls([]);
        setSelectedStall('');
        return;
      }

      try {
        const response = await eventAPI.getLicenseKeys(selectedEventId);
        if (response.success) {
          const licenseKeys = response.data.licenseKeys || [];
          setStalls(licenseKeys);
        }
      } catch (err: any) {
        console.error('Failed to load stalls:', err);
      }
    };

    fetchStalls();
  }, [selectedEventId]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEventId, selectedStall, debouncedSearch, filterRating]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const params: any = {
          page: currentPage,
          limit: leadsPerPage,
        };
        if (selectedEventId) {
          params.eventId = selectedEventId;
        }
        if (selectedStall) {
          params.licenseKey = selectedStall;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (filterRating) {
          params.rating = filterRating;
        }

        const response = await leadApi.getAll(params);
        // leadApi.getAll returns { leads: Lead[], pagination: any }
        setLeads(Array.isArray(response.leads) ? response.leads : []);

        // Update pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalLeads(response.pagination.total || 0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load leads');
        console.error('Failed to load leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [currentPage, selectedEventId, selectedStall, debouncedSearch, filterRating, leadsPerPage]);

  // Export functions
  const handleExportAllData = async () => {
    try {
      setExportLoading(true);
      await leadApi.exportLeads({
        type: 'all',
        eventId: selectedEventId || undefined,
        licenseKey: selectedStall || undefined,
        search: debouncedSearch || undefined,
        rating: filterRating,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export leads data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportEntryOnly = async () => {
    try {
      setExportLoading(true);
      await leadApi.exportLeads({
        type: 'entryOnly',
        eventId: selectedEventId || undefined,
        licenseKey: selectedStall || undefined,
        search: debouncedSearch || undefined,
        rating: filterRating,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      setError('Failed to export entry codes');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-1">View and manage all captured leads</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="sm"
              onClick={handleExportAllData}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export with All Data'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 text-white"
              onClick={handleExportEntryOnly}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export Entry Key Only'}
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Captured Leads</CardTitle>
            <CardDescription>All leads captured across your events</CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none"
              />
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedStall(''); // Reset stall when event changes
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
              {selectedEventId && stalls.length > 0 && (
                <select
                  value={selectedStall}
                  onChange={(e) => setSelectedStall(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none"
                >
                  <option value="">All Stalls</option>
                  {stalls.map((stall) => (
                    <option key={stall.key} value={stall.key}>
                      {stall.stallName || stall.key}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#854AE6] focus:border-transparent outline-none"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found. Start capturing leads from your events.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Entry Code</th>
                      {/* <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Event</th> */}
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Captured</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {lead.details?.firstName || lead.details?.lastName 
                            ? `${lead.details?.firstName || ''} ${lead.details?.lastName || ''}`.trim()
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {lead.details?.company || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.details?.email || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.details?.phoneNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.entryCode ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4ECFF] text-[#5E2AB2] border border-[#E3D4FF] font-mono">
                              {lead.entryCode}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        {/* <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.eventId && typeof lead.eventId === 'object' 
                            ? lead.eventId.eventName 
                            : lead.isIndependentLead 
                            ? 'Independent' 
                            : '-'}
                        </td> */}
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {lead.rating ? (
                            <span className="inline-flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < lead.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && leads.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((currentPage - 1) * leadsPerPage) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(currentPage * leadsPerPage, totalLeads)}</span> of{' '}
                  <span className="font-semibold">{totalLeads}</span> leads
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 min-w-[40px] ${
                            currentPage === pageNum
                              ? 'bg-[#854AE6] hover:bg-[#6F33C5] text-white'
                              : ''
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5"
                  >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExhibitorLeads;
