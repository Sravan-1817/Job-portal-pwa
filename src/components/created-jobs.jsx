import { getMyJobs } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { useSession } from "@clerk/clerk-react";
import JobCard from "./job-card";
import { useEffect } from "react";

const CreatedJobs = () => {
  const { user } = useUser();
  const { session } = useSession();

  const {
    loading: loadingCreatedJobs,
    data: createdJobs,
    fn: fnCreatedJobs,
  } = useFetch(getMyJobs, {
    recruiter_id: user?.id,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) return;
      
      try {
        const supabaseAccessToken = await session.getToken({
          template: "supabase",
        });
        await fnCreatedJobs(supabaseAccessToken);
      } catch (error) {
        console.error("Error fetching created jobs:", error);
      }
    };

    fetchJobs();
  }, [user?.id, session, fnCreatedJobs]);

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {createdJobs && createdJobs.length > 0 ? (
          createdJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobAction={fnCreatedJobs}
              isMyJob
            />
          ))
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300 col-span-full text-xl mt-10 font-medium">
            No jobs found. Start posting now! 🚀
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedJobs;
