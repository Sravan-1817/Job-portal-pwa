import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSession } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobs } from "@/api/apiJobs";
import { getApplications } from "@/api/apiApplications";
import useFetch from "@/hooks/use-fetch";
import { Navigate } from "react-router-dom";
import ApplicationCard from "@/components/application-card";
import { parseResume } from "@/utils/resumeParser";
import { updateApplicationStatus } from "@/api/apiApplications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import supabaseClient from "@/utils/supabase";

const RecruiterApplicantsPage = () => {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsingAll, setParsingAll] = useState(false);
  const [updatingSuggestedStatuses, setUpdatingSuggestedStatuses] = useState(false);
  const [parsingResults, setParsingResults] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingJobs(true);
        const supabaseAccessToken = await session.getToken({
          template: "supabase",
        });
        
        const supabase = await supabaseClient(supabaseAccessToken);
        const { data, error } = await supabase
          .from("jobs")
          .select("*, company:companies(name,logo_url), applications(*)")
          .eq("recruiter_id", user.id);

        if (error) {
          console.error("Error fetching jobs:", error);
          throw error;
        }

        console.log("Fetched jobs:", data);
        setJobs(data || []);
      } catch (error) {
        console.error("Error in fetchJobs:", error);
        showNotification('error', 'Failed to fetch jobs');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user?.id, session]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedJob) return;
      
      try {
        setLoadingApplications(true);
        const supabaseAccessToken = await session.getToken({
          template: "supabase",
        });
        
        const supabase = await supabaseClient(supabaseAccessToken);
        const { data, error } = await supabase
          .from("applications")
          .select("*, job:jobs(title, company:companies(name))")
          .eq("job_id", selectedJob);

        if (error) {
          console.error("Error fetching applications:", error);
          throw error;
        }

        console.log("Fetched applications:", data);
        setApplications(data || []);
      } catch (error) {
        console.error("Error in fetchApplications:", error);
        showNotification('error', 'Failed to fetch applications');
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [selectedJob, session]);

  const handleParseResume = async (application) => {
    try {
      setLoading(true);
      const selectedJobData = jobs?.find(job => job.id === selectedJob);
      if (!selectedJobData) {
        console.error('Job data not found');
        return;
      }

      const response = await fetch(application.resume);
      const resumeText = await response.text();
      
      const result = parseResume(resumeText, selectedJobData.requirements);
      
      setParsingResults(prev => ({
        ...prev,
        [application.id]: {
          ...result,
          showResults: true
        }
      }));

      showNotification('success', 'Resume parsed successfully!');
    } catch (error) {
      console.error('Error parsing resume:', error);
      showNotification('error', 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      setLoading(true);
      const application = applications?.find((app) => app.id === applicationId);

      if (!application) {
        console.error('Application not found');
        return;
      }

      if (!session?.token) {
        console.error('No session token available');
        return;
      }

      const response = await updateApplicationStatus(session.token, {
        job_id: selectedJob,
        candidate_id: application.candidate_id,
        status: status
      });

      if (response) {
        setSelectedStatus(prev => ({
          ...prev,
          [applicationId]: status
        }));

        // Refresh applications
        const supabaseAccessToken = await session.getToken({
          template: "supabase",
        });
        const supabase = await supabaseClient(supabaseAccessToken);
        const { data } = await supabase
          .from("applications")
          .select("*, job:jobs(title, company:companies(name))")
          .eq("job_id", selectedJob);
        
        setApplications(data || []);

        setParsingResults(prev => ({
          ...prev,
          [applicationId]: {
            ...prev[applicationId],
            showResults: false
          }
        }));

        showNotification('success', 'Status updated successfully!');
      } else {
        console.error('Failed to update status in database');
        showNotification('error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleParseAllResumes = async () => {
    if (!selectedJob) return;
    
    try {
      setParsingAll(true);
      const selectedJobData = jobs?.find(job => job.id === selectedJob);
      if (!selectedJobData) {
        console.error('Job data not found');
        return;
      }

      const newParsingResults = {};
      
      for (const application of applications) {
        try {
          const result = await parseResume(application.resume, selectedJobData.requirements);
          newParsingResults[application.id] = result;
        } catch (error) {
          console.error(`Error parsing resume for application ${application.id}:`, error);
        }
      }

      setParsingResults(newParsingResults);
    } catch (error) {
      console.error('Error parsing all resumes:', error);
    } finally {
      setParsingAll(false);
    }
  };

  const handleUpdateSuggestedStatuses = async () => {
    if (!selectedJob) return;
    
    try {
      setUpdatingSuggestedStatuses(true);
      const supabaseAccessToken = await session.getToken({
        template: "supabase",
      });
      
      const supabase = await supabaseClient(supabaseAccessToken);
      
      // Get applications that have been parsed
      const applicationsToUpdate = applications.filter(app => 
        parsingResults[app.id] && parsingResults[app.id].suggestedStatus
      );
      
      if (applicationsToUpdate.length === 0) {
        showNotification('info', 'No parsed applications with suggested statuses to update');
        return;
      }

      // Update each application with its suggested status
      for (const application of applicationsToUpdate) {
        const { error } = await supabase
          .from("applications")
          .update({ status: parsingResults[application.id].suggestedStatus })
          .eq("id", application.id);

        if (error) throw error;
      }

      // Refresh applications list
      const { data } = await supabase
        .from("applications")
        .select("*, job:jobs(title, company:companies(name))")
        .eq("job_id", selectedJob);

      setApplications(data || []);
      showNotification('success', `Updated ${applicationsToUpdate.length} applications with suggested statuses!`);
    } catch (error) {
      console.error('Error updating suggested statuses:', error);
      showNotification('error', 'Failed to update suggested statuses');
    } finally {
      setUpdatingSuggestedStatuses(false);
    }
  };

  const getFilteredApplications = (job) => {
    if (!job?.applications) return [];
    return job.applications.filter(app => app.status !== "applied");
  };

  // Show loading state while user data is being fetched
  if (!isLoaded || loadingJobs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  // Redirect non-recruiters to jobs page
  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6 py-10">
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant={notification.type === 'success' ? 'default' : 'destructive'}>
            <Info className="h-4 w-4" />
            <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Button
        onClick={() => navigate("/")}
        className="mb-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
      >
        Back
      </Button>

      <h1 className="text-center text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-6 animate-gradient">
        Job Applications
      </h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="col-span-1">
            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Your Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job) => (
                      <Button
                        key={job.id}
                        variant={selectedJob === job.id ? "default" : "outline"}
                        className={`w-full text-left ${
                          selectedJob === job.id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-700/50 hover:bg-gray-700"
                        }`}
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{job.title}</span>
                          <span className="text-sm bg-gray-600 px-2 py-1 rounded-full">
                            {job.applications?.length || 0} applicants
                          </span>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      No jobs posted yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <div className="col-span-2">
            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedJob ? (
                  loadingApplications ? (
                    <div className="flex justify-center">
                      <BarLoader width={"100%"} color="#36d7b7" />
                    </div>
                  ) : applications && applications.length > 0 ? (
                    <>
                      <div className="flex gap-4 mb-6">
                        <Button
                          onClick={handleParseAllResumes}
                          disabled={parsingAll || loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {parsingAll ? (
                            <div className="flex items-center gap-2">
                              <BarLoader width={20} height={20} color="#ffffff" />
                              Parsing All Resumes...
                            </div>
                          ) : (
                            "Parse All Resumes"
                          )}
                        </Button>
                        <Button
                          onClick={handleUpdateSuggestedStatuses}
                          disabled={updatingSuggestedStatuses || loading}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {updatingSuggestedStatuses ? (
                            <div className="flex items-center gap-2">
                              <BarLoader width={20} height={20} color="#ffffff" />
                              Updating Suggested Statuses...
                            </div>
                          ) : (
                            "Update Suggested Statuses"
                          )}
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div key={application.id}>
                            <ApplicationCard
                              application={application}
                              isCandidate={false}
                              parsingResults={parsingResults}
                              selectedStatus={selectedStatus[application.id]}
                              onStatusChange={(status) => handleUpdateStatus(application.id, status)}
                              onParseResume={() => handleParseResume(application)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No applications for this job
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Select a job to view applications
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicantsPage;